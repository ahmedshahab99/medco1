import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getActivePlan } from "@/lib/plans/limits";
import { getCurrentUsage } from "@/lib/plans/usage";
import prisma from "@/lib/prisma";
import { PlanUsageClient } from "./plan-usage-client";
import { BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PlanUsagePage() {
  const admin = await requireRole(["ADMIN"]);

  if (!admin.tenantId) {
    redirect("/setup");
  }

  const [plan, usage, doctorCount, patientCount, subscription] = await Promise.all([
    getActivePlan(admin.tenantId),
    getCurrentUsage(admin.tenantId),
    prisma.profile.count({
      where: { tenantId: admin.tenantId, role: { in: ["DOCTOR", "ADMIN"] } },
    }),
    prisma.patient.count({ where: { tenantId: admin.tenantId } }),
    prisma.subscription.findUnique({
      where: { tenantId: admin.tenantId },
      select: { currentPeriodEnd: true },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الباقة والاستخدام</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            تفاصيل باقتك الحالية، الاستخدام الشهري، والحدود المتاحة.
          </p>
        </div>
      </div>

      <PlanUsageClient
        plan={plan}
        usage={usage}
        doctorCount={doctorCount}
        patientCount={patientCount}
        currentPeriodEnd={subscription?.currentPeriodEnd ?? null}
      />
    </div>
  );
}
