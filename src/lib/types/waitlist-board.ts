export type WaitlistStatus = "BOOKING" | "WAITING" | "IN_PROGRESS" | "COMPLETED";

export interface BoardPatient {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  status: WaitlistStatus;
  addedAt: string;
  appointmentStartTime?: string;
  appointmentEndTime?: string;
  serviceName?: string;
  serviceColor?: string;
  doctorName?: string;
}

export interface ColumnDefinition {
  id: WaitlistStatus;
  title: string;
  color: string;
  bgColor: string;
  headerBgColor: string;
  borderColor: string;
}

export const COLUMNS: ColumnDefinition[] = [
  {
    id: "BOOKING",
    title: "قيد الحجز",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    headerBgColor: "bg-blue-700",
    borderColor: "border-blue-200",
  },
  {
    id: "WAITING",
    title: "قائمة الانتظار",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    headerBgColor: "bg-amber-700",
    borderColor: "border-amber-200",
  },
  {
    id: "IN_PROGRESS",
    title: "للخدمة",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    headerBgColor: "bg-emerald-700",
    borderColor: "border-emerald-200",
  },
  {
    id: "COMPLETED",
    title: "مكتمل",
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    headerBgColor: "bg-slate-600",
    borderColor: "border-slate-200",
  },
];
