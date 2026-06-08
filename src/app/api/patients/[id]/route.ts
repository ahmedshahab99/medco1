import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { formatName } from "@/lib/patient-utils";
import { patientUpdateSchema } from "@/lib/schemas/patient";

export async function GET(
  _request: Request,
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

  const patient = await prisma.patient.findFirst({
    where: { id, tenantId: actor.tenantId },
    include: { cases: true },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const nextAppt = await prisma.appointment.findFirst({
    where: {
      patientId: id, tenantId: actor.tenantId,
      startTime: { gte: new Date() },
      status: { in: ["SCHEDULED", "CONFIRMED"] },
    },
    orderBy: { startTime: "asc" },
    select: { startTime: true },
  });

  // Visit history: past appointments with service + doctor info
  const pastAppointments = await prisma.appointment.findMany({
    where: {
      patientId: id, tenantId: actor.tenantId,
      status: { in: ["COMPLETED"] },
    },
    orderBy: { startTime: "desc" },
    take: 50,
    include: {
      service: { select: { name: true } },
      doctor: { select: { firstName: true, lastName: true } },
    },
  });

  // Payment history
  const transactions = await prisma.transaction.findMany({
    where: { patientId: id, tenantId: actor.tenantId, type: "INCOME" },
    orderBy: { date: "desc" },
    take: 50,
  });

  const totalVisits = await prisma.appointment.count({
    where: { patientId: id, tenantId: actor.tenantId, status: "COMPLETED" },
  });

  return NextResponse.json({
    id: patient.id,
    name: formatName(patient.firstName, patient.lastName),
    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone,
    email: patient.email,
    dateOfBirth: patient.dateOfBirth?.toISOString() ?? null,
    gender: patient.gender,
    status: patient.status,
    address: patient.address,
    cases: patient.cases.map((c) => ({
      id: c.id, title: c.title, createdAt: c.createdAt.toISOString(),
    })),
    nextAppointment: nextAppt?.startTime?.toISOString() ?? null,
    totalVisits,
    visitHistory: pastAppointments.map((a) => ({
      id: a.id,
      date: a.startTime.toISOString(),
      service: a.service?.name ?? "",
      doctor: a.doctor ? formatName(a.doctor.firstName, a.doctor.lastName) : "",
      status: a.status,
    })),
    transactions: transactions.map((t) => ({
      id: t.id,
      amount: t.amount.toString(),
      category: t.category,
      date: t.date.toISOString(),
      description: t.description,
    })),
    createdAt: patient.createdAt.toISOString(),
    updatedAt: patient.updatedAt.toISOString(),
  });
}

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

  const existingPatient = await prisma.patient.findFirst({
    where: {
      id,
      tenantId: actor.tenantId,
    },
  });

  if (!existingPatient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const body = await request.json();
  const validation = patientUpdateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid input", details: validation.error.issues },
      { status: 400 }
    );
  }

  const { firstName, lastName, phone, dateOfBirth, gender, address } =
    validation.data;

  const updatedPatient = await prisma.patient.update({
    where: { id },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(dateOfBirth !== undefined && {
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      }),
      ...(gender !== undefined && { gender }),
      ...(address !== undefined && { address }),
    },
    include: { cases: true },
  });

  return NextResponse.json({
    id: updatedPatient.id,
    name: formatName(updatedPatient.firstName, updatedPatient.lastName),
    phone: updatedPatient.phone,
    email: updatedPatient.email,
    dateOfBirth: updatedPatient.dateOfBirth?.toISOString() ?? null,
    gender: updatedPatient.gender,
    status: updatedPatient.status,
    address: updatedPatient.address,
    cases: updatedPatient.cases.map((c: any) => ({ id: c.id, title: c.title, createdAt: c.createdAt.toISOString() })),
    createdAt: updatedPatient.createdAt.toISOString(),
    updatedAt: updatedPatient.updatedAt.toISOString(),
  });
}

export async function DELETE(
  _request: Request,
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

  const existingPatient = await prisma.patient.findFirst({
    where: {
      id,
      tenantId: actor.tenantId,
    },
  });

  if (!existingPatient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  await prisma.patient.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}