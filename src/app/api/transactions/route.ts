import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.enum([
    "CONSULTATION", "MEDICATIONS", "SERVICES", "CLINIC_RENT",
    "INTERNET", "SALARIES", "UTILITIES", "SUPPLIES",
    "MARKETING", "INSURANCE", "TAXES", "MAINTENANCE", "OTHER",
  ]),
  amount: z.coerce.number().positive(),
  description: z.string().optional(),
  date: z.string(),
  patientId: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!actor?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const pageSizeParam = searchParams.get("pageSize");
  const pageParam = searchParams.get("page");

  const page = pageParam ? parseInt(pageParam, 10) : undefined;
  const pageSize = pageSizeParam ? Math.min(parseInt(pageSizeParam, 10), 100) : undefined;
  const skip = page && pageSize ? (page - 1) * pageSize : undefined;

  const where: Record<string, unknown> = { tenantId: actor.tenantId };

  if (month && year) {
    const start = new Date(parseInt(year), parseInt(month) - 1, 1);
    const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    where.date = { gte: start, lte: end };
  } else if (year && !month) {
    const start = new Date(parseInt(year), 0, 1);
    const end = new Date(parseInt(year), 11, 31, 23, 59, 59);
    where.date = { gte: start, lte: end };
  }

  if (category) where.category = category;
  if (type) where.type = type;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: where as any,
      orderBy: { date: "desc" },
      include: { patient: { select: { id: true, firstName: true, lastName: true } } },
      ...(skip !== undefined && { skip }),
      ...(pageSize !== undefined && { take: pageSize }),
    }),
    prisma.transaction.count({ where: where as any }),
  ]);

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + Number(t.amount), 0);

  return NextResponse.json({
    transactions,
    total,
    summary: { totalIncome, totalExpense, net: totalIncome - totalExpense },
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!actor?.tenantId || (actor.role !== "ADMIN" && actor.role !== "DOCTOR")) {
    return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      ...parsed.data,
      amount: parsed.data.amount,
      date: new Date(parsed.data.date),
      tenantId: actor.tenantId,
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}
