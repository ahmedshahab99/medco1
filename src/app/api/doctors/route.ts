import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
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

  const doctors = await prisma.profile.findMany({
    where: {
      tenantId: actor.tenantId,
      role: { in: ["DOCTOR", "ADMIN"] },
    },
    orderBy: { firstName: "asc" },
  });

  const mapped = doctors.map((d) => ({
    id: d.id,
    name: formatName(d.firstName, d.lastName, d.email),
    email: d.email,
    role: d.role,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));

  return NextResponse.json(mapped);
}
