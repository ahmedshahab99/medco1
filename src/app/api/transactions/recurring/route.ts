import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createRecurringSchema = z.object({
  category: z.enum([
    "CONSULTATION", "MEDICATIONS", "SERVICES", "CLINIC_RENT",
    "INTERNET", "SALARIES", "UTILITIES", "SUPPLIES",
    "MARKETING", "INSURANCE", "TAXES", "MAINTENANCE", "OTHER",
  ]),
  amount: z.coerce.number().positive(),
  description: z.string().min(1, "الوصف مطلوب"),
  notes: z.string().optional(),
  dayOfMonth: z.coerce.number().int().min(1).max(28).default(1),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!actor?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expenses = await prisma.recurringExpense.findMany({
    where: { tenantId: actor.tenantId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(expenses);
}

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
  const parsed = createRecurringSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const now = new Date();
  const today = now.getDate();
  const useDay = Math.min(parsed.data.dayOfMonth, today);

  const [expense] = await prisma.$transaction([
    prisma.recurringExpense.create({
      data: {
        tenantId: actor.tenantId,
        category: parsed.data.category,
        amount: parsed.data.amount,
        description: parsed.data.description,
        notes: parsed.data.notes,
        dayOfMonth: parsed.data.dayOfMonth,
        isActive: parsed.data.isActive,
      },
    }),
    prisma.transaction.create({
      data: {
        tenantId: actor.tenantId,
        type: "EXPENSE",
        category: parsed.data.category,
        amount: parsed.data.amount,
        description: parsed.data.description || "مصروف ثابت",
        date: new Date(now.getFullYear(), now.getMonth(), useDay),
      },
    }),
  ]);

  return NextResponse.json(expense, { status: 201 });
}
