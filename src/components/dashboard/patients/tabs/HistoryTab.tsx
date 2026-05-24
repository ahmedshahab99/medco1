"use client";

import React from "react";
import type { Patient } from "@/lib/types/dashboard";

interface HistoryTabProps {
  patient: Patient;
}

export function HistoryTab({ patient }: HistoryTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">سجل الزيارات</h2>
      {patient.visitHistory.length === 0 ? (
        <p className="text-slate-400 text-sm">لا توجد زيارات سابقة</p>
      ) : (
        <div className="space-y-3">
          {patient.visitHistory.map((visit) => (
            <div key={visit.id} className="border border-slate-100 rounded-xl p-4">
              <p className="font-semibold text-slate-800">{visit.service}</p>
              <p className="text-sm text-slate-500">{visit.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
