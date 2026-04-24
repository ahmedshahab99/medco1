"use client";

import { useState, useEffect, useRef } from "react";

// ─── TYPES ──────────────────────────────────────────────────────────────────
type Lang = "ar" | "en";
type Page = "home" | "features" | "pricing" | "contact" | "faq";

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const T = {
  ar: {
    dir: "rtl" as const,
    topbar: { email: "info@digitalclinic.iq", phone: "+964 770 281 4484", location: "العراق، بغداد" },
    nav: { home: "الرئيسية", features: "المميزات", pricing: "الباقات", contact: "الدعم", faq: "الأسئلة", login: "تسجيل الدخول", signup: "إنشاء حساب" },
    hero: {
      badge: "⚕️ تكنولوجيا الرعاية الصحية العراقية",
      title1: "المستقبل الرقمي",
      title2: "لعيادتك",
      subtitle: "نظام إدارة العيادات الأكثر تطوراً في العراق. إدارة المرضى، المواعيد، السجلات الطبية، والفواتير في منصة واحدة ذكية.",
      cta1: "🚀 سجّل عيادتك مجاناً",
      cta2: "شاهد كيف يعمل",
      stat1val: "2,500+", stat1lbl: "مريض نشط",
      stat2val: "150+", stat2lbl: "عيادة تثق بنا",
      stat3val: "99.9%", stat3lbl: "وقت التشغيل",
      stat4val: "24/7", stat4lbl: "دعم فني",
    },
    trust: ["🔒 آمن وخاص", "☁️ سحابي 100%", "🌐 متعدد اللغات", "📞 دعم 24/7", "✅ جاهز للبدء الفوري"],
    features: {
      badge: "⚡ مميزاتنا",
      title: "كل ما تحتاجه عيادتك",
      sub: "أدوات شاملة لإدارة جميع جوانب ممارستك الطبية بكفاءة وذكاء.",
      items: [
        { icon: "👥", badge: "أساسي", title: "إدارة المرضى", desc: "سجلات مرضى كاملة مع التاريخ الطبي والحساسية والأدوية.", list: ["سجلات مرضى كاملة", "تتبع التاريخ الطبي", "الحساسية والأدوية"] },
        { icon: "📅", badge: "شائع", title: "جدولة المواعيد", desc: "نظام مواعيد ذكي مع تذكيرات تلقائية وتتبع الحالة.", list: ["نظام حجز سهل", "توفر الطبيب", "تذكيرات واتساب"] },
        { icon: "🩺", badge: "رئيسي", title: "الجلسات الطبية", desc: "سجل التشخيصات والعلاجات وأنشئ سلاسل جلسات المتابعة.", list: ["تسجيل التشخيصات", "تتبع العلاجات", "سلاسل المتابعة"] },
        { icon: "💊", badge: "طبي", title: "الوصفات الطبية", desc: "وصفات رقمية احترافية مع طباعة وتتبع الأدوية.", list: ["وصفات رقمية", "طباعة احترافية", "تتبع الأدوية"] },
        { icon: "💰", badge: "★ الأكثر استخداماً", title: "الإدارة المالية", desc: "تتبع المدفوعات وإدارة المصروفات والتقارير المالية.", list: ["تتبع المدفوعات", "إدارة المصروفات", "التقارير المالية"] },
        { icon: "🏢", badge: "قابل للتوسع", title: "عيادات متعددة", desc: "إدارة فروع متعددة ببيانات معزولة وتحكم مركزي.", list: ["إدارة عيادات متعددة", "بيانات معزولة", "تحكم مركزي"] },
      ]
    },
    why: {
      badge: "💡 لماذا نحن؟",
      title: "مصمم للعيادات العراقية",
      sub: "نفهم السياق المحلي ونبني حلولاً تناسب احتياجاتكم الفعلية.",
      items: [
        { title: "دعم عربي وكردي وإنجليزي", desc: "واجهة متعددة اللغات تناسب جميع الكوادر الطبية في العراق." },
        { title: "لا حاجة لبطاقة ائتمان", desc: "ابدأ مجاناً وادفع عندما تكون مستعداً. بدون أي التزامات مسبقة." },
        { title: "تكامل مع واتساب وزين كاش", desc: "تذكيرات تلقائية عبر واتساب ودفع إلكتروني عراقي محلي." },
        { title: "بيانات آمنة في العراق", desc: "خوادم موثوقة وتشفير عالي المستوى لحماية بيانات مرضاك." },
      ],
      stats: [
        { val: "500+", lbl: "عيادة نشطة" },
        { val: "50K+", lbl: "مريض مسجل" },
        { val: "99.9%", lbl: "وقت التشغيل" },
        { val: "4.9★", lbl: "تقييم العملاء" },
      ]
    },
    pricing: {
      badge: "💎 الباقات",
      title: "أسعار شفافة لكل حجم",
      sub: "اختر الباقة التي تناسب عيادتك. بدون رسوم خفية.",
      toggle: ["شهري", "سنوي"],
      save: "وفر 17%",
      plans: [
        { name: "التجريبية", tagline: "جرّب بدون التزام", monthlyPrice: "0", yearlyPrice: "0", doctors: "1 طبيب", highlight: false, features: ["50 مريض", "200 موعد/شهر", "وصفات طبية", "دعم بريد إلكتروني"], cta: "ابدأ مجاناً" },
        { name: "الأساسية", tagline: "للممارسين المنفردين", monthlyPrice: "25,000", yearlyPrice: "250,000", doctors: "1-2 طبيب", highlight: false, features: ["سجلات غير محدودة", "مواعيد غير محدودة", "وصفات طبية", "تقارير مالية", "دعم هاتفي"], cta: "ابدأ الآن" },
        { name: "الفضية", tagline: "للعيادات الصغيرة", monthlyPrice: "60,000", yearlyPrice: "600,000", doctors: "3-5 أطباء", highlight: false, features: ["كل مميزات الأساسية", "عيادات متعددة", "تذكيرات واتساب", "تقارير متقدمة", "دعم أولوية"], cta: "ابدأ الآن" },
        { name: "الذهبية", tagline: "الأكثر شعبية", monthlyPrice: "120,000", yearlyPrice: "1,200,000", doctors: "6-15 طبيب", highlight: true, features: ["كل مميزات الفضية", "تكامل المختبر", "تطبيق موبايل", "مدير حساب مخصص", "دعم 24/7"], cta: "ابدأ الآن" },
        { name: "البلاتينية", tagline: "لسلاسل العيادات", monthlyPrice: "300,000", yearlyPrice: "3,000,000", doctors: "أطباء غير محدود", highlight: false, features: ["كل مميزات الذهبية", "API مخصص", "تدريب في الموقع", "SLA مضمون 99.99%", "دعم VIP"], cta: "تواصل معنا" },
      ],
      currency: "د.ع",
      period: "/شهر",
      yearNote: "تُدفع سنوياً",
    },
    contact: {
      badge: "📬 تواصل معنا",
      title: "نحن هنا لمساعدتك",
      sub: "فريقنا المحلي متاح للإجابة على جميع استفساراتك.",
      info: [
        { icon: "📧", label: "البريد الإلكتروني", value: "info@digitalclinic.iq" },
        { icon: "📞", label: "الهاتف", value: "+964 770 281 4484" },
        { icon: "💬", label: "واتساب", value: "+964 770 281 4484" },
        { icon: "📍", label: "الموقع", value: "العراق، بغداد" },
        { icon: "🕐", label: "ساعات العمل", value: "السبت–الخميس: 9 ص – 6 م" },
      ],
      form: {
        title: "أرسل رسالة",
        name: "الاسم الكامل", namePh: "اسمك الكريم",
        email: "البريد الإلكتروني", emailPh: "example@email.com",
        phone: "رقم الهاتف", phonePh: "07xxxxxxxxx",
        subject: "الموضوع", subjectPh: "موضوع الرسالة",
        clinic: "اسم العيادة (اختياري)", clinicPh: "اسم عيادتك",
        message: "رسالتك", messagePh: "اكتب رسالتك هنا...",
        submit: "📨 إرسال الرسالة",
        success: "✅ تم إرسال رسالتك بنجاح! سيتواصل معك فريقنا خلال 24 ساعة.",
      }
    },
    faq: {
      badge: "❓ الأسئلة الشائعة",
      title: "الأسئلة المتكررة",
      sub: "اعثر على إجابات للأسئلة الشائعة. لم تجد ما تبحث عنه؟",
      contact: "تواصل مع فريق الدعم",
      groups: [
        {
          title: "🚀 البدء",
          items: [
            { q: "هل يمكنني ترقية أو تخفيض باقتي؟", a: "نعم! يمكنك ترقية أو تخفيض باقتك في أي وقت. عند الترقية، ستحصل على وصول فوري للميزات الجديدة. عند التخفيض، تسري التغييرات في نهاية فترة الفوترة." },
            { q: "هل تتوفر فترة تجريبية مجانية؟", a: "نعم، نقدم فترة تجريبية مجانية حتى تتمكن من استكشاف جميع الميزات قبل الالتزام. خلال الفترة التجريبية، تحصل على وصول كامل للنظام بدون أي التزامات." },
            { q: "هل يمكنني إلغاء اشتراكي؟", a: "نعم، يمكنك إلغاء اشتراكك في أي وقت. ستظل بياناتك متاحة حتى نهاية فترة الفوترة. كما نوفر خيارات تصدير البيانات." },
          ]
        },
        {
          title: "🔒 الأمان والمدفوعات",
          items: [
            { q: "ما هي طرق الدفع المقبولة؟", a: "نقبل الدفع النقدي والتحويلات البنكية وخدمات الأموال المتنقلة مثل زين كاش وفاست باي. تواصل مع فريق المبيعات لإعداد طريقة الدفع المفضلة لديك." },
            { q: "هل بيانات مرضاي آمنة؟", a: "نعم، نستخدم تشفيراً من الدرجة المصرفية لحماية جميع البيانات. لا يمكن لأي طرف ثالث الوصول إلى بيانات مرضاك." },
          ]
        },
        {
          title: "⚙️ الميزات",
          items: [
            { q: "هل يمكنني الوصول من الهاتف المحمول؟", a: "نعم! العيادة الرقمية متجاوبة بالكامل وتعمل على جميع الأجهزة بما في ذلك الهواتف الذكية والأجهزة اللوحية. يمكنك إدارة المواعيد وعرض سجلات المرضى من أي مكان." },
            { q: "هل يرسل النظام تذكيرات بالمواعيد؟", a: "نعم، يمكن للنظام إرسال تذكيرات آلية بالمواعيد للمرضى عبر الرسائل القصيرة أو واتساب لتقليل حالات عدم الحضور." },
            { q: "هل يمكنني إنشاء التقارير والتحليلات؟", a: "بالتأكيد! توفر العيادة الرقمية تقارير شاملة تشمل الملخصات المالية، إحصائيات المرضى، تحليلات المواعيد. يمكن تصدير جميع التقارير إلى Excel." },
          ]
        },
      ]
    },
    cta: {
      title: "مستعد لتحويل عيادتك؟",
      sub: "انضم إلى مئات العيادات في العراق التي تستخدم العيادة الرقمية.",
      btn1: "🚀 إنشاء حساب مجاني",
      btn2: "عرض خطط الأسعار",
      badges: ["💳 لا حاجة لبطاقة ائتمان", "🔒 آمن وخاص", "📞 دعم 24/7"],
    },
    footer: {
      desc: "نظام شامل لإدارة العيادات مصمم للممارسات الطبية في العراق. أدر مرضاك ومواعيدك وأموالك بكفاءة.",
      links: "روابط سريعة",
      feat: "المميزات",
      legal: "قانوني",
      terms: "الشروط والأحكام",
      privacy: "سياسة الخصوصية",
      copy: "© 2026 العيادة الرقمية. جميع الحقوق محفوظة.",
      by: "تصميم Dev Code",
    }
  },
  en: {
    dir: "ltr" as const,
    topbar: { email: "info@digitalclinic.iq", phone: "+964 770 281 4484", location: "Baghdad, Iraq" },
    nav: { home: "Home", features: "Features", pricing: "Pricing", contact: "Support", faq: "FAQ", login: "Login", signup: "Get Started" },
    hero: {
      badge: "⚕️ Iraq's Most Advanced Healthcare Tech",
      title1: "The Digital Future",
      title2: "of Your Clinic",
      subtitle: "Iraq's most advanced clinic management system. Manage patients, appointments, medical records, and billing in one intelligent platform.",
      cta1: "🚀 Register Your Clinic Free",
      cta2: "See How It Works",
      stat1val: "2,500+", stat1lbl: "Active Patients",
      stat2val: "150+", stat2lbl: "Clinics Trust Us",
      stat3val: "99.9%", stat3lbl: "Uptime",
      stat4val: "24/7", stat4lbl: "Support",
    },
    trust: ["🔒 Secure & Private", "☁️ 100% Cloud", "🌐 Multilingual", "📞 24/7 Support", "✅ Start Instantly"],
    features: {
      badge: "⚡ Our Features",
      title: "Everything Your Clinic Needs",
      sub: "Comprehensive tools to manage every aspect of your medical practice efficiently.",
      items: [
        { icon: "👥", badge: "Core", title: "Patient Management", desc: "Complete patient records with medical history, allergies, medications, and chronic conditions.", list: ["Complete patient records", "Medical history tracking", "Allergies & medications"] },
        { icon: "📅", badge: "Popular", title: "Appointment Scheduling", desc: "Smart appointment system with doctor availability, reminders, and status tracking.", list: ["Easy booking system", "Doctor availability", "WhatsApp reminders"] },
        { icon: "🩺", badge: "Key", title: "Medical Sessions", desc: "Record diagnoses and treatments, create follow-up session chains for comprehensive care.", list: ["Record diagnoses", "Treatment tracking", "Follow-up chains"] },
        { icon: "💊", badge: "Medical", title: "Prescriptions", desc: "Digital prescriptions with professional print layouts and medication tracking.", list: ["Digital prescriptions", "Professional printing", "Medication tracking"] },
        { icon: "💰", badge: "★ Most Used", title: "Financial Management", desc: "Track payments, manage expenses, and generate financial reports for your clinic.", list: ["Payment tracking", "Expense management", "Financial reports"] },
        { icon: "🏢", badge: "Scalable", title: "Multi-Clinic Support", desc: "Manage multiple clinic branches with isolated data and centralized control.", list: ["Multiple clinics", "Isolated data per clinic", "Central control"] },
      ]
    },
    why: {
      badge: "💡 Why Us?",
      title: "Built for Iraqi Clinics",
      sub: "We understand the local context and build solutions that truly fit your needs.",
      items: [
        { title: "Arabic, Kurdish & English Support", desc: "A multilingual interface suitable for all medical staff across Iraq." },
        { title: "No Credit Card Required", desc: "Start free and pay when you're ready. No prior commitments whatsoever." },
        { title: "WhatsApp & ZainCash Integration", desc: "Automatic appointment reminders via WhatsApp and local Iraqi payment methods." },
        { title: "Data Secured in Iraq", desc: "Reliable servers with enterprise-grade encryption to protect your patient data." },
      ],
      stats: [
        { val: "500+", lbl: "Active Clinics" },
        { val: "50K+", lbl: "Registered Patients" },
        { val: "99.9%", lbl: "Uptime" },
        { val: "4.9★", lbl: "Customer Rating" },
      ]
    },
    pricing: {
      badge: "💎 Pricing",
      title: "Transparent Pricing for Every Size",
      sub: "Choose the plan that fits your clinic. No hidden fees.",
      toggle: ["Monthly", "Yearly"],
      save: "Save 17%",
      plans: [
        { name: "Trial", tagline: "Try without commitment", monthlyPrice: "0", yearlyPrice: "0", doctors: "1 Doctor", highlight: false, features: ["50 patients", "200 appointments/mo", "Prescriptions", "Email support"], cta: "Start Free" },
        { name: "Basic", tagline: "For solo practitioners", monthlyPrice: "25,000", yearlyPrice: "250,000", doctors: "1–2 Doctors", highlight: false, features: ["Unlimited records", "Unlimited appointments", "Prescriptions", "Financial reports", "Phone support"], cta: "Get Started" },
        { name: "Silver", tagline: "For small clinics", monthlyPrice: "60,000", yearlyPrice: "600,000", doctors: "3–5 Doctors", highlight: false, features: ["All Basic features", "Multi-clinic", "WhatsApp reminders", "Advanced reports", "Priority support"], cta: "Get Started" },
        { name: "Gold", tagline: "Most Popular", monthlyPrice: "120,000", yearlyPrice: "1,200,000", doctors: "6–15 Doctors", highlight: true, features: ["All Silver features", "Lab integration", "Mobile app", "Dedicated account manager", "24/7 support"], cta: "Get Started" },
        { name: "Platinum", tagline: "For clinic chains", monthlyPrice: "300,000", yearlyPrice: "3,000,000", doctors: "Unlimited Doctors", highlight: false, features: ["All Gold features", "Custom API", "On-site training", "99.99% SLA", "VIP support"], cta: "Contact Us" },
      ],
      currency: "IQD",
      period: "/mo",
      yearNote: "Billed annually",
    },
    contact: {
      badge: "📬 Contact Us",
      title: "We're Here to Help",
      sub: "Our local team is available to answer all your inquiries.",
      info: [
        { icon: "📧", label: "Email", value: "info@digitalclinic.iq" },
        { icon: "📞", label: "Phone", value: "+964 770 281 4484" },
        { icon: "💬", label: "WhatsApp", value: "+964 770 281 4484" },
        { icon: "📍", label: "Location", value: "Baghdad, Iraq" },
        { icon: "🕐", label: "Working Hours", value: "Sat–Thu: 9 AM – 6 PM" },
      ],
      form: {
        title: "Send a Message",
        name: "Full Name", namePh: "Your name",
        email: "Email Address", emailPh: "example@email.com",
        phone: "Phone Number", phonePh: "07xxxxxxxxx",
        subject: "Subject", subjectPh: "Message subject",
        clinic: "Clinic Name (optional)", clinicPh: "Your clinic name",
        message: "Your Message", messagePh: "Write your message here...",
        submit: "📨 Send Message",
        success: "✅ Your message has been sent successfully! Our team will contact you within 24 hours.",
      }
    },
    faq: {
      badge: "❓ FAQ",
      title: "Frequently Asked Questions",
      sub: "Find answers to common questions. Didn't find what you're looking for?",
      contact: "Contact Support",
      groups: [
        {
          title: "🚀 Getting Started",
          items: [
            { q: "Can I upgrade or downgrade my plan?", a: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you get immediate access to new features. When downgrading, changes take effect at the end of the billing period." },
            { q: "Is there a free trial?", a: "Yes, we offer a free trial so you can explore all features before committing. During the trial, you get full system access with no obligations." },
            { q: "Can I cancel my subscription?", a: "Yes, you can cancel your subscription at any time. Your data will remain accessible until the end of the billing period. We also provide data export options." },
          ]
        },
        {
          title: "🔒 Security & Payments",
          items: [
            { q: "What payment methods are accepted?", a: "We accept cash, bank transfers, and mobile money services like ZainCash and FastPay. Contact our sales team to set up your preferred payment method." },
            { q: "Is my patient data secure?", a: "Yes, we use banking-grade encryption to protect all data. No third party can access your patient data." },
          ]
        },
        {
          title: "⚙️ Features",
          items: [
            { q: "Can I access the system from my mobile phone?", a: "Yes! Digital Clinic is fully responsive and works on all devices including smartphones and tablets. You can manage appointments and view patient records from anywhere." },
            { q: "Does the system send appointment reminders?", a: "Yes, the system can send automatic appointment reminders to patients via SMS or WhatsApp to reduce no-shows and improve clinic efficiency." },
            { q: "Can I generate reports and analytics?", a: "Absolutely! Digital Clinic provides comprehensive reports including financial summaries, patient statistics, appointment analytics, and doctor performance metrics. All reports can be exported to Excel." },
          ]
        },
      ]
    },
    cta: {
      title: "Ready to Transform Your Clinic?",
      sub: "Join hundreds of clinics in Iraq using Digital Clinic to deliver exceptional patient care.",
      btn1: "🚀 Create Free Account",
      btn2: "View Pricing Plans",
      badges: ["💳 No credit card needed", "🔒 Secure & private", "📞 24/7 support"],
    },
    footer: {
      desc: "A comprehensive clinic management system designed for medical practices in Iraq. Manage your patients, appointments, and finances with efficiency.",
      links: "Quick Links",
      feat: "Features",
      legal: "Legal",
      terms: "Terms & Conditions",
      privacy: "Privacy Policy",
      copy: "© 2026 Digital Clinic. All rights reserved.",
      by: "Designed by Dev Code",
    }
  }
};

// ─── MOCKUP DASHBOARD COMPONENT ──────────────────────────────────────────────
function DashboardMockup({ lang }: { lang: Lang }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(i);
  }, []);

  const patients = [1284, 1285, 1286, 1287];
  const today = [48, 49, 50, 51];

  return (
    <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)", maxWidth: 480, width: "100%", direction: "ltr" }}>
      {/* Browser bar */}
      <div style={{ background: "#1a1f2e", padding: "12px 16px", display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>digitalclinic.iq/dashboard</span>
      </div>
      {/* Gradient banner */}
      <div style={{ background: "linear-gradient(135deg, #1a6fba, #0f4d8a)", padding: "24px 20px 20px" }}>
        <div style={{ color: "#93c5fd", fontSize: 12, marginBottom: 6, fontWeight: 600 }}>
          {lang === "ar" ? "صباح الخير، د. أحمد 👋" : "Good morning, Dr. Ahmed 👋"}
        </div>
        <div style={{ color: "#fff", fontSize: 18, fontWeight: 800, marginBottom: 16 }}>
          {lang === "ar" ? "لوحة تحكم العيادة الرقمية" : "Digital Clinic Dashboard"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { val: patients[tick % 4].toLocaleString(), lbl: lang === "ar" ? "المرضى" : "Patients", color: "#60a5fa" },
            { val: today[tick % 4], lbl: lang === "ar" ? "اليوم" : "Today", color: "#34d399" },
            { val: "✓ 3", lbl: lang === "ar" ? "مؤكد" : "Confirmed", color: "#fbbf24" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 8px", textAlign: "center", backdropFilter: "blur(4px)" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>
      {/* List preview */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
          <span>{lang === "ar" ? "مواعيد اليوم" : "Today's Appointments"}</span>
          <span style={{ color: "#1a6fba", cursor: "pointer" }}>{lang === "ar" ? "عرض الكل" : "View all"}</span>
        </div>
        {[
          { name: lang === "ar" ? "علي حسن" : "Ali Hassan", time: "9:00", status: lang === "ar" ? "مؤكد" : "Confirmed", color: "#10b981" },
          { name: lang === "ar" ? "سارة أحمد" : "Sara Ahmed", time: "10:30", status: lang === "ar" ? "قيد الانتظار" : "Waiting", color: "#f59e0b" },
          { name: lang === "ar" ? "محمد كريم" : "Mohamed Kareem", time: "11:00", status: lang === "ar" ? "مؤكد" : "Confirmed", color: "#10b981" },
        ].map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 2 ? "1px solid #f1f5f9" : "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `hsl(${(i * 80) + 200},60%,85%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
              {a.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{a.name}</div>
              <div style={{ fontSize: 10, color: "#9ca3af" }}>{a.time}</div>
            </div>
            <div style={{ fontSize: 10, background: a.color + "20", color: a.color, padding: "3px 8px", borderRadius: 20, fontWeight: 700 }}>{a.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function DigitalClinicLanding() {
  const [lang, setLang] = useState<Lang>("ar");
  const [page, setPage] = useState<Page>("home");
  const [billingYearly, setBillingYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>("0-0");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const t = T[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = (p: Page) => { setPage(p); setMobileOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // ─── STYLES ──────────────────────────────────────────────────────────────
  const isRtl = lang === "ar";

  // Google Fonts via @import in a style tag approach — injected once
  const fontStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Syne:wght@400;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Cairo','Syne',sans-serif;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideIn{from{opacity:0;transform:translateX(-32px)}to{opacity:1;transform:translateX(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    @keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(26,111,186,0.4)}50%{box-shadow:0 0 60px rgba(26,111,186,0.8)}}
    .fade-up{animation:fadeUp .7s ease forwards;}
    .slide-in{animation:slideIn .7s ease forwards;}
    .float-anim{animation:float 4s ease-in-out infinite;}
    .gradient-text{
      background:linear-gradient(135deg,#60a5fa,#34d399,#a78bfa);
      background-size:200% 200%;
      animation:gradShift 4s ease infinite;
      -webkit-background-clip:text;
      -webkit-text-fill-color:transparent;
      background-clip:text;
    }
    input,textarea,select{outline:none;}
    a{text-decoration:none;}
    button{cursor:pointer;font-family:'Cairo','Syne',sans-serif;}
    ::-webkit-scrollbar{width:6px;}
    ::-webkit-scrollbar-track{background:#0d1b2a;}
    ::-webkit-scrollbar-thumb{background:#1a6fba;border-radius:3px;}
    .plan-card-hover:hover{transform:translateY(-8px);box-shadow:0 32px 80px rgba(26,111,186,0.25);}
    .feat-card-hover:hover{transform:translateY(-6px);}
    .btn-shine{position:relative;overflow:hidden;}
    .btn-shine::after{content:'';position:absolute;top:-50%;left:-60%;width:40%;height:200%;background:rgba(255,255,255,0.15);transform:skewX(-20deg);transition:left .4s;}
    .btn-shine:hover::after{left:120%;}
    @media(max-width:900px){
      .hero-grid{grid-template-columns:1fr!important;}
      .why-grid{grid-template-columns:1fr!important;}
      .feat-grid{grid-template-columns:1fr 1fr!important;}
      .plan-grid{grid-template-columns:1fr!important;}
      .contact-grid{grid-template-columns:1fr!important;}
      .footer-grid{grid-template-columns:1fr 1fr!important;}
      .hero-mockup-wrap{display:none!important;}
      .stat-row{flex-wrap:wrap!important;}
      .nav-links-wrap{display:none!important;}
    }
    @media(max-width:600px){
      .feat-grid{grid-template-columns:1fr!important;}
      .footer-grid{grid-template-columns:1fr!important;}
      .hero h1{font-size:36px!important;}
    }
  `;

  const C = {
    bg: "#060d18",
    surface: "#0d1b2a",
    surface2: "#111f30",
    border: "rgba(255,255,255,0.07)",
    blue: "#1a6fba",
    blueBright: "#3b9eff",
    teal: "#0fb8a0",
    gold: "#f6ad55",
    green: "#22c55e",
    text: "#e2e8f0",
    muted: "#64748b",
    white: "#ffffff",
  };

  const btnPrimary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "14px 28px", borderRadius: 50, fontSize: 15, fontWeight: 800,
    border: "none", cursor: "pointer",
    background: `linear-gradient(135deg, ${C.blue}, #2563eb)`,
    color: "#fff", transition: "all .25s",
    boxShadow: "0 4px 20px rgba(26,111,186,0.4)",
    fontFamily: "'Cairo','Syne',sans-serif",
  };

  const btnGhost: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "13px 28px", borderRadius: 50, fontSize: 15, fontWeight: 700,
    border: "2px solid rgba(255,255,255,0.2)", cursor: "pointer",
    background: "rgba(255,255,255,0.05)", color: "#fff",
    transition: "all .25s", backdropFilter: "blur(8px)",
    fontFamily: "'Cairo','Syne',sans-serif",
  };

  const sectionWrap: React.CSSProperties = {
    padding: "100px 0", direction: t.dir,
  };

  const container: React.CSSProperties = {
    maxWidth: 1180, margin: "0 auto", padding: "0 24px",
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Cairo','Syne',sans-serif", direction: t.dir, overflowX: "hidden" }}>
      <style>{fontStyle}</style>

      {/* ── TOPBAR ─────────────────────────────────────────────────────── */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "8px 0", fontSize: 12 }}>
        <div style={{ ...container, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 20, color: C.muted }}>
            <a href={`mailto:${t.topbar.email}`} style={{ color: C.muted, display: "flex", gap: 6, alignItems: "center" }}>📧 {t.topbar.email}</a>
            <a href={`tel:${t.topbar.phone}`} style={{ color: C.muted, display: "flex", gap: 6, alignItems: "center" }}>📞 {t.topbar.phone}</a>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {/* Live badge */}
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.green }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, display: "inline-block", animation: "pulse 2s infinite" }} />
              {lang === "ar" ? "النظام يعمل" : "System Online"}
            </span>
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              style={{ background: "rgba(255,255,255,0.07)", border: `1px solid ${C.border}`, color: C.text, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .2s", fontFamily: "'Cairo','Syne',sans-serif" }}
            >
              {lang === "ar" ? "🇺🇸 EN" : "🇮🇶 عربي"}
            </button>
          </div>
        </div>
      </div>

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 1000,
        background: scrolled ? "rgba(6,13,24,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        transition: "all .3s",
      }}>
        <div style={{ ...container, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", gap: 20 }}>
          {/* Logo */}
          <button onClick={() => nav("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${C.blue}, ${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 16px rgba(26,111,186,0.5)", animation: "glow 3s ease-in-out infinite" }}>
              🏥
            </div>
            <div style={{ textAlign: isRtl ? "right" : "left" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.white, lineHeight: 1.1 }}>
                {lang === "ar" ? <>العيادة <span style={{ color: C.blueBright }}>الرقمية</span></> : <>Digital <span style={{ color: C.blueBright }}>Clinic</span></>}
              </div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 500 }}>
                {lang === "ar" ? "منصة إدارة العيادات" : "Clinic Management Platform"}
              </div>
            </div>
          </button>

          {/* Nav links */}
          <div className="nav-links-wrap" style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {(["home", "features", "pricing", "contact", "faq"] as Page[]).map(p => (
              <button key={p} onClick={() => nav(p)} style={{
                background: page === p ? "rgba(26,111,186,0.2)" : "transparent",
                border: page === p ? "1px solid rgba(26,111,186,0.4)" : "1px solid transparent",
                color: page === p ? C.blueBright : C.muted,
                padding: "8px 16px", borderRadius: 50, fontSize: 14, fontWeight: 700,
                cursor: "pointer", transition: "all .2s", fontFamily: "'Cairo','Syne',sans-serif",
              }}>
                {t.nav[p]}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => nav("contact")} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.text, padding: "9px 18px", borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Cairo','Syne',sans-serif" }}>
              {t.nav.login}
            </button>
            <button className="btn-shine" onClick={() => nav("pricing")} style={{ ...btnPrimary, padding: "9px 20px", fontSize: 14 }}>
              {t.nav.signup}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: "none", border: `1px solid ${C.border}`, color: C.text, padding: "8px", borderRadius: 10, fontSize: 18, cursor: "pointer", display: "none" }} className="mobile-menu-btn">
              ☰
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div style={{ background: C.surface, padding: "16px 24px", borderTop: `1px solid ${C.border}` }}>
            {(["home", "features", "pricing", "contact", "faq"] as Page[]).map(p => (
              <button key={p} onClick={() => nav(p)} style={{ display: "block", width: "100%", textAlign: isRtl ? "right" : "left", background: "none", border: "none", color: C.text, padding: "12px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", borderBottom: `1px solid ${C.border}`, fontFamily: "'Cairo','Syne',sans-serif" }}>
                {t.nav[p]}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ═══════════════════ PAGE: HOME ═══════════════════════════════════ */}
      {page === "home" && (
        <>
          {/* HERO */}
          <section style={{ position: "relative", overflow: "hidden", minHeight: "92vh", display: "flex", alignItems: "center" }}>
            {/* animated background */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(26,111,186,0.2) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 60%, rgba(15,184,160,0.12) 0%, transparent 50%)" }} />
            {/* grid pattern */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "60px 60px", opacity: .5 }} />
            {/* glow orbs */}
            <div style={{ position: "absolute", top: "10%", left: isRtl ? "auto" : "5%", right: isRtl ? "5%" : "auto", width: 400, height: 400, borderRadius: "50%", background: "rgba(26,111,186,0.08)", filter: "blur(80px)", animation: "float 6s ease-in-out infinite" }} />
            <div style={{ position: "absolute", bottom: "10%", right: isRtl ? "auto" : "5%", left: isRtl ? "5%" : "auto", width: 300, height: 300, borderRadius: "50%", background: "rgba(15,184,160,0.08)", filter: "blur(60px)", animation: "float 8s ease-in-out infinite reverse" }} />

            <div style={{ ...container, paddingTop: 60, paddingBottom: 60, position: "relative", width: "100%" }}>
              <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
                {/* Content */}
                <div className="fade-up">
                  {/* Badge */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(26,111,186,0.15)", border: "1px solid rgba(26,111,186,0.35)", color: "#93c5fd", padding: "8px 18px", borderRadius: 50, fontSize: 13, fontWeight: 700, marginBottom: 28 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#93c5fd", animation: "pulse 2s infinite", display: "inline-block" }} />
                    {t.hero.badge}
                  </div>

                  {/* Title */}
                  <h1 style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.2, marginBottom: 24, letterSpacing: "-1px" }}>
                    <span style={{ display: "block", color: C.white }}>{t.hero.title1}</span>
                    <span className="gradient-text" style={{ display: "block" }}>{t.hero.title2}</span>
                  </h1>

                  <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.8, marginBottom: 40, maxWidth: 500 }}>
                    {t.hero.subtitle}
                  </p>

                  {/* CTAs */}
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
                    <button className="btn-shine" onClick={() => nav("pricing")} style={btnPrimary}>
                      {t.hero.cta1}
                    </button>
                    <button onClick={() => nav("features")} style={btnGhost}>
                      {t.hero.cta2} {isRtl ? "←" : "→"}
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="stat-row" style={{ display: "flex", gap: 32, paddingTop: 28, borderTop: `1px solid ${C.border}` }}>
                    {[
                      { val: t.hero.stat1val, lbl: t.hero.stat1lbl },
                      { val: t.hero.stat2val, lbl: t.hero.stat2lbl },
                      { val: t.hero.stat3val, lbl: t.hero.stat3lbl },
                      { val: t.hero.stat4val, lbl: t.hero.stat4lbl },
                    ].map((s, i) => (
                      <div key={i}>
                        <div style={{ fontSize: 26, fontWeight: 900, color: C.white, lineHeight: 1 }}>{s.val}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dashboard Visual */}
                <div className="hero-mockup-wrap float-anim" style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                  {/* Decorative ring */}
                  <div style={{ position: "absolute", inset: -24, borderRadius: 32, border: "1px solid rgba(26,111,186,0.2)", animation: "glow 3s ease-in-out infinite" }} />
                  <DashboardMockup lang={lang} />
                </div>
              </div>
            </div>
          </section>

          {/* TRUST BAR */}
          <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "16px 0", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
              {t.trust.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: C.muted, whiteSpace: "nowrap" }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* FEATURES PREVIEW */}
          <section style={sectionWrap}>
            <div style={container}>
              <div style={{ textAlign: "center", marginBottom: 64 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(26,111,186,0.1)", border: "1px solid rgba(26,111,186,0.25)", color: "#93c5fd", padding: "6px 16px", borderRadius: 50, fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
                  {t.features.badge}
                </div>
                <h2 style={{ fontSize: 42, fontWeight: 900, color: C.white, marginBottom: 16 }}>{t.features.title}</h2>
                <p style={{ fontSize: 16, color: C.muted, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>{t.features.sub}</p>
              </div>
              <div className="feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
                {t.features.items.map((f, i) => (
                  <div key={i} className="feat-card-hover" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, transition: "all .3s", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${C.blue},${C.teal})`, opacity: 0.6 }} />
                    <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                    <div style={{ display: "inline-block", background: "rgba(26,111,186,0.12)", color: "#93c5fd", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, marginBottom: 12 }}>{f.badge}</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: C.white, marginBottom: 8 }}>{f.title}</div>
                    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 16 }}>{f.desc}</p>
                    <ul style={{ listStyle: "none" }}>
                      {f.list.map((li, j) => (
                        <li key={j} style={{ fontSize: 13, color: C.text, padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: C.green, fontWeight: 800 }}>✓</span> {li}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <button className="btn-shine" onClick={() => nav("features")} style={btnPrimary}>
                  {lang === "ar" ? "استكشف جميع المميزات →" : "Explore All Features →"}
                </button>
              </div>
            </div>
          </section>

          {/* WHY US */}
          <section style={{ ...sectionWrap, background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
            <div style={container}>
              <div className="why-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(26,111,186,0.1)", border: "1px solid rgba(26,111,186,0.25)", color: "#93c5fd", padding: "6px 16px", borderRadius: 50, fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
                    {t.why.badge}
                  </div>
                  <h2 style={{ fontSize: 40, fontWeight: 900, color: C.white, marginBottom: 16 }}>{t.why.title}</h2>
                  <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.7, marginBottom: 36 }}>{t.why.sub}</p>
                  {/* Stats grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>
                    {t.why.stats.map((s, i) => (
                      <div key={i} style={{ background: "rgba(26,111,186,0.08)", border: "1px solid rgba(26,111,186,0.2)", borderRadius: 16, padding: "20px 16px", textAlign: "center" }}>
                        <div style={{ fontSize: 30, fontWeight: 900, color: "#60a5fa" }}>{s.val}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                  <button className="btn-shine" onClick={() => nav("pricing")} style={btnPrimary}>
                    {lang === "ar" ? "ابدأ مجاناً اليوم" : "Start Free Today"}
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {t.why.items.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 24px", transition: "all .3s" }}>
                      <div style={{ width: 40, height: 40, minWidth: 40, background: `linear-gradient(135deg,${C.blue},${C.teal})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff" }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: C.white, marginBottom: 4 }}>{item.title}</div>
                        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* PRICING PREVIEW */}
          <section style={sectionWrap}>
            <div style={container}>
              <div style={{ textAlign: "center", marginBottom: 64 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(246,173,85,0.1)", border: "1px solid rgba(246,173,85,0.25)", color: C.gold, padding: "6px 16px", borderRadius: 50, fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
                  {t.pricing.badge}
                </div>
                <h2 style={{ fontSize: 42, fontWeight: 900, color: C.white, marginBottom: 16 }}>{t.pricing.title}</h2>
                <p style={{ fontSize: 16, color: C.muted, maxWidth: 500, margin: "0 auto 32px", lineHeight: 1.7 }}>{t.pricing.sub}</p>
                {/* Billing toggle */}
                <div style={{ display: "inline-flex", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 50, padding: 4, gap: 4 }}>
                  {t.pricing.toggle.map((label, i) => (
                    <button key={i} onClick={() => setBillingYearly(i === 1)} style={{ padding: "8px 20px", borderRadius: 50, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: (i === 1) === billingYearly ? `linear-gradient(135deg,${C.blue},#2563eb)` : "transparent", color: (i === 1) === billingYearly ? "#fff" : C.muted, transition: "all .25s", fontFamily: "'Cairo','Syne',sans-serif" }}>
                      {label} {i === 1 && <span style={{ fontSize: 10, background: "rgba(34,197,94,0.2)", color: C.green, padding: "2px 6px", borderRadius: 10, marginInlineStart: 6 }}>{t.pricing.save}</span>}
                    </button>
                  ))}
                </div>
              </div>
              {/* Show only 3 plans on home */}
              <div className="plan-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                {t.pricing.plans.slice(0, 3).map((plan, i) => (
                  <div key={i} className="plan-card-hover" style={{ background: plan.highlight ? `linear-gradient(160deg,${C.blue}22,${C.teal}11)` : C.surface, border: `2px solid ${plan.highlight ? C.blue : C.border}`, borderRadius: 24, padding: "32px 28px", position: "relative", transition: "all .3s", boxShadow: plan.highlight ? `0 0 40px rgba(26,111,186,0.25)` : "none" }}>
                    {plan.highlight && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg,${C.gold},#f59e0b)`, color: "#000", padding: "4px 18px", borderRadius: 50, fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" }}>
                      {lang === "ar" ? "⭐ الأكثر شعبية" : "⭐ Most Popular"}
                    </div>}
                    <div style={{ fontSize: 20, fontWeight: 900, color: C.white, marginBottom: 4 }}>{plan.name}</div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>{plan.tagline}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: C.muted }}>{t.pricing.currency}</span>
                      <span style={{ fontSize: 44, fontWeight: 900, color: C.white, lineHeight: 1 }}>
                        {billingYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span style={{ fontSize: 13, color: C.muted }}>{t.pricing.period}</span>
                    </div>
                    {billingYearly && <div style={{ fontSize: 11, color: C.teal, marginBottom: 8 }}>{t.pricing.yearNote}</div>}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 24 }}>
                      👨‍⚕️ {plan.doctors}
                    </div>
                    <div style={{ height: 1, background: C.border, marginBottom: 20 }} />
                    <ul style={{ listStyle: "none", marginBottom: 28 }}>
                      {plan.features.map((feat, j) => (
                        <li key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text, padding: "6px 0", borderBottom: j < plan.features.length - 1 ? `1px solid ${C.border}` : "none" }}>
                          <span style={{ color: C.green, fontWeight: 800 }}>✓</span> {feat}
                        </li>
                      ))}
                    </ul>
                    <button className="btn-shine" onClick={() => nav("pricing")} style={{ ...btnPrimary, width: "100%", justifyContent: "center", background: plan.highlight ? `linear-gradient(135deg,${C.blue},#2563eb)` : "transparent", border: `1px solid ${plan.highlight ? "transparent" : C.border}`, color: plan.highlight ? "#fff" : C.text }}>
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 32 }}>
                <button onClick={() => nav("pricing")} style={{ ...btnGhost, fontSize: 14 }}>
                  {lang === "ar" ? "عرض جميع الباقات الخمس ←" : "View All 5 Plans →"}
                </button>
              </div>
            </div>
          </section>

          {/* CTA SECTION */}
          <section style={{ position: "relative", padding: "100px 0", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg,${C.blue}dd,#0f4d8a)` }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%,rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
            <div style={{ ...container, textAlign: "center", position: "relative" }}>
              <h2 style={{ fontSize: 44, fontWeight: 900, color: "#fff", marginBottom: 16 }}>{t.cta.title}</h2>
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.8)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>{t.cta.sub}</p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
                <button className="btn-shine" onClick={() => nav("pricing")} style={{ ...btnPrimary, background: "#fff", color: C.blue, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                  {t.cta.btn1}
                </button>
                <button onClick={() => nav("pricing")} style={btnGhost}>{t.cta.btn2}</button>
              </div>
              <div style={{ display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap" }}>
                {t.cta.badges.map((b, i) => (
                  <span key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 6 }}>{b}</span>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ═══════════════════ PAGE: FEATURES ══════════════════════════════ */}
      {page === "features" && (
        <>
          <section style={{ position: "relative", padding: "100px 0 80px", overflow: "hidden", background: `linear-gradient(135deg,${C.blue}22,${C.bg})` }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
            <div style={{ ...container, textAlign: "center", position: "relative" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(26,111,186,0.15)", border: "1px solid rgba(26,111,186,0.3)", color: "#93c5fd", padding: "8px 18px", borderRadius: 50, fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
                {t.features.badge}
              </div>
              <h1 style={{ fontSize: 52, fontWeight: 900, color: C.white, marginBottom: 20 }}>{t.features.title}</h1>
              <p style={{ fontSize: 17, color: C.muted, maxWidth: 580, margin: "0 auto 40px", lineHeight: 1.7 }}>{t.features.sub}</p>
              <div className="stat-row" style={{ display: "flex", justifyContent: "center", gap: 48, paddingTop: 32, borderTop: `1px solid ${C.border}` }}>
                {t.why.stats.map((s, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#60a5fa" }}>{s.val}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section style={sectionWrap}>
            <div style={container}>
              <div className="feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
                {t.features.items.map((f, i) => (
                  <div key={i} className="feat-card-hover" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, transition: "all .3s", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${C.blue},${C.teal})` }} />
                    <div style={{ fontSize: 44, marginBottom: 20 }}>{f.icon}</div>
                    <div style={{ display: "inline-block", background: "rgba(26,111,186,0.12)", color: "#93c5fd", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, marginBottom: 14 }}>{f.badge}</div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: C.white, marginBottom: 10 }}>{f.title}</div>
                    <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 20 }}>{f.desc}</p>
                    <ul style={{ listStyle: "none" }}>
                      {f.list.map((li, j) => (
                        <li key={j} style={{ fontSize: 13, color: C.text, padding: "6px 0", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ color: C.green, fontWeight: 800, fontSize: 15 }}>✓</span> {li}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section style={{ ...sectionWrap, background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
            <div style={container}>
              <div className="why-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: 36, fontWeight: 900, color: C.white, marginBottom: 24 }}>{t.why.title}</h2>
                  {t.why.items.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 24 }}>
                      <div style={{ width: 36, height: 36, minWidth: 36, background: `linear-gradient(135deg,${C.blue},${C.teal})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff" }}>{i + 1}</div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: C.white, marginBottom: 4 }}>{item.title}</div>
                        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {t.why.stats.map((s, i) => (
                    <div key={i} style={{ background: "rgba(26,111,186,0.08)", border: "1px solid rgba(26,111,186,0.2)", borderRadius: 16, padding: "24px 20px", textAlign: "center" }}>
                      <div style={{ fontSize: 32, fontWeight: 900, color: "#60a5fa" }}>{s.val}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <CtaSection lang={lang} t={t} nav={nav} btnPrimary={btnPrimary} btnGhost={btnGhost} container={container} C={C} />
        </>
      )}

      {/* ═══════════════════ PAGE: PRICING ═══════════════════════════════ */}
      {page === "pricing" && (
        <>
          <section style={{ padding: "100px 0 80px", background: `linear-gradient(135deg,${C.surface},${C.bg})`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
            <div style={{ ...container, textAlign: "center", position: "relative" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(246,173,85,0.1)", border: "1px solid rgba(246,173,85,0.25)", color: C.gold, padding: "8px 18px", borderRadius: 50, fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
                {t.pricing.badge}
              </div>
              <h1 style={{ fontSize: 52, fontWeight: 900, color: C.white, marginBottom: 20 }}>{t.pricing.title}</h1>
              <p style={{ fontSize: 17, color: C.muted, maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.7 }}>{t.pricing.sub}</p>
              <div style={{ display: "inline-flex", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 50, padding: 4, gap: 4 }}>
                {t.pricing.toggle.map((label, i) => (
                  <button key={i} onClick={() => setBillingYearly(i === 1)} style={{ padding: "10px 24px", borderRadius: 50, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", background: (i === 1) === billingYearly ? `linear-gradient(135deg,${C.blue},#2563eb)` : "transparent", color: (i === 1) === billingYearly ? "#fff" : C.muted, transition: "all .25s", fontFamily: "'Cairo','Syne',sans-serif" }}>
                    {label} {i === 1 && billingYearly && <span style={{ fontSize: 10, background: "rgba(34,197,94,0.2)", color: C.green, padding: "2px 8px", borderRadius: 10, marginInlineStart: 6 }}>{t.pricing.save}</span>}
                  </button>
                ))}
              </div>
            </div>
          </section>
          <section style={{ padding: "60px 0 100px" }}>
            <div style={container}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16 }}>
                {t.pricing.plans.map((plan, i) => (
                  <div key={i} className="plan-card-hover" style={{ background: plan.highlight ? `linear-gradient(160deg,${C.blue}33,${C.teal}11)` : C.surface, border: `2px solid ${plan.highlight ? C.blue : C.border}`, borderRadius: 20, padding: "24px 18px", position: "relative", transition: "all .3s", boxShadow: plan.highlight ? `0 0 50px rgba(26,111,186,0.3)` : "none" }}>
                    {plan.highlight && <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg,${C.gold},#f59e0b)`, color: "#000", padding: "4px 14px", borderRadius: 50, fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>
                      {lang === "ar" ? "⭐ الأكثر شعبية" : "⭐ Most Popular"}
                    </div>}
                    <div style={{ fontSize: 17, fontWeight: 900, color: C.white, marginBottom: 4 }}>{plan.name}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>{plan.tagline}</div>
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: C.muted }}>{t.pricing.currency} </span>
                      <span style={{ fontSize: 28, fontWeight: 900, color: C.white }}>{billingYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                      <span style={{ fontSize: 11, color: C.muted }}>{t.pricing.period}</span>
                    </div>
                    <div style={{ fontSize: 10, color: C.teal, marginBottom: 12 }}>{billingYearly && t.pricing.yearNote}</div>
                    <div style={{ fontSize: 11, color: C.muted, background: "rgba(255,255,255,0.05)", padding: "5px 8px", borderRadius: 6, marginBottom: 16, fontWeight: 600 }}>👨‍⚕️ {plan.doctors}</div>
                    <div style={{ height: 1, background: C.border, marginBottom: 14 }} />
                    <ul style={{ listStyle: "none", marginBottom: 20 }}>
                      {plan.features.map((feat, j) => (
                        <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: C.text, padding: "5px 0" }}>
                          <span style={{ color: C.green, fontWeight: 800 }}>✓</span> {feat}
                        </li>
                      ))}
                    </ul>
                    <button className="btn-shine" onClick={() => nav("contact")} style={{ width: "100%", padding: "10px", borderRadius: 50, border: `1px solid ${plan.highlight ? "transparent" : C.border}`, fontSize: 12, fontWeight: 800, cursor: "pointer", background: plan.highlight ? `linear-gradient(135deg,${C.blue},#2563eb)` : "transparent", color: plan.highlight ? "#fff" : C.text, transition: "all .2s", fontFamily: "'Cairo','Syne',sans-serif" }}>
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
              <p style={{ textAlign: "center", marginTop: 24, color: C.muted, fontSize: 13 }}>
                {lang === "ar" ? "كل باقة تأتي مع وصول كامل لجميع الميزات. الفرق الوحيد هو عدد الأطباء المسموح به." : "Every plan includes full feature access. The only difference is the number of allowed doctors."}
              </p>
            </div>
          </section>
          <CtaSection lang={lang} t={t} nav={nav} btnPrimary={btnPrimary} btnGhost={btnGhost} container={container} C={C} />
        </>
      )}

      {/* ═══════════════════ PAGE: CONTACT ═══════════════════════════════ */}
      {page === "contact" && (
        <>
          <section style={{ padding: "100px 0 80px", background: `linear-gradient(135deg,${C.surface},${C.bg})`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
            <div style={{ ...container, textAlign: "center", position: "relative" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(26,111,186,0.1)", border: "1px solid rgba(26,111,186,0.25)", color: "#93c5fd", padding: "8px 18px", borderRadius: 50, fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
                {t.contact.badge}
              </div>
              <h1 style={{ fontSize: 52, fontWeight: 900, color: C.white, marginBottom: 20 }}>{t.contact.title}</h1>
              <p style={{ fontSize: 17, color: C.muted, maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>{t.contact.sub}</p>
            </div>
          </section>
          <section style={{ padding: "60px 0 100px" }}>
            <div style={container}>
              <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 48 }}>
                {/* Info */}
                <div>
                  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 24, padding: 32, marginBottom: 24 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.white, marginBottom: 24 }}>
                      {lang === "ar" ? "معلومات التواصل" : "Contact Information"}
                    </div>
                    {t.contact.info.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0", borderBottom: i < t.contact.info.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <div style={{ width: 40, height: 40, background: "rgba(26,111,186,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
                        <div>
                          <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{item.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.white }}>{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Form */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 24, padding: 36 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 28 }}>{t.contact.form.title}</div>
                  {formSent ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                      <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: C.white, marginBottom: 8 }}>{lang === "ar" ? "تم الإرسال بنجاح!" : "Sent Successfully!"}</div>
                      <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{lang === "ar" ? "سيتواصل معك فريقنا خلال 24 ساعة." : "Our team will contact you within 24 hours."}</div>
                    </div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); setFormSent(true); }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                        {[
                          { label: t.contact.form.name, ph: t.contact.form.namePh, type: "text" },
                          { label: t.contact.form.email, ph: t.contact.form.emailPh, type: "email" },
                        ].map((field, i) => (
                          <div key={i}>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>{field.label}</label>
                            <input type={field.type} placeholder={field.ph} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.bg, color: C.white, fontSize: 14, fontFamily: "'Cairo','Syne',sans-serif", direction: t.dir }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                        {[
                          { label: t.contact.form.phone, ph: t.contact.form.phonePh, type: "tel" },
                          { label: t.contact.form.subject, ph: t.contact.form.subjectPh, type: "text" },
                        ].map((field, i) => (
                          <div key={i}>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>{field.label}</label>
                            <input type={field.type} placeholder={field.ph} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.bg, color: C.white, fontSize: 14, fontFamily: "'Cairo','Syne',sans-serif", direction: t.dir }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>{t.contact.form.clinic}</label>
                        <input type="text" placeholder={t.contact.form.clinicPh} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.bg, color: C.white, fontSize: 14, fontFamily: "'Cairo','Syne',sans-serif", direction: t.dir }} />
                      </div>
                      <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>{t.contact.form.message} <span style={{ color: "#ef4444" }}>*</span></label>
                        <textarea required placeholder={t.contact.form.messagePh} rows={5} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.bg, color: C.white, fontSize: 14, fontFamily: "'Cairo','Syne',sans-serif", resize: "vertical", direction: t.dir }} />
                      </div>
                      <button type="submit" className="btn-shine" style={{ ...btnPrimary, width: "100%", justifyContent: "center", fontSize: 15 }}>
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

      {/* ═══════════════════ PAGE: FAQ ════════════════════════════════════ */}
      {page === "faq" && (
        <>
          <section style={{ padding: "100px 0 80px", background: `linear-gradient(135deg,${C.blue}22,${C.bg})`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
            <div style={{ ...container, textAlign: "center", position: "relative" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(26,111,186,0.1)", border: "1px solid rgba(26,111,186,0.25)", color: "#93c5fd", padding: "8px 18px", borderRadius: 50, fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
                {t.faq.badge}
              </div>
              <h1 style={{ fontSize: 52, fontWeight: 900, color: C.white, marginBottom: 20 }}>{t.faq.title}</h1>
              <p style={{ fontSize: 17, color: C.muted, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
                {t.faq.sub}{" "}
                <button onClick={() => nav("contact")} style={{ background: "none", border: "none", color: "#93c5fd", cursor: "pointer", fontWeight: 700, fontSize: 17, fontFamily: "'Cairo','Syne',sans-serif" }}>
                  {t.faq.contact}
                </button>
              </p>
            </div>
          </section>
          <section style={{ padding: "60px 0 100px" }}>
            <div style={{ ...container, maxWidth: 800 }}>
              {t.faq.groups.map((group, gi) => (
                <div key={gi} style={{ marginBottom: 48 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.white, marginBottom: 20, paddingBottom: 14, borderBottom: `2px solid rgba(26,111,186,0.3)`, display: "flex", alignItems: "center", gap: 10 }}>
                    {group.title}
                  </div>
                  {group.items.map((item, ii) => {
                    const key = `${gi}-${ii}`;
                    const isOpen = openFaq === key;
                    return (
                      <div key={ii} style={{ background: C.surface, border: `1px solid ${isOpen ? C.blue : C.border}`, borderRadius: 16, marginBottom: 12, overflow: "hidden", transition: "border-color .2s", boxShadow: isOpen ? `0 0 20px rgba(26,111,186,0.15)` : "none" }}>
                        <button onClick={() => setOpenFaq(isOpen ? null : key)} style={{ width: "100%", padding: "20px 24px", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: isRtl ? "right" : "left" }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: C.white, fontFamily: "'Cairo','Syne',sans-serif" }}>{item.q}</span>
                          <span style={{ color: C.blue, fontSize: 22, fontWeight: 900, transition: "transform .3s", transform: isOpen ? "rotate(45deg)" : "none", display: "inline-block", flexShrink: 0, marginInlineStart: 16 }}>+</span>
                        </button>
                        {isOpen && (
                          <div style={{ padding: "0 24px 20px", fontSize: 14, color: C.muted, lineHeight: 1.8 }}>
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
          <CtaSection lang={lang} t={t} nav={nav} btnPrimary={btnPrimary} btnGhost={btnGhost} container={container} C={C} />
        </>
      )}

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: "64px 0 24px" }}>
        <div style={container}>
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, paddingBottom: 48, borderBottom: `1px solid ${C.border}`, marginBottom: 24 }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${C.blue},${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏥</div>
                <span style={{ fontSize: 18, fontWeight: 900, color: C.white }}>{lang === "ar" ? "العيادة الرقمية" : "Digital Clinic"}</span>
              </div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, maxWidth: 280 }}>{t.footer.desc}</p>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                {["📘", "📸", "🐦", "💼"].map((icon, i) => (
                  <div key={i} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, transition: "all .2s" }}>
                    {icon}
                  </div>
                ))}
              </div>
            </div>
            {/* Links */}
            {[
              {
                title: t.footer.links,
                items: [
                  { label: t.nav.home, page: "home" as Page },
                  { label: t.nav.features, page: "features" as Page },
                  { label: t.nav.pricing, page: "pricing" as Page },
                  { label: t.nav.contact, page: "contact" as Page },
                ]
              },
              {
                title: t.footer.feat,
                items: [
                  { label: lang === "ar" ? "إدارة المرضى" : "Patient Management", page: "features" as Page },
                  { label: lang === "ar" ? "جدولة المواعيد" : "Scheduling", page: "features" as Page },
                  { label: lang === "ar" ? "الجلسات الطبية" : "Medical Sessions", page: "features" as Page },
                  { label: lang === "ar" ? "الإدارة المالية" : "Financial Mgmt", page: "features" as Page },
                ]
              },
              {
                title: t.footer.legal,
                items: [
                  { label: t.footer.terms, page: "home" as Page },
                  { label: t.footer.privacy, page: "home" as Page },
                  { label: t.nav.faq, page: "faq" as Page },
                  { label: t.nav.contact, page: "contact" as Page },
                ]
              },
            ].map((col, ci) => (
              <div key={ci}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.white, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>{col.title}</div>
                <ul style={{ listStyle: "none" }}>
                  {col.items.map((item, ii) => (
                    <li key={ii} style={{ marginBottom: 10 }}>
                      <button onClick={() => nav(item.page)} style={{ background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", fontFamily: "'Cairo','Syne',sans-serif", transition: "color .2s" }}>
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 12, color: C.muted }}>{t.footer.copy}</span>
            <span style={{ fontSize: 12, color: C.muted }}>{t.footer.by}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── SHARED CTA SECTION COMPONENT ────────────────────────────────────────────
function CtaSection({ lang, t, nav, btnPrimary, btnGhost, container, C }: {
  lang: Lang; t: typeof T["ar"]; nav: (p: Page) => void;
  btnPrimary: React.CSSProperties; btnGhost: React.CSSProperties;
  container: React.CSSProperties; C: Record<string, string>;
}) {
  return (
    <section style={{ position: "relative", padding: "100px 0", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg,${C.blue}dd,#0f4d8a)` }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%,rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      <div style={{ ...container, textAlign: "center", position: "relative" }}>
        <h2 style={{ fontSize: 44, fontWeight: 900, color: "#fff", marginBottom: 16 }}>{t.cta.title}</h2>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.8)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>{t.cta.sub}</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
          <button onClick={() => nav("pricing")} style={{ ...btnPrimary, background: "#fff", color: C.blue, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            {t.cta.btn1}
          </button>
          <button onClick={() => nav("pricing")} style={btnGhost}>{t.cta.btn2}</button>
        </div>
        <div style={{ display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap" }}>
          {t.cta.badges.map((b, i) => (
            <span key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 6 }}>{b}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
