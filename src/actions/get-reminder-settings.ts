"use server";

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import type { ReminderType } from "@prisma/client";

export interface ReminderSettings {
  cancelActive: boolean;
  rescheduleActive: boolean;
}

async function isReminderActive(
  tenantId: string,
  type: ReminderType
): Promise<boolean> {
  const reminder = await prisma.reminder.findUnique({
    where: { tenantId_type: { tenantId, type } },
    select: { isActive: true },
  });
  return reminder?.isActive ?? false;
}

export async function getReminderSettingsAction(): Promise<ReminderSettings> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { cancelActive: false, rescheduleActive: false };

  const actor = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!actor || !actor.tenantId) return { cancelActive: false, rescheduleActive: false };

  const [cancelActive, rescheduleActive] = await Promise.all([
    isReminderActive(actor.tenantId, "CANCEL"),
    isReminderActive(actor.tenantId, "RESCHEDULE"),
  ]);

  return { cancelActive, rescheduleActive };
}
