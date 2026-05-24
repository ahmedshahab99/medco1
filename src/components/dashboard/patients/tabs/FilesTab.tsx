"use client";

import React from "react";
import type { Patient } from "@/lib/types/dashboard";

interface FilesTabProps {
  patient: Patient;
}

export function FilesTab({ patient }: FilesTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">الملفات</h2>
      {patient.files.length === 0 ? (
        <p className="text-slate-400 text-sm">لا توجد ملفات مرفوعة</p>
      ) : (
        <div className="space-y-3">
          {patient.files.map((file) => (
            <div key={file.id} className="border border-slate-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">{file.name}</p>
                <p className="text-xs text-slate-400">{file.type} - {file.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
