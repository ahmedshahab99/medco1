import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { FinancePage } from "@/components/dashboard/finance/FinancePage";
import { getActivePlan } from "@/lib/plans/limits";
import { Lock, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const TIER_LABELS: Record<string, string> = {
  STARTER: "ستارتر",
  PROFESSIONAL: "بروفيشنال",
  BUSINESS: "بيزنس",
  ENTERPRISE: "إنتربرايز",
};

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const actor = await prisma.profile.findUnique({ where: { id: user.id, deletedAt: null } });
  if (!actor?.tenantId) return null;

  const tenantId = actor.tenantId;

  const plan = await getActivePlan(tenantId);
  if (plan.limits.features.financialReports === "none") {
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

  const [
    transactions,
    incomeByAppointment,
    recurringExpenses,
  ] = await Promise.all([
    prisma.transaction.findMany({
      where: { tenantId, date: dateFilter },
      orderBy: { date: "desc" },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        appointment: {
          select: {
            id: true,
            doctor: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    }),
    prisma.transaction.groupBy({
      by: ["appointmentId"],
      where: {
        tenantId,
        type: "INCOME",
        appointmentId: { not: null },
        date: dateFilter,
      },
      _sum: { amount: true },
    }),
    prisma.recurringExpense.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + Number(t.amount), 0);

  // Category breakdown
  const categoryMap = new Map<string, { income: number; expense: number }>();
  for (const t of transactions) {
    const existing = categoryMap.get(t.category) || { income: 0, expense: 0 };
    if (t.type === "INCOME") existing.income += Number(t.amount);
    else existing.expense += Number(t.amount);
    categoryMap.set(t.category, existing);
  }
  const categoryBreakdown = Array.from(categoryMap.entries()).map(
    ([category, values]) => ({ category, ...values })
  );

  // Income by doctor
  const appointmentIds = incomeByAppointment
    .filter((x) => x.appointmentId)
    .map((x) => x.appointmentId!);

  const appointments = appointmentIds.length > 0
    ? await prisma.appointment.findMany({
        where: { id: { in: appointmentIds } },
        select: {
          id: true,
          doctor: { select: { id: true, firstName: true, lastName: true } },
        },
      })
    : [];

  const doctorMap = new Map<string, {
    doctorId: string;
    doctorName: string;
    totalIncome: number;
    appointmentCount: number;
  }>();

  for (const item of incomeByAppointment) {
    const appt = appointments.find((a) => a.id === item.appointmentId);
    if (!appt?.doctor) continue;
    const dId = appt.doctor.id;
    const existing = doctorMap.get(dId) || {
      doctorId: dId,
      doctorName:
        `${appt.doctor.firstName || ""} ${appt.doctor.lastName || ""}`.trim() ||
        dId.slice(0, 8),
      totalIncome: 0,
      appointmentCount: 0,
    };
    existing.totalIncome += Number(item._sum.amount ?? 0);
    existing.appointmentCount += 1;
    doctorMap.set(dId, existing);
  }

  const incomeByDoctor = Array.from(doctorMap.values()).sort(
    (a, b) => b.totalIncome - a.totalIncome
  );

  // Monthly trends (12 months)
  const monthNames = [
    "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
  ];

  const monthlyTrend = [];
  for (let m = 1; m <= 12; m++) {
    const mStart = new Date(currentYear, m - 1, 1);
    const mEnd = new Date(currentYear, m, 0, 23, 59, 59, 999);

    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { tenantId, type: "INCOME", date: { gte: mStart, lte: mEnd } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { tenantId, type: "EXPENSE", date: { gte: mStart, lte: mEnd } },
        _sum: { amount: true },
      }),
    ]);

    const income = Number(incomeAgg._sum.amount ?? 0);
    const expense = Number(expenseAgg._sum.amount ?? 0);
    monthlyTrend.push({
      month: m,
      label: monthNames[m - 1],
      income,
      expense,
      net: income - expense,
    });
  }

  const serializedTransactions = transactions.map((t) => ({
    id: t.id,
    type: t.type as "INCOME" | "EXPENSE",
    category: t.category,
    amount: Number(t.amount),
    description: t.description,
    date: t.date.toISOString(),
    patientId: t.patientId,
    patient: t.patient
      ? { name: `${t.patient.firstName} ${t.patient.lastName}` }
      : null,
    appointment: t.appointment
      ? {
          id: t.appointment.id,
          doctor: t.appointment.doctor
            ? {
                id: t.appointment.doctor.id,
                name:
                  `${t.appointment.doctor.firstName || ""} ${t.appointment.doctor.lastName || ""}`.trim() ||
                  t.appointment.doctor.id.slice(0, 8),
              }
            : null,
        }
      : null,
  }));

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">الإدارة المالية</h1>
        <p className="text-sm text-muted-foreground mt-1">
          الفواتير، المصروفات، والإيرادات
        </p>
      </div>
      <FinancePage
        initialData={{
          summary: { totalIncome, totalExpense, net: totalIncome - totalExpense },
          incomeByDoctor,
          categoryBreakdown,
          monthlyTrend,
          transactions: serializedTransactions,
          recurringExpenses: recurringExpenses.map((r) => ({
            id: r.id,
            category: r.category,
            amount: Number(r.amount),
            description: r.description,
            notes: r.notes,
            dayOfMonth: r.dayOfMonth,
            isActive: r.isActive,
          })),
        }}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />
    </div>
  );
}
