"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown,
  Plus, FileText, Printer, Calendar, Download, Filter, X,
  Building2, Wifi, Users, Syringe, Shirt, Car, Lightbulb,
  Megaphone, ShieldCheck, Receipt, Wrench, MoreHorizontal,
  CreditCard, Coins, PiggyBank, BarChart3, PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { toast } from "sonner";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  description: string | null;
  date: string;
  patientId: string | null;
  patient: { id: string; firstName: string; lastName: string } | null;
};

type Patient = {
  id: string;
  name: string;
  consultationFee: number | null;
};

const categoryMeta: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  CONSULTATION: { label: "الكشفية", icon: StethoscopeIcon, color: "emerald" },
  MEDICATIONS: { label: "الأدوية", icon: Syringe, color: "blue" },
  SERVICES: { label: "الخدمات", icon: Receipt, color: "violet" },
  CLINIC_RENT: { label: "إيجار العيادة", icon: Building2, color: "orange" },
  INTERNET: { label: "الإنترنت", icon: Wifi, color: "sky" },
  SALARIES: { label: "الرواتب", icon: Users, color: "rose" },
  UTILITIES: { label: "الفواتير", icon: Lightbulb, color: "yellow" },
  SUPPLIES: { label: "المستلزمات", icon: Shirt, color: "teal" },
  MARKETING: { label: "التسويق", icon: Megaphone, color: "pink" },
  INSURANCE: { label: "التأمين", icon: ShieldCheck, color: "indigo" },
  TAXES: { label: "الضرائب", icon: FileText, color: "stone" },
  MAINTENANCE: { label: "الصيانة", icon: Wrench, color: "slate" },
  OTHER: { label: "أخرى", icon: MoreHorizontal, color: "gray" },
};

function StethoscopeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 3a3 3 0 0 1 3 3v1a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z" />
      <path d="M11 7v8" />
      <path d="M15 13a4 4 0 0 1-8 0" />
      <circle cx="18" cy="16" r="2" />
      <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
    </svg>
  );
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("ar-IQ") + " د.ع";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-IQ", { day: "numeric", month: "short", year: "numeric" });
}

