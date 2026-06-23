import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { MessageStatus } from "@prisma/client";

const STATUS_MAP: Record<string, MessageStatus> = {
  sent: "SENT",
  delivered: "DELIVERED",
  read: "READ",
  failed: "FAILED",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === expectedToken && challenge) {
    console.log("[WhatsApp Webhook] Verified successfully");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("[WhatsApp Webhook] Verification failed", { mode, token });
  return new NextResponse("Verification failed", { status: 403 });
}

interface StatusEntry {
  id: string;
  status: string;
  timestamp: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log(
      "[WhatsApp Webhook] Event received:",
      JSON.stringify(body, null, 2)
    );

    const entries = body?.entry;
    if (!Array.isArray(entries)) {
      return NextResponse.json({ status: "ok" }, { status: 200 });
    }

    for (const entry of entries) {
      const changes = entry?.changes;
      if (!Array.isArray(changes)) continue;

      for (const change of changes) {
        const statuses: StatusEntry[] | undefined =
          change?.value?.statuses;
        if (!Array.isArray(statuses)) continue;

        for (const s of statuses) {
          const externalId = s.id;
          const status = STATUS_MAP[s.status?.toLowerCase()];
          const timestamp = s.timestamp
            ? new Date(Number(s.timestamp) * 1000)
            : new Date();

          if (!externalId || !status) continue;

          const updateData: Record<string, unknown> = { status };

          if (status === "SENT") {
            updateData.sentAt = timestamp;
          } else if (status === "DELIVERED") {
            updateData.deliveredAt = timestamp;
          } else if (status === "READ") {
            updateData.readAt = timestamp;
          }

          try {
            await prisma.messageLog.updateMany({
              where: { externalId },
              data: updateData,
            });
          } catch (err) {
            console.error(
              `[WhatsApp Webhook] Failed to update MessageLog for ${externalId}:`,
              err
            );
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("[WhatsApp Webhook] Failed to parse body:", error);
    return NextResponse.json({ status: "error" }, { status: 400 });
  }
}
