"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
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
import {
  updatePatientPaymentAction,
  deletePatientPaymentAction,
} from "../actions";
import { PATIENT_PAYMENT_CATEGORIES, type PaymentInput } from "@/lib/types/payments";

const paymentFormSchema = z.object({
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  category: z.enum(["CONSULTATION", "MEDICATIONS", "SERVICES", "OTHER"]),
  date: z.string().min(1, "التاريخ مطلوب"),
  description: z.string().max(500, "الوصف طويل جداً").optional(),
  appointmentId: z.string().nullable().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

const CATEGORY_META: Record<string, { label: string }> = {
  CONSULTATION: { label: "كشف" },
  MEDICATIONS: { label: "أدوية" },
  SERVICES: { label: "خدمات" },
  OTHER: { label: "أخرى" },
};

interface PaymentDetailActionsProps {
  paymentId: string;
  patientId: string;
  payment: {
    amount: number;
    category: string;
    date: string;
    description: string;
    appointmentId: string | null;
  };
}

export function PaymentDetailActions({
  paymentId,
  patientId,
  payment,
}: PaymentDetailActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: payment.amount,
      category: payment.category as PaymentFormValues["category"],
      date: payment.date,
      description: payment.description,
      appointmentId: payment.appointmentId,
    },
  });

  const categoryValue = useWatch({ control: form.control, name: "category" });

  function openEdit() {
    form.reset({
      amount: payment.amount,
      category: payment.category as PaymentFormValues["category"],
      date: payment.date,
      description: payment.description,
      appointmentId: payment.appointmentId,
    });
    setEditOpen(true);
  }

  async function handleEditSubmit(values: PaymentFormValues) {
    const payload: PaymentInput = {
      amount: values.amount,
      category: values.category,
      date: values.date,
      description: values.description?.trim() || undefined,
      appointmentId: values.appointmentId || null,
    };
    const res = await updatePatientPaymentAction(paymentId, payload);
    if (res.success) {
      toast.success("تم تحديث الدفعة");
      setEditOpen(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  function handleDelete() {
    startDelete(async () => {
      const res = await deletePatientPaymentAction(paymentId);
      if (res.success) {
        toast.success("تم حذف الدفعة");
        router.push(`/dashboard/patients/${patientId}?tab=payments`);
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الدفعة</DialogTitle>
            <DialogDescription>
              حدّث بيانات الدفعة ثم اضغط حفظ.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-payment-amount">المبلغ</Label>
                <Input
                  id="edit-payment-amount"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  dir="ltr"
                  {...form.register("amount", { valueAsNumber: true })}
                  aria-invalid={!!form.formState.errors.amount}
                />
                {form.formState.errors.amount && (
                  <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-payment-date">التاريخ</Label>
                <Input
                  id="edit-payment-date"
                  type="date"
                  dir="ltr"
                  {...form.register("date")}
                  aria-invalid={!!form.formState.errors.date}
                />
                {form.formState.errors.date && (
                  <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>الفئة</Label>
              <Select
                value={categoryValue}
                onValueChange={(v) =>
                  form.setValue("category", v as PaymentFormValues["category"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PATIENT_PAYMENT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_META[c].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-payment-description">الوصف (اختياري)</Label>
              <Textarea
                id="edit-payment-description"
                rows={2}
                placeholder="ملاحظات إضافية..."
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
            <AlertDialogTitle>حذف الدفعة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الدفعة؟ لا يمكن التراجع.
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
