"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Patient } from "../../../hooks/use-patients";
import {
  X, Phone, Mail, CalendarDays, MapPin, Stethoscope, ChevronLeft, Pencil, Trash2, FileText, Pill, Activity,
  Syringe, ClipboardList, Heart, User, CalendarClock, Hash, Sparkles, ChevronDown,
  Clock, Shield, Tag,
} from "lucide-react";
import { PrescriptionTab } from "./tabs/PrescriptionTab";

interface PatientDetailPanelProps {
  patient: Patient;
  onClose: () => void;
  fullPage?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const AVATAR_GRADIENTS = [
  "from-emerald-500 to-emerald-700",
  "from-blue-500 to-indigo-700",
  "from-violet-500 to-purple-700",
  "from-rose-500 to-pink-700",
  "from-amber-500 to-orange-700",
  "from-cyan-500 to-teal-700",
];

const HERO_GRADIENTS = [
  "from-emerald-900/90 via-emerald-800/80 to-emerald-700/70",
  "from-blue-900/90 via-indigo-800/80 to-blue-700/70",
  "from-violet-900/90 via-purple-800/80 to-violet-700/70",
  "from-rose-900/90 via-pink-800/80 to-rose-700/70",
  "from-amber-900/90 via-orange-800/80 to-amber-700/70",
  "from-cyan-900/90 via-teal-800/80 to-cyan-700/70",
];

function getColorIndex(id: string) {
  return id.charCodeAt(id.length - 1) % AVATAR_GRADIENTS.length;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0][0]?.toUpperCase() || "?";
}

