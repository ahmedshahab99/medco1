"use client";

import React from "react";
import { Patient } from "../../../hooks/use-patients";
import {
  Phone,
  Mail,
  Calendar,
  ArrowLeft,
  MapPin,
  Clock,
} from "lucide-react";

interface PatientTableProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
}

const PATIENT_EMOJIS = ["🩺", "💊", "❤️", "🏥", "🫀", "🧬", "🩻", "🦷", "👁️", "🧠", "🫁", "💉"];

function getPatientEmoji(id: string) {
  const idx = id.charCodeAt(id.length - 1) % PATIENT_EMOJIS.length;
  return PATIENT_EMOJIS[idx];
}

const AVATAR_COLORS = [
  "from-blue-400 to-blue-600",
  "from-violet-400 to-violet-600",
  "from-emerald-400 to-emerald-600",
  "from-rose-400 to-rose-600",
  "from-amber-400 to-amber-600",
  "from-cyan-400 to-cyan-600",
  "from-indigo-400 to-indigo-600",
  "from-teal-400 to-teal-600",
];

function getAvatarGradient(id: string) {
  const idx = id.charCodeAt(id.length - 1) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function calcAge(dob?: string | null) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function formatDate(iso?: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PatientTable({ patients, onSelectPatient }: PatientTableProps) {
  if (patients.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-lg font-semibold text-slate-600 mb-1">لا توجد نتائج</p>
        <p className="text-sm">جرّب تغيير كلمة البحث أو الفلاتر</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {patients.map((patient) => {
        const age = calcAge(patient.dateOfBirth);

        return (
          <div
            key={patient.id}
            onClick={() => onSelectPatient(patient)}
            className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer p-4 group"
          >
            {/* Header with Avatar and Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarGradient(
                    patient.id
                  )} flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-md group-hover:shadow-lg transition-shadow`}
                >
                  <span className="text-lg">{getPatientEmoji(patient.id)}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">
                    {patient.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    #{patient.id.slice(0, 8)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowLeft className="w-4 h-4" />
              </div>
            </div>

            {/* Info Grid */}
            <div className="space-y-3 mb-4">
              {/* Age and Gender */}
              {age && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-600">
                    {age} سنة
                    {patient.gender && (
                      <>
                        {" "}
                        ·{" "}
                        {patient.gender === "MALE"
                          ? "ذكر"
                          : "أنثى"}
                      </>
                    )}
                  </span>
                </div>
              )}

              {/* Phone */}
              {patient.phone && (
                <a
                  href={`tel:${patient.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                  dir="ltr"
                >
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-600 hover:text-blue-600">
                    {patient.phone}
                  </span>
                </a>
              )}

              {/* Email */}
              {patient.email && (
                <a
                  href={`mailto:${patient.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors truncate"
                >
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-600 hover:text-blue-600 truncate">
                    {patient.email}
                  </span>
                </a>
              )}

              {/* Address */}
              {patient.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-600 line-clamp-2">
                    {patient.address}
                  </span>
                </div>
              )}

              {/* Next Appointment */}
              {patient.nextAppointment && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-sm font-bold text-indigo-600">
                    {new Date(patient.nextAppointment).toLocaleDateString("ar-SA", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    {" · "}
                    {new Date(patient.nextAppointment).toLocaleTimeString("ar-SA", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Footer with Status and Date */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                {patient.status === "active" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    نشط
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    غير نشط
                  </span>
                )}
              </div>
              <span className="text-slate-400">
                {formatDate(patient.createdAt)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
