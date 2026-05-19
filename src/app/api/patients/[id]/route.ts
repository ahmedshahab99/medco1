import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { formatName } from "@/lib/patient-utils";
import { patientUpdateSchema } from "@/lib/schemas/patient";

function mapPatient(p: {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  dateOfBirth: Date | null;
  gender: "MALE" | "FEMALE" | null;
  status: string;
  address: string | null;
  cases: { id: string; title: string; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: p.id,
    name: formatName(p.firstName, p.lastName),
    phone: p.phone,
    email: p.email,
    dateOfBirth: p.dateOfBirth?.toISOString() ?? null,
    gender: p.gender,
    status: p.status,
    address: p.address,
    cases: p.cases.map((c) => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt.toISOString(),
    })),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

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
    where: {
      id,
      tenantId: actor.tenantId,
    },
    include: { cases: true },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  return NextResponse.json(mapPatient(patient));
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

  return NextResponse.json(mapPatient(updatedPatient));
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