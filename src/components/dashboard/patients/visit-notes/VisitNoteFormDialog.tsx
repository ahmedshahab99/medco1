"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Loader2, AlertCircle, Paperclip, X, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  createVisitNoteAction,
  updateVisitNoteAction,
  getPatientAppointmentsForVisitNoteAction,
} from "@/app/dashboard/patients/[id]/visit-notes/actions";
import {
  uploadPatientFileAction,
  detachFileFromVisitNoteAction,
  attachFileToVisitNoteAction,
  updatePatientFileNameAction,
  listPatientFilesAction,
} from "@/app/dashboard/patients/[id]/files/actions";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "@/app/dashboard/patients/[id]/files/constants";
import { formatDate } from "@/lib/date-utils";
import { usePlan } from "@/lib/plans/plan-context";

const DEFAULT_MEDICATION = {
  tempId: "1",
  name: "",
  dose: "",
  frequency: "",
  duration: "",
  instructions: "",
} as const;

type VisitNoteFormValues = {
  appointmentId: string | null;
  content: string;
  diagnosis: string;
  medications: { tempId: string; name: string; dose: string; frequency: string; duration: string; instructions: string }[];
  notes: string;
  validityDays: number;
};

const visitNoteFormSchema = z.object({
  appointmentId: z.string().nullable(),
  content: z.string(),
  diagnosis: z.string(),
  medications: z.array(
    z.object({
      tempId: z.string(),
      name: z.string(),
      dose: z.string(),
      frequency: z.string(),
      duration: z.string(),
      instructions: z.string(),
    })
  ),
  notes: z.string(),
  validityDays: z.number().int().positive(),
});

interface EditingVisitNoteData {
  appointmentId: string | null;
  content: string | null;
  diagnosis: string | null;
  medications: {
    id: string;
    name: string;
    dose: string;
    frequency: string;
    duration: string;
    instructions: string | null;
  }[];
  notes: string | null;
  validityDays: number | null;
}

interface PickedFile {
  tempId: string;
  file: File;
  displayName: string;
}

interface AttachedExistingFile {
  id: string;
  name: string;
  nameDraft: string;
  size: number;
  mimeType: string;
  removed: boolean;
  savingName: boolean;
}

interface VisitNoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  editingId: string | null;
  editingData: EditingVisitNoteData | null;
  prefillAppointmentId?: string | null;
  onSaved: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx";

