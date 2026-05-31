"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Loader2, CheckCircle, Building2, Package } from "lucide-react";

export default function SalesRepSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", whatsapp: "" });
  const [products, setProducts] = useState([{ name: "", description: "", price: "" }]);

  const addProduct = () => setProducts([...products, { name: "", description: "", price: "" }]);
  const removeProduct = (i: number) => products.length > 1 && setProducts(products.filter((_, j) => j !== i));
  const updateProduct = (i: number, field: string, value: string) => {
    const p = [...products]; (p as any)[i][field] = value; setProducts(p);
  };

  const submit = async () => {
    setLoading(true); setError("");
    const res = await fetch("/api/salesrep/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, products: products.map((p) => ({ ...p, price: p.price || undefined })) }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "فشل التسجيل"); return; }
    setSuccess(true);
    setTimeout(() => router.push("/login"), 4000);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4" dir="rtl">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-900 mb-2">تم استلام طلبك!</h1>
          <p className="text-slate-500">سيتم مراجعة طلبك من قبل الإدارة. سنتواصل معك قريباً.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden">
        <div className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black">التسجيل كمندوب</h1>
              <p className="text-emerald-100 text-sm">سجل كمندوب مبيعات وقدم عروضك للعيادات</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if (step === 1) setStep(2); else submit(); }} className="p-6 md:p-8 space-y-5">
          {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>}

          {step === 1 && (
            <>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">الاسم الكامل</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none" /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none" /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">رقم الهاتف</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none" /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">اسم الشركة</label>
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required placeholder="اسم الشركة التي تعمل لصالحها" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none" /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">رقم واتساب (اختياري)</label>
                <input type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none" /></div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Package className="w-4 h-4" /> المنتجات والخدمات</h3>
                <button type="button" onClick={addProduct} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> إضافة</button>
              </div>
              {products.map((p, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">منتج {i + 1}</span>
                    {products.length > 1 && <button type="button" onClick={() => removeProduct(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                  <input value={p.name} onChange={(e) => updateProduct(i, "name", e.target.value)} required placeholder="اسم المنتج" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/30" />
                  <textarea value={p.description} onChange={(e) => updateProduct(i, "description", e.target.value)} placeholder="وصف المنتج" rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/30" />
                  <input value={p.price} onChange={(e) => updateProduct(i, "price", e.target.value)} placeholder="السعر (اختياري)" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
              ))}
            </>
          )}

          <div className="flex gap-3 pt-2">
            {step === 2 && <button type="button" onClick={() => setStep(1)} className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">السابق</button>}
            <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-gradient-to-l from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-200">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : step === 1 ? "التالي" : "إرسال الطلب"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
