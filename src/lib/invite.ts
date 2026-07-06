import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { UserRole } from "@/lib/types/auth";
import { enforceDoctorLimit } from "@/lib/plans/enforce";
import { DEFAULT_SCHEDULE, DEFAULT_ADVANCED } from "@/components/features/availability/constants";

const INVITE_EXPIRY_DAYS = 7;

const DOCTOR_LIKE_ROLES: UserRole[] = ["DOCTOR", "ADMIN"];

export function getInviteExpiry(): Date {
  return new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
}

export async function acceptInvitation(
  invitationId: string,
  userId: string,
  userEmail: string
): Promise<{ success: boolean; error?: string }> {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    return { success: false, error: "الدعوة غير موجودة." };
  }

  if (invitation.status === "ACCEPTED") {
    return { success: false, error: "تم قبول هذه الدعوة مسبقاً." };
  }

  if (invitation.status === "CANCELLED") {
    return { success: false, error: "تم إلغاء هذه الدعوة." };
  }

  if (invitation.status === "EXPIRED" || new Date() > invitation.expiresAt) {
    return { success: false, error: "انتهت صلاحية الدعوة." };
  }

  if (userEmail.toLowerCase() !== invitation.email.toLowerCase()) {
    return { success: false, error: "البريد الإلكتروني لا يتطابق مع الدعوة." };
  }

  const existingProfile = await prisma.profile.findUnique({
    where: { id: userId },
  });

  if (existingProfile?.tenantId) {
    return { success: false, error: "أنت بالفعل عضو في عيادة." };
  }

  // Enforce per-tenant doctor-slot limit before mutating.
  // Only DOCTOR/ADMIN roles count toward the slot; receptionists are free.
  if (DOCTOR_LIKE_ROLES.includes(invitation.role as UserRole)) {
    const guard = await enforceDoctorLimit(invitation.tenantId, 1);
    if (!guard.allowed) {
      return { success: false, error: guard.reason };
    }
  }

  await prisma.$transaction(async (tx) => {
    let profile = await tx.profile.findUnique({ where: { id: userId } });
    

    if (!profile) {
      profile = await tx.profile.create({
        data: {
          id: userId,
          email: userEmail,
          role: invitation.role as UserRole,
          tenantId: invitation.tenantId,
        },
      });
    } else {
      await tx.profile.update({
        where: { id: userId },
        data: {
          role: invitation.role as UserRole,
          tenantId: invitation.tenantId,
          deletedAt: null,
        },
      });
    }

    // Seed a default recurring schedule for bookable roles so the new member
    // is available for booking immediately; they can customize it later.
    if (DOCTOR_LIKE_ROLES.includes(invitation.role as UserRole)) {
      await tx.doctorAvailability.create({
        data: {
          tenantId: invitation.tenantId,
          doctorId: userId,
          schedule: DEFAULT_SCHEDULE as unknown as Prisma.InputJsonValue,
          settings: DEFAULT_ADVANCED as unknown as Prisma.InputJsonValue,
        },
      });
    }

    await tx.invitation.update({
      where: { id: invitation.id },
      data: {
        status: "ACCEPTED",
        acceptedBy: userId,
      },
    });
  });

  return { success: true };
}
