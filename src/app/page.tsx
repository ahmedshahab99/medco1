import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  LockKeyhole,
  Send,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { landingContent } from "@/lib/i18n/landing";
import { cn } from "@/lib/utils";

const statCards = [
  { value: "120+", label: "عيادة قابلة للربط", icon: Building2, tone: "bg-blue-50 text-blue-600" },
  { value: "24/7", label: "متابعة تشغيل", icon: Activity, tone: "bg-emerald-50 text-emerald-600" },
  { value: "خاص", label: "عروض مندوبين داخلية", icon: LockKeyhole, tone: "bg-violet-50 text-violet-600" },
  { value: "سريع", label: "تسجيل وفصل أدوار", icon: Sparkles, tone: "bg-amber-50 text-amber-600" },
];

export default function LandingPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900" dir="rtl">
      <HeroSection />
      <PathSection />
      <FeatureSection />
      <WorkflowSection />
      <TrustSection />
      <FinalCta />
    </main>
  );
}

function Header(): React.ReactElement {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-black tracking-tight text-white">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
            <Activity />
          </span>
          <span className="text-lg">ميدكو</span>
        </Link>
        <nav className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/10 p-1 backdrop-blur md:flex">
          {landingContent.nav.map((item) => (
            <Button key={item.href} variant="ghost" size="sm" asChild className="text-white hover:bg-white/10 hover:text-white">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            تسجيل الدخول
          </Link>
          <Button size="sm" asChild className="bg-white text-slate-900 hover:bg-slate-100">
            <Link href="/signup">
              إنشاء حساب
              <ArrowLeft data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function HeroSection(): React.ReactElement {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-800">
      <Header />
      <div className="absolute inset-0 -z-10 opacity-25 [background-image:linear-gradient(to_left,rgba(255,255,255,.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute -right-28 top-24 -z-10 size-96 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute -bottom-44 left-0 -z-10 size-[520px] rounded-full bg-blue-400/20 blur-3xl" />
      <div className="mx-auto grid min-h-[min(900px,100svh)] max-w-7xl items-center gap-10 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:pt-32">
        <div className="flex flex-col gap-7 text-white">
          <Badge className="h-7 w-fit border-white/20 bg-white/10 px-3 text-sm text-white">
            <Sparkles data-icon="inline-start" />
            {landingContent.hero.badge}
          </Badge>
          <div className="flex max-w-4xl flex-col gap-5">
            <h1 className="text-balance text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl">
              {landingContent.hero.title}
            </h1>
            <p className="max-w-2xl text-pretty text-base leading-8 text-indigo-100 sm:text-lg">
              {landingContent.hero.description}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="h-11 bg-white px-5 text-base text-slate-900 hover:bg-slate-100">
              <Link href="/signup">
                {landingContent.hero.doctorCta}
                <ArrowLeft data-icon="inline-end" />
              </Link>
            </Button>
          </div>
          <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-white/15">
                    <Icon />
                  </div>
                  <p className="text-xl font-black">{stat.value}</p>
                  <p className="mt-1 text-xs leading-5 text-indigo-100">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
        <DashboardPreview />
      </div>
    </section>
  );
}

function DashboardPreview(): React.ReactElement {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="rounded-3xl border border-white/20 bg-white/95 p-3 shadow-2xl shadow-slate-950/30">
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
          <div className="bg-gradient-to-l from-indigo-600 via-purple-600 to-blue-700 px-5 py-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black">{landingContent.dashboardPreview.title}</p>
                <p className="mt-1 text-xs text-indigo-100">{landingContent.dashboardPreview.subtitle}</p>
              </div>
              <Badge className="border-white/20 bg-white/15 text-white">
                <LockKeyhole data-icon="inline-start" />
                خاص
              </Badge>
            </div>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-[1fr_0.9fr]">
            <div className="flex flex-col gap-2">
              {landingContent.dashboardPreview.clinics.map((clinic, index) => (
                <div
                  key={clinic}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm",
                    index === 0 && "ring-2 ring-emerald-100"
                  )}
                >
                  <div>
                    <p className="text-sm font-black text-slate-800">{clinic}</p>
                    <p className="mt-1 text-xs text-slate-400">طبيب مسجل في ميدكو</p>
                  </div>
                  {index === 0 ? (
                    <CheckCircle2 className="text-emerald-500" />
                  ) : (
                    <ChevronLeft className="text-slate-300" />
                  )}
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                  <ClipboardList />
                </span>
                <div>
                  <p className="text-xs text-slate-400">المنتج المختار</p>
                  <p className="text-sm font-black text-slate-800">{landingContent.dashboardPreview.product}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-2 rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-black text-slate-700">تفاصيل العرض</p>
                <p className="text-xs leading-6 text-slate-500">
                  سعر خاص للعيادة، كمية أولية، وملاحظة يرسلها المندوب للطبيب فقط.
                </p>
              </div>
              <Button className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700">
                <Send data-icon="inline-start" />
                إرسال عرض خاص
              </Button>
              <p className="mt-3 text-center text-xs text-slate-400">{landingContent.dashboardPreview.status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PathSection(): React.ReactElement {
  return (
    <section id="paths" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="مسارات منفصلة"
          title="نفس فخامة لوحة الطبيب، لكن لكل دور بوابته الصحيحة."
          description="الطبيب يدخل لإدارة العيادة. المندوب يدخل إلى مساحة عروض خاصة تظهر فيها العيادات المسجلة فقط."
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {landingContent.paths.map((path, index) => {
            const Icon = path.icon;
            const gradient =
              index === 0
                ? "from-indigo-600 via-purple-600 to-blue-700"
                : "from-emerald-500 via-teal-500 to-cyan-600";

            return (
              <Card key={path.title} className="overflow-hidden rounded-3xl border-slate-100 bg-white shadow-sm">
                <CardHeader className={cn("bg-gradient-to-l p-6 text-white", gradient)}>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-white/15">
                    <Icon />
                  </div>
                  <CardTitle className="text-2xl font-black">{path.title}</CardTitle>
                  <CardDescription className="text-base leading-7 text-white/80">{path.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5 p-6">
                  <div className="grid gap-2 sm:grid-cols-3">
                    {path.points.map((point) => (
                      <div key={point} className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
                        {point}
                      </div>
                    ))}
                  </div>
                  <Button asChild className="w-fit bg-slate-900 hover:bg-slate-800">
                    <Link href={path.href}>
                      {path.cta}
                      <ArrowLeft data-icon="inline-end" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeatureSection(): React.ReactElement {
  return (
    <section id="features" className="border-y border-slate-100 bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="نظام عيادة كامل"
          title="واجهة عملية، ملونة، ومنظمة مثل لوحة الطبيب."
          description="كل جزء مصمم للمسح السريع: بطاقات واضحة، ألوان حالات، وأزرار مباشرة."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {landingContent.features.map((feature, index) => {
            const Icon = feature.icon;
            const tones = [
              "bg-blue-50 text-blue-600",
              "bg-emerald-50 text-emerald-600",
              "bg-amber-50 text-amber-600",
              "bg-violet-50 text-violet-600",
            ];

            return (
              <Card key={feature.title} className="rounded-2xl border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <CardHeader>
                  <div className={cn("mb-2 flex size-11 items-center justify-center rounded-xl", tones[index % tones.length])}>
                    <Icon />
                  </div>
                  <CardTitle className="font-black text-slate-800">{feature.title}</CardTitle>
                  <CardDescription className="leading-7 text-slate-500">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection(): React.ReactElement {
  return (
    <section id="workflow" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="كيف يعمل الربط"
          title="من التسجيل إلى العرض الخاص بثلاث خطوات."
          description="نفس المنتج، مساران واضحان: إدارة العيادة للأطباء، وعروض المنتجات للمندوبين."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {landingContent.workflow.map((step, index) => {
            const Icon = step.icon;

            return (
              <Card key={step.title} className="rounded-2xl border-slate-100 bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                      <Icon />
                    </div>
                    <Badge className="bg-slate-100 text-slate-600">0{index + 1}</Badge>
                  </div>
                  <CardTitle className="pt-4 text-xl font-black text-slate-800">{step.title}</CardTitle>
                  <CardDescription className="leading-7 text-slate-500">{step.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TrustSection(): React.ReactElement {
  return (
    <section id="trust" className="bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-14 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <Badge className="bg-white/10 text-white">ثقة وتشغيل</Badge>
          <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
            أدوار منفصلة، تجربة عربية، ولوحة تشعر أنها جزء من نفس النظام.
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {landingContent.trust.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Icon className="text-emerald-300" />
                <span className="text-sm font-bold">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCta(): React.ReactElement {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-8 text-center text-white shadow-2xl shadow-indigo-500/20 lg:p-12">
        <Badge className="bg-white/10 text-white">جاهز للانطلاق</Badge>
        <h2 className="mx-auto mt-5 max-w-4xl text-balance text-3xl font-black leading-tight sm:text-5xl">
          {landingContent.finalCta.title}
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-pretty text-base leading-8 text-indigo-100">
          {landingContent.finalCta.description}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild className="h-11 bg-white px-5 text-base text-slate-900 hover:bg-slate-100">
            <Link href="/signup">
              تسجيل الأطباء
              <ArrowLeft data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}): React.ReactElement {
  return (
    <div className="flex max-w-3xl flex-col gap-3">
      <Badge className="w-fit bg-emerald-50 text-emerald-700">{eyebrow}</Badge>
      <h2 className="text-balance text-3xl font-black leading-tight text-slate-900 sm:text-4xl">{title}</h2>
      <p className="text-pretty text-base leading-8 text-slate-500">{description}</p>
    </div>
  );
}
