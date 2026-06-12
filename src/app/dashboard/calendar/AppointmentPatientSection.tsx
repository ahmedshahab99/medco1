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
import PatientSearchField from "@/components/features/PatientSearchField"
import PatientFormFields from "@/components/features/PatientFormFields"

interface AppointmentPatientSectionProps {
  initialPatientId?: string
}

export default function AppointmentPatientSection({
  initialPatientId,
}: AppointmentPatientSectionProps) {
  const { control, setValue } = useFormContext()
  const patientMode = useWatch({ control, name: "patientMode" })

  const handleModeChange = (mode: string) => {
    setValue("patientMode", mode as "existing" | "new")
    setValue("caseId", "")
    setValue("patientId", "")
    setValue("newPatient", undefined)
  }

  return (
    <div className="space-y-4">
      <span className="text-sm font-semibold text-slate-700">بيانات المريض</span>
      <Tabs dir="rtl" value={patientMode} onValueChange={handleModeChange} orientation="horizontal">
        <TabsList variant="line" className="w-full bg-slate-100 rounded-lg p-1">
          <TabsTrigger value="existing">مريض موجود</TabsTrigger>
          <TabsTrigger value="new">مريض جديد</TabsTrigger>
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

      </Tabs>
    </div>
  )
}
