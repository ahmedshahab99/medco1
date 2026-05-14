"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

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

const exceptionSchema = z.object({
  id: z.string(),
  date: z.string(),
  type: z.enum(["off", "custom", "break"]),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  label: z.string().optional(),
});

const advancedSettingsSchema = z.object({
  bufferBefore: z.number().min(0),
  bufferAfter: z.number().min(0),
  maxPerDay: z.number().min(1),
  bookingWindow: z.number().min(1),
  minNotice: z.number().min(0),
});

const saveAvailabilitySchema = z.object({
  schedule: weekScheduleSchema,
  exceptions: z.array(exceptionSchema),
  settings: advancedSettingsSchema,
});

// ── Actions ─────────────────────────────────────────────────────────

export async function getClinicAvailability() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || !profile.tenantId) return null;

  const availability = await prisma.clinicAvailability.findUnique({
    where: { tenantId: profile.tenantId },
  });

  if (!availability) return null;

  return {
    schedule: availability.schedule as never,
    exceptions: availability.exceptions as never,
    settings: availability.settings as never,
  };
}

export async function saveClinicAvailability(data: {
  schedule: unknown;
  exceptions: unknown;
  settings: unknown;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "يرجى تسجيل الدخول أولاً." };

  const actor = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!actor || actor.role !== "ADMIN" || !actor.tenantId) {
    return { error: "ليس لديك صلاحية تعديل أوقات العمل." };
  }

  const validation = saveAvailabilitySchema.safeParse(data);
  if (!validation.success) {
    return { error: "بيانات غير صالحة: " + validation.error.issues[0].message };
  }

  try {
    await prisma.clinicAvailability.upsert({
      where: { tenantId: actor.tenantId },
      create: {
        tenantId: actor.tenantId,
        schedule: validation.data.schedule,
        exceptions: validation.data.exceptions,
        settings: validation.data.settings,
      },
      update: {
        schedule: validation.data.schedule,
        exceptions: validation.data.exceptions,
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
