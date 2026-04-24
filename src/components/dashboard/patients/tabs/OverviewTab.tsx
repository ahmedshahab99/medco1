"use client";

import React from "react";
import { Patient } from "../../../../lib/types/dashboard";
import { Calendar, CalendarCheck, Activity, DollarSign, Clock, CheckCircle, User, Phone, Mail, MapPin, Globe } from "lucide-react";

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

      {/* Contact Information */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <h4 className="font-bold text-slate-800">بيانات التواصل</h4>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">الاسم الأول</p>
              <p className="text-sm font-semibold text-slate-700">{patient.firstName || patient.name.split(" ")[0]}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">اسم العائلة</p>
              <p className="text-sm font-semibold text-slate-700">{patient.lastName || patient.name.split(" ").slice(-1)[0]}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">تاريخ الميلاد</p>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-sm font-semibold">{formatDate(patient.dateOfBirth)}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">الجنس</p>
              <p className="text-sm font-semibold text-slate-700">
                {patient.gender === "male" ? "ذكر" : patient.gender === "female" ? "أنثى" : "—"}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">رقم الهاتف</p>
                <p className="text-sm font-semibold text-slate-700" dir="ltr">{patient.phone}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
            {patient.email && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">البريد الإلكتروني</p>
                  <p className="text-sm font-semibold text-slate-700">{patient.email}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">العنوان</p>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {patient.country || "السعودية"}
                  </span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {patient.city || "الرياض"}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{patient.streetAddress || patient.address || "—"}</p>
              </div>
            </div>
          </div>
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
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 text-white shadow-lg shadow-blue-200">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-bold text-blue-100 uppercase tracking-wide">الموعد القادم</p>
            </div>
          </div>
          <p className="font-bold text-2xl mb-1">{formatDate(patient.nextAppointment)}</p>
          <p className="text-blue-100 text-sm opacity-90">{patient.doctor}</p>
          
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <div className="flex -space-x-2 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 bg-blue-400 flex items-center justify-center text-[10px] font-bold">DR</div>
            </div>
            <button className="text-xs font-bold bg-white text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">
              تعديل الموعد
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
