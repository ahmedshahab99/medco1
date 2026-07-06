"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getDayOfWeekKey } from "@/lib/date-utils";
import { splitName } from "@/lib/patient-utils";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";
import {
  setOtp,
  getOtpRecord,
  verifyOtp,
  deleteOtp,
  setResendCooldown,
  getResendCooldownRemaining,
  storePendingBooking,
  readPendingBooking,
  deletePendingBooking,
  maskPhone,
  DEFAULT_RESEND_COOLDOWN_SEC,
  type PendingBooking,
} from "@/lib/otp";
import {
  OTP_RATE_LIMIT_IP_MAX,
  OTP_RATE_LIMIT_IP_WINDOW_SEC,
  OTP_RATE_LIMIT_PHONE_MAX,
  OTP_RATE_LIMIT_PHONE_WINDOW_SEC,
} from "@/lib/otp-constants";
import { sendWhatsAppTemplateMessage } from "@/lib/whatsapp/service";
import { WHATSAPP_TEMPLATES } from "@/lib/whatsapp/template-config";
import type { AppointmentData } from "@/lib/whatsapp/types";
import type { WeekSchedule, DaySchedule, AdvancedSettings } from "@/components/features/availability/types";
import { DEFAULT_SCHEDULE, DEFAULT_ADVANCED } from "@/components/features/availability/constants";
import { enforcePatientLimit, enforceAppointmentQuota, enforceWhatsappQuota } from "@/lib/plans/enforce";
import { incrementAppointments, incrementWhatsapp } from "@/lib/plans/usage";

const phoneRegex = /^(\+964|0)?[1-9]\d{9}$/;

const publicBookingSchema = z.object({
  fullName: z.string().min(1, "الاسم مطلوب"),
  phone: z.string().regex(phoneRegex, "رقم الهاتف غير صحيح"),
  dateOfBirth: z.string().min(1, "تاريخ الميلاد مطلوب"),
  gender: z.enum(["MALE", "FEMALE"], { message: "الجنس مطلوب" }),
  notes: z.string().optional(),
  doctorId: z.string().min(1, "الطبيب مطلوب"),
  startTime: z.string().min(1, "وقت الموعد مطلوب"),
  paymentMethod: z.enum(["IN_PERSON"]).default("IN_PERSON"),
});

export interface PublicClinicData {
  doctors: { id: string; firstName: string | null; lastName: string | null; role: string }[];
  enabledDays: string[];
  bookingWindow: number;
  minNotice: number;
  requiresOtp: boolean;
}

export interface AvailableSlotsResult {
  slots: string[];
  error?: string;
}

export interface BookingResult {
  success: boolean;
  appointmentId?: string;
  doctorName?: string;
  startTime?: string;
  endTime?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export interface OtpInitiateResult {
  success: boolean;
  otpRequired?: boolean;
  maskedPhone?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export interface OtpResendResult {
  success: boolean;
  retryAfter?: number;
  error?: string;
}

const verifyOtpSchema = z.object({
  phone: z.string().regex(phoneRegex, "رقم الهاتف غير صحيح"),
  code: z.string().min(4, "الرمز غير مكتمل").max(8, "الرمز غير صحيح"),
});

const resendOtpSchema = z.object({
  phone: z.string().regex(phoneRegex, "رقم الهاتف غير صحيح"),
});

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function extractTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export async function getPublicClinicData(slug: string): Promise<PublicClinicData | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      profiles: {
        where: { role: { in: ["DOCTOR", "ADMIN"] }, deletedAt: null },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          availability: { select: { schedule: true, settings: true } },
        },
      },
      reminders: {
        where: { type: "CONFIRM" },
        select: { isActive: true },
      },
    },
  });

  if (!tenant) return null;

  // Aggregate per-doctor schedules: enabled days = union of any doctor's
  // enabled day; bookingWindow = widest (max) so the date picker allows the
  // full range and per-doctor enforcement happens in getAvailableSlots;
  // minNotice = most restrictive (min) for UI hints.
  const enabledDays = new Set<string>();
  let bookingWindow = 30;
  let minNotice = 0;
  let hasAnySchedule = false;

  for (const doc of tenant.profiles) {
    const docSchedule = doc.availability?.schedule as WeekSchedule | undefined;
    const docSettings = doc.availability?.settings as AdvancedSettings | undefined;

    if (docSchedule) {
      hasAnySchedule = true;
      for (const [dayKey, daySchedule] of Object.entries(docSchedule)) {
        if ((daySchedule as DaySchedule).enabled) {
          enabledDays.add(dayKey);
        }
      }
    }
    if (docSettings) {
      hasAnySchedule = true;
      if (docSettings.bookingWindow > bookingWindow) bookingWindow = docSettings.bookingWindow;
      if (minNotice === 0 || docSettings.minNotice < minNotice) {
        minNotice = docSettings.minNotice;
      }
    }
  }

  return {
    doctors: tenant.profiles.map((p) => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      role: p.role,
    })),
    enabledDays: Array.from(enabledDays),
    bookingWindow: hasAnySchedule ? bookingWindow : 30,
    minNotice: hasAnySchedule ? minNotice : 0,
    requiresOtp: tenant.reminders.some((r) => r.isActive),
  };
}

