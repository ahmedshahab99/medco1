"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { arSA } from "date-fns/locale/ar-SA";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import type { Doctor } from "@/hooks/use-doctors";

const blockFormSchema = z
  .object({
    date: z.string().min(1, "التاريخ مطلوب"),
    startTime: z.string().min(1, "وقت البداية مطلوب"),
    endTime: z.string().min(1, "وقت النهاية مطلوب"),
    reason: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.date || !data.startTime || !data.endTime) return true;
      const [sh, sm] = data.startTime.split(":").map(Number);
      const [eh, em] = data.endTime.split(":").map(Number);
      const startMins = sh * 60 + sm;
      const endMins = eh * 60 + em;
      return endMins > startMins;
    },
    { message: "وقت النهاية يجب أن يكون بعد وقت البداية", path: ["endTime"] }
  );

type BlockFormValues = z.infer<typeof blockFormSchema>;

interface UnavailableBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: Date;
  doctorId: string;
  doctors?: Doctor[];
  userRole?: string;
  onSubmit: (data: { doctorId: string; startTime: string; endTime: string; reason?: string }) => void;
  isSubmitting?: boolean;
}

function toISODateTime(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(dateStr);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
}

export default function UnavailableBlockModal({
  isOpen,
  onClose,
  initialDate,
  doctorId,
  doctors,
  userRole,
  onSubmit,
  isSubmitting,
}: UnavailableBlockModalProps) {
  const defaultDate = useMemo(
    () => format(initialDate, "yyyy-MM-dd"),
    [initialDate]
  );

  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorId);

  const isDoctorView = userRole === "DOCTOR";
  const effectiveDoctorId = isDoctorView ? doctorId : selectedDoctorId;

  const form = useForm<BlockFormValues>({
    resolver: zodResolver(blockFormSchema),
    defaultValues: {
      date: defaultDate,
      startTime: "",
      endTime: "",
      reason: "",
    },
  });

  const handleSubmit = (values: BlockFormValues) => {
    onSubmit({
      doctorId: effectiveDoctorId,
      startTime: toISODateTime(values.date, values.startTime),
      endTime: toISODateTime(values.date, values.endTime),
      reason: values.reason || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="حجز وقت غير متاح" width="max-w-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4 p-6">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-sm text-emerald-700">
              اختر الفترة الزمنية التي لا ترغب في استقبال مرضى خلالها. لن يتمكن المرضى من حجز مواعيد في هذا الوقت.
            </p>
          </div>

          {!isDoctorView && doctors && doctors.length > 0 && (
            <div className="space-y-1.5">
              <FormLabel>الطبيب</FormLabel>
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الطبيب" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <FormField
            control={form.control}
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
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
              control={form.control}
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

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>السبب (اختياري)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="سبب الحجز..."
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isSubmitting ? "جاري الحفظ..." : "حجز الوقت"}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
