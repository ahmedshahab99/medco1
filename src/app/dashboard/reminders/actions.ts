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

  const actor = await prisma.profile.findUnique({ where: { id: user.id, deletedAt: null } });
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
            isActive: false,
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

  if (minutes < 240 || minutes > 1440) {
    return { error: "يجب أن يكون وقت التذكير بين 4 و 24 ساعة" as const };
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
  if ("error" in auth) return { logs: [], total: 0, stats: { sentToday: 0, deliveredCount: 0, totalMessages: 0, typeDistribution: [] } };

  const { actor } = auth;

  const where: Record<string, unknown> = { tenantId: actor.tenantId! };

  if (filters?.status) {
    where.status = filters.status;
  }
  if (filters?.type) {
    where.type = filters.type;
  }
  if (filters?.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { toPhone: { contains: q } },
      { patient: { firstName: { contains: q } } },
      { patient: { lastName: { contains: q } } },
    ];
  }

  const take = filters?.pageSize ?? 15;
  const skip = ((filters?.page ?? 1) - 1) * take;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [logs, total, sentToday, deliveredCount] = await Promise.all([
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
    prisma.messageLog.count({
      where: { ...where, sentAt: { gte: startOfToday } },
    }),
    prisma.messageLog.count({
      where: { ...where, status: { in: ["DELIVERED", "READ"] } },
    }),
  ]);

  const types: ReminderType[] = ["CONFIRM", "REMINDER", "RESCHEDULE", "CANCEL"];
  const typeDistribution = await Promise.all(
    types.map(async (type) => {
      const count = await prisma.messageLog.count({
        where: { ...where, type },
      });
      return { type, count };
    })
  );

  const serializedLogs = logs.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
    sentAt: l.sentAt?.toISOString() ?? null,
    deliveredAt: l.deliveredAt?.toISOString() ?? null,
    readAt: l.readAt?.toISOString() ?? null,
  }));

  const typeDist = typeDistribution.map((d) => ({
    ...d,
    pct: total > 0 ? Math.round((d.count / total) * 100) : 0,
  }));

  return {
    logs: serializedLogs,
    total,
    stats: {
      sentToday,
      deliveredCount,
      totalMessages: total,
      typeDistribution: typeDist,
    },
  };
}
