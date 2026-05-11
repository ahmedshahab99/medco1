"use client"

import React, { useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { AlertTriangle } from "lucide-react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/Input"

export default function AppointmentSchedulingFields() {
  const { control } = useFormContext()
  const date = useWatch({ control, name: "date" })
  const startTime = useWatch({ control, name: "startTime" })

  const isPastTime = useMemo(() => {
    if (!date || !startTime) return false
    const [h, m] = startTime.split(":").map(Number)
    const dt = new Date(date)
    dt.setHours(h || 0, m || 0, 0, 0)
    return dt < new Date()
  }, [date, startTime])

  return (
    <div className="space-y-4">
      {isPastTime && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>الموعد في وقت سابق، يرجى التأكد من صحة التاريخ</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>التاريخ</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>من</FormLabel>
              <FormControl>
                <Input type="time" dir="ltr" className="text-end" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="endTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>إلى</FormLabel>
              <FormControl>
                <Input type="time" dir="ltr" className="text-end" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
