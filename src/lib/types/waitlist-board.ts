import type { WaitlistStatus } from "@/lib/mock/waitlist-data";

export interface ColumnDefinition {
  id: WaitlistStatus;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const COLUMNS: ColumnDefinition[] = [
  {
    id: "BOOKING",
    title: "قيد الحجز",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "WAITING",
    title: "قائمة الانتظار",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    id: "IN_PROGRESS",
    title: "للخدمة",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    id: "COMPLETED",
    title: "مكتمل",
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
  },
];
