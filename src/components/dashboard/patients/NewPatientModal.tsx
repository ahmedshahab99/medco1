"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { Label } from "../../ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/Select";
import { User, Phone, CalendarDays, UserCircle2, MapPin, DollarSign } from "lucide-react";
import { patientCreateSchema, type PatientCreateInput } from "@/lib/schemas/patient";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewPatientModal({ isOpen, onClose }: NewPatientModalProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientCreateInput>({
    resolver: zodResolver(patientCreateSchema),
  });

  async function onSubmit(data: PatientCreateInput) {
    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "فشل في إضافة المريض");
      return;
    }

    toast.success("تم إضافة المريض بنجاح");
    reset();
    queryClient.invalidateQueries({ queryKey: ["patients"] });
    onClose();
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="إضافة مريض جديد">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">
              <User className="w-4 h-4 text-slate-400" />
              الاسم الأول <span className="text-red-500">*</span>
            </Label>
            <Input id="firstName" {...register("firstName")} placeholder="مثال: أحمد" />
            {errors.firstName && (
              <p className="text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">
              <User className="w-4 h-4 text-slate-400" />
              اسم العائلة <span className="text-red-500">*</span>
            </Label>
            <Input id="lastName" {...register("lastName")} placeholder="مثال: الزهراني" />
            {errors.lastName && (
              <p className="text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">
            <Phone className="w-4 h-4 text-slate-400" />
            رقم الجوال
          </Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="05xxxxxxxx"
            dir="ltr"
            type="tel"
          />
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="dateOfBirth">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              تاريخ الميلاد
            </Label>
            <Input id="dateOfBirth" {...register("dateOfBirth")} type="date" />
            {errors.dateOfBirth && (
              <p className="text-xs text-red-500">{errors.dateOfBirth.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gender">
              <UserCircle2 className="w-4 h-4 text-slate-400" />
              الجنس
            </Label>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id="gender" className="w-full">
                    <SelectValue placeholder="اختر..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">ذكر</SelectItem>
                    <SelectItem value="FEMALE">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">
            <MapPin className="w-4 h-4 text-slate-400" />
            العنوان
          </Label>
          <Input id="address" {...register("address")} placeholder="مثال: الرياض، حي النخيل" />
          {errors.address && (
            <p className="text-xs text-red-500">{errors.address.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="consultationFee">
            <DollarSign className="w-4 h-4 text-slate-400" />
            الكشفية (دينار)
          </Label>
          <Input id="consultationFee" {...register("consultationFee")} type="text" inputMode="numeric" placeholder="مثال: 25000" dir="ltr" />
          {errors.consultationFee && (
            <p className="text-xs text-red-500">{errors.consultationFee.message}</p>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جاري الحفظ..." : "حفظ المريض"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
