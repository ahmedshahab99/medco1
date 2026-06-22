import type { ReminderType } from "@prisma/client";
import { Bell, CalendarCheck, CalendarX, Clock } from "lucide-react";
import type { ComponentType } from "react";

export type { ReminderType };

export const REMINDER_TEMPLATES: Record<ReminderType, string> = {
  CONFIRM:
    "مرحباً {patient_name}، تم استلام طلب حجزك بنجاح. موعدك يوم {appointment_date} الساعة {appointment_time} مع {doctor_name} في {clinic_name}. سنؤكد الموعد قريباً.",
  REMINDER:
    "مرحباً {patient_name}، نود تذكيرك بموعدك يوم {appointment_date} الساعة {appointment_time} مع {doctor_name} في {clinic_name}. نتطلع لرؤيتك!",
  RESCHEDULE:
    "مرحباً {patient_name}، تم تغيير موعدك إلى يوم {appointment_date} الساعة {appointment_time} مع {doctor_name} في {clinic_name}. نعتذر عن أي إزعاج.",
  CANCEL:
    "مرحباً {patient_name}، نأسف لإعلامك بإلغاء موعدك يوم {appointment_date} الساعة {appointment_time} مع {doctor_name} في {clinic_name}. يرجى التواصل معنا لإعادة الحجز.",
};

export const REMINDER_TYPE_NAMES: Record<ReminderType, string> = {
  CONFIRM: "تأكيد الحجز",
  REMINDER: "تذكير قبل الموعد",
  RESCHEDULE: "إعادة الجدولة",
  CANCEL: "إلغاء الموعد",
};

export const REMINDER_TYPE_CONFIG: Record<
  ReminderType,
  {
    label: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
  }
> = {
  CONFIRM: {
    label: "تأكيد الحجز",
    description: "تأكيد استلام طلب الحجز للمريض",
    icon: CalendarCheck,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-100",
  },
  REMINDER: {
    label: "تذكير قبل الموعد",
    description: "تذكير المريض بموعده القادم",
    icon: Bell,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-100",
  },
  RESCHEDULE: {
    label: "إعادة الجدولة",
    description: "إشعار المريض بتغيير موعده",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-100",
  },
  CANCEL: {
    label: "إلغاء الموعد",
    description: "إشعار المريض بإلغاء الموعد",
    icon: CalendarX,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-100",
  },
};

export const MESSAGE_VARIABLES = [
  { key: "{patient_name}", label: "اسم المريض" },
  { key: "{appointment_date}", label: "تاريخ الموعد" },
  { key: "{appointment_time}", label: "وقت الموعد" },
  { key: "{doctor_name}", label: "اسم الطبيب" },
  { key: "{clinic_name}", label: "اسم العيادة" },
];
