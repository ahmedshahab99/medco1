import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendTemplateMessage } from "@/lib/whatsapp/send-template";

const CRON_INTERVAL_MINUTES = 30;

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const activeReminders = await prisma.reminder.findMany({
      where: { type: "REMINDER", isActive: true },
    });

    if (activeReminders.length === 0) {
      return NextResponse.json({ message: "No active REMINDER configs" });
    }

    const now = new Date();
    const results: {
      appointmentId: string;
      tenantId: string;
      success: boolean;
      error?: string;
    }[] = [];

    for (const reminder of activeReminders) {
      const minutesBefore = reminder.triggerBeforeMinutes ?? 1440;

      const windowStart = new Date(
        now.getTime() + (minutesBefore - CRON_INTERVAL_MINUTES) * 60_000,
      );
      const windowEnd = new Date(
        now.getTime() + (minutesBefore + CRON_INTERVAL_MINUTES) * 60_000,
      );

      console.log(windowStart.toISOString(), windowEnd.toISOString(), minutesBefore);
      const appointments = await prisma.appointment.findMany({
        where: {
          tenantId: reminder.tenantId,
          startTime: { gte: windowStart, lte: windowEnd },
          status: { in: ["SCHEDULED", "CONFIRMED"] },
          messageLogs: { none: { type: "REMINDER" } },
        },
        select: { id: true },
      });

      for (const appt of appointments) {
        const result = await sendTemplateMessage({
          appointmentId: appt.id,
          type: "REMINDER",
          tenantId: reminder.tenantId,
        });
        results.push({
          appointmentId: appt.id,
          tenantId: reminder.tenantId,
          success: result.success,
          error: result.error,
        });
      }
    }

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(
      `[Cron:Reminders] Processed ${results.length} appointments — ${succeeded} sent, ${failed} failed`,
    );

    if (failed > 0) {
      const failures = results.filter((r) => !r.success);
      console.error("[Cron:Reminders] Failures:", JSON.stringify(failures));
    }

    return NextResponse.json({
      processed: results.length,
      succeeded,
      failed,
    });
  } catch (error) {
    console.error("[Cron:Reminders] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
