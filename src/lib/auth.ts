"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import type { AuthProfile, UserRole, JwtCustomClaims } from "@/lib/types/auth";
import { isRoleAllowed } from "@/lib/types/auth";

function decodeJwtClaims(accessToken: string | undefined): JwtCustomClaims | null {
  if (!accessToken) return null;
  try {
    const jwtParts = accessToken.split(".");
    if (jwtParts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(jwtParts[1], "base64").toString("utf-8"));
    return {
      user_role: payload.user_role ?? null,
      tenant_id: payload.tenant_id ?? null,
    };
  } catch {
    return null;
  }
}

function deriveNameFromEmail(email: string): string {
  return email.split("@")[0];
}

export async function getAuthState(): Promise<AuthProfile | null> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) return null;

  const jwtClaims = decodeJwtClaims(session.access_token);
  if (!jwtClaims?.user_role || !jwtClaims?.tenant_id) return null;

  const email = session.user.email ?? "";

  return {
    id: session.user.id,
    email,
    firstName: deriveNameFromEmail(email),
    lastName: null,
    role: jwtClaims.user_role,
    tenantId: jwtClaims.tenant_id,
  };
}

export async function requireAuth(): Promise<AuthProfile> {
  const profile = await getAuthState();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthProfile> {
  const profile = await requireAuth();
  if (!isRoleAllowed(profile.role, allowedRoles)) redirect("/unauthorized");
  return profile;
}

export async function checkRole(allowedRoles: UserRole[]): Promise<AuthProfile | null> {
  const profile = await getAuthState();
  if (!profile || !isRoleAllowed(profile.role, allowedRoles)) return null;
  return profile;
}
