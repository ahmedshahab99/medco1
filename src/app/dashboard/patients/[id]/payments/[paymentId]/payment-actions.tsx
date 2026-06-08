"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
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
  deletePatientPaymentAction,
} from "../actions";
import { PaymentInvoice } from "@/components/dashboard/patients/payments/PaymentInvoice";
import { PaymentFormDialog } from "@/components/dashboard/patients/payments/PaymentFormDialog";

interface PaymentDetailActionsProps {
  paymentId: string;
  patientId: string;
  patientName: string;
  tenantName: string;
  payment: {
    amount: number;
    category: string;
    date: string;
    description: string;
    appointmentId: string | null;
    serviceName: string | null;
    serviceId: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export function PaymentDetailActions({
  paymentId,
  patientId,
  patientName,
  tenantName,
  payment,
}: PaymentDetailActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  function handleSaved() {
    setEditOpen(false);
    router.refresh();
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
        <PaymentInvoice
          patientName={patientName}
          tenantName={tenantName}
          payment={{
            id: paymentId,
            amount: payment.amount,
            category: payment.category,
            date: payment.date,
            description: payment.description,
            serviceName: payment.serviceName,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
          }}
        />
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5">
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

      <PaymentFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        patientId={patientId}
        editingId={paymentId}
        editingData={{
          amount: payment.amount,
          category: payment.category,
          date: payment.date,
          description: payment.description,
          appointmentId: payment.appointmentId,
          serviceId: payment.serviceId,
        }}
        onSaved={handleSaved}
      />

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
