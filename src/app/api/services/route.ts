import { NextResponse } from "next/server";
import { getAuthState } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serviceCreateSchema } from "@/lib/schemas/service";

export async function GET() {
  const profile = await getAuthState();
  if (!profile?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const services = await prisma.service.findMany({
    where: {
      tenantId: profile.tenantId,
      
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(services);
}

export async function POST(request: Request) {
  const profile = await getAuthState();
  if (!profile?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (profile.role !== "ADMIN") {
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
      tenantId: profile.tenantId,
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