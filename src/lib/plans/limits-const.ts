import type { PlanTier } from "@prisma/client";

/**
 * Per-tier limits.
 * `null` means unlimited. Feature levels use a string union where applicable.
 *
 * Mirrors the subscription matrix defined in AGENTS.md:
 *   Starter (Free), Professional (75K/mo), Business (200K/mo), Enterprise (Custom)
 *
 * This file must stay free of server-only imports (prisma, redis) so it
 * can be safely imported by client components (e.g. PlanProvider).
 */
export const PLAN_LIMITS: Record<
  PlanTier,
  {
    maxDoctors: number | null;
    maxPatients: number | null;
    appointmentsPerMonth: number | null;
    whatsappPerMonth: number | null;
    features: {
      patientFiles: boolean;
      financialReports: "none" | "basic" | "advanced";
      analyticsDashboard: "none" | "basic" | "advanced";
    };
  }
> = {
  STARTER: {
    maxDoctors: 1,
    maxPatients: 50,
    appointmentsPerMonth: 50,
    whatsappPerMonth: 0,
    features: {
      patientFiles: false,
      financialReports: "none",
      analyticsDashboard: "none",
    },
  },
  PROFESSIONAL: {
    maxDoctors: 3,
    maxPatients: null,
    appointmentsPerMonth: null,
    whatsappPerMonth: 500,
    features: {
      patientFiles: true,
      financialReports: "advanced",
      analyticsDashboard: "advanced",
    },
  },
  BUSINESS: {
    maxDoctors: 10,
    maxPatients: null,
    appointmentsPerMonth: null,
    whatsappPerMonth: 3000,
    features: {
      patientFiles: true,
      financialReports: "advanced",
      analyticsDashboard: "advanced",
    },
  },
  ENTERPRISE: {
    maxDoctors: null,
    maxPatients: null,
    appointmentsPerMonth: null,
    whatsappPerMonth: null,
    features: {
      patientFiles: true,
      financialReports: "advanced",
      analyticsDashboard: "advanced",
    },
  },
};

export type PlanFeatureKey =
  | "patientFiles"
  | "financialReports"
  | "analyticsDashboard";