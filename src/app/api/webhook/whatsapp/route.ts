import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log(
      "[WhatsApp Webhook] Event received:",
      JSON.stringify(body, null, 2)
    );

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("[WhatsApp Webhook] Failed to parse body:", error);
    return NextResponse.json({ status: "error" }, { status: 400 });
  }
}