export async function getAvailableSlots(
  slug: string,
  dateStr: string,
  doctorId: string,
): Promise<AvailableSlotsResult> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      services: {
        where: { isActive: true },
        select: { duration: true },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  if (!tenant) return { slots: [], error: "العيادة غير موجودة" };

  const serviceDuration = tenant.services[0]?.duration < 10 ? 30 : tenant.services[0]?.duration;

  // Load the selected doctor's own recurring schedule + advanced settings.
  const doctor = await prisma.profile.findFirst({
    where: { id: doctorId, tenantId: tenant.id, role: { in: ["DOCTOR", "ADMIN"] }, deletedAt: null },
    select: {
      id: true,
      availability: { select: { schedule: true, settings: true } },
    },
  });

  if (!doctor) return { slots: [], error: "الطبيب غير موجود في هذه العيادة" };

  const schedule = (doctor.availability?.schedule as WeekSchedule | undefined) ?? (DEFAULT_SCHEDULE as unknown as WeekSchedule);
  const settings = (doctor.availability?.settings as AdvancedSettings | undefined) ?? (DEFAULT_ADVANCED as unknown as AdvancedSettings);

  const bufferBefore = settings.bufferBefore;
  const bufferAfter = settings.bufferAfter;
  const maxPerDay = settings.maxPerDay;
  const bookingWindow = settings.bookingWindow;
  const minNotice = settings.minNotice;

  const requestedDate = new Date(dateStr + "T00:00:00");
  const now = new Date();

  // Booking window check
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const maxDate = new Date(now.getTime() + bookingWindow * 86400000);
  maxDate.setHours(23, 59, 59, 999);

  if (requestedDate > maxDate) return { slots: [], error: "الموعد خارج نطاق الحجز المتاح" };

  // Past date check
  if (requestedDate < todayStart) return { slots: [], error: "لا يمكن الحجز في تاريخ مضى" };

  const dayKey = getDayOfWeekKey(dateStr);
  const daySchedule = schedule[dayKey] as DaySchedule | undefined;

  if (!daySchedule || !daySchedule.enabled || daySchedule.segments.length === 0) {
    return { slots: [], error: "لا توجد مواعيد متاحة في هذا اليوم" };
  }

  // Get doctor's existing appointments for this date
  const dayStart = new Date(dateStr + "T00:00:00");
  const dayEnd = new Date(dateStr + "T23:59:59");

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      tenantId: tenant.id,
      doctorId,
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
      startTime: { gte: dayStart, lte: dayEnd },
    },
    select: { startTime: true, endTime: true },
    orderBy: { startTime: "asc" },
  });

  // Count existing appointments for maxPerDay check
  const existingCount = existingAppointments.length;
  if (existingCount >= maxPerDay) {
    return { slots: [], error: "الطبيب مكتمل الحجوزات لهذا اليوم" };
  }

  const remainingSlots = maxPerDay - existingCount;

  // Build blocked intervals from existing appointments
  const blockedIntervals = existingAppointments.map((apt) => ({
    start: timeToMinutes(extractTime(apt.startTime)) - bufferBefore,
    end: timeToMinutes(extractTime(apt.endTime)) + bufferAfter,
  }));

  // Add doctor-unavailable blocks to blocked intervals
  const unavailableBlocks = await prisma.doctorUnavailable.findMany({
    where: {
      tenantId: tenant.id,
      doctorId,
      startTime: { gte: dayStart, lte: dayEnd },
    },
    select: { startTime: true, endTime: true },
  });

  for (const block of unavailableBlocks) {
    blockedIntervals.push({
      start: timeToMinutes(extractTime(block.startTime)),
      end: timeToMinutes(extractTime(block.endTime)),
    });
  }

  // Min notice cutoff (in minutes from midnight)
  let minNoticeCutoff = -1;
  const isToday = dateStr === toDateKey(now);

  if (isToday) {
    minNoticeCutoff = now.getHours() * 60 + now.getMinutes();
  }

  if (minNotice > 0) {
    const minNoticeDate = new Date(now.getTime() + minNotice * 60 * 60 * 1000);
    if (toDateKey(minNoticeDate) === dateStr) {
      const minutes = minNoticeDate.getHours() * 60 + minNoticeDate.getMinutes();
      minNoticeCutoff = Math.max(minNoticeCutoff, minutes);
    } else if (toDateKey(minNoticeDate) > dateStr) {
      minNoticeCutoff = 24 * 60;
    }
  }

  // Generate slots from each segment
  const slots: string[] = [];

  for (const segment of daySchedule.segments) {
    const segmentStart = timeToMinutes(segment.start);
    const segmentEnd = timeToMinutes(segment.end);
    let cursor = segmentStart;

    while (cursor + serviceDuration <= segmentEnd) {
      const slotStart = cursor;
      const slotEnd = cursor + serviceDuration;

      const slotTime = minutesToTime(cursor);

      // Check if slot overlaps with any blocked interval
      const isBlocked = blockedIntervals.some(
        (blocked) => slotStart < blocked.end && slotEnd > blocked.start
      );

      // Check min notice & past times
      const isBeforeMinNotice = minNoticeCutoff >= 0 && slotStart <= minNoticeCutoff;

      if (!isBlocked && !isBeforeMinNotice) {
        slots.push(slotTime);
      }

      cursor += serviceDuration;
    }
  }
  return { slots };
}

