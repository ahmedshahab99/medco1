"use client";

import React from "react";
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
import { useDeletePatient } from "@/hooks/use-patients";

interface DeletePatientDialogProps {
  patientId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeletePatientDialog({
  patientId,
  patientName,
  isOpen,
  onClose,
  onDeleted,
}: DeletePatientDialogProps) {
  const deletePatient = useDeletePatient();

  async function handleDelete() {
    await deletePatient.mutateAsync(patientId);
    onDeleted();
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>حذف المريض</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من حذف المريض &quot;{patientName}&quot;؟ سيتم حذف جميع البيانات المرتبطة بما في ذلك الموعدات والحالات الطبية والسجلات. لا يمكن التراجع عن هذا الإجراء.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePatient.isPending}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deletePatient.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deletePatient.isPending ? "جاري الحذف..." : "حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
