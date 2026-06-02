"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppointments } from "@/hooks/use-appointments";
import { useWaitlist, useCreateWaitlistEntry, useUpdateWaitlistEntry, useDeleteWaitlistEntry } from "@/hooks/use-waitlist";
import { useDoctors } from "@/hooks/use-doctors";
import { useServices } from "@/hooks/use-services";
import { useAvailability } from "@/hooks/use-availability";
import { startOfDay, endOfDay, format, addMinutes } from "date-fns";
import { arSA } from "date-fns/locale/ar-SA";
import {
  Clock, Phone, User, Plus, X, Check, ArrowRight, Loader2, Users, Search, Stethoscope,
  AlertCircle, CheckCircle2, ArrowLeft, DollarSign, Wallet, Calendar, RefreshCw, TrendingUp,
  Hourglass, Sparkles
} from "lucide-react";

function ft(d: string) { return format(new Date(d), "hh:mm a", { locale: arSA }); }
function fd(d: Date) { return d.toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }

function TBadge({ t }: { t: string }) {
  const m = Math.floor((Date.now() - new Date(t).getTime()) / 60000);
  const c = m < 15 ? "bg-emerald-50 text-emerald-600 border-emerald-200" : m < 30 ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-rose-50 text-rose-600 border-rose-200";
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c}`}>{m < 1 ? "الآن" : m < 60 ? `${m} د` : `${Math.floor(m / 60)} س`}</span>;
}

function AnimatedCard({ children, index }: { children: React.ReactNode; index: number }) {
  return <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 30}ms`, animationFillMode: "both" }}>{children}</div>;
}

