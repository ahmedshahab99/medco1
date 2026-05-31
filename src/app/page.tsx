"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, Calendar, Users, FileText, DollarSign, Shield, Smartphone, Clock, Sparkles, CheckCircle2, Menu, X } from "lucide-react";

const FEATURES = [
  { icon: Calendar, title: "إدارة المواعيد", desc: "جدولة ذكية مع تذكيرات تلقائية للمرضى عبر واتساب", color: "from-emerald-400 to-teal-500", light: "bg-emerald-50 text-emerald-600" },
  { icon: Users, title: "ملفات المرضى", desc: "سجلات طبية كاملة مع التاريخ الصحي والوصفات والأشعة", color: "from-blue-400 to-indigo-500", light: "bg-blue-50 text-blue-600" },
  { icon: FileText, title: "الوصفات الرقمية", desc: "وصفات احترافية قابلة للطباعة مع تتبع الأدوية", color: "from-violet-400 to-purple-500", light: "bg-violet-50 text-violet-600" },
  { icon: DollarSign, title: "الإدارة المالية", desc: "تتبع الإيرادات والمصروفات مع تقارير شهرية ذكية", color: "from-amber-400 to-orange-500", light: "bg-amber-50 text-amber-600" },
  { icon: Smartphone, title: "متوافق مع الجوال", desc: "تجربة سلسة على الهاتف والتابلت دون تنزيل تطبيق", color: "from-rose-400 to-pink-500", light: "bg-rose-50 text-rose-600" },
  { icon: Shield, title: "آمن وموثوق", desc: "تشفير كامل للبيانات الطبية وحماية خصوصية المرضى", color: "from-cyan-400 to-sky-500", light: "bg-cyan-50 text-cyan-600" },
];

const STATS = [
  { value: 2500, suffix: "+", label: "مريض مسجل" },
  { value: 150, suffix: "+", label: "عيادة تثق بنا" },
  { value: 99, suffix: "%", label: "رضا المستخدمين" },
  { value: 24, suffix: "/7", label: "دعم فني" },
];

function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { let c = 0; const step = Math.ceil(target / 40); const i = setInterval(() => { c += step; if (c >= target) { c = target; clearInterval(i); } setCount(c); }, 40); obs.disconnect(); } }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString("ar-IQ")}</span>;
}

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-emerald-200 selection:text-emerald-900" dir="rtl">

      {/* ── Nav ── */}
      <header className="fixed inset-x-0 top-0 z-50 transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25">
              <Activity className="size-5 text-white" />
            </span>
            <span className="text-xl font-black text-slate-900">ميدكو</span>
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">تسجيل الدخول</Link>
            <Link href="/signup" className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">
              ابدأ الآن <ArrowLeft className="size-3.5" />
            </Link>
          </div>
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2"><Menu className="size-6" /></button>
        </div>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-white md:hidden">
            <div className="flex items-center justify-between p-4"><Link href="/" className="text-lg font-black">ميدكو</Link><button onClick={() => setMobileOpen(false)}><X className="size-6" /></button></div>
            <nav className="flex flex-col gap-2 p-4">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-xl border p-4 text-center font-bold">تسجيل الدخول</Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)} className="rounded-xl bg-slate-900 p-4 text-center font-bold text-white">إنشاء حساب</Link>
            </nav>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pb-20 pt-28 lg:pt-36">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/80 via-white to-white" />
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-200/40 via-blue-200/30 to-violet-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/50 px-4 py-1.5 text-sm font-bold text-emerald-700 backdrop-blur">
              <Sparkles className="size-4" /> نظام إدارة العيادات الذكي
            </div>
            <h1 className="text-balance text-4xl font-black leading-[1.15] tracking-tight sm:text-6xl lg:text-7xl">
              إدارة عيادتك<br />
              <span className="bg-gradient-to-l from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">بأسلوب عصري</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8 text-slate-500">
              منصة متكاملة لإدارة المرضى والمواعيد والسجلات الطبية والفواتير. صممت خصيصاً للعيادات العراقية بواجهة عربية أنيقة وسهلة.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all">
                ابدأ عيادتك مجاناً <ArrowLeft className="size-4" />
              </Link>
              <Link href="/login" className="rounded-2xl border border-slate-200 bg-white px-8 py-3.5 text-base font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
                تسجيل الدخول
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
                <p className="text-2xl font-black text-slate-900 sm:text-3xl">
                  <CountUp target={s.value} />{s.suffix}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-black uppercase tracking-widest text-emerald-600">المميزات</span>
            <h2 className="mt-3 text-balance text-3xl font-black text-slate-900 sm:text-4xl">كل ما تحتاجه عيادتك في مكان واحد</h2>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br p-0.5">
                    <div className={`flex size-full items-center justify-center rounded-[11px] ${f.light.split(" ")[0]} ${f.light.split(" ")[1]}`}>
                      <Icon className="size-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-slate-800">{f.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Preview ── */}
      <section className="px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 shadow-2xl shadow-indigo-500/10">
            <div className="grid items-center gap-10 p-8 lg:grid-cols-2 lg:p-16">
              <div className="text-white">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-emerald-300">تجربة سلسة</span>
                <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">لوحة تحكم احترافية</h2>
                <p className="mt-4 max-w-md text-base leading-8 text-slate-300">
                  واجهة سهلة الاستخدام، رسوم بيانية واضحة، ألوان مميزة لحالات المواعيد، وكل شيء في متناول يدك.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["تقويم ذكي", "ملفات مرضى", "تقارير مالية", "تذكيرات آلية", "وصفات رقمية", "دعم فني 24/7"].map((t) => (
                    <span key={t} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                      <CheckCircle2 className="size-3 text-emerald-400" /> {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur">
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between"><p className="font-black text-slate-800">جدول اليوم</p><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">٣ مواعيد</span></div>
                  <div className="mt-3 space-y-2">
                    {[{ n: "أحمد الزهراني", t: "09:00", s: "مؤكد", c: "text-blue-600 bg-blue-50" }, { n: "سارة العلوي", t: "11:30", s: "حاضر", c: "text-emerald-600 bg-emerald-50" }, { n: "خالد المري", t: "14:00", s: "مجدول", c: "text-amber-600 bg-amber-50" }].map((a, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                        <span className="text-xs font-bold text-slate-400 w-10" dir="ltr">{a.t}</span>
                        <div className="size-2 rounded-full bg-current opacity-30" />
                        <span className="text-sm font-bold text-slate-700">{a.n}</span>
                        <span className={`mr-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${a.c}`}>{a.s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-balance text-3xl font-black text-slate-900 sm:text-5xl">مستعد تبدأ؟</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-slate-500">سجل عيادتك مجاناً وابدأ رحلتك الرقمية اليوم. بدون بطاقة ائتمان.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all">
              ابدأ الآن مجاناً <ArrowLeft className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 px-4 py-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-emerald-500" />
            <span className="text-sm font-black text-slate-400">ميدكو © ٢٠٢٦</span>
          </div>
          <p className="text-xs text-slate-400">جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </main>
  );
}
