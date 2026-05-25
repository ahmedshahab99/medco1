import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { formatName } from "@/lib/patient-utils";
import { patientCreateSchema } from "@/lib/schemas/patient";

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
}, nextAppt?: { startTime: Date } | null) {
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
    nextAppointment: nextAppt?.startTime?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

async function getNextAppointment(patientId: string, tenantId: string) {
  return prisma.appointment.findFirst({
    where: {
      patientId,
      tenantId,
      startTime: { gte: new Date() },
      status: { in: ["SCHEDULED", "CONFIRMED"] },
    },
    orderBy: { startTime: "asc" },
    select: { startTime: true },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";

  const page = pageParam ? parseInt(pageParam, 10) : undefined;
  const pageSize = pageSizeParam
    ? Math.min(parseInt(pageSizeParam, 10), 100)
    : 10;
  const offset = page ? (page - 1) * pageSize : undefined;

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

  const tokens = search.trim().split(/\s+/).filter(Boolean);

  const statusFilter =
    status === "active" || status === "inactive" ? { status } : {};

  const orderBy =
    sortBy === "name"
      ? { firstName: sortOrder }
      : { createdAt: sortOrder };

  const where: Prisma.PatientWhereInput = {
    tenantId: actor.tenantId,
    ...statusFilter,
    ...(tokens.length > 0
      ? {
          AND: tokens.map((token) => ({
            OR: [
              { firstName: { contains: token, mode: Prisma.QueryMode.insensitive } },
              { lastName: { contains: token, mode: Prisma.QueryMode.insensitive } },
              { phone: { contains: token, mode: Prisma.QueryMode.insensitive } },
            ],
          })),
        }
      : {}),
  };

  if (page) {
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: { cases: true },
        orderBy,
        skip: offset,
        take: pageSize,
      }),
      prisma.patient.count({ where }),
    ]);

    const mapped = await Promise.all(patients.map(async (p) => {
      const nextAppt = await getNextAppointment(p.id, actor!.tenantId!);
      return mapPatient(p, nextAppt);
    }));

    return NextResponse.json({
      data: mapped,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    });
  }

  const patients = await prisma.patient.findMany({
    where,
    include: {
      cases: true,
    },
    orderBy,
    take: search ? 20 : 100,
  });

  const mapped = await Promise.all(patients.map(async (p) => {
    const nextAppt = await getNextAppointment(p.id, actor!.tenantId!);
    return mapPatient(p, nextAppt);
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

  if (actor.role !== "ADMIN" && actor.role !== "DOCTOR") {
    return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = patientCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { firstName, lastName, phone, dateOfBirth, gender, address } = parsed.data;

  const created = await prisma.patient.create({
    data: {
      firstName,
      lastName,
      phone: phone || undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender: gender || undefined,
      address: address || undefined,
      tenantId: actor.tenantId,
    },
    include: {
      cases: true,
    },
  });

  return NextResponse.json(mapPatient(created), { status: 201 });
}