export default function DailyOpsBoard() {
  const qc = useQueryClient();
  const today = useMemo(() => new Date(), []);
  const ds = startOfDay(today), de = endOfDay(today);
  const { data: appts, isLoading: la } = useAppointments(ds, de);
  const { data: wl, isLoading: lw } = useWaitlist();
  const { data: docs } = useDoctors();
  const { data: svcs } = useServices();
  const { data: availability } = useAvailability();
  const create = useCreateWaitlistEntry();
  const update = useUpdateWaitlistEntry();
  const del = useDeleteWaitlistEntry();

  const [sAdd, sSA] = useState(false);
  const [nName, sNN] = useState("");
  const [nPhone, sNP] = useState("");
  const [nAge, sNA] = useState("");
  const [nWeight, sNW] = useState("");
  const [nNotes, sNn] = useState("");
  const [nTime, sNT] = useState("");
  const [nSvc, sNS] = useState("");
  const [nDoc, sND] = useState("");
  const [search, sS] = useState("");
  const [payId, sPI] = useState<string | null>(null);
  const [avail, sAv] = useState<"idle" | "checking" | "free" | "taken">("idle");
  const [refreshing, sRef] = useState(false);
  const [justMoved, sJM] = useState<string | null>(null);

  // Auto-refresh every 30s
  useEffect(() => { const i = setInterval(() => { qc.invalidateQueries({ queryKey: ["appointments"] }); qc.invalidateQueries({ queryKey: ["waitlist"] }); }, 30000); return () => clearInterval(i); }, [qc]);

  const wld = wl ?? [];

  const merged = useMemo(() => {
    const items: any[] = [];
    (appts ?? []).forEach((a: any) => {
      if (a.status === "CANCELLED" || a.status === "NO_SHOW") return;
      items.push({ id: a.id, name: a.patientName, phone: a.patientPhone, notes: a.notes, t: ft(a.startTime), rawT: a.startTime, status: a.status, svc: a.serviceName, src: "appt", added: a.startTime, pid: a.patientId, fee: a.consultationFee, paid: a.paymentStatus, age: a.patientAge, weight: a.patientWeight });
    });
    wld.forEach((w: any) => {
      if (!items.some((i: any) => i.pid === w.patientId && i.src === "appt"))
        items.push({ id: w.id, name: w.patientName, phone: w.patientPhone, notes: w.notes, t: ft(w.addedAt), rawT: w.addedAt, status: "SCHEDULED", svc: "انتظار", src: "wl", added: w.addedAt, pid: w.patientId, fee: null, paid: null, age: null, weight: null });
    });
    items.sort((a: any, b: any) => new Date(a.rawT).getTime() - new Date(b.rawT).getTime());
    return items;
  }, [appts, wld]);

  const flt = useMemo(() => {
    if (!search.trim()) return merged;
    const q = search.toLowerCase();
    return merged.filter((p: any) => p.name.toLowerCase().includes(q) || (p.phone && p.phone.includes(q)));
  }, [merged, search]);

  const col1 = flt.filter((p: any) => p.status === "SCHEDULED" || p.status === "CONFIRMED");
  const col2 = flt.filter((p: any) => p.status === "ARRIVED" || p.status === "IN_PROGRESS");
  const col3 = flt.filter((p: any) => p.status === "COMPLETED" || p.status === "completed");

  const checkAvail = (timeStr: string) => {
    sAv("checking");
    const [h, m] = timeStr.split(":").map(Number);
    const slotStart = new Date(today); slotStart.setHours(h, m, 0, 0);
    const slotEnd = addMinutes(slotStart, 30);
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayKey = dayNames[today.getDay()];
    const schedule = (availability?.schedule as any)?.[dayKey];
    const inHours = schedule?.enabled && schedule?.segments?.some((seg: any) => {
      const [sh, sm] = seg.start.split(":").map(Number);
      const [eh, em] = seg.end.split(":").map(Number);
      const segStart = sh * 60 + sm, segEnd = eh * 60 + em, slotMins = h * 60 + m;
      return slotMins >= segStart && (slotMins + 30) <= segEnd;
    });
    const conflict = (appts ?? []).some((a: any) => {
      const as = new Date(a.startTime), ae = new Date(a.endTime);
      return slotStart < ae && slotEnd > as && a.status !== "CANCELLED";
    });
    if (!inHours) sAv("taken");
    else if (conflict) sAv("taken");
    else sAv("free");
  };

  const move = useCallback((p: any, target: string) => {
    const map: any = { waiting: "SCHEDULED", in_progress: "ARRIVED", completed: "COMPLETED" };
    const newStatus = map[target] || target;
    const resetPay = (p.status === "COMPLETED" || p.status === "completed") || (p.status === "ARRIVED" && target === "waiting");
    if (p.src === "appt") {
      const body: any = { status: newStatus };
      if (resetPay && p.paid === "PAID") body.paymentStatus = "PENDING";
      fetch(`/api/appointments/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      // Optimistic: update cache immediately
      qc.setQueryData(["appointments"], (old: any) => old?.map((a: any) => a.id === p.id ? { ...a, status: newStatus, ...(resetPay && p.paid === "PAID" ? { paymentStatus: "PENDING" } : {}) } : a));
    }
    else { const mp: any = { waiting: "waiting", in_progress: "in_progress", completed: "completed" }; update.mutate({ id: p.id, data: { status: mp[target] } }); }
    sJM(p.id); setTimeout(() => sJM(null), 1000);
  }, [update, qc]);

  const mkPaid = async (id: string) => {
    await fetch(`/api/appointments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentStatus: "PAID" }) });
    qc.setQueryData(["appointments"], (old: any) => old?.map((a: any) => a.id === id ? { ...a, paymentStatus: "PAID" } : a));
    sPI(null);
  };

  const cancelPay = (id: string) => {
    fetch(`/api/appointments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentStatus: "PENDING" }) });
    qc.setQueryData(["appointments"], (old: any) => old?.map((a: any) => a.id === id ? { ...a, paymentStatus: "PENDING" } : a));
  };

  const addAppt = async () => {
    if (!nName.trim() || !nTime || !nDoc) return;
    const [h, m] = nTime.split(":").map(Number);
    const start = new Date(today); start.setHours(h, m, 0, 0);
    const extra = [nAge ? `العمر: ${nAge}` : "", nWeight ? `الوزن: ${nWeight} كغم` : "", nNotes || ""].filter(Boolean).join(" | ");
    await fetch("/api/appointments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newPatient: { firstName: nName.split(" ")[0] || nName, lastName: nName.split(" ")[1] || "", phone: nPhone || "" },
        doctorId: nDoc, serviceId: nSvc || svcs?.[0]?.id || "consultation",
        startTime: start.toISOString(), endTime: addMinutes(start, 30).toISOString(),
        notes: extra || undefined, consultationFee: "25000",
      }),
    });
    sSA(false); sNN(""); sNP(""); sNA(""); sNW(""); sNT(""); sNn(""); sND(""); sNS("");
  };

  const refresh = () => { sRef(true); qc.invalidateQueries({ queryKey: ["appointments"] }); qc.invalidateQueries({ queryKey: ["waitlist"] }); setTimeout(() => sRef(false), 800); };

  const donePct = merged.length > 0 ? Math.round((col3.length / merged.length) * 100) : 0;
  const avgWait = col1.reduce((s: number, p: any) => s + (Date.now() - new Date(p.added).getTime()), 0) / Math.max(col1.length, 1);
  const avgWaitMin = Math.round(avgWait / 60000);

  // Auto-select next available time slot when form opens
  useEffect(() => {
    if (sAdd && !nTime) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      // Round up to next 30-min slot, skip past
      let nextSlot = Math.ceil(currentMinutes / 30) * 30;
      if (nextSlot < 9 * 60) nextSlot = 9 * 60;
      if (nextSlot > 20 * 60) nextSlot = 9 * 60;
      const h = Math.floor(nextSlot / 60);
      const m = nextSlot % 60;
      const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      sNT(t);
      setTimeout(() => checkAvail(t), 100);
    }
  }, [sAdd]);

  const fDoc = docs?.[0];
  const dDoc = nDoc || fDoc?.id || "";

  return (
    <div className="space-y-4">
      {/* ── Premium Summary Bar ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-l from-indigo-50/50 via-transparent to-transparent" />
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200"><Sparkles className="w-6 h-6 text-white" /></div>
              <div><h1 className="text-xl font-bold text-slate-900">سير العمل اليومي</h1><p className="text-sm text-slate-400">{fd(today)}</p></div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                <input value={search} onChange={(e) => sS(e.target.value)} placeholder="ابحث عن مريض..." className="w-full px-9 py-2 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-indigo-500/30 bg-white/80" />
              </div>
              <button onClick={refresh} className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"><RefreshCw className={`w-4 h-4 text-slate-500 ${refreshing ? "animate-spin" : ""}`} /></button>
              <button onClick={() => sSA(!sAdd)} className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-l from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-sm hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200"><Plus className="w-4 h-4" /> موعد</button>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100 flex-wrap">
            <div className="flex items-center gap-2 text-sm"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> انتظار: <b className="text-slate-800">{col1.length}</b></div>
            <div className="flex items-center gap-2 text-sm"><span className="w-2.5 h-2.5 rounded-full bg-violet-400" /> جارٍ: <b className="text-slate-800">{col2.length}</b></div>
            <div className="flex items-center gap-2 text-sm"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> مكتمل: <b className="text-slate-800">{col3.length}</b></div>
            <div className="flex items-center gap-2 text-sm text-slate-400">إجمالي: <b>{merged.length}</b></div>
            {avgWaitMin > 0 && <div className="flex items-center gap-1.5 text-sm text-amber-600"><Hourglass className="w-4 h-4" /> متوسط الانتظار: <b>{avgWaitMin} د</b></div>}
            <div className="flex-1" />
            {merged.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-l from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${donePct}%` }} /></div>
                <span className="text-xs font-bold text-slate-400">{donePct}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Form */}
      {sAdd && (
        <div className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 mb-4"><Calendar className="w-4 h-4 text-indigo-500" /><h3 className="font-bold text-slate-800">إضافة موعد جديد</h3><span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">سيظهر في التقويم</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-3">
            <div className="sm:col-span-2"><label className="text-xs font-bold text-slate-500 mb-1 block">المريض</label><input value={nName} onChange={(e) => sNN(e.target.value)} placeholder="اسم المريض" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-indigo-500/30" /></div>
            <div><label className="text-xs font-bold text-slate-500 mb-1 block">الهاتف</label><input value={nPhone} onChange={(e) => sNP(e.target.value)} placeholder="اختياري" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-indigo-500/30" /></div>
            <div><label className="text-xs font-bold text-slate-500 mb-1 block">العمر</label><input type="number" value={nAge} onChange={(e) => sNA(e.target.value)} placeholder="سنة" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-indigo-500/30" /></div>
            <div><label className="text-xs font-bold text-slate-500 mb-1 block">الوزن</label><input type="number" value={nWeight} onChange={(e) => sNW(e.target.value)} placeholder="كغم" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-indigo-500/30" /></div>
            <div><label className="text-xs font-bold text-slate-500 mb-1 block">الخدمة</label><select value={nSvc} onChange={(e) => sNS(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none text-sm bg-white focus:ring-2 focus:ring-indigo-500/30"><option value="">اختر</option>{(svcs ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label className="text-xs font-bold text-slate-500 mb-1 block">الطبيب</label><select value={dDoc} onChange={(e) => sND(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none text-sm bg-white focus:ring-2 focus:ring-indigo-500/30">{(docs ?? []).map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          </div>
          {/* Time slot picker */}
          <div className="mb-3">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">اختر الوقت</label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50/50 rounded-xl border border-slate-100">
              {(() => {
                const slots = [];
                for (let h = 9; h <= 20; h++) {
                  for (let m = 0; m < 60; m += 30) {
                    const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                    const [hh, mm] = t.split(":").map(Number);
                    const slotTime = new Date(today); slotTime.setHours(hh, mm, 0, 0);
                    const past = slotTime <= new Date();
                    slots.push(t);
                  }
                }
                return slots.map((t) => {
                  const [hh, mm] = t.split(":").map(Number);
                  const slotTime = new Date(today); slotTime.setHours(hh, mm, 0, 0);
                  const past = slotTime <= new Date();
                  const isFree = avail === "free" && nTime === t;
                  const isTaken = avail === "taken" && nTime === t;
                  return (
                    <button key={t} type="button" onClick={() => { sNT(t); checkAvail(t); }} disabled={past}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${nTime === t ? (isFree ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm" : isTaken ? "bg-rose-50 border-rose-300 text-rose-700" : "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm") : past ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50"}`}>
                      {t}
                    </button>
                  );
                });
              })()}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => sSA(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600">إلغاء</button>
            <button onClick={addAppt} disabled={!nName || !nTime || !dDoc} className="px-4 py-2 bg-gradient-to-l from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-bold disabled:opacity-50">إضافة</button>
          </div>
        </div>
      )}

      {/* Payment Confirm */}
      {payId && (
        <div className="bg-white rounded-2xl border-2 border-emerald-200 p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
              <div><p className="font-bold text-slate-800">تأكيد الدفع</p><p className="text-xs text-slate-400">سيتم إضافة المبلغ إلى الإيرادات</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => sPI(null)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600">إلغاء</button>
              <button onClick={() => mkPaid(payId)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 flex items-center gap-1"><Check className="w-4 h-4" /> قبول الدفع</button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {(la || lw) ? (
        <div className="flex justify-center py-20"><div className="flex flex-col items-center gap-3"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /><p className="text-sm text-slate-400">جاري التحميل...</p></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Col 1: Waiting */}
          <div className="rounded-2xl border border-amber-200/50 bg-white/50 shadow-sm overflow-hidden transition-all">
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3.5">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 opacity-80" /><h3 className="font-bold text-sm">في الانتظار</h3></div>
                <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">{col1.length}</span>
              </div>
            </div>
            <div className="p-3 space-y-2.5 min-h-[250px]">
              {col1.length === 0 && <div className="flex flex-col items-center justify-center py-12 text-slate-300 gap-2"><div className="p-3 rounded-2xl bg-amber-50"><Clock className="w-8 h-8 text-amber-300" /></div><p className="text-xs">لا يوجد مرضى في الانتظار</p></div>}
              {col1.map((p: any, i: number) => (
                <AnimatedCard key={p.id} index={i}>
                  <div className={`bg-white rounded-xl border-2 ${p.notes ? "border-amber-200" : "border-amber-100"} p-4 shadow-sm hover:shadow-md transition-all duration-200`}>
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><User className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2"><p className="font-bold text-slate-800 text-sm truncate">{p.name}</p><TBadge t={p.added} /></div>
                        <div className="flex items-center gap-2 mt-1 text-[11px]">
                          <span className="font-bold text-slate-400" dir="ltr">{p.t}</span>
                          {p.phone && <a href={`tel:${p.phone}`} className="text-emerald-600 hover:text-emerald-700"><Phone className="w-3 h-3 inline ml-0.5" />{p.phone}</a>}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{p.svc}</span>
                          {p.notes?.includes("العمر:") && <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{p.notes.match(/العمر: (\d+)/)?.[1]} سنة</span>}
                          {p.notes?.includes("الوزن:") && <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{p.notes.match(/الوزن: ([\d.]+)/)?.[1]} كغم</span>}
                          {p.src === "wl" && <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">مباشر</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {p.paid === "PAID" ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> مدفوع</span>
                          ) : p.src === "appt" ? (
                            <>
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">غير مدفوع</span>
                              <button onClick={() => sPI(p.id)} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full hover:bg-emerald-100 transition-all"><Wallet className="w-3 h-3 inline ml-0.5" />تسديد</button>
                            </>
                          ) : null}
                        </div>
                        {p.notes && <p className="text-[10px] text-slate-400 mt-1.5 bg-slate-50 p-1.5 rounded-lg">{p.notes}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-3 pt-3 border-t border-slate-50">
                      <button onClick={() => move(p, "in_progress")} className="flex-1 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg text-xs font-bold hover:from-blue-100 hover:to-indigo-100 transition-all active:scale-[0.98]"><User className="w-3.5 h-3.5 inline ml-0.5" />حضر</button>
                      {p.src === "wl" && <button onClick={() => del.mutate(p.id)} className="px-4 py-2 bg-rose-50 text-rose-500 rounded-lg text-xs font-bold hover:bg-rose-100 transition-all"><X className="w-3.5 h-3.5" /></button>}
                    </div>
                  </div>
                </AnimatedCard>
              ))}
              <button onClick={() => { sSA(true); sNN(""); sNP(""); sNT(""); }} className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-all hover:bg-indigo-50/30">+ إضافة موعد</button>
            </div>
          </div>

          {/* Col 2: In Progress */}
          <div className="rounded-2xl border border-violet-200/50 bg-white/50 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-violet-400 to-purple-500 px-4 py-3.5">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 opacity-80" /><h3 className="font-bold text-sm">قيد المعالجة</h3></div>
                <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">{col2.length}</span>
              </div>
            </div>
            <div className="p-3 space-y-2.5 min-h-[250px]">
              {col2.length === 0 && <div className="flex flex-col items-center justify-center py-12 text-slate-300 gap-2"><div className="p-3 rounded-2xl bg-violet-50"><Stethoscope className="w-8 h-8 text-violet-300" /></div><p className="text-xs">لا يوجد مرضى قيد المعالجة</p></div>}
              {col2.map((p: any, i: number) => (
                <AnimatedCard key={p.id} index={i}>
                  <div className="bg-white rounded-xl border-2 border-violet-100 p-4 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0"><Stethoscope className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2"><p className="font-bold text-slate-800 text-sm truncate">{p.name}</p><TBadge t={p.added} /></div>
                        <div className="flex items-center gap-2 mt-1 text-[11px]">
                          <span className="font-bold text-slate-400" dir="ltr">{p.t}</span>
                          {p.phone && <a href={`tel:${p.phone}`} className="text-emerald-600"><Phone className="w-3 h-3 inline ml-0.5" />{p.phone}</a>}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{p.svc}</span>
                          {p.notes?.includes("العمر:") && <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{p.notes.match(/العمر: (\d+)/)?.[1]} سنة</span>}
                          {p.notes?.includes("الوزن:") && <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{p.notes.match(/الوزن: ([\d.]+)/)?.[1]} كغم</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                          {p.paid === "PAID" ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> مدفوع</span>
                          ) : p.src === "appt" ? (
                            <>
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">غير مدفوع</span>
                              <button onClick={() => sPI(p.id)} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full hover:bg-emerald-100 transition-all"><Wallet className="w-3 h-3 inline ml-0.5" />تسديد</button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-3 pt-3 border-t border-slate-50">
                      <button onClick={() => { if (p.src === "wl") move(p, "completed"); else if (p.paid !== "PAID") sPI(p.id); else move(p, "completed"); }} className="flex-1 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-lg text-xs font-bold hover:from-emerald-100 transition-all active:scale-[0.98]">
                           {p.src === "wl" ? <><Check className="w-3.5 h-3.5 inline ml-0.5" />إتمام</> : p.paid !== "PAID" ? <><Wallet className="w-3.5 h-3.5 inline ml-0.5" />تسديد أولاً</> : <><Check className="w-3.5 h-3.5 inline ml-0.5" />إتمام</>}</button>
                      <button onClick={() => move(p, "waiting")} className="flex-1 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-lg text-xs font-bold hover:from-amber-100 transition-all"><ArrowLeft className="w-3.5 h-3.5 inline" /> إرجاع</button>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
              {col2.length > 0 && col1.length > 0 && <div className="text-center text-[10px] text-slate-300">─ اسحب للأسفل للتحديث ─</div>}
            </div>
          </div>

          {/* Col 3: Completed */}
          <div className="rounded-2xl border border-emerald-200/50 bg-white/50 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-3.5">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 opacity-80" /><h3 className="font-bold text-sm">مكتمل</h3></div>
                <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">{col3.length}</span>
              </div>
            </div>
            <div className="p-3 space-y-2.5 min-h-[250px]">
              {col3.length === 0 && <div className="flex flex-col items-center justify-center py-12 text-slate-300 gap-2"><div className="p-3 rounded-2xl bg-emerald-50"><CheckCircle2 className="w-8 h-8 text-emerald-300" /></div><p className="text-xs">لا يوجد مكتمل</p></div>}
              {col3.map((p: any, i: number) => (
                <AnimatedCard key={p.id} index={i}>
                  <div className="bg-white rounded-xl border-2 border-emerald-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 opacity-80 hover:opacity-100">
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2"><p className="font-bold text-slate-800 text-sm truncate">{p.name}</p><span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{p.t}</span></div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400">{p.svc}</span>
                          {p.paid === "PAID" ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> مدفوع</span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-400 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">غير مدفوع</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-3 pt-3 border-t border-slate-50">
                      <button onClick={() => move(p, "in_progress")} className="flex-1 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg text-xs font-bold hover:from-blue-100 transition-all"><ArrowLeft className="w-3.5 h-3.5 inline" /> استرجاع</button>
                      {p.paid === "PAID" && <button onClick={() => cancelPay(p.id)} className="flex-1 py-2 bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 rounded-lg text-xs font-bold hover:from-rose-100 transition-all"><X className="w-3.5 h-3.5 inline" /> إلغاء الدفع</button>}
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
