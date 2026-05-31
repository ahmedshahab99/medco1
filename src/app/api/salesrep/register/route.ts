import { NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(8),
  company: z.string().min(1),
  whatsapp: z.string().optional(),
  products: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.string().optional(),
      })
    )
    .min(1, "يجب إضافة منتج واحد على الأقل"),
});

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);

  const existing = await prisma.salesRep.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    include: { products: true },
  });
  if (existing) {
    return NextResponse.json(existing);
  }

  const rep = await prisma.salesRep.create({
    data: {
      name: parsed.data.name,
      email,
      phone: parsed.data.phone,
      company: parsed.data.company,
      whatsapp: parsed.data.whatsapp,
      products: {
        create: parsed.data.products.map((product) => ({
          name: product.name,
          description: product.description,
          price: product.price ? parseFloat(product.price) : null,
        })),
      },
    },
    include: { products: true },
  });

  return NextResponse.json(rep, { status: 201 });
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const emailParam = searchParams.get("email");

  if (!emailParam) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const rep = await prisma.salesRep.findFirst({
    where: { email: { equals: normalizeEmail(emailParam), mode: "insensitive" } },
    include: { products: true },
  });

  if (!rep) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  return NextResponse.json(rep);
}
