"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { getDayOfWeekKey } from "@/lib/date-utils";
import { splitName } from "@/lib/patient-utils";
import type { WeekSchedule, DaySchedule, AdvancedSettings } from "@/components/features/availability/types";

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
        where: { role: { in: ["DOCTOR", "ADMIN"] } },
        select: { id: true, firstName: true, lastName: true, role: true },
      },
      clinicAvailability: { select: { schedule: true, settings: true } },
    },
  });

  if (!tenant) return null;

  const schedule = tenant.clinicAvailability?.schedule as WeekSchedule | undefined;
  const settings = tenant.clinicAvailability?.settings as AdvancedSettings | undefined;

  const enabledDays: string[] = [];
  if (schedule) {
    for (const [dayKey, daySchedule] of Object.entries(schedule)) {
      if ((daySchedule as DaySchedule).enabled) {
        enabledDays.push(dayKey);
      }
    }
  }

  return {
    doctors: tenant.profiles,
    enabledDays,
    bookingWindow: settings?.bookingWindow ?? 30,
    minNotice: settings?.minNotice ?? 0,
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
      clinicAvailability: { select: { schedule: true, settings: true } },
      services: {
        where: { isActive: true },
        select: { duration: true },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  if (!tenant) return { slots: [], error: "العيادة غير موجودة" };

  const serviceDuration = tenant.services[0]?.duration ?? 30;
  const schedule = tenant.clinicAvailability?.schedule as WeekSchedule | undefined;
  const settings = tenant.clinicAvailability?.settings as AdvancedSettings | undefined;

  if (!schedule) return { slots: [], error: "لم يتم إعداد أوقات العمل بعد" };

  const bufferBefore = settings?.bufferBefore ?? 0;
  const bufferAfter = settings?.bufferAfter ?? 0;
  const maxPerDay = settings?.maxPerDay ?? 99;
  const bookingWindow = settings?.bookingWindow ?? 30;
  const minNotice = settings?.minNotice ?? 0;

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

export async function createPublicAppointment(
  slug: string,
  rawData: unknown,
): Promise<BookingResult> {
  const parsed = publicBookingSchema.safeParse(rawData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] = issue.message;
      }
    }
    return { success: false, error: "بيانات غير صالحة", fieldErrors };
  }

  const { fullName, phone, dateOfBirth, gender, notes, doctorId, startTime } = parsed.data;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      services: {
        where: { isActive: true },
        select: { id: true, duration: true },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
      clinicAvailability: { select: { settings: true } },
    },
  });

  if (!tenant) return { success: false, error: "العيادة غير موجودة" };

  const service = tenant.services[0];
  if (!service) return { success: false, error: "لا توجد خدمات نشطة للحجز" };

  // Verify the doctor belongs to this tenant
  const doctor = await prisma.profile.findFirst({
    where: { id: doctorId, tenantId: tenant.id, role: { in: ["DOCTOR", "ADMIN"] } },
    select: { id: true, firstName: true, lastName: true },
  });

  if (!doctor) return { success: false, error: "الطبيب غير موجود في هذه العيادة" };

  // Parse startTime and compute endTime
  const startDate = new Date(startTime);
  if (isNaN(startDate.getTime())) {
    return { success: false, error: "وقت الموعد غير صالح" };
  }

  const endDate = new Date(startDate.getTime() + service.duration * 60 * 1000);
  const dateStr = toDateKey(startDate);
  const settings = tenant.clinicAvailability?.settings as AdvancedSettings | undefined;
  const bufferBefore = settings?.bufferBefore ?? 0;
  const bufferAfter = settings?.bufferAfter ?? 0;

  // Double-check availability (race-safe)
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

  // Check maxPerDay
  if (settings?.maxPerDay) {
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

  // Split full name
  const { firstName, lastName } = splitName(fullName);

  // Match patient by phone or create new
  let patient = await prisma.patient.findFirst({
    where: { tenantId: tenant.id, phone },
  });

  if (patient) {
    patient = await prisma.patient.update({
      where: { id: patient.id },
      data: { firstName, lastName, dateOfBirth: new Date(dateOfBirth), gender: gender as "MALE" | "FEMALE" },
    });
  } else {
    patient = await prisma.patient.create({
      data: {
        tenantId: tenant.id,
        firstName,
        lastName,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        gender: gender as "MALE" | "FEMALE",
      },
    });
  }

  // Get clinic's default consultation fee (private, not shown to patients)
  const tenantWithFee = await prisma.tenant.findUnique({
    where: { id: tenant.id },
    select: { defaultConsultationFee: true },
  });

  const appointment = await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      patientId: patient.id,
      doctorId,
      serviceId: service.id,
      startTime: startDate,
      endTime: endDate,
      notes: notes || undefined,
      status: "SCHEDULED",
      consultationFee: tenantWithFee?.defaultConsultationFee ?? undefined,
      paymentStatus: "PENDING",
    },
  });

  const doctorName = [doctor.firstName, doctor.lastName].filter(Boolean).join(" ") || "الطبيب";

  return {
    success: true,
    appointmentId: appointment.id,
    doctorName,
    startTime: appointment.startTime.toISOString(),
    endTime: appointment.endTime.toISOString(),
  };
}
