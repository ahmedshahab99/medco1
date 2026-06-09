"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import {
  visitNoteCreateSchema,
  visitNoteUpdateSchema,
  type VisitNoteCreateInput,
  type VisitNoteUpdateInput,
} from "@/lib/schemas/visit-note";

const VISIT_NOTE_WRITE_ROLES = ["ADMIN", "DOCTOR", "RECEPTIONIST"] as const;

export interface VisitNoteRow {
  id: string;
  appointmentId: string | null;
  content: string | null;
  diagnosis: string | null;
  notes: string | null;
  validityDays: number | null;
  createdAt: string;
  updatedAt: string;
  medications: {
    id: string;
    name: string;
    dose: string;
    frequency: string;
    duration: string;
    instructions: string | null;
  }[];
}

export interface VisitNoteDetail {
  id: string;
  patientId: string;
  patientName: string;
  tenantName: string;
  appointmentId: string | null;
  appointment: {
    id: string;
    startTime: string;
    service: { name: string } | null;
    doctor: { email: string; firstName: string | null; lastName: string | null } | null;
  } | null;
  content: string | null;
  diagnosis: string | null;
  notes: string | null;
  validityDays: number | null;
  createdAt: string;
  updatedAt: string;
  medications: {
    id: string;
    name: string;
    dose: string;
    frequency: string;
    duration: string;
    instructions: string | null;
  }[];
}

type ActionResult<T = void> =
  | (T extends void ? { success: true } : { success: true; data: T })
  | { success: false; error: string };

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

function canWriteVisitNotes(role: string): boolean {
  return (VISIT_NOTE_WRITE_ROLES as readonly string[]).includes(role);
}

export async function listVisitNotesAction(
  patientId: string
): Promise<ActionResult<VisitNoteRow[]>> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, tenantId: auth.tenantId },
    select: { id: true },
  });
  if (!patient) return { success: false, error: "المريض غير موجود" };

  const notes = await prisma.visitNote.findMany({
    where: { patientId, tenantId: auth.tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      medications: { orderBy: { name: "asc" } },
    },
  });

  return {
    success: true,
    data: notes.map((n) => ({
      id: n.id,
      appointmentId: n.appointmentId,
      content: n.content,
      diagnosis: n.diagnosis,
      notes: n.notes,
      validityDays: n.validityDays,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
      medications: n.medications.map((m) => ({
        id: m.id,
        name: m.name,
        dose: m.dose,
        frequency: m.frequency,
        duration: m.duration,
        instructions: m.instructions,
      })),
    })),
  };
}

export async function getVisitNoteAction(
  visitNoteId: string
): Promise<ActionResult<VisitNoteDetail>> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  const note = await prisma.visitNote.findFirst({
    where: { id: visitNoteId, tenantId: auth.tenantId },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          tenant: { select: { name: true } },
        },
      },
      appointment: {
        select: {
          id: true,
          startTime: true,
          service: { select: { name: true } },
          doctor: { select: { email: true, firstName: true, lastName: true } },
        },
      },
      medications: { orderBy: { name: "asc" } },
    },
  });

  if (!note || !note.patient) {
    return { success: false, error: "ملاحظة الزيارة غير موجودة" };
  }

  return {
    success: true,
    data: {
      id: note.id,
      patientId: note.patient.id,
      patientName: `${note.patient.firstName} ${note.patient.lastName}`,
      tenantName: note.patient.tenant.name,
      appointmentId: note.appointmentId,
      appointment: note.appointment
        ? {
            id: note.appointment.id,
            startTime: note.appointment.startTime.toISOString(),
            service: note.appointment.service,
            doctor: note.appointment.doctor
              ? {
                  email: note.appointment.doctor.email,
                  firstName: note.appointment.doctor.firstName,
                  lastName: note.appointment.doctor.lastName,
                }
              : null,
          }
        : null,
      content: note.content,
      diagnosis: note.diagnosis,
      notes: note.notes,
      validityDays: note.validityDays,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      medications: note.medications.map((m) => ({
        id: m.id,
        name: m.name,
        dose: m.dose,
        frequency: m.frequency,
        duration: m.duration,
        instructions: m.instructions,
      })),
    },
  };
}

