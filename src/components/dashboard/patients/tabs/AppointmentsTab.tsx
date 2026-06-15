"use client";

import React, { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Calendar,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  APPOINTMENT_STATUSES,
  type AppointmentStatus,
  type PatientAppointmentRow,
  type PatientAppointmentSummary,
} from "@/lib/types/appointments";
import {
  deletePatientAppointmentAction,
  listPatientAppointmentsAction,
  updatePatientAppointmentAction,
} from "@/app/dashboard/patients/[id]/appointments/actions";

const appointmentFormSchema = z.object({
  status: z
    .enum(["BOOKING", "WAITING", "SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"])
    .optional(),
  notes: z.string().max(1000, "الملاحظات طويلة جداً").optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

const APPOINTMENT_WRITE_ROLES = ["ADMIN", "DOCTOR", "RECEPTIONIST"] as const;

const STATUS_META: Record<string, { label: string; badge: string }> = {
  BOOKING: { label: "حجز", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  WAITING: { label: "انتظار", badge: "bg-orange-50 text-orange-700 border-orange-200" },
  SCHEDULED: { label: "مجدول", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  CONFIRMED: { label: "مؤكد", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  IN_PROGRESS: { label: "قيد التنفيذ", badge: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  COMPLETED: { label: "مكتمل", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "ملغي", badge: "bg-red-50 text-red-700 border-red-200" },
  NO_SHOW: { label: "لم يحضر", badge: "bg-slate-50 text-slate-500 border-slate-200" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-IQ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ar-IQ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface AppointmentsTabProps {
  patientId: string;
}

export function AppointmentsTab({ patientId }: AppointmentsTabProps) {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const canManage = useMemo(
    () => role !== undefined && (APPOINTMENT_WRITE_ROLES as readonly string[]).includes(role),
    [role]
  );

  const [appointments, setAppointments] = useState<PatientAppointmentRow[]>([]);
  const [summary, setSummary] = useState<PatientAppointmentSummary>({ count: 0, upcomingCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<PatientAppointmentRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [, startRefresh] = useTransition();

  const refresh = useCallback(async () => {
    const res = await listPatientAppointmentsAction(patientId);
    if (res.success) {
      setAppointments(res.data.appointments);
      setSummary(res.data.summary);
    } else {
      toast.error(res.error);
    }
  }, [patientId]);

  useEffect(() => {
    let cancelled = false;
    listPatientAppointmentsAction(patientId)
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          setAppointments(res.data.appointments);
          setSummary(res.data.summary);
        } else {
          toast.error(res.error);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  function openEdit(row: PatientAppointmentRow) {
    setEditingRow(row);
    setDialogOpen(true);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startDeleteTransition(async () => {
      const res = await deletePatientAppointmentAction(deleteTarget);
      if (res.success) {
        toast.success("تم حذف الموعد");
        setDeleteTarget(null);
        await refresh();
      } else {
        toast.error(res.error);
        setDeleteTarget(null);
      }
    });
  }

  function handleSaved() {
    setDialogOpen(false);
    setEditingRow(null);
    startRefresh(async () => {
      await refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            المواعيد
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {summary.count > 0
              ? `${summary.count} موعد · ${summary.upcomingCount} قادم`
              : "لا توجد مواعيد مسجّلة"}
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/calendar")}
          size="sm"
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          حجز موعد
        </Button>
      </div>

      {isLoading ? (
        <AppointmentsSkeleton />
      ) : appointments.length === 0 ? (
        <AppointmentsEmpty />
      ) : (
        <AppointmentsTable
          appointments={appointments}
          canManage={canManage}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          onView={(id) => router.push(`/dashboard/patients/${patientId}/appointments/${id}`)}
        />
      )}

      <AppointmentFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingRow(null);
        }}
        editingId={editingRow?.id ?? null}
        editingRow={editingRow}
        onSaved={handleSaved}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
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
    </div>
  );
}

function AppointmentsSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

function AppointmentsEmpty() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3 border border-blue-100">
        <Calendar className="w-6 h-6 text-blue-300" />
      </div>
      <p className="text-sm font-medium text-slate-600">لا توجد مواعيد مسجّلة</p>
      <p className="text-xs text-slate-400 mt-1">
        يمكنك حجز موعد من خلال التقويم.
      </p>
    </div>
  );
}

function AppointmentsTable({
  appointments,
  canManage,
  onEdit,
  onDelete,
  onView,
}: {
  appointments: PatientAppointmentRow[];
  canManage: boolean;
  onEdit: (row: PatientAppointmentRow) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-start">التاريخ والوقت</TableHead>
            <TableHead className="text-start">الخدمة</TableHead>
            <TableHead className="text-start">الطبيب</TableHead>
            <TableHead className="text-start">الحالة</TableHead>
            <TableHead className="text-start w-28">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((a) => {
            const statusMeta = STATUS_META[a.status] ?? { label: a.status, badge: "bg-slate-50 text-slate-600 border-slate-200" };
            return (
              <TableRow key={a.id} onClick={() => onView(a.id)} className="cursor-pointer">
                <TableCell className="text-slate-600 text-sm whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(a.startTime)}
                  </span>
                  <br />
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(a.startTime)} - {formatTime(a.endTime)}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-slate-800 text-sm">
                  <span className="truncate max-w-[150px] block">{a.serviceName}</span>
                </TableCell>
                <TableCell className="text-slate-600 text-xs">
                  {a.doctorName}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${statusMeta.badge}`}
                  >
                    {statusMeta.label}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    {canManage && (
                      <>
                        <button
                          onClick={() => onEdit(a)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="تعديل"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(a.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function AppointmentFormDialog({
  open,
  onOpenChange,
  editingId,
  editingRow,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  editingRow: PatientAppointmentRow | null;
  onSaved: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      status: undefined,
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (editingRow) {
      form.reset({
        status: editingRow.status,
        notes: editingRow.notes ?? "",
      });
    } else {
      form.reset({
        status: undefined,
        notes: "",
      });
    }
  }, [open, editingRow, form]);

  async function onSubmit(values: AppointmentFormValues) {
    if (!editingId) return;
    setIsSubmitting(true);
    const res = await updatePatientAppointmentAction(editingId, {
      status: values.status,
      notes: values.notes?.trim() || undefined,
    });
    setIsSubmitting(false);
    if (res.success) {
      toast.success("تم تحديث الموعد");
      onSaved();
    } else {
      toast.error(res.error);
    }
  }

  const statusValue = form.watch("status") ?? "none";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md font-sans">
        <DialogHeader>
          <DialogTitle>تعديل الموعد</DialogTitle>
          <DialogDescription>
            حدّث حالة الموعد واضغط حفظ.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <Label htmlFor="apt-notes">الملاحظات (اختياري)</Label>
            <Textarea
              id="apt-notes"
              rows={3}
              placeholder="ملاحظات حول الموعد..."
              {...form.register("notes")}
              aria-invalid={!!form.formState.errors.notes}
            />
            {form.formState.errors.notes && (
              <p className="text-xs text-destructive">
                {form.formState.errors.notes.message}
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
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
