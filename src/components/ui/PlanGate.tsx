"use client";

import React from "react";
import { Lock, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePlan } from "@/lib/plans/plan-context";
import type { PlanFeatureKey } from "@/lib/plans/limits-const";

const TIER_LABELS: Record<string, string> = {
  STARTER: "ستارتر",
  PROFESSIONAL: "بروفيشنال",
  BUSINESS: "بيزنس",
  ENTERPRISE: "إنتربرايز",
};

type FeatureLevelKey = "financialReports" | "analyticsDashboard";

type PlanGateProps = {
  children: React.ReactNode;
  featureKey?: PlanFeatureKey;
  featureLevel?: {
    key: FeatureLevelKey;
    min: "basic" | "advanced";
  };
  condition?: (plan: NonNullable<ReturnType<typeof usePlan>>) => boolean;
  fallback?: React.ReactNode;
};

export function PlanGate({
  children,
  featureKey,
  featureLevel,
  condition,
  fallback,
}: PlanGateProps) {
  const plan = usePlan();

  if (!plan) return <>{children}</>;

  let allowed = true;

  if (featureKey) {
    const value = plan.limits.features[featureKey];
    if (typeof value === "boolean") {
      allowed = value;
    } else {
      allowed = value !== "none";
    }
  }

  if (featureLevel) {
    const order: Record<string, number> = { none: 0, basic: 1, advanced: 2 };
    const current = plan.limits.features[featureLevel.key];
    if (order[current] < order[featureLevel.min]) {
      allowed = false;
    }
  }

  if (condition) {
    allowed = condition(plan);
  }

  if (!allowed) {
    return <>{fallback ?? <PlanUpgradePlaceholder tier={plan.tier} />}</>;
  }

  return <>{children}</>;
}

function PlanUpgradePlaceholder({ tier }: { tier: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 px-6 rounded-xl border border-amber-200 bg-amber-50/50">
      <div className="flex items-center justify-center size-14 rounded-2xl bg-amber-100">
        <Lock className="size-6 text-amber-600" />
      </div>
      <div className="text-center">
        <p className="text-base font-bold text-amber-800">
          هذه الميزة غير متوفرة في باقتك الحالية
        </p>
        <p className="mt-1 text-sm text-amber-600">
          باقتك الحالية: {TIER_LABELS[tier] ?? tier}. قم بالترقية للوصول لهذه الميزة.
        </p>
      </div>
      <Link
        href="/dashboard/account?tab=billing"
        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
      >
        ترقية الباقة
        <ArrowUpRight className="size-3.5" />
      </Link>
    </div>
  );
}

export { TIER_LABELS };