function calcAge(dob?: string | null) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function formatGender(gender: string | null) {
  if (gender === "MALE") return "ذكر";
  if (gender === "FEMALE") return "أنثى";
  return null;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("ar-SA", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateFull(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" });
}

function statusConfig(status: string) {
  switch (status) {
    case "active": return { label: "نشط", class: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    case "inactive": return { label: "غير نشط", class: "bg-slate-100 text-slate-500 border-slate-200" };
    default: return { label: status, class: "bg-slate-100 text-slate-500 border-slate-200" };
  }
}

export function PatientDetailPanel({
  patient,
  onClose,
  fullPage = false,
  onEdit,
  onDelete,
}: PatientDetailPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "prescriptions" | "medical" | "files">("overview");
  const [prescriptionHistory, setPrescriptionHistory] = useState<{ id: string; diagnosis: string; createdAt: string }[]>([]);
  const age = calcAge(patient.dateOfBirth);
  const cIdx = getColorIndex(patient.id);

  useEffect(() => {
    fetch(`/api/patients/${patient.id}/prescriptions`)
      .then(r => r.ok ? r.json() : [])
      .then((data: { id: string; diagnosis: string; createdAt: string }[]) => setPrescriptionHistory(data))
      .catch(() => {});
  }, [patient.id]);
  const status = statusConfig(patient.status);

  const tabs = [
    { key: "overview" as const, icon: Activity, label: "نظرة عامة" },
    { key: "prescriptions" as const, icon: Pill, label: "الوصفات" },
    { key: "medical" as const, icon: ClipboardList, label: "السجل الطبي" },
    { key: "files" as const, icon: FileText, label: "الملفات" },
  ];

  return (
    <div className={`flex flex-col bg-gradient-to-br from-slate-50 to-white h-full ${fullPage ? "w-full" : "w-full border-r border-slate-100 shadow-xl"}`}>
      {/* ═══════ HERO SECTION ═══════ */}
      <div className="relative shrink-0 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${HERO_GRADIENTS[cIdx]}`} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.08),transparent_50%)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl" />

        <div className="relative p-5 pb-6">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5">
            {fullPage ? (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors group"
              >
                <div className="p-1 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </div>
                العودة
              </button>
            ) : <div />}

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => router.push(`/dashboard/patients/${patient.id}/prescribe`)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-l from-emerald-400 to-emerald-300 text-emerald-950 text-xs font-bold hover:from-emerald-300 hover:to-emerald-200 transition-all shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/40 flex items-center gap-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                وصفة
              </button>
              {onEdit && (
                <button onClick={onEdit} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors" title="تعديل">
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button onClick={onDelete} className="p-1.5 rounded-lg text-white/60 hover:text-red-300 hover:bg-white/10 transition-colors" title="حذف">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Avatar + Name + Quick Info */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${AVATAR_GRADIENTS[cIdx]} flex items-center justify-center font-black text-white text-xl shadow-xl shadow-black/20`}>
                {getInitials(patient.name)}
              </div>
              <div className={`absolute -bottom-1 -end-1 w-5 h-5 rounded-full border-2 border-white/80 flex items-center justify-center ${patient.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`}>
                <div className={`w-1.5 h-1.5 rounded-full bg-white ${patient.status === "active" ? "animate-pulse" : ""}`} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-black text-white text-xl leading-tight">{patient.name}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.class}`}>
                  {status.label}
                </div>
                {age && (
                  <span className="text-white/70 text-xs flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    {age} سنة
                  </span>
                )}
                {formatGender(patient.gender) && (
                  <span className="text-white/70 text-xs flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {formatGender(patient.gender)}
                  </span>
                )}
                <span className="text-white/40 text-[10px] font-mono">#{patient.id.slice(0, 8)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-2">
                {patient.phone && (
                  <a href={`tel:${patient.phone}`} className="text-white/80 text-xs flex items-center gap-1.5 hover:text-white transition-colors" dir="ltr">
                    <Phone className="w-3 h-3" />
                    {patient.phone}
                  </a>
                )}
                {patient.email && (
                  <a href={`mailto:${patient.email}`} className="text-white/80 text-xs flex items-center gap-1.5 hover:text-white transition-colors truncate max-w-[200px]">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{patient.email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ STATS BAR ═══════ */}
      <div className="px-5 -mt-3 relative z-10">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 divide-y divide-slate-100 overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            <div className="p-3 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">الحالات</p>
              <p className="text-lg font-black text-slate-800">{patient.cases.length}</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">العمر</p>
              <p className="text-lg font-black text-slate-800">{age ? `${age}` : "—"}</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">الجنس</p>
              <p className="text-lg font-black text-slate-800">{formatGender(patient.gender) || "—"}</p>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {patient.createdAt ? `منذ ${Math.floor((Date.now() - new Date(patient.createdAt).getTime()) / (1000 * 60 * 60 * 24))} يوم` : "—"}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <CalendarDays className="w-3 h-3" />
              {formatDate(patient.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* ═══════ TAB NAVIGATION ═══════ */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1 flex gap-1">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  active
                    ? "bg-gradient-to-l from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-200"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${active ? "" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════ TAB CONTENT ═══════ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 pt-4">
        {activeTab === "overview" && (
          <div className="space-y-5">
            {/* Personal Info */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                معلومات شخصية
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={<CalendarDays className="w-4 h-4" />} label="تاريخ الميلاد" value={formatDateFull(patient.dateOfBirth)} />
                <InfoCard icon={<User className="w-4 h-4" />} label="الجنس" value={formatGender(patient.gender)} />
                <InfoCard icon={<MapPin className="w-4 h-4" />} label="العنوان" value={patient.address} className="col-span-2" />
                <InfoCard icon={<Hash className="w-4 h-4" />} label="المعرّف" value={`#${patient.id.slice(0, 8)}`} />
                <InfoCard icon={<Tag className="w-4 h-4" />} label="الحالة" value={status.label} />
              </div>
            </div>

            {/* Tags */}
            {patient.tags && patient.tags.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-500 rounded-full" />
                  الوسوم
                </h3>
                <div className="flex flex-wrap gap-2">
                  {patient.tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Cases */}
            {patient.cases.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-amber-500 rounded-full" />
                  الحالات الطبية
                </h3>
                <div className="space-y-2">
                  {patient.cases.map((c, i) => (
                    <div key={c.id} className="bg-white rounded-xl p-4 border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                          <Heart className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-800">{c.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <CalendarDays className="w-3 h-3" />
                            {formatDateFull(c.createdAt)}
                          </p>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
                          <span className="text-xs font-bold text-amber-600">{i + 1}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* System Info */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-slate-400 rounded-full" />
                معلومات النظام
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={<CalendarDays className="w-4 h-4" />} label="تاريخ التسجيل" value={formatDateFull(patient.createdAt)} subtle />
                <InfoCard icon={<CalendarDays className="w-4 h-4" />} label="آخر تحديث" value={formatDateFull(patient.updatedAt)} subtle />
              </div>
            </div>
          </div>
        )}

        {activeTab === "prescriptions" && (
          <PrescriptionTab patientId={patient.id} patientName={patient.name} />
        )}

        {activeTab === "medical" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <div className="w-1 h-4 bg-violet-500 rounded-full" />
              السجل الطبي
            </h3>

            {/* Prescription diagnoses as medical history */}
            {prescriptionHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5" />
                  سجل الوصفات الطبية
                </h4>
                {prescriptionHistory.map((rx) => (
                  <div key={rx.id} className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Pill className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">{rx.diagnosis}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <CalendarDays className="w-3 h-3" />
                          {formatDateFull(rx.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Medical notes */}
            {patient.medicalNotes && patient.medicalNotes.length > 0 && (
              <div className="space-y-2">
                {prescriptionHistory.length > 0 && (
                  <h4 className="text-[11px] font-bold text-violet-600 flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5" />
                    ملاحظات الطبيب
                  </h4>
                )}
                {patient.medicalNotes.map((note) => (
                  <div key={note.id} className="bg-white rounded-xl p-4 border border-violet-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center shrink-0 border border-violet-100">
                        <ClipboardList className="w-4 h-4 text-violet-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-700 leading-relaxed">{note.content}</p>
                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                          <CalendarDays className="w-3 h-3" />
                          {formatDateFull(note.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {prescriptionHistory.length === 0 && (!patient.medicalNotes || patient.medicalNotes.length === 0) && (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                  <ClipboardList className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400 font-medium">لا توجد سجلات طبية</p>
                <p className="text-xs text-slate-300 mt-1">ستظهر هنا الوصفات والملاحظات الطبية المسجّلة للمريض</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "files" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <div className="w-1 h-4 bg-cyan-500 rounded-full" />
              الملفات
            </h3>
            {patient.patientFiles && patient.patientFiles.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {patient.patientFiles.map((file) => (
                  <div key={file.id} className="bg-white rounded-xl p-4 border border-cyan-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0 border border-cyan-100 group-hover:bg-cyan-100 transition-colors">
                          <FileText className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                          <p className="text-xs text-slate-400">{file.size || "—"}</p>
                        </div>
                      </div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-cyan-50 text-cyan-700 text-xs font-bold rounded-lg hover:bg-cyan-100 transition-colors border border-cyan-200 shrink-0"
                      >
                        تحميل
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                  <FileText className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400 font-medium">لا توجد ملفات</p>
                <p className="text-xs text-slate-300 mt-1">سيتم عرض الملفات المرفوعة للمريض هنا</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function InfoCard({
  icon, label, value, className = "", subtle = false,
}: {
  icon: React.ReactNode; label: string; value: string | null; className?: string; subtle?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl p-4 border border-slate-100 shadow-sm ${className}`}>
      <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-1.5 ${subtle ? "text-slate-300" : "text-slate-400"}`}>
        <span className={subtle ? "text-slate-300" : "text-emerald-500"}>{icon}</span>
        {label}
      </span>
      <p className={`text-sm font-bold ${subtle ? "text-slate-400" : "text-slate-800"}`}>{value || "—"}</p>
    </div>
  );
}
