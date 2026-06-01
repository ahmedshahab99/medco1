"use client";

import { useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Phone, Plus, Trash2, MessageCircle, Twitter, Facebook, Instagram, Linkedin, Save, Loader2, MapPin, QrCode, Copy, Check, Search, Globe, Mail, Award, Stethoscope, Building2, DollarSign, Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { LogoUploader } from "@/components/features/setup/LogoUploader";
import { MapLocationPicker } from "@/components/features/setup/MapLocationPicker";
import { tenantUpdateSchema, type TenantUpdateInput } from "@/lib/schemas/tenant";
import type { TenantProfile, TenantSocialPlatform } from "@/lib/types/tenant";

const PLATFORM_OPTIONS: { value: TenantSocialPlatform; label: string; icon: React.ElementType }[] = [
  { value: "WHATSAPP", label: "واتساب", icon: MessageCircle },
  { value: "X", label: "تويتر", icon: Twitter },
  { value: "FACEBOOK", label: "فيسبوك", icon: Facebook },
  { value: "INSTAGRAM", label: "انستغرام", icon: Instagram },
  { value: "LINKEDIN", label: "لينكد إن", icon: Linkedin },
];

interface Props { initialData: TenantProfile; isAdmin: boolean; doctorProfile?: { firstName: string | null; lastName: string | null; email: string; role: string } | null; }

export default function ProfileForm({ initialData, isAdmin, doctorProfile }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const clinicUrl = typeof window !== 'undefined' ? `${window.location.origin}/${initialData.slug}` : `/${initialData.slug}`;

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<TenantUpdateInput>({
    resolver: zodResolver(tenantUpdateSchema),
    defaultValues: {
      name: initialData.name, specialty: initialData.specialty ?? "", bio: initialData.bio ?? "",
      phone: initialData.phone ?? "", logo: initialData.logo ?? "", address: initialData.address ?? "",
      latitude: initialData.latitude ?? null, longitude: initialData.longitude ?? null,
      defaultConsultationFee: initialData.defaultConsultationFee?.toString() ?? "",
      socialLinks: initialData.socialLinks.map((l) => ({ id: l.id, platform: l.platform, url: l.url })),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "socialLinks" });

  const handleLogoUpload = useCallback((url: string) => { if (isAdmin) setValue("logo", url); }, [isAdmin, setValue]);

  const copyUrl = () => { navigator.clipboard.writeText(clinicUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const submit = handleSubmit(async (raw) => {
    setSubmitting(true); setError("");
    const data = {
      ...raw, specialty: raw.specialty?.trim() || null, bio: raw.bio?.trim() || null,
      phone: raw.phone?.trim() || null, logo: raw.logo?.trim() || null,
      address: raw.address?.trim() || null, latitude: raw.latitude ?? null, longitude: raw.longitude ?? null,
      defaultConsultationFee: raw.defaultConsultationFee || "",
    };
    try {
      const res = await fetch("/api/tenant", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await res.json();
      if (!res.ok) { setError(result.error || "فشل الحفظ"); } else { setSuccess(true); setTimeout(() => setSuccess(false), 3000); }
    } catch { setError("فشل الاتصال"); } finally { setSubmitting(false); }
  });

  const disabled = !isAdmin;
  const initials = doctorProfile ? `${doctorProfile.firstName?.[0] || ""}${doctorProfile.lastName?.[0] || ""}`.trim() || "د" : "د";

  return (
    <form onSubmit={submit} className="space-y-6 max-w-5xl mx-auto">
      {/* Success banner */}
      {success && <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-700 text-sm font-bold text-center animate-in fade-in">تم حفظ التغييرات بنجاح ✅</div>}
      {error && <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-700 text-sm font-bold text-center">{error}</div>}

      {/* ── Dr Profile Card ── */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-1 shadow-xl shadow-indigo-200">
        <div className="bg-white rounded-[22px] p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shrink-0">
              {initials}
            </div>
            <div className="text-center md:text-right flex-1 min-w-0">
              <h2 className="text-2xl font-black text-slate-800">{doctorProfile?.firstName || ""} {doctorProfile?.lastName || ""}</h2>
              <p className="text-slate-400 text-sm mt-1 flex items-center gap-1 justify-center md:justify-start"><Stethoscope className="w-4 h-4 text-indigo-400" /> {initialData.specialty || "طبيب"}</p>
              <p className="text-slate-400 text-xs mt-1 flex items-center gap-1 justify-center md:justify-start"><Mail className="w-3.5 h-3.5" /> {doctorProfile?.email || ""} <span className="mx-2">·</span> <Building2 className="w-3.5 h-3.5" /> {initialData.name}</p>
            </div>
            <div className="shrink-0"><span className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100">{doctorProfile?.role === "ADMIN" ? "مدير" : "طبيب"}</span></div>
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Clinic Info */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-black text-slate-800 flex items-center gap-2 mb-5"><Building2 className="w-5 h-5 text-indigo-500" /> معلومات العيادة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">اسم العيادة <span className="text-red-400">*</span></label><Input {...register("name")} disabled={disabled} placeholder="اسم العيادة" /></div>
              <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">التخصص <span className="text-red-400">*</span></label><Input {...register("specialty")} disabled={disabled} placeholder="مثال: طب عام" /></div>
              <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">رقم الهاتف <span className="text-red-400">*</span></label><Input {...register("phone")} disabled={disabled} placeholder="رقم العيادة" /></div>
              <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">الشعار</label>
                {isAdmin ? <LogoUploader defaultImage={initialData.logo || undefined} onUpload={handleLogoUpload} /> : <Input value={initialData.logo || ""} disabled />}
              </div>
            </div>
            <div className="space-y-1.5 mt-4"><label className="text-xs font-bold text-slate-500">نبذة تعريفية <span className="text-red-400">*</span></label><Textarea {...register("bio")} disabled={disabled} placeholder="نبذة عن العيادة..." rows={3} /></div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-black text-slate-800 flex items-center gap-2 mb-5"><MapPin className="w-5 h-5 text-indigo-500" /> الموقع</h3>
            <div className="space-y-3">
              <Input {...register("address")} disabled={disabled} placeholder="العنوان" />
              {isAdmin && <MapLocationPicker onLocationSelect={(lat, lng) => { setValue("latitude", lat); setValue("longitude", lng); }} />}
            </div>
          </div>
        </div>

        {/* Col 2: Sidebar */}
        <div className="space-y-6">
          {/* Logo quick view */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-center">
            {initialData.logo ? <img src={initialData.logo} alt="logo" className="w-24 h-24 rounded-2xl mx-auto object-cover border border-slate-100" /> : <div className="w-24 h-24 rounded-2xl bg-slate-50 mx-auto flex items-center justify-center"><Camera className="w-8 h-8 text-slate-300" /></div>}
            <p className="text-xs text-slate-400 mt-3 font-bold">{initialData.name}</p>
            <p className="text-[10px] text-slate-300">{initialData.specialty || "بدون تخصص"}</p>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4"><QrCode className="w-4 h-4 text-indigo-500" /> رابط العيادة</h3>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100"><span className="text-xs text-slate-600 truncate flex-1" dir="ltr">{clinicUrl}</span><button onClick={copyUrl} className="p-1.5 rounded-lg hover:bg-slate-200 transition-all">{copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}</button></div>
            {initialData.qrCode && <img src={initialData.qrCode} alt="QR" className="w-28 h-28 mx-auto mt-4" />}
          </div>

          {/* Consultation Fee */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4"><DollarSign className="w-4 h-4 text-emerald-500" /> الكشفية</h3>
            <Input {...register("defaultConsultationFee")} disabled={disabled} placeholder="مثال: 25000" className="text-center text-lg font-black" />
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4"><h3 className="font-black text-slate-800 flex items-center gap-2"><Globe className="w-4 h-4 text-indigo-500" /> روابط</h3>{isAdmin && <button onClick={() => append({ platform: "WHATSAPP", url: "" })} className="text-xs font-bold text-indigo-600 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> إضافة</button>}</div>
            <div className="space-y-2.5">
              {fields.map((f, i) => {
                const opt = PLATFORM_OPTIONS.find((o) => o.value === f.platform);
                const Icon = opt?.icon || Globe;
                return <div key={f.id} className="flex items-center gap-2"><div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-slate-500" /></div><select {...register(`socialLinks.${i}.platform`)} className="flex-1 h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-500/30">{PLATFORM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select><Input {...register(`socialLinks.${i}.url`)} disabled={disabled} placeholder="الرابط" className="flex-[2]" />{isAdmin && fields.length > 1 && <button onClick={() => remove(i)} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}</div>;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      {isAdmin && <div className="flex justify-center"><Button type="submit" disabled={submitting} className="h-12 px-10 bg-gradient-to-l from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-purple-700">{submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} حفظ التغييرات</Button></div>}
    </form>
  );
}
