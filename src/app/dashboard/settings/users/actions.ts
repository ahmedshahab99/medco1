"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revokeUserSessions } from "@/lib/session-revocation";
import { enforceDoctorLimit } from "@/lib/plans/enforce";
import { DEFAULT_SCHEDULE, DEFAULT_ADVANCED } from "@/components/features/availability/constants";
import { Prisma } from "@prisma/client";

const DOCTOR_LIKE_ROLES = new Set(["DOCTOR", "ADMIN"]);

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
    where: { id: user.id, deletedAt: null },
  });

  if (!actor || actor.role !== "ADMIN" || !actor.tenantId) return null;

  return actor;
}

export async function getUsers() {
  const actor = await getActor();
  if (!actor) return [];

  const profiles = await prisma.profile.findMany({
    where: { tenantId: actor.tenantId, deletedAt: null },
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
    where: { id: userId, deletedAt: null },
  });

  if (!targetUser || targetUser.tenantId !== actor.tenantId) {
    return { error: "المستخدم غير موجود أو لا ينتمي إلى عيادتك." };
  }

  // Promoting into a doctor-like slot counts against the plan's doctor limit.
  if (DOCTOR_LIKE_ROLES.has(role) && !DOCTOR_LIKE_ROLES.has(targetUser.role)) {
    const guard = await enforceDoctorLimit(actor.tenantId!, 1);
    if (!guard.allowed) return { error: guard.reason };
  }

  try {
    await prisma.profile.update({
      where: { id: userId },
      data: { role },
    });

    // When a user is promoted into a bookable role (DOCTOR/ADMIN), seed a
    // default recurring schedule if they don't already have one, so they
    // become available for booking immediately.
    if (DOCTOR_LIKE_ROLES.has(role) && !DOCTOR_LIKE_ROLES.has(targetUser.role)) {
      await prisma.doctorAvailability.upsert({
        where: { doctorId: userId },
        create: {
          tenantId: actor.tenantId!,
          doctorId: userId,
          schedule: DEFAULT_SCHEDULE as unknown as Prisma.InputJsonValue,
          settings: DEFAULT_ADVANCED as unknown as Prisma.InputJsonValue,
        },
        update: {},
      });
    }

    // Revoke all sessions and blacklist current JWT
    await revokeUserSessions(userId);

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
    where: { id: userId, deletedAt: null },
  });

  if (!targetUser || targetUser.tenantId !== actor.tenantId) {
    return { error: "المستخدم غير موجود أو لا ينتمي إلى عيادتك." };
  }

  try {
    await prisma.profile.update({
      where: { id: userId },
      data: { deletedAt: new Date(), tenantId: null },
    });

    // Revoke all sessions and blacklist current JWT
    await revokeUserSessions(userId);

    revalidatePath("/dashboard/settings/users");
    return { success: true };
  } catch(error) {
    console.error("Error deleting user:", error);
    return { error: "حدث خطأ أثناء حذف المستخدم." };

  }
}
