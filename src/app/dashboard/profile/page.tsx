"use client";

import React, { useState } from "react";
import { User, Camera, Mail, Phone, Link as LinkIcon, Plus, Trash2, Globe, MessageCircle, Twitter, Facebook, Instagram, Linkedin, Save, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type Platform = "website" | "whatsapp" | "twitter" | "facebook" | "instagram" | "linkedin";

interface LinkItem {
  id: string;
  platform: Platform;
  url: string;
}

const PLATFORMS: { value: Platform; label: string; icon: React.ElementType }[] = [
  { value: "website", label: "الموقع الإلكتروني", icon: Globe },
  { value: "whatsapp", label: "واتساب", icon: MessageCircle },
  { value: "twitter", label: "تويتر", icon: Twitter },
  { value: "facebook", label: "فيسبوك", icon: Facebook },
  { value: "instagram", label: "انستغرام", icon: Instagram },
  { value: "linkedin", label: "لينكد إن", icon: Linkedin },
];

export default function ProfilePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [links, setLinks] = useState<LinkItem[]>([
    { id: "1", platform: "website", url: "" }
  ]);

  const addLink = () => {
    setLinks([...links, { id: Math.random().toString(), platform: "website", url: "" }]);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  const updateLink = (id: string, field: keyof LinkItem, value: string) => {
    setLinks(links.map((link) => (link.id === id ? { ...link, [field]: value as any } : link)));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الملف الشخصي</h1>
          <p className="text-slate-500 mt-1">قم بتحديث بياناتك الشخصية ومعلومات التواصل الخاصة بك.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 min-w-[160px]">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          حفظ التغييرات
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Photo - Sidebar */}
        <div className="lg:col-span-1">
          <Card className="flex flex-col items-center p-6 sm:p-8 text-center sticky top-6">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                <User className="w-16 h-16 text-slate-300" />
              </div>
              <button className="absolute bottom-0 right-0 p-3 bg-blue-600 rounded-full text-white shadow-md hover:bg-blue-700 transition-colors group-hover:scale-110">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">صورة الملف الشخصي</h3>
            <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">يفضل أن تكون الصورة مربعة وبحجم أقل من 2 ميغابايت</p>
            <Button variant="outline" className="w-full">
              تغيير الصورة
            </Button>
          </Card>
        </div>

        {/* Main Form Fields */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              المعلومات الأساسية
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">الاسم الكامل</label>
                  <Input placeholder="د. محمد أحمد" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">التخصص</label>
                  <Input placeholder="طبيب قلب وأوعية دموية" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">نبذة تعريفية</label>
                <Textarea 
                  placeholder="اكتب نبذة مختصرة عن خبراتك ومؤهلاتك الطبية..." 
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
               <Phone className="w-5 h-5 text-blue-600" />
               معلومات التواصل
            </h3>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    البريد الإلكتروني
                  </label>
                  <Input type="email" dir="ltr" className="text-left" placeholder="doctor@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    رقم الهاتف
                  </label>
                  <Input type="tel" dir="ltr" className="text-left" placeholder="+966 50 123 4567" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-600" />
                الروابط والشبكات الاجتماعية
              </h3>
              <Button onClick={addLink} variant="outline" size="sm" className="gap-2 shrink-0">
                <Plus className="w-4 h-4" />
                إضافة رابط
              </Button>
            </div>
            
            <div className="space-y-4">
              {links.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Globe className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">لا توجد روابط مضافة حالياً</p>
                  <p className="text-sm text-slate-400 mt-1">قم بإضافة روابط لصفحاتك الشخصية والاجتماعية</p>
                </div>
              ) : (
                links.map((link) => {
                  const Icon = PLATFORMS.find(p => p.value === link.platform)?.icon || Globe;
                  return (
                    <div key={link.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition-colors group">
                      <div className="w-full sm:w-1/3 relative">
                        <select 
                          value={link.platform}
                          onChange={(e) => updateLink(link.id, "platform", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white pr-4 pl-10 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer font-medium text-slate-700"
                          style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'left 12px center', backgroundSize: '16px' }}
                        >
                          {PLATFORMS.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1 w-full relative">
                        <Input 
                          value={link.url}
                          onChange={(e) => updateLink(link.id, "url", e.target.value)}
                          dir="ltr" 
                          className="text-left pl-11 pr-4 bg-white" 
                          placeholder={
                             link.platform === "whatsapp" ? "+9665..." : 
                             link.platform === "website" ? "https://..." : 
                             `@username`
                          } 
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        onClick={() => removeLink(link.id)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2.5 h-auto lg:opacity-0 lg:group-hover:opacity-100 transition-opacity self-end sm:self-auto shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
