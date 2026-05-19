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

// ─── APPOINTMENT ──────────────────────────────────────────────────────────────

export type Appointment = {
  id: string;
  patientName: string;
  date: string;
  time: string;
  type: "consultation" | "follow-up" | "treatment";
  status: "SCHEDULED" | "CONFIRMED" | "ARRIVED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
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

// ─── PATIENT ──────────────────────────────────────────────────────────────────

export type PatientStatus = "active" | "inactive";
export type PatientGender = "male" | "female";

export type PatientVisit = {
  id: string;
  date: string;
  time: string;
  service: string;
  doctor: string;
  status: string;
};

export type PatientNote = {
  id: string;
  appointmentId: string | null;
  content: string;
  createdAt: string;
  doctorName: string;
};

export type PatientFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  date: string;
  url: string;
};

export type Patient = {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone: string;
  dateOfBirth?: string;
  gender?: PatientGender;
  status: PatientStatus;
  tags: string[];
  totalVisits: number;
  visitHistory: PatientVisit[];
  notes: PatientNote[];
  files: PatientFile[];
  communications: any[];
  nextAppointment?: string;
};
