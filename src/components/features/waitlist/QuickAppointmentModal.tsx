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
import type { AppointmentCreateInput } from "@/lib/schemas/appointment"
import type { CreateAppointmentArgs } from "@/hooks/use-appointments"
import { useDoctors } from "@/hooks/use-doctors"
import { useWaitlist } from "@/hooks/use-waitlist"
import { usePatients } from "@/hooks/use-patients"
import AppointmentServiceFields from "@/app/dashboard/calendar/AppointmentServiceFields"
import AppointmentPatientSection from "@/app/dashboard/calendar/AppointmentPatientSection"
import AppointmentCaseSection from "@/app/dashboard/calendar/AppointmentCaseSection"
import AppointmentSchedulingFields from "@/app/dashboard/calendar/AppointmentSchedulingFields"
import AppointmentNotesField from "@/app/dashboard/calendar/AppointmentNotesField"
import type { WaitlistStatus } from "@/lib/types/waitlist-board"

function toTimeString(d: Date) {
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
}

function roundUpToNext15(d: Date): Date {
  const ms = 15 * 60 * 1000
  return new Date(Math.ceil(d.getTime() / ms) * ms)
}

function computeEndTime(dateStr: string, startTime: string, duration: number): string {
  if (!dateStr || !startTime) return ""
  const [h, m] = startTime.split(":").map(Number)
  const start = new Date(dateStr)
  start.setHours(h || 0, m || 0, 0, 0)
  const end = new Date(start.getTime() + duration * 60 * 1000)
  return toTimeString(end)
}

const COLUMN_TO_STATUS: Record<WaitlistStatus, "SCHEDULED" | "WAITING" | "IN_PROGRESS" | "COMPLETED"> = {
  BOOKING: "SCHEDULED",
  WAITING: "WAITING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
}

interface QuickAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  initialStatus: WaitlistStatus
  onCreate: (args: CreateAppointmentArgs) => void
}

export default function QuickAppointmentModal({
  isOpen,
  onClose,
  initialStatus,
  onCreate,
}: QuickAppointmentModalProps) {
  const { data: servicesData } = useServices()
  const services = servicesData ?? []
  const { data: doctorsData } = useDoctors()
  const doctors = doctorsData ?? []
  const { data: patientsData } = usePatients()
  const patients = patientsData ?? []
  const { data: waitlistData } = useWaitlist()
  const waitlist = waitlistData ?? []
  const [isSubmitting, setIsSubmitting] = useState(false)

  const initialService = services[0]
  const defaultDuration = initialService?.duration ?? 30

  const formValues = useMemo<AppointmentFormValues>(() => {
    const dateStr = format(new Date(), "yyyy-MM-dd")
    const start = roundUpToNext15(new Date())
    const startTime = toTimeString(start)
    return {
      doctorId: doctors[0]?.id ?? "",
      serviceId: initialService?.id ?? "",
      patientMode: "existing",
      patientId: "",
      waitlistId: "",
      newPatient: undefined,
      caseId: "",
      date: dateStr,
      startTime,
      endTime: computeEndTime(dateStr, startTime, defaultDuration),
      notes: "",
    }
  }, [doctors, initialService, defaultDuration])

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

      const payload: AppointmentCreateInput = {
        doctorId: data.doctorId,
        serviceId: data.serviceId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        notes: data.notes || undefined,
        status: COLUMN_TO_STATUS[initialStatus],
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
    [onCreate, onClose, doctors, services, patients, waitlist, initialStatus]
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="حجز موعد جديد">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar px-1"
        >
          <AppointmentServiceFields doctors={doctors} />

          <div className="border-t border-slate-100 pt-5" />

          <AppointmentPatientSection waitlist={waitlist} />

          <AppointmentCaseSection patients={patients} isEditing={false} />

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
              تأكيد الحجز
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  )
}
