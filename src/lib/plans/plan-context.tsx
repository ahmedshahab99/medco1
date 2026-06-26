"use client";

import React, { createContext, useContext } from "react";
import type { PlanTier, PlanStatus } from "@prisma/client";
import { PLAN_LIMITS } from "@/lib/plans/limits-const";

/** Serializable shape passed from Server Components to the client. */
export interface PlanInfo {
  tier: PlanTier;
  status: PlanStatus;
  usage: {
    appointments: number;
    whatsapp: number;
    periodMonth: string;
  };
  /** Effective limits for the tier (STARTER values when inactive). */
  limits: (typeof PLAN_LIMITS)[PlanTier];
}

const PlanContext = createContext<PlanInfo | null>(null);

export function PlanProvider({
  plan,
  children,
}: {
  plan: PlanInfo;
  children: React.ReactNode;
}) {
  return <PlanContext.Provider value={plan}>{children}</PlanContext.Provider>;
}

/**
 * Returns the current tenant's plan + usage for client-side feature gating.
 * Returns null if used outside a PlanProvider.
 *
 * Per AGENTS.md: these values are derived from a Server Component DB
 * query and are safe for read-only UI decisions. They MUST NOT be
 * trusted to authorize writes — server actions re-query the DB.
 */
export function usePlan(): PlanInfo | null {
  return useContext(PlanContext);
}