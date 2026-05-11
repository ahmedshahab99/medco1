"use client"

import React from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"
import {
  FormField,
  FormItem,
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
import PatientSearchField from "@/components/features/PatientSearchField"
import PatientFormFields from "@/components/features/PatientFormFields"
import type { WaitlistEntry } from "@/hooks/use-waitlist"

interface AppointmentPatientSectionProps {
  waitlist: WaitlistEntry[]
  initialPatientId?: string
}

export default function AppointmentPatientSection({
  waitlist,
  initialPatientId,
}: AppointmentPatientSectionProps) {
  const { control, setValue } = useFormContext()
  const patientMode = useWatch({ control, name: "patientMode" })

  const handleModeChange = (mode: string) => {
    setValue("patientMode", mode as "existing" | "new" | "waitlist")
    setValue("caseId", "")
    setValue("patientId", "")
    setValue("waitlistId", "")
    setValue("newPatient", undefined)
  }

  return (
    <div className="space-y-4">
      <span className="text-sm font-semibold text-slate-700">بيانات المريض</span>
      <Tabs dir="rtl" value={patientMode} onValueChange={handleModeChange} orientation="horizontal">
        <TabsList variant="line" className="w-full bg-slate-100 rounded-lg p-1">
          <TabsTrigger value="existing">مريض موجود</TabsTrigger>
          <TabsTrigger value="new">مريض جديد</TabsTrigger>
          <TabsTrigger value="waitlist">من الانتظار</TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="mt-4">
          <FormField
            control={control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PatientSearchField
                    value={field.value}
                    onChange={field.onChange}
                    initialPatientId={initialPatientId}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>

        <TabsContent value="new" className="mt-4">
          <PatientFormFields />
        </TabsContent>

        <TabsContent value="waitlist" className="mt-4">
          <FormField
            control={control}
            name="waitlistId"
            render={({ field }) => (
              <FormItem>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر من القائمة..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {waitlist.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.patientName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
