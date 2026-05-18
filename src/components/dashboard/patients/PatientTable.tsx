"use client";

import React from "react";
import { Patient } from "../../../hooks/use-patients";
import {
  Phone,
  Mail,
} from "lucide-react";

interface PatientTableProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
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

function getStatusLabel(status: string) {
  return status === "inactive" ? "غير نشط" : null;
}

export function PatientTable({ patients, onSelectPatient }: PatientTableProps) {

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-64">المريض</th>
            <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">التواصل</th>
            <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">الميلاد</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {patients.map((patient) => {
            return (
              
              <tr
                key={patient.id}
                onClick={() => onSelectPatient(patient)}
                className="group cursor-pointer transition-all duration-150 hover:bg-slate-50/80"
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
                        {getStatusLabel(patient.status) && (
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{getStatusLabel(patient.status)}</span>
                        )}
                      </div>
                      
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="py-3.5 px-4 ">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="flex items-center gap-1.5 text-slate-600" dir="ltr">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-xs">{patient.phone}</span>
                    </span>
                    {patient.email && (
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <span className="text-xs truncate">{patient.email}</span>
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      </span>
                    )}
                  </div>
                </td>
                {/* Birth Date */}
                <td className="py-3.5 px-4 ">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="flex items-center gap-1.5 text-slate-600" dir="ltr">
                      
                      <span className="text-xs">{patient.dateOfBirth?.split("T")[0]}</span>
                    </span>
                    
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
