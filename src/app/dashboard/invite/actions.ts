"use server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getInviteExpiry } from "@/lib/invite";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/lib/types/auth";
import { enforceDoctorLimit } from "@/lib/plans/enforce";
import resendClient from "@/lib/resend";
import { serviceRoleClient } from "@/utils/supabase/service-role";

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
      where: { id: user.id, deletedAt: null },
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
    where: { email, deletedAt: null },
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

  // DOCTOR invitations consume a doctor slot — enforce before sending the invite
  // so the admin fails fast rather than at acceptance time.
  if ((role as UserRole) === "DOCTOR") {
    const guard = await enforceDoctorLimit(adminProfile.tenantId, 1);
    if (!guard.allowed) return { error: guard.reason };
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

  // const { error } = await supabase.auth.signInWithOtp({
  //   email,
  //   options: {
  //     emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?invitation_id=${invitation.id}`,
  //     data: {
  //       invitation_id: invitation.id,
  //       type: "invite",
  //     },
  //   },
  // });

  const { data, error: generateLinkError } = await serviceRoleClient.auth.admin.generateLink({
    email, type: "magiclink",
  });
  

if (generateLinkError) {
    return { error: generateLinkError.message };
  };

  const url = new URL(data.properties.action_link)
const tokenHash = url.searchParams.get('token')

  const { error } = await resendClient.emails.send({
    from: "MedLink<contact@baghdadflow.com>",
    to: email,
    subject: "دعوة للانضمام إلى MedLink",
    html: `<p>مرحباً،</p>
    <p>لقد تلقيت دعوة للانضمام إلى MedLink كـ ${role.toLowerCase()}.</p>
    <p>انقر على الرابط أدناه لتسجيل الدخول وإنهاء عملية الانضمام:</p>
    <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?token_hash=${tokenHash}&type=magiclink&redirect=${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?invitation_id=${invitation.id}">انقر هنا</a></p>
    <p>تحياتنا،</p>
    <p>MedLink</p>`,
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
      where: { id: user.id, deletedAt: null },
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
    where: { id: user.id, deletedAt: null },
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