interface PrepareSuccess {
  success: true;
  parsed: {
    fullName: string;
    phone: string;
    dateOfBirth: string;
    gender: "MALE" | "FEMALE";
    notes?: string;
    doctorId: string;
    startTime: string;
    paymentMethod: "IN_PERSON";
  };
  tenant: { id: string; name: string };
  service: { id: string; name: string; duration: number };
  doctor: { id: string; firstName: string | null; lastName: string | null };
  startDate: Date;
  endDate: Date;
  confirmActive: boolean;
}

type PrepareResult =
  | PrepareSuccess
  | { success: false; error?: string; fieldErrors?: Record<string, string> };

function whatsappEnvConfigured(): boolean {
  return Boolean(process.env.USER_ACCESS_TOKEN_WHATSAPP && process.env.PHONE_NUMBER_ID);
}

async function prepareBooking(
  slug: string,
  rawData: unknown,
): Promise<PrepareResult> {
  const parsed = publicBookingSchema.safeParse(rawData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) fieldErrors[path] = issue.message;
    }
    return { success: false, error: "بيانات غير صالحة", fieldErrors };
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      services: {
        where: { isActive: true },
        select: { id: true, name: true, duration: true },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
      reminders: {
        where: { type: "CONFIRM" },
        select: { isActive: true },
      },
    },
  });

  if (!tenant) return { success: false, error: "العيادة غير موجودة" };

  const service = tenant.services[0];
  if (!service) return { success: false, error: "لا توجد خدمات نشطة للحجز" };

  const { doctorId, startTime } = parsed.data;

  const doctor = await prisma.profile.findFirst({
    where: { id: doctorId, tenantId: tenant.id, role: { in: ["DOCTOR", "ADMIN"] }, deletedAt: null },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      availability: { select: { settings: true } },
    },
  });
  if (!doctor) return { success: false, error: "الطبيب غير موجود في هذه العيادة" };

  const startDate = new Date(startTime);
  if (isNaN(startDate.getTime())) {
    return { success: false, error: "وقت الموعد غير صالح" };
  }
  const endDate = new Date(startDate.getTime() + service.duration * 60 * 1000);
  const dateStr = toDateKey(startDate);
  const settings = (doctor.availability?.settings as AdvancedSettings | undefined) ?? (DEFAULT_ADVANCED as unknown as AdvancedSettings);
  const bufferBefore = settings.bufferBefore;
  const bufferAfter = settings.bufferAfter;

  const conflict = await prisma.appointment.findFirst({
    where: {
      tenantId: tenant.id,
      doctorId,
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
      AND: [
        { startTime: { lt: new Date(endDate.getTime() + bufferAfter * 60 * 1000) } },
        { endTime: { gt: new Date(startDate.getTime() - bufferBefore * 60 * 1000) } },
      ],
    },
  });
  if (conflict) {
    return { success: false, error: "هذا الوقت لم يعد متاحاً، يرجى اختيار وقت آخر" };
  }

  const blockConflict = await prisma.doctorUnavailable.findFirst({
    where: {
      tenantId: tenant.id,
      doctorId,
      AND: [{ startTime: { lt: endDate } }, { endTime: { gt: startDate } }],
    },
  });
  if (blockConflict) {
    return { success: false, error: "هذا الوقت غير متاح، يرجى اختيار وقت آخر" };
  }

  if (settings.maxPerDay) {
    const dayStart = new Date(dateStr + "T00:00:00");
    const dayEnd = new Date(dateStr + "T23:59:59");
    const dayCount = await prisma.appointment.count({
      where: {
        tenantId: tenant.id,
        doctorId,
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
        startTime: { gte: dayStart, lte: dayEnd },
      },
    });
    if (dayCount >= settings.maxPerDay) {
      return { success: false, error: "الطبيب مكتمل الحجوزات لهذا اليوم" };
    }
  }

  return {
    success: true as const,
    parsed: parsed.data,
    tenant: { id: tenant.id, name: tenant.name },
    service: { id: service.id, name: service.name, duration: service.duration },
    doctor: { id: doctor.id, firstName: doctor.firstName, lastName: doctor.lastName },
    startDate,
    endDate,
    confirmActive: tenant.reminders.some((r) => r.isActive),
  };
}

