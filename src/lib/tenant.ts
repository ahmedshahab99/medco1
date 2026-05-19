import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

/**
 * Decodes the JWT claims to extract the tenant_id.
 * This is used server-side to ensure all queries are isolated.
 */
function decodeJwtClaims(accessToken: string | undefined): { tenant_id: string | null } | null {
  if (!accessToken) return null;
  try {
    const jwtParts = accessToken.split(".");
    if (jwtParts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(jwtParts[1], "base64").toString("utf-8"));
    return {
      tenant_id: payload.tenant_id ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Returns the current user's tenant ID from their session JWT.
 * If no session or no tenant ID exists, it redirects to login or setup.
 */
export async function getTenantId(): Promise<string> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    redirect("/login");
  }

  const jwtClaims = decodeJwtClaims(session.access_token);
  
  if (!jwtClaims?.tenant_id) {
    redirect("/setup");
  }

  return jwtClaims.tenant_id;
}

/**
 * Returns the current user ID.
 */
export async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user.id;
}
