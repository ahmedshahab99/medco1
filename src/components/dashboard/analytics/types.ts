import type { AppointmentStatus } from "@/lib/types/appointments";

export type AnalyticsAppointment = {
  id: string;
  status: AppointmentStatus;
  startTime: string;
  endTime: string;
  patient: { id: string; name: string } | null;
  doctor: { id: string; name: string } | null;
  service: { name: string } | null;
};

export type DoctorAppointments = {
  doctorId: string;
  doctorName: string;
  totalAppointments: number;
  completedCount: number;
};

export type StatusBreakdown = {
  status: AppointmentStatus;
  count: number;
};

export type GenderBreakdown = {
  gender: string;
  count: number;
};

export type MonthlyTrend = {
  month: number;
  label: string;
  appointments: number;
  completed: number;
  newPatients: number;
};

export type AnalyticsSummary = {
  totalAppointments: number;
  completed: number;
  cancelledNoShow: number;
  newPatients: number;
};

export type AnalyticsInitialData = {
  summary: AnalyticsSummary;
  appointments: AnalyticsAppointment[];
  byDoctor: DoctorAppointments[];
  statusBreakdown: StatusBreakdown[];
  genderBreakdown: GenderBreakdown[];
  monthlyTrend: MonthlyTrend[];
};

export const monthNames = [
  "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export const statusLabels: Record<AppointmentStatus, string> = {
  BOOKING: "حجز",
  WAITING: "انتظار",
  SCHEDULED: "مجدول",
  CONFIRMED: "مؤكد",
  IN_PROGRESS: "قيد التنفيذ",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
  NO_SHOW: "لم يحضر",
};
