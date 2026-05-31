import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { salesRepId, name, description, price } = body || {};

  if (!salesRepId || !name) {
    return NextResponse.json({ error: "معرف المندوب واسم المنتج مطلوبان" }, { status: 400 });
  }

  const product = await prisma.salesRepProduct.create({
    data: { salesRepId, name, description, price: price ? parseFloat(price) : null },
  });

  return NextResponse.json(product, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.salesRepProduct.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
