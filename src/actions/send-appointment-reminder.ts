"use server";

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { sendTemplateMessage } from "@/lib/whatsapp/send-template";
import type { ReminderType } from "@prisma/client";

export async function sendAppointmentReminderAction(
  appointmentId: string,
  type: "CANCEL" | "RESCHEDULE"
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const actor = await prisma.profile.findUnique({ where: { id: user.id, deletedAt: null } });
  if (!actor || !actor.tenantId) return { success: false, error: "غير مصرح" };

  const reminderType: ReminderType = type;

  const result = await sendTemplateMessage({
    appointmentId,
    type: reminderType,
    tenantId: actor.tenantId,
  });

  return result;
}
