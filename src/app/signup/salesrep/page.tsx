"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Chrome,
  Loader2,
  Package,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
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
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { createClient } from "@/utils/supabase/client";

interface SalesRepFormState {
  name: string;
  email: string;
  phone: string;
  company: string;
  whatsapp: string;
}

interface ProductDraft {
  name: string;
  description: string;
  price: string;
}

interface DocumentDraft {
  type: string;
  label: string;
  file: File | null;
  uploaded: boolean;
}

interface RegisteredSalesRep {
  id: string;
  email: string;
  name: string;
  phone: string;
  company: string;
  whatsapp?: string | null;
  products?: ProductDraft[];
}

interface SalesRepSession {
  email: string;
  name: string;
}

function SalesRepSignupContent(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthed = searchParams.get("auth") === "1";

  const [mode, setMode] = useState<"login" | "form" | "success">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registeredId, setRegisteredId] = useState<string | null>(null);
  const [form, setForm] = useState<SalesRepFormState>({
    name: "",
    email: "",
    phone: "",
    company: "",
    whatsapp: "",
  });
  const [products, setProducts] = useState<ProductDraft[]>([
    { name: "", description: "", price: "" },
  ]);
  const [documents, setDocuments] = useState<DocumentDraft[]>([
    { type: "id_card", label: "صورة الهوية أو تخويل الشركة", file: null, uploaded: false },
  ]);

  useEffect(() => {
    if (!isAuthed) return;

    const resolveAuthenticatedRep = async (): Promise<void> => {
      setMode("form");

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let sessionEmail = user?.email ?? "";
      let sessionName =
        typeof user?.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : typeof user?.user_metadata?.name === "string"
            ? user.user_metadata.name
            : "";

      if (!sessionEmail) {
        const sessionResponse = await fetch("/api/salesrep/session");
        if (sessionResponse.ok) {
          const session = (await sessionResponse.json()) as SalesRepSession;
          sessionEmail = session.email;
          sessionName = session.name;
        }
      }

      if (!sessionEmail) {
        setError("لم نتمكن من قراءة جلسة Google. يمكنك إكمال البيانات يدويا هنا.");
        return;
      }

      setForm((current) => ({
        ...current,
        email: sessionEmail,
        name: current.name || sessionName,
      }));

      const response = await fetch(
        `/api/salesrep/register?email=${encodeURIComponent(sessionEmail)}`
      );

      if (response.ok) {
        const rep = (await response.json()) as RegisteredSalesRep;
        localStorage.setItem("salesrep", JSON.stringify(rep));
        router.replace("/salesrep");
        return;
      }

      setMode("form");
    };

    void resolveAuthenticatedRep();
  }, [isAuthed, router]);

  const filledProducts = useMemo(
    () => products.filter((product) => product.name.trim().length > 0),
    [products]
  );

  const handleGoogleSignIn = async (): Promise<void> => {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/salesrep-callback` },
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
  };

  const updateForm = (field: keyof SalesRepFormState, value: string): void => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const addProduct = (): void => {
    setProducts((current) => [...current, { name: "", description: "", price: "" }]);
  };

  const removeProduct = (index: number): void => {
    setProducts((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const updateProduct = (
    index: number,
    field: keyof ProductDraft,
    value: string
  ): void => {
    setProducts((current) =>
      current.map((product, currentIndex) =>
        currentIndex === index ? { ...product, [field]: value } : product
      )
    );
  };

  const handleFileChange = async (index: number, file: File | null): Promise<void> => {
    setDocuments((current) =>
      current.map((document, currentIndex) =>
        currentIndex === index ? { ...document, file, uploaded: false } : document
      )
    );

    if (!file || !registeredId) return;

    const document = documents[index];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("salesRepId", registeredId);
    formData.append("type", document.type);

    const response = await fetch("/api/salesrep/upload", { method: "POST", body: formData });

    if (response.ok) {
      setDocuments((current) =>
        current.map((item, currentIndex) =>
          currentIndex === index ? { ...item, uploaded: true } : item
        )
      );
    }
  };

  const submitForm = async (): Promise<void> => {
    if (filledProducts.length === 0) {
      setError("أضف منتجا واحدا على الأقل قبل إكمال التسجيل.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch("/api/salesrep/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        products: filledProducts.map((product) => ({
          ...product,
          price: product.price || undefined,
        })),
      }),
    });

    const data = (await response.json()) as RegisteredSalesRep & { error?: string };
    setLoading(false);

    if (!response.ok || !data.id) {
      setError(data.error || "تعذر إكمال تسجيل المندوب.");
      return;
    }

    setRegisteredId(data.id);
    localStorage.setItem("salesrep", JSON.stringify(data));
    setMode("success");
    window.setTimeout(() => router.push("/salesrep"), 1400);
  };

  if (mode === "success") {
    return (
      <CenteredShell>
        <Card className="w-full max-w-md rounded-xl text-center">
          <CardHeader>
            <CheckCircle2 className="mx-auto text-primary" />
            <CardTitle className="text-2xl font-black">تم تسجيل المندوب</CardTitle>
            <CardDescription className="text-base leading-7">
              سننقلك الآن إلى لوحة المندوبين لعرض العيادات المسجلة وإرسال عروضك.
            </CardDescription>
          </CardHeader>
        </Card>
      </CenteredShell>
    );
  }

  if (mode === "form") {
    return (
      <main
        className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8"
        dir="rtl"
      >
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <SalesRepIntro />
          <Card className="rounded-3xl border-slate-100 bg-white shadow-sm">
            <CardHeader>
              <Badge className="mb-2 w-fit bg-emerald-50 text-emerald-700">
                بيانات المندوب
              </Badge>
              <CardTitle className="text-2xl font-black text-slate-800">أكمل ملفك التجاري</CardTitle>
              <CardDescription className="text-base leading-7 text-slate-500">
                بعد الحفظ ستدخل إلى لوحة المندوبين حيث تظهر العيادات المسجلة.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void submitForm();
                }}
                className="flex flex-col gap-6"
              >
                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="الاسم الكامل">
                    <Input
                      required
                      value={form.name}
                      onChange={(event) => updateForm("name", event.target.value)}
                      className="h-10"
                    />
                  </Field>
                  <Field label="اسم الشركة">
                    <Input
                      required
                      value={form.company}
                      onChange={(event) => updateForm("company", event.target.value)}
                      className="h-10"
                    />
                  </Field>
                  <Field label="البريد الإلكتروني">
                    <Input
                      required
                      type="email"
                      value={form.email}
                      onChange={(event) => updateForm("email", event.target.value)}
                      className="h-10"
                    />
                  </Field>
                  <Field label="رقم الهاتف">
                    <Input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(event) => updateForm("phone", event.target.value)}
                      className="h-10"
                    />
                  </Field>
                  <Field label="واتساب">
                    <Input
                      type="tel"
                      value={form.whatsapp}
                      onChange={(event) => updateForm("whatsapp", event.target.value)}
                      className="h-10"
                    />
                  </Field>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-black">منتجاتك الطبية</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        هذه المنتجات ستظهر لك عند إرسال عرض خاص إلى عيادة.
                      </p>
                    </div>
                    <Button type="button" variant="outline" onClick={addProduct}>
                      <Plus data-icon="inline-start" />
                      إضافة منتج
                    </Button>
                  </div>

                  <div className="grid gap-3">
                    {products.map((product, index) => (
                        <div key={index} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <Badge variant="secondary">منتج {index + 1}</Badge>
                          {products.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeProduct(index)}
                              aria-label="حذف المنتج"
                            >
                              <Trash2 />
                            </Button>
                          )}
                        </div>
                        <div className="grid gap-3 md:grid-cols-[1fr_0.55fr]">
                          <Input
                            required
                            value={product.name}
                            onChange={(event) =>
                              updateProduct(index, "name", event.target.value)
                            }
                            placeholder="اسم المنتج"
                            className="h-10 bg-white"
                          />
                          <Input
                            value={product.price}
                            onChange={(event) =>
                              updateProduct(index, "price", event.target.value)
                            }
                            placeholder="السعر"
                            className="h-10 bg-white"
                          />
                        </div>
                        <Textarea
                          value={product.description}
                          onChange={(event) =>
                            updateProduct(index, "description", event.target.value)
                          }
                          placeholder="وصف مختصر للمنتج أو العرض"
                          className="mt-3 bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-6">
                  <h2 className="flex items-center gap-2 font-black">
                    <Upload />
                    توثيق اختياري
                  </h2>
                  {documents.map((document, index) => (
                    <div key={document.type} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <Label className="mb-2 block">{document.label}</Label>
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(event) =>
                          void handleFileChange(index, event.target.files?.[0] ?? null)
                        }
                        className="h-10 bg-white"
                      />
                      {document.uploaded && (
                        <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                          <CheckCircle2 />
                          تم رفع الملف
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <Button type="submit" disabled={loading} className="h-11 bg-emerald-600 text-base hover:bg-emerald-700">
                  {loading ? (
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                  ) : (
                    <ArrowLeft data-icon="inline-end" />
                  )}
                  {loading ? "جاري إكمال التسجيل..." : "إكمال التسجيل والدخول للوحة المندوب"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <CenteredShell>
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <SalesRepIntro />
        <Card className="rounded-3xl border-slate-100 bg-white shadow-sm">
          <CardHeader>
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/20">
              <Building2 />
            </div>
            <CardTitle className="text-2xl font-black text-slate-800">بوابة المندوبين الطبيين</CardTitle>
            <CardDescription className="text-base leading-7 text-slate-500">
              سجل الدخول أولا، ثم أكمل بيانات الشركة والمنتجات لتصل إلى لوحة العيادات.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button onClick={handleGoogleSignIn} disabled={loading} className="h-10 bg-emerald-600 hover:bg-emerald-700">
              {loading ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Chrome data-icon="inline-start" />
              )}
              {loading ? "جاري تحويلك..." : "تسجيل الدخول بحساب Google"}
            </Button>
            <Button variant="outline" asChild className="h-10 border-slate-200 text-slate-700 hover:bg-slate-50">
              <Link href="/salesrep">لدي حساب مندوب بالفعل</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/signup">
                أنا طبيب وأريد حساب عيادة
                <ArrowLeft data-icon="inline-end" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </CenteredShell>
  );
}

function SalesRepIntro(): React.ReactElement {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-800 p-6 text-white shadow-2xl shadow-emerald-500/20 sm:p-8 lg:p-10">
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
        حساب المندوبين فقط
      </Badge>
      <div className="flex flex-col gap-4">
        <h1 className="text-balance text-4xl font-black leading-tight sm:text-5xl">
          اعرض منتجاتك على الأطباء المسجلين بطريقة خاصة ومهنية.
        </h1>
        <p className="max-w-xl text-base leading-8 text-emerald-50">
          بعد التسجيل ستجد العيادات المسجلة، تختار الطبيب المناسب، تحدد المنتج، وترسل عرضا لا يختلط مع حسابات المرضى أو إدارة العيادة.
        </p>
      </div>
      <div className="grid max-w-xl gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
          <Package className="mb-3 text-emerald-300" />
          <p className="font-black">كتالوج منتجاتك</p>
          <p className="mt-1 text-sm leading-6 text-emerald-50">
            اسم المنتج، السعر، والوصف.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
          <Building2 className="mb-3 text-emerald-300" />
          <p className="font-black">عيادات مسجلة</p>
          <p className="mt-1 text-sm leading-6 text-emerald-50">
            ابحث واختر العيادة ثم أرسل العرض.
          </p>
        </div>
      </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function CenteredShell({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <main
      className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl items-center">
        {children}
      </div>
    </main>
  );
}

export default function SalesRepSignupPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <CenteredShell>
          <Loader2 className="mx-auto animate-spin text-primary" />
        </CenteredShell>
      }
    >
      <SalesRepSignupContent />
    </Suspense>
  );
}