export function InvoicesClient({
  initialTransactions,
  initialSummary,
  patients,
  currentMonth: initMonth,
  currentYear: initYear,
}: {
  initialTransactions: Transaction[];
  initialSummary: { totalIncome: number; totalExpense: number; net: number };
  patients: Patient[];
  currentMonth: number;
  currentYear: number;
}) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [summary, setSummary] = useState(initialSummary);
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [formCategory, setFormCategory] = useState("CONSULTATION");
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formPatient, setFormPatient] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statementMode, setStatementMode] = useState(false);

  async function fetchTransactions(m: number, y: number) {
    const res = await fetch(`/api/transactions?month=${m}&year=${y}`);
    if (res.ok) {
      const data = await res.json();
      setTransactions(data.transactions);
      setSummary(data.summary);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: formType,
        category: formCategory,
        amount: parseFloat(formAmount),
        description: formDescription || undefined,
        date: formDate,
        patientId: formPatient || undefined,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "فشل في حفظ المعاملة");
      return;
    }
    toast.success("تم الحفظ بنجاح");
    setShowForm(false);
    setFormAmount("");
    setFormDescription("");
    setFormPatient("");
    fetchTransactions(month, year);
  }

  function changeMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setMonth(m);
    setYear(y);
    fetchTransactions(m, y);
  }

  function printStatement() {
    setStatementMode(true);
    setTimeout(() => {
      window.print();
      setStatementMode(false);
    }, 500);
  }

  const incomeTotal = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const expenseTotal = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const netTotal = incomeTotal - expenseTotal;

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    for (const t of transactions) {
      if (!map[t.category]) map[t.category] = { income: 0, expense: 0 };
      if (t.type === "INCOME") map[t.category].income += t.amount;
      else map[t.category].expense += t.amount;
    }
    return map;
  }, [transactions]);

  const monthName = new Date(year, month - 1).toLocaleDateString("ar-IQ", { month: "long" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-l from-indigo-600 via-purple-600 to-emerald-600 text-white px-6 py-8 md:py-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-300/20 rounded-full blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
              <Wallet className="w-4 h-4" />
              الإدارة المالية
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">الفواتير والمدفوعات</h1>
            <p className="text-white/70 text-sm mt-1">{monthName} {year}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(!showForm)} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
              <Plus className="w-4 h-4" />
              إضافة معاملة
            </button>
            <button onClick={printStatement} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
              <Printer className="w-4 h-4" />
              كشف حساب
            </button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="relative flex items-center justify-center gap-4 mt-6">
          <button onClick={() => changeMonth(-1)} className="bg-white/15 hover:bg-white/25 rounded-lg p-2 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-lg font-bold">{monthName} {year}</span>
          <button onClick={() => changeMonth(1)} className="bg-white/15 hover:bg-white/25 rounded-lg p-2 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 -mt-6 relative z-10">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-lg shadow-emerald-100/50 border border-emerald-100 p-5 transform hover:scale-[1.02] transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">دخل</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-800 mt-3">{formatCurrency(incomeTotal)}</p>
            <p className="text-xs text-slate-400 mt-1">إجمالي الدخل</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg shadow-rose-100/50 border border-rose-100 p-5 transform hover:scale-[1.02] transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-rose-600" />
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">مصروف</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-800 mt-3">{formatCurrency(expenseTotal)}</p>
            <p className="text-xs text-slate-400 mt-1">إجمالي المصروفات</p>
          </div>
          <div className={`bg-white rounded-2xl shadow-lg border p-5 transform hover:scale-[1.02] transition-all ${netTotal >= 0 ? "shadow-emerald-100/50 border-emerald-100" : "shadow-rose-100/50 border-rose-100"}`}>
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${netTotal >= 0 ? "bg-emerald-100" : "bg-rose-100"}`}>
                {netTotal >= 0 ? <Coins className="w-6 h-6 text-emerald-600" /> : <CreditCard className="w-6 h-6 text-rose-600" />}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${netTotal >= 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}`}>صافي</span>
            </div>
            <p className={`text-2xl font-extrabold mt-3 ${netTotal >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{formatCurrency(netTotal)}</p>
            <p className="text-xs text-slate-400 mt-1">صافي الأرباح</p>
          </div>
        </div>

        {/* Add Transaction Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                إضافة معاملة جديدة
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label>النوع</Label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setFormType("INCOME")} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${formType === "INCOME" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-slate-100 text-slate-600"}`}>
                    <ArrowUpRight className="w-4 h-4 inline ms-1" />دخل
                  </button>
                  <button type="button" onClick={() => setFormType("EXPENSE")} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${formType === "EXPENSE" ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "bg-slate-100 text-slate-600"}`}>
                    <ArrowDownRight className="w-4 h-4 inline ms-1" />مصروف
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>التصنيف</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryMeta).map(([key, meta]) => (
                      <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>المبلغ</Label>
                <Input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="0" dir="ltr" required />
              </div>
              <div className="space-y-1.5">
                <Label>التاريخ</Label>
                <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>الوصف</Label>
                <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="وصف المعاملة..." />
              </div>
              <div className="space-y-1.5">
                <Label>المريض (اختياري)</Label>
                <Select value={formPatient} onValueChange={setFormPatient}>
                  <SelectTrigger><SelectValue placeholder="اختر مريض..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">بدون مريض</SelectItem>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-l from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white shadow-lg">
                  {submitting ? "جاري الحفظ..." : "حفظ المعاملة"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  سجل المعاملات
                </h3>
                <span className="text-xs text-slate-400">{transactions.length} معاملة</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                {transactions.length === 0 && (
                  <div className="p-10 text-center text-slate-400">
                    <Wallet className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>لا توجد معاملات لهذا الشهر</p>
                    <button onClick={() => setShowForm(true)} className="text-indigo-500 font-bold text-sm mt-2 hover:underline">أضف أول معاملة</button>
                  </div>
                )}
                {transactions.map((t) => {
                  const meta = categoryMeta[t.category] || categoryMeta.OTHER;
                  const Icon = meta.icon;
                  return (
                    <div key={t.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        t.type === "INCOME" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{meta.label}</p>
                        <p className="text-xs text-slate-400 truncate">{t.description || formatDate(t.date)}</p>
                      </div>
                      {t.patient && <span className="text-xs text-slate-400 hidden md:block">{t.patient.firstName} {t.patient.lastName}</span>}
                      <span className={`text-sm font-extrabold ${t.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                        {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Category Pie */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <PieChart className="w-4 h-4 text-indigo-500" />
                توزيع المصروفات
              </h3>
              <div className="space-y-2.5">
                {Object.entries(categoryBreakdown)
                  .filter(([, v]) => v.expense > 0)
                  .sort(([, a], [, b]) => b.expense - a.expense)
                  .map(([cat, val]) => {
                    const meta = categoryMeta[cat] || categoryMeta.OTHER;
                    const pct = expenseTotal > 0 ? (val.expense / expenseTotal) * 100 : 0;
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-slate-600">{meta.label}</span>
                          <span className="font-bold text-slate-800">{formatCurrency(val.expense)}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-l from-rose-400 to-rose-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                {Object.entries(categoryBreakdown).filter(([, v]) => v.expense > 0).length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">لا توجد مصروفات</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Coins className="w-4 h-4 text-emerald-500" />
                توزيع الدخل
              </h3>
              <div className="space-y-2.5">
                {Object.entries(categoryBreakdown)
                  .filter(([, v]) => v.income > 0)
                  .sort(([, a], [, b]) => b.income - a.income)
                  .map(([cat, val]) => {
                    const meta = categoryMeta[cat] || categoryMeta.OTHER;
                    const pct = incomeTotal > 0 ? (val.income / incomeTotal) * 100 : 0;
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-slate-600">{meta.label}</span>
                          <span className="font-bold text-slate-800">{formatCurrency(val.income)}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-l from-emerald-400 to-emerald-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                {Object.entries(categoryBreakdown).filter(([, v]) => v.income > 0).length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">لا يوجد دخل</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Statement Overlay */}
      {statementMode && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto p-8 no-print" dir="rtl">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-slate-800">كشف حساب شهري</h1>
              <p className="text-slate-500 mt-1">{monthName} {year}</p>
            </div>
            <table className="w-full border-collapse mb-8">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-right p-3 text-sm font-bold text-slate-600">التاريخ</th>
                  <th className="text-right p-3 text-sm font-bold text-slate-600">التصنيف</th>
                  <th className="text-right p-3 text-sm font-bold text-slate-600">الوصف</th>
                  <th className="text-left p-3 text-sm font-bold text-slate-600">الدخل</th>
                  <th className="text-left p-3 text-sm font-bold text-slate-600">المصروف</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const meta = categoryMeta[t.category] || categoryMeta.OTHER;
                  return (
                    <tr key={t.id} className="border-b border-slate-100">
                      <td className="p-3 text-sm text-slate-700">{formatDate(t.date)}</td>
                      <td className="p-3 text-sm text-slate-700">{meta.label}</td>
                      <td className="p-3 text-sm text-slate-500">{t.description || "—"}</td>
                      <td className="p-3 text-sm text-left text-emerald-600 font-bold">{t.type === "INCOME" ? formatCurrency(t.amount) : "—"}</td>
                      <td className="p-3 text-sm text-left text-rose-600 font-bold">{t.type === "EXPENSE" ? formatCurrency(t.amount) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 font-extrabold">
                  <td colSpan={3} className="p-3 text-sm text-slate-800">الإجمالي</td>
                  <td className="p-3 text-sm text-left text-emerald-600">{formatCurrency(incomeTotal)}</td>
                  <td className="p-3 text-sm text-left text-rose-600">{formatCurrency(expenseTotal)}</td>
                </tr>
                <tr className="font-extrabold text-lg">
                  <td colSpan={3} className="p-3 text-slate-800">صافي الأرباح</td>
                  <td colSpan={2} className={`p-3 text-left ${netTotal >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{formatCurrency(netTotal)}</td>
                </tr>
              </tfoot>
            </table>
            <div className="text-center text-xs text-slate-400 mt-12">
              <p>تم إنشاء هذا الكشف إلكترونياً عبر نظام ميدكو</p>
              <p>{new Date().toLocaleString("ar-IQ")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
