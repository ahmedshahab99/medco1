"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import type { AuthProfile, UserRole } from "@/lib/types/auth";
import { isRoleAllowed } from "@/lib/types/auth";

/**
 * Fetches the currently authenticated user's profile from the database.
 * Returns null if no user is authenticated or if no profile exists.
 *
 * Uses Supabase getUser() (server-validated, not JWT-only) for security,
 * then fetches the full profile from Prisma.
 */
export async function getCurrentProfile(): Promise<AuthProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      tenantId: true,
    },
  });

  if (!profile) {
    return null;
  }

  return profile as AuthProfile;
}

/**
 * Ensures the current user is authenticated.
 * Redirects to /login if not authenticated.
 *
 * @returns The authenticated user's profile
 */
export async function requireAuth(): Promise<AuthProfile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}

/**
 * Ensures the current user has one of the specified roles.
 * Redirects to /login if not authenticated, or /unauthorized if role doesn't match.
 *
 * Use this in Server Components and Server Actions to guard access:
 * ```ts
 * const profile = await requireRole(["ADMIN"]);
 * // Only ADMINs reach this point
 * ```
 *
 * @param allowedRoles - Array of roles that are permitted to access the resource
 * @returns The authenticated user's profile (guaranteed to have an allowed role)
 */
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<AuthProfile> {
  const profile = await requireAuth();

  if (!isRoleAllowed(profile.role, allowedRoles)) {
    redirect("/unauthorized");
  }

  return profile;
}

/**
 * Non-redirecting role check — useful for conditional rendering in Server Components.
 * Returns the profile if authenticated and authorized, null otherwise.
 *
 * @param allowedRoles - Array of roles that are permitted
 * @returns The profile if authorized, null otherwise
 */
export async function checkRole(
  allowedRoles: UserRole[]
): Promise<AuthProfile | null> {
  const profile = await getCurrentProfile();

  if (!profile || !isRoleAllowed(profile.role, allowedRoles)) {
    return null;
  }

  return profile;
}
