import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { waitlistCreateSchema } from "@/lib/schemas/waitlist";
import { formatName } from "@/lib/patient-utils";

export async function GET() {
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

  const entries = await prisma.waitlist.findMany({
    where: {
      tenantId: actor.tenantId,
      status: "waiting",
    },
    include: {
      patient: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const mapped = entries.map((entry) => ({
    id: entry.id,
    patientId: entry.patientId,
    patientName: formatName(entry.patient.firstName, entry.patient.lastName),
    patientPhone: entry.patient.phone,
    notes: entry.notes,
    status: entry.status,
    addedAt: entry.createdAt.toISOString(),
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

  const parseResult = waitlistCreateSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parseResult.error.issues },
      { status: 400 }
    );
  }

  const data = parseResult.data;

  let patientId = data.patientId;

  // ─── NEW PATIENT CREATION ───
  if (!patientId && data.newPatient) {
    const newPatient = await prisma.patient.create({
      data: {
        tenantId: actor.tenantId,
        firstName: data.newPatient.firstName,
        lastName: data.newPatient.lastName,
        phone: data.newPatient.phone || null,
        dateOfBirth: data.newPatient.dateOfBirth
          ? new Date(data.newPatient.dateOfBirth)
          : null,
        gender: data.newPatient.gender || null,
        address: data.newPatient.address || null,
      },
    });
    patientId = newPatient.id;
  }

  if (!patientId) {
    return NextResponse.json({ error: "Patient is required" }, { status: 400 });
  }

  // Verify patient belongs to the same tenant
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, tenantId: actor.tenantId },
  });
  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const entry = await prisma.waitlist.create({
    data: {
      tenantId: actor.tenantId,
      patientId,
      notes: data.notes ?? null,
      status: "waiting",
    },
    include: {
      patient: true,
    },
  });

  const mapped = {
    id: entry.id,
    patientId: entry.patientId,
    patientName: formatName(entry.patient.firstName, entry.patient.lastName),
    patientPhone: entry.patient.phone,
    notes: entry.notes,
    status: entry.status,
    addedAt: entry.createdAt.toISOString(),
  };

  return NextResponse.json(mapped, { status: 201 });
}