export async function createVisitNoteAction(
  patientId: string,
  input: VisitNoteCreateInput
): Promise<ActionResult<{ id: string }>> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  if (!canWriteVisitNotes(auth.role)) {
    return { success: false, error: "ليس لديك صلاحية لإنشاء ملاحظات الزيارة" };
  }

  const parsed = visitNoteCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, tenantId: auth.tenantId },
    select: { id: true },
  });
  if (!patient) return { success: false, error: "المريض غير موجود" };

  if (parsed.data.appointmentId) {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: parsed.data.appointmentId,
        tenantId: auth.tenantId,
        patientId,
      },
      select: { id: true },
    });
    if (!appointment) {
      return { success: false, error: "الموعد المحدد غير مرتبط بهذا المريض" };
    }
  }

  const hasContent = parsed.data.content?.trim();
  const hasDiagnosis = parsed.data.diagnosis?.trim();
  const validMeds = (parsed.data.medications ?? []).filter((m) => m.name.trim());

  if (!hasContent && !hasDiagnosis && validMeds.length === 0) {
    return { success: false, error: "يجب إدخال ملاحظات أو تشخيص أو دواء واحد على الأقل" };
  }

  if (validMeds.length > 0 && validMeds.some((m) => !m.dose.trim() || !m.frequency.trim() || !m.duration.trim())) {
    return { success: false, error: "جميع حقول الدواء مطلوبة" };
  }

  const note = await prisma.visitNote.create({
    data: {
      tenantId: auth.tenantId,
      patientId,
      appointmentId: parsed.data.appointmentId ?? null,
      content: parsed.data.content ?? null,
      diagnosis: parsed.data.diagnosis ?? null,
      notes: parsed.data.notes ?? null,
      validityDays: parsed.data.validityDays ?? 30,
      medications: {
        create: validMeds.map((m) => ({
          name: m.name,
          dose: m.dose,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions ?? null,
        })),
      },
    },
  });

  revalidatePath(`/dashboard/patients/${patientId}`);
  revalidatePath(`/dashboard`);
  return { success: true, data: { id: note.id } };
}

export async function updateVisitNoteAction(
  visitNoteId: string,
  input: VisitNoteUpdateInput
): Promise<ActionResult> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  if (!canWriteVisitNotes(auth.role)) {
    return { success: false, error: "ليس لديك صلاحية لتعديل ملاحظات الزيارة" };
  }

  const parsed = visitNoteUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await prisma.visitNote.findFirst({
    where: { id: visitNoteId, tenantId: auth.tenantId },
    select: { id: true, patientId: true },
  });
  if (!existing) return { success: false, error: "ملاحظة الزيارة غير موجودة" };

  const updateData: Record<string, unknown> = {};
  if (parsed.data.content !== undefined) updateData.content = parsed.data.content ?? null;
  if (parsed.data.diagnosis !== undefined) updateData.diagnosis = parsed.data.diagnosis ?? null;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes ?? null;
  if (parsed.data.validityDays !== undefined) updateData.validityDays = parsed.data.validityDays;
  if (parsed.data.appointmentId !== undefined) updateData.appointmentId = parsed.data.appointmentId ?? null;

  const hasMeds = parsed.data.medications !== undefined;

  await prisma.visitNote.update({
    where: { id: visitNoteId },
    data: {
      ...updateData,
      ...(hasMeds
        ? {
            medications: {
              deleteMany: {},
              create: (parsed.data.medications ?? [])
                .filter((m) => m.name.trim())
                .map((m) => ({
                  name: m.name,
                  dose: m.dose,
                  frequency: m.frequency,
                  duration: m.duration,
                  instructions: m.instructions ?? null,
                })),
            },
          }
        : {}),
    },
  });

  revalidatePath(`/dashboard/patients/${existing.patientId}`);
  revalidatePath(`/dashboard/patients/${existing.patientId}/visit-notes/${visitNoteId}`);
  revalidatePath(`/dashboard`);
  return { success: true };
}

export async function deleteVisitNoteAction(
  visitNoteId: string
): Promise<ActionResult> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  if (!canWriteVisitNotes(auth.role)) {
    return { success: false, error: "ليس لديك صلاحية لحذف ملاحظات الزيارة" };
  }

  const existing = await prisma.visitNote.findFirst({
    where: { id: visitNoteId, tenantId: auth.tenantId },
    select: { id: true, patientId: true },
  });
  if (!existing) return { success: false, error: "ملاحظة الزيارة غير موجودة" };

  await prisma.visitNote.delete({ where: { id: visitNoteId } });

  revalidatePath(`/dashboard/patients/${existing.patientId}`);
  revalidatePath(`/dashboard/patients/${existing.patientId}/visit-notes/${visitNoteId}`);
  revalidatePath(`/dashboard`);
  return { success: true };
}

export async function getVisitNotesByAppointmentAction(
  appointmentId: string
): Promise<ActionResult<VisitNoteRow[]>> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  const notes = await prisma.visitNote.findMany({
    where: { appointmentId, tenantId: auth.tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      medications: { orderBy: { name: "asc" } },
    },
  });

  return {
    success: true,
    data: notes.map((n) => ({
      id: n.id,
      appointmentId: n.appointmentId,
      content: n.content,
      diagnosis: n.diagnosis,
      notes: n.notes,
      validityDays: n.validityDays,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
      medications: n.medications.map((m) => ({
        id: m.id,
        name: m.name,
        dose: m.dose,
        frequency: m.frequency,
        duration: m.duration,
        instructions: m.instructions,
      })),
    })),
  };
}

export async function getPatientAppointmentsForVisitNoteAction(
  patientId: string
): Promise<ActionResult<{ id: string; startTime: string; serviceName: string | null }[]>> {
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
      status: { not: "CANCELLED" },
    },
    orderBy: { startTime: "desc" },
    take: 100,
    include: {
      service: { select: { name: true } },
    },
  });

  return {
    success: true,
    data: appointments.map((a) => ({
      id: a.id,
      startTime: a.startTime.toISOString(),
      serviceName: a.service?.name ?? null,
    })),
  };
}
