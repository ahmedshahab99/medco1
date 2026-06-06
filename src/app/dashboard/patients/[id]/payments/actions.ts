"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import type {
  ActionResult,
  ListPaymentsResult,
  PatientAppointmentOption,
  PatientPaymentCategory,
  PatientPaymentRow,
  PaymentInput,
} from "@/lib/types/payments";

const PAYMENT_WRITE_ROLES = ["ADMIN", "DOCTOR", "RECEPTIONIST"] as const;

export interface PatientPaymentDetail {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  category: PatientPaymentCategory;
  amount: number;
  description: string | null;
  date: string;
  createdAt: string;
  appointmentId: string | null;
  appointment: {
    id: string;
    startTime: string;
    service: { name: string } | null;
  } | null;
}

const paymentInputSchema = z.object({
  amount: z.coerce.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  category: z.enum(["CONSULTATION", "MEDICATIONS", "SERVICES", "OTHER"]),
  date: z.string().min(1, "التاريخ مطلوب"),
  description: z.string().max(500, "الوصف طويل جداً").optional(),
  appointmentId: z.string().uuid().nullable().optional(),
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

function canWritePayments(role: string): boolean {
  return (PAYMENT_WRITE_ROLES as readonly string[]).includes(role);
}

export async function listPatientPaymentsAction(
  patientId: string
): Promise<ActionResult<ListPaymentsResult>> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, tenantId: auth.tenantId },
    select: { id: true },
  });
  if (!patient) return { success: false, error: "المريض غير موجود" };

  const rows = await prisma.transaction.findMany({
    where: {
      patientId,
      tenantId: auth.tenantId,
      type: "INCOME",
    },
    orderBy: { date: "desc" },
    include: {
      appointment: {
        select: {
          id: true,
          startTime: true,
          service: { select: { name: true } },
        },
      },
    },
  });

  const payments: PatientPaymentRow[] = rows.map((p) => ({
    id: p.id,
    type: "INCOME",
    category: p.category as PatientPaymentCategory,
    amount: Number(p.amount),
    description: p.description,
    date: p.date.toISOString(),
    createdAt: p.createdAt.toISOString(),
    appointmentId: p.appointmentId,
    appointment: p.appointment
      ? {
          id: p.appointment.id,
          startTime: p.appointment.startTime.toISOString(),
          service: p.appointment.service,
        }
      : null,
  }));

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const lastPaymentAt = payments[0]?.date ?? null;

  return {
    success: true,
    data: {
      payments,
      summary: { totalPaid, count: payments.length, lastPaymentAt },
    },
  };
}

export async function getPatientPaymentAction(
  paymentId: string
): Promise<ActionResult<PatientPaymentDetail>> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  const payment = await prisma.transaction.findFirst({
    where: {
      id: paymentId,
      tenantId: auth.tenantId,
      type: "INCOME",
    },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
      appointment: {
        select: {
          id: true,
          startTime: true,
          service: { select: { name: true } },
        },
      },
    },
  });

  if (!payment || !payment.patient) {
    return { success: false, error: "الدفعة غير موجودة" };
  }

  return {
    success: true,
    data: {
      id: payment.id,
      patientId: payment.patient.id,
      patientName: `${payment.patient.firstName} ${payment.patient.lastName}`,
      type: payment.type,
      category: payment.category as PatientPaymentCategory,
      amount: Number(payment.amount),
      description: payment.description,
      date: payment.date.toISOString(),
      createdAt: payment.createdAt.toISOString(),
      appointmentId: payment.appointmentId,
      appointment: payment.appointment
        ? {
            id: payment.appointment.id,
            startTime: payment.appointment.startTime.toISOString(),
            service: payment.appointment.service,
          }
        : null,
    },
  };
}

export async function getPatientAppointmentsAction(
  patientId: string
): Promise<ActionResult<PatientAppointmentOption[]>> {
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
      status: a.status,
      consultationFee: a.consultationFee ? Number(a.consultationFee) : null,
    })),
  };
}

export async function createPatientPaymentAction(
  patientId: string,
  input: PaymentInput
): Promise<ActionResult> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  if (!canWritePayments(auth.role)) {
    return { success: false, error: "ليس لديك صلاحية لتسجيل المدفوعات" };
  }

  const parsed = paymentInputSchema.safeParse(input);
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

  await prisma.transaction.create({
    data: {
      tenantId: auth.tenantId,
      type: "INCOME",
      category: parsed.data.category,
      amount: parsed.data.amount,
      description: parsed.data.description ?? null,
      date: new Date(parsed.data.date),
      patientId,
      appointmentId: parsed.data.appointmentId ?? null,
    },
  });

  revalidatePath(`/dashboard/patients/${patientId}`);
  return { success: true };
}

export async function updatePatientPaymentAction(
  paymentId: string,
  input: PaymentInput
): Promise<ActionResult> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  if (!canWritePayments(auth.role)) {
    return { success: false, error: "ليس لديك صلاحية لتعديل المدفوعات" };
  }

  const parsed = paymentInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await prisma.transaction.findFirst({
    where: { id: paymentId, tenantId: auth.tenantId },
    select: { id: true, type: true, patientId: true },
  });
  if (!existing || existing.type !== "INCOME" || !existing.patientId) {
    return { success: false, error: "الدفعة غير موجودة" };
  }

  if (parsed.data.appointmentId) {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: parsed.data.appointmentId,
        tenantId: auth.tenantId,
        patientId: existing.patientId,
      },
      select: { id: true },
    });
    if (!appointment) {
      return { success: false, error: "الموعد المحدد غير مرتبط بهذا المريض" };
    }
  }

  await prisma.transaction.update({
    where: { id: paymentId },
    data: {
      category: parsed.data.category,
      amount: parsed.data.amount,
      description: parsed.data.description ?? null,
      date: new Date(parsed.data.date),
      appointmentId: parsed.data.appointmentId ?? null,
    },
  });

  revalidatePath(`/dashboard/patients/${existing.patientId}`);
  revalidatePath(`/dashboard/patients/${existing.patientId}/payments/${paymentId}`);
  return { success: true };
}

export async function deletePatientPaymentAction(
  paymentId: string
): Promise<ActionResult> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  if (!canWritePayments(auth.role)) {
    return { success: false, error: "ليس لديك صلاحية لحذف المدفوعات" };
  }

  const existing = await prisma.transaction.findFirst({
    where: { id: paymentId, tenantId: auth.tenantId },
    select: { id: true, type: true, patientId: true },
  });
  if (!existing || existing.type !== "INCOME" || !existing.patientId) {
    return { success: false, error: "الدفعة غير موجودة" };
  }

  await prisma.transaction.delete({ where: { id: paymentId } });

  revalidatePath(`/dashboard/patients/${existing.patientId}`);
  revalidatePath(`/dashboard/patients/${existing.patientId}/payments/${paymentId}`);
  return { success: true };
}
