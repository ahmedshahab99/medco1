import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { appointmentPatchSchema } from "@/lib/schemas/appointment";
import { formatName } from "@/lib/patient-utils";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  if (actor.role !== "ADMIN" && actor.role !== "DOCTOR") {
    return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
  }

  const existing = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!existing || existing.tenantId !== actor.tenantId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parseResult = appointmentPatchSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parseResult.error.issues },
      { status: 400 }
    );
  }

  const data = parseResult.data;

  // If marking as paid, create a transaction
  if (data.paymentStatus === "PAID" && existing.paymentStatus !== "PAID" && existing.consultationFee) {
    await prisma.transaction.create({
      data: {
        tenantId: actor.tenantId,
        type: "INCOME",
        category: "CONSULTATION",
        amount: Number(existing.consultationFee),
        description: "الكشفية",
        date: new Date(),
        patientId: existing.patientId,
      },
    });
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
      ...(data.startTime && { startTime: new Date(data.startTime) }),
      ...(data.endTime && { endTime: new Date(data.endTime) }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.caseId !== undefined && { caseId: data.caseId || null }),
      ...(data.serviceId && { serviceId: data.serviceId }),
      ...(data.doctorId && { doctorId: data.doctorId }),
    },
    include: {
      patient: true,
      doctor: true,
      service: true,
      case: true,
    },
  });

  const mapped = {
    id: updated.id,
    patientId: updated.patientId,
    patientName: formatName(updated.patient.firstName, updated.patient.lastName),
    patientPhone: updated.patient.phone,
    doctorId: updated.doctorId,
    doctorName: formatName(updated.doctor.firstName, updated.doctor.lastName, updated.doctor.email),
    serviceId: updated.serviceId,
    serviceName: updated.service.name,
    serviceColor: updated.service.color,
    status: updated.status,
    startTime: updated.startTime.toISOString(),
    endTime: updated.endTime.toISOString(),
    notes: updated.notes,
    caseId: updated.caseId,
    caseName: updated.case?.title ?? null,
    consultationFee: updated.consultationFee ? Number(updated.consultationFee) : null,
    paymentStatus: updated.paymentStatus,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };

  return NextResponse.json(mapped);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  if (actor.role !== "ADMIN" && actor.role !== "DOCTOR") {
    return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
  }

  const existing = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!existing || existing.tenantId !== actor.tenantId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.appointment.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
