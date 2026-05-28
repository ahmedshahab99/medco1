import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const applySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
  expenseIds: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!actor?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (actor.role !== "ADMIN" && actor.role !== "DOCTOR") {
    return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = applySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { month, year, expenseIds } = parsed.data;

  const where: Record<string, unknown> = { tenantId: actor.tenantId, isActive: true };
  if (expenseIds && expenseIds.length > 0) {
    where.id = { in: expenseIds };
  }

  const recurringExpenses = await prisma.recurringExpense.findMany({ where: where as any });

  if (recurringExpenses.length === 0) {
    return NextResponse.json({ error: "لا توجد مصروفات ثابتة نشطة" }, { status: 400 });
  }

  const results: Array<{ id: string; description: string | null; amount: number; action: string }> = [];

  for (const expense of recurringExpenses) {
    const transactionDate = new Date(year, month - 1, expense.dayOfMonth);

    // Find existing transaction for this month by description + category
    const existing = await prisma.transaction.findFirst({
      where: {
        tenantId: actor.tenantId,
        description: expense.description,
        category: expense.category,
        date: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0, 23, 59, 59),
        },
      },
    });

    if (existing) {
      // Update existing transaction with new amount/date
      const updated = await prisma.transaction.update({
        where: { id: existing.id },
        data: { amount: expense.amount, date: transactionDate },
      });
      results.push({ id: updated.id, description: updated.description, amount: Number(updated.amount), action: "updated" });
    } else {
      const tx = await prisma.transaction.create({
        data: {
          tenantId: actor.tenantId,
          type: "EXPENSE",
          category: expense.category,
          amount: expense.amount,
          description: expense.description,
          date: transactionDate,
        },
      });
      results.push({ id: tx.id, description: tx.description, amount: Number(tx.amount), action: "created" });
    }
  }

  return NextResponse.json({
    results,
    count: results.length,
    total: recurringExpenses.length,
  });
}
