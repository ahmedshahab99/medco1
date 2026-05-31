import {
  Activity,
  BadgeCheck,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardCheck,
  FileText,
  Handshake,
  LockKeyhole,
  MessageSquareText,
  Pill,
  ShieldCheck,
  Stethoscope,
  UsersRound,
} from "lucide-react";

export const landingContent = {
  nav: [
    { label: "المزايا", href: "#features" },
    { label: "المسارات", href: "#paths" },
    { label: "كيف يعمل", href: "#workflow" },
    { label: "الأمان", href: "#trust" },
  ],
  hero: {
    badge: "منصة عيادات ذكية ومتكاملة",
    title: "ميدكو تربط الطبيب بإدارة عيادته وبالعروض الطبية المناسبة له.",
    description:
      "واجهة عربية احترافية لإدارة المرضى والمواعيد والوصفات والفواتير، مع بوابة مستقلة للمندوبين لعرض الأدوية والمنتجات على العيادات المسجلة بشكل خاص ومنظم.",
    doctorCta: "ابدأ كطبيب",
    repCta: "انضم كمندوب",
    login: "تسجيل الدخول",
  },
  stats: [
    { value: "24/7", label: "متابعة تشغيل" },
    { value: "100+", label: "عيادة قابلة للربط" },
    { value: "خاص", label: "عروض مندوبين داخلية" },
  ],
  paths: [
    {
      title: "للأطباء والعيادات",
      description:
        "أنشئ حساب العيادة، أضف فريقك الطبي، ونظم رحلة المريض من الحجز إلى الفاتورة.",
      href: "/signup",
      cta: "تسجيل طبيب",
      icon: Stethoscope,
      points: ["ملفات مرضى منظمة", "مواعيد ووصفات", "لوحة مالية وتشغيلية"],
    },
    {
      title: "للمندوبين الطبيين",
      description:
        "سجل كشركة أو مندوب، أضف منتجاتك، ثم تواصل مع العيادات المسجلة بعروض خاصة.",
      href: "/signup/salesrep",
      cta: "تسجيل مندوب",
      icon: Handshake,
      points: ["منتجات وأسعار", "اختيار العيادة المناسبة", "تتبع حالة العرض"],
    },
  ],
  features: [
    {
      title: "إدارة العيادة",
      description: "ملفات المرضى، الجلسات، الملاحظات الطبية، والفواتير في مكان واحد.",
      icon: ClipboardCheck,
    },
    {
      title: "جدولة واضحة",
      description: "مواعيد يومية، قوائم انتظار، وحالات حجز تساعد الفريق على العمل بسرعة.",
      icon: CalendarDays,
    },
    {
      title: "وصفات وأدوية",
      description: "إنشاء وصفات رقمية ومتابعة الأدوية بجانب العروض القادمة من المندوبين.",
      icon: Pill,
    },
    {
      title: "تقارير تشغيلية",
      description: "نظرة فورية على الإيرادات، المرضى، المواعيد، ونشاط العيادة.",
      icon: ChartNoAxesCombined,
    },
  ],
  workflow: [
    {
      title: "الطبيب يسجل العيادة",
      description: "حساب الطبيب يقود إلى إعداد العيادة ولوحة التحكم الرئيسية.",
      icon: Building2,
    },
    {
      title: "المندوب يسجل منتجاته",
      description: "بيانات الشركة والمنتجات تحفظ في بوابة منفصلة عن حسابات الأطباء.",
      icon: Pill,
    },
    {
      title: "العروض تصل بشكل خاص",
      description: "المندوب يختار عيادة مسجلة ويرسل عرضا لا يظهر إلا داخل مساره.",
      icon: LockKeyhole,
    },
  ],
  trust: [
    { label: "واجهة عربية RTL", icon: BadgeCheck },
    { label: "تجربة موبايل أولا", icon: Activity },
    { label: "فصل واضح بين الأدوار", icon: UsersRound },
    { label: "تواصل مهني خاص", icon: MessageSquareText },
    { label: "صلاحيات آمنة", icon: ShieldCheck },
    { label: "سجلات قابلة للتتبع", icon: FileText },
  ],
  dashboardPreview: {
    title: "نظرة من بوابة المندوب",
    subtitle: "اختر العيادة، حدد المنتج، وأرسل عرضا خاصا.",
    clinics: ["عيادة الحياة التخصصية", "مركز النخبة الطبي", "عيادة الشفاء"],
    product: "Cardio Plus 20mg",
    status: "قيد مراجعة الطبيب",
  },
  finalCta: {
    title: "ابدأ بالمسار الصحيح من أول نقرة.",
    description:
      "الأطباء لهم حساب عيادة كامل، والمندوبون لهم بوابة مستقلة للوصول إلى العيادات المسجلة وتقديم عروضهم باحتراف.",
  },
} as const;

export type LandingContent = typeof landingContent;
