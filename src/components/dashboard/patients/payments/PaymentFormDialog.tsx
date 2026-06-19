"use client";

import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertCircle } from "lucide-react";
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
  PATIENT_PAYMENT_CATEGORIES,
  type PatientAppointmentOption,
  type PatientPaymentCategory,
  type PaymentInput,
  type ServiceOption,
} from "@/lib/types/payments";
import {
  createPatientPaymentAction,
  updatePatientPaymentAction,
  getClinicServicesAction,
  getPatientAppointmentsAction,
} from "@/app/dashboard/patients/[id]/payments/actions";
import { formatDate, formatCurrency } from "@/lib/date-utils";

const paymentFormSchema = z.object({
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  category: z.enum(["CONSULTATION", "MEDICATIONS", "SERVICES", "OTHER"]),
  date: z.string().min(1, "التاريخ مطلوب"),
  description: z.string().max(500, "الوصف طويل جداً").optional(),
  appointmentId: z.string().nullable().optional(),
  serviceId: z.string().nullable().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

const CATEGORY_META: Record<
  PatientPaymentCategory,
  { label: string }
> = {
  CONSULTATION: { label: "كشف" },
  MEDICATIONS: { label: "أدوية" },
  SERVICES: { label: "خدمات" },
  OTHER: { label: "أخرى" },
};

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

interface EditingPaymentData {
  amount: number;
  category: string;
  date: string;
  description?: string | null;
  appointmentId: string | null;
  serviceId: string | null;
}

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  editingId: string | null;
  editingData: EditingPaymentData | null;
  onSaved: () => void;
}

export function PaymentFormDialog({
  open,
  onOpenChange,
  patientId,
  editingId,
  editingData,
  onSaved,
}: PaymentFormDialogProps) {
  const [appointments, setAppointments] = useState<PatientAppointmentOption[]>([]);
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(false);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: 0,
      category: "CONSULTATION",
      date: todayIso(),
      description: "",
      appointmentId: null,
      serviceId: null,
    },
  });

  useEffect(() => {
    if (!open) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setIsAppointmentsLoading(true);
    setIsServicesLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    getPatientAppointmentsAction(patientId)
      .then((res) => {
        if (res.success) setAppointments(res.data);
      })
      .finally(() => setIsAppointmentsLoading(false));
    getClinicServicesAction()
      .then((res) => {
        if (res.success) setServices(res.data);
      })
      .finally(() => setIsServicesLoading(false));

    if (editingData) {
      form.reset({
        amount: editingData.amount,
        category: editingData.category as PaymentFormValues["category"],
        date: editingData.date,
        description: editingData.description ?? "",
        appointmentId: editingData.appointmentId,
        serviceId: editingData.serviceId,
      });
    } else {
      form.reset({
        amount: 0,
        category: "CONSULTATION",
        date: todayIso(),
        description: "",
        appointmentId: null,
        serviceId: null,
      });
    }
  }, [open, editingData, patientId, form]);

  async function onSubmit(values: PaymentFormValues) {
    const payload: PaymentInput = {
      amount: values.amount,
      category: values.category,
      date: values.date,
      description: values.description?.trim() || undefined,
      appointmentId: values.appointmentId || null,
      serviceId: values.serviceId || null,
    };
    const res = editingId
      ? await updatePatientPaymentAction(editingId, payload)
      : await createPatientPaymentAction(patientId, payload);

    if (res.success) {
      toast.success(editingId ? "تم تحديث الدفعة" : "تم تسجيل الدفعة");
      onSaved();
    } else {
      toast.error(res.error);
    }
  }

  const appointmentId = useWatch({ control: form.control, name: "appointmentId" });
  const categoryValue = useWatch({ control: form.control, name: "category" });
  const serviceIdValue = useWatch({ control: form.control, name: "serviceId" });
  const appointmentValue = appointmentId ?? "none";
  const serviceValue = serviceIdValue ?? "none";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md font-sans">
        <DialogHeader>
          <DialogTitle>{editingId ? "تعديل الدفعة" : "تسجيل دفعة جديدة"}</DialogTitle>
          <DialogDescription>
            {editingId
              ? "حدّث بيانات الدفعة ثم اضغط حفظ."
              : "أدخل تفاصيل الدفعة الجديدة لهذا المريض."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="payment-amount">المبلغ</Label>
              <Input
                id="payment-amount"
                type="number"
                step="any"
                inputMode="decimal"
                dir="ltr"
                placeholder="0"
                {...form.register("amount", { valueAsNumber: true })}
                aria-invalid={!!form.formState.errors.amount}
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payment-date">التاريخ</Label>
              <Input
                id="payment-date"
                type="date"
                dir="ltr"
                {...form.register("date")}
                aria-invalid={!!form.formState.errors.date}
              />
              {form.formState.errors.date && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>الفئة</Label>
            <Select
              value={categoryValue}
              onValueChange={(v) =>
                form.setValue("category", v as PatientPaymentCategory, {
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

          {categoryValue === "SERVICES" && (
            <div className="space-y-1.5">
              <Label>الخدمة</Label>
              <Select
                value={serviceValue}
                onValueChange={(v) => {
                  const serviceId = v === "none" ? null : v;
                  form.setValue("serviceId", serviceId, { shouldValidate: true });
                  if (serviceId) {
                    const svc = services.find((s) => s.id === serviceId);
                    if (svc?.price != null) {
                      form.setValue("amount", svc.price, { shouldValidate: true });
                    }
                  }
                }}
                disabled={isServicesLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={isServicesLoading ? "جاري التحميل..." : "اختر الخدمة"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">اختر الخدمة</SelectItem>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                      {s.price != null ? ` · ${formatCurrency(s.price)}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>الموعد (اختياري)</Label>
            <Select
              value={appointmentValue}
              onValueChange={(v) =>
                form.setValue("appointmentId", v === "none" ? null : v, {
                  shouldValidate: true,
                })
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
            <Label htmlFor="payment-description">الوصف (اختياري)</Label>
            <Textarea
              id="payment-description"
              rows={2}
              placeholder="ملاحظات إضافية..."
              {...form.register("description")}
              aria-invalid={!!form.formState.errors.description}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {Object.keys(form.formState.errors).length > 0 && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 px-3 py-2 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5" />
              يرجى تصحيح الحقول المطلوبة قبل الحفظ
            </div>
          )}

          <DialogFooter className="-mx-4 -mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.formState.isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? "حفظ التعديلات" : "تسجيل الدفعة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


