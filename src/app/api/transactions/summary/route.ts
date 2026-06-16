import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!actor?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = actor.tenantId;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const yearParam = searchParams.get("year");
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");

  const now = new Date();
  const year = yearParam ? parseInt(yearParam) : now.getFullYear();

  let start: Date;
  let end: Date;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  const page = pageParam ? parseInt(pageParam) : 1;
  const pageSize = pageSizeParam ? Math.min(parseInt(pageSizeParam), 100) : 50;
  const skip = (page - 1) * pageSize;

  const dateFilter = { gte: start, lte: end };

  const [
    transactions,
    totalTransactions,
    incomeByAppointment,
    recurringExpenses,
  ] = await Promise.all([
    prisma.transaction.findMany({
      where: { tenantId, date: dateFilter },
      orderBy: { date: "desc" },
      skip,
      take: pageSize,
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
    prisma.transaction.count({ where: { tenantId, date: dateFilter } }),
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

  const doctorMap = new Map<string, { doctorId: string; doctorName: string; totalIncome: number; appointmentCount: number }>();
  for (const item of incomeByAppointment) {
    const appt = appointments.find((a) => a.id === item.appointmentId);
    if (!appt?.doctor) continue;
    const dId = appt.doctor.id;
    const existing = doctorMap.get(dId) || {
      doctorId: dId,
      doctorName: `${appt.doctor.firstName || ""} ${appt.doctor.lastName || ""}`.trim() || dId.slice(0, 8),
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

  // Monthly trends (12 months of selected year)
  const monthNames = [
    "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
  ];

  const monthlyTrends: Array<{ month: number; label: string; income: number; expense: number; net: number }> = [];
  for (let m = 1; m <= 12; m++) {
    const mStart = new Date(year, m - 1, 1);
    const mEnd = new Date(year, m, 0, 23, 59, 59, 999);

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
    monthlyTrends.push({ month: m, label: monthNames[m - 1], income, expense, net: income - expense });
  }

  const serialized = transactions.map((t) => ({
    id: t.id,
    type: t.type,
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
                name: `${t.appointment.doctor.firstName || ""} ${t.appointment.doctor.lastName || ""}`.trim() || t.appointment.doctor.id.slice(0, 8),
              }
            : null,
        }
      : null,
  }));

  return NextResponse.json({
    summary: { totalIncome, totalExpense, net: totalIncome - totalExpense },
    incomeByDoctor,
    categoryBreakdown,
    monthlyTrend: monthlyTrends,
    transactions: serialized,
    totalTransactions,
    recurringExpenses: recurringExpenses.map((r) => ({
      id: r.id,
      category: r.category,
      amount: Number(r.amount),
      description: r.description,
      notes: r.notes,
      dayOfMonth: r.dayOfMonth,
      isActive: r.isActive,
    })),
    page,
    pageSize,
  });
}
