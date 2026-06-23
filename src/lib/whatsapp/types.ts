import type { ReminderType } from "@prisma/client";

export interface AppointmentData {
  id: string;
  patient: { id: string; firstName: string; lastName: string; phone: string };
  startTime: Date;
  service: { name: string };
  tenant: { name: string };
}

export interface WhatsAppTemplateConfig {
  name: string;
  language: string;
  paramOrder: string[];
  resolve: (data: AppointmentData) => Record<string, string>;
}

export interface SendTemplateParams {
  toPhone: string;
  templateName: string;
  languageCode: string;
  parameters: { type: "text"; text: string }[];
}

export interface SendTemplateResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

export interface DispatchParams {
  appointmentId: string;
  type: ReminderType;
  tenantId: string;
}

export interface DispatchResult {
  success: boolean;
  messageLogId?: string;
  error?: string;
}
