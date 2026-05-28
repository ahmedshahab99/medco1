"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
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
  
  // If JWT has claims, use them directly
  if (jwtClaims?.user_role && jwtClaims?.tenant_id) {
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

  // Fallback: look up profile from database
  if (session.user.id) {
    const profile = await prisma.profile.findUnique({
      where: { id: session.user.id },
    });
    if (profile?.tenantId) {
      return {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName ?? deriveNameFromEmail(profile.email),
        lastName: profile.lastName ?? null,
        role: profile.role,
        tenantId: profile.tenantId,
      };
    }
    // Try by email
    if (session.user.email) {
      const profileByEmail = await prisma.profile.findUnique({
        where: { email: session.user.email },
      });
      if (profileByEmail?.tenantId) {
        return {
          id: profileByEmail.id,
          email: profileByEmail.email,
          firstName: profileByEmail.firstName ?? deriveNameFromEmail(profileByEmail.email),
          lastName: profileByEmail.lastName ?? null,
          role: profileByEmail.role,
          tenantId: profileByEmail.tenantId,
        };
      }
    }
  }

  return null;
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
