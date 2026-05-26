import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { tenantUpdateSchema } from "@/lib/schemas/tenant";
import type { TenantProfile } from "@/lib/types/tenant";

function serializeTenant(tenant: any): TenantProfile {
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    qrCode: tenant.qrCode,
    phone: tenant.phone,
    specialty: tenant.specialty,
    bio: tenant.bio,
    logo: tenant.logo,
    address: tenant.address,
    latitude: tenant.latitude,
    longitude: tenant.longitude,
    socialLinks: tenant.socialLinks.map((link: any) => ({
      id: link.id,
      platform: link.platform,
      url: link.url,
    })),
  };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let actor = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!actor?.tenantId && user.email) {
    actor = await prisma.profile.findUnique({
      where: { email: user.email },
    });
  }

  if (!actor?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: actor.tenantId },
    include: { socialLinks: true },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  return NextResponse.json(serializeTenant(tenant));
}

export async function PATCH(request: Request) {
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

  const parseResult = tenantUpdateSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parseResult.error.issues },
      { status: 400 }
    );
  }

  const data = parseResult.data;

  const updatedTenant = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.update({
      where: { id: actor.tenantId! },
      data: {
        name: data.name,
        specialty: data.specialty,
        bio: data.bio,
        phone: data.phone,
        logo: data.logo,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
      },
      include: { socialLinks: true },
    });

    if (data.socialLinks !== undefined) {
      const existingIds = new Set(tenant.socialLinks.map((l) => l.id));
      const payloadIds = new Set(
        data.socialLinks.map((l) => l.id).filter(Boolean) as string[]
      );

      const toDelete = tenant.socialLinks
        .filter((l) => !payloadIds.has(l.id))
        .map((l) => l.id);

      if (toDelete.length > 0) {
        await tx.socialLink.deleteMany({
          where: { id: { in: toDelete } },
        });
      }

      for (const link of data.socialLinks) {
        if (link.id && existingIds.has(link.id)) {
          await tx.socialLink.update({
            where: { id: link.id },
            data: { platform: link.platform, url: link.url },
          });
        } else {
          await tx.socialLink.create({
            data: {
              tenantId: tenant.id,
              platform: link.platform,
              url: link.url,
            },
          });
        }
      }
    }

    return tx.tenant.findUnique({
      where: { id: tenant.id },
      include: { socialLinks: true },
    });
  }, {
    maxWait: 10000,
    timeout: 20000,
  });

  if (!updatedTenant) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json(serializeTenant(updatedTenant));
}
