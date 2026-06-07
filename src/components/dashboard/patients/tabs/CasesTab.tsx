"use client";

import React, { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Heart,
  Plus,
  Loader2,
  Calendar,
  Pencil,
  Trash2,
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
  CASE_STATUSES,
  type CaseStatus,
  type PatientCaseRow,
  type PatientCaseSummary,
} from "@/lib/types/cases";
import {
  createPatientCaseAction,
  deletePatientCaseAction,
  listPatientCasesAction,
  updatePatientCaseAction,
} from "@/app/dashboard/patients/[id]/cases/actions";

const caseFormSchema = z.object({
  title: z.string().min(1, "عنوان الحالة مطلوب").max(200, "العنوان طويل جداً"),
  description: z.string().max(1000, "الوصف طويل جداً").optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type CaseFormValues = z.infer<typeof caseFormSchema>;

const CASE_WRITE_ROLES = ["ADMIN", "DOCTOR", "RECEPTIONIST"] as const;

const STATUS_META: Record<CaseStatus, { label: string; badge: string }> = {
  ACTIVE: {
    label: "نشطة",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  INACTIVE: {
    label: "غير نشطة",
    badge: "bg-slate-50 text-slate-500 border-slate-200",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-IQ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface CasesTabProps {
  patientId: string;
}

export function CasesTab({ patientId }: CasesTabProps) {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const canManage = useMemo(
    () => role !== undefined && (CASE_WRITE_ROLES as readonly string[]).includes(role),
    [role]
  );

  const [cases, setCases] = useState<PatientCaseRow[]>([]);
  const [summary, setSummary] = useState<PatientCaseSummary>({ count: 0, activeCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<PatientCaseRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [, startRefresh] = useTransition();

  const refresh = useCallback(async () => {
    const res = await listPatientCasesAction(patientId);
    if (res.success) {
      setCases(res.data.cases);
      setSummary(res.data.summary);
    } else {
      toast.error(res.error);
    }
  }, [patientId]);

  useEffect(() => {
    let cancelled = false;
    listPatientCasesAction(patientId)
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          setCases(res.data.cases);
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

  function openCreate() {
    setEditingRow(null);
    setDialogOpen(true);
  }

  function openEdit(row: PatientCaseRow) {
    setEditingRow(row);
    setDialogOpen(true);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startDeleteTransition(async () => {
      const res = await deletePatientCaseAction(deleteTarget);
      if (res.success) {
        toast.success("تم حذف الحالة");
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
            <Heart className="w-5 h-5 text-amber-600" />
            الحالات الطبية
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {summary.count > 0
              ? `${summary.count} حالة · ${summary.activeCount} نشطة`
              : "لا توجد حالات طبية مسجّلة"}
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            إضافة حالة
          </Button>
        )}
      </div>

      {isLoading ? (
        <CasesSkeleton />
      ) : cases.length === 0 ? (
        <CasesEmpty canManage={canManage} onCreate={openCreate} />
      ) : (
        <CasesTable
          cases={cases}
          canManage={canManage}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          onView={(id) => router.push(`/dashboard/patients/${patientId}/cases/${id}`)}
        />
      )}

      <CaseFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingRow(null);
        }}
        patientId={patientId}
        editingId={editingRow?.id ?? null}
        editingRow={editingRow}
        onSaved={handleSaved}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
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
    </div>
  );
}

function CasesSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

function CasesEmpty({ canManage, onCreate }: { canManage: boolean; onCreate: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3 border border-amber-100">
        <Heart className="w-6 h-6 text-amber-300" />
      </div>
      <p className="text-sm font-medium text-slate-600">لا توجد حالات طبية مسجّلة</p>
      <p className="text-xs text-slate-400 mt-1">
        {canManage
          ? "ابدأ بإضافة أول حالة طبية لهذا المريض."
          : "ستظهر الحالات الطبية المسجّلة للمريض هنا."}
      </p>
      {canManage && (
        <Button onClick={onCreate} variant="outline" size="sm" className="mt-4 gap-1.5">
          <Plus className="w-4 h-4" />
          إضافة حالة
        </Button>
      )}
    </div>
  );
}

function CasesTable({
  cases,
  canManage,
  onEdit,
  onDelete,
  onView,
}: {
  cases: PatientCaseRow[];
  canManage: boolean;
  onEdit: (row: PatientCaseRow) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-start">عنوان الحالة</TableHead>
            <TableHead className="text-start">الحالة</TableHead>
            <TableHead className="text-start">المواعيد</TableHead>
            <TableHead className="text-start">تاريخ الإنشاء</TableHead>
            <TableHead className="text-start w-28">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((c) => {
            const meta = STATUS_META[c.status];
            return (
              <TableRow key={c.id} onClick={() => onView(c.id)} className="cursor-pointer">
                <TableCell className="text-slate-800 text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                      <Stethoscope className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="truncate max-w-[220px]">{c.title}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-bold ${meta.badge}`}
                  >
                    {meta.label}
                  </span>
                </TableCell>
                <TableCell className="text-slate-600 text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {c.appointmentCount} موعد
                  </span>
                </TableCell>
                <TableCell className="text-slate-500 text-xs whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(c.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    {canManage && (
                      <>
                        <button
                          onClick={() => onEdit(c)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="تعديل"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(c.id)}
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

function CaseFormDialog({
  open,
  onOpenChange,
  patientId,
  editingId,
  editingRow,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  editingId: string | null;
  editingRow: PatientCaseRow | null;
  onSaved: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (editingRow) {
      form.reset({
        title: editingRow.title,
        description: editingRow.description ?? "",
        status: editingRow.status,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        status: "ACTIVE",
      });
    }
  }, [open, editingRow, form]);

  async function onSubmit(values: CaseFormValues) {
    setIsSubmitting(true);
    const payload = {
      title: values.title,
      description: values.description?.trim() || undefined,
      status: values.status,
    };
    const res = editingId
      ? await updatePatientCaseAction(editingId, payload)
      : await createPatientCaseAction(patientId, payload);

    setIsSubmitting(false);
    if (res.success) {
      toast.success(editingId ? "تم تحديث الحالة" : "تم إضافة الحالة");
      onSaved();
    } else {
      toast.error(res.error);
    }
  }

  const statusValue = form.watch("status");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md font-sans">
        <DialogHeader>
          <DialogTitle>{editingId ? "تعديل الحالة" : "إضافة حالة جديدة"}</DialogTitle>
          <DialogDescription>
            {editingId
              ? "حدّث بيانات الحالة ثم اضغط حفظ."
              : "أدخل تفاصيل الحالة الطبية الجديدة."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="case-title">عنوان الحالة</Label>
            <Input
              id="case-title"
              placeholder="مثال: التهاب اللوزتين المزمن"
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
            <Label htmlFor="case-description">الوصف (اختياري)</Label>
            <Textarea
              id="case-description"
              rows={3}
              placeholder="تفاصيل الحالة الطبية..."
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
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? "حفظ التعديلات" : "إضافة الحالة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
