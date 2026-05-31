"use client";

import { useState, useEffect } from "react";
import { Package, Building2, Phone, Check, X, Eye, Loader2 } from "lucide-react";

export default function SalesRepsPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    const res = await fetch("/api/salesrep/offers?tenantId=current");
    if (res.ok) setOffers(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchOffers(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/salesrep/offers?id=${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    fetchOffers();
  };

  const statusBadge: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    viewed: "bg-blue-50 text-blue-700 border-blue-200",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">المندوبين</h1>
          <p className="text-sm text-slate-500">عروض المندوبين والشركات</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-bold">لا توجد عروض حتى الآن</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-800">{offer.product.name}</h3>
                  <p className="text-sm text-slate-500">{offer.product.description}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusBadge[offer.status] || statusBadge.pending}`}>
                  {offer.status === "pending" ? "جديد" : offer.status === "viewed" ? "تم المشاهدة" : offer.status === "accepted" ? "مقبول" : "مرفوض"}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {offer.salesRep.company}</span>
                <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" /> {offer.salesRep.name}</span>
                {offer.product.price && <span className="font-bold text-slate-700">{Number(offer.product.price).toLocaleString()} د.ع</span>}
              </div>
              {offer.salesRep.phone && (
                <a href={`tel:${offer.salesRep.phone}`} className="inline-flex items-center gap-1 text-sm text-emerald-600 font-bold hover:text-emerald-700">
                  <Phone className="w-3.5 h-3.5" /> {offer.salesRep.phone}
                </a>
              )}
              {offer.notes && <p className="text-sm text-slate-500 mt-2 bg-slate-50 p-3 rounded-xl">{offer.notes}</p>}
              {offer.status === "pending" && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-50">
                  <button onClick={() => updateStatus(offer.id, "accepted")} className="flex items-center gap-1 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm hover:bg-emerald-100"><Check className="w-4 h-4" /> قبول</button>
                  <button onClick={() => updateStatus(offer.id, "rejected")} className="flex items-center gap-1 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl font-bold text-sm hover:bg-rose-100"><X className="w-4 h-4" /> رفض</button>
                  <button onClick={() => updateStatus(offer.id, "viewed")} className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100"><Eye className="w-4 h-4" /> تم المشاهدة</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
