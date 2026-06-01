import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { waitlistPatchSchema } from "@/lib/schemas/waitlist";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!actor?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (actor.role !== "ADMIN" && actor.role !== "DOCTOR" && actor.role !== "RECEPTIONIST") {
    return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = waitlistPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const entry = await prisma.waitlist.findFirst({ where: { id, tenantId: actor.tenantId } });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.waitlist.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({
    id: updated.id,
    patientId: updated.patientId,
    patientName: "",
    patientPhone: "",
    notes: updated.notes,
    status: updated.status,
    addedAt: updated.createdAt.toISOString(),
  });
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
  if (actor.role !== "ADMIN" && actor.role !== "DOCTOR" && actor.role !== "RECEPTIONIST") {
    return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
  }

  const entry = await prisma.waitlist.findFirst({ where: { id, tenantId: actor.tenantId } });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.waitlist.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
