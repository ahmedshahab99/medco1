"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"
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
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import type { Patient } from "@/hooks/use-patients"

interface AppointmentCaseSectionProps {
  patients: Patient[]
  isEditing?: boolean
}

export default function AppointmentCaseSection({ patients, isEditing }: AppointmentCaseSectionProps) {
  const { control, setValue } = useFormContext()
  const patientMode = useWatch({ control, name: "patientMode" })
  const patientId = useWatch({ control, name: "patientId" })
  const [showCaseForm, setShowCaseForm] = useState(false)

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === patientId),
    [patients, patientId]
  )

  const hasCases = selectedPatient && selectedPatient.cases.length > 0
  const isNewPatient = patientMode === "new"

  useEffect(() => {
    if (!isEditing) {
      setValue("caseId", "")
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowCaseForm(false)
  }, [patientId, patientMode, setValue, isEditing])

  return (
    <div className="border-t border-slate-100 pt-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">الملف الطبي / الحالة</span>
        <button
          type="button"
          onClick={() => setShowCaseForm((prev) => !prev)}
          className={`px-3 py-1 text-xs font-bold rounded transition-all ${
            showCaseForm
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
          }`}
        >
          {showCaseForm ? "إلغاء" : "+ إضافة حالة"}
        </button>
      </div>

      {!isNewPatient && hasCases && (
        <FormField
          control={control}
          name="caseId"
          render={({ field }) => (
            <FormItem>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="لا يوجد / زيارة عامة" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__none__">لا يوجد (زيارة عامة)</SelectItem>
                  {selectedPatient?.cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {showCaseForm && (
        <div className="space-y-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
          <FormField
            control={control}
            name="newCase.title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="عنوان الحالة (مثلاً: متابعة سكري)"
                    className="bg-white border-blue-100"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="newCase.description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="ملاحظات تشخيصية أولية..."
                    className="bg-white border-blue-100 h-20 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  )
}
