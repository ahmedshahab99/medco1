"use client"

import React, { useEffect, useMemo, useRef } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import type { Doctor } from "@/hooks/use-doctors"
import { useServices } from "@/hooks/use-services"

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

interface AppointmentServiceFieldsProps {
  doctors: Doctor[]
  hasCustomEndTime?: boolean
}

export default function AppointmentServiceFields({ doctors, hasCustomEndTime }: AppointmentServiceFieldsProps) {
  const { data: servicesData } = useServices()
  const services = useMemo(() => servicesData ?? [], [servicesData])

  const { setValue } = useFormContext()
  const serviceId = useWatch({ name: "serviceId" })
  const date = useWatch({ name: "date" })
  const startTime = useWatch({ name: "startTime" })

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId]
  )

 

  useEffect(() => {
    if (hasCustomEndTime) {
      
      return
    }
    
    if (!date || !startTime || !selectedService) return
    const end = computeEndTime(date, startTime, selectedService.duration)
    if (end) setValue("endTime", end)
  }, [date, startTime, selectedService, setValue])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <DoctorSelect doctors={doctors} />
      <ServiceSelect services={services} />
    </div>
  )
}

function DoctorSelect({ doctors }: { doctors: Doctor[] }) {
  const { control } = useFormContext()

  if (doctors.length === 1) {
    return (
      <div className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">الطبيب المعالج</span>
        <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-600 h-8 flex items-center">
          {doctors[0]?.name ?? "\u2014"}
        </div>
      </div>
    )
  }

  return (
    <FormField
      control={control}
      name="doctorId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>الطبيب المعالج</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر الطبيب" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

interface ServiceItem {
  id: string
  name: string
  duration: number
}

function ServiceSelect({ services }: { services: ServiceItem[] }) {
  const { control } = useFormContext()

  if (services.length === 1) {
    const s = services[0]
    return (
      <div className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">نوع الموعد</span>
        <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-600 h-8 flex items-center">
          {s ? `${s.name} (${s.duration} دقيقة)` : "\u2014"}
        </div>
      </div>
    )
  }

  return (
    <FormField
      control={control}
      name="serviceId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>نوع الموعد</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر الخدمة" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.duration} دقيقة)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
