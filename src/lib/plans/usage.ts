import prisma from "@/lib/prisma";

export interface CurrentUsage {
  appointments: number;
  whatsapp: number;
  periodMonth: string;
}

/**
 * Returns the "YYYY-MM" period key for the given date (UTC).
 * All monthly quotas are scoped by calendar month.
 */
export function getPeriodKey(date: Date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * Fetches the current month's usage for a tenant.
 * Returns zeros if no counter row exists yet.
 */
export async function getCurrentUsage(
  tenantId: string,
  now: Date = new Date(),
): Promise<CurrentUsage> {
  const periodMonth = getPeriodKey(now);
  const row = await prisma.usageCounter.findUnique({
    where: { tenantId_periodMonth: { tenantId, periodMonth } },
    select: { appointmentsCount: true, whatsappCount: true },
  });
  return {
    appointments: row?.appointmentsCount ?? 0,
    whatsapp: row?.whatsappCount ?? 0,
    periodMonth,
  };
}

/**
 * Atomically increments the appointments counter for the current month,
 * creating the row if missing.
 */
export async function incrementAppointments(
  tenantId: string,
  now: Date = new Date(),
): Promise<void> {
  const periodMonth = getPeriodKey(now);
  await prisma.usageCounter.upsert({
    where: { tenantId_periodMonth: { tenantId, periodMonth } },
    create: { tenantId, periodMonth, appointmentsCount: 1 },
    update: { appointmentsCount: { increment: 1 } },
  });
}

/**
 * Atomically increments the WhatsApp counter for the current month,
 * creating the row if missing.
 */
export async function incrementWhatsapp(
  tenantId: string,
  now: Date = new Date(),
): Promise<void> {
  const periodMonth = getPeriodKey(now);
  await prisma.usageCounter.upsert({
    where: { tenantId_periodMonth: { tenantId, periodMonth } },
    create: { tenantId, periodMonth, whatsappCount: 1 },
    update: { whatsappCount: { increment: 1 } },
  });
}