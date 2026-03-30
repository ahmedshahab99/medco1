"use client";

import React from "react";
import { Patient } from "../../../lib/types/dashboard";
import {
  Phone,
  Mail,
  Calendar,
  CalendarCheck,
  MoreVertical,
  MessageSquare,
  Tag,
  Eye,
} from "lucide-react";

interface PatientTableProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  selectedPatientId?: string;
  onBookAppointment: (patient: Patient) => void;
}

const TAG_COLORS: Record<string, string> = {
  VIP: "bg-amber-100 text-amber-700 border border-amber-200",
  مزمن: "bg-purple-100 text-purple-700 border border-purple-200",
  جديد: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  متابعة: "bg-blue-100 text-blue-700 border border-blue-200",
  "خطر مرتفع": "bg-red-100 text-red-700 border border-red-200",
  حساسية: "bg-orange-100 text-orange-700 border border-orange-200",
};

function getTagClass(tag: string) {
  return TAG_COLORS[tag] ?? "bg-slate-100 text-slate-600 border border-slate-200";
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-cyan-100 text-cyan-700",
];

function getAvatarColor(id: string) {
  const idx = id.charCodeAt(id.length - 1) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

export function PatientTable({ patients, onSelectPatient, selectedPatientId, onBookAppointment }: PatientTableProps) {
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-64">المريض</th>
            <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">التواصل</th>
            <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">التصنيفات</th>
            <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">آخر زيارة</th>
            <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">الموعد القادم</th>
            <th className="py-3 px-4 w-14"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {patients.map((patient) => {
            const isSelected = patient.id === selectedPatientId;
            return (
              <tr
                key={patient.id}
                onClick={() => onSelectPatient(patient)}
                className={`group cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? "bg-blue-50 hover:bg-blue-50"
                    : "hover:bg-slate-50/80"
                }`}
              >
                {/* Name + Avatar */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(patient.id)}`}
                    >
                      {getInitials(patient.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 leading-tight">{patient.name}</p>
                        {patient.status === "inactive" && (
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">غير نشط</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">#{patient.id} · {patient.totalVisits} زيارة</p>
                    </div>
                    {isSelected && (
                      <div className="mr-auto w-1.5 h-6 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </td>

                {/* Contact */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-slate-600" dir="ltr">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-xs">{patient.phone}</span>
                    </span>
                    {patient.email && (
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-xs truncate max-w-[140px]">{patient.email}</span>
                      </span>
                    )}
                  </div>
                </td>

                {/* Tags */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1 max-w-[160px]">
                    {patient.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getTagClass(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                    {patient.tags.length > 3 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        +{patient.tags.length - 3}
                      </span>
                    )}
                  </div>
                </td>

                {/* Last Visit */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs">{formatDate(patient.lastVisit)}</span>
                  </div>
                </td>

                {/* Next Appointment */}
                <td className="py-3.5 px-4">
                  {patient.nextAppointment ? (
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs font-medium">{formatDate(patient.nextAppointment)}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">لا يوجد موعد</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === patient.id ? null : patient.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === patient.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute left-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20">
                          <button
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => { onSelectPatient(patient); setOpenMenuId(null); }}
                          >
                            <Eye className="w-4 h-4 text-slate-400" />
                            عرض الملف
                          </button>
                          <button
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => { onBookAppointment(patient); setOpenMenuId(null); }}
                          >
                            <CalendarCheck className="w-4 h-4 text-blue-400" />
                            حجز موعد
                          </button>
                          <button
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => setOpenMenuId(null)}
                          >
                            <MessageSquare className="w-4 h-4 text-emerald-400" />
                            إرسال رسالة
                          </button>
                          <button
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => setOpenMenuId(null)}
                          >
                            <Tag className="w-4 h-4 text-amber-400" />
                            إضافة تصنيف
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {patients.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg font-semibold text-slate-600 mb-1">لا توجد نتائج</p>
          <p className="text-sm">جرّب تغيير كلمة البحث أو الفلاتر</p>
        </div>
      )}
    </div>
  );
}
