/**
 * Shared types for the Patient Payments tab.
 * Mirrors the Transaction model in prisma/schema.prisma (INCOME only).
 */

export type PatientPaymentCategory =
  | "CONSULTATION"
  | "MEDICATIONS"
  | "SERVICES"
  | "OTHER";

export const PATIENT_PAYMENT_CATEGORIES: readonly PatientPaymentCategory[] = [
  "CONSULTATION",
  "MEDICATIONS",
  "SERVICES",
  "OTHER",
] as const;

export interface PatientPaymentRow {
  id: string;
  type: "INCOME";
  category: PatientPaymentCategory;
  amount: number;
  description: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  appointmentId: string | null;
  appointment: {
    id: string;
    startTime: string;
    service: { name: string } | null;
  } | null;
  serviceId: string | null;
  service: { name: string } | null;
  tenantName: string;
  patientName: string;
}

export interface PatientPaymentSummary {
  totalPaid: number;
  count: number;
  lastPaymentAt: string | null;
}

export interface PatientAppointmentOption {
  id: string;
  startTime: string;
  serviceName: string | null;
  status: string;
  consultationFee: number | null;
}

export interface ServiceOption {
  id: string;
  name: string;
  price: number | null;
}

export interface PaymentInput {
  amount: number;
  category: PatientPaymentCategory;
  date: string;
  description?: string;
  appointmentId?: string | null;
  serviceId?: string | null;
}

export interface ListPaymentsResult {
  payments: PatientPaymentRow[];
  summary: PatientPaymentSummary;
}

export type ActionResult<T = void> =
  | (T extends void ? { success: true } : { success: true; data: T })
  | { success: false; error: string };
