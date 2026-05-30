"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { startOfDay, endOfDay } from "date-fns";
import { useAppointments } from "@/hooks/use-appointments";
import {
  Users, CalendarCheck, TrendingUp, DollarSign, Clock, ArrowLeft,
  Circle, Sun, Moon, Coffee, Sparkles, Activity, Stethoscope, Syringe,
  CalendarDays, ChevronLeft, Loader2, Pill, HeartPulse, UserPlus,
} from "lucide-react";

const STAT_ICONS = [Users, CalendarCheck, TrendingUp, DollarSign];

const STAT_COLORS = [
  { from: "from-violet-500", to: "to-purple-600", shadow: "shadow-violet-500/20", light: "bg-violet-50", icon: "text-violet-600" },
  { from: "from-emerald-500", to: "to-emerald-600", shadow: "shadow-emerald-500/20", light: "bg-emerald-50", icon: "text-emerald-600" },
  { from: "from-amber-500", to: "to-orange-600", shadow: "shadow-amber-500/20", light: "bg-amber-50", icon: "text-amber-600" },
  { from: "from-blue-500", to: "to-cyan-600", shadow: "shadow-blue-500/20", light: "bg-blue-50", icon: "text-blue-600" },
];

const STATUS_BADGE: Record<string, { label: string; dot: string; bg: string }> = {
  SCHEDULED:  { label: "مجدول",   dot: "bg-blue-500",   bg: "bg-blue-50 text-blue-700" },
  CONFIRMED:  { label: "مؤكد",    dot: "bg-indigo-500", bg: "bg-indigo-50 text-indigo-700" },
  ARRIVED:    { label: "حاضر",    dot: "bg-emerald-500",bg: "bg-emerald-50 text-emerald-700" },
  COMPLETED:  { label: "مكتمل",   dot: "bg-teal-500",   bg: "bg-teal-50 text-teal-700" },
  CANCELLED:  { label: "ملغي",    dot: "bg-rose-500",   bg: "bg-rose-50 text-rose-700" },
  NO_SHOW:    { label: "غائب",    dot: "bg-amber-500",  bg: "bg-amber-50 text-amber-700" },
};

interface StatItem {
  title: string; value: string; trend: number;
}
interface ApptItem {
  id: string; patientId: string; patientName: string; date: string; time: string;
  status: string; type: string; doctor: string; serviceName: string;
}

