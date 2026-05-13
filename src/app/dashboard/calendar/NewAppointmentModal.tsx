"use client"

import React, { useCallback, useMemo, useState } from "react"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { Form } from "@/components/ui/form"
import { useServices } from "@/hooks/use-services"
import { toast } from "sonner"
import { appointmentFormSchema } from "@/lib/schemas/appointment-form"
import type { AppointmentFormValues } from "@/lib/schemas/appointment-form"
import type { AppointmentCreateInput, AppointmentPatchInput } from "@/lib/schemas/appointment"
import type { Doctor } from "@/hooks/use-doctors"
import type { WaitlistEntry } from "@/hooks/use-waitlist"
import type { CalendarAppointment, CreateAppointmentArgs } from "@/hooks/use-appointments"
import AppointmentServiceFields from "./AppointmentServiceFields"
import AppointmentPatientSection from "./AppointmentPatientSection"
import AppointmentCaseSection from "./AppointmentCaseSection"
import AppointmentSchedulingFields from "./AppointmentSchedulingFields"
import AppointmentNotesField from "./AppointmentNotesField"
import { usePatients } from "@/hooks/use-patients"

function toTimeString(d: Date) {
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
}

function computeEndTime(dateStr: string, startTime: string, duration: number): string {
  if (!dateStr || !startTime) return ""
  const [h, m] = startTime.split(":").map(Number)
  const start = new Date(dateStr)
  start.setHours(h || 0, m || 0, 0, 0)
  const end = new Date(start.getTime() + duration * 60 * 1000)
  return toTimeString(end)
}

interface NewAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  initialDate: Date
  doctors: Doctor[]
  waitlist: WaitlistEntry[]
  initialPatientId?: string
  initialStart?: Date
  initialEnd?: Date
  editingAppointment?: CalendarAppointment
  onCreate: (args: CreateAppointmentArgs) => void
  onUpdate?: (args: { id: string; data: AppointmentPatchInput }) => void
}

