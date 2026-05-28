"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Phone,
  Link as LinkIcon,
  Plus,
  Trash2,
  Globe,
  MessageCircle,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Save,
  Loader2,
  MapPin,
  QrCode,
  Copy,
  Check,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { LogoUploader } from "@/components/features/setup/LogoUploader";
import { MapLocationPicker } from "@/components/features/setup/MapLocationPicker";
import { tenantUpdateSchema, type TenantUpdateInput } from "@/lib/schemas/tenant";
import type { TenantProfile, TenantSocialPlatform } from "@/lib/types/tenant";

const PLATFORM_OPTIONS: {
  value: TenantSocialPlatform;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "WHATSAPP", label: "واتساب", icon: MessageCircle },
  { value: "X", label: "تويتر", icon: Twitter },
  { value: "FACEBOOK", label: "فيسبوك", icon: Facebook },
  { value: "INSTAGRAM", label: "انستغرام", icon: Instagram },
  { value: "LINKEDIN", label: "لينكد إن", icon: Linkedin },
];

interface ProfileFormProps {
  initialData: TenantProfile;
  isAdmin: boolean;
}

export default function ProfileForm({ initialData, isAdmin }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const clinicUrl = `${baseUrl}/${initialData.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(clinicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setSubmitError("فشل نسخ الرابط");
    }
  };

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TenantUpdateInput>({
    resolver: zodResolver(tenantUpdateSchema),
    defaultValues: {
      name: initialData.name,
      specialty: initialData.specialty ?? "",
      bio: initialData.bio ?? "",
      phone: initialData.phone ?? "",
      logo: initialData.logo ?? "",
      address: initialData.address ?? "",
      latitude: initialData.latitude ?? null,
      longitude: initialData.longitude ?? null,
      defaultConsultationFee: initialData.defaultConsultationFee?.toString() ?? "",
      socialLinks: initialData.socialLinks.map((l) => ({
        id: l.id,
        platform: l.platform,
        url: l.url,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialLinks",
  });

  const handleLogoUpload = useCallback(
    (url: string) => {
      if (!isAdmin) return;
      setValue("logo", url);
    },
    [isAdmin, setValue]
  );

  const handleLocationSelect = useCallback(
    (lat: number, lng: number) => {
      if (!isAdmin) return;
      setValue("latitude", lat);
      setValue("longitude", lng);
    },
    [isAdmin, setValue]
  );

  const onSubmit = async (rawData: TenantUpdateInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const data = {
      ...rawData,
      specialty: rawData.specialty?.trim() || null,
      bio: rawData.bio?.trim() || null,
      phone: rawData.phone?.trim() || null,
      logo: rawData.logo?.trim() || null,
      address: rawData.address?.trim() || null,
      latitude: rawData.latitude ?? null,
      longitude: rawData.longitude ?? null,
      defaultConsultationFee: rawData.defaultConsultationFee || "",
    };

    try {
      const res = await fetch("/api/tenant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setSubmitError(result.error || "حدث خطأ أثناء حفظ البيانات");
      } else {
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch {
      setSubmitError("فشل الاتصال بالخادم، يرجى المحاولة لاحقاً");
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabled = !isAdmin;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الملف الشخصي</h1>
          <p className="text-slate-500 mt-1">
            قم بتحديث بيانات العيادة ومعلومات التواصل الخاصة بك.
          </p>
        </div>
        {isAdmin && (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2 min-w-[160px]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            حفظ التغييرات
          </Button>
        )}
      </div>

      {submitSuccess && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-100 text-sm font-medium">
          تم حفظ التغييرات بنجاح
        </div>
      )}

      {submitError && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-100 text-sm font-medium">
          {submitError}
        </div>
      )}

      {!isAdmin && (
        <div className="bg-amber-50 text-amber-700 px-4 py-3 rounded-lg border border-amber-100 text-sm font-medium flex items-center gap-2">
          <User className="w-4 h-4" />
          يمكن للمسؤول فقط تعديل بيانات العيادة
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logo Sidebar */}
        <div className="lg:col-span-1">
          <Card className="flex flex-col items-center p-6 sm:p-8 text-center sticky top-6">
            <div className="relative group mb-6">
              <LogoUploader
                defaultImage={watch("logo") || undefined}
                onUpload={handleLogoUpload}
                disabled={disabled}
              />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">شعار العيادة</h3>
            <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
              يفضل أن تكون الصورة مربعة وبحجم أقل من 2 ميغابايت
            </p>
          </Card>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <Card className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              المعلومات الأساسية
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    اسم العيادة
                  </label>
                  <Input
                    {...register("name")}
                    disabled={disabled}
                    placeholder="عيادة السلام"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    التخصص
                  </label>
                  <Input
                    {...register("specialty")}
                    disabled={disabled}
                    placeholder="طبيب قلب وأوعية دموية"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  نبذة تعريفية
                </label>
                <Textarea
                  {...register("bio")}
                  disabled={disabled}
                  placeholder="اكتب نبذة مختصرة عن العيادة والخدمات المقدمة..."
                  rows={4}
                />
              </div>
            </div>
          </Card>

          {/* Consultation Fee */}
          <Card className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span>💰</span> الكشفية
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-slate-500 mb-2">سعر الكشفية الافتراضي للمواعيد الجديدة (لن يظهر للمرضى)</p>
              <input
                {...register("defaultConsultationFee")}
                dir="ltr"
                type="text" inputMode="numeric"
                disabled={disabled}
                placeholder="مثال: 25000"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition outline-none text-slate-800 text-sm"
              />
            </div>
          </Card>

          {/* QR Code & Public Link */}
          <Card className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              رابط العيادة
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  رابط العيادة العام
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-mono text-sm overflow-x-auto" dir="ltr">
                    {clinicUrl}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className={copied ? "text-green-600 border-green-600 hover:text-green-700 hover:border-green-700" : ""}
                    title={copied ? "تم النسخ" : "نسخ الرابط"}
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  شارك هذا الرابط مع المرضى للحجز السريع
                </p>
              </div>

              {initialData.qrCode && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    رمز QR للحجز
                  </label>
                  <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <img
                      src={initialData.qrCode}
                      alt="QR Code"
                      className="w-32 h-32 object-contain bg-white rounded-lg"
                    />
                    <a
                      href={initialData.qrCode}
                      download={`${initialData.slug}-qrcode.png`}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      تحميل رمز QR
                    </a>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              معلومات التواصل
            </h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  رقم الهاتف
                </label>
                <Input
                  {...register("phone")}
                  disabled={disabled}
                  type="tel"
                  dir="ltr"
                  className="text-left"
                  placeholder="+964 77X XXX XXXX"
                />
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              الموقع
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  العنوان
                </label>
                <Input
                  {...register("address")}
                  disabled={disabled}
                  placeholder="شارع الرشيد، بغداد، العراق"
                />
              </div>
              <div className={disabled ? "pointer-events-none opacity-70" : ""}>
                <MapLocationPicker
                  defaultLocation={
                    watch("latitude") != null && watch("longitude") != null
                      ? { lat: watch("latitude")!, lng: watch("longitude")! }
                      : undefined
                  }
                  onLocationSelect={handleLocationSelect}
                />
              </div>
            </div>
          </Card>

          {/* Social Links */}
          <Card className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-600" />
                الروابط والشبكات الاجتماعية
              </h3>
              {isAdmin && (
                <Button
                  type="button"
                  onClick={() => append({ platform: "WHATSAPP", url: "" })}
                  variant="outline"
                  size="sm"
                  className="gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  إضافة رابط
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {fields.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Globe className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">
                    لا توجد روابط مضافة حالياً
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    قم بإضافة روابط لصفحاتك الشخصية والاجتماعية
                  </p>
                </div>
              ) : (
                fields.map((field, index) => {
                  const platformValue = watch(`socialLinks.${index}.platform`);
                  const Icon =
                    PLATFORM_OPTIONS.find((p) => p.value === platformValue)
                      ?.icon || Globe;
                  return (
                    <div
                      key={field.id}
                      className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition-colors group"
                    >
                      <div className="w-full sm:w-1/3 relative">
                        <select
                          {...register(`socialLinks.${index}.platform`)}
                          disabled={disabled}
                          className="w-full rounded-xl border border-slate-200 bg-white pr-4 pl-10 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer font-medium text-slate-700 disabled:cursor-not-allowed"
                          style={{
                            backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "left 12px center",
                            backgroundSize: "16px",
                          }}
                        >
                          {PLATFORM_OPTIONS.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1 w-full relative">
                        <Input
                          {...register(`socialLinks.${index}.url`)}
                          disabled={disabled}
                          dir="ltr"
                          className="text-left pl-11 pr-4 bg-white"
                          placeholder={
                            platformValue === "WHATSAPP"
                              ? "+96477..."
                              : platformValue === "X"
                              ? "@username"
                              : "https://..."
                          }
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      {isAdmin && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => remove(index)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2.5 h-auto lg:opacity-0 lg:group-hover:opacity-100 transition-opacity self-end sm:self-auto shrink-0"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
