import prisma from "@/lib/prisma";
import type { PlanTier, PlanStatus, Subscription } from "@prisma/client";
import { PLAN_LIMITS } from "./limits-const";

export { PLAN_LIMITS, type PlanFeatureKey } from "./limits-const";

/**
 * Active/in-billing statuses. Anything else (PAST_DUE/CANCELED/EXPIRED)
 * degrades the tenant to STARTER with features disabled.
 */
const ACTIVE_STATUSES: ReadonlySet<PlanStatus> = new Set(["TRIAL", "ACTIVE"]);

export interface ActivePlan {
  tier: PlanTier;
  status: PlanStatus;
  /** Effective limits — STARTER-equivalent when subscription is inactive. */
  limits: (typeof PLAN_LIMITS)[PlanTier];
}

/**
 * Re-queries the Subscription table for the tenant.
 *
 * Per AGENTS.md auth boundary: the JWT is NOT trusted for write
 * authorization. Always fetch fresh from the DB.
 *
 * Tenants with no subscription record, or a canceled/expired one,
 * fall back to STARTER limits with features disabled.
 */
export async function getActivePlan(tenantId: string): Promise<ActivePlan> {
  const sub = await prisma.subscription.findUnique({
    where: { tenantId },
    select: { tier: true, status: true },
  });

  if (!sub) {
    return { tier: "STARTER", status: "TRIAL", limits: PLAN_LIMITS.STARTER };
  }

  const active = ACTIVE_STATUSES.has(sub.status);

  if (!active) {
    return { tier: sub.tier, status: sub.status, limits: PLAN_LIMITS.STARTER };
  }

  return { tier: sub.tier, status: sub.status, limits: PLAN_LIMITS[sub.tier] };
}

/**
 * Returns the effective plan for a tenant without a fresh DB round-trip.
 * Use only for read-only UI decisions where staleness is acceptable
 * — never for authorizing writes.
 */
export function planFromSubscription(sub: Pick<Subscription, "tier" | "status">): ActivePlan {
  const active = ACTIVE_STATUSES.has(sub.status);
  if (!active) {
    return { tier: sub.tier, status: sub.status, limits: PLAN_LIMITS.STARTER };
  }
  return { tier: sub.tier, status: sub.status, limits: PLAN_LIMITS[sub.tier] };
}