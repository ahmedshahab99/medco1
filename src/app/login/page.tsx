"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Chrome, Loader2, ShieldCheck, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { signupWithGoogle } from "@/utils/supabase/signInGoogle";

export default function LoginPage(): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    const result = await signupWithGoogle();
    if (result?.error) { setError(result.error); setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8" dir="rtl">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-800 p-6 text-white shadow-2xl shadow-indigo-500/20 sm:p-8 lg:p-10">
            <div className="absolute -right-20 top-10 size-72 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -bottom-24 left-0 size-80 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="relative flex flex-col gap-5">
              <Link href="/" className="flex w-fit items-center gap-2 font-black">
                <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20"><ShieldCheck /></span>
                ميدكو
              </Link>
              <Badge className="w-fit border-white/10 bg-white/10 text-white">نظام إدارة العيادات</Badge>
              <div className="flex flex-col gap-4">
                <h1 className="text-balance text-4xl font-black leading-tight sm:text-5xl">مرحباً بعودتك</h1>
                <p className="max-w-xl text-base leading-8 text-indigo-100">سجل دخولك للوصول إلى لوحة تحكم عيادتك وإدارة المرضى والمواعيد والفواتير.</p>
              </div>
              <div className="grid max-w-xl gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <Stethoscope className="mb-3 text-emerald-300" />
                  <p className="font-black">إدارة المرضى</p>
                  <p className="mt-1 text-sm leading-6 text-indigo-100">سجلات كاملة وتاريخ طبي.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <Stethoscope className="mb-3 text-emerald-300" />
                  <p className="font-black">المواعيد والفواتير</p>
                  <p className="mt-1 text-sm leading-6 text-indigo-100">تقويم ذكي وتقارير مالية.</p>
                </div>
              </div>
            </div>
          </section>

          <Card className="rounded-3xl border-slate-100 bg-white shadow-sm">
            <CardHeader>
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm shadow-blue-500/20"><Stethoscope /></div>
              <CardTitle className="text-2xl font-black text-slate-800">تسجيل دخول الأطباء</CardTitle>
              <CardDescription className="text-base leading-7 text-slate-500">استخدم حساب Google للوصول إلى لوحة العيادة.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
              <Button onClick={handleGoogleSignIn} disabled={loading} className="h-10 w-full">
                {loading ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Chrome data-icon="inline-start" />}
                {loading ? "جاري تسجيل الدخول..." : "الدخول بحساب Google"}
              </Button>
              <Button variant="outline" asChild className="h-10 w-full border-slate-200 text-slate-700 hover:bg-slate-50">
                <Link href="/signup">إنشاء حساب جديد<ArrowLeft data-icon="inline-end" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
