"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LogoUploader } from "@/components/features/setup/LogoUploader";
import { submitSetupWizard, checkSlugAvailability } from "./actions";
import { Store, Phone, AlignLeft, MapPin, Building2, ChevronLeft, ChevronRight, Loader2, X, Link, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { SLUG_REGEX } from "@/lib/slug-utils";

// Dynamically import map to avoid SSR issues with Leaflet
const MapLocationPicker = dynamic(
  () => import("@/components/features/setup/MapLocationPicker").then((mod) => mod.MapLocationPicker),
  { ssr: false, loading: () => <div className="w-full h-[300px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">جاري تحميل الخريطة...</div> }
);

const setupSchema = z.object({
  name: z.string().min(2, "اسم العيادة مطلوب ويجب أن يكون حرفين على الأقل"),
  slug: z
    .string()
    .min(3, "الرابط يجب أن يكون 3 أحرف على الأقل")
    .max(30, "الرابط يجب ألا يتجاوز 30 حرف")
    .regex(SLUG_REGEX, "الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة، أرقام، وشرطات فقط"),
  phone: z
    .string()
    .regex(/^(\+964|0)?[1-9]\d{9}$/, "رقم الهاتف غير صحيح (مثال: +964 771 123 4567)")
    ,
  bio: z.string().max(500, "الوصف يجب ألا يتجاوز 500 حرف").optional(),
  logo: z.string().url("رابط الشعار غير صحيح").optional().or(z.literal("")),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type SetupFormData = z.infer<typeof setupSchema>;

export default function SetupWizard() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken" | "reserved" | "invalid">("idle");
  const [slugError, setSlugError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,

    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      phone: "07",
      bio: "",
      logo: "",
      address: "",
    },
  });

  const slugValue = watch("slug");

  useEffect(() => {
    if (!slugValue || slugValue.length === 0) {
      setSlugStatus("idle");
      setSlugError(null);
      return;
    }

    if (slugValue.length < 3) {
      setSlugStatus("invalid");
      setSlugError("الرابط يجب أن يكون 3 أحرف على الأقل");
      return;
    }

    if (slugValue.length > 30) {
      setSlugStatus("invalid");
      setSlugError("الرابط يجب ألا يتجاوز 30 حرف");
      return;
    }

    if (!SLUG_REGEX.test(slugValue)) {
      setSlugStatus("invalid");
      setSlugError("الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة، أرقام، وشرطات فقط");
      return;
    }

    const timer = setTimeout(async () => {
      setSlugStatus("checking");
      setSlugError(null);
      const result = await checkSlugAvailability(slugValue);
      if (!result.available) {
        setSlugStatus(result.error?.includes("محجوز") ? "reserved" : "taken");
        setSlugError(result.error || null);
      } else {
        setSlugStatus("available");
        setSlugError(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [slugValue]);

  const onSubmit = async (data: SetupFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.slug) formData.append("slug", data.slug);
    if (data.phone) formData.append("phone", data.phone);
    if (data.bio) formData.append("bio", data.bio);
    if (data.logo) formData.append("logo", data.logo);
    if (data.address) formData.append("address", data.address);
    if (data.latitude) formData.append("latitude", data.latitude.toString());
    if (data.longitude) formData.append("longitude", data.longitude.toString());

    const result = await submitSetupWizard(formData);

    if (result?.error) {
      setServerError(result.error);
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (errors.name || errors.slug) return;
      if (!watch("name") || watch("name").length < 2) return;
      if (!watch("slug") || watch("slug").length < 3) return;
      if (slugStatus !== "available") return;
      setStep(2);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-blue-100 selection:text-blue-900 font-sans">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header / Steps */}
        <div className="bg-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">إعداد العيادة الجديدة</h1>
              <p className="text-slate-300 text-sm mt-1">لنقم بضبط إعدادات عيادتك لتبدأ في إدارة مرضاك بكفاءة.</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mt-8 relative">
            <div className="absolute top-1/2 mt-[6px] left-0 right-0 h-[2px] bg-slate-700 z-0" />
            <div className={`absolute top-1/2 mt-[6px] right-0 h-[2px] bg-blue-500 z-0 transition-all duration-500 ${step === 2 ? 'w-full' : 'w-1/2'}`} />
            
            <div className="flex flex-col items-center z-10 gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 1 ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-700 text-slate-400'}`}>1</div>
              <span className={`text-xs font-medium ${step >= 1 ? 'text-white' : 'text-slate-400'}`}>البيانات الأساسية</span>
            </div>
            
            <div className="flex flex-col items-center z-10 gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= 2 ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-700 text-slate-400'}`}>2</div>
              <span className={`text-xs font-medium ${step >= 2 ? 'text-white' : 'text-slate-400'}`}>الموقع والشعار</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8">
          
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start gap-3">
              <div className="bg-red-100 p-1 rounded-full"></div>
              <p className="text-sm font-medium">{serverError}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Store className="w-4 h-4 text-blue-500" /> اسم العيادة <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
                  placeholder="مثال: عيادة السن السليم"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Link className="w-4 h-4 text-blue-500" /> الرابط العام <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-500">هذا هو الرابط الذي سيشاركه المرضى للوصول لعيادتك</p>
                
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition">
                  <span className="text-slate-400 text-sm whitespace-nowrap">yourdomain.com/clinic/</span>
                  <input
                    {...register("slug")}
                    dir="ltr"
                    className="flex-1 bg-transparent outline-none text-sm font-mono min-w-0"
                    placeholder="my-clinic"
                  />
                </div>
                
                <p className="text-xs text-slate-400">مثال: yourdomain.com/clinic/dental-care</p>
                
                <div aria-live="polite" className="min-h-[20px]">
                  {slugStatus === "checking" && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> جاري التحقق...
                    </p>
                  )}
                  {slugStatus === "available" && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> هذا الرابط متاح!
                    </p>
                  )}
                  {slugStatus === "taken" && slugError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> {slugError}
                    </p>
                  )}
                  {slugStatus === "reserved" && slugError && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {slugError}
                    </p>
                  )}
                  {slugStatus === "invalid" && slugError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> {slugError}
                    </p>
                  )}
                  {errors.slug && <p className="text-red-500 text-xs flex items-center gap-1">{errors.slug.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Phone className="w-4 h-4 text-blue-500" /> رقم الهاتف
                </label>
                <input
                  {...register("phone")}
                  dir="ltr"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none text-right"
                  placeholder="+966 50 123 4567"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <AlignLeft className="w-4 h-4 text-blue-500" /> نبذة عن العيادة
                </label>
                <textarea
                  {...register("bio")}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none resize-none"
                  placeholder="اختصاصات العيادة، أوقات العمل، ورسالتها..."
                />
                {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!watch("name") || watch("name").length < 2  || !watch("slug") || watch("slug").length < 3 || slugStatus !== "available" || !watch("phone") || !!errors.phone} // Disable if required fields are not valid
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              
              <div className="p-5 border border-slate-100 bg-slate-50 rounded-xl space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">شعار العيادة</h3>
                    <p className="text-xs text-slate-500">هذا الشعار سيظهر للمرضى وفي التقارير</p>
                  </div>
                </div>
                <LogoUploader onUpload={(url) => setValue("logo", url)} defaultImage={watch("logo")} />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <MapPin className="w-4 h-4 text-blue-500" /> موقع العيادة (على الخريطة)
                </label>
                <div className="mb-3">
                  <input
                    {...register("address")}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
                    placeholder="العنوان التفصيلي: شارع التحلية، الرياض"
                  />
                </div>
                <MapLocationPicker 
                  onLocationSelect={(lat, lng) => {
                    setValue("latitude", lat);
                    setValue("longitude", lng);
                  }}
                />
              </div>

              <div className="flex items-center justify-between pt-4 mt-8 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-6 py-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium transition"
                >
                  <ChevronRight className="w-4 h-4" /> رجوع
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...
                    </>
                  ) : (
                    "إنهاء الإعداد والبدء"
                  )}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