export default function NewAppointmentModal({
  isOpen,
  onClose,
  initialDate,
  doctors,
  waitlist,
  initialPatientId,
  initialStart,
  initialEnd,
  editingAppointment,
  onCreate,
  onUpdate,
}: NewAppointmentModalProps) {
  const { data: servicesData } = useServices()
  const services = servicesData ?? []
  const { data: patientsData } = usePatients()
  const patients = patientsData ?? []
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialService = services[0]
  const defaultDuration = initialService?.duration ?? 30
  const dateStr = format(initialDate, "yyyy-MM-dd")
  
  const formValues = useMemo<AppointmentFormValues>(
    () => {
      if (editingAppointment) {
        console.log("Editing appointment, pre-filling form with:", editingAppointment)
        return {
          doctorId: editingAppointment.doctorId,
          serviceId: editingAppointment.serviceId,
          patientMode: "existing",
          patientId: editingAppointment.patientId ?? "",
          waitlistId: "",
          newPatient: undefined,
          caseId: editingAppointment.caseId ?? "",
          date: format(new Date(editingAppointment.startTime), "yyyy-MM-dd"),
          startTime: format(new Date(editingAppointment.startTime), "HH:mm"),
          endTime: format(new Date(editingAppointment.endTime), "HH:mm"),
          notes: editingAppointment.notes ?? "",
        };
      }
      return {
        doctorId: doctors[0]?.id ?? "",
        serviceId: initialService?.id ?? "",
        patientMode: "existing",
        patientId: initialPatientId ?? "",
        waitlistId: "",
        newPatient: undefined,
        caseId: "",
        date: dateStr,
        startTime: initialStart ? format(initialStart, "HH:mm") : "09:00",
        endTime: initialEnd
          ? format(initialEnd, "HH:mm")
          : computeEndTime(dateStr, initialStart ? format(initialStart, "HH:mm") : "09:00", defaultDuration),
        notes: "",
      };
    },
    [doctors, initialService, initialPatientId, initialStart, initialEnd, dateStr, defaultDuration, editingAppointment]
  )

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    values: formValues,
  })

  const { handleSubmit, reset } = form

  React.useEffect(() => {
    if (isOpen) {
      reset(formValues)
    }
  }, [isOpen, formValues, reset])

  const onSubmit = useCallback(
    async (data: AppointmentFormValues) => {
      const [h, m] = data.startTime.split(":").map(Number)
      const start = new Date(data.date)
      start.setHours(h || 0, m || 0, 0, 0)

      const [eh, em] = data.endTime.split(":").map(Number)
      const end = new Date(data.date)
      end.setHours(eh || 0, em || 0, 0, 0)

      if (end <= start) {
        toast.error("وقت الانتهاء يجب أن يكون بعد وقت البدء")
        return
      }

      if (editingAppointment) {
        const updateData: AppointmentPatchInput = {
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          notes: data.notes || undefined,
          serviceId: data.serviceId,
          doctorId: data.doctorId,
        };
        updateData.caseId = data.caseId === "__none__" ? "" : (data.caseId || undefined);
        setIsSubmitting(true);
        try {
          await onUpdate?.({ id: editingAppointment.id, data: updateData });
          onClose();
        } catch {
          // error toast already handled by mutation hook
        } finally {
          setIsSubmitting(false);
        }
        return;
      }

      const payload: AppointmentCreateInput = {
        doctorId: data.doctorId,
        serviceId: data.serviceId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        notes: data.notes || undefined,
      }

      let patientName = ""
      let patientPhone: string | null = null

      if (data.patientMode === "existing" && data.patientId) {
        payload.patientId = data.patientId
        const patient = patients.find((p) => p.id === data.patientId)
        patientName = patient?.name ?? ""
        patientPhone = patient?.phone ?? null
      } else if (data.patientMode === "new" && data.newPatient) {
        payload.newPatient = {
          firstName: data.newPatient.firstName,
          lastName: data.newPatient.lastName,
          phone: data.newPatient.phone || undefined,
          dateOfBirth: data.newPatient.dateOfBirth || undefined,
          gender: data.newPatient.gender || undefined,
          address: data.newPatient.address || undefined,
        }
        patientName = `${data.newPatient.firstName} ${data.newPatient.lastName}`.trim()
        patientPhone = data.newPatient.phone || null
      } else if (data.patientMode === "waitlist" && data.waitlistId) {
        payload.waitlistId = data.waitlistId
        const entry = waitlist.find((w) => w.id === data.waitlistId)
        patientName = entry?.patientName ?? ""
        patientPhone = entry?.patientPhone ?? null
      }

      const doctor = doctors.find((d) => d.id === data.doctorId)
      const service = services.find((s) => s.id === data.serviceId)

      if (data.caseId && data.caseId !== "__none__") {
        payload.caseId = data.caseId
      } else if (data.newCase?.title) {
        payload.newCase = {
          title: data.newCase.title,
          description: data.newCase.description || undefined,
        }
      }

      onCreate({
        input: payload,
        optimistic: {
          patientName,
          patientPhone,
          doctorName: doctor?.name ?? "",
          serviceName: service?.name ?? "",
          serviceColor: service?.color ?? "#3b82f6",
        },
      })
      onClose()
    },
    [onCreate, onUpdate, onClose, doctors, services, patients, waitlist, editingAppointment, isSubmitting]
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingAppointment ? "إعادة جدولة الموعد" : "حجز موعد جديد"}>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar px-1"
        >
          <AppointmentServiceFields doctors={doctors} hasCustomEndTime={!!initialEnd || !!editingAppointment} />

          <div className="border-t border-slate-100 pt-5" />

          {editingAppointment ? (
            <div className="space-y-4">
              <span className="text-sm font-semibold text-slate-700">بيانات المريض</span>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-700">{editingAppointment.patientName}</p>
              </div>
            </div>
          ) : (
            <AppointmentPatientSection
              waitlist={waitlist}
              initialPatientId={initialPatientId}
            />
          )}

          <AppointmentCaseSection patients={patients} isEditing={!!editingAppointment} />

          <div className="border-t border-slate-100 pt-5">
            <AppointmentSchedulingFields />
          </div>

          <AppointmentNotesField />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              إلغاء
            </Button>
            <Button className="px-8 shadow-md shadow-blue-100 gap-2" type="submit" disabled={isSubmitting}>
              {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editingAppointment ? "تأكيد إعادة الجدولة" : "تأكيد الحجز"}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  )
}
