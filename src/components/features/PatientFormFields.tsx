"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

export default function PatientFormFields() {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldError = (path: string) => {
    const e = path.split(".").reduce((obj, key) => obj?.[key], errors as Record<string, any>);
    return e?.message as string | undefined;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="newPatient.firstName">
          الاسم الأول <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="newPatient.firstName"
          control={control}
          render={({ field }) => (
            <Input
              id="newPatient.firstName"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!fieldError("newPatient.firstName")}
            />
          )}
        />
        {fieldError("newPatient.firstName") && (
          <p className="text-sm text-red-500">{fieldError("newPatient.firstName")}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newPatient.lastName">
          اسم العائلة <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="newPatient.lastName"
          control={control}
          render={({ field }) => (
            <Input
              id="newPatient.lastName"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!fieldError("newPatient.lastName")}
            />
          )}
        />
        {fieldError("newPatient.lastName") && (
          <p className="text-sm text-red-500">{fieldError("newPatient.lastName")}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newPatient.phone">
          رقم الجوال
        </Label>
        <Controller
          name="newPatient.phone"
          control={control}
          render={({ field }) => (
            <Input
              id="newPatient.phone"
              dir="ltr"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!fieldError("newPatient.phone")}
            />
          )}
        />
        {fieldError("newPatient.phone") && (
          <p className="text-sm text-red-500">{fieldError("newPatient.phone")}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newPatient.dateOfBirth">
          تاريخ الميلاد
        </Label>
        <Controller
          name="newPatient.dateOfBirth"
          control={control}
          render={({ field }) => (
            <Input
              id="newPatient.dateOfBirth"
              type="date"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!fieldError("newPatient.dateOfBirth")}
            />
          )}
        />
        {fieldError("newPatient.dateOfBirth") && (
          <p className="mt-1 text-sm text-red-500">{fieldError("newPatient.dateOfBirth")}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="newPatient.gender">الجنس</Label>
        <Controller
          name="newPatient.gender"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="newPatient.gender"
                className="w-full"
                aria-invalid={!!fieldError("newPatient.gender")}
              >
                <SelectValue placeholder="اختر الجنس" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">ذكر</SelectItem>
                <SelectItem value="FEMALE">أنثى</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {fieldError("newPatient.gender") && (
          <p className="mt-1 text-sm text-red-500">{fieldError("newPatient.gender")}</p>
        )}
      </div>
      <div className="sm:col-span-2 space-y-1.5">
        <Label htmlFor="newPatient.address">العنوان</Label>
        <Controller
          name="newPatient.address"
          control={control}
          render={({ field }) => (
            <Textarea
              id="newPatient.address"
              className="h-16 text-sm"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!fieldError("newPatient.address")}
            />
          )}
        />
        {fieldError("newPatient.address") && (
          <p className="text-sm text-red-500">{fieldError("newPatient.address")}</p>
        )}
      </div>
    </div>
  );
}
