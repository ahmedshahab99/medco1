"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import type { ReminderType, MessageStatus } from "@prisma/client";

// ── Helpers ────────────────────────────────────────────────────────────

async function getAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" as const };

  const actor = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!actor || !actor.tenantId) return { error: "Forbidden" as const };

  return { actor };
}

// ── Reminder Actions ───────────────────────────────────────────────────

export async function getTenantReminders() {
  const auth = await getAuth();
  if ("error" in auth) return [];

  const { actor } = auth;

  const types: ReminderType[] = ["CONFIRM", "REMINDER", "RESCHEDULE", "CANCEL"];

  const reminders = await Promise.all(
    types.map(async (type) => {
      let reminder = await prisma.reminder.findUnique({
        where: { tenantId_type: { tenantId: actor.tenantId!, type } },
      });

      if (!reminder) {
        const names: Record<ReminderType, string> = {
          CONFIRM: "تأكيد الحجز",
          REMINDER: "تذكير قبل الموعد",
          RESCHEDULE: "إعادة الجدولة",
          CANCEL: "إلغاء الموعد",
        };

        reminder = await prisma.reminder.create({
          data: {
            tenantId: actor.tenantId!,
            type,
            name: names[type],
            isActive: true,
            triggerBeforeMinutes: type === "REMINDER" ? 1440 : null,
          },
        });
      }

      return reminder;
    })
  );

  return reminders.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function toggleReminder(id: string) {
  const auth = await getAuth();
  if ("error" in auth) return auth;

  const { actor } = auth;

  const reminder = await prisma.reminder.findUnique({ where: { id } });
  if (!reminder || reminder.tenantId !== actor.tenantId) {
    return { error: "Forbidden" as const };
  }

  await prisma.reminder.update({
    where: { id },
    data: { isActive: !reminder.isActive },
  });

  revalidatePath("/dashboard/reminders");
  return { success: true };
}

export async function updateReminderTiming(id: string, minutes: number) {
  const auth = await getAuth();
  if ("error" in auth) return auth;

  const { actor } = auth;

  const reminder = await prisma.reminder.findUnique({ where: { id } });
  if (!reminder || reminder.tenantId !== actor.tenantId) {
    return { error: "Forbidden" as const };
  }

  if (reminder.type !== "REMINDER") {
    return { error: "لا يمكن ضبط التوقيت إلا لنوع التذكير" as const };
  }

  await prisma.reminder.update({
    where: { id },
    data: { triggerBeforeMinutes: minutes },
  });

  revalidatePath("/dashboard/reminders");
  return { success: true };
}

// ── MessageLog Actions ─────────────────────────────────────────────────

export interface MessageLogFilters {
  search?: string;
  status?: MessageStatus;
  type?: ReminderType;
  page?: number;
  pageSize?: number;
}

export async function getMessageLogs(filters?: MessageLogFilters) {
  const auth = await getAuth();
  if ("error" in auth) return { logs: [], total: 0 };

  const { actor } = auth;

  const where: Record<string, unknown> = { tenantId: actor.tenantId! };

  if (filters?.status) {
    where.status = filters.status;
  }
  if (filters?.type) {
    where.type = filters.type;
  }

  const take = filters?.pageSize ?? 50;
  const skip = ((filters?.page ?? 1) - 1) * take;

  const [logs, total] = await Promise.all([
    prisma.messageLog.findMany({
      where,
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.messageLog.count({ where }),
  ]);

  let filteredLogs = logs;
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    filteredLogs = logs.filter((l) => {
      const name =
        l.patient?.firstName && l.patient?.lastName
          ? `${l.patient.firstName} ${l.patient.lastName}`.toLowerCase()
          : "";
      return name.includes(q) || l.toPhone.includes(q);
    });
  }

  return {
    logs: filteredLogs.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
      sentAt: l.sentAt?.toISOString() ?? null,
      deliveredAt: l.deliveredAt?.toISOString() ?? null,
      readAt: l.readAt?.toISOString() ?? null,
    })),
    total,
  };
}
