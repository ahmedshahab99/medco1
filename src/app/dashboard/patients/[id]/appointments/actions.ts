"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import type {
  ActionResult,
  AppointmentInput,
  ListAppointmentsResult,
  PatientAppointmentDetail,
  PatientAppointmentRow,
} from "@/lib/types/appointments";

const APPOINTMENT_WRITE_ROLES = ["ADMIN", "DOCTOR", "RECEPTIONIST"] as const;

const appointmentUpdateSchema = z.object({
  status: z
    .enum(["BOOKING", "WAITING", "SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"])
    .optional(),
  notes: z.string().max(1000, "الملاحظات طويلة جداً").optional(),
});

async function getAuthorizedActor(): Promise<
  { tenantId: string; role: string; userId: string } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  const actor = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!actor || !actor.tenantId) return { error: "غير مصرح" };

  return { tenantId: actor.tenantId, role: actor.role, userId: actor.id };
}

function canWriteAppointments(role: string): boolean {
  return (APPOINTMENT_WRITE_ROLES as readonly string[]).includes(role);
}

export async function listPatientAppointmentsAction(
  patientId: string
): Promise<ActionResult<ListAppointmentsResult>> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, tenantId: auth.tenantId },
    select: { id: true },
  });
  if (!patient) return { success: false, error: "المريض غير موجود" };

  const appointments = await prisma.appointment.findMany({
    where: {
      patientId,
      tenantId: auth.tenantId,
    },
    orderBy: { startTime: "desc" },
    include: {
      service: { select: { name: true } },
      doctor: { select: { firstName: true, lastName: true } },
      case: { select: { id: true, title: true } },
      transactions: { select: { id: true } },
    },
  });

  const rows: PatientAppointmentRow[] = appointments.map((a) => ({
    id: a.id,
    serviceName: a.service.name,
    doctorName: `د. ${a.doctor.firstName} ${a.doctor.lastName}`,
    startTime: a.startTime.toISOString(),
    endTime: a.endTime.toISOString(),
    status: a.status as PatientAppointmentRow["status"],
    caseName: a.case?.title ?? null,
    caseId: a.case?.id ?? null,
    notes: a.notes,
    hasTransactions: a.transactions.length > 0,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));

  const now = new Date();
  const upcomingCount = rows.filter((r) => new Date(r.startTime) > now).length;

  return {
    success: true,
    data: {
      appointments: rows,
      summary: {
        count: rows.length,
        upcomingCount,
      },
    },
  };
}

export async function getPatientAppointmentAction(
  appointmentId: string
): Promise<ActionResult<PatientAppointmentDetail>> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  const a = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      tenantId: auth.tenantId,
    },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          tenant: { select: { name: true } },
        },
      },
      service: { select: { name: true } },
      doctor: { select: { id: true, firstName: true, lastName: true } },
      case: { select: { id: true, title: true } },
      transactions: {
        orderBy: { date: "desc" },
        select: {
          id: true,
          amount: true,
          category: true,
          date: true,
          description: true,
        },
      },
    },
  });

  if (!a || !a.patient) {
    return { success: false, error: "الموعد غير موجود" };
  }

  return {
    success: true,
    data: {
      id: a.id,
      patientId: a.patient.id,
      patientName: `${a.patient.firstName} ${a.patient.lastName}`,
      tenantName: a.patient.tenant.name,
      serviceName: a.service.name,
      doctorName: `د. ${a.doctor.firstName} ${a.doctor.lastName}`,
      doctorId: a.doctor.id,
      serviceId: a.serviceId,
      startTime: a.startTime.toISOString(),
      endTime: a.endTime.toISOString(),
      status: a.status as PatientAppointmentDetail["status"],
      notes: a.notes,
      caseId: a.case?.id ?? null,
      caseName: a.case?.title ?? null,
      transactions: a.transactions.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        category: t.category,
        date: t.date.toISOString(),
        description: t.description,
      })),
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    },
  };
}

export async function updatePatientAppointmentAction(
  appointmentId: string,
  input: AppointmentInput
): Promise<ActionResult> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  if (!canWriteAppointments(auth.role)) {
    return { success: false, error: "ليس لديك صلاحية لتعديل المواعيد" };
  }

  const parsed = appointmentUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await prisma.appointment.findFirst({
    where: { id: appointmentId, tenantId: auth.tenantId },
    select: { id: true, patientId: true },
  });
  if (!existing || !existing.patientId) {
    return { success: false, error: "الموعد غير موجود" };
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: updateData,
  });

  revalidatePath(`/dashboard/patients/${existing.patientId}`);
  revalidatePath(`/dashboard/patients/${existing.patientId}/appointments/${appointmentId}`);
  return { success: true };
}

export async function deletePatientAppointmentAction(
  appointmentId: string
): Promise<ActionResult> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  if (!canWriteAppointments(auth.role)) {
    return { success: false, error: "ليس لديك صلاحية لحذف المواعيد" };
  }

  const existing = await prisma.appointment.findFirst({
    where: { id: appointmentId, tenantId: auth.tenantId },
    select: { id: true, patientId: true },
  });
  if (!existing || !existing.patientId) {
    return { success: false, error: "الموعد غير موجود" };
  }

  await prisma.appointment.delete({ where: { id: appointmentId } });

  revalidatePath(`/dashboard/patients/${existing.patientId}`);
  revalidatePath(`/dashboard/patients/${existing.patientId}/appointments/${appointmentId}`);
  return { success: true };
}
