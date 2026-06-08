export type AppointmentStatus =
  | "BOOKING"
  | "WAITING"
  | "SCHEDULED"
  | "CONFIRMED"
  | "ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type PaymentStatus = "PENDING" | "PAID";

export const APPOINTMENT_STATUSES: readonly AppointmentStatus[] = [
  "BOOKING",
  "WAITING",
  "SCHEDULED",
  "CONFIRMED",
  "ARRIVED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;

export const PAYMENT_STATUSES: readonly PaymentStatus[] = ["PENDING", "PAID"] as const;

export interface PatientAppointmentRow {
  id: string;
  serviceName: string;
  doctorName: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  caseName: string | null;
  caseId: string | null;
  notes: string | null;
  consultationFee: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PatientAppointmentSummary {
  count: number;
  upcomingCount: number;
}

export interface ListAppointmentsResult {
  appointments: PatientAppointmentRow[];
  summary: PatientAppointmentSummary;
}

export interface PatientAppointmentDetail {
  id: string;
  patientId: string;
  patientName: string;
  tenantName: string;
  serviceName: string;
  doctorName: string;
  doctorId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  consultationFee: number | null;
  notes: string | null;
  caseId: string | null;
  caseName: string | null;
  transactions: {
    id: string;
    amount: number;
    category: string;
    date: string;
    description: string | null;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentInput {
  status?: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
}

export type ActionResult<T = void> =
  | (T extends void ? { success: true } : { success: true; data: T })
  | { success: false; error: string };
