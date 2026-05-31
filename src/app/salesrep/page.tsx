"use client";

import { useState, useEffect } from "react";
import { Search, Send, Building2, Package, Phone, Loader2, LogOut, CheckCircle, XCircle, Eye, Clock, DollarSign, Filter, ChevronLeft, RefreshCw } from "lucide-react";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  viewed: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  viewed: Eye,
  accepted: CheckCircle,
  rejected: XCircle,
};

export default function SalesRepPortal() {
  const [rep, setRep] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"doctors" | "offers">("doctors");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [offerNote, setOfferNote] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("salesrep");
    if (saved) { const r = JSON.parse(saved); setRep(r); fetchOffers(r.id); }
    fetch("/api/salesrep/doctors").then((r) => r.json()).then(setDoctors);
  }, []);

  const fetchOffers = (repId: string) => {
    fetch(`/api/salesrep/offers?salesRepId=${repId}`)
      .then((r) => r.json()).then(setOffers).catch(() => {});
  };

  const login = async () => {
    setLoginLoading(true); setLoginError("");
    const res = await fetch(`/api/salesrep/register?email=${encodeURIComponent(email)}`);
    if (!res.ok) { setLoginError("البريد الإلكتروني غير مسجل"); setLoginLoading(false); return; }
    const data = await res.json();
    setRep(data);
    localStorage.setItem("salesrep", JSON.stringify(data));
    fetchOffers(data.id);
    setLoginLoading(false);
  };

  const logout = () => { setRep(null); localStorage.removeItem("salesrep"); setEmail(""); };

  const filteredDoctors = doctors.filter((d) => d.name.includes(search) || d.doctor.includes(search));
  const pendingCount = offers.filter((o) => o.status === "pending").length;
  const acceptedCount = offers.filter((o) => o.status === "accepted").length;

  const sendOffer = async () => {
    if (!selectedDoctor || !selectedProduct) return;
    setSending(true);
    const res = await fetch("/api/salesrep/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salesRepId: rep.id, tenantId: selectedDoctor.id, productId: selectedProduct, notes: offerNote }),
    });
    setSending(false);
    if (res.ok) {
      setDone(`تم إرسال العرض إلى ${selectedDoctor.name}!`);
      setSelectedDoctor(null); setOfferNote(""); setSelectedProduct("");
      fetchOffers(rep.id);
    }
  };

  if (!rep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 w-full max-w-sm overflow-hidden">
          <div className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white px-6 py-8 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-80" />
            <h1 className="text-xl font-black">بوابة المندوبين</h1>
            <p className="text-emerald-100 text-sm mt-1">أدخل بريدك الإلكتروني للدخول</p>
          </div>
          <div className="p-6 space-y-4">
            {loginError && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl text-center">{loginError}</p>}
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-center focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
            <button onClick={login} disabled={loginLoading} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50">
              {loginLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "دخول"}
            </button>
            <p className="text-xs text-slate-400 text-center">ليس لديك حساب؟ <a href="/signup/salesrep" className="text-emerald-600 font-bold">سجل الآن</a></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 opacity-80 hidden md:block" />
              <div>
                <h1 className="font-black text-sm md:text-lg">بوابة المندوبين</h1>
                <p className="text-emerald-100 text-xs">{rep.name} · {rep.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => fetchOffers(rep.id)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"><RefreshCw className="w-4 h-4" /></button>
              <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs"><LogOut className="w-3.5 h-3.5" /> خروج</button>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-3 bg-white/10 rounded-lg p-0.5 w-fit">
            <button onClick={() => setTab("doctors")} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === "doctors" ? "bg-white text-emerald-700 shadow-sm" : "text-white/70 hover:text-white"}`}>العيادات</button>
            <button onClick={() => setTab("offers")} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === "offers" ? "bg-white text-emerald-700 shadow-sm" : "text-white/70 hover:text-white"}`}>
              عروضي {pendingCount > 0 && <span className="w-4 h-4 inline-flex items-center justify-center bg-amber-400 text-white text-[9px] rounded-full mr-1">{pendingCount}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-4">
        {done && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 flex items-center gap-2 text-sm shadow-sm">
            <CheckCircle className="w-5 h-5 shrink-0" /> {done}
          </div>
        )}

        {tab === "offers" && (
          <div className="grid gap-3">
            {offers.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-100 p-10 text-center">
                <Package className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm font-bold">لا توجد عروض بعد</p>
              </div>
            ) : (
              offers.map((offer) => {
                const Icon = statusIcons[offer.status] || Clock;
                return (
                  <div key={offer.id} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{offer.product.name}</h3>
                        <p className="text-xs text-slate-500">{offer.salesRep.company} · {offer.tenant.name || "عيادة"}</p>
                      </div>
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusStyles[offer.status] || statusStyles.pending}`}>
                        <Icon className="w-3 h-3" />
                        {offer.status === "pending" ? "قيد الانتظار" : offer.status === "viewed" ? "تم المشاهدة" : offer.status === "accepted" ? "مقبول ✅" : "مرفوض"}
                      </span>
                    </div>
                    {offer.product.description && <p className="text-xs text-slate-400 mb-2">{offer.product.description}</p>}
                    {offer.product.price && <p className="text-xs font-bold text-emerald-600">{Number(offer.product.price).toLocaleString()} د.ع</p>}
                    {offer.notes && <p className="text-xs text-slate-400 mt-1 bg-slate-50 p-2 rounded-lg">{offer.notes}</p>}
                    <p className="text-[10px] text-slate-300 mt-2">{new Date(offer.createdAt).toLocaleDateString("ar-IQ")}</p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "doctors" && (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن عيادة..." className="w-full px-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
            </div>

            {/* Doctor cards */}
            <div className="grid gap-3">
              {filteredDoctors.map((d) => (
                <div key={d.id} onClick={() => setSelectedDoctor(selectedDoctor?.id === d.id ? null : d)}
                  className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${selectedDoctor?.id === d.id ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{d.name}</h3>
                      <p className="text-xs text-slate-500">{d.doctor}</p>
                    </div>
                    {d.phone && <span className="text-xs text-slate-400" dir="ltr">{d.phone}</span>}
                  </div>
                  {d.address && <p className="text-xs text-slate-400 mt-1">{d.address}</p>}

                  {/* Send offer form */}
                  {selectedDoctor?.id === d.id && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                      <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg outline-none text-sm bg-white">
                        <option value="">اختر منتجاً</option>
                        {rep.products?.map((p: any) => (
                          <option key={p.id} value={p.id}>{p.name} {p.price ? `(${Number(p.price).toLocaleString()} د.ع)` : ''}</option>
                        ))}
                      </select>
                      <textarea value={offerNote} onChange={(e) => setOfferNote(e.target.value)} placeholder="تفاصيل العرض..." rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none text-sm" />
                      <button onClick={sendOffer} disabled={sending || !selectedProduct}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 disabled:opacity-50">
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} إرسال العرض
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
