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
import { deleteVisitNoteAction } from "../actions";
import { VisitNoteInvoice } from "@/components/dashboard/patients/visit-notes/VisitNoteInvoice";
import { VisitNoteFormDialog } from "@/components/dashboard/patients/visit-notes/VisitNoteFormDialog";

interface VisitNoteDetailActionsProps {
  visitNoteId: string;
  patientId: string;
  patientName: string;
  clinicName: string;
  note: {
    id: string;
    content: string | null;
    diagnosis: string | null;
    notes: string | null;
    validityDays: number | null;
    createdAt: string;
    medications: {
      id: string;
      name: string;
      dose: string | null;
      frequency: string | null;
      duration: string | null;
      instructions: string | null;
    }[];
    appointmentId: string | null;
  };
}

export function VisitNoteDetailActions({
  visitNoteId,
  patientId,
  patientName,
  clinicName,
  note,
}: VisitNoteDetailActionsProps) {
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
      const res = await deleteVisitNoteAction(visitNoteId);
      if (res.success) {
        toast.success("تم حذف ملاحظة الزيارة");
        router.push(`/dashboard/patients/${patientId}?tab=visits`);
      } else {
        toast.error(res.error);
        setDeleteOpen(false);
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <VisitNoteInvoice
          note={{
            id: note.id,
            createdAt: note.createdAt,
            content: note.content,
            diagnosis: note.diagnosis,
            notes: note.notes,
            validityDays: note.validityDays,
            medications: note.medications,
          }}
          patientName={patientName}
          clinicName={clinicName}
          iconOnly
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

      <VisitNoteFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        patientId={patientId}
        editingId={visitNoteId}
        editingData={{
          appointmentId: note.appointmentId,
          content: note.content,
          diagnosis: note.diagnosis,
          medications: note.medications,
          notes: note.notes,
          validityDays: note.validityDays,
        }}
        onSaved={handleSaved}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف ملاحظة الزيارة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع.
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
