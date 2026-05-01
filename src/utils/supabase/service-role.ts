import { createClient } from "@supabase/supabase-js";

/**
 * Supabase service-role client for admin-only operations.
 * Must NEVER be exposed to the browser. Only use in server actions
 * that require auth admin APIs (e.g., signOut a specific user globally).
 */
export const serviceRoleClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
