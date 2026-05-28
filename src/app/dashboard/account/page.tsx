import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AccountForm from "./AccountForm";

interface AccountPageData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  tenantName: string | null;
  tenantId: string | null;
  defaultConsultationFee: number | null;
}

export default async function AccountPage() {
  const authProfile = await requireAuth();

  const profile = await prisma.profile.findUnique({
    where: { id: authProfile.id },
    include: {
      tenant: {
        select: { name: true, id: true, defaultConsultationFee: true },
      },
    },
  });

  if (!profile) {
    redirect("/setup");
  }

  const data: AccountPageData = {
    id: profile.id,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    role: profile.role,
    tenantName: profile.tenant?.name ?? null,
    tenantId: profile.tenant?.id ?? null,
    defaultConsultationFee: profile.tenant?.defaultConsultationFee ? Number(profile.tenant.defaultConsultationFee) : null,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">حسابي</h1>
      <AccountForm initialData={data} />
    </div>
  );
}
