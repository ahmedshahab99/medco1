"use client"

import React from "react"
import { useFormContext } from "react-hook-form"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/Textarea"

export default function AppointmentNotesField() {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>ملاحظات إضافية</FormLabel>
          <FormControl>
            <Textarea
              placeholder="أضف أي ملاحظات إدارية هنا..."
              className="h-20 text-sm"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
