"use client";

import React from "react";
import { Patient } from "../../../hooks/use-patients";
import {
  X, Phone, Mail, CalendarDays, MapPin, Stethoscope, ChevronLeft,
} from "lucide-react";

interface PatientDetailPanelProps {
  patient: Patient;
  onClose: () => void;
  fullPage?: boolean;
}

const AVATAR_COLORS = [
  "from-blue-400 to-blue-600",
  "from-violet-400 to-violet-600",
  "from-emerald-400 to-emerald-600",
  "from-rose-400 to-rose-600",
  "from-amber-400 to-amber-600",
  "from-cyan-400 to-cyan-600",
];

function getAvatarGradient(id: string) {
  const idx = id.charCodeAt(id.length - 1) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
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
  return new Date(iso).toLocaleDateString("ar-SA");
}

export function PatientDetailPanel({
  patient,
  onClose,
  fullPage = false,
}: PatientDetailPanelProps) {
  const age = calcAge(patient.dateOfBirth);

  return (
    <div
      className={`flex flex-col bg-white h-full ${
        fullPage ? "w-full" : "w-full border-r border-slate-100 shadow-xl"
      }`}
    >
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 shrink-0">
        <div className="flex items-center justify-between mb-4">
          {fullPage ? (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              العودة للقائمة
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-start gap-4">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarGradient(patient.id)} flex items-center justify-center font-bold text-white text-xl shrink-0 shadow-lg`}
          >
            {getInitials(patient.name)}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-white text-lg leading-tight truncate">{patient.name}</h2>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              {age && (
                <span className="text-slate-400 text-sm">{age} سنة</span>
              )}
              {formatGender(patient.gender) && (
                <span className="text-slate-400 text-sm">{formatGender(patient.gender)}</span>
              )}
              <span className="text-slate-500 text-[11px]">#{patient.id.slice(0, 8)}</span>
            </div>

            <div className="flex flex-col gap-0.5 mt-2">
              {patient.phone && (
                <a href={`tel:${patient.phone}`} className="text-slate-300 text-xs flex items-center gap-1.5 hover:text-white transition-colors" dir="ltr">
                  <Phone className="w-3 h-3 shrink-0" />
                  {patient.phone}
                </a>
              )}
              {patient.email && (
                <a href={`mailto:${patient.email}`} className="text-slate-300 text-xs flex items-center gap-1.5 hover:text-white transition-colors">
                  <Mail className="w-3 h-3 shrink-0" />
                  {patient.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">معلومات شخصية</h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem icon={<CalendarDays className="w-4 h-4" />} label="تاريخ الميلاد" value={formatDate(patient.dateOfBirth)} />
            <InfoItem icon={<Stethoscope className="w-4 h-4" />} label="الجنس" value={formatGender(patient.gender)} />
            <InfoItem icon={<MapPin className="w-4 h-4" />} label="العنوان" value={patient.address} />
            <InfoItem icon={<CalendarDays className="w-4 h-4" />} label="الحالة" value={patient.status === "active" ? "نشط" : patient.status === "inactive" ? "غير نشط" : patient.status} />
          </div>
        </div>

        {patient.cases.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">الحالات الطبية</h3>
            <div className="space-y-2">
              {patient.cases.map((c) => (
                <div key={c.id} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-sm font-semibold text-slate-800">{c.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(c.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">معلومات النظام</h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem icon={<CalendarDays className="w-4 h-4" />} label="تاريخ التسجيل" value={formatDate(patient.createdAt)} />
            <InfoItem icon={<CalendarDays className="w-4 h-4" />} label="آخر تحديث" value={formatDate(patient.updatedAt)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <span className="flex items-center gap-1.5 text-xs text-slate-400">{icon} {label}</span>
      <p className="text-sm font-medium text-slate-700">{value || "—"}</p>
    </div>
  );
}
