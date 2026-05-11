import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { formatName } from "@/lib/patient-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";

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

  const patients = await prisma.patient.findMany({
    where: {
      tenantId: actor.tenantId,
      ...(tokens.length > 0
        ? {
            AND: tokens.map((token) => ({
              OR: [
                { firstName: { contains: token, mode: "insensitive" } },
                { lastName: { contains: token, mode: "insensitive" } },
                { phone: { contains: token, mode: "insensitive" } },
              ],
            })),
          }
        : {}),
    },
    include: {
      cases: true,
    },
    orderBy: { firstName: "asc" },
    take: search ? 20 : 100,
  });

  const mapped = patients.map((p) => ({
    id: p.id,
    name: formatName(p.firstName, p.lastName),
    phone: p.phone,
    email: p.email,
    dateOfBirth: p.dateOfBirth?.toISOString() ?? null,
    gender: p.gender,
    status: p.status,
    cases: p.cases.map((c) => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt.toISOString(),
    })),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return NextResponse.json(mapped);
}
