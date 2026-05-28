import {
  Home,
  Globe,
  Star,
  Calendar,
  Clock,
  Users,
  UserSquare2,
  Tags,
  MessageSquare,
  CreditCard,
  FileText,
  UsersRound,
  PieChart,
  Palette,
  ShieldCheck,
  UserPlus,
  User
} from "lucide-react";
import { NavGroup } from "../types/dashboard";

export const navigationGroups: NavGroup[] = [
  {
    label: "الرئيسية",
    items: [
      { title: "نظرة عامة", href: "/dashboard", icon: Home },
    ],
  },
  {
    label: "الحضور العام",
    items: [
      { title: "الصفحة الشخصية", href: "/dashboard/profile", icon: Globe },
      { title: "الخدمات", href: "/dashboard/services", icon: Star },
      { title: "التقييمات", href: "/dashboard/reviews", icon: MessageSquare },
    ],
  },
  {
    label: "جدولة المواعيد",
    items: [
      { title: "التقويم", href: "/dashboard/calendar", icon: Calendar },
      { title: "أوقات العمل", href: "/dashboard/availability", icon: Clock },
      { title: "قائمة الانتظار", href: "/dashboard/waitlist", icon: Users },
    ],
  },
  {
    label: "المرضى",
    items: [
      { title: "قائمة المرضى", href: "/dashboard/patients", icon: UsersRound },
      { title: "تفاصيل المريض", href: "/dashboard/patients/details", icon: UserSquare2 },
      { title: "التصنيفات", href: "/dashboard/patients/tags", icon: Tags },
    ],
  },
  {
    label: "التواصل",
    items: [
      { title: "التذكيرات", href: "/dashboard/reminders", icon: MessageSquare },
    ],
  },
  {
    label: "المالية",
    items: [
      { title: "الفواتير والمدفوعات", href: "/dashboard/invoices", icon: CreditCard },
      { title: "التقارير", href: "/dashboard/reports", icon: FileText },
    ],
  },
  {
    label: "العمليات والإدارة",
    items: [
      { title: "الدعوات", href: "/dashboard/invite", icon: UserPlus },
    ],
  },
  {
    label: "التحليلات",
    items: [
      { title: "إحصاءات الإيرادات", href: "/dashboard/analytics/revenue", icon: PieChart },
    ],
  },
  {
    label: "الإعدادات",
    items: [
      { title: "حسابي", href: "/dashboard/account", icon: User },
      { title: "الملف الشخصي والهوية", href: "/dashboard/settings/branding", icon: Palette },
      { title: "المستخدمين والصلاحيات", href: "/dashboard/settings/users", icon: ShieldCheck },
    ],
  },
];
