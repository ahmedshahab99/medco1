import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const offerSchema = z.object({
  salesRepId: z.string().min(1),
  tenantId: z.string().min(1),
  productId: z.string().min(1),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = offerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const offer = await prisma.offer.create({
    data: {
      tenantId: parsed.data.tenantId,
      salesRepId: parsed.data.salesRepId,
      productId: parsed.data.productId,
      notes: parsed.data.notes,
    },
    include: {
      salesRep: { select: { name: true, company: true, phone: true, whatsapp: true } },
      product: { select: { name: true, description: true, price: true } },
    },
  });

  return NextResponse.json(offer, { status: 201 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");
  const salesRepId = searchParams.get("salesRepId");

  const where: any = {};
  if (tenantId) where.tenantId = tenantId;
  if (salesRepId) where.salesRepId = salesRepId;

  const offers = await prisma.offer.findMany({
    where,
    include: {
      salesRep: { select: { name: true, company: true, phone: true, whatsapp: true } },
      product: { select: { name: true, description: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(offers);
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const body = await request.json();

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const offer = await prisma.offer.update({
    where: { id },
    data: { status: body.status },
  });

  return NextResponse.json(offer);
}
