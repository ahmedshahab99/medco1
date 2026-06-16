"use client";

import React, { useCallback, useState } from "react";
import { Paperclip, Loader2, Link as LinkIcon, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { PatientFileRow, type PatientFileRowData } from "../files/PatientFileRow";
import {
  listPatientFilesAction,
  listUnattachedPatientFilesAction,
  attachFileToVisitNoteAction,
  detachFileFromVisitNoteAction,
} from "@/app/dashboard/patients/[id]/files/actions";

interface VisitNoteFilesSectionProps {
  patientId: string;
  visitNoteId: string;
  initialFiles: PatientFileRowData[];
}

export function VisitNoteFilesSection({
  patientId,
  visitNoteId,
  initialFiles,
}: VisitNoteFilesSectionProps) {
  const [files, setFiles] = useState<PatientFileRowData[]>(initialFiles);
  const [isLoading, setIsLoading] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [unattached, setUnattached] = useState<PatientFileRowData[]>([]);
  const [isLoadingUnattached, setIsLoadingUnattached] = useState(false);
  const [attachingId, setAttachingId] = useState<string | null>(null);
  const [detachingId, setDetachingId] = useState<string | null>(null);

  const loadAttached = useCallback(async () => {
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

  const openAttach = useCallback(async () => {
    setShowAttach(true);
    try {
      setIsLoadingUnattached(true);
      const res = await listUnattachedPatientFilesAction(patientId, visitNoteId);
      if (res.success) {
        setUnattached(res.data);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("فشل تحميل ملفات المريض");
    } finally {
      setIsLoadingUnattached(false);
    }
  }, [patientId, visitNoteId]);

  async function handleAttach(fileId: string) {
    try {
      setAttachingId(fileId);
      const res = await attachFileToVisitNoteAction(visitNoteId, fileId);
      if (res.success) {
        toast.success("تم إرفاق الملف");
        setUnattached((prev) => prev.filter((f) => f.id !== fileId));
        await loadAttached();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("فشل إرفاق الملف");
    } finally {
      setAttachingId(null);
    }
  }

  async function handleDetach(fileId: string) {
    try {
      setDetachingId(fileId);
      const res = await detachFileFromVisitNoteAction(visitNoteId, fileId);
      if (res.success) {
        toast.success("تم إزالة الملف من هذه الملاحظة");
        await loadAttached();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("فشل إزالة الملف");
    } finally {
      setDetachingId(null);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-cyan-100 overflow-hidden">
      <div className="bg-cyan-50 px-4 py-2 border-b border-cyan-100 flex items-center justify-between">
        <span className="text-sm font-bold text-cyan-700 flex items-center gap-2">
          <Paperclip className="w-4 h-4" />
          الملفات المرفقة
          <span className="text-[11px] font-normal text-cyan-600">
            ({files.length})
          </span>
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openAttach}
          className="gap-1.5 h-7 text-xs"
        >
          <LinkIcon className="w-3 h-3" />
          إرفاق ملف موجود
        </Button>
      </div>

      <div className="p-4 space-y-3">
        {isLoading && files.length === 0 ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-2">
            لا توجد ملفات مرفقة بهذه الملاحظة. ارفع ملفاً جديداً من نموذج إنشاء
            ملاحظة زيارة، أو ارفع ملفاً من تبويب &quot;الملفات&quot; ثم اربطه هنا.
          </p>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="relative">
                <PatientFileRow
                  file={file}
                  allowDelete={false}
                  onChanged={loadAttached}
                />
                <button
                  type="button"
                  onClick={() => handleDetach(file.id)}
                  disabled={detachingId === file.id}
                  className="absolute top-2 end-2 px-2 py-1 text-[11px] font-semibold rounded-md text-slate-500 hover:bg-slate-100 border border-slate-200 disabled:opacity-50"
                  title="إزالة من هذه الملاحظة (يبقى في ملفات المريض)"
                >
                  {detachingId === file.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    "إزالة"
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {showAttach && (
          <div className="mt-3 border border-cyan-200 rounded-lg bg-cyan-50/40">
            <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-200/60">
              <span className="text-xs font-bold text-cyan-700 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                ملفات المريض غير المرتبطة بهذه الملاحظة
              </span>
              <button
                type="button"
                onClick={() => setShowAttach(false)}
                className="p-1 rounded-md text-slate-500 hover:bg-white"
                title="إغلاق"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-2 max-h-60 overflow-y-auto custom-scrollbar">
              {isLoadingUnattached ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
                </div>
              ) : unattached.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-3">
                  لا توجد ملفات أخرى للمريض.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {unattached.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 bg-white rounded-md border border-slate-200 px-2 py-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          مرتبط بـ {file.visitNoteIds.length} ملاحظة أخرى
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleAttach(file.id)}
                        disabled={attachingId === file.id}
                        className="h-6 px-2 text-[11px] gap-1"
                      >
                        {attachingId === file.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <LinkIcon className="w-3 h-3" />
                        )}
                        إرفاق
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
