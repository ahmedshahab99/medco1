"use client"

import React from "react"
import { ArrowRight } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import PatientSearchField from "@/components/features/PatientSearchField"
import PatientFormFields from "@/components/features/PatientFormFields"
import { waitlistFormSchema } from "@/lib/schemas/waitlist-form"
import type { WaitlistFormValues } from "@/lib/schemas/waitlist-form"

interface WaitlistFormViewProps {
  defaultPatientId: string
  defaultNotes: string
  defaultPatientMode?: "existing" | "new"
  isEditing: boolean
  onSubmit: (data: WaitlistFormValues) => void
  onCancel: () => void
}

export default function WaitlistFormView({
  defaultPatientId,
  defaultNotes,
  defaultPatientMode = "existing",
  isEditing,
  onSubmit,
  onCancel,
}: WaitlistFormViewProps) {
  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistFormSchema),
    defaultValues: {
      patientMode: defaultPatientMode,
      patientId: defaultPatientId,
      notes: defaultNotes,
    },
  })

  const { control, handleSubmit, setValue } = form
  const patientMode = useWatch({ control, name: "patientMode" })

  const handleModeChange = (mode: string) => {
    setValue("patientMode", mode as "existing" | "new")
    setValue("patientId", "")
    setValue("newPatient", undefined)
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div
          className="flex items-center gap-2 mb-2 text-sm text-blue-600 font-medium cursor-pointer hover:underline"
          onClick={onCancel}
        >
          <ArrowRight className="w-4 h-4" />
          العودة للقائمة
        </div>

        {!isEditing && (
          <Tabs dir="rtl" value={patientMode} onValueChange={handleModeChange}>
            <TabsList variant="line" className="w-full bg-slate-100 rounded-lg p-1">
              <TabsTrigger value="existing">مريض موجود</TabsTrigger>
              <TabsTrigger value="new">مريض جديد</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="mt-4">
              <FormField
                control={control}
                name="patientId"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <PatientSearchField
                        value={field.value}
                        onChange={field.onChange}
                        initialPatientId={defaultPatientId}
                        error={fieldState.error?.message}
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
        )}

        <FormField
          control={control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ملاحظات إضافية</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="أدخل أي تفاصيل إضافية..."
                  className="h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 flex gap-3">
          <Button variant="outline" className="flex-1" type="button" onClick={onCancel}>
            إلغاء
          </Button>
          <Button className="flex-1" type="submit">
            {isEditing ? "حفظ التعديلات" : "إضافة للقائمة"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
