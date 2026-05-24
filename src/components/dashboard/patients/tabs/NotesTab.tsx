"use client";

import React from "react";
import type { Patient } from "@/lib/types/dashboard";

interface NotesTabProps {
  patient: Patient;
}

export function NotesTab({ patient }: NotesTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">الملاحظات الطبية</h2>
      {patient.notes.length === 0 ? (
        <p className="text-slate-400 text-sm">لا توجد ملاحظات</p>
      ) : (
        <div className="space-y-3">
          {patient.notes.map((note) => (
            <div key={note.id} className="border border-slate-100 rounded-xl p-4">
              <p className="text-sm text-slate-700">{note.content}</p>
              <p className="text-xs text-slate-400 mt-2">{note.doctorName} - {note.createdAt}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