async function createPatientFromPayload(
  tenantId: string,
  payload: { patientFirstName: string; patientLastName: string; phone: string; dateOfBirth: string; gender: "MALE" | "FEMALE" },
) {
  let patient = await prisma.patient.findFirst({
    where: { tenantId, phone: payload.phone },
  });
  if (patient) {
    patient = await prisma.patient.update({
      where: { id: patient.id },
      data: {
        firstName: payload.patientFirstName,
        lastName: payload.patientLastName,
        dateOfBirth: new Date(payload.dateOfBirth),
        gender: payload.gender,
      },
    });
  } else {
    // New patient — enforce per-tenant patient limit before creating.
    const guard = await enforcePatientLimit(tenantId, 1);
    if (!guard.allowed) {
      throw new Error(guard.reason ?? "patient limit reached");
    }
    patient = await prisma.patient.create({
      data: {
        tenantId,
        firstName: payload.patientFirstName,
        lastName: payload.patientLastName,
        phone: payload.phone,
        dateOfBirth: new Date(payload.dateOfBirth),
        gender: payload.gender,
        source: "CLINIC_WEBSITE",
      },
    });
  }
  return patient;
}

async function recheckSlotAvailability(
  pending: PendingBooking,
): Promise<string | null> {
  const doctor = await prisma.profile.findFirst({
    where: { id: pending.doctorId, tenantId: pending.tenantId, deletedAt: null },
    select: { availability: { select: { settings: true } } },
  });
  const settings = (doctor?.availability?.settings as AdvancedSettings | undefined) ?? (DEFAULT_ADVANCED as unknown as AdvancedSettings);
  const bufferBefore = settings.bufferBefore;
  const bufferAfter = settings.bufferAfter;
  const startDate = new Date(pending.startTime);
  const endDate = new Date(pending.endTime);

  const conflict = await prisma.appointment.findFirst({
    where: {
      tenantId: pending.tenantId,
      doctorId: pending.doctorId,
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
      AND: [
        { startTime: { lt: new Date(endDate.getTime() + bufferAfter * 60 * 1000) } },
        { endTime: { gt: new Date(startDate.getTime() - bufferBefore * 60 * 1000) } },
      ],
    },
  });
  if (conflict) return "هذا الوقت لم يعد متاحاً، يرجى اختيار وقت آخر";

  const blockConflict = await prisma.doctorUnavailable.findFirst({
    where: {
      tenantId: pending.tenantId,
      doctorId: pending.doctorId,
      AND: [{ startTime: { lt: endDate } }, { endTime: { gt: startDate } }],
    },
  });
  if (blockConflict) return "هذا الوقت غير متاح، يرجى اختيار وقت آخر";

  if (settings.maxPerDay) {
    const dateStr = toDateKey(startDate);
    const dayStart = new Date(dateStr + "T00:00:00");
    const dayEnd = new Date(dateStr + "T23:59:59");
    const dayCount = await prisma.appointment.count({
      where: {
        tenantId: pending.tenantId,
        doctorId: pending.doctorId,
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
        startTime: { gte: dayStart, lte: dayEnd },
      },
    });
    if (dayCount >= settings.maxPerDay) return "الطبيب مكتمل الحجوزات لهذا اليوم";
  }
  return null;
}

