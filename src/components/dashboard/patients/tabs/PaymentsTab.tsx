"use client";

import React, { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Plus,
  Loader2,
  Calendar,
  Receipt,
  Stethoscope,
  Syringe,
  Wrench,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
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
  type PatientPaymentCategory,
  type PatientPaymentRow,
  type PatientPaymentSummary,
} from "@/lib/types/payments";
import {
  deletePatientPaymentAction,
  listPatientPaymentsAction,
} from "@/app/dashboard/patients/[id]/payments/actions";
import { PaymentInvoice } from "@/components/dashboard/patients/payments/PaymentInvoice";
import { PaymentFormDialog } from "@/components/dashboard/patients/payments/PaymentFormDialog";

const CATEGORY_META: Record<
  PatientPaymentCategory,
  { label: string; icon: React.ElementType; badge: string }
> = {
  CONSULTATION: {
    label: "كشف",
    icon: Stethoscope,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  MEDICATIONS: {
    label: "أدوية",
    icon: Syringe,
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  SERVICES: {
    label: "خدمات",
    icon: Receipt,
    badge: "bg-violet-50 text-violet-700 border-violet-200",
  },
  OTHER: {
    label: "أخرى",
    icon: Wrench,
    badge: "bg-slate-50 text-slate-700 border-slate-200",
  },
};

const PAYMENT_WRITE_ROLES = ["ADMIN", "DOCTOR", "RECEPTIONIST"] as const;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ar-IQ", { maximumFractionDigits: 0 }).format(amount) + " د.ع";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-IQ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface PaymentsTabProps {
  patientId: string;
}

export function PaymentsTab({ patientId }: PaymentsTabProps) {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const canManage = useMemo(
    () => role !== undefined && (PAYMENT_WRITE_ROLES as readonly string[]).includes(role),
    [role]
  );

  const [payments, setPayments] = useState<PatientPaymentRow[]>([]);
  const [summary, setSummary] = useState<PatientPaymentSummary>({
    totalPaid: 0,
    count: 0,
    lastPaymentAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<PatientPaymentRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [, startRefresh] = useTransition();

  const refresh = useCallback(async () => {
    const res = await listPatientPaymentsAction(patientId);
    if (res.success) {
      setPayments(res.data.payments);
      setSummary(res.data.summary);
    } else {
      toast.error(res.error);
    }
  }, [patientId]);

  useEffect(() => {
    let cancelled = false;
    listPatientPaymentsAction(patientId)
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          setPayments(res.data.payments);
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

  function openEdit(row: PatientPaymentRow) {
    setEditingRow(row);
    setDialogOpen(true);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startDeleteTransition(async () => {
      const res = await deletePatientPaymentAction(deleteTarget);
      if (res.success) {
        toast.success("تم حذف الدفعة");
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
            <Wallet className="w-5 h-5 text-emerald-600" />
            المدفوعات
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {summary.count > 0
              ? `${summary.count} دفعة · إجمالي ${formatCurrency(summary.totalPaid)}`
              : "لا توجد مدفوعات مسجّلة"}
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            تسجيل دفعة
          </Button>
        )}
      </div>

      {isLoading ? (
        <PaymentsSkeleton />
      ) : payments.length === 0 ? (
        <PaymentsEmpty canManage={canManage} onCreate={openCreate} />
      ) : (
        <PaymentsTable
          payments={payments}
          canManage={canManage}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          onView={(id) => router.push(`/dashboard/patients/${patientId}/payments/${id}`)}
        />
      )}

      <PaymentFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingRow(null);
        }}
        patientId={patientId}
        editingId={editingRow?.id ?? null}
        editingData={
          editingRow
            ? {
                amount: editingRow.amount,
                category: editingRow.category,
                date: editingRow.date.split("T")[0],
                description: editingRow.description,
                appointmentId: editingRow.appointmentId,
                serviceId: editingRow.serviceId,
              }
            : null
        }
        onSaved={handleSaved}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
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
    </div>
  );
}

function PaymentsSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

function PaymentsEmpty({ canManage, onCreate }: { canManage: boolean; onCreate: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
        <Wallet className="w-6 h-6 text-emerald-300" />
      </div>
      <p className="text-sm font-medium text-slate-600">لا توجد مدفوعات مسجّلة</p>
      <p className="text-xs text-slate-400 mt-1">
        {canManage
          ? "ابدأ بتسجيل أول دفعة لهذا المريض."
          : "ستظهر المدفوعات المسجّلة للمريض هنا."}
      </p>
      {canManage && (
        <Button onClick={onCreate} variant="outline" size="sm" className="mt-4 gap-1.5">
          <Plus className="w-4 h-4" />
          تسجيل دفعة
        </Button>
      )}
    </div>
  );
}

function PaymentsTable({
  payments,
  canManage,
  onEdit,
  onDelete,
  onView,
}: {
  payments: PatientPaymentRow[];
  canManage: boolean;
  onEdit: (row: PatientPaymentRow) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-start">التاريخ</TableHead>
            <TableHead className="text-start">الفئة</TableHead>
            <TableHead className="text-start">المبلغ</TableHead>
            <TableHead className="text-start">الموعد</TableHead>
            <TableHead className="text-start">الوصف</TableHead>
            <TableHead className="text-start w-28">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((p) => {
            const meta = CATEGORY_META[p.category];
            const Icon = meta.icon;
            return (
              <TableRow key={p.id} >
                <TableCell onClick={() => onView(p.id)}  className="text-slate-600 text-sm whitespace-nowrap cursor-pointer ">
                  
                  <span className="inline-flex items-center gap-1.5 underline">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(p.date)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-bold ${meta.badge}`}
                  >
                    <Icon className="w-3 h-3" />
                    {meta.label}
                  </span>
                </TableCell>
                <TableCell className="font-bold text-emerald-700 text-sm">
                  {formatCurrency(p.amount)}
                </TableCell>
                <TableCell className="text-slate-600 text-xs">
                  {p.appointment ? (
                    <span className="line-clamp-1">
                      {p.appointment.service?.name ?? "موعد"}{" "}
                      <span className="text-slate-400">
                        · {formatDate(p.appointment.startTime)}
                      </span>
                    </span>
                  ) : p.service ? (
                    <span className="line-clamp-1">{p.service.name}</span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </TableCell>
                <TableCell className="text-slate-500 text-xs max-w-[200px]">
                  <span className="line-clamp-1">{p.description || "—"}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5">
                    <PaymentInvoice
                      patientName={p.patientName}
                      tenantName={p.tenantName}
                      iconOnly
                      payment={{
                        id: p.id,
                        amount: p.amount,
                        category: p.category,
                        date: p.date.split("T")[0],
                        description: p.description ?? "",
                        serviceName: p.service?.name ?? null,
                        createdAt: p.createdAt,
                        updatedAt: p.updatedAt,
                      }}
                    />
                    {canManage && (
                      <>
                        <button
                          onClick={() => onEdit(p)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="تعديل"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(p.id)}
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

