import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { appointmentCreateSchema } from "@/lib/schemas/appointment";
import { formatName } from "@/lib/patient-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

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
    where.startTime = {
      gte: new Date(from),
      lte: new Date(to),
    };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: true,
      doctor: true,
      service: true,
      case: true,
    },
    orderBy: { startTime: "asc" },
  });

  const mapped = appointments.map((appt) => ({
    id: appt.id,
    patientId: appt.patientId,
    patientName: formatName(appt.patient.firstName, appt.patient.lastName),
    patientPhone: appt.patient.phone,
    doctorId: appt.doctorId,
    doctorName: formatName(appt.doctor.firstName, appt.doctor.lastName, appt.doctor.email),
    serviceId: appt.serviceId,
    serviceName: appt.service.name,
    serviceColor: appt.service.color,
    status: appt.status,
    startTime: appt.startTime.toISOString(),
    endTime: appt.endTime.toISOString(),
    notes: appt.notes,
    caseId: appt.caseId,
    caseName: appt.case?.title ?? null,
    createdAt: appt.createdAt.toISOString(),
    updatedAt: appt.updatedAt.toISOString(),
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

  const parseResult = appointmentCreateSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parseResult.error.issues },
      { status: 400 }
    );
  }

  const data = parseResult.data;

  let patientId = data.patientId;

  // ─── WAITLIST CONVERSION (highest priority) ───
  if (data.waitlistId) {
    const entry = await prisma.waitlist.findFirst({
      where: { id: data.waitlistId, tenantId: actor.tenantId },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Waitlist entry not found" },
        { status: 404 }
      );
    }

    patientId = entry.patientId;

    // Remove from waitlist once converted to an appointment
    await prisma.waitlist.deleteMany({
      where: { id: data.waitlistId, tenantId: actor.tenantId },
    });
  }

  // ─── NEW PATIENT CREATION ───
  if (!patientId && data.newPatient) {
    const newPatient = await prisma.patient.create({
      data: {
        tenantId: actor.tenantId,
        firstName: data.newPatient.firstName,
        lastName: data.newPatient.lastName,
        phone: data.newPatient.phone,
      },
    });
    patientId = newPatient.id;
  }

  if (!patientId) {
    return NextResponse.json(
      { error: "Patient is required" },
      { status: 400 }
    );
  }

  // ─── NEW CASE CREATION ───
  let caseId = data.caseId;
  if (!caseId && data.newCase) {
    const newCase = await prisma.case.create({
      data: {
        tenantId: actor.tenantId,
        patientId,
        title: data.newCase.title,
        description: data.newCase.description,
      },
    });
    caseId = newCase.id;
  }

  const appointment = await prisma.appointment.create({
    data: {
      tenantId: actor.tenantId,
      patientId,
      doctorId: data.doctorId,
      serviceId: data.serviceId,
      caseId: caseId ?? undefined,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      notes: data.notes,
      status: "SCHEDULED",
    },
    include: {
      patient: true,
      doctor: true,
      service: true,
      case: true,
    },
  });

  const mapped = {
    id: appointment.id,
    patientId: appointment.patientId,
    patientName: formatName(appointment.patient.firstName, appointment.patient.lastName),
    patientPhone: appointment.patient.phone,
    doctorId: appointment.doctorId,
    doctorName: formatName(appointment.doctor.firstName, appointment.doctor.lastName, appointment.doctor.email),
    serviceId: appointment.serviceId,
    serviceName: appointment.service.name,
    serviceColor: appointment.service.color,
    status: appointment.status,
    startTime: appointment.startTime.toISOString(),
    endTime: appointment.endTime.toISOString(),
    notes: appointment.notes,
    caseId: appointment.caseId,
    caseName: appointment.case?.title ?? null,
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  };

  return NextResponse.json(mapped, { status: 201 });
}
