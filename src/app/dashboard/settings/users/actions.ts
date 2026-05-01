"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { serviceRoleClient } from "@/utils/supabase/service-role";

const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["ADMIN", "DOCTOR", "RECEPTIONIST"]),
});

const deleteUserSchema = z.object({
  userId: z.string().uuid(),
});

async function getActor() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const actor = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!actor || actor.role !== "ADMIN" || !actor.tenantId) return null;

  return actor;
}

export async function getUsers() {
  const actor = await getActor();
  if (!actor) return [];

  const profiles = await prisma.profile.findMany({
    where: { tenantId: actor.tenantId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  return profiles.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));
}

export async function updateUserRole(formData: FormData) {
  const actor = await getActor();
  if (!actor) {
    return { error: "غير مصرح." };
  }

  const rawData = {
    userId: formData.get("userId")?.toString() ?? "",
    role: formData.get("role")?.toString() ?? "",
  };

  const validation = updateRoleSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: "بيانات غير صالحة." };
  }

  const { userId, role } = validation.data;

  if (userId === actor.id) {
    return { error: "لا يمكنك تعديل دور حسابك الخاص." };
  }

  const targetUser = await prisma.profile.findUnique({
    where: { id: userId },
  });

  if (!targetUser || targetUser.tenantId !== actor.tenantId) {
    return { error: "المستخدم غير موجود أو لا ينتمي إلى عيادتك." };
  }

  try {
    await prisma.profile.update({
      where: { id: userId },
      data: { role },
    });

    // Revoke all sessions for the affected user so they must re-login
    await serviceRoleClient.auth.admin.signOut(userId, "global");

    revalidatePath("/dashboard/settings/users");
    return { success: true };
  } catch {
    return { error: "حدث خطأ أثناء تحديث الدور." };
  }
}

export async function deleteUser(formData: FormData) {
  const actor = await getActor();
  if (!actor) {
    return { error: "غير مصرح." };
  }

  const rawData = {
    userId: formData.get("userId")?.toString() ?? "",
  };

  const validation = deleteUserSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: "بيانات غير صالحة." };
  }

  const { userId } = validation.data;

  if (userId === actor.id) {
    return { error: "لا يمكنك حذف حسابك الخاص." };
  }

  const targetUser = await prisma.profile.findUnique({
    where: { id: userId },
  });

  if (!targetUser || targetUser.tenantId !== actor.tenantId) {
    return { error: "المستخدم غير موجود أو لا ينتمي إلى عيادتك." };
  }

  try {
    await prisma.profile.delete({
      where: { id: userId },
    });

    // Revoke all sessions for the deleted user
    await serviceRoleClient.auth.admin.signOut(userId, "global");

    revalidatePath("/dashboard/settings/users");
    return { success: true };
  } catch {
    return { error: "حدث خطأ أثناء حذف المستخدم." };
  }
}
