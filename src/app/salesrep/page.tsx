"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  LogOut,
  Package,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  XCircle,
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
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

interface SalesRepProduct {
  id: string;
  name: string;
  description?: string | null;
  price?: string | number | null;
}

interface SalesRep {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  whatsapp?: string | null;
  products?: SalesRepProduct[];
}

interface SalesRepSession {
  email: string;
  name: string;
}

interface DoctorTenant {
  id: string;
  name: string;
  slug?: string | null;
  phone?: string | null;
  address?: string | null;
  doctor: string;
}

type OfferStatus = "pending" | "viewed" | "accepted" | "rejected";

interface Offer {
  id: string;
  status: OfferStatus;
  notes?: string | null;
  createdAt: string;
  salesRep: { name: string; company: string };
  product: SalesRepProduct;
  tenant: { name: string };
}

const statusConfig: Record<
  OfferStatus,
  { label: string; variant: "warning" | "secondary" | "success" | "danger"; icon: typeof Clock }
> = {
  pending: { label: "قيد الانتظار", variant: "warning", icon: Clock },
  viewed: { label: "تمت المشاهدة", variant: "secondary", icon: Eye },
  accepted: { label: "مقبول", variant: "success", icon: CheckCircle2 },
  rejected: { label: "مرفوض", variant: "danger", icon: XCircle },
};

