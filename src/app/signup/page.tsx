"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Chrome,
  Loader2,
  Mail,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import { signup } from "./actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { signupWithGoogle } from "@/utils/supabase/signInGoogle";

const signUpSchema = z.object({
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح" }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage(): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: SignUpFormValues): void => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);

      const result = await signup(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(true);
      }
    });
  };

  const handleSignupWithGoogle = async (): Promise<void> => {
    setGoogleLoading(true);
    setError(null);

    const result = await signupWithGoogle();
    if (result?.error) {
      setError(result.error);
      setGoogleLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-800 p-6 text-white shadow-2xl shadow-indigo-500/20 sm:p-8 lg:p-10">
          <div className="absolute -right-20 top-10 size-72 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -bottom-24 left-0 size-80 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative flex flex-col gap-5">
          <Link href="/" className="flex w-fit items-center gap-2 font-black">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
              <ShieldCheck />
            </span>
            ميدكو
          </Link>
          <Badge className="w-fit border-white/10 bg-white/10 text-white">
            حساب الأطباء والعيادات
          </Badge>
          <div className="flex flex-col gap-4">
            <h1 className="text-balance text-4xl font-black leading-tight sm:text-5xl">
              افتح عيادتك الرقمية وابدأ بإدارة المرضى والمواعيد باحتراف.
            </h1>
            <p className="max-w-xl text-base leading-8 text-indigo-100">
              هذا المسار مخصص للأطباء والعيادات فقط. إذا كنت مندوبا طبيا فستجد بوابة منفصلة لإضافة منتجاتك والوصول إلى العيادات المسجلة.
            </p>
          </div>
          <div className="grid max-w-xl gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <Stethoscope className="mb-3 text-emerald-300" />
              <p className="font-black">لوحة عيادة كاملة</p>
              <p className="mt-1 text-sm leading-6 text-indigo-100">
                مرضى، حجوزات، وصفات، وفواتير.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <Building2 className="mb-3 text-emerald-300" />
              <p className="font-black">إعداد سريع</p>
              <p className="mt-1 text-sm leading-6 text-indigo-100">
                بعد الدخول يمكنك إكمال بيانات العيادة.
              </p>
            </div>
          </div>
          </div>
        </section>

        <Card className="rounded-3xl border-slate-100 bg-white shadow-sm">
          <CardHeader>
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm shadow-blue-500/20">
              <Stethoscope />
            </div>
            <CardTitle className="text-2xl font-black text-slate-800">تسجيل طبيب أو عيادة</CardTitle>
            <CardDescription className="text-base leading-7 text-slate-500">
              اختر Google للدخول السريع أو أرسل رابط تحقق إلى بريدك الإلكتروني.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {success ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
                <CheckCircle2 className="mx-auto mb-3 text-emerald-600" />
                <h2 className="font-black text-slate-800">تحقق من بريدك الإلكتروني</h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  أرسلنا رابط الدخول إلى بريدك. افتح الرابط لإكمال إنشاء حساب الطبيب.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSuccess(false)}
                >
                  استخدام بريد آخر
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-slate-700">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@example.com"
                    aria-invalid={Boolean(errors.email)}
                    className="h-10 text-right"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isPending} className="h-10">
                  {isPending ? (
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                  ) : (
                    <Mail data-icon="inline-start" />
                  )}
                  {isPending ? "جاري إرسال الرابط..." : "إرسال رابط الدخول"}
                </Button>
              </form>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleSignupWithGoogle}
              disabled={googleLoading}
              className="h-10"
            >
              {googleLoading ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Chrome data-icon="inline-start" />
              )}
              التسجيل بحساب Google
            </Button>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-500">
              هل أنت مندوب طبي؟
              <Button variant="link" asChild className="h-auto px-2">
                <Link href="/signup/salesrep">
                  انتقل إلى تسجيل المندوبين
                  <ArrowLeft data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
