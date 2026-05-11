import {
  CheckCircle,
  Clock,
  User,
  XCircle,
  AlertCircle,
  CheckSquare,
  type LucideIcon,
} from "lucide-react";
import { START_HOUR, HOUR_HEIGHT } from "./constants";

export const STATUS_MAP: Record<
  string,
  { label: string; icon: LucideIcon; badgeClass: string }
> = {
  SCHEDULED: {
    label: "قيد الانتظار",
    icon: Clock,
    badgeClass: "bg-amber-100 text-amber-700",
  },
  CONFIRMED: {
    label: "مؤكد",
    icon: CheckCircle,
    badgeClass: "bg-blue-100 text-blue-700",
  },
  ARRIVED: {
    label: "تم الوصول",
    icon: User,
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
  COMPLETED: {
    label: "مكتمل",
    icon: CheckSquare,
    badgeClass: "bg-slate-100 text-slate-700",
  },
  CANCELLED: {
    label: "ملغي",
    icon: XCircle,
    badgeClass: "bg-red-100 text-red-700",
  },
  NO_SHOW: {
    label: "لم يحضر",
    icon: AlertCircle,
    badgeClass: "bg-red-100 text-red-700",
  },
};

export function snapToQuarter(date: Date): Date {
  const minutes = date.getMinutes();
  const snappedMinutes = Math.round(minutes / 15) * 15;
  const newDate = new Date(date);
  newDate.setMinutes(snappedMinutes);
  newDate.setSeconds(0);
  newDate.setMilliseconds(0);
  return newDate;
}

export function pixelsToTime(y: number, baseDate: Date): Date {
  const hoursDecimal = y / HOUR_HEIGHT + START_HOUR;
  const hours = Math.floor(hoursDecimal);
  const minutes = Math.round((hoursDecimal - hours) * 60);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function getTimeFromPointer(
  e: React.PointerEvent | PointerEvent,
  baseDate: Date,
  containerRef: React.RefObject<HTMLDivElement | null>
): Date {
  if (!containerRef.current) return baseDate;
  const rect = containerRef.current.getBoundingClientRect();
  const y = e.clientY - rect.top + containerRef.current.scrollTop;
  
  return pixelsToTime(y, baseDate);
}
