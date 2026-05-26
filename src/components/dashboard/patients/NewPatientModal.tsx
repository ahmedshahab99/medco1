"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { Label } from "../../ui/Label";
import { User, Phone, DollarSign, Stethoscope } from "lucide-react";
import { quickPatientSchema } from "@/lib/schemas/patient";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

type QuickForm = z.infer<typeof quickPatientSchema>;

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewPatientModal({ isOpen, onClose }: NewPatientModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuickForm>({
    resolver: zodResolver(quickPatientSchema),
    defaultValues: { consultationFee: "" },
  });

  async function onSubmit(data: QuickForm) {
    const names = data.name.trim().split(" ");
    const firstName = names[0];
    const lastName = names.slice(1).join(" ") || " ";
    const consultationFee = data.consultationFee ? parseFloat(data.consultationFee) : undefined;

    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        phone: data.phone,
        consultationFee,
      }),
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
        <div className="relative">
          <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="bg-gradient-to-l from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100 space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-1">
              <Stethoscope className="w-4 h-4" />
              بيانات المريض الأساسية
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">
                <User className="w-4 h-4 text-emerald-500" />
                الاسم الكامل <span className="text-red-500">*</span>
              </Label>
              <Input id="name" {...register("name")} placeholder="مثال: أحمد الزهراني" className="border-emerald-200 focus:border-emerald-400" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">
                <Phone className="w-4 h-4 text-emerald-500" />
                رقم الجوال <span className="text-red-500">*</span>
              </Label>
              <Input id="phone" {...register("phone")} placeholder="05xxxxxxxx" dir="ltr" type="tel" className="border-emerald-200 focus:border-emerald-400" />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="consultationFee">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                الكشفية (دينار)
              </Label>
              <Input id="consultationFee" {...register("consultationFee")} type="text" inputMode="numeric" placeholder="مثال: 25000" className="border-emerald-200 focus:border-emerald-400" dir="ltr" />
              {errors.consultationFee && <p className="text-xs text-red-500">{errors.consultationFee.message}</p>}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose}>إلغاء</Button>
          <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200">
            {isSubmitting ? "جاري الحفظ..." : "حفظ المريض"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
