"use client";

import React, { useCallback, useEffect, useState } from "react";
import { UploadCloud, Loader2, FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { FilePickerField, type PickedFile } from "./FilePickerField";
import { PatientFileRow, type PatientFileRowData } from "./PatientFileRow";
import {
  listPatientFilesAction,
  uploadPatientFileAction,
} from "@/app/dashboard/patients/[id]/files/actions";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "@/app/dashboard/patients/[id]/files/constants";

interface PatientFilesSectionProps {
  patientId: string;
  visitNoteId?: string;
  compact?: boolean;
  title?: string;
  onChanged?: () => void;
}

function matchesAccept(file: File): boolean {
  if ((ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) return true;
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  return [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".doc", ".docx"].includes(ext);
}

export function PatientFilesSection({
  patientId,
  visitNoteId,
  compact = false,
  title = "الملفات",
  onChanged,
}: PatientFilesSectionProps) {
  const [files, setFiles] = useState<PatientFileRowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [picked, setPicked] = useState<PickedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await listPatientFilesAction(patientId, { visitNoteId });
      if (res.success) {
        setFiles(res.data);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("فشل تحميل الملفات");
    } finally {
      setIsLoading(false);
    }
  }, [patientId, visitNoteId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload() {
    if (picked.length === 0) return;
    setIsUploading(true);
    let successCount = 0;
    let lastError: string | null = null;
    for (const p of picked) {
      if (!matchesAccept(p.file)) {
        lastError = `نوع الملف غير مدعوم: ${p.file.name}`;
        continue;
      }
      if (p.file.size > MAX_FILE_SIZE_BYTES) {
        lastError = `حجم الملف يتجاوز الحد: ${p.file.name}`;
        continue;
      }
      try {
        const fd = new FormData();
        fd.append("file", p.file);
        fd.append("displayName", p.displayName);
        const res = await uploadPatientFileAction(patientId, fd, {
          ...(visitNoteId ? { visitNoteId } : {}),
        });
        if (res.success) {
          successCount += 1;
        } else {
          lastError = res.error;
        }
      } catch {
        lastError = "فشل رفع أحد الملفات";
      }
    }
    setIsUploading(false);
    if (successCount > 0) {
      toast.success(
        successCount === 1
          ? "تم رفع الملف بنجاح"
          : `تم رفع ${successCount} ملفات بنجاح`
      );
      setPicked([]);
      await load();
      onChanged?.();
    }
    if (lastError) {
      toast.error(lastError);
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={`flex items-center justify-between gap-2 ${
          compact ? "" : "border-b border-slate-100 pb-2"
        }`}
      >
        <h3
          className={`font-bold text-slate-700 flex items-center gap-2 ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          <FileText className="w-4 h-4 text-cyan-600" />
          {title}
          {!isLoading && (
            <span className="text-[11px] font-normal text-slate-400">
              ({files.length})
            </span>
          )}
        </h3>
      </div>

      <FilePickerField
        picked={picked}
        onChange={setPicked}
        disabled={isUploading}
      />

      {picked.length > 0 && (
        <Button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          size="sm"
          className="gap-1.5 w-full"
        >
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <UploadCloud className="w-3.5 h-3.5" />
          )}
          رفع {picked.length} ملف
        </Button>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-2 border border-slate-100">
            <Plus className="w-5 h-5 text-slate-300" />
          </div>
          <p className="text-xs text-slate-400 font-medium">لا توجد ملفات</p>
          <p className="text-[10px] text-slate-300 mt-0.5">
            ارفع ملفاً جديداً من الأعلى ليظهر هنا
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <PatientFileRow
              key={file.id}
              file={file}
              compact={compact}
              onChanged={() => {
                load();
                onChanged?.();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
