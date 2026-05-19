"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { Label } from "../../ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/Select";
import { User, Phone, CalendarDays, UserCircle2, MapPin } from "lucide-react";
import { patientUpdateSchema, type PatientUpdateInput } from "@/lib/schemas/patient";
import { useUpdatePatient } from "@/hooks/use-patients";
import type { Patient } from "@/hooks/use-patients";

interface EditPatientModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(" ");
  if (parts.length >= 2) {
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
  }
  return { firstName: parts[0], lastName: "" };
}

export function EditPatientModal({ patient, isOpen, onClose }: EditPatientModalProps) {
  const { name, phone, email, dateOfBirth, gender, address } = patient;
  const { firstName: defaultFirstName, lastName: defaultLastName } = splitName(name);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientUpdateInput>({
    resolver: zodResolver(patientUpdateSchema),
    defaultValues: {
      firstName: defaultFirstName,
      lastName: defaultLastName,
      phone: phone ?? "",
      email: email ?? "",
      dateOfBirth: dateOfBirth?.split("T")[0] ?? "",
      gender: (gender as "MALE" | "FEMALE" | undefined) ?? undefined,
      address: address ?? "",
    },
  });

  const updatePatient = useUpdatePatient();

  async function onSubmit(data: PatientUpdateInput) {
    await updatePatient.mutateAsync({ id: patient.id, data });
    reset();
    onClose();
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="تعديل بيانات المريض">
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

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting || updatePatient.isPending}>
            {isSubmitting || updatePatient.isPending ? "جاري الحفظ..." : "تحديث المريض"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
