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
    const jwtParts = accessToken.split(".");
    if (jwtParts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(jwtParts[1], "base64").toString("utf-8"));
    return {
      user_role: payload.user_role ?? null,
      tenant_id: payload.tenant_id ?? null,
    };
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
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
  const isAdmin = jwtClaims.user_role === "ADMIN";

  return <ProfileForm initialData={tenantData} isAdmin={isAdmin} />;
}
