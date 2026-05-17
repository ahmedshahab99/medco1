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
