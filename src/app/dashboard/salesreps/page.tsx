"use client";

import { useState, useEffect } from "react";
import { Package, Building2, Phone, Check, X, Eye, Loader2, Clock, ChevronLeft, DollarSign, Mail, CheckCircle, XCircle } from "lucide-react";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  viewed: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusLabels: Record<string, string> = {
  pending: "جديد",
  viewed: "تم المشاهدة",
  accepted: "مقبول",
  rejected: "مرفوض",
};

export default function SalesRepsPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOffers = async () => {
    const res = await fetch("/api/salesrep/offers?tenantId=current");
    if (res.ok) setOffers(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchOffers(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    await fetch(`/api/salesrep/offers?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setActionLoading(null);
    fetchOffers();
  };

  const pendingCount = offers.filter((o) => o.status === "pending").length;
  const acceptedCount = offers.filter((o) => o.status === "accepted").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">المندوبين</h1>
          <p className="text-sm text-slate-500">عروض الشركات والموردين</p>
        </div>
      </div>

      {/* Summary */}
      {!loading && offers.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
            <p className="text-2xl font-black text-slate-800">{offers.length}</p>
            <p className="text-xs text-slate-400">إجمالي</p>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 p-4 text-center">
            <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
            <p className="text-xs text-amber-500">جديد</p>
          </div>
          <div className="bg-white rounded-xl border border-emerald-100 p-4 text-center">
            <p className="text-2xl font-black text-emerald-600">{acceptedCount}</p>
            <p className="text-xs text-emerald-500">مقبول</p>
          </div>
        </div>
      )}

      {/* Offers List */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-slate-400 font-bold mb-1">لا توجد عروض</p>
          <p className="text-xs text-slate-300">عندما يرسل لك المندوبون عروضاً، ستظهر هنا</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {offers.map((offer) => (
            <div key={offer.id} className={`bg-white rounded-xl md:rounded-2xl border p-5 shadow-sm transition-all ${offer.status === "pending" ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-100'}`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base">{offer.product.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{offer.product.description || "—"}</p>
                  </div>
                </div>
                <span className={`shrink-0 text-[10px] md:text-xs font-bold px-2.5 md:px-3 py-1 rounded-full border ${statusStyles[offer.status] || statusStyles.pending}`}>
                  {statusLabels[offer.status] || offer.status}
                </span>
              </div>

              {/* Company info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs md:text-sm text-slate-500 mb-3">
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {offer.salesRep.company}</span>
                <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" /> {offer.salesRep.name}</span>
                {offer.product.price && (
                  <span className="flex items-center gap-1 font-bold text-emerald-600"><DollarSign className="w-3.5 h-3.5" /> {Number(offer.product.price).toLocaleString()} د.ع</span>
                )}
              </div>

              {/* Contact */}
              {offer.salesRep.phone && (
                <a href={`tel:${offer.salesRep.phone}`} className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 mb-3">
                  <Phone className="w-3.5 h-3.5" /> {offer.salesRep.phone}
                </a>
              )}

              {/* Notes */}
              {offer.notes && (
                <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 mb-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 mb-1">ملاحظات:</p>
                  <p className="text-sm">{offer.notes}</p>
                </div>
              )}

              {/* Actions */}
              {offer.status === "pending" && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => updateStatus(offer.id, "accepted")} disabled={actionLoading === offer.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all disabled:opacity-50 border border-emerald-200">
                    {actionLoading === offer.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} قبول العرض
                  </button>
                  <button onClick={() => updateStatus(offer.id, "rejected")} disabled={actionLoading === offer.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl font-bold text-xs hover:bg-rose-100 transition-all disabled:opacity-50 border border-rose-200">
                    {actionLoading === offer.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />} رفض
                  </button>
                  <button onClick={() => updateStatus(offer.id, "viewed")} disabled={actionLoading === offer.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs hover:bg-blue-100 transition-all disabled:opacity-50 border border-blue-200">
                    {actionLoading === offer.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />} للمشاهدة لاحقاً
                  </button>
                </div>
              )}

              {offer.status !== "pending" && (
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <span className={`flex items-center gap-1 text-xs font-bold ${offer.status === "accepted" ? "text-emerald-600" : "text-rose-600"}`}>
                    {offer.status === "accepted" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {offer.status === "accepted" ? "تم قبول العرض" : "تم رفض العرض"}
                  </span>
                  {offer.salesRep.phone && (
                    <a href={`tel:${offer.salesRep.phone}`} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all">
                      الاتصال بالمندوب
                    </a>
                  )}
                </div>
              )}

              <p className="text-[10px] text-slate-300 mt-2">{new Date(offer.createdAt).toLocaleDateString("ar-IQ", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
