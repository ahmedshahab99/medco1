"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Users,
  UserRound,
  Calendar,
  MessageSquare,
  Crown,
  Gauge,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { PLAN_LIMITS } from "@/lib/plans/limits-const";
import type { ActivePlan } from "@/lib/plans/limits";
import type { CurrentUsage } from "@/lib/plans/usage";

const TIER_LABELS: Record<string, string> = {
  STARTER: "ستارتر",
  PROFESSIONAL: "بروفيشنال",
  BUSINESS: "بيزنس",
  ENTERPRISE: "إنتربرايز",
};

const STATUS_LABELS: Record<string, string> = {
  TRIAL: "تجريبي",
  ACTIVE: "نشط",
  PAST_DUE: "متأخر",
  CANCELED: "ملغي",
  EXPIRED: "منتهي",
};

const STATUS_VARIANTS: Record<string, "success" | "warning" | "danger" | "default"> = {
  TRIAL: "default",
  ACTIVE: "success",
  PAST_DUE: "warning",
  CANCELED: "danger",
  EXPIRED: "danger",
};

const FEATURE_LABELS: Record<string, string> = {
  patientFiles: "ملفات المرضى",
  financialReports: "التقارير المالية",
  analyticsDashboard: "لوحة التحليلات",
};

const FEATURE_LEVEL_LABELS: Record<string, string> = {
  none: "غير متوفر",
  basic: "أساسي",
  advanced: "متقدم",
};

interface PlanUsageClientProps {
  plan: ActivePlan;
  usage: CurrentUsage;
  doctorCount: number;
  patientCount: number;
  currentPeriodEnd: Date | null;
}

type UsageBarProps = {
  icon: React.ReactNode;
  label: string;
  used: number;
  max: number | null;
  unlimited?: string;
};

function UsageBar({ icon, label, used, max, unlimited = "غير محدود" }: UsageBarProps) {
  const pct = max ? Math.min((used / max) * 100, 100) : 0;
  const isNearLimit = max ? pct >= 80 : false;
  const isOverLimit = max ? pct >= 100 : false;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          {icon}
          <span>{label}</span>
        </div>
        <span
          className={`text-sm font-semibold tabular-nums ${
            isOverLimit ? "text-red-600" : isNearLimit ? "text-amber-600" : "text-slate-700"
          }`}
        >
          {max !== null ? `${used}/${max}` : unlimited}
        </span>
      </div>
      {max !== null && (
        <Progress
          value={pct}
          className={`h-2 ${isOverLimit ? "bg-red-100 [&>span]:bg-red-500" : isNearLimit ? "bg-amber-100 [&>span]:bg-amber-500" : "bg-slate-100"}`}
        />
      )}
    </div>
  );
}

function PlanBadge({ tier, status }: { tier: string; status: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5">
        <Crown className="size-4 text-violet-600" />
        <span className="text-sm font-bold text-violet-700">
          {TIER_LABELS[tier] ?? tier}
        </span>
      </div>
      <Badge variant={STATUS_VARIANTS[status] ?? "default"}>
        {STATUS_LABELS[status] ?? status}
      </Badge>
    </div>
  );
}

const TIER_ORDER = ["STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"] as const;

function formatLimit(val: number | null): string {
  if (val === null) return "∞";
  return val.toLocaleString("ar-SA");
}

