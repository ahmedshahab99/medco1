"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
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
import { updatePatientAppointmentAction, deletePatientAppointmentAction } from "../actions";
import {
  APPOINTMENT_STATUSES,
  PAYMENT_STATUSES,
  type AppointmentStatus,
  type PaymentStatus,
} from "@/lib/types/appointments";

const appointmentFormSchema = z.object({
  status: z
    .enum(["BOOKING", "WAITING", "SCHEDULED", "CONFIRMED", "ARRIVED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"])
    .optional(),
  paymentStatus: z.enum(["PENDING", "PAID"]).optional(),
  notes: z.string().max(1000, "الملاحظات طويلة جداً").optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

const STATUS_META: Record<string, { label: string }> = {
  BOOKING: { label: "حجز" },
  WAITING: { label: "انتظار" },
  SCHEDULED: { label: "مجدول" },
  CONFIRMED: { label: "مؤكد" },
  ARRIVED: { label: "وصل" },
  IN_PROGRESS: { label: "قيد التنفيذ" },
  COMPLETED: { label: "مكتمل" },
  CANCELLED: { label: "ملغي" },
  NO_SHOW: { label: "لم يحضر" },
};

const PAYMENT_META: Record<string, { label: string }> = {
  PENDING: { label: "غير مدفوع" },
  PAID: { label: "مدفوع" },
};

interface AppointmentDetailActionsProps {
  appointmentId: string;
  patientId: string;
  appointmentData: {
    status: string;
    paymentStatus: string;
    notes: string | null;
  };
}

export function AppointmentDetailActions({
  appointmentId,
  patientId,
  appointmentData,
}: AppointmentDetailActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      status: (appointmentData.status as AppointmentStatus) ?? undefined,
      paymentStatus: (appointmentData.paymentStatus as PaymentStatus) ?? undefined,
      notes: appointmentData.notes ?? "",
    },
  });

  const statusValue = form.watch("status") ?? "none";
  const paymentValue = form.watch("paymentStatus") ?? "none";

  function openEdit() {
    form.reset({
      status: (appointmentData.status as AppointmentStatus) ?? undefined,
      paymentStatus: (appointmentData.paymentStatus as PaymentStatus) ?? undefined,
      notes: appointmentData.notes ?? "",
    });
    setEditOpen(true);
  }

  async function handleEditSubmit(values: AppointmentFormValues) {
    const res = await updatePatientAppointmentAction(appointmentId, {
      status: values.status,
      paymentStatus: values.paymentStatus,
      notes: values.notes?.trim() || undefined,
    });
    if (res.success) {
      toast.success("تم تحديث الموعد");
      setEditOpen(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  function handleDelete() {
    startDelete(async () => {
      const res = await deletePatientAppointmentAction(appointmentId);
      if (res.success) {
        toast.success("تم حذف الموعد");
        router.push(`/dashboard/patients/${patientId}?tab=appointments`);
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
            <DialogTitle>تعديل الموعد</DialogTitle>
            <DialogDescription>
              حدّث حالة الموعد واضغط حفظ.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>حالة الموعد</Label>
              <Select
                value={statusValue}
                onValueChange={(v) =>
                  form.setValue("status", v === "none" ? undefined : (v as AppointmentStatus), { shouldValidate: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون تغيير</SelectItem>
                  {APPOINTMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_META[s]?.label ?? s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>حالة الدفع</Label>
              <Select
                value={paymentValue}
                onValueChange={(v) =>
                  form.setValue("paymentStatus", v === "none" ? undefined : (v as PaymentStatus), { shouldValidate: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر حالة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون تغيير</SelectItem>
                  {PAYMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {PAYMENT_META[s]?.label ?? s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-apt-notes">الملاحظات (اختياري)</Label>
              <Textarea
                id="edit-apt-notes"
                rows={3}
                placeholder="ملاحظات حول الموعد..."
                {...form.register("notes")}
                aria-invalid={!!form.formState.errors.notes}
              />
              {form.formState.errors.notes && (
                <p className="text-xs text-destructive">{form.formState.errors.notes.message}</p>
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
            <AlertDialogTitle>حذف الموعد</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الموعد؟ لا يمكن التراجع.
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
