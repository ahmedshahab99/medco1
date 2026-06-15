"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Calendar, Pill, Loader2, Stethoscope, Pencil, ArrowUpRight } from "lucide-react";
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
import { toast } from "sonner";
import Link from "next/link";
import { VisitNoteFormDialog } from "@/components/dashboard/patients/visit-notes/VisitNoteFormDialog";
import { VisitNoteInvoice } from "@/components/dashboard/patients/visit-notes/VisitNoteInvoice";
import {
  listVisitNotesAction,
  deleteVisitNoteAction,
} from "@/app/dashboard/patients/[id]/visit-notes/actions";
import type { VisitNoteRow } from "@/app/dashboard/patients/[id]/visit-notes/actions";

interface VisitNoteTabProps {
  patientId: string;
  patientName: string;
}

interface ClinicInfo {
  name: string;
  specialty: string | null;
  phone: string | null;
  address: string | null;
}

export function VisitNoteTab({ patientId, patientName }: VisitNoteTabProps) {
  const [visitNotes, setVisitNotes] = useState<VisitNoteRow[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<{
    appointmentId: string | null;
    content: string | null;
    diagnosis: string | null;
    medications: { id: string; name: string; dose: string; frequency: string; duration: string; instructions: string | null }[];
    notes: string | null;
    validityDays: number | null;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [doctorName, setDoctorName] = useState("");

  const loadVisitNotes = useCallback(async () => {
    try {
      setIsLoadingNotes(true);
      const res = await listVisitNotesAction(patientId);
      if (res.success) {
        setVisitNotes(res.data);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("فشل تحميل ملاحظات الزيارة");
    } finally {
      setIsLoadingNotes(false);
    }
  }, [patientId]);

  const loadClinicInfo = useCallback(async () => {
    try {
      const [tenantRes, doctorsRes] = await Promise.all([
        fetch("/api/tenant"),
        fetch("/api/doctors"),
      ]);
      if (tenantRes.ok) {
        const tenant = await tenantRes.json();
        setClinicInfo({
          name: tenant.name,
          specialty: tenant.specialty,
          phone: tenant.phone,
          address: tenant.address,
        });
      }
      if (doctorsRes.ok) {
        const doctors = await doctorsRes.json();
        if (doctors.length > 0) {
          setDoctorName(doctors[0].name);
        }
      }
    } catch {
      // Silent fail
    }
  }, []);

  useEffect(() => {
    loadVisitNotes();
    loadClinicInfo();
  }, [loadVisitNotes, loadClinicInfo]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setEditingData(null);
    setShowForm(true);
  };

  const handleOpenEdit = (note: VisitNoteRow) => {
    setEditingId(note.id);
    setEditingData({
      appointmentId: note.appointmentId,
      content: note.content,
      diagnosis: note.diagnosis,
      medications: note.medications,
      notes: note.notes,
      validityDays: note.validityDays,
    });
    setShowForm(true);
  };

  const handleFormSaved = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setEditingData(null);
    loadVisitNotes();
  }, [loadVisitNotes]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await deleteVisitNoteAction(deleteTarget);
      if (res.success) {
        toast.success("تم حذف ملاحظة الزيارة بنجاح");
        setDeleteTarget(null);
        loadVisitNotes();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("فشل حذف الملاحظة");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("ar-SA");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-600" />
            ملاحظات الزيارة
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {visitNotes.length} ملاحظة مسجّلة
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2" size="sm">
          <Plus className="w-4 h-4" />
          ملاحظة جديدة
        </Button>
      </div>

      {isLoadingNotes ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : visitNotes.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Stethoscope className="w-12 h-12 mx-auto mb-2 opacity-40" />
          <p>لا توجد ملاحظات زيارة مسجّلة</p>
          <p className="text-sm mt-1">
            أنشئ ملاحظة جديدة لتوثيق الزيارة وتشخيص المريض ووصف الأدوية
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visitNotes.map((note) => (
            <div
              key={note.id}
              dir="rtl"
              className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-sm"
            >
              <div className="bg-emerald-700 px-5 py-3 flex items-center justify-between gap-3 text-right">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="bg-white/20 rounded-full p-1.5 shrink-0">
                    <Stethoscope className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/patients/${patientId}/visit-notes/${note.id}`}
                      className="font-bold text-white text-sm leading-tight truncate block hover:underline"
                    >
                      {note.diagnosis || note.content?.slice(0, 60) || "ملاحظة زيارة"}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-emerald-100 text-[11px] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(note.createdAt)}
                      </span>
                      {note.medications.length > 0 && (
                        <span className="text-emerald-200 text-[11px] bg-white/10 px-1.5 py-0.5 rounded">
                          <Pill className="w-3 h-3 inline me-1" />
                          {note.medications.length} دواء
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <VisitNoteInvoice
                    note={note}
                    patientName={patientName}
                    clinicName={clinicInfo?.name}
                    doctorName={doctorName}
                    clinicSpecialty={clinicInfo?.specialty}
                    clinicPhone={clinicInfo?.phone}
                    clinicAddress={clinicInfo?.address}
                    iconOnly
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(note)}
                    className="bg-white/15 hover:bg-white/25 text-white rounded-lg p-1.5 h-auto w-auto transition-colors"
                    title="تعديل"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <button
                    onClick={() => setDeleteTarget(note.id)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg p-1.5 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <Link
                href={`/dashboard/patients/${patientId}/visit-notes/${note.id}`}
                className="flex items-center justify-center gap-1 p-2 text-xs font-medium text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                عرض التفاصيل
              </Link>
            </div>
          ))}
        </div>
      )}

      <VisitNoteFormDialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) {
            setEditingId(null);
            setEditingData(null);
          }
        }}
        patientId={patientId}
        editingId={editingId}
        editingData={editingData}
        onSaved={handleFormSaved}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
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
    </div>
  );
}