function formatDate(date: Date | null): string {
  if (!date) return "غير محدد";
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function PlanUsageClient({
  plan,
  usage,
  doctorCount,
  patientCount,
  currentPeriodEnd,
}: PlanUsageClientProps) {
  const isInactive = plan.status !== "TRIAL" && plan.status !== "ACTIVE";

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <div className="px-5 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <PlanBadge tier={plan.tier} status={plan.status} />
            <Link
              href="/dashboard/account?tab=billing"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
            >
              ترقية الباقة
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="size-4" />
            <span>تاريخ الانتهاء:</span>
            <span className="font-semibold text-slate-700 tabular-nums">
              {formatDate(currentPeriodEnd)}
            </span>
            {currentPeriodEnd && new Date(currentPeriodEnd) < new Date() && (
              <Badge variant="danger">منتهية</Badge>
            )}
          </div>
          {isInactive && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
              باقتك غير نشطة حاليا. تم تخفيض الحدود الى مستوى ستارتر لحين التجديد.
            </div>
          )}
        </div>
      </Card>

      {/* Usage & Limits */}
      <Card>
        <div className="px-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Gauge className="size-5 text-slate-500" />
            <h2 className="text-base font-bold text-slate-900">الاستخدام والحدود</h2>
          </div>
          <div className="space-y-4">
            <UsageBar
              icon={<Users className="size-4" />}
              label="الأطباء والمستخدمين"
              used={doctorCount}
              max={plan.limits.maxDoctors}
            />
            <UsageBar
              icon={<UserRound className="size-4" />}
              label="المرضى"
              used={patientCount}
              max={plan.limits.maxPatients}
            />
            <UsageBar
              icon={<Calendar className="size-4" />}
              label="المواعيد (شهرياً)"
              used={usage.appointments}
              max={plan.limits.appointmentsPerMonth}
            />
            <UsageBar
              icon={<MessageSquare className="size-4" />}
              label="رسائل واتساب (شهرياً)"
              used={usage.whatsapp}
              max={plan.limits.whatsappPerMonth}
            />
          </div>
          <p className="text-xs text-slate-400">فترة الفوترة الحالية: {usage.periodMonth}</p>
        </div>
      </Card>

      {/* Feature Status */}
      <Card>
        <div className="px-5 flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-900">الميزات المتاحة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(plan.limits.features).map(([key, value]) => {
            const isEnabled =
              typeof value === "boolean" ? value : value !== "none";
            const levelLabel =
              typeof value === "string" ? FEATURE_LEVEL_LABELS[value] ?? value : null;

            return (
              <div
                key={key}
                className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 ${
                  isEnabled
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                {isEnabled ? (
                  <CheckCircle2 className="size-5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <XCircle className="size-5 text-slate-300 flex-shrink-0" />
                )}
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      isEnabled ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {FEATURE_LABELS[key] ?? key}
                  </p>
                  {levelLabel && (
                    <p
                      className={`text-xs ${
                        isEnabled ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {levelLabel}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </Card>

      {/* Plan Comparison */}
      <Card>
        <div className="px-5 flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-900">مقارنة الباقات</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الميزة</TableHead>
              {TIER_ORDER.map((tier) => (
                <TableHead key={tier}>
                  <span
                    className={
                      tier === plan.tier
                        ? "text-violet-700 font-bold"
                        : ""
                    }
                  >
                    {TIER_LABELS[tier]}
                  </span>
                  {tier === plan.tier && (
                    <Badge variant="default" className="me-1 align-middle text-[10px]">
                      الحالية
                    </Badge>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">الأطباء</TableCell>
              {TIER_ORDER.map((tier) => (
                <TableCell key={tier}>
                  {formatLimit(PLAN_LIMITS[tier].maxDoctors)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">المرضى</TableCell>
              {TIER_ORDER.map((tier) => (
                <TableCell key={tier}>
                  {formatLimit(PLAN_LIMITS[tier].maxPatients)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">المواعيد الشهرية</TableCell>
              {TIER_ORDER.map((tier) => (
                <TableCell key={tier}>
                  {formatLimit(PLAN_LIMITS[tier].appointmentsPerMonth)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">واتساب شهرياً</TableCell>
              {TIER_ORDER.map((tier) => (
                <TableCell key={tier}>
                  {formatLimit(PLAN_LIMITS[tier].whatsappPerMonth)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">ملفات المرضى</TableCell>
              {TIER_ORDER.map((tier) => (
                <TableCell key={tier}>
                  {PLAN_LIMITS[tier].features.patientFiles ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <XCircle className="size-4 text-slate-300" />
                  )}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">التقارير المالية</TableCell>
              {TIER_ORDER.map((tier) => (
                <TableCell key={tier}>
                  {FEATURE_LEVEL_LABELS[PLAN_LIMITS[tier].features.financialReports]}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">لوحة التحليلات</TableCell>
              {TIER_ORDER.map((tier) => (
                <TableCell key={tier}>
                  {FEATURE_LEVEL_LABELS[PLAN_LIMITS[tier].features.analyticsDashboard]}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
        </div>
      </Card>
    </div>
  );
}
