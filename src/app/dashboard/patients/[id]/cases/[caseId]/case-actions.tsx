"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import { updatePatientCaseAction, deletePatientCaseAction } from "../actions";
import { CASE_STATUSES, type CaseStatus } from "@/lib/types/cases";

const caseFormSchema = z.object({
  title: z.string().min(1, "عنوان الحالة مطلوب").max(200, "العنوان طويل جداً"),
  description: z.string().max(1000, "الوصف طويل جداً").optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type CaseFormValues = z.infer<typeof caseFormSchema>;

const STATUS_META: Record<CaseStatus, { label: string }> = {
  ACTIVE: { label: "نشطة" },
  INACTIVE: { label: "غير نشطة" },
};

interface CaseDetailActionsProps {
  caseId: string;
  patientId: string;
  caseData: {
    title: string;
    description: string | null;
    status: CaseStatus;
  };
}

export function CaseDetailActions({ caseId, patientId, caseData }: CaseDetailActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      title: caseData.title,
      description: caseData.description ?? "",
      status: caseData.status,
    },
  });

  const statusValue = form.watch("status");

  function openEdit() {
    form.reset({
      title: caseData.title,
      description: caseData.description ?? "",
      status: caseData.status,
    });
    setEditOpen(true);
  }

  async function handleEditSubmit(values: CaseFormValues) {
    const res = await updatePatientCaseAction(caseId, {
      title: values.title,
      description: values.description?.trim() || undefined,
      status: values.status,
    });
    if (res.success) {
      toast.success("تم تحديث الحالة");
      setEditOpen(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  function handleDelete() {
    startDelete(async () => {
      const res = await deletePatientCaseAction(caseId);
      if (res.success) {
        toast.success("تم حذف الحالة");
        router.push(`/dashboard/patients/${patientId}?tab=cases`);
      } else {
        toast.error(res.error);
        setDeleteOpen(false);
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={openEdit} className="gap-1.5">
          <Pencil className="w-4 h-4" />
          تعديل
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
        >
          <Trash2 className="w-4 h-4" />
          حذف
        </Button>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md font-sans">
          <DialogHeader>
            <DialogTitle>تعديل الحالة</DialogTitle>
            <DialogDescription>
              حدّث بيانات الحالة ثم اضغط حفظ.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-case-title">عنوان الحالة</Label>
              <Input
                id="edit-case-title"
                {...form.register("title")}
                aria-invalid={!!form.formState.errors.title}
              />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>الحالة</Label>
              <Select
                value={statusValue}
                onValueChange={(v) =>
                  form.setValue("status", v as CaseStatus, { shouldValidate: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CASE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-case-description">الوصف (اختياري)</Label>
              <Textarea
                id="edit-case-description"
                rows={3}
                placeholder="تفاصيل الحالة الطبية..."
                {...form.register("description")}
                aria-invalid={!!form.formState.errors.description}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            {Object.keys(form.formState.errors).length > 0 && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 px-3 py-2 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5" />
                يرجى تصحيح الحقول المطلوبة قبل الحفظ
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                حفظ التعديلات
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الحالة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الحالة؟ لا يمكن التراجع.
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
