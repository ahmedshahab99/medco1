"use client";

import React from "react";
import { Patient } from "../../../../lib/types/dashboard";
import { Calendar, CalendarCheck, Activity, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface OverviewTabProps {
  patient: Patient;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}

export function OverviewTab({ patient }: OverviewTabProps) {
  const upcomingVisits = patient.visitHistory.filter((v) => v.status === "completed").slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">آخر زيارة</p>
          </div>
          <p className="font-bold text-slate-800 text-sm leading-tight">{formatDate(patient.lastVisit)}</p>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">الموعد القادم</p>
          </div>
          <p className="font-bold text-slate-800 text-sm leading-tight">
            {patient.nextAppointment ? formatDate(patient.nextAppointment) : "لا يوجد"}
          </p>
        </div>

        <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-violet-500" />
            <p className="text-xs font-bold text-violet-600 uppercase tracking-wide">إجمالي الزيارات</p>
          </div>
          <p className="font-bold text-slate-800 text-2xl">{patient.totalVisits}</p>
        </div>

        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-amber-500" />
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">إجمالي الإنفاق</p>
          </div>
          <p className="font-bold text-slate-800 text-lg">
            {patient.totalSpent ? `${patient.totalSpent.toLocaleString("ar-SA")} ر.س` : "—"}
          </p>
        </div>
      </div>

      {/* Recent Visits */}
      <div>
        <h4 className="text-sm font-bold text-slate-700 mb-3">آخر الزيارات</h4>
        <div className="space-y-2.5">
          {upcomingVisits.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">لا توجد زيارات سابقة</p>
          )}
          {upcomingVisits.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{v.service}</p>
                <p className="text-xs text-slate-500">{v.doctor}</p>
              </div>
              <p className="text-xs text-slate-400 shrink-0">{formatDate(v.date)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      {patient.nextAppointment && (
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-200" />
            <p className="text-xs font-bold text-blue-200 uppercase tracking-wide">الموعد القادم</p>
          </div>
          <p className="font-bold text-lg">{formatDate(patient.nextAppointment)}</p>
          <p className="text-blue-200 text-sm mt-0.5">{patient.doctor}</p>
        </div>
      )}
    </div>
  );
}
