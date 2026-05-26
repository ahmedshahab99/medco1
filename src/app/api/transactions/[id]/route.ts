import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.enum([
    "CONSULTATION", "MEDICATIONS", "SERVICES", "CLINIC_RENT",
    "INTERNET", "SALARIES", "UTILITIES", "SUPPLIES",
    "MARKETING", "INSURANCE", "TAXES", "MAINTENANCE", "OTHER",
  ]).optional(),
  amount: z.coerce.number().positive().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  patientId: z.string().nullable().optional(),
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

  const existing = await prisma.transaction.findFirst({
    where: { id, tenantId: actor.tenantId },
  });
  if (!existing) {
    return NextResponse.json({ error: "المعاملة غير موجودة" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      ...(parsed.data.type !== undefined && { type: parsed.data.type }),
      ...(parsed.data.category !== undefined && { category: parsed.data.category }),
      ...(parsed.data.amount !== undefined && { amount: parsed.data.amount }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      ...(parsed.data.date !== undefined && { date: new Date(parsed.data.date) }),
      ...(parsed.data.patientId !== undefined && { patientId: parsed.data.patientId }),
    },
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

  const existing = await prisma.transaction.findFirst({
    where: { id, tenantId: actor.tenantId },
  });
  if (!existing) {
    return NextResponse.json({ error: "المعاملة غير موجودة" }, { status: 404 });
  }

  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
