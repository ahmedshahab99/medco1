import { ElementType } from "react";

export type NavItem = {
  title: string;
  href: string;
  icon: ElementType;
  disabled?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

// ─── PATIENT ──────────────────────────────────────────────────────────────────

export type PatientTag =
  | "VIP"
  | "مزمن"
  | "جديد"
  | "متابعة"
  | "خطر مرتفع"
  | "حساسية"
  | string;

export type PatientGender = "male" | "female";

export type PatientStatus = "active" | "inactive";

export type PatientFile = {
  id: string;
  name: string;
  type: "image" | "pdf" | "lab" | "other";
  size: string;
  date: string;
  url?: string;
};

export type MedicalNote = {
  id: string;
  appointmentId: string;
  content: string;
  createdAt: string;
  doctorName: string;
};

export type CommunicationLog = {
  id: string;
  channel: "sms" | "whatsapp" | "email";
  message: string;
  status: "sent" | "delivered" | "failed";
  date: string;
};

export type VisitRecord = {
  id: string;
  date: string;
  service: string;
  doctor: string;
  status: "completed" | "no_show" | "cancelled";
  noteId?: string;
  hasFiles?: boolean;
};

export type Patient = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  dateOfBirth?: string;
  gender?: PatientGender;
  avatar?: string;
  status: PatientStatus;
  tags: PatientTag[];
  doctor?: string;
  lastVisit?: string;
  nextAppointment?: string;
  totalVisits: number;
  totalSpent?: number;
  visitHistory: VisitRecord[];
  notes: MedicalNote[];
  files: PatientFile[];
  communications: CommunicationLog[];
  address?: string;
};

// ─── APPOINTMENT ──────────────────────────────────────────────────────────────

export type Appointment = {
  id: string;
  patientName: string;
  date: string;
  time: string;
  type: "consultation" | "follow-up" | "treatment";
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  doctor: string;
};

// ─── DASHBOARD STAT CARD ──────────────────────────────────────────────────────

export type StatCardData = {
  title: string;
  value: string | number;
  trend: number;
  trendLabel?: string;
  icon?: ElementType;
};
