import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { InvoicesClient } from "@/components/dashboard/finance/InvoicesClient";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const actor = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!actor?.tenantId) return null;

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: { tenantId: actor.tenantId, date: { gte: start, lte: end } },
    orderBy: { date: "desc" },
    include: { patient: { select: { id: true, firstName: true, lastName: true } } },
  });

  const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0);

  const patients = await prisma.patient.findMany({
    where: { tenantId: actor.tenantId },
    select: { id: true, firstName: true, lastName: true, consultationFee: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  let recurringExpenses: any[] = [];
  try {
    recurringExpenses = await prisma.recurringExpense.findMany({
      where: { tenantId: actor.tenantId },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("Failed to fetch recurring expenses:", e);
  }

  return (
    <InvoicesClient
      initialTransactions={transactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
        date: t.date.toISOString(),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }))}
      initialSummary={{ totalIncome, totalExpense, net: totalIncome - totalExpense }}
      initialRecurringExpenses={recurringExpenses.map((r) => ({
        ...r,
        amount: Number(r.amount),
      }))}
      patients={patients.map((p) => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`,
        consultationFee: p.consultationFee ? Number(p.consultationFee) : null,
      }))}
      currentMonth={now.getMonth() + 1}
      currentYear={now.getFullYear()}
    />
  );
}