export function VisitNoteFormDialog({
  open,
  onOpenChange,
  patientId,
  editingId,
  editingData,
  prefillAppointmentId,
  onSaved,
}: VisitNoteFormDialogProps) {
  const [appointments, setAppointments] = useState<
    { id: string; startTime: string; serviceName: string | null }[]
  >([]);
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(false);

  const [pickedFiles, setPickedFiles] = useState<PickedFile[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachedExistingFile[]>([]);
  const [isLoadingAttached, setIsLoadingAttached] = useState(false);
  const [isSavingFiles, setIsSavingFiles] = useState(false);

  const plan = usePlan();
  const patientFilesEnabled = plan?.limits.features.patientFiles !== false;

  const form = useForm<VisitNoteFormValues>({
    resolver: zodResolver(visitNoteFormSchema),
    defaultValues: {
      appointmentId: prefillAppointmentId ?? null,
      content: "",
      diagnosis: "",
      medications: [],
      notes: "",
      validityDays: 30,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medications",
  });

  const watchedMeds = useWatch({ control: form.control, name: "medications" });

  const loadAttachedFiles = useCallback(async () => {
    if (!editingId) {
      setAttachedFiles([]);
      return;
    }
    try {
      setIsLoadingAttached(true);
      const res = await listPatientFilesAction(patientId, { visitNoteId: editingId });
      if (res.success) {
        setAttachedFiles(
          res.data.map((f) => ({
            id: f.id,
            name: f.name,
            nameDraft: f.name,
            size: f.size,
            mimeType: f.mimeType,
            removed: false,
            savingName: false,
          }))
        );
      }
    } catch {
      // Silent fail — editing existing files is best-effort
    } finally {
      setIsLoadingAttached(false);
    }
  }, [editingId, patientId]);

  useEffect(() => {
    if (!open) return;
    setIsAppointmentsLoading(true);
    setPickedFiles([]);
    getPatientAppointmentsForVisitNoteAction(patientId)
      .then((res) => {
        if (res.success) setAppointments(res.data);
      })
      .finally(() => setIsAppointmentsLoading(false));

    if (editingData) {
      form.reset({
        appointmentId: editingData.appointmentId,
        content: editingData.content ?? "",
        diagnosis: editingData.diagnosis ?? "",
        medications: editingData.medications.length > 0
          ? editingData.medications.map((m, i) => ({
              tempId: String(i + 1),
              name: m.name,
              dose: m.dose,
              frequency: m.frequency,
              duration: m.duration,
              instructions: m.instructions ?? "",
            }))
          : [],
        notes: editingData.notes ?? "",
        validityDays: editingData.validityDays ?? 30,
      });
    } else {
      form.reset({
        appointmentId: prefillAppointmentId ?? null,
        content: "",
        diagnosis: "",
        medications: [],
        notes: "",
        validityDays: 30,
      });
    }
  }, [open, editingData, patientId, prefillAppointmentId, form]);

  useEffect(() => {
    if (!open) return;
    loadAttachedFiles();
  }, [open, loadAttachedFiles]);

  const addMedication = useCallback(() => {
    append({
      tempId: String(Date.now()),
      name: "",
      dose: "",
      frequency: "",
      duration: "",
      instructions: "",
    });
  }, [append]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const next: PickedFile[] = [...pickedFiles];
    for (const file of files) {
      next.push({
        tempId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        displayName: file.name.replace(/\.[^.]+$/, ""),
      });
    }
    setPickedFiles(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function updatePickedName(tempId: string, name: string) {
    setPickedFiles((prev) =>
      prev.map((p) => (p.tempId === tempId ? { ...p, displayName: name } : p))
    );
  }

  function removePicked(tempId: string) {
    setPickedFiles((prev) => prev.filter((p) => p.tempId !== tempId));
  }

  function updateAttachedNameDraft(id: string, name: string) {
    setAttachedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, nameDraft: name } : f))
    );
  }

  async function saveAttachedName(id: string) {
    const file = attachedFiles.find((f) => f.id === id);
    if (!file) return;
    const trimmed = file.nameDraft.trim();
    if (!trimmed) {
      toast.error("اسم الملف مطلوب");
      return;
    }
    if (trimmed === file.name) {
      return;
    }
    setAttachedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, savingName: true } : f))
    );
    try {
      const res = await updatePatientFileNameAction(id, trimmed);
      if (res.success) {
        setAttachedFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, name: trimmed, nameDraft: trimmed, savingName: false } : f
          )
        );
        toast.success("تم تحديث اسم الملف");
      } else {
        toast.error(res.error);
        setAttachedFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, savingName: false } : f))
        );
      }
    } catch {
      toast.error("فشل تحديث اسم الملف");
      setAttachedFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, savingName: false } : f))
      );
    }
  }

  function markAttachedRemoved(id: string, removed: boolean) {
    setAttachedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, removed } : f))
    );
  }

  async function persistNewFiles(visitNoteId: string) {
    if (pickedFiles.length === 0) return;
    let ok = 0;
    let lastError: string | null = null;
    for (const p of pickedFiles) {
      if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(p.file.type)) {
        lastError = `نوع غير مدعوم: ${p.file.name}`;
        continue;
      }
      if (p.file.size > MAX_FILE_SIZE_BYTES) {
        lastError = `حجم كبير جداً: ${p.file.name}`;
        continue;
      }
      const displayName = p.displayName.trim() || p.file.name;
      try {
        const fd = new FormData();
        fd.append("file", p.file);
        fd.append("displayName", displayName);
        const res = await uploadPatientFileAction(patientId, fd, { visitNoteId });
        if (res.success) {
          ok += 1;
        } else {
          lastError = res.error;
        }
      } catch {
        lastError = "فشل رفع أحد الملفات";
      }
    }
    if (ok > 0) {
      toast.success(ok === 1 ? "تم رفع الملف" : `تم رفع ${ok} ملفات`);
    }
    if (lastError) toast.error(lastError);
  }

  async function persistAttachedChanges(visitNoteId: string) {
    const removed = attachedFiles.filter((f) => f.removed);
    for (const f of removed) {
      try {
        await detachFileFromVisitNoteAction(visitNoteId, f.id);
      } catch {
        toast.error(`فشل إزالة ${f.name}`);
      }
    }
  }

  async function reattachIfRenamed(visitNoteId: string) {
    const renamed = attachedFiles.filter(
      (f) => f.nameDraft.trim() && f.nameDraft.trim() !== f.name
    );
    for (const f of renamed) {
      try {
        await updatePatientFileNameAction(f.id, f.nameDraft.trim());
        await attachFileToVisitNoteAction(visitNoteId, f.id);
      } catch {
        // ignore
      }
    }
  }

  async function onSubmit(values: VisitNoteFormValues) {
    const hasContent = values.content?.trim();
    const hasDiagnosis = values.diagnosis?.trim();
    const validMeds = values.medications.filter((m) => m.name.trim());

    if (!hasContent && !hasDiagnosis && validMeds.length === 0) {
      toast.error("يجب إدخال ملاحظات أو تشخيص أو دواء واحد على الأقل");
      return;
    }

    if (validMeds.length > 0 && validMeds.some((m) => !m.dose.trim() || !m.frequency.trim() || !m.duration.trim())) {
      toast.error("جميع حقول الدواء مطلوبة");
      return;
    }

    const payload = {
      appointmentId: values.appointmentId || undefined,
      content: values.content?.trim() || undefined,
      diagnosis: values.diagnosis?.trim() || undefined,
      medications: validMeds.map((med) => ({
        name: med.name,
        dose: med.dose,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions || undefined,
      })),
      notes: values.notes?.trim() || undefined,
      validityDays: values.validityDays,
    };

    const res = editingId
      ? await updateVisitNoteAction(editingId, payload)
      : await createVisitNoteAction(patientId, payload);

    if (!res.success) {
      toast.error(res.error);
      return;
    }

    let visitNoteId: string;
    if (editingId) {
      visitNoteId = editingId;
    } else if (res.success) {
      const data = (res as { success: true; data: { id: string } }).data;
      if (!data?.id) {
        toast.error("تعذّر تحديد ملاحظة الزيارة");
        return;
      }
      visitNoteId = data.id;
    } else {
      return;
    }

    setIsSavingFiles(true);
    try {
      await persistAttachedChanges(visitNoteId);
      await persistNewFiles(visitNoteId);
      await reattachIfRenamed(visitNoteId);
    } finally {
      setIsSavingFiles(false);
    }

    toast.success(editingId ? "تم تحديث ملاحظة الزيارة" : "تم حفظ ملاحظة الزيارة بنجاح");
    onSaved();
  }

  const { register, formState: { errors, isSubmitting }, setValue } = form;
  const appointmentValue = useWatch({ control: form.control, name: "appointmentId" }) ?? "none";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg font-sans max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingId ? "تعديل ملاحظة الزيارة" : "ملاحظة زيارة جديدة"}
          </DialogTitle>
          <DialogDescription>
            {editingId
              ? "حدّث بيانات ملاحظة الزيارة ثم اضغط حفظ."
              : "أدخل ملاحظات الزيارة وتشخيص المريض والأدوية الموصوفة."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>الموعد (اختياري)</Label>
            <Select
              value={appointmentValue}
              onValueChange={(v) =>
                setValue("appointmentId", v === "none" ? null : v, { shouldValidate: true })
              }
              disabled={isAppointmentsLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={isAppointmentsLoading ? "جاري التحميل..." : "بدون ربط بموعد"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">بدون ربط بموعد</SelectItem>
                {appointments.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.serviceName ?? "موعد"} · {formatDate(a.startTime, { month: "short" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vn-content">ملاحظات الزيارة</Label>
            <Textarea
              id="vn-content"
              placeholder="أدخل ملاحظات الزيارة (الفحص، الأعراض، التوصيات...)"
              rows={3}
              {...register("content")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vn-diagnosis">التشخيص</Label>
            <Textarea
              id="vn-diagnosis"
              placeholder="أدخل التشخيص الطبي"
              rows={2}
              {...register("diagnosis")}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-semibold text-slate-700">
                الأدوية
              </Label>
              <Button
                type="button"
                onClick={addMedication}
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={isSubmitting}
              >
                <Plus className="w-3 h-3" />
                إضافة دواء
              </Button>
            </div>

            <div className="space-y-3">
              {fields.length > 0 && fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      الدواء {idx + 1}
                    </span>
                    {fields.length > 0 && (
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="اسم الدواء"
                      {...register(`medications.${idx}.name`)}
                      disabled={isSubmitting}
                    />
                    <Input
                      placeholder="الجرعة"
                      {...register(`medications.${idx}.dose`)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="التكرار (مثل: 3 مرات يومياً)"
                      {...register(`medications.${idx}.frequency`)}
                      
                      disabled={isSubmitting}
                    />
                    <Input
                      placeholder="المدة (مثل: 7 أيام)"
                      {...register(`medications.${idx}.duration`)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <Input
                    placeholder="تعليمات إضافية (اختياري)"
                    {...register(`medications.${idx}.instructions`)}
                    disabled={isSubmitting}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Files section ─────────────────────────────────────── */}
          {(patientFilesEnabled || editingId) && (
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-cyan-600" />
                  الملفات المرفقة
                </Label>
                {patientFilesEnabled && (
                  <label
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dashed border-cyan-300 bg-cyan-50/40 text-cyan-700 text-[11px] font-semibold cursor-pointer hover:bg-cyan-50 transition-colors ${
                      isSubmitting || isSavingFiles ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    إضافة ملفات جديدة
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={ACCEPT}
                      onChange={handleFilePick}
                      className="hidden"
                      disabled={isSubmitting || isSavingFiles}
                    />
                  </label>
                )}
              </div>

              {/* Existing attached files (edit mode) */}
              {editingId && (
                <div className="space-y-1.5">
                  {isLoadingAttached ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
                    </div>
                  ) : attachedFiles.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-1">
                      لا توجد ملفات مرفقة بهذه الملاحظة.
                    </p>
                  ) : (
                    attachedFiles.map((f) => (
                      <div
                        key={f.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border ${
                          f.removed
                            ? "border-red-200 bg-red-50/40 opacity-60"
                            : "border-cyan-200 bg-cyan-50/40"
                        }`}
                      >
                        <Paperclip className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                        <div className="flex-1 min-w-0 space-y-1">
                          {patientFilesEnabled ? (
                            <Input
                              value={f.nameDraft}
                              onChange={(e) => updateAttachedNameDraft(f.id, e.target.value)}
                              placeholder="اسم الملف"
                              className="h-7 text-xs"
                              disabled={f.removed || isSubmitting || f.savingName}
                              dir="rtl"
                            />
                          ) : (
                            <span className="text-xs font-medium text-slate-800 block truncate">
                              {f.name}
                            </span>
                          )}
                          <p className="text-[10px] text-slate-400 truncate">
                            {f.mimeType} · {formatSize(f.size)}
                          </p>
                        </div>
                        {patientFilesEnabled && (
                          <div className="flex items-center gap-1 shrink-0">
                            {!f.removed && (
                              <button
                                type="button"
                                onClick={() => saveAttachedName(f.id)}
                                disabled={f.savingName || f.nameDraft.trim() === f.name}
                                className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 disabled:opacity-30"
                                title="حفظ الاسم"
                              >
                                {f.savingName ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                            {f.removed ? (
                              <button
                                type="button"
                                onClick={() => markAttachedRemoved(f.id, false)}
                                disabled={isSubmitting}
                                className="p-1 rounded-md text-slate-500 hover:bg-slate-100"
                                title="استعادة"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => markAttachedRemoved(f.id, true)}
                                disabled={isSubmitting}
                                className="p-1 rounded-md text-red-500 hover:bg-red-50"
                                title="إزالة من هذه الملاحظة"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Newly picked files (will upload on save) */}
              {patientFilesEnabled && pickedFiles.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-slate-500 font-semibold">
                    ملفات جديدة ({pickedFiles.length}) — سترفع عند الحفظ
                  </p>
                  {pickedFiles.map((p) => (
                    <div
                      key={p.tempId}
                      className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="flex-1 min-w-0 space-y-1">
                        <Input
                          value={p.displayName}
                          onChange={(e) => updatePickedName(p.tempId, e.target.value)}
                          placeholder="اسم الملف"
                          className="h-7 text-xs"
                          disabled={isSubmitting}
                          dir="rtl"
                        />
                        <p className="text-[10px] text-slate-400 truncate" title={p.file.name}>
                          {p.file.name} · {formatSize(p.file.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePicked(p.tempId)}
                        disabled={isSubmitting}
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
          )}

          <div className="space-y-1.5">
            <Label htmlFor="vn-notes">ملاحظات إضافية (اختياري)</Label>
            <Textarea
              id="vn-notes"
              placeholder="ملاحظات إضافية..."
              rows={2}
              {...register("notes")}
            />
          </div>

          {watchedMeds.some((m) => m.name.trim()) && (
            <div className="space-y-1.5">
              <Label htmlFor="vn-validity">صلاحية الوصفة (بالأيام)</Label>
              <Input
                id="vn-validity"
                type="number"
                min={1}
                dir="ltr"
                {...register("validityDays", { valueAsNumber: true })}
                disabled={isSubmitting}
              />
            </div>
          )}

          {Object.keys(errors).length > 0 && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 px-3 py-2 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5" />
              يرجى تصحيح الحقول المطلوبة قبل الحفظ
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting || isSavingFiles}>
              {(isSubmitting || isSavingFiles) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {editingId ? "حفظ التعديلات" : "حفظ الملاحظة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
