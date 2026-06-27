import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { AnalyticsPage } from "@/components/dashboard/analytics/AnalyticsPage";
import type { AppointmentStatus } from "@/lib/types/appointments";
import { getActivePlan } from "@/lib/plans/limits";
import { Lock, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const TIER_LABELS: Record<string, string> = {
  STARTER: "ستارتر",
  PROFESSIONAL: "بروفيشنال",
  BUSINESS: "بيزنس",
  ENTERPRISE: "إنتربرايز",
};

const monthNames = [
  "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export default async function AnalyticsPageRoute() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const actor = await prisma.profile.findUnique({ where: { id: user.id, deletedAt: null } });
  if (!actor?.tenantId) return null;

  const tenantId = actor.tenantId;

  const plan = await getActivePlan(tenantId);
  if (plan.limits.features.analyticsDashboard === "none") {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="flex items-center justify-center size-14 rounded-2xl bg-amber-100">
          <Lock className="size-6 text-amber-600" />
        </div>
        <div className="text-center mt-4">
          <p className="text-base font-bold text-amber-800">
            هذه الميزة غير متوفرة في باقتك الحالية
          </p>
          <p className="mt-1 text-sm text-amber-600">
            باقتك الحالية: {TIER_LABELS[plan.tier] ?? plan.tier}. قم بالترقية للوصول لهذه الميزة.
          </p>
        </div>
        <Link
          href="/dashboard/account?tab=billing"
          className="inline-flex items-center gap-1.5 mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
        >
          ترقية الباقة
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    );
  }
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const start = new Date(currentYear, currentMonth - 1, 1);
  const end = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
  const dateFilter = { gte: start, lte: end };

  const [appointments, byDoctorRaw, newPatients] = await Promise.all([
    prisma.appointment.findMany({
      where: { tenantId, startTime: dateFilter },
      orderBy: { startTime: "desc" },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, gender: true } },
        doctor: { select: { id: true, firstName: true, lastName: true } },
        service: { select: { name: true } },
      },
    }),
    prisma.appointment.groupBy({
      by: ["doctorId"],
      where: { tenantId, startTime: dateFilter },
      _count: { _all: true },
    }),
    prisma.patient.count({
      where: { tenantId, createdAt: dateFilter },
    }),
  ]);

  const totalAppointments = appointments.length;
  const completed = appointments.filter((a) => a.status === "COMPLETED").length;
  const cancelledNoShow = appointments.filter(
    (a) => a.status === "CANCELLED" || a.status === "NO_SHOW"
  ).length;

  // Status breakdown
  const statusMap = new Map<AppointmentStatus, number>();
  for (const a of appointments) {
    statusMap.set(a.status, (statusMap.get(a.status) ?? 0) + 1);
  }
  const statusBreakdown = Array.from(statusMap.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  // Gender breakdown of patients seen in period
  const genderMap = new Map<string, number>();
  for (const a of appointments) {
    const g = a.patient?.gender ?? "UNKNOWN";
    genderMap.set(g, (genderMap.get(g) ?? 0) + 1);
  }
  const genderBreakdown = Array.from(genderMap.entries())
    .map(([gender, count]) => ({ gender, count }))
    .sort((a, b) => b.count - a.count);

  // By doctor
  const doctorIds = byDoctorRaw.map((d) => d.doctorId);
  const doctors = doctorIds.length > 0
    ? await prisma.profile.findMany({
        where: { id: { in: doctorIds } },
        select: { id: true, firstName: true, lastName: true },
      })
    : [];

  const doctorNameMap = new Map<string, string>();
  for (const d of doctors) {
    doctorNameMap.set(
      d.id,
      `${d.firstName || ""} ${d.lastName || ""}`.trim() || d.id.slice(0, 8)
    );
  }

  const completedByDoctorMap = new Map<string, number>();
  for (const a of appointments) {
    if (a.status === "COMPLETED") {
      completedByDoctorMap.set(a.doctorId, (completedByDoctorMap.get(a.doctorId) ?? 0) + 1);
    }
  }

  const byDoctor = byDoctorRaw
    .map((d) => ({
      doctorId: d.doctorId,
      doctorName: doctorNameMap.get(d.doctorId) ?? d.doctorId.slice(0, 8),
      totalAppointments: d._count._all,
      completedCount: completedByDoctorMap.get(d.doctorId) ?? 0,
    }))
    .sort((a, b) => b.totalAppointments - a.totalAppointments);

  // Monthly trend (12 months of selected year)
  const monthlyTrend: Array<{
    month: number;
    label: string;
    appointments: number;
    completed: number;
    newPatients: number;
  }> = [];
  for (let m = 1; m <= 12; m++) {
    const mStart = new Date(currentYear, m - 1, 1);
    const mEnd = new Date(currentYear, m, 0, 23, 59, 59, 999);

    const [apptAgg, completedAgg, newPatiAgg] = await Promise.all([
      prisma.appointment.count({
        where: { tenantId, startTime: { gte: mStart, lte: mEnd } },
      }),
      prisma.appointment.count({
        where: { tenantId, status: "COMPLETED", startTime: { gte: mStart, lte: mEnd } },
      }),
      prisma.patient.count({
        where: { tenantId, createdAt: { gte: mStart, lte: mEnd } },
      }),
    ]);

    monthlyTrend.push({
      month: m,
      label: monthNames[m - 1],
      appointments: apptAgg,
      completed: completedAgg,
      newPatients: newPatiAgg,
    });
  }

  const serializedAppointments = appointments.map((a) => ({
    id: a.id,
    status: a.status,
    startTime: a.startTime.toISOString(),
    endTime: a.endTime.toISOString(),
    patient: a.patient
      ? {
          id: a.patient.id,
          name: `${a.patient.firstName} ${a.patient.lastName}`,
        }
      : null,
    doctor: a.doctor
      ? {
          id: a.doctor.id,
          name:
            `${a.doctor.firstName || ""} ${a.doctor.lastName || ""}`.trim() ||
            a.doctor.id.slice(0, 8),
        }
      : null,
    service: a.service ? { name: a.service.name } : null,
  }));

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">تحليلات المواعيد والمرضى</h1>
        <p className="text-sm text-muted-foreground mt-1">
          إحصاءات المواعيد، أداء الأطباء، وديموغرافيا المرضى
        </p>
      </div>
      <AnalyticsPage
        initialData={{
          summary: { totalAppointments, completed, cancelledNoShow, newPatients },
          appointments: serializedAppointments,
          byDoctor,
          statusBreakdown,
          genderBreakdown,
          monthlyTrend,
        }}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />
    </div>
  );
}