async function dispatchOtpTemplate(
  pending: PendingBooking,
  otpCode: string,
): Promise<{ success: boolean; error?: string }> {
  // Enforce monthly WhatsApp quota before sending the OTP template.
  const waGuard = await enforceWhatsappQuota(pending.tenantId);
  if (!waGuard.allowed) {
    return { success: false, error: waGuard.reason ?? "whatsapp quota reached" };
  }

  const data: AppointmentData = {
    id: pending.tenantId,
    patient: {
      id: "pending",
      firstName: pending.patientFirstName,
      lastName: pending.patientLastName,
      phone: pending.phone,
    },
    startTime: new Date(pending.startTime),
    service: { name: pending.serviceName },
    tenant: { name: pending.tenantName },
  };
  const config = WHATSAPP_TEMPLATES.CONFIRM;
  const vars = config.resolve(data, { otpCode });
  const parameters = config.paramOrder.map((key) => ({
    type: "text" as const,
    text: vars[key],
  }));

  const result = await sendWhatsAppTemplateMessage({
    toPhone: pending.phone,
    templateName: config.name,
    languageCode: config.language,
    parameters,
  });

  await prisma.messageLog.create({
    data: {
      tenantId: pending.tenantId,
      type: "CONFIRM",
      appointmentId: null,
      patientId: null,
      toPhone: pending.phone,
      messageContent: JSON.stringify({ template: config.name, variables: vars }),
      status: result.success ? "SENT" : "FAILED",
      externalId: result.externalId ?? null,
      sentAt: result.success ? new Date() : null,
      errorMessage: result.error ?? null,
    },
  });

  if (result.success) {
    await incrementWhatsapp(pending.tenantId);
  }

  return result;
}