export default function SalesRepPortal(): React.ReactElement {
  const router = useRouter();
  const [rep, setRep] = useState<SalesRep | null>(() => {
    if (typeof window === "undefined") return null;

    const saved = window.localStorage.getItem("salesrep");
    return saved ? (JSON.parse(saved) as SalesRep) : null;
  });
  const [email, setEmail] = useState("");
  const [sessionResolving, setSessionResolving] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [doctors, setDoctors] = useState<DoctorTenant[]>([]);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"doctors" | "offers">("doctors");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorTenant | null>(null);
  const [offerNote, setOfferNote] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState("");

  const fetchDoctors = useCallback(async (): Promise<void> => {
    setDoctorLoading(true);
    const response = await fetch("/api/salesrep/doctors");
    if (response.ok) {
      const data = (await response.json()) as DoctorTenant[];
      setDoctors(data);
    }
    setDoctorLoading(false);
  }, []);

  const fetchOffers = useCallback(async (repId: string): Promise<void> => {
    const response = await fetch(`/api/salesrep/offers?salesRepId=${repId}`);
    if (response.ok) {
      const data = (await response.json()) as Offer[];
      setOffers(data);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadInitialData = async (): Promise<void> => {
      let activeRep = rep;

      if (!activeRep) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let sessionEmail = user?.email ?? "";
        if (!sessionEmail) {
          const sessionResponse = await fetch("/api/salesrep/session");
          if (sessionResponse.ok) {
            const session = (await sessionResponse.json()) as SalesRepSession;
            sessionEmail = session.email;
          }
        }

        if (sessionEmail) {
          const repResponse = await fetch(
            `/api/salesrep/register?email=${encodeURIComponent(sessionEmail)}`
          );

          if (repResponse.ok) {
            activeRep = (await repResponse.json()) as SalesRep;
            if (!ignore) {
              setRep(activeRep);
              localStorage.setItem("salesrep", JSON.stringify(activeRep));
            }
          } else if (!ignore) {
            setEmail(sessionEmail);
            router.replace("/signup/salesrep?auth=1");
            return;
          }
        }
      }

      if (activeRep) {
        const offersResponse = await fetch(`/api/salesrep/offers?salesRepId=${activeRep.id}`);
        if (offersResponse.ok && !ignore) {
          const data = (await offersResponse.json()) as Offer[];
          setOffers(data);
        }
      }

      const doctorsResponse = await fetch("/api/salesrep/doctors");
      if (doctorsResponse.ok && !ignore) {
        const data = (await doctorsResponse.json()) as DoctorTenant[];
        setDoctors(data);
      }

      if (!ignore) setDoctorLoading(false);
      if (!ignore) setSessionResolving(false);
    };

    void loadInitialData();

    return () => {
      ignore = true;
    };
  }, [rep, router]);

  const filteredDoctors = useMemo(() => {
    const normalizedSearch = search.trim();
    if (!normalizedSearch) return doctors;

    return doctors.filter((doctor) =>
      [doctor.name, doctor.doctor, doctor.address ?? "", doctor.phone ?? ""].some((value) =>
        value.includes(normalizedSearch)
      )
    );
  }, [doctors, search]);

  const pendingCount = offers.filter((offer) => offer.status === "pending").length;
  const acceptedCount = offers.filter((offer) => offer.status === "accepted").length;

  const login = async (): Promise<void> => {
    setLoginLoading(true);
    setLoginError("");

    const response = await fetch(`/api/salesrep/register?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      setLoginError("هذا البريد غير مسجل كمندوب. يمكنك إنشاء حساب مندوب جديد.");
      setLoginLoading(false);
      return;
    }

    const data = (await response.json()) as SalesRep;
    setRep(data);
    localStorage.setItem("salesrep", JSON.stringify(data));
    await fetchOffers(data.id);
    setLoginLoading(false);
  };

  const logout = (): void => {
    setRep(null);
    localStorage.removeItem("salesrep");
    setEmail("");
    setOffers([]);
  };

  const sendOffer = async (): Promise<void> => {
    if (!rep || !selectedDoctor || !selectedProduct) return;

    setSending(true);
    const response = await fetch("/api/salesrep/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        salesRepId: rep.id,
        tenantId: selectedDoctor.id,
        productId: selectedProduct,
        notes: offerNote,
      }),
    });
    setSending(false);

    if (response.ok) {
      setDone(`تم إرسال العرض إلى ${selectedDoctor.name}.`);
      setSelectedDoctor(null);
      setOfferNote("");
      setSelectedProduct("");
      await fetchOffers(rep.id);
    }
  };

  if (!rep && sessionResolving) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-slate-50"
        dir="rtl"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-4 text-sm font-bold text-slate-700 shadow-sm">
          <Loader2 className="animate-spin text-emerald-500" />
          جاري التحقق من حساب المندوب...
        </div>
      </main>
    );
  }

  if (!rep) {
    return (
      <main
        className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8"
        dir="rtl"
      >
        <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-center">
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
              دخول المندوبين
            </Badge>
            <h1 className="text-balance text-4xl font-black leading-tight sm:text-5xl">
              ادخل إلى لوحة المندوبين وشاهد العيادات المسجلة لإرسال عروضك الخاصة.
            </h1>
            <p className="max-w-xl text-base leading-8 text-emerald-50">
              هذه البوابة منفصلة عن حسابات الأطباء. بعد الدخول يمكنك اختيار العيادة، تحديد المنتج، وإرسال عرض دواء أو مستلزم طبي بشكل خاص.
            </p>
            </div>
          </section>
          <Card className="rounded-3xl border-slate-100 bg-white shadow-sm">
            <CardHeader>
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/20">
                <Building2 />
              </div>
              <CardTitle className="text-2xl font-black text-slate-800">دخول مندوب مسجل</CardTitle>
              <CardDescription className="text-base leading-7 text-slate-500">
                أدخل البريد الذي استخدمته عند التسجيل كمندوب.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {loginError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {loginError}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Label htmlFor="rep-email">البريد الإلكتروني</Label>
                <Input
                  id="rep-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="rep@example.com"
                  className="h-10 text-right"
                />
              </div>
              <Button onClick={login} disabled={loginLoading || !email} className="h-10 bg-emerald-600 hover:bg-emerald-700">
                {loginLoading ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : (
                  <ArrowLeft data-icon="inline-end" />
                )}
                دخول إلى لوحة المندوب
              </Button>
              <Button variant="outline" asChild className="h-10 border-slate-200 text-slate-700 hover:bg-slate-50">
                <Link href="/signup/salesrep">إنشاء حساب مندوب جديد</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900" dir="rtl">
      <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-sm">
                <Building2 />
              </span>
              <div>
                <h1 className="font-black text-slate-800">لوحة المندوبين</h1>
                <p className="text-sm text-slate-400">
                  {rep.name} · {rep.company}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  void fetchDoctors();
                  void fetchOffers(rep.id);
                }}
                aria-label="تحديث"
              >
                <RefreshCw />
              </Button>
              <Button variant="ghost" onClick={logout}>
                <LogOut data-icon="inline-start" />
                خروج
              </Button>
            </div>
          </div>
          <div className="flex w-fit rounded-xl bg-slate-100 p-1">
            <Button
              variant={tab === "doctors" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab("doctors")}
            >
              العيادات المسجلة
            </Button>
            <Button
              variant={tab === "offers" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab("offers")}
            >
              عروضي
              {pendingCount > 0 && <Badge variant="warning">{pendingCount}</Badge>}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
        <aside className="grid gap-4 self-start lg:sticky lg:top-32">
          <Card className="overflow-hidden rounded-3xl border-slate-100 bg-white shadow-sm">
            <div className="h-2 bg-gradient-to-l from-emerald-500 to-teal-500" />
            <CardHeader>
              <CardTitle className="font-black text-slate-800">ملف المندوب</CardTitle>
              <CardDescription>{rep.email}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Metric label="المنتجات" value={String(rep.products?.length ?? 0)} />
              <Metric label="عروض قيد الانتظار" value={String(pendingCount)} />
              <Metric label="عروض مقبولة" value={String(acceptedCount)} />
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-100 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="font-black text-slate-800">منتجاتك</CardTitle>
              <CardDescription>تظهر هذه المنتجات عند إرسال عرض خاص.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {(rep.products ?? []).map((product) => (
                <div key={product.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-sm font-black text-slate-800">{product.name}</p>
                  {product.price && (
                    <p className="mt-1 text-xs text-emerald-700">
                      {Number(product.price).toLocaleString("ar-IQ")} د.ع
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        <section className="grid gap-4">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-l from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white shadow-lg shadow-emerald-500/15">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <Badge className="border-white/20 bg-white/15 text-white">مساحة عروض خاصة</Badge>
                <h2 className="mt-4 text-3xl font-black leading-tight">
                  اختر العيادة، حدد المنتج، وأرسل العرض للطبيب مباشرة.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-emerald-50">
                  هذه اللوحة منفصلة عن إعدادات الأطباء وتعرض لك العيادات المسجلة فقط حتى تقدم عروضك بشكل مهني وخاص.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-2xl font-black">{doctors.length}</p>
                  <p className="text-xs text-emerald-50">عيادة</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-2xl font-black">{offers.length}</p>
                  <p className="text-xs text-emerald-50">عرض</p>
                </div>
              </div>
            </div>
          </div>

          {done && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              <CheckCircle2 />
              {done}
            </div>
          )}

          {tab === "doctors" ? (
            <DoctorsPanel
              doctors={filteredDoctors}
              loading={doctorLoading}
              search={search}
              selectedDoctor={selectedDoctor}
              selectedProduct={selectedProduct}
              products={rep.products ?? []}
              offerNote={offerNote}
              sending={sending}
              onSearch={setSearch}
              onSelectDoctor={(doctor) =>
                setSelectedDoctor(selectedDoctor?.id === doctor.id ? null : doctor)
              }
              onSelectedProduct={setSelectedProduct}
              onOfferNote={setOfferNote}
              onSendOffer={() => {
                void sendOffer();
              }}
            />
          ) : (
            <OffersPanel offers={offers} />
          )}
        </section>
      </div>
    </main>
  );
}

function DoctorsPanel({
  doctors,
  loading,
  search,
  selectedDoctor,
  selectedProduct,
  products,
  offerNote,
  sending,
  onSearch,
  onSelectDoctor,
  onSelectedProduct,
  onOfferNote,
  onSendOffer,
}: {
  doctors: DoctorTenant[];
  loading: boolean;
  search: string;
  selectedDoctor: DoctorTenant | null;
  selectedProduct: string;
  products: SalesRepProduct[];
  offerNote: string;
  sending: boolean;
  onSearch: (value: string) => void;
  onSelectDoctor: (doctor: DoctorTenant) => void;
  onSelectedProduct: (value: string) => void;
  onOfferNote: (value: string) => void;
  onSendOffer: () => void;
}): React.ReactElement {
  return (
    <>
      <Card className="rounded-3xl border-slate-100 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-black">العيادات المسجلة</CardTitle>
          <CardDescription className="text-base leading-7 text-slate-500">
            اختر عيادة مسجلة في ميدكو وأرسل عرضا خاصا من منتجاتك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute right-3 top-3 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="ابحث باسم العيادة أو الطبيب أو العنوان"
              className="h-11 border-slate-200 bg-slate-50 pe-10 focus-visible:border-emerald-300 focus-visible:ring-emerald-500/20"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="rounded-3xl border-slate-100 bg-white shadow-sm">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-emerald-500" />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {doctors.map((doctor) => (
            <Card
              key={doctor.id}
              className={cn(
                "rounded-3xl border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                selectedDoctor?.id === doctor.id && "border-emerald-200 ring-2 ring-emerald-100"
              )}
            >
              <CardHeader>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <CardTitle className="font-black text-slate-800">{doctor.name}</CardTitle>
                    <CardDescription className="mt-1 text-slate-500">
                      {doctor.doctor || "طبيب مسجل"} {doctor.address ? `· ${doctor.address}` : ""}
                    </CardDescription>
                  </div>
                  <Button
                    variant={selectedDoctor?.id === doctor.id ? "default" : "outline"}
                    onClick={() => onSelectDoctor(doctor)}
                    className={cn(
                      selectedDoctor?.id === doctor.id
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {selectedDoctor?.id === doctor.id ? "إغلاق العرض" : "إرسال عرض"}
                  </Button>
                </div>
              </CardHeader>
              {selectedDoctor?.id === doctor.id && (
                <CardContent className="flex flex-col gap-3 border-t border-slate-100 pt-4">
                  <div className="grid gap-3 md:grid-cols-[0.8fr_1.2fr]">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`product-${doctor.id}`}>المنتج</Label>
                      <select
                        id={`product-${doctor.id}`}
                        value={selectedProduct}
                        onChange={(event) => onSelectedProduct(event.target.value)}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:border-emerald-300 focus-visible:ring-3 focus-visible:ring-emerald-500/20"
                      >
                        <option value="">اختر منتجا</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`note-${doctor.id}`}>تفاصيل العرض</Label>
                      <Textarea
                        id={`note-${doctor.id}`}
                        value={offerNote}
                        onChange={(event) => onOfferNote(event.target.value)}
                        placeholder="اكتب السعر الخاص أو الكمية أو ملاحظة الطبيب"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={onSendOffer}
                    disabled={sending || !selectedProduct}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {sending ? (
                      <Loader2 data-icon="inline-start" className="animate-spin" />
                    ) : (
                      <Send data-icon="inline-start" />
                    )}
                    إرسال العرض الخاص
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function OffersPanel({ offers }: { offers: Offer[] }): React.ReactElement {
  if (offers.length === 0) {
    return (
      <Card className="rounded-3xl border-slate-100 bg-white text-center shadow-sm">
        <CardHeader>
          <Package className="mx-auto text-emerald-500" />
          <CardTitle className="font-black">لا توجد عروض بعد</CardTitle>
          <CardDescription>أرسل أول عرض إلى عيادة مسجلة وسيظهر هنا.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {offers.map((offer) => {
        const config = statusConfig[offer.status] ?? statusConfig.pending;
        const StatusIcon = config.icon;

        return (
          <Card key={offer.id} className="rounded-3xl border-slate-100 bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <CardTitle className="font-black text-slate-800">{offer.product.name}</CardTitle>
                  <CardDescription className="mt-1 text-slate-500">
                    {offer.tenant.name} · {offer.salesRep.company}
                  </CardDescription>
                </div>
                <Badge variant={config.variant}>
                  <StatusIcon data-icon="inline-start" />
                  {config.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {offer.product.description && (
                <p className="text-sm leading-7 text-slate-500">
                  {offer.product.description}
                </p>
              )}
              {offer.product.price && (
                <p className="text-sm font-black text-emerald-700">
                  {Number(offer.product.price).toLocaleString("ar-IQ")} د.ع
                </p>
              )}
              {offer.notes && <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">{offer.notes}</p>}
              <p className="text-xs text-slate-400">
                {new Date(offer.createdAt).toLocaleDateString("ar-IQ")}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-black text-slate-800">{value}</span>
    </div>
  );
}
