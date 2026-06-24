"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stethoscope, CalendarPlus, Users, FileText, Receipt, Building2,
  ChevronDown, ArrowLeft, ArrowRight, Check, Star, Shield, Clock,
  Phone, Mail, MapPin, MessageSquare, Menu, X, HeartPulse, Activity,
  ClipboardList, Pill, TrendingUp, Award, Zap, Globe, Lock,
  Smartphone, BarChart3, Layers, BadgeCheck, Sparkles, CircleDot,
} from "lucide-react";

type Lang = "ar" | "en";
type Page = "home" | "features" | "pricing" | "contact" | "faq";

const T = {
  ar: {
    dir: "rtl" as const,
    nav: { home: "الرئيسية", features: "المميزات", pricing: "الباقات", contact: "تواصل", faq: "أسئلة", login: "دخول", signup: "ابدأ مجاناً" },
    hero: {
      badge: "النظام الأول من نوعه في العراق",
      title1: "عيادتك،",
      title2: "ب نبضٍ رقمي",
      title3: "جديد",
      subtitle: "منصة ذكية تُدير عيادتك بالكامل — المرضى، المواعيد، الوصفات، والمال — كل شيء في مكان واحد بسلاسة مطلقة.",
      cta1: "ابدأ مجاناً الآن",
      cta2: "شاهد كيف يعمل",
    },
    pulse: {
      label: "نبض العيادة الرقمية",
      stats: [
        { val: "2500+", lbl: "مريض نشط", icon: Users },
        { val: "150+", lbl: "عيادة تثق بنا", icon: Building2 },
        { val: "99.9%", lbl: "وقت التشغيل", icon: Activity },
        { val: "24/7", lbl: "دعم فني", icon: HeartPulse },
      ],
    },
    pain: {
      badge: "المشكلة",
      title: "عيادتك تستحق أفضل من الورق والفوضى",
      items: [
        { icon: CalendarPlus, title: "مواعيد ضائعة", desc: "مواعيد تُنسى أو تتضارب لأنك تعتمد على الورق أو الدفتر" },
        { icon: FileText, title: "سجلات مبعثرة", desc: "ملفات المرضى بين أدراج مختلفة، وصفات مكتوبة بخط اليد لا تُقرأ" },
        { icon: Receipt, title: "ماليات غير واضحة", desc: "لا تعرف بالضبط كم دخّلت وكم صرفت في آخر شهر" },
        { icon: Clock, title: "وقت يضيع هباءً", desc: "ساعات تضيع يومياً في التنظيم بدلاً من تركيزك على المريض" },
      ],
    },
    solution: {
      badge: "الحل",
      title: "نظام واحد يحوّل فوضى عيادتك إلى سلاسة رقمية",
      subtitle: "كل ما تحتاجه لإدارة عيادتك بذكاء وكفاءة — من أول موعد إلى آخر فاتورة.",
      items: [
        { icon: Users, title: "إدارة المرضى", desc: "سجلات كاملة مع التاريخ الطبي والحساسية والأدوية المتفاعلة", color: "from-blue-500 to-cyan-400" },
        { icon: CalendarPlus, title: "جدولة ذكية", desc: "مواعيد تلقائية مع تذكيرات واتساب وتتبع حالة كل زيارة", color: "from-emerald-500 to-teal-400" },
        { icon: Stethoscope, title: "الجلسات الطبية", desc: "سجّل التشخيصات والعلاجات وأنشئ سلاسل متابعة متكاملة", color: "from-violet-500 to-purple-400" },
        { icon: Pill, title: "الوصفات الرقمية", desc: "وصفات احترافية بطباعة نظيفة وقابلة للتخصيص بالكامل", color: "from-amber-500 to-orange-400" },
        { icon: BarChart3, title: "الإدارة المالية", desc: "تتبع المدفوعات والمصروفات مع تقارير شهرية واضحة", color: "from-rose-500 to-pink-400" },
        { icon: Building2, title: "متعدد الفروع", desc: "أدر أكثر من عيادة ببيانات معزولة وتحكم مركزي كامل", color: "from-indigo-500 to-blue-400" },
      ],
    },
    dayInLife: {
      badge: "يوم في عيادتك",
      title: "من الصباح حتى المساء، كل شيء رقمي",
      steps: [
        { time: "8:00 ص", title: "فتحت العيادة", desc: "لوحة التحكم تعرض لك مواعيد اليوم والإحصائيات فوراً", icon: Activity },
        { time: "8:30 ص", title: "أول مريض وصل", desc: "بطاقة الانتظار تتحرك تلقائياً من العمود للأخرى عند كل مرحلة", icon: Users },
        { time: "9:15 ص", title: "كشف وتشخيص", desc: "سجّل التشخيص والوصفة بنقرات قليلة، وشاهد تاريخ المريض كاملاً", icon: Stethoscope },
        { time: "10:00 ص", title: "وصفة طباعة", desc: "وصفة احترافية جاهزة للطباعة بتنسيق العيادة وشعارها", icon: FileText },
        { time: "11:30 ص", title: "تسديد دفع", desc: "سجّل الدفع بنقرة واحدة، والإيرادات تتحدث تلقائياً في التقارير", icon: Receipt },
        { time: "2:00 م", title: "نهاية اليوم", desc: "تقرير يومي شامل: كم مريض، كم إيراد، كم مصروف — كل شيء واضح", icon: TrendingUp },
      ],
    },
    whyUs: {
      badge: "لماذا نحن؟",
      title: "مصممون خصيصاً للعيادات العراقية",
      items: [
        { icon: Globe, title: "عربي وكوردي وإنجليزي", desc: "واجهة متعددة اللغات تناسب جميع الكوادر الطبية في العراق" },
        { icon: Shield, title: "لا حاجة لبطاقة ائتمان", desc: "ابدأ مجاناً وادفع عندما تكون جاهزاً. بدون أي التزامات" },
        { icon: MessageSquare, title: "تكامل واتساب وزين كاش", desc: "تذكيرات تلقائية عبر واتساب ودفع إلكتروني عراقي" },
        { icon: Lock, title: "بيانات آمنة في أوروبا", desc: "خوادم أوروبية بتشفير مصرفي لحماية بيانات مرضاك" },
      ],
      stats: [
        { val: "500+", lbl: "عيادة نشطة" },
        { val: "50K+", lbl: "مريض مسجل" },
        { val: "99.9%", lbl: "وقت التشغيل" },
        { val: "4.9★", lbl: "تقييم العملاء" },
      ],
    },
    pricing: {
      badge: "الباقات",
      title: "أسعار شفافة لكل حجم عيادة",
      sub: "ابدأ مجاناً. وسع عندما تحتاج. بدون رسوم خفية.",
      toggle: ["شهري", "سنوي"],
      save: "وفر 17%",
      plans: [
        { name: "المبتدئة", tagline: "للاستكشاف والتجربة", monthlyPrice: "0", yearlyPrice: "0", doctors: "طبيب واحد", highlight: false, features: ["50 مريض", "50 موعد/شهر", "سجلات أساسية", "لوحة الانتظار", "دعم بريد إلكتروني"], cta: "ابدأ مجاناً" },
        { name: "الاحترافية", tagline: "الخيار الأفضل", monthlyPrice: "75,000", yearlyPrice: "750,000", doctors: "حتى 3 أطباء", highlight: true, features: ["غير محدود: مرضى ومواعيد", "سجلات طبية كاملة (حالات، ملفات)", "تذكيرات واتساب (500/شهر)", "تقارير مالية", "دعم أولوية"], cta: "ابدأ الآن" },
        { name: "الأعمال", tagline: "للعيادات المتقدمة", monthlyPrice: "200,000", yearlyPrice: "2,000,000", doctors: "حتى 10 أطباء", highlight: false, features: ["كل مميزات الاحترافية", "فروع متعددة", "تحليلات متقدمة", "مدير حساب مخصص", "دعم هاتف / واتساب"], cta: "ابدأ الآن" },
      ],
      enterpriseNote: "لأكثر من 10 أطباء؟",
      enterpriseCta: "تواصل معنا لسعر مخصص",
      currency: "د.ع",
      period: "/شهر",
      yearNote: "تُدفع سنوياً",
    },
    contact: {
      badge: "تواصل معنا",
      title: "فريقنا جاهز لمساعدتك",
      sub: "نحن هنا للإجابة على جميع استفساراتك — أي وقت.",
      info: [
        { icon: Mail, label: "البريد الإلكتروني", value: "info@digitalclinic.iq" },
        { icon: Phone, label: "الهاتف", value: "+964 770 281 4484" },
        { icon: MessageSquare, label: "واتساب", value: "+964 770 281 4484" },
        { icon: MapPin, label: "الموقع", value: "العراق، بغداد" },
      ],
      form: { title: "أرسل رسالة", name: "الاسم الكامل", namePh: "اسمك الكريم", email: "البريد الإلكتروني", emailPh: "example@email.com", phone: "رقم الهاتف", phonePh: "07xxxxxxxxx", subject: "الموضوع", subjectPh: "موضوع الرسالة", clinic: "اسم العيادة (اختياري)", clinicPh: "اسم عيادتك", message: "رسالتك", messagePh: "اكتب رسالتك هنا...", submit: "إرسال الرسالة", success: "تم إرسال رسالتك بنجاح! سيتواصل معك فريقنا خلال 24 ساعة." },
    },
    faq: {
      badge: "أسئلة شائعة",
      title: "إجابات لأسئلتك",
      sub: "لم تجد ما تبحث عنه؟",
      contact: "تواصل مع فريق الدعم",
      groups: [
        { title: "البدء", items: [
          { q: "هل يمكنني ترقية أو تخفيض باقتي؟", a: "نعم! يمكنك الترقية أو التخفيض في أي وقت. عند الترقية تحصل على وصول فوري للميزات الجديدة. عند التخفيض تسري التغييرات في نهاية فترة الفوترة." },
          { q: "هل تتوفر فترة تجريبية مجانية؟", a: "نعم، نقدم باقة مبتدئة مجانية تتيح لك إدارة 50 مريض و50 موعد شهرياً مع الميزات الأساسية. عندما تحتاج المزيد، يمكنك الترقية للباقة الاحترافية." },
          { q: "هل يمكنني إلغاء اشتراكي؟", a: "نعم، يمكنك الإلغاء في أي وقت. ستظل بياناتك متاحة حتى نهاية فترة الفوترة مع خيارات تصدير." },
        ]},
        { title: "الأمان والمدفوعات", items: [
          { q: "ما هي طرق الدفع المقبولة؟", a: "نقبل الدفع النقدي والتحويلات البنكية وخدمات الأموال المتنقلة مثل زين كاش وفاست باي." },
          { q: "هل بيانات مرضاي آمنة؟", a: "نعم، نستخدم تشفيراً مصرفياً من الدرجة الأولى. لا يمكن لأي طرف ثالث الوصول إلى بيانات مرضاك." },
        ]},
        { title: "الميزات", items: [
          { q: "هل يمكنني الوصول من الهاتف؟", a: "نعم! النظام متجاوب بالكامل ويعمل على جميع الأجهزة. يمكنك إدارة المواعيد والسجلات من أي مكان." },
          { q: "هل يرسل النظام تذكيرات بالمواعيد؟", a: "نعم، النظام يرسل تذكيرات آلية عبر واتساب والرسائل النصية لتقليل حالات عدم الحضور." },
          { q: "هل يمكنني إنشاء تقارير؟", a: "بالتأكيد! تقارير مالية شاملة، إحصائيات المرضى، وتحليلات المواعيد — كلها قابلة للتصدير." },
        ]},
      ],
    },
    cta: {
      title: "جاهز لتبدأ نبض عيادتك الرقمية؟",
      sub: "انضم لمئات العيادات العراقية التي تثق بنا يومياً.",
      btn1: "إنشاء حساب مجاني",
      btn2: "عرض الباقات",
      badges: ["بدون بطاقة ائتمان", "آمن وخاص", "دعم 24/7"],
    },
    footer: {
      desc: "منصة شاملة لإدارة العيادات الطبية في العراق. مرضى، مواعيد، وصفات، وماليات — كل شيء رقمي.",
      links: "روابط سريعة",
      feat: "المميزات",
      legal: "قانوني",
      terms: "الشروط والأحكام",
      privacy: "سياسة الخصوصية",
      copy: "© 2026 العيادة الرقمية. جميع الحقوق محفوظة.",
      by: "تصميم Dev Code",
    },
    trust: ["آمن وخاص", "سحابي 100%", "متعدد اللغات", "دعم 24/7", "جاهز للبدء الفوري"],
  },
  en: {
    dir: "ltr" as const,
    nav: { home: "Home", features: "Features", pricing: "Pricing", contact: "Contact", faq: "FAQ", login: "Login", signup: "Get Started Free" },
    hero: {
      badge: "Iraq's First Digital Clinic Platform",
      title1: "Your Clinic,",
      title2: "with a Digital",
      title3: "Pulse",
      subtitle: "A smart platform that manages your entire clinic — patients, appointments, prescriptions, and finances — all in one seamless system.",
      cta1: "Start Free Now",
      cta2: "See How It Works",
    },
    pulse: {
      label: "Digital Clinic Pulse",
      stats: [
        { val: "2,500+", lbl: "Active Patients", icon: Users },
        { val: "150+", lbl: "Clinics Trust Us", icon: Building2 },
        { val: "99.9%", lbl: "Uptime", icon: Activity },
        { val: "24/7", lbl: "Support", icon: HeartPulse },
      ],
    },
    pain: {
      badge: "The Problem",
      title: "Your clinic deserves better than paper chaos",
      items: [
        { icon: CalendarPlus, title: "Lost Appointments", desc: "Appointments forgotten or double-booked because you rely on paper" },
        { icon: FileText, title: "Scattered Records", desc: "Patient files in different drawers, prescriptions in illegible handwriting" },
        { icon: Receipt, title: "Unclear Finances", desc: "You don't know exactly how much came in and went out last month" },
        { icon: Clock, title: "Wasted Hours", desc: "Hours wasted daily on organization instead of focusing on patients" },
      ],
    },
    solution: {
      badge: "The Solution",
      title: "One system that transforms clinic chaos into digital flow",
      subtitle: "Everything you need to manage your clinic smartly — from first appointment to final invoice.",
      items: [
        { icon: Users, title: "Patient Management", desc: "Complete records with medical history, allergies, and drug interactions", color: "from-blue-500 to-cyan-400" },
        { icon: CalendarPlus, title: "Smart Scheduling", desc: "Automated appointments with WhatsApp reminders and visit tracking", color: "from-emerald-500 to-teal-400" },
        { icon: Stethoscope, title: "Medical Sessions", desc: "Record diagnoses and treatments with complete follow-up chains", color: "from-violet-500 to-purple-400" },
        { icon: Pill, title: "Digital Prescriptions", desc: "Professional prescriptions with clean print and full customization", color: "from-amber-500 to-orange-400" },
        { icon: BarChart3, title: "Financial Management", desc: "Track payments and expenses with clear monthly reports", color: "from-rose-500 to-pink-400" },
        { icon: Building2, title: "Multi-Branch", desc: "Manage multiple clinics with isolated data and central control", color: "from-indigo-500 to-blue-400" },
      ],
    },
    dayInLife: {
      badge: "A Day in Your Clinic",
      title: "From morning to evening, everything digital",
      steps: [
        { time: "8:00 AM", title: "Clinic Opened", desc: "Dashboard shows today's appointments and stats at a glance", icon: Activity },
        { time: "8:30 AM", title: "First Patient Arrives", desc: "Waitlist card moves automatically between stages", icon: Users },
        { time: "9:15 AM", title: "Diagnosis & Treatment", desc: "Record diagnosis and prescription in a few clicks, see full patient history", icon: Stethoscope },
        { time: "10:00 AM", title: "Print Prescription", desc: "Professional prescription ready to print with clinic branding", icon: FileText },
        { time: "11:30 AM", title: "Payment Collected", desc: "Record payment with one click — revenue updates automatically in reports", icon: Receipt },
        { time: "2:00 PM", title: "End of Day", desc: "Comprehensive daily report: patients seen, revenue, expenses — all clear", icon: TrendingUp },
      ],
    },
    whyUs: {
      badge: "Why Us?",
      title: "Built Specifically for Iraqi Clinics",
      items: [
        { icon: Globe, title: "Arabic, Kurdish & English", desc: "Multilingual interface for all medical staff across Iraq" },
        { icon: Shield, title: "No Credit Card Required", desc: "Start free and pay when you're ready. No commitments" },
        { icon: MessageSquare, title: "WhatsApp & ZainCash", desc: "Automatic reminders via WhatsApp and local Iraqi payments" },
        { icon: Lock, title: "Data Secured in Europe", desc: "European servers with banking-grade encryption for patient data" },
      ],
      stats: [
        { val: "500+", lbl: "Active Clinics" },
        { val: "50K+", lbl: "Registered Patients" },
        { val: "99.9%", lbl: "Uptime" },
        { val: "4.9★", lbl: "Customer Rating" },
      ],
    },
    pricing: {
      badge: "Pricing",
      title: "Transparent pricing for every clinic size",
      sub: "Start free. Scale when needed. No hidden fees.",
      toggle: ["Monthly", "Yearly"],
      save: "Save 17%",
      plans: [
        { name: "Starter", tagline: "Explore & try", monthlyPrice: "0", yearlyPrice: "0", doctors: "1 Doctor", highlight: false, features: ["50 patients", "50 appointments/mo", "Basic records", "Waitlist board", "Email support"], cta: "Start Free" },
        { name: "Professional", tagline: "Best value", monthlyPrice: "75,000", yearlyPrice: "750,000", doctors: "Up to 3 Doctors", highlight: true, features: ["Unlimited patients & appointments", "Complete records (cases, files)", "WhatsApp reminders (500/mo)", "Financial reports", "Priority support"], cta: "Get Started" },
        { name: "Business", tagline: "For advanced clinics", monthlyPrice: "200,000", yearlyPrice: "2,000,000", doctors: "Up to 10 Doctors", highlight: false, features: ["All Professional features", "Multi-branch", "Advanced analytics", "Dedicated account manager", "Phone / WhatsApp support"], cta: "Get Started" },
      ],
      enterpriseNote: "More than 10 doctors?",
      enterpriseCta: "Contact us for custom pricing",
      currency: "IQD",
      period: "/mo",
      yearNote: "Billed annually",
    },
    contact: {
      badge: "Contact Us",
      title: "Our team is ready to help",
      sub: "We're here to answer all your questions — anytime.",
      info: [
        { icon: Mail, label: "Email", value: "info@digitalclinic.iq" },
        { icon: Phone, label: "Phone", value: "+964 770 281 4484" },
        { icon: MessageSquare, label: "WhatsApp", value: "+964 770 281 4484" },
        { icon: MapPin, label: "Location", value: "Baghdad, Iraq" },
      ],
      form: { title: "Send a Message", name: "Full Name", namePh: "Your name", email: "Email Address", emailPh: "example@email.com", phone: "Phone Number", phonePh: "07xxxxxxxxx", subject: "Subject", subjectPh: "Message subject", clinic: "Clinic Name (optional)", clinicPh: "Your clinic name", message: "Your Message", messagePh: "Write your message here...", submit: "Send Message", success: "Your message has been sent! Our team will contact you within 24 hours." },
    },
    faq: {
      badge: "FAQ",
      title: "Answers to your questions",
      sub: "Didn't find what you're looking for?",
      contact: "Contact Support",
      groups: [
        { title: "Getting Started", items: [
          { q: "Can I upgrade or downgrade my plan?", a: "Yes! You can change your plan at any time. Upgrades give you immediate access to new features. Downgrades apply at the end of the billing period." },
            { q: "Is there a free trial?", a: "Yes, our free Starter plan lets you manage 50 patients and 50 appointments per month with basic features. When you need more, upgrade to Professional." },
          { q: "Can I cancel my subscription?", a: "Yes, you can cancel anytime. Your data remains accessible until the end of the billing period with export options." },
        ]},
        { title: "Security & Payments", items: [
          { q: "What payment methods are accepted?", a: "We accept cash, bank transfers, and mobile money services like ZainCash and FastPay." },
          { q: "Is my patient data secure?", a: "Yes, we use banking-grade encryption. No third party can access your patient data." },
        ]},
        { title: "Features", items: [
          { q: "Can I access from mobile?", a: "Yes! The system is fully responsive and works on all devices including smartphones." },
          { q: "Does it send appointment reminders?", a: "Yes, automatic reminders via WhatsApp and SMS to reduce no-shows." },
          { q: "Can I generate reports?", a: "Absolutely! Comprehensive financial reports, patient statistics, and appointment analytics — all exportable." },
        ]},
      ],
    },
    cta: {
      title: "Ready to start your clinic's digital pulse?",
      sub: "Join hundreds of Iraqi clinics that trust us daily.",
      btn1: "Create Free Account",
      btn2: "View Pricing",
      badges: ["No credit card needed", "Secure & private", "24/7 support"],
    },
    footer: {
      desc: "A comprehensive clinic management platform for Iraq. Patients, appointments, prescriptions, and finances — all digital.",
      links: "Quick Links",
      feat: "Features",
      legal: "Legal",
      terms: "Terms & Conditions",
      privacy: "Privacy Policy",
      copy: "© 2026 Digital Clinic. All rights reserved.",
      by: "Designed by Dev Code",
    },
    trust: ["Secure & Private", "100% Cloud", "Multilingual", "24/7 Support", "Start Instantly"],
  },
};

function useAnimatedCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setCount(Math.floor(progress * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { count, ref };
}

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function ECGLine({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 60" preserveAspectRatio="none" fill="none">
      <path
        d="M0,30 L60,30 L70,30 L80,8 L90,52 L100,30 L120,30 L140,30 L150,30 L160,12 L170,48 L180,30 L200,30 L260,30 L270,30 L280,6 L290,54 L300,30 L320,30 L340,30 L350,30 L360,10 L370,50 L380,30 L400,30"
        stroke="url(#ecgGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ecg-path"
      />
      <defs>
        <linearGradient id="ecgGrad" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0d9488" stopOpacity="0" />
          <stop offset="15%" stopColor="#0d9488" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="85%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function DashboardPreview({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [lang === "ar" ? "لوحة التحكم" : "Dashboard", lang === "ar" ? "المواعيد" : "Appointments", lang === "ar" ? "المرضى" : "Patients"];
  const patients = [
    { name: lang === "ar" ? "أحمد محمد" : "Ahmed M.", time: "9:00", status: lang === "ar" ? "مؤكد" : "Confirmed", color: "bg-emerald-400" },
    { name: lang === "ar" ? "سارة علي" : "Sara A.", time: "9:30", status: lang === "ar" ? "بالانتظار" : "Waiting", color: "bg-amber-400" },
    { name: lang === "ar" ? "حسين كريم" : "Hussein K.", time: "10:00", status: lang === "ar" ? "مؤكد" : "Confirmed", color: "bg-emerald-400" },
  ];

  return (
    <div className="relative w-full max-w-[480px] mx-auto">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-transparent blur-2xl" />
      <div className="relative rounded-2xl overflow-hidden bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono ms-auto">digitalclinic.iq/dashboard</span>
        </div>
        <div className="bg-gradient-to-br from-teal-600 to-cyan-700 px-5 py-5">
          <div className="text-teal-100 text-xs font-semibold mb-1">
            {lang === "ar" ? "صباح الخير، د. أحمد 👋" : "Good morning, Dr. Ahmed 👋"}
          </div>
          <div className="text-white text-lg font-extrabold">
            {lang === "ar" ? "لوحة تحكم العيادة الرقمية" : "Digital Clinic Dashboard"}
          </div>
          <div className="grid grid-cols-3 gap-2.5 mt-4">
            {[
              { val: "1,284", lbl: lang === "ar" ? "المرضى" : "Patients", accent: "text-cyan-300" },
              { val: "48", lbl: lang === "ar" ? "اليوم" : "Today", accent: "text-emerald-300" },
              { val: "✓ 3", lbl: lang === "ar" ? "مؤكد" : "Confirmed", accent: "text-amber-300" },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                <div className={`text-xl font-black ${s.accent}`}>{s.val}</div>
                <div className="text-[10px] text-white/60 mt-0.5">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-4 pt-1 pb-1">
          <div className="flex gap-1 border-b border-slate-700/50">
            {tabs.map((tab, i) => (
              <button key={i} onClick={() => setActiveTab(i)} className={`px-3 py-2 text-[11px] font-bold transition-all ${activeTab === i ? "text-teal-400 border-b-2 border-teal-400" : "text-slate-500 hover:text-slate-300"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="text-xs font-bold text-slate-300 mb-2.5 flex justify-between">
            <span>{lang === "ar" ? "مواعيد اليوم" : "Today's Appointments"}</span>
            <span className="text-teal-400 cursor-pointer">{lang === "ar" ? "عرض الكل" : "View all"}</span>
          </div>
          {patients.map((p, i) => (
            <div key={i} className="flex items-center gap-2.5 py-2 border-b border-slate-800/50 last:border-0">
              <div className={`w-8 h-8 rounded-full ${p.color}/20 flex items-center justify-center text-sm font-bold ${p.color.replace("bg-", "text-").replace("/20", "")}`}>
                {p.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{p.name}</div>
                <div className="text-[10px] text-slate-500">{p.time}</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.color === "bg-emerald-400" ? "bg-emerald-400/10 text-emerald-400" : "bg-amber-400/10 text-amber-400"}`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IslamicPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="islamicPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M30 0L60 30L30 60L0 30Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="30" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <circle cx="0" cy="0" r="4" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <circle cx="60" cy="0" r="4" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <circle cx="0" cy="60" r="4" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <circle cx="60" cy="60" r="4" fill="none" stroke="currentColor" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamicPattern)" />
    </svg>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("ar");
  const [page, setPage] = useState<Page>("home");
  const [billingYearly, setBillingYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>("0-0");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroTyped, setHeroTyped] = useState("");

  const t = T[lang];
  const isRtl = lang === "ar";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const words = isRtl ? [t.hero.title2, t.hero.title3] : [t.hero.title2, t.hero.title3];
    let wi = 0;
    let ci = 0;
    const interval = setInterval(() => {
      if (ci <= words[wi].length) {
        setHeroTyped(words[wi].slice(0, ci));
        ci++;
      } else {
        setTimeout(() => {
          wi = (wi + 1) % words.length;
          ci = 0;
        }, 2000);
        ci = words[wi].length + 1;
      }
    }, 80);
    return () => clearInterval(interval);
  }, [lang]);

  const nav = (p: Page) => { setPage(p); setMobileOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div dir={t.dir} className="min-h-screen bg-[#050a15] text-slate-200 font-sans overflow-x-hidden">
      <style>{`
        @keyframes ecgDraw { from { stroke-dashoffset: 800; } to { stroke-dashoffset: 0; } }
        @keyframes ecgRepeat { 0%,100% { stroke-dashoffset: 0; } 50% { stroke-dashoffset: 800; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes pulse-glow { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
        @keyframes gradient-x { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes fade-up { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slide-in { from { opacity:0; transform:translateX(${isRtl ? "30px" : "-30px"}); } to { opacity:1; transform:translateX(0); } }
        .ecg-path { stroke-dasharray: 800; animation: ecgDraw 3s ease-out forwards, ecgRepeat 4s ease-in-out 3s infinite; }
        .float-anim { animation: float 6s ease-in-out infinite; }
        .float-anim-delay { animation: float 7s ease-in-out 1s infinite; }
        .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .gradient-x { background-size: 200% 200%; animation: gradient-x 6s ease infinite; }
        .shimmer { animation: shimmer 2s ease-in-out infinite; }
        .fade-up { animation: fade-up 0.6s ease-out both; }
        .slide-in { animation: slide-in 0.6s ease-out both; }
        .reveal { opacity: 0; transform: translateY(40px); transition: all 0.7s cubic-bezier(0.16,1,0.3,1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .card-hover { transition: all 0.35s cubic-bezier(0.16,1,0.3,1); }
        .card-hover:hover { transform: translateY(-8px); }
        .btn-shine { position: relative; overflow: hidden; }
        .btn-shine::after { content:''; position:absolute; top:-50%; left:-60%; width:40%; height:200%; background:rgba(255,255,255,0.12); transform:skewX(-20deg); transition:left 0.4s; }
        .btn-shine:hover::after { left: 120%; }
      `}</style>

      {/* ═══ NAVBAR ═══ */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#050a15]/80 backdrop-blur-2xl border-b border-white/5 shadow-xl shadow-black/20" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/30 pulse-glow cursor-pointer" onClick={() => router.push("/admin/login")}>
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <Link href="/" className="flex items-center gap-2 no-underline">
              <div className={isRtl ? "text-right" : "text-left"}>
                <div className="text-lg font-black text-white leading-tight">
                  {isRtl ? <>العيادة <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">الرقمية</span></> : <>Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">Clinic</span></>}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {isRtl ? "منصة إدارة العيادات" : "Clinic Management Platform"}
                </div>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {(["home", "features", "pricing", "contact", "faq"] as Page[]).map(p => (
              <button key={p} onClick={() => nav(p)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${page === p ? "bg-teal-500/15 text-teal-300 border border-teal-500/30" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                {t.nav[p as keyof typeof t.nav]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all">
              {lang === "ar" ? "🇺🇸 EN" : "🇮🇶 عربي"}
            </button>
            <Link href="/signup" className="hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-bold text-slate-300 border border-white/10 hover:bg-white/5 transition-all no-underline">
              {t.nav.login}
            </Link>
            <Link href="/signup" className="btn-shine px-5 py-2 rounded-full text-sm font-black bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all no-underline">
              {t.nav.signup}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white border border-white/10">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/5 px-4 pb-4">
            {(["home", "features", "pricing", "contact", "faq"] as Page[]).map(p => (
              <button key={p} onClick={() => nav(p)} className="block w-full text-start py-3 px-4 text-sm font-bold text-slate-300 border-b border-white/5 hover:text-white">
                {t.nav[p as keyof typeof t.nav]}
              </button>
            ))}
            <div className="flex gap-2 mt-4">
              <Link href="/signup" className="flex-1 text-center py-2 rounded-full text-sm font-bold border border-white/10 text-slate-300 no-underline">{t.nav.login}</Link>
              <Link href="/signup" className="flex-1 text-center py-2 rounded-full text-sm font-black bg-gradient-to-r from-teal-500 to-cyan-500 text-white no-underline">{t.nav.signup}</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ PAGE: HOME ═══ */}
      {page === "home" && (
        <>
          {/* ═══ HERO ═══ */}
          <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
            <IslamicPattern />
            <div className="absolute top-20 start-10 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[120px] pulse-glow" />
            <div className="absolute bottom-20 end-10 w-[400px] h-[400px] rounded-full bg-cyan-500/8 blur-[100px] pulse-glow" style={{ animationDelay: "1.5s" }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28 w-full relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div className="fade-up">
                  <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/25 text-teal-300 px-4 py-2 rounded-full text-sm font-bold mb-8">
                    <HeartPulse className="w-4 h-4" />
                    <span>{t.hero.badge}</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
                    <span className="text-white">{t.hero.title1}</span>
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 gradient-x">
                      {heroTyped}
                    </span>
                    <span className="inline-block w-0.5 h-10 bg-teal-400 ms-1 animate-pulse" />
                  </h1>

                  <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-xl">
                    {t.hero.subtitle}
                  </p>

                  <div className="flex flex-wrap gap-3 mb-12">
                    <Link href="/signup" className="btn-shine inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-black bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 transition-all no-underline">
                      <Sparkles className="w-4 h-4" />
                      {t.hero.cta1}
                    </Link>
                    <button onClick={() => nav("features")} className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-slate-300 border-2 border-white/10 hover:bg-white/5 hover:border-white/20 transition-all bg-white/[0.02] backdrop-blur-sm">
                      {t.hero.cta2}
                      <Arrow className="w-4 h-4" />
                    </button>
                  </div>

                  <ECGLine className="w-full h-10 mb-8 opacity-60" />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {t.pulse.stats.map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                          <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-teal-400" />
                          </div>
                          <div>
                            <div className="text-sm font-black text-white">{s.val}</div>
                            <div className="text-[10px] text-slate-500">{s.lbl}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="hidden lg:block float-anim">
                  <DashboardPreview lang={lang} />
                </div>
              </div>
            </div>
          </section>

          {/* ═══ TRUST BAR ═══ */}
          <div className="border-y border-white/5 bg-white/[0.02] py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
                {t.trust.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <Shield className="w-4 h-4 text-teal-500/50" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ PAIN POINTS ═══ */}
          <section className="py-20 lg:py-28 relative">
            <IslamicPattern />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
              <div className="text-center mb-14 reveal-section" data-reveal>
                <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
                  <Activity className="w-4 h-4" />
                  {t.pain.badge}
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">{t.pain.title}</h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {t.pain.items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="card-hover group p-6 rounded-2xl bg-white/[0.02] border border-red-500/10 hover:border-red-500/30 transition-all">
                      <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-all">
                        <Icon className="w-6 h-6 text-red-400" />
                      </div>
                      <h3 className="text-lg font-extrabold text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ═══ SOLUTION / FEATURES ═══ */}
          <section className="py-20 lg:py-28 bg-gradient-to-b from-transparent via-teal-950/5 to-transparent relative">
            <IslamicPattern />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(13,148,136,0.08),transparent)] pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-300 px-4 py-2 rounded-full text-sm font-bold mb-6">
                  <Zap className="w-4 h-4" />
                  {t.solution.badge}
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">{t.solution.title}</h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">{t.solution.subtitle}</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {t.solution.items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="card-hover group relative p-7 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-teal-500/30 overflow-hidden">
                      <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-extrabold text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ═══ DAY IN LIFE ═══ */}
          <section className="py-20 lg:py-28 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 px-4 py-2 rounded-full text-sm font-bold mb-6">
                  <Clock className="w-4 h-4" />
                  {t.dayInLife.badge}
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">{t.dayInLife.title}</h2>
              </div>

              <div className="relative">
                <div className="absolute start-[28px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500 via-cyan-500 to-violet-500 hidden sm:block" />
                <div className="space-y-6">
                  {t.dayInLife.steps.map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <div key={i} className="relative flex items-start gap-5 sm:gap-8">
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-teal-400" />
                          </div>
                        </div>
                        <div className="flex-1 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-teal-500/20 transition-all">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-black text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full">{step.time}</span>
                            <h3 className="text-lg font-extrabold text-white">{step.title}</h3>
                          </div>
                          <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ═══ WHY US ═══ */}
          <section className="py-20 lg:py-28 bg-white/[0.02] border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-4 py-2 rounded-full text-sm font-bold mb-6">
                    <Award className="w-4 h-4" />
                    {t.whyUs.badge}
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">{t.whyUs.title}</h2>
                  <div className="space-y-5">
                    {t.whyUs.items.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-teal-500/20 transition-all">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-extrabold text-white mb-1">{item.title}</div>
                            <div className="text-sm text-slate-400 leading-relaxed">{item.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {t.whyUs.stats.map((s, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5 border border-teal-500/10 text-center hover:border-teal-500/30 transition-all">
                      <div className="text-3xl font-black text-teal-400 mb-1">{s.val}</div>
                      <div className="text-sm text-slate-500">{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ═══ PRICING PREVIEW ═══ */}
          <section className="py-20 lg:py-28 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-4 py-2 rounded-full text-sm font-bold mb-6">
                  <Receipt className="w-4 h-4" />
                  {t.pricing.badge}
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">{t.pricing.title}</h2>
                <p className="text-lg text-slate-400 max-w-xl mx-auto">{t.pricing.sub}</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {t.pricing.plans.slice(0, 3).map((plan, i) => (
                  <div key={i} className={`card-hover relative p-7 rounded-2xl border-2 overflow-hidden ${plan.highlight ? "bg-gradient-to-br from-teal-500/10 to-cyan-500/5 border-teal-500/50 shadow-xl shadow-teal-500/10" : "bg-white/[0.02] border-white/5 hover:border-white/15"}`}>
                    {plan.highlight && (
                      <div className="absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
                    )}
                    {plan.highlight && (
                      <div className="absolute -top-0 start-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-black px-4 py-0.5 rounded-b-lg text-xs font-black">
                        {isRtl ? "⭐ الأكثر شعبية" : "⭐ Most Popular"}
                      </div>
                    )}
                    <div className="text-xl font-black text-white mb-1">{plan.name}</div>
                    <div className="text-sm text-slate-500 mb-5">{plan.tagline}</div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-sm text-slate-500">{t.pricing.currency}</span>
                      <span className="text-4xl font-black text-white">{billingYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                      <span className="text-sm text-slate-500">{t.pricing.period}</span>
                    </div>
                    {billingYearly && <div className="text-xs text-teal-400 mb-3">{t.pricing.yearNote}</div>}
                    <div className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-lg inline-flex items-center gap-1.5 mb-5">
                      <Stethoscope className="w-3 h-3" />
                      {plan.doctors}
                    </div>
                    <div className="h-px bg-white/5 mb-5" />
                    <ul className="space-y-2.5 mb-7">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                          <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link href="/signup" className={`btn-shine block text-center py-3 rounded-full font-bold transition-all no-underline ${plan.highlight ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25" : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"}`}>
                      {plan.cta}
                    </Link>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                <div className="inline-flex bg-white/5 border border-white/10 rounded-full p-1 gap-1">
                  {t.pricing.toggle.map((label, i) => (
                    <button key={i} onClick={() => setBillingYearly(i === 1)} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${(i === 1) === billingYearly ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white" : "text-slate-400 hover:text-white"}`}>
                      {label} {i === 1 && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full ms-1">{t.pricing.save}</span>}
                    </button>
                  ))}
                </div>
                <button onClick={() => nav("pricing")} className="text-sm text-slate-400 hover:text-teal-300 font-bold transition-colors">
                  {isRtl ? "عرض جميع الباقات ←" : "View All Plans →"}
                </button>
              </div>
            </div>
          </section>

          {/* ═══ CTA ═══ */}
          <section className="py-20 lg:py-28 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-cyan-700" />
            <IslamicPattern />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_60%)]" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
              <ECGLine className="w-full h-8 mb-8 opacity-30" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">{t.cta.title}</h2>
              <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">{t.cta.sub}</p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Link href="/signup" className="btn-shine inline-flex items-center gap-2 px-8 py-4 rounded-full font-black bg-white text-teal-700 shadow-xl hover:shadow-white/25 transition-all no-underline">
                  <Sparkles className="w-5 h-5" />
                  {t.cta.btn1}
                </Link>
                <button onClick={() => nav("pricing")} className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white border-2 border-white/20 hover:bg-white/10 transition-all backdrop-blur-sm">
                  {t.cta.btn2}
                  <Arrow className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                {t.cta.badges.map((b, i) => (
                  <span key={i} className="text-sm text-white/60 flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4" />
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ═══ PAGE: FEATURES ═══ */}
      {page === "features" && (
        <>
          <section className="pt-28 pb-16 bg-gradient-to-b from-teal-950/20 to-transparent relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
              <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-300 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Zap className="w-4 h-4" />
                {t.solution.badge}
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">{t.solution.title}</h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">{t.solution.subtitle}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
                {t.whyUs.stats.map((s, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-2xl font-black text-teal-400">{s.val}</div>
                    <div className="text-xs text-slate-500">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {t.solution.items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="card-hover group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-teal-500/30 overflow-hidden">
                      <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-extrabold text-white mb-3">{item.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="py-16 bg-white/[0.02] border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-black text-white mb-6">{t.whyUs.title}</h2>
                  <div className="space-y-4">
                    {t.whyUs.items.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-extrabold text-white mb-1">{item.title}</div>
                            <div className="text-sm text-slate-400">{item.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {t.whyUs.stats.map((s, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5 border border-teal-500/10 text-center">
                      <div className="text-3xl font-black text-teal-400">{s.val}</div>
                      <div className="text-sm text-slate-500 mt-1">{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-cyan-700" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">{t.cta.title}</h2>
              <p className="text-lg text-white/70 mb-10">{t.cta.sub}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/signup" className="btn-shine inline-flex items-center gap-2 px-8 py-4 rounded-full font-black bg-white text-teal-700 shadow-xl no-underline">
                  <Sparkles className="w-5 h-5" />
                  {t.cta.btn1}
                </Link>
                <button onClick={() => nav("pricing")} className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white border-2 border-white/20 hover:bg-white/10 transition-all">
                  {t.cta.btn2} <Arrow className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ═══ PAGE: PRICING ═══ */}
      {page === "pricing" && (
        <>
          <section className="pt-28 pb-16 bg-gradient-to-b from-amber-950/10 to-transparent text-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Receipt className="w-4 h-4" />
                {t.pricing.badge}
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">{t.pricing.title}</h1>
              <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">{t.pricing.sub}</p>
              <div className="inline-flex bg-white/5 border border-white/10 rounded-full p-1 gap-1">
                {t.pricing.toggle.map((label, i) => (
                  <button key={i} onClick={() => setBillingYearly(i === 1)} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${(i === 1) === billingYearly ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white" : "text-slate-400 hover:text-white"}`}>
                    {label} {i === 1 && billingYearly && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full ms-1">{t.pricing.save}</span>}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="py-8 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {t.pricing.plans.map((plan, i) => (
                  <div key={i} className={`card-hover relative p-6 rounded-2xl overflow-hidden border-2 ${plan.highlight ? "bg-gradient-to-br from-teal-500/10 to-cyan-500/5 border-teal-500/50 shadow-xl shadow-teal-500/10" : "bg-white/[0.02] border-white/5 hover:border-white/15"}`}>
                    {plan.highlight && <div className="absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />}
                    {plan.highlight && (
                      <div className="absolute -top-0 start-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-black px-3 py-0.5 rounded-b-lg text-[10px] font-black">
                        {isRtl ? "⭐ الأكثر شعبية" : "⭐ Most Popular"}
                      </div>
                    )}
                    <div className="text-lg font-black text-white mb-1">{plan.name}</div>
                    <div className="text-xs text-slate-500 mb-4">{plan.tagline}</div>
                    <div className="mb-1">
                      <span className="text-[10px] text-slate-500">{t.pricing.currency}</span>
                      <span className="text-3xl font-black text-white ms-1">{billingYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                      <span className="text-xs text-slate-500 ms-1">{t.pricing.period}</span>
                    </div>
                    {billingYearly && <div className="text-[10px] text-teal-400 mb-2">{t.pricing.yearNote}</div>}
                    <div className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded-md inline-flex items-center gap-1 mb-4">
                      <Stethoscope className="w-3 h-3" />
                      {plan.doctors}
                    </div>
                    <div className="h-px bg-white/5 mb-4" />
                    <ul className="space-y-2 mb-5">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link href="/signup" className={`btn-shine block text-center py-2.5 rounded-full text-sm font-bold transition-all no-underline ${plan.highlight ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25" : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"}`}>
                      {plan.cta}
                    </Link>
                  </div>
                ))}
              </div>
              {t.pricing.enterpriseNote && (
                <div className="text-center mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/10 max-w-lg mx-auto">
                  <p className="text-sm text-slate-400 mb-3">{t.pricing.enterpriseNote}</p>
                  <button onClick={() => nav("contact")} className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold bg-white/5 border border-white/10 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/30 transition-all">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {t.pricing.enterpriseCta}
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-cyan-700" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">{t.cta.title}</h2>
              <p className="text-lg text-white/70 mb-10">{t.cta.sub}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/signup" className="btn-shine inline-flex items-center gap-2 px-8 py-4 rounded-full font-black bg-white text-teal-700 shadow-xl no-underline">
                  <Sparkles className="w-5 h-5" /> {t.cta.btn1}
                </Link>
                <button onClick={() => nav("contact")} className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white border-2 border-white/20 hover:bg-white/10 transition-all">
                  {isRtl ? "تواصل معنا" : "Contact Us"} <Arrow className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ═══ PAGE: CONTACT ═══ */}
      {page === "contact" && (
        <>
          <section className="pt-28 pb-16 bg-gradient-to-b from-teal-950/20 to-transparent text-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-300 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Mail className="w-4 h-4" />
                {t.contact.badge}
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">{t.contact.title}</h1>
              <p className="text-lg text-slate-400 max-w-xl mx-auto">{t.contact.sub}</p>
            </div>
          </section>

          <section className="py-8 pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <div className="grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                    <h3 className="text-lg font-extrabold text-white">{isRtl ? "معلومات التواصل" : "Contact Information"}</h3>
                    {t.contact.info.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-teal-400" />
                          </div>
                          <div>
                            <div className="text-xs text-slate-500">{item.label}</div>
                            <div className="text-sm font-semibold text-white">{item.value}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-3 p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                  <h3 className="text-lg font-extrabold text-white mb-6">{t.contact.form.title}</h3>
                  {formSent ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-teal-400" />
                      </div>
                      <div className="text-xl font-bold text-white mb-2">{isRtl ? "تم الإرسال بنجاح!" : "Sent Successfully!"}</div>
                      <div className="text-sm text-slate-400">{t.contact.form.success}</div>
                    </div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); setFormSent(true); }} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <input placeholder={t.contact.form.namePh} className="w-full px-4 py-3 rounded-xl bg-[#0a0f1a] border border-white/10 text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 outline-none transition-all" />
                        <input placeholder={t.contact.form.emailPh} type="email" className="w-full px-4 py-3 rounded-xl bg-[#0a0f1a] border border-white/10 text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 outline-none transition-all" />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <input placeholder={t.contact.form.phonePh} type="tel" className="w-full px-4 py-3 rounded-xl bg-[#0a0f1a] border border-white/10 text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 outline-none transition-all" />
                        <input placeholder={t.contact.form.subjectPh} className="w-full px-4 py-3 rounded-xl bg-[#0a0f1a] border border-white/10 text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 outline-none transition-all" />
                      </div>
                      <input placeholder={t.contact.form.clinicPh} className="w-full px-4 py-3 rounded-xl bg-[#0a0f1a] border border-white/10 text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 outline-none transition-all" />
                      <textarea placeholder={t.contact.form.messagePh} rows={5} required className="w-full px-4 py-3 rounded-xl bg-[#0a0f1a] border border-white/10 text-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 outline-none transition-all resize-y" />
                      <button type="submit" className="btn-shine w-full py-3.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-black shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all">
                        {t.contact.form.submit}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ═══ PAGE: FAQ ═══ */}
      {page === "faq" && (
        <>
          <section className="pt-28 pb-16 bg-gradient-to-b from-teal-950/20 to-transparent text-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-300 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <CircleDot className="w-4 h-4" />
                {t.faq.badge}
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">{t.faq.title}</h1>
              <p className="text-lg text-slate-400">
                {t.faq.sub}{" "}
                <button onClick={() => nav("contact")} className="text-teal-400 hover:text-teal-300 font-bold">
                  {t.faq.contact}
                </button>
              </p>
            </div>
          </section>

          <section className="py-8 pb-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
              {t.faq.groups.map((group, gi) => (
                <div key={gi} className="mb-10">
                  <h3 className="text-lg font-extrabold text-white mb-4 pb-3 border-b-2 border-teal-500/20 flex items-center gap-2">
                    {group.title}
                  </h3>
                  <div className="space-y-3">
                    {group.items.map((item, ii) => {
                      const key = `${gi}-${ii}`;
                      const isOpen = openFaq === key;
                      return (
                        <div key={ii} className={`rounded-2xl border overflow-hidden transition-all ${isOpen ? "bg-white/[0.04] border-teal-500/30 shadow-lg shadow-teal-500/5" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}>
                          <button onClick={() => setOpenFaq(isOpen ? null : key)} className="w-full px-6 py-5 flex items-center justify-between text-start">
                            <span className="font-bold text-white">{item.q}</span>
                            <span className={`text-teal-400 text-xl font-bold transition-transform flex-shrink-0 ms-4 ${isOpen ? "rotate-45" : ""}`}>+</span>
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-5 text-sm text-slate-400 leading-relaxed">
                              {item.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-cyan-700" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">{t.cta.title}</h2>
              <p className="text-lg text-white/70 mb-10">{t.cta.sub}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/signup" className="btn-shine inline-flex items-center gap-2 px-8 py-4 rounded-full font-black bg-white text-teal-700 shadow-xl no-underline">
                  <Sparkles className="w-5 h-5" /> {t.cta.btn1}
                </Link>
                <button onClick={() => nav("pricing")} className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white border-2 border-white/20 hover:bg-white/10 transition-all">
                  {t.cta.btn2} <Arrow className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#040810] border-t border-white/5 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/5">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black text-white">
                  {isRtl ? "العيادة الرقمية" : "Digital Clinic"}
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">{t.footer.desc}</p>
              <div className="flex gap-2 mt-5">
                {[
                  { icon: <Globe className="w-4 h-4" />, label: "Website" },
                  { icon: <Smartphone className="w-4 h-4" />, label: "App" },
                  { icon: <MessageSquare className="w-4 h-4" />, label: "Chat" },
                  { icon: <Mail className="w-4 h-4" />, label: "Email" },
                ].map((s, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-teal-400 hover:border-teal-500/30 transition-all cursor-pointer">
                    {s.icon}
                  </div>
                ))}
              </div>
            </div>

            {[
              { title: t.footer.links, items: [
                { label: t.nav.home, page: "home" as Page },
                { label: t.nav.features, page: "features" as Page },
                { label: t.nav.pricing, page: "pricing" as Page },
                { label: t.nav.contact, page: "contact" as Page },
              ]},
              { title: t.footer.feat, items: [
                { label: isRtl ? "إدارة المرضى" : "Patient Management", page: "features" as Page },
                { label: isRtl ? "جدولة المواعيد" : "Scheduling", page: "features" as Page },
                { label: isRtl ? "الوصفات الرقمية" : "Prescriptions", page: "features" as Page },
                { label: isRtl ? "الإدارة المالية" : "Financial Mgmt", page: "features" as Page },
              ]},
              { title: t.footer.legal, items: [
                { label: t.footer.terms, page: "home" as Page },
                { label: t.footer.privacy, page: "home" as Page },
                { label: t.nav.faq, page: "faq" as Page },
                { label: t.nav.contact, page: "contact" as Page },
              ]},
            ].map((col, ci) => (
              <div key={ci}>
                <div className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">{col.title}</div>
                <ul className="space-y-2.5">
                  {col.items.map((item, ii) => (
                    <li key={ii}>
                      <button onClick={() => nav(item.page)} className="text-sm text-slate-500 hover:text-teal-300 transition-colors">
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4 pt-6">
            <span className="text-xs text-slate-600">{t.footer.copy}</span>
            <span className="text-xs text-slate-600">{t.footer.by}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}