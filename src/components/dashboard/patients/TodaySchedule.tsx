"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CalendarDays,
  Users,
  ArrowLeft,
  Circle,
  Sun,
  Moon,
  Coffee,
  Loader2,
  ChevronLeft,
} from "lucide-react";

const STATUS_STYLE: Record<string, { label: string; bg: string; dot: string; text: string }> = {
  SCHEDULED:  { label: "مجدول",   bg: "bg-blue-50",       dot: "bg-blue-500",   text: "text-blue-700" },
  CONFIRMED:  { label: "مؤكد",    bg: "bg-indigo-50",     dot: "bg-indigo-500", text: "text-indigo-700" },
  ARRIVED:    { label: "حاضر",    bg: "bg-emerald-50",    dot: "bg-emerald-500",text: "text-emerald-700" },
  COMPLETED:  { label: "مكتمل",   bg: "bg-teal-50",       dot: "bg-teal-500",   text: "text-teal-700" },
  CANCELLED:  { label: "ملغي",    bg: "bg-rose-50",       dot: "bg-rose-500",   text: "text-rose-700" },
  NO_SHOW:    { label: "لم يحضر", bg: "bg-amber-50",      dot: "bg-amber-500",  text: "text-amber-700" },
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatTime24(iso: string) {
  return new Date(iso).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function getHourSegment(iso: string) {
  const h = new Date(iso).getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

const SEGMENT_CONFIG = {
  morning:  { label: "الفترة الصباحية", icon: Coffee,  color: "text-amber-500", bar: "bg-amber-400" },
  afternoon: { label: "الفترة المسائية", icon: Sun,    color: "text-orange-500", bar: "bg-orange-400" },
  evening:  { label: "الفترة الليلية",  icon: Moon,    color: "text-indigo-500", bar: "bg-indigo-400" },
};

interface CalendarAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string | null;
  doctorId: string;
  doctorName: string;
  serviceId: string;
  serviceName: string;
  serviceColor: string;
  status: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  caseId: string | null;
  caseName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TodayScheduleProps {
  appointments: CalendarAppointment[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onRefetch: () => void;
}

export function TodaySchedule({ appointments, isLoading, error, onRefetch }: TodayScheduleProps) {
  const router = useRouter();

  const todayStr = new Date().toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
        <p className="text-sm text-rose-500 mb-2">تعذر تحميل المواعيد</p>
        <button onClick={onRefetch} className="text-xs text-blue-600 underline">إعادة المحاولة</button>
      </div>
    );
  }

  const sorted = (appointments ?? [])
    .filter((a) => a.status !== "CANCELLED")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const morningApps = sorted.filter((a) => getHourSegment(a.startTime) === "morning");
  const afternoonApps = sorted.filter((a) => getHourSegment(a.startTime) === "afternoon");
  const eveningApps = sorted.filter((a) => getHourSegment(a.startTime) === "evening");

  const segments = [
    { key: "morning",  apps: morningApps,   ...SEGMENT_CONFIG.morning },
    { key: "afternoon", apps: afternoonApps, ...SEGMENT_CONFIG.afternoon },
    { key: "evening",  apps: eveningApps,    ...SEGMENT_CONFIG.evening },
  ].filter((s) => s.apps.length > 0);

  const total = sorted.length;

  return (
    <div className="bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/30 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-indigo-600/5 to-blue-600/5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">مواعيد اليوم</h2>
              <p className="text-xs text-slate-500 mt-0.5">{todayStr}</p>
            </div>
          </div>
          {!isLoading && (
            <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-slate-200/60">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">{total}</span>
              <span className="text-[10px] text-slate-400">مريض</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            <span className="text-sm text-slate-500">جارٍ تحميل المواعيد...</span>
          </div>
        </div>
      )}

      {/* Empty */}
      {!isLoading && total === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <CalendarDays className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-500">لا توجد مواعيد اليوم</p>
          <p className="text-xs text-slate-400 mt-1">يوم هادئ! يمكنك مراجعة سجلات المرضى</p>
        </div>
      )}

      {/* Timeline */}
      {!isLoading && total > 0 && (
        <div className="px-5 pb-4">
          {segments.map((seg, si) => {
            const Icon = seg.icon;
            return (
              <div key={seg.key} className={si > 0 ? "mt-4" : "mt-3"}>
                {/* Segment Header */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${seg.bar} bg-opacity-20`}>
                    <Icon className={`w-3.5 h-3.5 ${seg.color}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{seg.label}</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
                  <span className="text-[10px] text-slate-400 font-medium">{seg.apps.length} مواعيد</span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {seg.apps.map((appt) => {
                    const st = STATUS_STYLE[appt.status] ?? STATUS_STYLE.SCHEDULED;
                    return (
                      <div
                        key={appt.id}
                        onClick={() => router.push(`/dashboard/patients/${appt.patientId}`)}
                        className="group relative flex items-start gap-3 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all duration-200 cursor-pointer p-3.5"
                      >
                        {/* Time Column */}
                        <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                          <div className="text-[11px] font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded-md leading-none">
                            {formatTime(appt.startTime)}
                          </div>
                          <div className="text-[9px] text-slate-400 font-medium leading-none">─</div>
                          <div className="text-[11px] text-slate-500 font-medium px-2 leading-none">
                            {formatTime(appt.endTime)}
                          </div>
                        </div>

                        {/* Timeline Dot */}
                        <div className="flex flex-col items-center shrink-0 pt-1.5">
                          <div className={`w-3 h-3 rounded-full ${st.dot} ring-2 ring-white shadow-sm`} />
                          <div className="flex-1 w-px bg-gradient-to-b from-slate-200 to-transparent min-h-[52px]" />
                        </div>

                        {/* Card Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                                {appt.patientName}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {appt.serviceName && (
                                  <span
                                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full truncate max-w-[140px]"
                                    style={{ backgroundColor: appt.serviceColor + "20", color: appt.serviceColor }}
                                  >
                                    {appt.serviceName}
                                  </span>
                                )}
                                {appt.doctorName && (
                                  <span className="text-[10px] text-slate-400">
                                    د. {appt.doctorName}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                {st.label}
                              </span>
                              <ArrowLeft className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-all -mr-1" />
                            </div>
                          </div>

                          {appt.notes && (
                            <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1 leading-relaxed">
                              {appt.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
