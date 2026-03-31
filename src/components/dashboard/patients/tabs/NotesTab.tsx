"use client";

import React, { useState } from "react";
import { Patient } from "../../../../lib/types/dashboard";
import { FileText, Plus, Edit2, Check, X, Stethoscope } from "lucide-react";
import { Button } from "../../../ui/Button";
import { Textarea } from "../../../ui/Textarea";

interface NotesTabProps {
  patient: Patient;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ar-SA", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export function NotesTab({ patient }: NotesTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const sorted = [...patient.notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Find the service name for a note via its appointmentId
  function getService(noteId: string, appointmentId: string) {
    const visit = patient.visitHistory.find((v) => v.id === appointmentId);
    return visit?.service ?? "—";
  }

  return (
    <div className="space-y-4">
      {/* Header action */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 font-medium">{sorted.length} ملاحظة طبية</p>
        <Button size="sm" className="gap-1.5" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4" />
          إضافة ملاحظة
        </Button>
      </div>

      {/* Add new note */}
      {isAdding && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-bold text-blue-700 flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4" />
            ملاحظة طبية جديدة
          </p>
          <Textarea
            className="h-28 bg-white"
            placeholder="اكتب ملاحظتك الطبية..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => { setIsAdding(false); setNewNote(""); }}>
              <X className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={() => { setIsAdding(false); setNewNote(""); }}>
              <Check className="w-4 h-4 ml-1" />
              حفظ
            </Button>
          </div>
        </div>
      )}

      {/* Notes list */}
      {sorted.length === 0 && !isAdding && (
        <div className="text-center py-12 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-600">لا توجد ملاحظات طبية</p>
          <p className="text-sm mt-1">ابدأ بإضافة ملاحظة للزيارة الأولى</p>
        </div>
      )}

      {sorted.map((note) => (
        <div key={note.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm group">
          {/* Note header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-xs font-bold text-slate-500">
                {getService(note.id, note.appointmentId)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {formatDate(note.createdAt)} · {note.doctorName}
              </p>
            </div>
            <button
              onClick={() => { setEditingId(note.id); setEditContent(note.content); }}
              className="p-1.5 rounded-lg text-slate-300 hover:text-blue-500 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {editingId === note.id ? (
            <div className="space-y-2">
              <Textarea
                className="h-28 text-sm"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                  <X className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={() => setEditingId(null)}>
                  <Check className="w-4 h-4 ml-1" />
                  حفظ
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
          )}
        </div>
      ))}
    </div>
  );
}
