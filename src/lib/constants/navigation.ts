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
  User,
  BarChart3
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
      { title: "الخدمات", href: "/dashboard/services", icon: Star }
      
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
      
     
    ],
  },
  {
    label: "التواصل",
    items: [
      { title: "التذكيرات", href: "/dashboard/reminders", icon: MessageSquare },
    ],
  },
  {
    label: "التحليلات",
    items: [
      { title: "الفواتير والمدفوعات", href: "/dashboard/invoices", icon: CreditCard },
      { title: "إحصاءات ", href: "/dashboard/analytics", icon: PieChart},
     
    ],
  },
  {
    label: "العمليات والإدارة",
    items: [
      { title: "الدعوات", href: "/dashboard/invite", icon: UserPlus },
      { title: "المستخدمين والصلاحيات", href: "/dashboard/settings/users", icon: ShieldCheck }
    ],
  },
  
  {
    label: "الإعدادات",
    items: [
      { title: "حسابي", href: "/dashboard/account", icon: User },
      
      { title: "الباقة والاستخدام", href: "/dashboard/settings/plans", icon: BarChart3 },
    ],
  },
];
