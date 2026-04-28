"use server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getInviteExpiry } from "@/lib/invite";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/lib/types/auth";

const createInviteSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  role: z.enum(["DOCTOR", "RECEPTIONIST"], { message: "الرجاء اختيار الدور" }),
});

export async function createInvitation(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return { error: "يرجى تسجيل الدخول أولاً." };
  }

  const adminProfile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!adminProfile || adminProfile.role !== "ADMIN" || !adminProfile.tenantId) {
    return { error: "ليس لديك صلاحية إرسال الدعوات." };
  }

  const rawData = {
    email: formData.get("email")?.toString() || "",
    role: formData.get("role")?.toString() || "",
  };

  const validation = createInviteSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const { email, role } = validation.data;

  const existingProfile = await prisma.profile.findUnique({
    where: { email },
  });

  if (existingProfile) {
    return { error: "هذا البريد الإلكتروني مسجل بالفعل." };
  }

  const existingPending = await prisma.invitation.findFirst({
    where: { email, status: "PENDING", tenantId: adminProfile.tenantId },
  });

  if (existingPending) {
    return { error: "توجد دعوة معلقة بالفعل لهذا البريد الإلكتروني." };
  }

  const expiresAt = getInviteExpiry();

  const invitation = await prisma.invitation.create({
    data: {
      tenantId: adminProfile.tenantId,
      email,
      role: role as UserRole,
      expiresAt,
      invitedBy: user.id,
    },
  });

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?invitation_id=${invitation.id}`,
      data: {
        invitation_id: invitation.id,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/invite");

  return { success: true };
}

export async function cancelInvitation(invitationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "يرجى تسجيل الدخول أولاً." };
  }

  const adminProfile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!adminProfile || adminProfile.role !== "ADMIN" || !adminProfile.tenantId) {
    return { error: "ليس لديك صلاحية لإدارة الدعوات." };
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation || invitation.tenantId !== adminProfile.tenantId) {
    return { error: "الدعوة غير موجودة." };
  }

  if (invitation.status !== "PENDING") {
    return { error: "لا يمكن إلغاء هذه الدعوة." };
  }

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/dashboard/invite");
  return { success: true };
}

export async function getInvitations() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile || profile.role !== "ADMIN" || !profile.tenantId) {
    return [];
  }

  const invitations = await prisma.invitation.findMany({
    where: { tenantId: profile.tenantId },
    include: {
      inviter: { select: { email: true, firstName: true } },
      acceptedProfile: { select: { email: true, firstName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return invitations.map((inv) => ({
    ...inv,
    createdAt: inv.createdAt.toISOString(),
    expiresAt: inv.expiresAt.toISOString(),
  }));
}
