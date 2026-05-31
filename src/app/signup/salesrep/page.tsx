"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, Loader2, CheckCircle, Building2, Package, Upload, ChevronRight } from "lucide-react";

function SalesRepContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthed = searchParams.get("auth") === "1";

  const [mode, setMode] = useState<"login" | "form" | "success">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [registeredId, setRegisteredId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", whatsapp: "" });
  const [products, setProducts] = useState([{ name: "", description: "", price: "" }]);
  const [documents, setDocuments] = useState<{ type: string; label: string; file: File | null; uploaded: boolean }[]>([
    { type: "id_card", label: "صورة الهوية", file: null, uploaded: false },
  ]);

  // Check auth on page load
  useEffect(() => {
    if (!isAuthed) return;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;
      setUserEmail(user.email);
      setForm((f) => ({ ...f, email: user.email || "" }));
      const res = await fetch(`/api/salesrep/register?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const rep = await res.json();
        localStorage.setItem("salesrep", JSON.stringify(rep));
        router.replace("/salesrep");
      } else {
        setMode("form");
      }
    })();
  }, [isAuthed]);

  const handleGoogleSignIn = async () => {
    setLoading(true); setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/signup/salesrep%3Fauth%3D1` },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  const addProduct = () => setProducts([...products, { name: "", description: "", price: "" }]);
  const removeProduct = (i: number) => products.length > 1 && setProducts(products.filter((_, j) => j !== i));
  const updateProduct = (i: number, field: string, value: string) => {
    const p = [...products]; (p as any)[i][field] = value; setProducts(p);
  };

  const handleFileChange = async (i: number, file: File | null) => {
    const docs = [...documents];
    docs[i].file = file; docs[i].uploaded = false;
    setDocuments(docs);
    if (!file || !registeredId) return;
    const fd = new FormData();
    fd.append("file", file); fd.append("salesRepId", registeredId); fd.append("type", docs[i].type);
    const res = await fetch("/api/salesrep/upload", { method: "POST", body: fd });
    if (res.ok) { docs[i].uploaded = true; setDocuments([...docs]); }
  };

  const submitForm = async () => {
    setLoading(true); setError("");
    const res = await fetch("/api/salesrep/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, products: products.map((p) => ({ ...p, price: p.price || undefined })) }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "فشل التسجيل"); return; }
    setRegisteredId(data.id);
    localStorage.setItem("salesrep", JSON.stringify({ ...form, id: data.id, products }));
    setMode("success");
    setTimeout(() => router.push("/salesrep"), 2000);
  };

  // Success
  if (mode === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-8 md:p-10 max-w-md w-full text-center">
          <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mb-2">تم التسجيل!</h1>
          <p className="text-slate-500 text-sm">جاري تحويلك إلى بوابة المندوبين...</p>
        </div>
      </div>
    );
  }

  // Info form (after Google auth)
  if (mode === "form") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-6 md:py-12 px-4" dir="rtl">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white px-6 md:px-8 py-6">
            <div className="flex items-center gap-3 mb-1">
              <Building2 className="w-6 h-6 md:w-8 md:h-8 opacity-80" />
              <div>
                <h1 className="text-lg md:text-2xl font-black">أكمل معلوماتك</h1>
                <p className="text-emerald-100 text-xs md:text-sm">{userEmail}</p>
              </div>
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); submitForm(); }} className="p-5 md:p-8 space-y-4 md:space-y-5">
            {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">الاسم الكامل</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 md:px-4 py-2.5 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">اسم الشركة</label>
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required className="w-full px-3 md:px-4 py-2.5 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">رقم الهاتف</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="w-full px-3 md:px-4 py-2.5 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">رقم واتساب (اختياري)</label>
                <input type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full px-3 md:px-4 py-2.5 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-emerald-500/30" />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><Package className="w-4 h-4 text-emerald-500" /> منتجاتك</h3>
                <button type="button" onClick={addProduct} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> إضافة</button>
              </div>
              <div className="space-y-3">
                {products.map((p, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 md:p-4 border border-slate-100 space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">منتج {i + 1}</span>
                      {products.length > 1 && <button type="button" onClick={() => removeProduct(i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                      <input value={p.name} onChange={(e) => updateProduct(i, "name", e.target.value)} required placeholder="اسم المنتج" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-emerald-500/30" />
                      <input value={p.price} onChange={(e) => updateProduct(i, "price", e.target.value)} placeholder="السعر" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-emerald-500/30" />
                    </div>
                    <textarea value={p.description} onChange={(e) => updateProduct(i, "description", e.target.value)} placeholder="وصف المنتج" rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-emerald-500/30" />
                  </div>
                ))}
              </div>
            </div>

            {/* Document upload */}
            <div className="border-t border-slate-100 pt-5">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm mb-3"><Upload className="w-4 h-4 text-emerald-500" /> توثيق الحساب (اختياري)</h3>
              {documents.map((doc, i) => (
                <div key={doc.type} className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-3">
                  <label className="text-xs font-bold text-slate-600 block mb-2">{doc.label}</label>
                  <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(i, e.target.files?.[0] || null)}
                    className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                  {doc.uploaded && <span className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> تم الرفع</span>}
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-l from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-200">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "إكمال التسجيل"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Login mode
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white px-6 md:px-8 py-8 md:py-10 text-center">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Building2 className="w-7 h-7 md:w-8 md:h-8" />
          </div>
          <h1 className="text-xl md:text-2xl font-black">بوابة المندوبين</h1>
          <p className="text-emerald-100 text-xs md:text-sm mt-1">سجل الدخول لتقديم عروضك للعيادات</p>
        </div>
        <div className="p-6 md:p-8 space-y-5">
          {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 text-center">{error}</p>}
          <button onClick={handleGoogleSignIn} disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-all border border-slate-200 shadow-sm hover:shadow-md disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            تسجيل الدخول بـ Google
          </button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-slate-400">أو</span></div>
          </div>
          <a href="/signup/salesrep" className="block text-center text-sm text-slate-500 hover:text-slate-700">
            ليس لديك حساب؟ <span className="text-emerald-600 font-bold">سجل الآن</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SalesRepPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>}>
      <SalesRepContent />
    </Suspense>
  );
}
