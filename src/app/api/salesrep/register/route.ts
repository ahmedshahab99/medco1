import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(8),
  company: z.string().min(1),
  whatsapp: z.string().optional(),
  products: z.array(z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.string().optional(),
  })).min(1, "يجب إضافة منتج واحد على الأقل"),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const existing = await prisma.salesRep.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    const rep = await prisma.salesRep.findUnique({
      where: { email: parsed.data.email },
      include: { products: true },
    });

    return NextResponse.json(rep);
  }

  const rep = await prisma.salesRep.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      company: parsed.data.company,
      whatsapp: parsed.data.whatsapp,
      products: {
        create: parsed.data.products.map((p) => ({
          name: p.name,
          description: p.description,
          price: p.price ? parseFloat(p.price) : null,
        })),
      },
    },
    include: { products: true },
  });

  return NextResponse.json(rep, { status: 201 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const rep = await prisma.salesRep.findUnique({
    where: { email },
    include: { products: true },
  });

  if (!rep) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  return NextResponse.json(rep);
}
