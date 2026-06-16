"use client";

import React, { useRef } from "react";
import { Paperclip, X, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/Input";

export interface PickedFile {
  tempId: string;
  file: File;
  displayName: string;
}

interface FilePickerFieldProps {
  picked: PickedFile[];
  onChange: (next: PickedFile[]) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const DEFAULT_ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx";
const DEFAULT_MAX_MB = 20;

export function FilePickerField({
  picked,
  onChange,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = DEFAULT_MAX_MB,
  disabled = false,
}: FilePickerFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const maxBytes = maxSizeMB * 1024 * 1024;
    const next: PickedFile[] = [...picked];
    for (const file of files) {
      if (file.size > maxBytes) {
        continue;
      }
      next.push({
        tempId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        displayName: file.name.replace(/\.[^.]+$/, ""),
      });
    }
    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  }

  function updateName(tempId: string, name: string) {
    onChange(picked.map((p) => (p.tempId === tempId ? { ...p, displayName: name } : p)));
  }

  function remove(tempId: string) {
    onChange(picked.filter((p) => p.tempId !== tempId));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-cyan-300 bg-cyan-50/40 text-cyan-700 text-xs font-semibold cursor-pointer hover:bg-cyan-50 transition-colors ${
            disabled ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          إضافة ملفات
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={accept}
            onChange={handlePick}
            className="hidden"
            disabled={disabled}
          />
        </label>
        {picked.length > 0 && (
          <span className="text-[11px] text-slate-400">
            {picked.length} ملف جاهز للرفع
          </span>
        )}
      </div>

      {picked.length > 0 && (
        <div className="space-y-1.5">
          {picked.map((p) => (
            <div
              key={p.tempId}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2"
            >
              <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Input
                    value={p.displayName}
                    onChange={(e) => updateName(p.tempId, e.target.value)}
                    placeholder="اسم الملف"
                    className="h-7 text-xs"
                    disabled={disabled}
                    dir="rtl"
                  />
                </div>
                <p className="text-[10px] text-slate-400 truncate" title={p.file.name}>
                  {p.file.name} · {formatSize(p.file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(p.tempId)}
                disabled={disabled}
                className="p-1 rounded-md text-red-500 hover:bg-red-50 disabled:opacity-50"
                title="إزالة"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
