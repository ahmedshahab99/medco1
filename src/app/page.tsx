"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Menu, X, Calendar, Users, FileText, DollarSign, Shield, Smartphone, Activity } from "lucide-react";

const FEATURES = [
  { icon: Calendar, title: "إدارة المواعيد", desc: "نظام حجز ذكي مع تذكيرات تلقائية", color: "emerald" },
  { icon: Users, title: "ملفات المرضى", desc: "سجلات كاملة مع التاريخ الطبي والأدوية", color: "blue" },
  { icon: FileText, title: "الوصفات الطبية", desc: "وصفات رقمية احترافية قابلة للطباعة", color: "violet" },
  { icon: DollarSign, title: "الفواتير والإيرادات", desc: "تتبع المدفوعات والمصروفات والأرباح", color: "amber" },
  { icon: Shield, title: "آمن وخاص", desc: "بيانات مشفرة وحماية كاملة للمعلومات", color: "rose" },
  { icon: Smartphone, title: "تطبيق جوال", desc: "واجهة متجاوبة مع جميع الأجهزة", color: "indigo" },
];

const STATS = [
  { value: "٢٬٥٠٠+", label: "مريض نشط" },
  { value: "١٥٠+", label: "عيادة مسجلة" },
  { value: "٩٩٫٩٪", label: "وقت التشغيل" },
  { value: "٢٤/٧", label: "دعم فني" },
];

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900">ميدكو</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">المميزات</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">الباقات</a>
              <a href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">تسجيل الدخول</a>
              <Link href="/signup" className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                إنشاء حساب
              </Link>
            </nav>
            <button onClick={() => setMobileMenu(true)} className="md:hidden p-2">
              <Menu className="w-6 h-6 text-slate-700" />
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="fixed inset-0 z-50 bg-white md:hidden">
            <div className="p-4">
              <button onClick={() => setMobileMenu(false)} className="p-2 mb-4">
                <X className="w-6 h-6 text-slate-700" />
              </button>
              <nav className="flex flex-col gap-4 px-2">
                <a href="#features" onClick={() => setMobileMenu(false)} className="py-3 text-lg font-medium text-slate-700 border-b border-slate-50">المميزات</a>
                <a href="#pricing" onClick={() => setMobileMenu(false)} className="py-3 text-lg font-medium text-slate-700 border-b border-slate-50">الباقات</a>
                <a href="/login" onClick={() => setMobileMenu(false)} className="py-3 text-lg font-medium text-slate-700 border-b border-slate-50">تسجيل الدخول</a>
                <Link href="/signup" onClick={() => setMobileMenu(false)} className="py-3 text-lg font-bold text-emerald-600">إنشاء حساب</Link>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-white to-white" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium mb-6 border border-emerald-100">
              <Activity className="w-4 h-4" />  نظام إدارة العيادات الذكي
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              المستقبل الرقمي
              <br />
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">لعيادتك</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed">
              نظام متكامل لإدارة المرضى، المواعيد، السجلات الطبية، والفواتير في منصة واحدة ذكية وسهلة الاستخدام.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 text-center">
                ابدأ مجاناً
              </Link>
              <a href="#features" className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:border-slate-300 transition-all text-center">
                اكتشف المزيد
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-3xl font-black text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">كل ما تحتاجه عيادتك</h2>
            <p className="text-slate-500 max-w-xl mx-auto">أدوات شاملة لإدارة جميع جوانب ممارستك الطبية بكفاءة وذكاء.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              const c = f.color as "emerald" | "blue" | "violet" | "amber" | "rose" | "indigo";
              const colors: Record<string, string> = {
                emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
                blue: "bg-blue-50 text-blue-600 border-blue-100",
                violet: "bg-violet-50 text-violet-600 border-violet-100",
                amber: "bg-amber-50 text-amber-600 border-amber-100",
                rose: "bg-rose-50 text-rose-600 border-rose-100",
                indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
              };
              return (
                <div key={i} className="group bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className={`w-12 h-12 rounded-xl ${colors[c]} flex items-center justify-center mb-4 border`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">استعد للانطلاق</h2>
          <p className="text-slate-300 mb-8 text-lg">سجل عيادتك مجاناً وابدأ رحلتك الرقمية اليوم.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/30">
            اشترك مجاناً <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-sm text-slate-400">
          <p>© ٢٠٢٦ ميدكو. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