export default function DashboardClient({
  profileName, stats, initAppointments,
}: {
  profileName: string; stats: StatItem[]; initAppointments: ApptItem[];
}) {
  const router = useRouter();
  const today = new Date();
  const { data: todayApps, isLoading: appsLoading } = useAppointments(startOfDay(today), endOfDay(today));

  const todayStr = today.toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const greetingTime = today.getHours() < 12 ? "صباح الخير" : today.getHours() < 17 ? "مساء الخير" : "مساء الخير";
  const greetingEmoji = today.getHours() < 12 ? "☀️" : "🌙";

  const [countUp, setCountUp] = useState(stats.map(() => 0));
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  useEffect(() => {
    if (!visible) return;
    stats.forEach((stat, i) => {
      const target = parseInt(stat.value.replace(/[^0-9]/g, "")) || 0;
      if (target === 0) return;
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 30));
      const interval = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(interval); }
        setCountUp((prev) => { const next = [...prev]; next[i] = current; return next; });
      }, 40);
      return () => clearInterval(interval);
    });
  }, [visible, stats]);

  const appts = todayApps?.filter((a) => a.status !== "CANCELLED") ?? [];
  const sorted = [...appts].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const totalToday = sorted.length;
  const todayRevenue = totalToday * 75000;
  const revenueFormatted = todayRevenue.toLocaleString("ar-SA");

  return (
    <div className="min-h-full pb-8">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-xl md:rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 mb-4 md:mb-8 shadow-lg md:shadow-2xl shadow-indigo-500/25">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl" />
          <svg className="absolute bottom-0 left-0 right-0 opacity-10" viewBox="0 0 1440 120"><path fill="#fff" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"/></svg>
        </div>
        <div className="relative px-4 py-5 md:py-10 md:px-10">
          <div className={`transform transition-all duration-700 ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl md:text-3xl">{greetingEmoji}</span>
              <div className="min-w-0">
                <h1 className="text-lg md:text-3xl font-black text-white truncate">{greetingTime}، {profileName}</h1>
                <p className="text-indigo-200 text-xs md:text-sm mt-0.5 font-medium">{todayStr}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 mt-3">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5 md:px-4 md:py-2 border border-white/10">
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-white text-xs md:text-sm font-bold">{totalToday}</span>
                <span className="text-indigo-200 text-[10px] md:text-xs">موعد</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5 md:px-4 md:py-2 border border-white/10">
                <DollarSign className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-white text-xs md:text-sm font-bold">{revenueFormatted}</span>
                <span className="text-indigo-200 text-[10px] md:text-xs">د.ع</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-8">
        {/* ── Main Column ── */}
        <div className="xl:col-span-3 flex flex-col gap-4 md:gap-8">

          {/* ── Stats Grid ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {stats.map((stat, i) => {
              const colors = STAT_COLORS[i % STAT_COLORS.length];
              const Icon = STAT_ICONS[i % STAT_ICONS.length];
              const targetNum = parseInt(stat.value.replace(/[^0-9]/g, "")) || 0;
              const displayVal = stat.value.includes("ر.س") ? stat.value : (countUp[i] || targetNum).toLocaleString("ar-SA");
              return (
                <div key={i}
                  className={`group relative bg-white rounded-xl md:rounded-2xl border border-slate-100 p-3 md:p-5 transition-all duration-500 hover:shadow-xl ${colors.shadow} ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
                  style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2 md:mb-4">
                      <div className={`w-8 h-8 md:w-11 md:h-11 rounded-lg md:rounded-xl ${colors.light} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 md:w-5 md:h-5 ${colors.icon}`} />
                      </div>
                      <span className={`flex items-center gap-0.5 text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full ${stat.trend >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                        <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        {Math.abs(stat.trend)}%
                      </span>
                    </div>
                    <h3 className="text-base md:text-2xl font-black text-slate-800 tracking-tight">{displayVal}</h3>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 md:mt-1 font-medium">{stat.title}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Today's Timeline + Upcoming → side by side ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

            {/* ── Today's Timeline ── */}
            <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 md:px-5 py-3 md:py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-2.5">
                  <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                    <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-bold text-slate-800">جدول اليوم</h3>
                    <p className="text-[9px] md:text-[10px] text-slate-400">{totalToday} موعد</p>
                  </div>
                </div>
                <button onClick={() => router.push("/dashboard/calendar")} className="text-[9px] md:text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  التقويم <ChevronLeft className="w-2.5 h-2.5 md:w-3 md:h-3" />
                </button>
              </div>
              <div className="px-4 py-3 max-h-[420px] overflow-y-auto custom-scrollbar">
                {appsLoading ? (
                  <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 text-emerald-500 animate-spin" /></div>
                ) : sorted.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-2">
                      <CalendarDays className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-xs font-semibold text-slate-400">لا توجد مواعيد اليوم</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {sorted.map((appt, idx) => {
                      const st = STATUS_BADGE[appt.status] ?? STATUS_BADGE.SCHEDULED;
                      const startT = new Date(appt.startTime).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
                      const endT = new Date(appt.endTime).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
                      return (
                        <div
                          key={appt.id}
                          onClick={() => router.push(`/dashboard/patients/${appt.patientId}`)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer group"
                        >
                          {/* Time */}
                          <div className="flex flex-col items-center shrink-0 w-14">
                            <span className="text-[11px] font-bold text-slate-700">{startT}</span>
                            <span className="text-[8px] text-slate-300">──</span>
                            <span className="text-[10px] text-slate-400">{endT}</span>
                          </div>
                          {/* Dot line */}
                          <div className="flex flex-col items-center shrink-0">
                            <div className={`w-2.5 h-2.5 rounded-full ${st.dot} ring-2 ring-white`} />
                            <div className="w-px h-10 bg-gradient-to-b from-slate-200 to-transparent" />
                          </div>
                          {/* Content */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">{appt.patientName}</span>
                              <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${st.bg}`}>{st.label}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400">{appt.doctorName}</span>
                              {appt.serviceName && <><span className="text-[8px] text-slate-300">·</span><span className="text-[10px] text-slate-400">{appt.serviceName}</span></>}
                            </div>
                          </div>
                          <ArrowLeft className="w-3.5 h-3.5 text-slate-200 group-hover:text-emerald-500 transition-colors shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Upcoming Appointments ── */}
            <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 md:px-5 py-3 md:py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-2.5">
                  <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                    <CalendarCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-bold text-slate-800">المواعيد القادمة</h3>
                    <p className="text-[9px] md:text-[10px] text-slate-400">المواعيد المستقبلية</p>
                  </div>
                </div>
                <button onClick={() => router.push("/dashboard/calendar")} className="text-[9px] md:text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  الكل <ChevronLeft className="w-2.5 h-2.5 md:w-3 md:h-3" />
                </button>
              </div>
              <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                {initAppointments.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-2">
                      <CalendarDays className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-xs font-semibold text-slate-400">لا توجد مواعيد قادمة</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {initAppointments.slice(0, 6).map((appt) => {
                      const st = STATUS_BADGE[appt.status] ?? STATUS_BADGE.SCHEDULED;
                      return (
                        <div
                          key={appt.id}
                          onClick={() => router.push(`/dashboard/patients/${appt.patientId}`)}
                          className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${st.bg.split(" ")[0]}`}>
                            <Stethoscope className="w-4 h-4 text-slate-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-800 truncate">{appt.patientName}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${st.bg}`}>{st.label}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {appt.time}
                              </span>
                              <span className="text-[11px] text-slate-400">{appt.date}</span>
                              <span className="text-[11px] text-slate-400">· {appt.doctor}</span>
                            </div>
                          </div>
                          <ArrowLeft className="w-4 h-4 text-slate-300 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ── Revenue Chart ── */}
          <RevenueChart />
        </div>

        {/* ── Right Sidebar ── */}
        <div className="xl:col-span-1 flex flex-col gap-4 md:gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5">
            <h3 className="text-xs md:text-sm font-bold text-slate-800 mb-3 md:mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              إجراءات سريعة
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-2.5">
              <QuickActionBtn icon={UserPlus} label="مريض جديد" color="bg-blue-500" onClick={() => router.push("/dashboard/patients")} />
              <QuickActionBtn icon={CalendarCheck} label="موعد جديد" color="bg-emerald-500" onClick={() => router.push("/dashboard/calendar")} />
              <QuickActionBtn icon={Pill} label="وصفة طبية" color="bg-violet-500" onClick={() => router.push("/dashboard/patients")} />
              <QuickActionBtn icon={Activity} label="الكشف اليومي" color="bg-amber-500" onClick={() => router.push("/dashboard/calendar")} />
            </div>
          </div>

          {/* Today Summary */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl md:rounded-2xl border border-violet-100 p-4 md:p-5">
            <h3 className="text-xs md:text-sm font-bold text-slate-800 mb-3 md:mb-4 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-violet-600" />
              ملخص اليوم
            </h3>
            <div className="space-y-3">
              <SummaryRow icon={CalendarCheck} label="المواعيد" value={totalToday.toString()} color="text-emerald-600" bg="bg-emerald-100" />
              <SummaryRow icon={UserPlus} label="مرضى جدد" value={stats[2]?.value ?? "0"} color="text-blue-600" bg="bg-blue-100" />
              <SummaryRow icon={Activity} label="مكتملة" value={sorted.filter(a => a.status === "COMPLETED" || a.status === "ARRIVED").length.toString()} color="text-teal-600" bg="bg-teal-100" />
              <SummaryRow icon={DollarSign} label="الإيرادات" value={revenueFormatted} color="text-amber-600" bg="bg-amber-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionBtn({ icon: Icon, label, color, onClick }: { icon: React.ElementType; label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-200 group">
      <div className={`w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl ${color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
        <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
      </div>
      <span className="text-xs md:text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
    </button>
  );
}

function SummaryRow({ icon: Icon, label, value, color, bg }: { icon: React.ElementType; label: string; value: string; color: string; bg: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className={`text-sm font-black ${color}`}>{value}</span>
    </div>
  );
}

function RevenueChart() {
  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس"];
  const values = [30, 55, 42, 68, 52, 78, 62, 88];
  const [anim, setAnim] = useState(false);
  useEffect(() => { setTimeout(() => setAnim(true), 300); }, []);

  const max = Math.max(...values);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm shadow-amber-200">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">نظرة على الإيرادات</h3>
            <p className="text-[10px] text-slate-400">آخر ٨ أشهر</p>
          </div>
        </div>
      </div>
      <div className="flex items-end gap-2.5 h-44">
        {months.map((m, i) => {
          const pct = anim ? (values[i] / max) * 100 : 0;
          const barColor = i % 2 === 0 ? "bg-gradient-to-t from-amber-500 to-amber-400" : "bg-gradient-to-t from-blue-500 to-blue-400";
          return (
            <div key={m} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className={`text-[9px] font-bold ${values[i] >= 70 ? "text-slate-700" : "text-transparent"} transition-all`}>
                {values[i]}k
              </span>
              <div className="w-full rounded-md relative overflow-hidden" style={{ height: "100%" }}>
                <div className="absolute bottom-0 inset-x-0 bg-slate-50 rounded-t-md h-full" />
                <div
                  className={`absolute bottom-0 inset-x-0 rounded-t-md transition-all duration-1000 ease-out ${barColor} shadow-sm`}
                  style={{ height: `${pct}%` }}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-white/20 rounded-t-md" />
                </div>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 mt-1">{m.slice(0, 3)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
