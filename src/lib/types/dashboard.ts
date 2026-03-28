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

export type Patient = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  lastVisit: string;
  status: "active" | "inactive";
};

export type Appointment = {
  id: string;
  patientName: string;
  date: string;
  time: string;
  type: "consultation" | "follow-up" | "treatment";
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  doctor: string;
};

export type StatCardData = {
  title: string;
  value: string | number;
  trend: number; // positive or negative percentage
  trendLabel?: string;
  icon?: ElementType;
};
