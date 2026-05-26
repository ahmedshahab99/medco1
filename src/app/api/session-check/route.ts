import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { redis } from "@/lib/redis";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );
    return payload;
  } catch {
    return null;
  }
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    return NextResponse.json({ revoked: true });
  }

  const payload = decodeJwtPayload(session.access_token);
  const iat = typeof payload?.iat === "number" ? payload.iat : null;

  if (!iat || !redis) {
    return NextResponse.json({ revoked: false });
  }

  const revokedAt = await redis.get(`session:revoked:${session.user.id}`);
  const isRevoked = revokedAt && parseInt(revokedAt as string) > iat * 1000;

  return NextResponse.json({ revoked: Boolean(isRevoked) });
}
