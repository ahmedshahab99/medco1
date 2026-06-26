import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    const expired = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        currentPeriodEnd: { not: null, lte: now },
      },
      select: { id: true, tenantId: true },
    });

    if (expired.length === 0) {
      return NextResponse.json({ message: "No expired subscriptions", expired: 0 });
    }

    await prisma.subscription.updateMany({
      where: {
        id: { in: expired.map((s) => s.id) },
      },
      data: { status: "EXPIRED" },
    });

    console.log(
      `[Cron:ExpireSubscriptions] Expired ${expired.length} subscription(s):`,
      expired.map((s) => s.tenantId).join(", "),
    );

    return NextResponse.json({
      expired: expired.length,
      tenantIds: expired.map((s) => s.tenantId),
    });
  } catch (error) {
    console.error("[Cron:ExpireSubscriptions] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
