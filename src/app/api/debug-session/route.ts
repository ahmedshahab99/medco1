import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * DEBUG ONLY — Remove before production.
 * Shows the current user's JWT claims to verify the Custom Access Token Hook.
 *
 * Visit: http://localhost:3000/api/debug-session
 */
export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: "No active session", details: sessionError?.message },
      { status: 401 }
    );
  }

  // Decode the JWT payload (middle part) to see all claims
  const jwtParts = session.access_token.split(".");
  const payload = JSON.parse(
    Buffer.from(jwtParts[1], "base64").toString("utf-8")
  );

  return NextResponse.json({
    message: "JWT Claims — remove this endpoint before production!",
    user_role: payload.user_role ?? "❌ NOT FOUND — is the hook enabled?",
    tenant_id: payload.tenant_id ?? "❌ NOT FOUND — is the hook enabled?",
    all_claims: payload,
  });
}
