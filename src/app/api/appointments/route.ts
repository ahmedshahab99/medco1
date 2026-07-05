import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { appointmentCreateSchema } from "@/lib/schemas/appointment";
import { formatName } from "@/lib/patient-utils";
import { enforcePatientLimit, enforceAppointmentQuota } from "@/lib/plans/enforce";
import { incrementAppointments } from "@/lib/plans/usage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");
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
    where: { id: user.id, deletedAt: null },
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

  if (status) {
    where.status = status;
  }

  if (doctorId) {
    where.doctorId = doctorId;
  }

    const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: true,
      doctor: true,
      service: { select: { name: true, color: true, price: true } },
      case: true,
      transactions: { select: { id: true }, take: 1, orderBy: { date: "desc" } },
    },
    orderBy: { startTime: "asc" },
  });

  const mapped = appointments.map((appt: any) => ({
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
    hasTransactions: appt.transactions.length > 0,
    lastTransactionId: appt.transactions[0]?.id ?? null,
    servicePrice: appt.service.price ? Number(appt.service.price) : null,
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
    where: { id: user.id, deletedAt: null },
  });

  if (!actor?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (actor.role !== "ADMIN" && actor.role !== "DOCTOR") {
    return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
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

  // ─── NEW PATIENT CREATION (with duplicate check) ───
  if (!patientId && data.newPatient) {
    // Search for existing patient by phone first
    let existingPatient = null;
    if (data.newPatient.phone) {
      existingPatient = await prisma.patient.findFirst({
        where: { tenantId: actor.tenantId, phone: data.newPatient.phone },
      });
    }
    // Then by full name
    if (!existingPatient && data.newPatient.firstName) {
      const fullName = `${data.newPatient.firstName} ${data.newPatient.lastName || ""}`.trim();
      const patients = await prisma.patient.findMany({
        where: { tenantId: actor.tenantId },
        take: 50,
      });
      existingPatient = patients.find(
        (p) => `${p.firstName} ${p.lastName || ""}`.trim().toLowerCase() === fullName.toLowerCase()
      );
    }

    if (existingPatient) {
      patientId = existingPatient.id;
    } else {
      const guard = await enforcePatientLimit(actor.tenantId, 1);
      if (!guard.allowed) {
        return NextResponse.json({ error: guard.reason }, { status: 402 });
      }
      const newPatient = await prisma.patient.create({
        data: {
          tenantId: actor.tenantId,
          firstName: data.newPatient.firstName,
          lastName: data.newPatient.lastName,
          phone: data.newPatient.phone,
          source: data.newPatient.source,
        },
      });
      patientId = newPatient.id;
    }
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

  // Check against doctor-unavailable blocks
  const blockConflict = await prisma.doctorUnavailable.findFirst({
    where: {
      tenantId: actor.tenantId,
      doctorId: data.doctorId,
      AND: [
        { startTime: { lt: new Date(data.endTime) } },
        { endTime: { gt: new Date(data.startTime) } },
      ],
    },
  });

  if (blockConflict) {
    return NextResponse.json(
      { error: "هذا الوقت غير متاح (محجوز من قبل الطبيب)" },
      { status: 409 }
    );
  }

  const apptGuard = await enforceAppointmentQuota(actor.tenantId);
  if (!apptGuard.allowed) {
    return NextResponse.json({ error: apptGuard.reason }, { status: 402 });
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
      status: data.status ?? "SCHEDULED",
    },
    include: {
      patient: true,
      doctor: true,
      service: { select: { name: true, color: true, price: true } },
      case: true,
      transactions: { select: { id: true }, take: 1, orderBy: { date: "desc" } },
    },
  });

  await incrementAppointments(actor.tenantId);

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
    hasTransactions: appointment.transactions.length > 0,
    lastTransactionId: appointment.transactions[0]?.id ?? null,
    servicePrice: appointment.service.price ? Number(appointment.service.price) : null,
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  };

  return NextResponse.json(mapped, { status: 201 });
}