export async function initiateBookingOtp(
  slug: string,
  rawData: unknown,
): Promise<OtpInitiateResult> {
  const prepared = await prepareBooking(slug, rawData);
  if (!prepared.success) {
    return {
      success: false,
      error: prepared.error,
      fieldErrors: prepared.fieldErrors,
    };
  }

  if (!prepared.confirmActive) {
    return { success: false, error: "هذه العيادة لا تتطلب التحقق" };
  }

  if (!redis || !whatsappEnvConfigured()) {
    return { success: false, error: "OTP_UNAVAILABLE" };
  }

  const ip = await getClientIp();
  const ipLimit = await checkRateLimit(`rl:otp:ip:${ip}`, OTP_RATE_LIMIT_IP_MAX, OTP_RATE_LIMIT_IP_WINDOW_SEC);
  if (!ipLimit.allowed) {
    return { success: false, error: "RATE_LIMITED" };
  }
  const phoneLimit = await checkRateLimit(
    `rl:otp:phone:${prepared.tenant.id}:${prepared.parsed.phone}`,
    OTP_RATE_LIMIT_PHONE_MAX,
    OTP_RATE_LIMIT_PHONE_WINDOW_SEC,
  );
  if (!phoneLimit.allowed) {
    return { success: false, error: "RATE_LIMITED" };
  }

  const { firstName, lastName } = splitName(prepared.parsed.fullName);
  const token = globalThis.crypto.randomUUID();
  const payload: PendingBooking = {
    tenantId: prepared.tenant.id,
    tenantName: prepared.tenant.name,
    doctorId: prepared.parsed.doctorId,
    doctorFirstName: prepared.doctor.firstName,
    doctorLastName: prepared.doctor.lastName,
    serviceId: prepared.service.id,
    serviceName: prepared.service.name,
    serviceDuration: prepared.service.duration,
    startTime: prepared.startDate.toISOString(),
    endTime: prepared.endDate.toISOString(),
    patientFullName: prepared.parsed.fullName,
    patientFirstName: firstName,
    patientLastName: lastName,
    phone: prepared.parsed.phone,
    dateOfBirth: prepared.parsed.dateOfBirth,
    gender: prepared.parsed.gender,
    notes: prepared.parsed.notes,
  };
  await storePendingBooking(token, payload);

  const code = await setOtp(prepared.tenant.id, prepared.parsed.phone, token);
  if (!code) {
    await deletePendingBooking(token);
    return { success: false, error: "OTP_UNAVAILABLE" };
  }

  const dispatch = await dispatchOtpTemplate(payload, code);
  if (!dispatch.success) {
    await deleteOtp(prepared.tenant.id, prepared.parsed.phone);
    await deletePendingBooking(token);
    return { success: false, error: "OTP_UNAVAILABLE" };
  }

  await setResendCooldown(prepared.tenant.id, prepared.parsed.phone);

  return {
    success: true,
    otpRequired: true,
    maskedPhone: maskPhone(prepared.parsed.phone),
  };
}

export async function verifyBookingOtp(
  slug: string,
  rawData: unknown,
): Promise<BookingResult> {
  const parsed = verifyOtpSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "بيانات غير صالحة" };
  }
  const { phone, code } = parsed.data;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!tenant) return { success: false, error: "العيادة غير موجودة" };

  const verify = await verifyOtp(tenant.id, phone, code);
  console.log(code, verify);
  if (verify.outcome === "unavailable") {
    return { success: false, error: "OTP_UNAVAILABLE" };
  }
  if (verify.outcome === "expired") {
    return { success: false, error: "انتهت صلاحية الرمز، يرجى طلب رمز جديد" };
  }
  if (verify.outcome === "max_attempts") {
    return { success: false, error: "تجاوزت عدد المحاولات المسموح، يرجى طلب رمز جديد" };
  }
  if (verify.outcome === "invalid") {
    return { success: false, error: "الرمز غير صحيح" };
  }

  const token = verify.pendingToken!;
  const payload = await readPendingBooking(token);
  if (!payload) {
    return { success: false, error: "انتهت صلاحية الحجز، يرجى المحاولة مرة أخرى" };
  }

  const recheckError = await recheckSlotAvailability(payload);
  if (recheckError) {
    await deletePendingBooking(token);
    return { success: false, error: recheckError };
  }

  // Enforce monthly appointment quota before persisting.
  const apptGuard = await enforceAppointmentQuota(tenant.id);
  if (!apptGuard.allowed) {
    await deletePendingBooking(token);
    return { success: false, error: apptGuard.reason };
  }

  let patient;
  try {
    patient = await createPatientFromPayload(tenant.id, payload);
  } catch (e) {
    await deletePendingBooking(token);
    return { success: false, error: e instanceof Error ? e.message : "تعذر إنشاء المريض" };
  }

  const appointment = await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      patientId: patient.id,
      doctorId: payload.doctorId,
      serviceId: payload.serviceId,
      startTime: new Date(payload.startTime),
      endTime: new Date(payload.endTime),
      notes: payload.notes || undefined,
      status: "SCHEDULED",
    },
  });

  await incrementAppointments(tenant.id);
  await deletePendingBooking(token);

  const doctorName =
    [payload.doctorFirstName, payload.doctorLastName].filter(Boolean).join(" ") ||
    "الطبيب";

  return {
    success: true,
    appointmentId: appointment.id,
    doctorName,
    startTime: appointment.startTime.toISOString(),
    endTime: appointment.endTime.toISOString(),
  };
}

