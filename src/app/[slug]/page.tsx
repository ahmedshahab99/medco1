import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { validateSlugFormat } from "@/lib/slug-utils";
import { isReservedSlug } from "@/lib/reserved-slugs";
import ClinicHeader from "@/components/profile/ClinicHeader";
import ClinicBio from "@/components/profile/ClinicBio";
import QuickActions from "@/components/profile/QuickActions";
import DoctorsList from "@/components/profile/DoctorsList";
import SocialFooter from "@/components/profile/SocialFooter";
import type { SocialPlatform } from "@prisma/client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!validateSlugFormat(slug).valid || isReservedSlug(slug)) {
    return { title: "غير موجود" };
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { name: true },
  });

  if (!tenant) {
    return { title: "غير موجود" };
  }

  return {
    title: tenant.name,
    description: `الملف التعريفي لـ ${tenant.name}`,
  };
}

export default async function ClinicProfilePage({ params }: PageProps) {
  const { slug } = await params;
  

  if (!validateSlugFormat(slug).valid || isReservedSlug(slug)) {
    notFound();
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      socialLinks: true,
      profiles: {
        where: { role: { in: ["DOCTOR", "ADMIN"] } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });

  if (!tenant) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background font-sans">
      <div className="max-w-md mx-auto p-4 sm:p-6 lg:p-8 pb-24">
        <ClinicHeader
          name={tenant.name}
          logo={tenant.logo}
          specialty={tenant.specialty}
          address={tenant.address}
        />

        {tenant.bio && <ClinicBio bio={tenant.bio} />}

        <QuickActions
          clinicName={tenant.name}
          phone={tenant.phone}
          address={tenant.address}
          socialLinks={
            tenant.socialLinks.map((s) => ({
              id: s.id,
              platform: s.platform as SocialPlatform,
              url: s.url,
            }))
          }
        />

        <DoctorsList doctors={tenant.profiles} />

        <SocialFooter
          socialLinks={
            tenant.socialLinks.map((s) => ({
              id: s.id,
              platform: s.platform as SocialPlatform,
              url: s.url,
            }))
          }
        />
      </div>
    </main>
  );
}
