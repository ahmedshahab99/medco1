"use client";

import { useState, useEffect } from "react";
import { Search, Send, Building2, Package, Phone, CheckCircle, Loader2 } from "lucide-react";

export default function SalesRepPortal() {
  const [step, setStep] = useState<"id" | "portal">("id");
  const [repId, setRepId] = useState("");
  const [rep, setRep] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [offerNote, setOfferNote] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState("");

  useEffect(() => { fetch("/api/salesrep/doctors").then((r) => r.json()).then(setDoctors); }, []);

  const filtered = doctors.filter((d) => d.name.includes(search) || d.doctor.includes(search));

  const handleIdentify = async () => {
    const res = await fetch(`/api/salesrep/register?id=${repId}`);
    if (res.ok) { const data = await res.json(); setRep(data); setStep("portal"); }
  };

  const sendOffer = async () => {
    if (!selectedDoctor || !selectedProduct) return;
    setSending(true);
    const res = await fetch("/api/salesrep/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salesRepId: repId, tenantId: selectedDoctor.id, productId: selectedProduct, notes: offerNote }),
    });
    setSending(false);
    if (res.ok) { setDone("تم إرسال العرض!"); setSelectedDoctor(null); setOfferNote(""); }
  };

  if (step === "id") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <Building2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-900 mb-2">بوابة المندوبين</h1>
          <p className="text-slate-500 mb-6">أدخل معرف المندوب الخاص بك للدخول</p>
          <input value={repId} onChange={(e) => setRepId(e.target.value)} placeholder="المعرف" className="w-full px-4 py-3 border border-slate-200 rounded-xl mb-4 text-center focus:ring-2 focus:ring-emerald-500 outline-none" />
          <button onClick={handleIdentify} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">دخول</button>
          <p className="text-xs text-slate-400 mt-4">ليس لديك حساب؟ <a href="/signup/salesrep" className="text-emerald-600 font-bold">سجل الآن</a></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white p-6">
        <h1 className="text-xl font-black">بوابة المندوبين</h1>
        <p className="text-emerald-100 text-sm">مرحباً {rep?.name}</p>
      </div>
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {done && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 flex items-center gap-2"><CheckCircle className="w-5 h-5" />{done}</div>}
        <div className="relative">
          <Search className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن عيادة..." className="w-full px-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div className="grid gap-3">
          {filtered.map((d) => (
            <div key={d.id} onClick={() => setSelectedDoctor(d)} className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${selectedDoctor?.id === d.id ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-100'}`}>
              <h3 className="font-bold text-slate-800">{d.name}</h3>
              <p className="text-sm text-slate-500">{d.doctor} · {d.phone}</p>
            </div>
          ))}
        </div>

        {selectedDoctor && (
          <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4">
            <h3 className="font-bold text-slate-800">إرسال عرض لـ {selectedDoctor.name}</h3>
            <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none">
              <option value="">اختر منتجاً</option>
              {rep?.products?.map((p: any) => <option key={p.id} value={p.id}>{p.name} {p.price ? `- ${p.price}` : ''}</option>)}
            </select>
            <textarea value={offerNote} onChange={(e) => setOfferNote(e.target.value)} placeholder="ملاحظات إضافية..." rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none" />
            <button onClick={sendOffer} disabled={sending || !selectedProduct} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} إرسال العرض
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