export async function resendBookingOtp(
  slug: string,
  rawData: unknown,
): Promise<OtpResendResult> {
  const parsed = resendOtpSchema.safeParse(rawData);
  if (!parsed.success) return { success: false, error: "بيانات غير صالحة" };
  const { phone } = parsed.data;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });
  if (!tenant) return { success: false, error: "العيادة غير موجودة" };

  if (!redis || !whatsappEnvConfigured()) {
    return { success: false, error: "OTP_UNAVAILABLE" };
  }

  const phoneLimit = await checkRateLimit(
    `rl:otp:phone:${tenant.id}:${phone}`,
    OTP_RATE_LIMIT_PHONE_MAX,
    OTP_RATE_LIMIT_PHONE_WINDOW_SEC,
  );
  if (!phoneLimit.allowed) {
    return { success: false, error: "RATE_LIMITED", retryAfter: phoneLimit.retryAfter };
  }

  const cooldownRemaining = await getResendCooldownRemaining(tenant.id, phone);
  if (cooldownRemaining > 0) {
    return { success: false, error: "COOLDOWN", retryAfter: cooldownRemaining };
  }

  const existing = await getOtpRecord(tenant.id, phone);
  if (!existing) {
    return { success: false, error: "انتهت صلاحية الرمز، يرجى بدء حجز جديد" };
  }
  const payload = await readPendingBooking(existing.pendingToken);
  if (!payload) {
    await deleteOtp(tenant.id, phone);
    return { success: false, error: "انتهت صلاحية الحجز، يرجى المحاولة مرة أخرى" };
  }

  const code = await setOtp(tenant.id, phone, existing.pendingToken);
  if (!code) return { success: false, error: "OTP_UNAVAILABLE" };

  const dispatch = await dispatchOtpTemplate(payload, code);
  if (!dispatch.success) {
    await deleteOtp(tenant.id, phone);
    return { success: false, error: "OTP_UNAVAILABLE" };
  }

  await setResendCooldown(tenant.id, phone);

  return { success: true, retryAfter: DEFAULT_RESEND_COOLDOWN_SEC };
}

export async function createPublicAppointment(
  slug: string,
  rawData: unknown,
): Promise<BookingResult> {
  const prepared = await prepareBooking(slug, rawData);
  if (!prepared.success) {
    return {
      success: false,
      error: prepared.error,
      fieldErrors: prepared.fieldErrors,
    };
  }

  if (prepared.confirmActive) {
    return {
      success: false,
      error: "تتطلب هذه العيادة تأكيد الحجز عبر واتساب",
    };
  }

  const { tenant, service, doctor, startDate, endDate, parsed } = prepared;

  // Enforce monthly appointment quota before persisting.
  const apptGuard = await enforceAppointmentQuota(tenant.id);
  if (!apptGuard.allowed) {
    return { success: false, error: apptGuard.reason };
  }

  let patient;
  try {
    patient = await createPatientFromPayload(tenant.id, {
      patientFirstName: splitName(parsed.fullName).firstName,
      patientLastName: splitName(parsed.fullName).lastName,
      phone: parsed.phone,
      dateOfBirth: parsed.dateOfBirth,
      gender: parsed.gender,
    });
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "تعذر إنشاء المريض" };
  }

  const appointment = await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      patientId: patient.id,
      doctorId: parsed.doctorId,
      serviceId: service.id,
      startTime: startDate,
      endTime: endDate,
      notes: parsed.notes || undefined,
      status: "SCHEDULED",
    },
  });

  await incrementAppointments(tenant.id);

  const doctorName =
    [doctor.firstName, doctor.lastName].filter(Boolean).join(" ") || "الطبيب";

  return {
    success: true,
    appointmentId: appointment.id,
    doctorName,
    startTime: appointment.startTime.toISOString(),
    endTime: appointment.endTime.toISOString(),
  };
}
