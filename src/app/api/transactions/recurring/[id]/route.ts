import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateRecurringSchema = z.object({
  category: z.enum([
    "CONSULTATION", "MEDICATIONS", "SERVICES", "CLINIC_RENT",
    "INTERNET", "SALARIES", "UTILITIES", "SUPPLIES",
    "MARKETING", "INSURANCE", "TAXES", "MAINTENANCE", "OTHER",
  ]).optional(),
  amount: z.coerce.number().positive().optional(),
  description: z.string().min(1).optional(),
  notes: z.string().optional(),
  dayOfMonth: z.coerce.number().int().min(1).max(28).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!actor?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (actor.role !== "ADMIN" && actor.role !== "DOCTOR") {
    return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
  }

  const existing = await prisma.recurringExpense.findFirst({
    where: { id, tenantId: actor.tenantId },
  });
  if (!existing) {
    return NextResponse.json({ error: "المصروف الثابت غير موجود" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateRecurringSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const updated = await prisma.recurringExpense.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!actor?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (actor.role !== "ADMIN" && actor.role !== "DOCTOR") {
    return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
  }

  const existing = await prisma.recurringExpense.findFirst({
    where: { id, tenantId: actor.tenantId },
  });
  if (!existing) {
    return NextResponse.json({ error: "المصروف الثابت غير موجود" }, { status: 404 });
  }

  await prisma.recurringExpense.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
