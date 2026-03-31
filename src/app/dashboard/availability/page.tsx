"use client";

import React, { useState, useMemo } from "react";
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  CalendarOff,
  CalendarClock,
  Coffee,
  Settings2,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimeSegment {
  id: string;
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  segments: TimeSegment[];
}

type WeekSchedule = Record<string, DaySchedule>;

type ExceptionType = "off" | "custom" | "break";

interface Exception {
  id: string;
  date: string;
  type: ExceptionType;
  startTime?: string;
  endTime?: string;
  label?: string;
}

interface AdvancedSettings {
  bufferBefore: number;
  bufferAfter: number;
  maxPerDay: number;
  bookingWindow: number;
  minNotice: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS: { key: string; label: string; short: string }[] = [
  { key: "saturday",  label: "السبت",     short: "سبت" },
  { key: "sunday",    label: "الأحد",     short: "أحد" },
  { key: "monday",    label: "الاثنين",   short: "اثن" },
  { key: "tuesday",   label: "الثلاثاء",  short: "ثلا" },
  { key: "wednesday", label: "الأربعاء",  short: "أرب" },
  { key: "thursday",  label: "الخميس",   short: "خمي" },
  { key: "friday",    label: "الجمعة",    short: "جمع" },
];

const EXCEPTION_TYPE_LABELS: Record<ExceptionType, string> = {
  off: "يوم إجازة",
  custom: "ساعات مخصصة",
  break: "استراحة جزئية",
};

const EXCEPTION_TYPE_ICONS: Record<ExceptionType, React.ReactNode> = {
  off:     <CalendarOff className="w-4 h-4" />,
  custom:  <CalendarClock className="w-4 h-4" />,
  break:   <Coffee className="w-4 h-4" />,
};

const EXCEPTION_TYPE_COLORS: Record<ExceptionType, string> = {
  off:    "bg-red-50 text-red-600 border-red-100",
  custom: "bg-blue-50 text-blue-600 border-blue-100",
  break:  "bg-amber-50 text-amber-600 border-amber-100",
};

const INITIAL_SCHEDULE: WeekSchedule = {
  saturday:  { enabled: true,  segments: [{ id: "s1", start: "09:00", end: "17:00" }] },
  sunday:    { enabled: true,  segments: [{ id: "s2", start: "09:00", end: "17:00" }] },
  monday:    { enabled: true,  segments: [{ id: "s3", start: "09:00", end: "17:00" }] },
  tuesday:   { enabled: true,  segments: [{ id: "s4", start: "09:00", end: "17:00" }] },
  wednesday: { enabled: true,  segments: [{ id: "s5", start: "09:00", end: "17:00" }] },
  thursday:  { enabled: true,  segments: [{ id: "s6", start: "09:00", end: "13:00" }] },
  friday:    { enabled: false, segments: [{ id: "s7", start: "09:00", end: "17:00" }] },
};

const INITIAL_EXCEPTIONS: Exception[] = [
  { id: "e1", date: "2026-04-10", type: "off",    label: "عيد الفطر" },
  { id: "e2", date: "2026-04-15", type: "custom", startTime: "10:00", endTime: "14:00", label: "تدريب طبي" },
  { id: "e3", date: "2026-04-22", type: "break",  startTime: "12:00", endTime: "13:30", label: "استراحة الغداء" },
];

const INITIAL_ADVANCED: AdvancedSettings = {
  bufferBefore:  10,
  bufferAfter:   10,
  maxPerDay:     20,
  bookingWindow: 30,
  minNotice:     2,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function formatArabicDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatTime12(time: string) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "م" : "ص";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

// Day-of-week index: Saturday=0 (Arabic week start)
const DAY_KEYS_ORDERED = DAYS.map((d) => d.key);

function getDayOfWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  // JS: 0=Sun,1=Mon,...,6=Sat
  const jsDay = d.getDay();
  const map: Record<number, string> = {
    6: "saturday", 0: "sunday", 1: "monday",
    2: "tuesday",  3: "wednesday", 4: "thursday", 5: "friday",
  };
  return map[jsDay];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        enabled ? "bg-blue-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "-translate-x-6" : "-translate-x-1"
        }`}
      />
    </button>
  );
}

// ─── Calendar Preview ─────────────────────────────────────────────────────────

function CalendarPreview({
  schedule,
  exceptions,
}: {
  schedule: WeekSchedule;
  exceptions: Exception[];
}) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = viewDate.toLocaleDateString("ar-SA", { month: "long", year: "numeric" });

  // Determine first cell offset (week starts Saturday=0)
  const firstDay = new Date(year, month, 1).getDay(); // JS 0=Sun
  const offsetMap: Record<number, number> = { 6: 0, 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };
  const startOffset = offsetMap[firstDay];

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const exceptionMap = useMemo(() => {
    const m: Record<string, Exception> = {};
    exceptions.forEach((e) => { m[e.date] = e; });
    return m;
  }, [exceptions]);

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <Card className="p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <span className="font-bold text-slate-800">{monthName}</span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {DAYS.map((d) => (
          <div key={d.key} className="py-2 text-center text-xs font-semibold text-slate-500">
            {d.short}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="h-10 border-b border-r border-slate-50 last:border-r-0" />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayKey = getDayOfWeekKey(dateStr);
          const daySchedule = schedule[dayKey];
          const exception = exceptionMap[dateStr];

          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          let cellBg = "";
          let dotColor = "";

          if (exception) {
            if (exception.type === "off") { cellBg = "bg-red-50"; dotColor = "bg-red-400"; }
            else if (exception.type === "custom") { cellBg = "bg-blue-50"; dotColor = "bg-blue-400"; }
            else { cellBg = "bg-amber-50"; dotColor = "bg-amber-400"; }
          } else if (daySchedule?.enabled) {
            cellBg = "bg-emerald-50";
            dotColor = "bg-emerald-400";
          } else {
            cellBg = "";
            dotColor = "";
          }

          return (
            <div
              key={dateStr}
              className={`h-10 border-b border-r border-slate-100 last:border-r-0 flex flex-col items-center justify-center relative ${cellBg}`}
            >
              <span
                className={`text-xs font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                  isToday
                    ? "bg-blue-600 text-white font-bold"
                    : daySchedule?.enabled || exception
                    ? "text-slate-700"
                    : "text-slate-400"
                }`}
              >
                {day}
              </span>
              {dotColor && !isToday && (
                <span className={`absolute bottom-1 w-1 h-1 rounded-full ${dotColor}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-slate-100 flex flex-wrap gap-3">
        {[
          { color: "bg-emerald-400", label: "متاح" },
          { color: "bg-red-400",     label: "إجازة" },
          { color: "bg-blue-400",    label: "ساعات مخصصة" },
          { color: "bg-amber-400",   label: "استراحة" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className={`w-2 h-2 rounded-full ${item.color}`} />
            {item.label}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<WeekSchedule>(INITIAL_SCHEDULE);
  const [exceptions, setExceptions] = useState<Exception[]>(INITIAL_EXCEPTIONS);
  const [advanced, setAdvanced] = useState<AdvancedSettings>(INITIAL_ADVANCED);
  const [activeTab, setActiveTab] = useState<"schedule" | "exceptions" | "advanced">("schedule");
  const [saved, setSaved] = useState(false);

  // Exception modal state
  const [exModal, setExModal] = useState(false);
  const [editingEx, setEditingEx] = useState<Exception | null>(null);
  const [exForm, setExForm] = useState<Partial<Exception>>({});

  // ── Weekly schedule helpers ────────────────────────────────────────────────

  const toggleDay = (key: string) => {
    setSchedule((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  const updateSegment = (dayKey: string, segId: string, field: "start" | "end", value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        segments: prev[dayKey].segments.map((s) =>
          s.id === segId ? { ...s, [field]: value } : s
        ),
      },
    }));
  };

  const addSegment = (dayKey: string) => {
    const newSeg: TimeSegment = { id: uid(), start: "09:00", end: "17:00" };
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], segments: [...prev[dayKey].segments, newSeg] },
    }));
  };

  const removeSegment = (dayKey: string, segId: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        segments: prev[dayKey].segments.filter((s) => s.id !== segId),
      },
    }));
  };

  // ── Exception helpers ──────────────────────────────────────────────────────

  const openExModal = (ex?: Exception) => {
    if (ex) {
      setEditingEx(ex);
      setExForm(ex);
    } else {
      setEditingEx(null);
      setExForm({ type: "off" });
    }
    setExModal(true);
  };

  const closeExModal = () => { setExModal(false); setEditingEx(null); setExForm({}); };

  const saveException = () => {
    if (!exForm.date || !exForm.type) return;
    if (editingEx) {
      setExceptions((prev) => prev.map((e) => (e.id === editingEx.id ? { ...e, ...exForm } as Exception : e)));
    } else {
      setExceptions((prev) => [...prev, { id: uid(), ...exForm } as Exception]);
    }
    closeExModal();
  };

  const deleteException = (id: string) => {
    setExceptions((prev) => prev.filter((e) => e.id !== id));
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // ─────────────────────────────────────────────────────────────────────────

  const tabs = [
    { id: "schedule",   label: "ساعات العمل الأسبوعية", icon: <Clock className="w-4 h-4" /> },
    { id: "exceptions", label: "الاستثناءات",            icon: <CalendarOff className="w-4 h-4" /> },
    { id: "advanced",   label: "إعدادات متقدمة",         icon: <Settings2 className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">أوقات العمل والتوفر</h1>
          <p className="text-slate-500 mt-1">حدد ساعات عملك الأسبوعية وأضف استثناءات حسب الحاجة.</p>
        </div>
        <Button onClick={handleSave} className="gap-2 shrink-0">
          {saved ? (
            <><CheckCircle2 className="w-5 h-5" /> تم الحفظ!</>
          ) : (
            <><Save className="w-5 h-5" /> حفظ الإعدادات</>
          )}
        </Button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* ── Left panel ── */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === t.id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* ── Tab: Weekly Schedule ── */}
          {activeTab === "schedule" && (
            <Card className="p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">الجدول الأسبوعي المتكرر</h2>
                  <p className="text-xs text-slate-500">فعّل الأيام وحدد أوقات العمل لكل يوم</p>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {DAYS.map((day) => {
                  const ds = schedule[day.key];
                  return (
                    <div
                      key={day.key}
                      className={`px-6 py-4 transition-colors ${
                        ds.enabled ? "bg-white" : "bg-slate-50/60"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Day label + toggle */}
                        <div className="flex items-center gap-3 w-36 shrink-0 pt-1">
                          <Toggle enabled={ds.enabled} onChange={() => toggleDay(day.key)} />
                          <span
                            className={`font-semibold text-sm ${
                              ds.enabled ? "text-slate-800" : "text-slate-400"
                            }`}
                          >
                            {day.label}
                          </span>
                        </div>

                        {/* Segments */}
                        {ds.enabled ? (
                          <div className="flex-1 space-y-2">
                            {ds.segments.map((seg, segIdx) => (
                              <div key={seg.id} className="flex items-center gap-2">
                                <div className="flex items-center gap-2 flex-1 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                                  <input
                                    type="time"
                                    value={seg.start}
                                    onChange={(e) => updateSegment(day.key, seg.id, "start", e.target.value)}
                                    className="bg-transparent text-sm text-slate-700 font-medium outline-none w-24"
                                  />
                                  <span className="text-slate-400 text-sm">—</span>
                                  <input
                                    type="time"
                                    value={seg.end}
                                    onChange={(e) => updateSegment(day.key, seg.id, "end", e.target.value)}
                                    className="bg-transparent text-sm text-slate-700 font-medium outline-none w-24"
                                  />
                                </div>
                                {ds.segments.length > 1 && (
                                  <button
                                    onClick={() => removeSegment(day.key, seg.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={() => addSegment(day.key)}
                              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 mt-1 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              إضافة فترة أخرى
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center">
                            <span className="text-sm text-slate-400 italic">مغلق – لا توجد مواعيد</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* ── Tab: Exceptions ── */}
          {activeTab === "exceptions" && (
            <div className="space-y-4">
              <Card className="p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                      <CalendarOff className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-800">الاستثناءات والإجازات</h2>
                      <p className="text-xs text-slate-500">أيام خاصة تتجاوز الجدول الأسبوعي</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => openExModal()} className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    إضافة استثناء
                  </Button>
                </div>

                {exceptions.length === 0 ? (
                  <div className="flex flex-col items-center py-14 text-center">
                    <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-3 text-slate-300">
                      <CalendarOff className="w-7 h-7" />
                    </div>
                    <p className="text-slate-500 font-medium">لا توجد استثناءات مضافة</p>
                    <p className="text-slate-400 text-sm mt-1">أضف إجازات أو أيام بساعات مختلفة</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {exceptions
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((ex) => (
                        <div key={ex.id} className="px-6 py-4 flex items-center gap-4">
                          {/* Type Badge */}
                          <div
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border shrink-0 ${
                              EXCEPTION_TYPE_COLORS[ex.type]
                            }`}
                          >
                            {EXCEPTION_TYPE_ICONS[ex.type]}
                            {EXCEPTION_TYPE_LABELS[ex.type]}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate">
                              {ex.label || EXCEPTION_TYPE_LABELS[ex.type]}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {formatArabicDate(ex.date)}
                              {ex.startTime && ex.endTime &&
                                ` · ${formatTime12(ex.startTime)} – ${formatTime12(ex.endTime)}`}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openExModal(ex)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteException(ex.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </Card>

              {/* Quick types helper */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(["off", "custom", "break"] as ExceptionType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => openExModal({ id: "", date: "", type } as Exception)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed text-right transition-colors hover:bg-slate-50 ${
                      type === "off"    ? "border-red-200 hover:border-red-300"   :
                      type === "custom" ? "border-blue-200 hover:border-blue-300" :
                                          "border-amber-200 hover:border-amber-300"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        type === "off"    ? "bg-red-50 text-red-500"    :
                        type === "custom" ? "bg-blue-50 text-blue-500"  :
                                            "bg-amber-50 text-amber-500"
                      }`}
                    >
                      {EXCEPTION_TYPE_ICONS[type]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-700">{EXCEPTION_TYPE_LABELS[type]}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {type === "off"    ? "يوم إجازة كامل" :
                         type === "custom" ? "تحديد ساعات خاصة" :
                                             "استراحة ضمن اليوم"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab: Advanced ── */}
          {activeTab === "advanced" && (
            <div className="space-y-4">
              <Card className="p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                    <Settings2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800">الإعدادات المتقدمة</h2>
                    <p className="text-xs text-slate-500">تحكم دقيق في كيفية حجز المواعيد</p>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Buffer times */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-4 rounded-full bg-blue-500" />
                      وقت الاستعداد (Buffer)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <AdvancedField
                        label="قبل الموعد"
                        hint="وقت التحضير"
                        unit="دقيقة"
                        value={advanced.bufferBefore}
                        onChange={(v) => setAdvanced({ ...advanced, bufferBefore: v })}
                        min={0} max={60} step={5}
                      />
                      <AdvancedField
                        label="بعد الموعد"
                        hint="وقت التنظيف"
                        unit="دقيقة"
                        value={advanced.bufferAfter}
                        onChange={(v) => setAdvanced({ ...advanced, bufferAfter: v })}
                        min={0} max={60} step={5}
                      />
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Limits */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-4 rounded-full bg-emerald-500" />
                      حدود المواعيد
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <AdvancedField
                        label="الحد الأقصى يومياً"
                        hint="عدد المرضى"
                        unit="موعد"
                        value={advanced.maxPerDay}
                        onChange={(v) => setAdvanced({ ...advanced, maxPerDay: v })}
                        min={1} max={100} step={1}
                      />
                      <AdvancedField
                        label="نافذة الحجز المسبق"
                        hint="أقصى فترة مستقبلية"
                        unit="يوم"
                        value={advanced.bookingWindow}
                        onChange={(v) => setAdvanced({ ...advanced, bookingWindow: v })}
                        min={1} max={365} step={1}
                      />
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Notice */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-4 rounded-full bg-amber-500" />
                      الحد الأدنى للإشعار المسبق
                    </h3>
                    <AdvancedField
                      label="لا يُقبل حجز قبل الموعد بأقل من"
                      hint="منع الحجز اللحظي"
                      unit="ساعة"
                      value={advanced.minNotice}
                      onChange={(v) => setAdvanced({ ...advanced, minNotice: v })}
                      min={0} max={72} step={1}
                    />
                  </div>
                </div>
              </Card>

              {/* Info card */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold">ملاحظة</p>
                  <p className="mt-0.5 leading-relaxed text-blue-600">
                    هذه الإعدادات تؤثر على كيفية حجز المرضى للمواعيد. التغييرات لا تؤثر على المواعيد المحجوزة مسبقاً.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right panel: Calendar preview ── */}
        <div className="xl:w-80 shrink-0 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
              معاينة التقويم
            </h2>
            <CalendarPreview schedule={schedule} exceptions={exceptions} />
          </div>

          {/* Quick stats */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-700">ملخص سريع</h3>
            <div className="space-y-2">
              {DAYS.map((d) => {
                const ds = schedule[d.key];
                return (
                  <div key={d.key} className="flex items-center justify-between text-sm">
                    <span className={ds.enabled ? "text-slate-700" : "text-slate-400"}>
                      {d.label}
                    </span>
                    {ds.enabled ? (
                      <div className="flex flex-col items-end gap-0.5">
                        {ds.segments.map((seg, i) => (
                          <span key={i} className="text-xs text-blue-600 font-medium">
                            {formatTime12(seg.start)} – {formatTime12(seg.end)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">مغلق</span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Exception Modal ── */}
      <Modal
        isOpen={exModal}
        onClose={closeExModal}
        title={editingEx ? "تعديل الاستثناء" : "إضافة استثناء جديد"}
      >
        <div className="space-y-5">
          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              التاريخ <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={exForm.date || ""}
              onChange={(e) => setExForm({ ...exForm, date: e.target.value })}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">نوع الاستثناء</label>
            <div className="grid grid-cols-3 gap-2">
              {(["off", "custom", "break"] as ExceptionType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setExForm({ ...exForm, type })}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                    exForm.type === type
                      ? type === "off"    ? "border-red-500 bg-red-50 text-red-600"       :
                        type === "custom" ? "border-blue-500 bg-blue-50 text-blue-600"    :
                                            "border-amber-500 bg-amber-50 text-amber-600"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {EXCEPTION_TYPE_ICONS[type]}
                  {EXCEPTION_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Times (if custom or break) */}
          {(exForm.type === "custom" || exForm.type === "break") && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">وقت البداية</label>
                <Input
                  type="time"
                  value={exForm.startTime || ""}
                  onChange={(e) => setExForm({ ...exForm, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">وقت النهاية</label>
                <Input
                  type="time"
                  value={exForm.endTime || ""}
                  onChange={(e) => setExForm({ ...exForm, endTime: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Label */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">ملاحظة (اختياري)</label>
            <Input
              placeholder="مثال: عيد الفطر، مؤتمر طبي..."
              value={exForm.label || ""}
              onChange={(e) => setExForm({ ...exForm, label: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" onClick={closeExModal}>إلغاء</Button>
            <Button onClick={saveException} disabled={!exForm.date || !exForm.type}>
              {editingEx ? "حفظ التعديلات" : "إضافة الاستثناء"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Advanced Field ───────────────────────────────────────────────────────────

function AdvancedField({
  label, hint, unit, value, onChange, min, max, step,
}: {
  label: string; hint: string; unit: string;
  value: number; onChange: (v: number) => void;
  min: number; max: number; step: number;
}) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <p className="text-xs text-slate-400">{hint}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-lg transition-colors"
        >
          −
        </button>
        <div className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50">
          <span className="text-lg font-bold text-slate-800">{value}</span>
          <span className="text-sm text-slate-500">{unit}</span>
        </div>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-lg transition-colors"
        >
          +
        </button>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600 h-1.5 rounded-full"
      />
    </div>
  );
}
