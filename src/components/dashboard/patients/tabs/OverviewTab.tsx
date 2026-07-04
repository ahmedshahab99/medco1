"use client";

import React from "react";
import type { Patient } from "@/lib/types/dashboard";

interface OverviewTabProps {
  patient: Patient;
}

export function OverviewTab({ patient }: OverviewTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">نظرة عامة</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-sm text-slate-500">المصدر</p>
          <p className="font-semibold text-slate-800">
            {patient.source ?
              (patient.source === "SOCIAL_MEDIA" ? "وسائل التواصل" :
               patient.source === "GOOGLE_MAPS" ? "خرائط جوجل" :
               patient.source === "CLINIC_WEBSITE" ? "الموقع الإلكتروني" :
               patient.source === "REFERRAL" ? "توصية" :
               patient.source === "WALK_IN" ? "زيارة مباشرة" :
               patient.source === "OTHER" ? "أخرى" :
               patient.source) : "—"}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-sm text-slate-500">عدد الزيارات</p>
          <p className="font-semibold text-slate-800">{patient.totalVisits}</p>
        </div>
      </div>
    </div>
  );
}
