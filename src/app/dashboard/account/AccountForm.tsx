"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Toast, useToast } from "@/components/ui/Toast";
import { DollarSign } from "lucide-react";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/schemas/profile";
import { updateProfile, updateFees } from "./actions";

interface AccountFormProps {
  initialData: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    tenantName: string | null;
    tenantId: string | null;
    defaultConsultationFee: number | null;
  };
}

const roleLabels: Record<string, string> = {
  ADMIN: "مدير",
  DOCTOR: "طبيب",
  RECEPTIONIST: "موظف استقبال",
};

export default function AccountForm({ initialData }: AccountFormProps) {
  const [isPending, startTransition] = useTransition();
  const [feePending, startFeeTransition] = useTransition();
  const { toast, showToast, hideToast } = useToast();
  const [feeValue, setFeeValue] = useState(initialData.defaultConsultationFee?.toString() ?? "");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: initialData.firstName ?? "",
      lastName: initialData.lastName ?? "",
    },
  });

  const onSubmit = async (data: ProfileUpdateInput) => {
    const formData = new FormData();
    formData.set("firstName", data.firstName);
    formData.set("lastName", data.lastName);

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) {
        showToast(result.error, "error");
      } else {
        showToast("تم تحديث الملف الشخصي بنجاح", "success");
      }
    });
  };

  const handleFeeSave = () => {
    startFeeTransition(async () => {
      const result = await updateFees(initialData.tenantId!, feeValue);
      if (result.error) {
        showToast(result.error, "error");
      } else {
        showToast("تم تحديث الكشفية بنجاح", "success");
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl">
        <CardTitle>المعلومات الشخصية</CardTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">الاسم الأول</label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">اسم العائلة</label>
              <Input id="lastName" {...register("lastName")} />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
            <Input value={initialData.email} disabled className="bg-slate-50 text-slate-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الدور</label>
              <Input value={roleLabels[initialData.role] ?? initialData.role} disabled className="bg-slate-50 text-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">العيادة</label>
              <Input value={initialData.tenantName ?? "—"} disabled className="bg-slate-50 text-slate-500" />
            </div>
          </div>
          <div className="pt-2">
            <Button type="submit" disabled={isPending}>{isPending ? "جاري الحفظ..." : "حفظ التغييرات"}</Button>
          </div>
        </form>
      </Card>

      {initialData.tenantId && (
        <Card className="max-w-2xl">
          <CardTitle>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              إعدادات الكشفية
            </div>
          </CardTitle>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-slate-500">سعر الكشفية الافتراضي للمواعيد الجديدة (لن يكون ظاهراً للمرضى)</p>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label htmlFor="consultationFee">الكشفية (دينار)</Label>
                <Input id="consultationFee" type="text" inputMode="numeric" dir="ltr" placeholder="مثال: 25000"
                  value={feeValue} onChange={(e) => setFeeValue(e.target.value.replace(/\D/g, ""))} />
              </div>
              <Button onClick={handleFeeSave} disabled={feePending} className="mb-0.5">
                {feePending ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={hideToast} />
    </div>
  );
}
