"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { appointmentPaymentSchema } from "@/lib/schemas/appointment-payment";
import type { AppointmentPaymentInput } from "@/lib/schemas/appointment-payment";

export async function recordAppointmentPaymentAction(
  appointmentId: string,
  input: AppointmentPaymentInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const actor = await prisma.profile.findUnique({ where: { id: user.id, deletedAt: null } });
  if (!actor?.tenantId) return { success: false, error: "غير مصرح" };

  const parsed = appointmentPaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, tenantId: actor.tenantId },
    select: { id: true, patientId: true, serviceId: true },
  });
  if (!appointment) return { success: false, error: "الموعد غير موجود" };

  const { amount, description, date } = parsed.data;

  await prisma.transaction.create({
    data: {
      tenantId: actor.tenantId,
      type: "INCOME",
      category: "SERVICES",
      amount,
      description: description || null,
      date: new Date(date),
      patientId: appointment.patientId,
      appointmentId: appointment.id,
      serviceId: appointment.serviceId,
    },
  });

  revalidatePath("/dashboard/calendar");

  return { success: true };
}
