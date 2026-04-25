import { NextResponse } from "next/server";
import { getAuthState } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serviceUpdateSchema } from "@/lib/schemas/service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const profile = await getAuthState();
  if (!profile?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const service = await prisma.service.findFirst({
    where: {
      id,
      tenantId: profile.tenantId,
    },
  });

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  return NextResponse.json(service);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const profile = await getAuthState();
  if (!profile?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (profile.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.service.findFirst({
    where: {
      id,
      tenantId: profile.tenantId,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parseResult = serviceUpdateSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parseResult.error.issues },
      { status: 400 }
    );
  }

  const data = parseResult.data;

  const service = await prisma.service.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      duration: data.duration,
      color: data.color,
      price: data.price,
      isActive: data.isActive,
    },
  });

  return NextResponse.json(service);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const profile = await getAuthState();
  if (!profile?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (profile.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.service.findFirst({
    where: {
      id,
      tenantId: profile.tenantId,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  await prisma.service.delete({
    where: { id },
  });

  return new NextResponse(null, { status: 204 });
}