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
          <p className="text-sm text-slate-500">الحالة</p>
          <p className="font-semibold text-slate-800">{patient.status === "active" ? "نشط" : "غير نشط"}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-sm text-slate-500">عدد الزيارات</p>
          <p className="font-semibold text-slate-800">{patient.totalVisits}</p>
        </div>
      </div>
    </div>
  );
}
