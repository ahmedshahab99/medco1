"use client"

import React, { useState, useCallback } from "react"
import { Modal } from "@/components/ui/Modal"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { usePatients } from "@/hooks/use-patients"
import WaitlistListView from "./WaitlistListView"
import WaitlistFormView from "./WaitlistFormView"
import type { WaitlistEntry, CreateWaitlistArgs } from "@/hooks/use-waitlist"
import type { WaitlistPatchInput } from "@/lib/schemas/waitlist"
import type { WaitlistFormValues } from "@/lib/schemas/waitlist-form"

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
  waitlist: WaitlistEntry[]
  onCreate: (args: CreateWaitlistArgs) => void
  onUpdate: (id: string, data: WaitlistPatchInput) => void
  onDelete: (id: string) => void
}

export default function WaitlistModal({
  isOpen,
  onClose,
  waitlist,
  onCreate,
  onUpdate,
  onDelete,
}: WaitlistModalProps) {
  const [mode, setMode] = useState<"list" | "add" | "edit">("list")
  const [editingEntry, setEditingEntry] = useState<WaitlistEntry | null>(null)
  const [initialPatientMode, setInitialPatientMode] = useState<"existing" | "new">("existing")
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const { data: patientsData } = usePatients()
  const patients = patientsData ?? []

  const resetTo = () => {
    setMode("list")
    setEditingEntry(null)
  }

  const handleClose = () => {
    resetTo()
    onClose()
  }

  const handleSave = useCallback(
    (data: WaitlistFormValues) => {
      if (editingEntry) {
        onUpdate(editingEntry.id, {
          notes: data.notes || undefined,
        })
        resetTo()
        return
      }

      let patientName = ""
      let patientPhone: string | null = null

      if (data.patientMode === "new" && data.newPatient) {
        patientName = `${data.newPatient.firstName} ${data.newPatient.lastName}`.trim()
        patientPhone = data.newPatient.phone || null
        onCreate({
          input: {
            newPatient: data.newPatient,
            notes: data.notes || undefined,
          },
          optimistic: { patientName, patientPhone },
        })
      } else {
        const patient = patients.find((p) => p.id === data.patientId)
        patientName = patient?.name ?? ""
        patientPhone = patient?.phone ?? null
        onCreate({
          input: {
            patientId: data.patientId,
            notes: data.notes || undefined,
          },
          optimistic: { patientName, patientPhone },
        })
      }

      resetTo()
    },
    [editingEntry, onCreate, onUpdate, patients]
  )

  const title = editingEntry
    ? "تعديل بيانات الانتظار"
    : mode === "add"
      ? initialPatientMode === "new"
        ? "إضافة مريض جديد للقائمة"
        : "إضافة مريض للقائمة"
      : "قائمة الانتظار الحالية"

  return (
    <>
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      {mode === "list" ? (
        <WaitlistListView
          entries={waitlist}
          onEdit={(entry) => {
            setEditingEntry(entry)
            setMode("edit")
          }}
          onRequestDelete={setDeleteTarget}
          onAdd={() => {
            resetTo()
            setInitialPatientMode("existing")
            setMode("add")
          }}
          onAddNew={() => {
            resetTo()
            setInitialPatientMode("new")
            setMode("add")
          }}
        />
      ) : (
        <WaitlistFormView
          defaultPatientId={editingEntry?.patientId ?? ""}
          defaultNotes={editingEntry?.notes ?? ""}
          defaultPatientMode={initialPatientMode}
          isEditing={mode === "edit"}
          onSubmit={handleSave}
          onCancel={resetTo}
        />
      )}
    </Modal>
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="حذف المريض"
        message="هل أنت متأكد من حذف هذا المريض من قائمة الانتظار؟"
        confirmLabel="حذف"
        type="danger"
        onConfirm={() => {
          if (deleteTarget) onDelete(deleteTarget);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
