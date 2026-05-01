import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { serviceCreateSchema } from "@/lib/schemas/service";

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

  const services = await prisma.service.findMany({
    where: {
      tenantId: actor.tenantId,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(services);
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

  // Re-query Profile from DB for authorization
  const actor = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!actor?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (actor.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parseResult = serviceCreateSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parseResult.error.issues },
      { status: 400 }
    );
  }

  const data = parseResult.data;

  const service = await prisma.service.create({
    data: {
      tenantId: actor.tenantId,
      name: data.name,
      description: data.description,
      duration: data.duration,
      color: data.color,
      price: data.price,
      isActive: data.isActive,
    },
  });

  return NextResponse.json(service, { status: 201 });
}