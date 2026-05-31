import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      phone: true,
      address: true,
      profiles: {
        where: { role: { in: ["DOCTOR", "ADMIN"] } },
        select: { id: true, firstName: true, lastName: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const mapped = tenants.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    phone: t.phone,
    address: t.address,
    doctor: t.profiles[0]
      ? `${t.profiles[0].firstName} ${t.profiles[0].lastName}`.trim()
      : "غير معروف",
  }));

  return NextResponse.json(mapped);
}
