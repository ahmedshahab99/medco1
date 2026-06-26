import prisma from "@/lib/prisma";
import { sendWhatsAppTemplateMessage } from "./service";
import { WHATSAPP_TEMPLATES } from "./template-config";
import type { DispatchParams, DispatchResult, AppointmentData } from "./types";
import { enforceWhatsappQuota } from "@/lib/plans/enforce";
import { incrementWhatsapp } from "@/lib/plans/usage";

async function fetchAppointmentData(
  appointmentId: string,
  tenantId: string
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId, tenantId },
    include: {
      patient: {
        select: { id: true, firstName: true, lastName: true, phone: true },
      },
      service: { select: { name: true } },
      tenant: { select: { name: true } },
    },
  });

  if (!appointment) {
    return { error: "Appointment not found" as const };
  }

  if (!appointment.patient.phone) {
    return { error: "Patient has no phone number" as const };
  }

  const data: AppointmentData = {
    id: appointment.id,
    patient: {
      id: appointment.patient.id,
      firstName: appointment.patient.firstName,
      lastName: appointment.patient.lastName,
      phone: appointment.patient.phone!,
    },
    startTime: appointment.startTime,
    service: appointment.service,
    tenant: appointment.tenant,
  };

  return { data };
}

export async function sendTemplateMessage(
  params: DispatchParams
): Promise<DispatchResult> {
  const config = WHATSAPP_TEMPLATES[params.type];
  if (!config) {
    return {
      success: false,
      error: `No template config for type: ${params.type}`,
    };
  }

  const fetched = await fetchAppointmentData(
    params.appointmentId,
    params.tenantId
  );
  if ("error" in fetched) return { success: false, error: fetched.error };

  const { data } = fetched;
  const vars = config.resolve(data);
  const parameters = config.paramOrder.map((key) => ({
    type: "text" as const,
    text: vars[key],
  }));

  // Enforce monthly WhatsApp quota before attempting the send.
  const guard = await enforceWhatsappQuota(params.tenantId);
  if (!guard.allowed) {
    return { success: false, error: guard.reason ?? "whatsapp quota reached" };
  }

  const result = await sendWhatsAppTemplateMessage({
    toPhone: data.patient.phone,
    templateName: config.name,
    languageCode: config.language,
    parameters,
  });

  await prisma.messageLog.create({
    data: {
      tenantId: params.tenantId,
      type: params.type,
      appointmentId: data.id,
      patientId: data.patient.id,
      toPhone: data.patient.phone,
      messageContent: JSON.stringify({
        template: config.name,
        variables: vars,
      }),
      status: result.success ? "SENT" : "FAILED",
      externalId: result.externalId ?? null,
      sentAt: result.success ? new Date() : null,
      errorMessage: result.error ?? null,
    },
  });

  if (result.success) {
    await incrementWhatsapp(params.tenantId);
  }

  return result;
}
