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

  const entry = await prisma.waitlist.findFirst({
    where: { id, tenantId: actor.tenantId },
    include: { patient: true },
  });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { consultationFee, ...patchData } = parsed.data as any;

  const updated = await prisma.waitlist.update({
    where: { id },
    data: patchData,
  });

  // Auto-create Appointment when waitlist entry is completed (for visit history)
  if (patchData.status === "completed") {
    const today = new Date();
    const endTime = new Date(today.getTime() + 30 * 60 * 1000);

    // Find first available doctor + service for the tenant
    const doctor = await prisma.profile.findFirst({
      where: { tenantId: actor.tenantId, role: "DOCTOR" },
    });
    const service = await prisma.service.findFirst({
      where: { tenantId: actor.tenantId, isActive: true },
    });

    // Only create appointment if we have a doctor/service configured
    if (doctor && service) {
      const appointment = await prisma.appointment.create({
        data: {
          tenantId: actor.tenantId,
          patientId: entry.patientId,
          doctorId: doctor.id,
          serviceId: service.id,
          startTime: today,
          endTime,
          status: "COMPLETED",
          notes: entry.notes ? `مباشر - ${entry.notes}` : "مباشر",
          consultationFee: consultationFee ? Number(consultationFee) : undefined,
          paymentStatus: consultationFee ? "PAID" : "PENDING",
        },
      });

      // Create transaction if consultation fee was provided
      if (consultationFee) {
        await prisma.transaction.create({
          data: {
            tenantId: actor.tenantId,
            type: "INCOME",
            category: "CONSULTATION",
            amount: Number(consultationFee),
            description: "الكشفية - مباشر",
            date: today,
            patientId: entry.patientId,
          },
        });
      }
    }
  }

  return NextResponse.json({
    id: updated.id,
    patientId: updated.patientId,
    patientName: entry.patient?.firstName
      ? `${entry.patient.firstName} ${entry.patient.lastName || ""}`.trim()
      : "",
    patientPhone: entry.patient?.phone || "",
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
