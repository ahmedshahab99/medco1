"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
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

interface VisitNoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  editingId: string | null;
  editingData: EditingVisitNoteData | null;
  prefillAppointmentId?: string | null;
  onSaved: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-IQ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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

  const form = useForm<VisitNoteFormValues>({
    resolver: zodResolver(visitNoteFormSchema),
    defaultValues: {
      appointmentId: prefillAppointmentId ?? null,
      content: "",
      diagnosis: "",
      medications: [DEFAULT_MEDICATION],
      notes: "",
      validityDays: 30,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medications",
  });

  const watchedMeds = useWatch({ control: form.control, name: "medications" });

  useEffect(() => {
    if (!open) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setIsAppointmentsLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */
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
          : [DEFAULT_MEDICATION],
        notes: editingData.notes ?? "",
        validityDays: editingData.validityDays ?? 30,
      });
    } else {
      form.reset({
        appointmentId: prefillAppointmentId ?? null,
        content: "",
        diagnosis: "",
        medications: [DEFAULT_MEDICATION],
        notes: "",
        validityDays: 30,
      });
    }
  }, [open, editingData, patientId, prefillAppointmentId, form]);

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

    if (res.success) {
      toast.success(editingId ? "تم تحديث ملاحظة الزيارة" : "تم حفظ ملاحظة الزيارة بنجاح");
      onSaved();
    } else {
      toast.error(res.error);
    }
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
                    {a.serviceName ?? "موعد"} · {formatDate(a.startTime)}
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
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      الدواء {idx + 1}
                    </span>
                    {fields.length > 1 && (
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? "حفظ التعديلات" : "حفظ الملاحظة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
