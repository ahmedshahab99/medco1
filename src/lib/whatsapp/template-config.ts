import type { ReminderType } from "@prisma/client";
import type { WhatsAppTemplateConfig } from "./types";

const dateFormatter = new Intl.DateTimeFormat("ar-SA", {
  dateStyle: "full",
  timeZone: "Asia/Riyadh",
});

const timeFormatter = new Intl.DateTimeFormat("ar-SA", {
  timeStyle: "short",
  timeZone: "Asia/Riyadh",
});

function fullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`;
}

function generateOtp() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export const WHATSAPP_TEMPLATES: Record<ReminderType, WhatsAppTemplateConfig> = {
  CONFIRM: {
    name: "appointment_confirmed",
    language: "ar",
    paramOrder: [
      "patient_name",
      "appointment_datetime",
      "service_name",
      "appointment_ref",
    ],
    resolve: (d, overrides) => ({
      patient_name: fullName(d.patient.firstName, d.patient.lastName),
      appointment_datetime: `${dateFormatter.format(d.startTime)} في الساعة ${timeFormatter.format(d.startTime)}`,
      service_name: d.service.name,
      appointment_ref: overrides?.otpCode ?? generateOtp(),
    }),
  },
  REMINDER: {
    name: "appointment_reminder_2",
    language: "ar",
    paramOrder: [
      "patient_name",
      "clinic_name",
      "appointment_date",
      "appointment_time",
    ],
    resolve: (d) => ({
      patient_name: fullName(d.patient.firstName, d.patient.lastName),
      clinic_name: d.tenant.name,
      appointment_date: dateFormatter.format(d.startTime),
      appointment_time: timeFormatter.format(d.startTime),
    }),
  },
  RESCHEDULE: {
    name: "appointment_reschedule_1",
    language: "ar",
    paramOrder: [
      "patient_name",
      "clinic_name",
      "appointment_date",
      "appointment_time",
    ],
    resolve: (d) => ({
      patient_name: fullName(d.patient.firstName, d.patient.lastName),
      clinic_name: d.tenant.name,
      appointment_date: dateFormatter.format(d.startTime),
      appointment_time: timeFormatter.format(d.startTime),
    }),
  },
  CANCEL: {
    name: "appointment_cancelled",
    language: "ar",
    paramOrder: ["patient_name", "appointment_date"],
    resolve: (d) => ({
      patient_name: fullName(d.patient.firstName, d.patient.lastName),
      appointment_date: dateFormatter.format(d.startTime),
    }),
  },
};
