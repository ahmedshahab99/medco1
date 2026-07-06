"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { DEFAULT_SCHEDULE, DEFAULT_ADVANCED } from "@/components/features/availability/constants";
import type { WeekSchedule, AdvancedSettings } from "@/components/features/availability/types";

// ── Zod validation schemas ──────────────────────────────────────────

const timeSegmentSchema = z.object({
  id: z.string(),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});

const dayScheduleSchema = z.object({
  enabled: z.boolean(),
  segments: z.array(timeSegmentSchema),
});

const weekScheduleSchema = z.record(z.string(), dayScheduleSchema);

const advancedSettingsSchema = z.object({
  bufferBefore: z.number().min(0),
  bufferAfter: z.number().min(0),
  maxPerDay: z.number().min(1),
  bookingWindow: z.number().min(1),
  minNotice: z.number().min(0),
});

const saveAvailabilitySchema = z.object({
  schedule: weekScheduleSchema,
  settings: advancedSettingsSchema,
});

const DOCTOR_LIKE_ROLES = ["DOCTOR", "ADMIN"] as const;

// ── Actions ─────────────────────────────────────────────────────────

/**
 * Load a single doctor's availability (schedule + advanced settings).
 * - A DOCTOR may omit `doctorId` to load their own.
 * - An ADMIN must pass an explicit `doctorId`.
 * Falls back to DEFAULT_SCHEDULE / DEFAULT_ADVANCED when no row exists yet.
 */
export async function getDoctorAvailability(doctorId?: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const actor = await prisma.profile.findUnique({ where: { id: user.id, deletedAt: null } });
  if (!actor || !actor.tenantId) return null;

  const targetId = doctorId ?? actor.id;

  // Authorization: a doctor may only read their own; admins may read any in-tenant doctor.
  if (actor.role === "DOCTOR" && targetId !== actor.id) return null;
  if (actor.role === "RECEPTIONIST") return null;

  const target = await prisma.profile.findUnique({
    where: { id: targetId, deletedAt: null },
    select: { id: true, tenantId: true, role: true },
  });
  if (!target || target.tenantId !== actor.tenantId || !DOCTOR_LIKE_ROLES.includes(target.role as never)) {
    return null;
  }

  const availability = await prisma.doctorAvailability.findUnique({
    where: { doctorId: target.id },
  });

  if (!availability) {
    return {
      schedule: DEFAULT_SCHEDULE as unknown as WeekSchedule,
      settings: DEFAULT_ADVANCED as unknown as AdvancedSettings,
    };
  }

  return {
    schedule: availability.schedule as unknown as WeekSchedule,
    settings: availability.settings as unknown as AdvancedSettings,
  };
}

/**
 * Load every bookable doctor's availability in the caller's tenant.
 * Used by the calendar's "all doctors" aggregate view.
 */
export async function getAllDoctorsAvailability(): Promise<
  { doctorId: string; schedule: WeekSchedule; settings: AdvancedSettings }[]
> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return [];

  const actor = await prisma.profile.findUnique({ where: { id: user.id, deletedAt: null } });
  if (!actor || !actor.tenantId) return [];

  const doctors = await prisma.profile.findMany({
    where: {
      tenantId: actor.tenantId,
      role: { in: [...DOCTOR_LIKE_ROLES] },
      deletedAt: null,
    },
    select: {
      id: true,
      availability: { select: { schedule: true, settings: true } },
    },
  });

  return doctors.map((d) => ({
    doctorId: d.id,
    schedule: (d.availability?.schedule ?? DEFAULT_SCHEDULE) as unknown as WeekSchedule,
    settings: (d.availability?.settings ?? DEFAULT_ADVANCED) as unknown as AdvancedSettings,
  }));
}

export async function saveDoctorAvailability(
  doctorId: string,
  data: { schedule: unknown; settings: unknown },
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "يرجى تسجيل الدخول أولاً." };

  // Re-query the actor Profile from DB — never trust JWT for writes.
  const actor = await prisma.profile.findUnique({ where: { id: user.id, deletedAt: null } });
  if (!actor || !actor.tenantId) {
    return { error: "ليس لديك صلاحية تعديل أوقات العمل." };
  }

  const validation = saveAvailabilitySchema.safeParse(data);
  if (!validation.success) {
    return { error: "بيانات غير صالحة: " + validation.error.issues[0].message };
  }

  // Verify the target doctor belongs to the same tenant and is bookable.
  const target = await prisma.profile.findUnique({
    where: { id: doctorId, deletedAt: null },
    select: { id: true, tenantId: true, role: true },
  });
  if (!target || target.tenantId !== actor.tenantId || !DOCTOR_LIKE_ROLES.includes(target.role as never)) {
    return { error: "الطبيب غير موجود في هذه العيادة." };
  }

  // Authorization: admins may edit any in-tenant doctor; doctors may only edit their own.
  if (actor.role !== "ADMIN" && actor.id !== doctorId) {
    return { error: "ليس لديك صلاحية تعديل أوقات العمل." };
  }

  try {
    await prisma.doctorAvailability.upsert({
      where: { doctorId },
      create: {
        tenantId: actor.tenantId,
        doctorId,
        schedule: validation.data.schedule,
        settings: validation.data.settings,
      },
      update: {
        schedule: validation.data.schedule,
        settings: validation.data.settings,
      },
    });

    revalidatePath("/dashboard/availability");
    return { success: true };
  } catch (error) {
    console.error("Error saving availability:", error);
    return { error: "حدث خطأ أثناء حفظ الإعدادات." };
  }
}
