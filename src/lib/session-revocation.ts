import { redis } from "@/lib/redis";
import { serviceRoleClient } from "@/utils/supabase/service-role";

/** JWT access token lifetime in seconds (must match Supabase config) */
const JWT_EXPIRY_SECONDS = 3600;

/**
 * Revokes all user sessions globally and blacklists their current JWT.
 * Call this AFTER any mutation that changes a user's role or deletes them.
 * The blacklist TTL matches the JWT lifetime so stale tokens die naturally.
 */
export async function revokeUserSessions(userId: string) {
  // 1. Revoke all refresh tokens globally (prevents future token refresh)
  await serviceRoleClient.auth.admin.signOut(userId, "global");

  // 2. Blacklist current JWT for max JWT lifetime.
  //    Value = Unix timestamp (ms) of revocation.
  //    If a user re-logins after this, they get a new JWT with a newer iat.
  await redis.set(`session:revoked:${userId}`, Date.now(), {
    ex: JWT_EXPIRY_SECONDS,
  });
}
