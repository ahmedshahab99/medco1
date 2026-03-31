"use client";

import React, { useState } from "react";
import { Patient, PatientFile } from "../../../../lib/types/dashboard";
import {
  FileText, Image, FlaskConical, File, Upload, Download, Eye, Trash2, Paperclip,
} from "lucide-react";
import { Button } from "../../../ui/Button";

interface FilesTabProps {
  patient: Patient;
}

const TYPE_CONFIG: Record<
  PatientFile["type"],
  { icon: React.ElementType; cls: string; label: string }
> = {
  pdf:   { icon: FileText,     cls: "bg-red-50 text-red-500",    label: "PDF" },
  image: { icon: Image,        cls: "bg-blue-50 text-blue-500",  label: "صورة" },
  lab:   { icon: FlaskConical, cls: "bg-emerald-50 text-emerald-500", label: "تحليل" },
  other: { icon: File,         cls: "bg-slate-100 text-slate-500", label: "ملف" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ar-SA", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export function FilesTab({ patient }: FilesTabProps) {
  const [isDragging, setIsDragging] = useState(false);

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function handleDragLeave() { setIsDragging(false); }
  function handleDrop(e: React.DragEvent) { e.preventDefault(); setIsDragging(false); }

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        onDragOver={handleDrag}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
        }`}
      >
        <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${isDragging ? "text-blue-500" : "text-slate-300"}`} />
        <p className="text-sm font-semibold text-slate-600">اسحب الملفات هنا أو</p>
        <label className="mt-1 inline-block">
          <span className="text-sm text-blue-600 font-bold cursor-pointer hover:underline">اختر ملفاً</span>
          <input type="file" className="hidden" multiple />
        </label>
        <p className="text-[11px] text-slate-400 mt-1">PDF, JPG, PNG · حد أقصى 20 MB</p>
      </div>

      {/* File count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
          <Paperclip className="w-4 h-4" />
          {patient.files.length} ملف مرفق
        </p>
      </div>

      {/* Files list */}
      {patient.files.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <File className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-600">لا توجد ملفات</p>
          <p className="text-sm mt-1">ارفع الملفات الطبية للمريض</p>
        </div>
      ) : (
        <div className="space-y-2">
          {patient.files.map((file) => {
            const config = TYPE_CONFIG[file.type];
            const Icon = config.icon;
            return (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm group hover:shadow-md transition-shadow"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.cls}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{file.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {file.size} · {config.label} · {formatDate(file.date)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-emerald-500 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
