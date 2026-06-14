import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

const createBlockSchema = z.object({
  doctorId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  reason: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const doctorId = searchParams.get("doctorId");

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const actor = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!actor?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where: Record<string, unknown> = { tenantId: actor.tenantId };

  if (from && to) {
    where.startTime = { gte: new Date(from), lte: new Date(to) };
  }

  if (doctorId) {
    where.doctorId = doctorId;
  }

  const blocks = await prisma.doctorUnavailable.findMany({
    where,
    include: {
      doctor: { select: { firstName: true, lastName: true } },
    },
    orderBy: { startTime: "asc" },
  });

  const mapped = blocks.map((block) => ({
    id: block.id,
    doctorId: block.doctorId,
    doctorName: [block.doctor.firstName, block.doctor.lastName]
      .filter(Boolean)
      .join(" ") || null,
    startTime: block.startTime.toISOString(),
    endTime: block.endTime.toISOString(),
    reason: block.reason,
  }));

  return NextResponse.json(mapped);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const actor = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!actor?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createBlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Doctor can only block their own time; admin/receptionist can block any doctor
  if (actor.role === "DOCTOR" && data.doctorId !== actor.id) {
    return NextResponse.json(
      { error: "لا يمكنك حجز وقت لطبيب آخر" },
      { status: 403 }
    );
  }

  if (actor.role !== "ADMIN" && actor.role !== "DOCTOR" && actor.role !== "RECEPTIONIST") {
    return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
  }

  // Verify the doctor belongs to this tenant
  const doctor = await prisma.profile.findFirst({
    where: {
      id: data.doctorId,
      tenantId: actor.tenantId,
      role: { in: ["DOCTOR", "ADMIN"] },
    },
  });

  if (!doctor) {
    return NextResponse.json(
      { error: "الطبيب غير موجود في هذه العيادة" },
      { status: 400 }
    );
  }

  const block = await prisma.doctorUnavailable.create({
    data: {
      tenantId: actor.tenantId,
      doctorId: data.doctorId,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      reason: data.reason || null,
    },
    include: {
      doctor: { select: { firstName: true, lastName: true } },
    },
  });

  const mapped = {
    id: block.id,
    doctorId: block.doctorId,
    doctorName: [block.doctor.firstName, block.doctor.lastName]
      .filter(Boolean)
      .join(" ") || null,
    startTime: block.startTime.toISOString(),
    endTime: block.endTime.toISOString(),
    reason: block.reason,
  };

  return NextResponse.json(mapped, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const actor = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!actor?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.doctorUnavailable.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  if (existing.tenantId !== actor.tenantId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (actor.role !== "ADMIN" && actor.role !== "DOCTOR" && actor.role !== "RECEPTIONIST") {
    return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
  }

  // Doctor can only delete their own blocks; admin/receptionist can delete any
  if (actor.role === "DOCTOR" && existing.doctorId !== actor.id) {
    return NextResponse.json(
      { error: "لا يمكنك حذف حجز لطبيب آخر" },
      { status: 403 }
    );
  }

  await prisma.doctorUnavailable.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
