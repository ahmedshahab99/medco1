"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  Chrome,
  Loader2,
  ShieldCheck,
  Stethoscope,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { signupWithGoogle } from "@/utils/supabase/signInGoogle";

export default function LoginPage(): React.ReactElement {
  const [loading, setLoading] = useState<"doctor" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDoctorGoogleSignIn = async (): Promise<void> => {
    setLoading("doctor");
    setError(null);

    const result = await signupWithGoogle();
    if (result?.error) {
      setError(result.error);
      setLoading(null);
    }
  };

  return (
    <main
      className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-800 p-6 text-white shadow-2xl shadow-indigo-500/20 sm:p-8 lg:p-10">
            <div className="absolute -right-20 top-10 size-72 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -bottom-24 left-0 size-80 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="relative flex flex-col gap-5">
            <Link href="/" className="flex w-fit items-center gap-2 font-black">
              <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
                <ShieldCheck />
              </span>
              ميدكو
            </Link>
            <Badge className="w-fit border-white/10 bg-white/10 text-white">
              دخول منفصل حسب نوع الحساب
            </Badge>
            <div className="flex flex-col gap-4">
              <h1 className="text-balance text-4xl font-black leading-tight sm:text-5xl">
                اختر البوابة الصحيحة لتصل إلى لوحة التحكم المناسبة لك.
              </h1>
              <p className="max-w-xl text-base leading-8 text-indigo-100">
                الأطباء يدخلون إلى لوحة العيادة، والمندوبون يدخلون إلى بوابة العروض حيث تظهر لهم العيادات المسجلة لإرسال عروض الأدوية بشكل خاص.
              </p>
            </div>
            <div className="grid max-w-xl gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <Stethoscope className="mb-3 text-emerald-300" />
                <p className="font-black">طبيب أو عيادة</p>
                <p className="mt-1 text-sm leading-6 text-indigo-100">
                  المرضى، المواعيد، الوصفات، والفواتير.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <UsersRound className="mb-3 text-emerald-300" />
                <p className="font-black">مندوب طبي</p>
                <p className="mt-1 text-sm leading-6 text-indigo-100">
                  المنتجات، العيادات، والعروض الخاصة.
                </p>
              </div>
            </div>
            </div>
          </section>

          <section className="grid gap-4">
            <Card className="rounded-3xl border-slate-100 bg-white shadow-sm">
              <CardHeader>
                <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm shadow-blue-500/20">
                  <Stethoscope />
                </div>
                <CardTitle className="text-2xl font-black text-slate-800">دخول الأطباء والعيادات</CardTitle>
                <CardDescription className="text-base leading-7 text-slate-500">
                  استخدم حساب Google للوصول إلى لوحة العيادة أو إكمال إعدادها.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <Button
                  type="button"
                  onClick={handleDoctorGoogleSignIn}
                  disabled={loading === "doctor"}
                  className="h-10 w-full"
                >
                  {loading === "doctor" ? (
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                  ) : (
                    <Chrome data-icon="inline-start" />
                  )}
                  {loading === "doctor" ? "جاري تسجيل الدخول..." : "الدخول بحساب Google"}
                </Button>
                <Button variant="outline" asChild className="h-10 w-full border-slate-200 text-slate-700 hover:bg-slate-50">
                  <Link href="/signup">
                    إنشاء حساب طبيب
                    <ArrowLeft data-icon="inline-end" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm">
              <CardHeader>
                <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/20">
                  <Building2 />
                </div>
                <CardTitle className="text-2xl font-black text-slate-800">بوابة المندوبين</CardTitle>
                <CardDescription className="text-base leading-7 text-slate-500">
                  دخول المندوب يأخذك مباشرة إلى لوحة المندوبين لعرض العيادات المسجلة وإرسال عروض المنتجات.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-10 flex-1 bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/salesrep">
                    دخول المندوبين
                    <ArrowLeft data-icon="inline-end" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-10 flex-1 border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50">
                  <Link href="/signup/salesrep">تسجيل مندوب جديد</Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
