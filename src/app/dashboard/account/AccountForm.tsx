"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toast, useToast } from "@/components/ui/Toast";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/schemas/profile";
import { updateProfile } from "./actions";

interface AccountFormProps {
  initialData: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    tenantName: string | null;
  };
}

const roleLabels: Record<string, string> = {
  ADMIN: "مدير",
  DOCTOR: "طبيب",
  RECEPTIONIST: "موظف استقبال",
};

export default function AccountForm({ initialData }: AccountFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast, showToast, hideToast } = useToast();

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

  return (
    <Card className="max-w-2xl">
      <CardTitle>المعلومات الشخصية</CardTitle>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
              الاسم الأول
            </label>
            <Input
              id="firstName"
              {...register("firstName")}
              error={errors.firstName?.message}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
              اسم العائلة
            </label>
            <Input
              id="lastName"
              {...register("lastName")}
              error={errors.lastName?.message}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            البريد الإلكتروني
          </label>
          <Input
            id="email"
            value={initialData.email}
            disabled
            className="bg-slate-50 text-slate-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
              الدور
            </label>
            <Input
              id="role"
              value={roleLabels[initialData.role] ?? initialData.role}
              disabled
              className="bg-slate-50 text-slate-500"
            />
          </div>
          <div>
            <label htmlFor="tenantName" className="block text-sm font-medium text-slate-700 mb-1">
              العيادة
            </label>
            <Input
              id="tenantName"
              value={initialData.tenantName ?? "—"}
              disabled
              className="bg-slate-50 text-slate-500"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </form>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={hideToast}
      />
    </Card>
  );
}
