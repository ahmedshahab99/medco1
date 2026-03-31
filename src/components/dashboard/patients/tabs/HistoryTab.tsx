"use client";

import React from "react";
import { Patient, VisitRecord } from "../../../../lib/types/dashboard";
import { CheckCircle, XCircle, AlertCircle, FileText, Paperclip } from "lucide-react";

interface HistoryTabProps {
  patient: Patient;
}

const STATUS_CONFIG: Record<VisitRecord["status"], { label: string; icon: React.ElementType; cls: string }> = {
  completed: { label: "مكتمل", icon: CheckCircle, cls: "bg-emerald-100 text-emerald-700" },
  no_show: { label: "لم يحضر", icon: AlertCircle, cls: "bg-slate-100 text-slate-600" },
  cancelled: { label: "ملغي", icon: XCircle, cls: "bg-red-100 text-red-600" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}

export function HistoryTab({ patient }: HistoryTabProps) {
  const sorted = [...patient.visitHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-200" />
        <p className="font-semibold text-slate-600">لا توجد سجلات زيارات</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute right-[19px] top-0 bottom-0 w-0.5 bg-slate-100" />

      <div className="space-y-1">
        {sorted.map((visit, idx) => {
          const Config = STATUS_CONFIG[visit.status];
          const StatusIcon = Config.icon;
          return (
            <div key={visit.id} className="relative flex gap-4 pb-5">
              {/* Dot */}
              <div
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm ${Config.cls}`}
              >
                <StatusIcon className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{visit.service}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{visit.doctor}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${Config.cls}`}>
                      {Config.label}
                    </span>
                    <p className="text-[11px] text-slate-400">{formatDate(visit.date)}</p>
                  </div>
                </div>

                {/* Indicators */}
                {(visit.noteId || visit.hasFiles) && (
                  <div className="flex gap-2 mt-3 pt-2.5 border-t border-slate-50">
                    {visit.noteId && (
                      <span className="flex items-center gap-1 text-[11px] text-blue-500 font-medium bg-blue-50 px-2 py-1 rounded-lg">
                        <FileText className="w-3 h-3" />
                        ملاحظة طبية
                      </span>
                    )}
                    {visit.hasFiles && (
                      <span className="flex items-center gap-1 text-[11px] text-violet-500 font-medium bg-violet-50 px-2 py-1 rounded-lg">
                        <Paperclip className="w-3 h-3" />
                        ملفات مرفقة
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
