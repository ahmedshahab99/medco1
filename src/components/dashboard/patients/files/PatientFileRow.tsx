"use client";

import React, { useState } from "react";
import {
  FileText,
  FileImage,
  FileType,
  Download,
  Trash2,
  Loader2,
  Pencil,
  Check,
  X as XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import {
  getPatientFileSignedUrlAction,
  deletePatientFileAction,
  updatePatientFileNameAction,
} from "@/app/dashboard/patients/[id]/files/actions";

export interface PatientFileRowData {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  storagePath: string;
  visitNoteIds: string[];
  uploadedByName: string | null;
  createdAt: string;
}

interface PatientFileRowProps {
  file: PatientFileRowData;
  onChanged?: () => void;
  allowEditName?: boolean;
  allowDelete?: boolean;
  compact?: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ar-SA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType === "application/pdf") return FileText;
  return FileType;
}

export function PatientFileRow({
  file,
  onChanged,
  allowEditName = true,
  allowDelete = true,
  compact = false,
}: PatientFileRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(file.name);
  const [isSavingName, setIsSavingName] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const Icon = fileIcon(file.mimeType);

  async function handleDownload() {
    try {
      setIsDownloading(true);
      const res = await getPatientFileSignedUrlAction(file.id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      const link = document.createElement("a");
      link.href = res.data.url;
      link.download = file.name;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast.error("فشل تنزيل الملف");
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true);
      const res = await deletePatientFileAction(file.id);
      if (res.success) {
        toast.success("تم حذف الملف");
        onChanged?.();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("فشل حذف الملف");
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleSaveName() {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      toast.error("اسم الملف مطلوب");
      return;
    }
    if (trimmed === file.name) {
      setIsEditingName(false);
      return;
    }
    try {
      setIsSavingName(true);
      const res = await updatePatientFileNameAction(file.id, trimmed);
      if (res.success) {
        toast.success("تم تحديث اسم الملف");
        setIsEditingName(false);
        onChanged?.();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("فشل تحديث اسم الملف");
    } finally {
      setIsSavingName(false);
    }
  }

  return (
    <>
      <div
        className={`group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all ${
          compact ? "p-2.5" : "p-3.5"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`shrink-0 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center group-hover:bg-cyan-100 transition-colors ${
              compact ? "w-8 h-8" : "w-10 h-10"
            }`}
          >
            <Icon
              className={`text-cyan-600 ${compact ? "w-4 h-4" : "w-5 h-5"}`}
            />
          </div>

          <div className="min-w-0 flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <Input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="h-7 text-sm"
                  disabled={isSavingName}
                  autoFocus
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={isSavingName}
                  className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50"
                  title="حفظ"
                >
                  {isSavingName ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNameDraft(file.name);
                    setIsEditingName(false);
                  }}
                  disabled={isSavingName}
                  className="p-1 rounded-md text-slate-500 hover:bg-slate-100"
                  title="إلغاء"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <p
                className={`font-bold text-slate-800 truncate ${
                  compact ? "text-xs" : "text-sm"
                }`}
                title={file.name}
              >
                {file.name}
              </p>
            )}
            <p
              className={`text-slate-400 mt-0.5 flex items-center gap-2 ${
                compact ? "text-[10px]" : "text-[11px]"
              }`}
            >
              <span>{formatSize(file.size)}</span>
              <span className="text-slate-300">·</span>
              <span>{formatDate(file.createdAt)}</span>
              {file.uploadedByName && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="truncate max-w-[120px]">
                    {file.uploadedByName}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-1.5 rounded-lg text-cyan-700 hover:bg-cyan-50 disabled:opacity-50"
              title="تنزيل"
            >
              {isDownloading ? (
                <Loader2
                  className={`animate-spin ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`}
                />
              ) : (
                <Download className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
              )}
            </button>
            {allowEditName && !isEditingName && (
              <button
                type="button"
                onClick={() => {
                  setNameDraft(file.name);
                  setIsEditingName(true);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                title="تعديل الاسم"
              >
                <Pencil className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
              </button>
            )}
            {allowDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={isDeleting}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                title="حذف"
              >
                <Trash2 className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
              </button>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الملف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف &ldquo;{file.name}&rdquo;؟ سيتم حذفه من جميع ملاحظات الزيارة
              المرتبطة به. لا يمكن التراجع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
