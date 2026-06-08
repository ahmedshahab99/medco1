"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  XCircle,
  Calendar as CalendarIcon,
  Clock,
  Edit2,
  Plus,
  RotateCcw,
  Trash2,
  User,
  Wallet,
  Receipt,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale/ar-SA";
import { toast } from "sonner";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import type { CalendarAppointment } from "@/hooks/use-appointments";
import type { AppointmentPatchInput } from "@/lib/schemas/appointment";
import {
  appointmentPaymentSchema,
  type AppointmentPaymentInput,
} from "@/lib/schemas/appointment-payment";
import { recordAppointmentPaymentAction } from "./actions";
import { STATUS_MAP } from "./utils";

interface AppointmentDetailModalProps {
  appointment: CalendarAppointment | null;
  onClose: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  onStatusChange: (id: string, status: AppointmentPatchInput["status"]) => void;
  onDelete: (id: string) => void;
  onBookAnother: (appt: CalendarAppointment) => void;
  onReschedule: (appt: CalendarAppointment) => void;
}

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function formatDisplayDate(iso: string) {
  return format(new Date(iso), "EEEE، d MMMM yyyy", { locale: arSA });
}

export default function AppointmentDetailModal({
  appointment,
  onClose,
  isUpdating,
  isDeleting,
  onStatusChange,
  onDelete,
  onBookAnother,
  onReschedule,
}: AppointmentDetailModalProps) {
  const [panel, setPanel] = useState<"none" | "payment" | "notes" | "reschedule">("none");
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isPaymentSubmitting, startPaymentSubmit] = useTransition();
  const [localHasTransactions, setLocalHasTransactions] = useState(false);

  useEffect(() => {
    if (appointment) {
      setPanel("none");
      setLocalHasTransactions(appointment.hasTransactions);
    }
  }, [appointment]);

  if (!appointment) return null;

  const statusMeta = STATUS_MAP[appointment.status] ?? STATUS_MAP.SCHEDULED;
  const StatusIcon = statusMeta.icon;

  return (
    <>
    <Modal isOpen={!!appointment} onClose={onClose} hideHeader width="max-w-2xl w-[95%] md:w-full">
      <div className="flex flex-col shadow-2xl rounded-2xl overflow-hidden bg-white">
        {/* Header */}
        <div
          className={`p-4 md:p-6 border-b text-white ${
            appointment.serviceColor.startsWith("#") || appointment.serviceColor.startsWith("rgb")
              ? ""
              : appointment.serviceColor
          }`}
          style={
            appointment.serviceColor.startsWith("#") || appointment.serviceColor.startsWith("rgb")
              ? { backgroundColor: appointment.serviceColor }
              : {}
          }
        >
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl md:text-2xl font-bold">{appointment.serviceName}</h2>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <XCircle className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg md:text-xl font-semibold opacity-95">{appointment.patientName}</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm font-medium opacity-90">
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                {formatDisplayDate(appointment.startTime)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                في {format(new Date(appointment.startTime), "hh:mm a", { locale: arSA })}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 bg-white min-h-[300px]">
          {/* Left column - info */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg md:text-xl font-bold text-slate-800 mb-1">{appointment.patientName}</h4>
              <div className="space-y-2.5 mt-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-blue-600">الحالة</span>
                  <span className={`inline-flex items-center gap-1.5 w-fit px-2 py-1 rounded-md text-xs font-bold ${statusMeta.badgeClass}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusMeta.label}
                  </span>
                </div>
                <div className="text-slate-600 text-sm font-medium">
                  الخدمة: {appointment.serviceName}
                </div>
                <div className="text-slate-600 text-sm font-medium">
                  <User className="w-3.5 h-3.5 inline ms-1" />
                  الطبيب: {appointment.doctorName}
                </div>
                {appointment.caseName && (
                  <div className="flex flex-col gap-0.5 mt-2">
                    <span className="text-sm font-semibold text-blue-600">الملف الطبي</span>
                    <span className="text-slate-700 font-medium">{appointment.caseName}</span>
                  </div>
                )}
                {appointment.notes && (
                  <div className="flex flex-col gap-0.5 mt-2">
                    <span className="text-sm font-semibold text-blue-600">ملاحظات</span>
                    <span className="text-slate-700 font-medium text-sm">{appointment.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column - controls */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className={`flex-1 gap-2 ${
                  appointment.status === "NO_SHOW"
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "text-slate-500 border-slate-200"
                }`}
                disabled={isUpdating}
                onClick={() => onStatusChange(appointment.id, "NO_SHOW")}
              >
                <XCircle className="w-4 h-4" />
                لم يحضر
              </Button>
            </div>

            {localHasTransactions ? (
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-50/50 rounded-xl p-4 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4" />
                    حالة الدفع
                  </span>
                  <span className="text-sm font-extrabold text-emerald-700">
                    مدفوع
                  </span>
                </div>
                {appointment.lastTransactionId && (
                  <Link
                    href={`/dashboard/patients/${appointment.patientId}/payments/${appointment.lastTransactionId}`}
                    className="mt-2 flex items-center justify-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg py-1.5 transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    عرض الدفعة
                  </Link>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-r from-amber-50 to-amber-50/50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-amber-800 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4" />
                    حالة الدفع
                  </span>
                  <span className="text-sm font-extrabold text-amber-700">
                    غير مدفوع
                  </span>
                </div>
                <button
                  onClick={() => setShowPaymentForm(true)}
                  disabled={isUpdating}
                  className="w-full px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all disabled:opacity-50 shadow-sm shadow-emerald-200"
                >
                  تسجيل الدفع
                </button>
              </div>
            )}

            <div>
              <Button
                variant="outline"
                className="w-full justify-between items-center text-slate-700 border-slate-200 h-11"
                onClick={() => setPanel((p) => (p === "notes" ? "none" : "notes"))}
              >
                <span className="flex items-center gap-2">ملاحظات العلاج</span>
                <Edit2 className="w-4 h-4 text-slate-400" />
              </Button>
              {panel === "notes" && (
                <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-sm text-slate-500">قيد التطوير</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#2D2431] p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 overflow-hidden shrink-0">
          <div className="flex bg-white/5 rounded-lg overflow-x-auto no-scrollbar border border-white/10 w-full md:w-auto">
            <button
              className="px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-white hover:bg-white/10 border-l border-white/10 flex items-center gap-2 whitespace-nowrap"
              onClick={() => onBookAnother(appointment)}
            >
              <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
              حجز آخر
            </button>
            <button
              className="px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-white hover:bg-white/10 border-l border-white/10 whitespace-nowrap"
              onClick={() => onReschedule(appointment)}
            >
              <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4 inline ms-1" />
              إعادة جدولة
            </button>

            <button
              className="px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-white hover:bg-white/10 whitespace-nowrap"
              disabled={isUpdating}
              onClick={() => onStatusChange(appointment.id, "CANCELLED")}
            >
              إلغاء
            </button>
          </div>

          <button
            className="flex items-center gap-2 text-slate-300 hover:text-white px-2 md:px-4 py-2 text-xs md:text-sm font-semibold transition-colors self-end md:self-auto"
            disabled={isDeleting}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
            حذف
          </button>
        </div>

        <div className="bg-slate-100 py-3 text-center">
          <p className="text-[11px] italic text-slate-500 font-medium">
            آخر تحديث: {format(new Date(appointment.updatedAt), "d MMM yyyy، hh:mm a", { locale: arSA })}
          </p>
        </div>
      </div>
    </Modal>

    <ConfirmDialog
      isOpen={isDeleteOpen}
      title="حذف الموعد"
      message="هل أنت متأكد من حذف هذا الموعد؟"
      confirmLabel="حذف"
      type="danger"
      onConfirm={() => {
        onDelete(appointment.id);
        setDeleteOpen(false);
      }}
      onCancel={() => setDeleteOpen(false)}
    />

    <PaymentFormDialog
      open={showPaymentForm}
      onOpenChange={setShowPaymentForm}
      appointment={appointment}
      isSubmitting={isPaymentSubmitting}
      onSubmit={async (input) => {
        startPaymentSubmit(async () => {
          const res = await recordAppointmentPaymentAction(appointment.id, input);
          if (res.success) {
            toast.success("تم تسجيل الدفعة بنجاح");
            setLocalHasTransactions(true);
            setShowPaymentForm(false);
          } else {
            toast.error(res.error ?? "فشل تسجيل الدفعة");
          }
        });
      }}
    />
    </>
  );
}

function PaymentFormDialog({
  open,
  onOpenChange,
  appointment,
  isSubmitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: CalendarAppointment;
  isSubmitting: boolean;
  onSubmit: (input: AppointmentPaymentInput) => void;
}) {
  const form = useForm<AppointmentPaymentInput>({
    resolver: zodResolver(appointmentPaymentSchema),
    defaultValues: {
      amount: appointment.servicePrice ?? 0,
      description: "",
      date: todayIso(),
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  useEffect(() => {
    if (open) {
      form.reset({
        amount: appointment.servicePrice ?? 0,
        description: "",
        date: todayIso(),
      });
    }
  }, [open, appointment.servicePrice, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md font-sans">
        <DialogHeader>
          <DialogTitle>تسجيل دفعة</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل الدفعة لهذا الموعد.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pmt-amount">المبلغ</Label>
              <Input
                id="pmt-amount"
                type="number"
                step="any"
                inputMode="decimal"
                dir="ltr"
                placeholder="0"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pmt-date">التاريخ</Label>
              <Input
                id="pmt-date"
                type="date"
                dir="ltr"
                {...register("date")}
              />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>الفئة</Label>
            <div className="flex items-center gap-2 h-10 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
              <Receipt className="w-4 h-4 text-violet-500 shrink-0" />
              <span>خدمات</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>الخدمة</Label>
            <div className="flex items-center h-10 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
              {appointment.serviceName}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>الموعد</Label>
            <div className="flex items-center h-10 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
              {appointment.patientName} · {formatDisplayDate(appointment.startTime)}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pmt-description">الوصف (اختياري)</Label>
            <Textarea
              id="pmt-description"
              rows={2}
              placeholder="ملاحظات إضافية..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

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
              تسجيل الدفعة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
