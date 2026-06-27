"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import type {
  ActionResult,
  CaseInput,
  ListCasesResult,
  PatientCaseDetail,
  PatientCaseRow,
} from "@/lib/types/cases";

const CASE_WRITE_ROLES = ["ADMIN", "DOCTOR", "RECEPTIONIST"] as const;

const caseInputSchema = z.object({
  title: z.string().min(1, "عنوان الحالة مطلوب").max(200, "العنوان طويل جداً"),
  description: z.string().max(1000, "الوصف طويل جداً").optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

async function getAuthorizedActor(): Promise<
  { tenantId: string; role: string; userId: string } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  const actor = await prisma.profile.findUnique({ where: { id: user.id, deletedAt: null } });
  if (!actor || !actor.tenantId) return { error: "غير مصرح" };

  return { tenantId: actor.tenantId, role: actor.role, userId: actor.id };
}

function canWriteCases(role: string): boolean {
  return (CASE_WRITE_ROLES as readonly string[]).includes(role);
}

export async function listPatientCasesAction(
  patientId: string
): Promise<ActionResult<ListCasesResult>> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, tenantId: auth.tenantId },
    select: { id: true },
  });
  if (!patient) return { success: false, error: "المريض غير موجود" };

  const cases = await prisma.case.findMany({
    where: {
      patientId,
      tenantId: auth.tenantId,
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { appointments: true } },
    },
  });

  const rows: PatientCaseRow[] = cases.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    status: c.status as PatientCaseRow["status"],
    appointmentCount: c._count.appointments,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return {
    success: true,
    data: {
      cases: rows,
      summary: {
        count: rows.length,
        activeCount: rows.filter((r) => r.status === "ACTIVE").length,
      },
    },
  };
}

export async function getPatientCaseAction(
  caseId: string
): Promise<ActionResult<PatientCaseDetail>> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  const c = await prisma.case.findFirst({
    where: {
      id: caseId,
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
      appointments: {
        orderBy: { startTime: "desc" },
        include: {
          service: { select: { name: true } },
        },
      },
    },
  });

  if (!c || !c.patient) {
    return { success: false, error: "الحالة غير موجودة" };
  }

  return {
    success: true,
    data: {
      id: c.id,
      patientId: c.patient.id,
      patientName: `${c.patient.firstName} ${c.patient.lastName}`,
      tenantName: c.patient.tenant.name,
      title: c.title,
      description: c.description,
      status: c.status as PatientCaseDetail["status"],
      appointments: c.appointments.map((a) => ({
        id: a.id,
        startTime: a.startTime.toISOString(),
        status: a.status,
        service: a.service,
      })),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    },
  };
}

export async function createPatientCaseAction(
  patientId: string,
  input: CaseInput
): Promise<ActionResult> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  if (!canWriteCases(auth.role)) {
    return { success: false, error: "ليس لديك صلاحية لإضافة الحالات الطبية" };
  }

  const parsed = caseInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, tenantId: auth.tenantId },
    select: { id: true },
  });
  if (!patient) return { success: false, error: "المريض غير موجود" };

  await prisma.case.create({
    data: {
      tenantId: auth.tenantId,
      patientId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status ?? "ACTIVE",
    },
  });

  revalidatePath(`/dashboard/patients/${patientId}`);
  return { success: true };
}

export async function updatePatientCaseAction(
  caseId: string,
  input: CaseInput
): Promise<ActionResult> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  if (!canWriteCases(auth.role)) {
    return { success: false, error: "ليس لديك صلاحية لتعديل الحالات الطبية" };
  }

  const parsed = caseInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await prisma.case.findFirst({
    where: { id: caseId, tenantId: auth.tenantId },
    select: { id: true, patientId: true },
  });
  if (!existing || !existing.patientId) {
    return { success: false, error: "الحالة غير موجودة" };
  }

  await prisma.case.update({
    where: { id: caseId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status ?? "ACTIVE",
    },
  });

  revalidatePath(`/dashboard/patients/${existing.patientId}`);
  revalidatePath(`/dashboard/patients/${existing.patientId}/cases/${caseId}`);
  return { success: true };
}

export async function deletePatientCaseAction(
  caseId: string
): Promise<ActionResult> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  if (!canWriteCases(auth.role)) {
    return { success: false, error: "ليس لديك صلاحية لحذف الحالات الطبية" };
  }

  const existing = await prisma.case.findFirst({
    where: { id: caseId, tenantId: auth.tenantId },
    select: { id: true, patientId: true },
  });
  if (!existing || !existing.patientId) {
    return { success: false, error: "الحالة غير موجودة" };
  }

  await prisma.case.delete({ where: { id: caseId } });

  revalidatePath(`/dashboard/patients/${existing.patientId}`);
  revalidatePath(`/dashboard/patients/${existing.patientId}/cases/${caseId}`);
  return { success: true };
}
