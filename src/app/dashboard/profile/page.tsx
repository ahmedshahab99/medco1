import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ProfileForm from "./ProfileForm";
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

export default async function ProfilePage() {
  let profile;
  try {
    profile = await requireAuth();
  } catch {
    redirect("/login");
  }

  if (!profile?.tenantId) {
    redirect("/setup");
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: profile.tenantId },
      include: { socialLinks: true },
    });

    if (!tenant) {
      redirect("/setup");
    }

    const tenantData = serializeTenant(tenant);
    const isAdmin = profile.role === "ADMIN";

    return <ProfileForm initialData={tenantData} isAdmin={isAdmin} />;
  } catch (e) {
    console.error("Profile tenant load error:", e);
    redirect("/setup");
  }
}
