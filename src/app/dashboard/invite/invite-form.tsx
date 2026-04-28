'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createInvitation } from './actions'
import { Send, Loader2, AlertCircle, Mail, UserCog, CheckCircle2 } from 'lucide-react'

const inviteSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  role: z.enum(["DOCTOR", "RECEPTIONIST"], { message: "الرجاء اختيار الدور" }),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export function InviteForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "DOCTOR" },
  });

  const onSubmit = (data: InviteFormValues) => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("role", data.role);

      const result = await createInvitation(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(true);
        reset();
      }
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-start text-sm border border-red-100">
            <AlertCircle className="w-4 h-4 ms-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl flex items-start text-sm border border-emerald-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-4 h-4 ms-2 mt-0.5 flex-shrink-0" />
            <p>تم إرسال رابط تسجيل الدخول إلى البريد الإلكتروني المدعو.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              البريد الإلكتروني
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="doctor@example.com"
              className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm transition-all outline-none text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 ${
                errors.email ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <UserCog className="w-3.5 h-3.5" />
              الدور
            </label>
            <select
              {...register("role")}
              className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm transition-all outline-none text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                errors.role ? "border-red-300" : "border-gray-200"
              }`}
            >
              <option value="DOCTOR">طبيب</option>
              <option value="RECEPTIONIST">موظف استقبال</option>
            </select>
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جارٍ إرسال الدعوة...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              إرسال دعوة
            </>
          )}
        </button>
      </form>
    </div>
  );
}
