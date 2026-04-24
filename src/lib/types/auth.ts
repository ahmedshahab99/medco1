/**
 * RBAC type definitions and role constants for the clinic management system.
 * Mirrors the UserRole enum defined in prisma/schema.prisma.
 */

/** Available user roles in the system */
export type UserRole = "ADMIN" | "DOCTOR" | "RECEPTIONIST";

/** All valid user roles as an array — useful for validation */
export const USER_ROLES: readonly UserRole[] = [
  "ADMIN",
  "DOCTOR",
  "RECEPTIONIST",
] as const;

/**
 * Numeric hierarchy for role comparison.
 * Higher number = more privileges.
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 3,
  DOCTOR: 2,
  RECEPTIONIST: 1,
};

/** Shape of JWT custom claims injected by the Custom Access Token Hook */
export interface JwtCustomClaims {
  user_role: UserRole | null;
  tenant_id: string | null;
}

/**
 * Authenticated user profile returned by getCurrentProfile().
 * Subset of the Prisma Profile model, focused on auth-relevant fields.
 */
export interface AuthProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  tenantId: string | null;
}

/**
 * Route-to-roles mapping for middleware-level enforcement.
 * Each key is a route prefix; the value is the list of roles allowed to access it.
 */
export const ROUTE_ROLE_MAP: Record<string, UserRole[]> = {
  "/admin": ["ADMIN"],
  "/hr": ["ADMIN"],
  "/doctor": ["ADMIN", "DOCTOR"],
  "/dashboard": ["ADMIN", "DOCTOR", "RECEPTIONIST"],
};

/**
 * Checks whether a given role has at least the required privilege level.
 * @param userRole - The role to check
 * @param minimumRole - The minimum required role
 * @returns true if userRole >= minimumRole in the hierarchy
 */
export function hasMinimumRole(
  userRole: UserRole,
  minimumRole: UserRole
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

/**
 * Checks whether a role is included in a list of allowed roles.
 * @param userRole - The user's current role
 * @param allowedRoles - Array of roles that are permitted
 * @returns true if the user's role is in the allowed list
 */
export function isRoleAllowed(
  userRole: UserRole,
  allowedRoles: UserRole[]
): boolean {
  return allowedRoles.includes(userRole);
}
