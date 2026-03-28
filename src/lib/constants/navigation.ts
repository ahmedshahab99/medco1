import {
  Home,
  Globe,
  Star,
  Settings,
  Calendar,
  Clock,
  Users,
  UserSquare2,
  Tags,
  MessageSquare,
  Megaphone,
  CreditCard,
  FileText,
  PackageSearch,
  UsersRound,
  Calculator,
  TrendingUp,
  UserX,
  PieChart,
  Palette,
  ShieldCheck,
  Receipt,
  Briefcase
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
      { title: "الحملات الإعلانية", href: "/dashboard/campaigns", icon: Megaphone },
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
      { title: "المخزون", href: "/dashboard/inventory", icon: PackageSearch },
      { title: "طاقم العمل", href: "/dashboard/staff", icon: Briefcase },
      { title: "الحضور والرواتب", href: "/dashboard/payroll", icon: Calculator },
    ],
  },
  {
    label: "التحليلات",
    items: [
      { title: "اتجاهات المواعيد", href: "/dashboard/analytics/trends", icon: TrendingUp },
      { title: "معدل الغياب", href: "/dashboard/analytics/no-shows", icon: UserX },
      { title: "إحصاءات الإيرادات", href: "/dashboard/analytics/revenue", icon: PieChart },
    ],
  },
  {
    label: "الإعدادات",
    items: [
      { title: "الملف الشخصي والهوية", href: "/dashboard/settings/branding", icon: Palette },
      { title: "المستخدمين والصلاحيات", href: "/dashboard/settings/users", icon: ShieldCheck },
      { title: "الاشتراك والفواتير", href: "/dashboard/settings/billing", icon: Receipt },
    ],
  },
];
