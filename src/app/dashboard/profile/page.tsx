import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileForm from "./ProfileForm";
import { createClient } from "@/utils/supabase/server";
import type { TenantProfile } from "@/lib/types/tenant";

function serializeTenant(tenant: any): Omit<TenantProfile, 'defaultConsultationFee'> {
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

function decodeJwtClaims(accessToken: string | undefined): { user_role: string | null; tenant_id: string | null } | null {
  if (!accessToken) return null;
  try {
    const parts = accessToken.split(".");
    if (parts.length !== 3) return null;
    return {
      user_role: JSON.parse(Buffer.from(parts[1], "base64").toString()).user_role ?? null,
      tenant_id: JSON.parse(Buffer.from(parts[1], "base64").toString()).tenant_id ?? null,
    };
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) redirect("/login");

    const jwtClaims = decodeJwtClaims(session.access_token);
    if (!jwtClaims?.tenant_id) redirect("/setup");

    const tenant = await prisma.tenant.findUnique({
      where: { id: jwtClaims.tenant_id },
      include: { socialLinks: true },
    });
    if (!tenant) redirect("/setup");

    const tenantData: TenantProfile = {
      ...serializeTenant(tenant),
      defaultConsultationFee: tenant.defaultConsultationFee ? Number(tenant.defaultConsultationFee) : null,
    };

    return <ProfileForm initialData={tenantData} isAdmin={jwtClaims.user_role === "ADMIN"} />;
  } catch {
    redirect("/setup");
  }
}
