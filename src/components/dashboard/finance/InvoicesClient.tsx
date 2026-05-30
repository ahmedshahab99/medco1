"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown,
  Plus, FileText, Printer, Calendar, Download, X, Pencil, Trash2,
  Building2, Wifi, Users, Syringe, Shirt, Lightbulb,
  Megaphone, ShieldCheck, Receipt, Wrench, MoreHorizontal,
  CreditCard, Coins, BarChart3, PieChart, RefreshCw, Check,
  Repeat, ChevronLeft, ChevronRight, Search,
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
  notes?: string | null;
  date: string;
  patientId: string | null;
  patient: { id: string; firstName: string; lastName: string } | null;
};

type Patient = {
  id: string;
  name: string;
  consultationFee: number | null;
};

type RecurringExpense = {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  notes: string | null;
  dayOfMonth: number;
  isActive: boolean;
};

type TabType = "monthly" | "recurring" | "reports";

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

function categoryOptions() {
  return Object.entries(categoryMeta).map(([key, meta]) => ({ value: key, label: meta.label }));
}

// ─── Modal Component ───
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Main Component ───
export function InvoicesClient({
  initialTransactions,
  initialSummary,
  initialRecurringExpenses,
  patients,
  currentMonth: initMonth,
  currentYear: initYear,
}: {
  initialTransactions: Transaction[];
  initialSummary: { totalIncome: number; totalExpense: number; net: number };
  initialRecurringExpenses: RecurringExpense[];
  patients: Patient[];
  currentMonth: number;
  currentYear: number;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("monthly");
  const [transactions, setTransactions] = useState(initialTransactions);
  const [summary, setSummary] = useState(initialSummary);
  const [month, setMonth] = useState(initMonth);
  const [year, setYear] = useState(initYear);
  const [statementMode, setStatementMode] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Add transaction form
  const [showAddForm, setShowAddForm] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [formType, setFormType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [formCategory, setFormCategory] = useState("CONSULTATION");
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formPatient, setFormPatient] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Recurring expenses
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(initialRecurringExpenses);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [editRecurring, setEditRecurring] = useState<RecurringExpense | null>(null);
  const [recCategory, setRecCategory] = useState("CLINIC_RENT");
  const [recAmount, setRecAmount] = useState("");
  const [recDescription, setRecDescription] = useState("");
  const [recNotes, setRecNotes] = useState("");
  const [recDay, setRecDay] = useState("1");
  const [applyingRecurring, setApplyingRecurring] = useState(false);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      if (filterType !== "all" && t.type !== filterType) return false;
      return true;
    });
  }, [transactions, filterCategory, filterType]);

  const incomeTotal = filteredTransactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const expenseTotal = filteredTransactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const netTotal = incomeTotal - expenseTotal;

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    for (const t of filteredTransactions) {
      if (!map[t.category]) map[t.category] = { income: 0, expense: 0 };
      if (t.type === "INCOME") map[t.category].income += t.amount;
      else map[t.category].expense += t.amount;
    }
    return map;
  }, [filteredTransactions]);

  const monthName = new Date(year, month - 1).toLocaleDateString("ar-IQ", { month: "long" });

  // ─── API calls ───
  async function fetchTransactions(m: number, y: number) {
    const res = await fetch(`/api/transactions?month=${m}&year=${y}`);
    if (res.ok) {
      const data = await res.json();
      setTransactions(data.transactions);
      setSummary(data.summary);
    }
    // Auto-apply recurring expenses for this month
    fetch("/api/transactions/recurring/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: m, year: y }),
    }).then(async (applyRes) => {
      if (applyRes.ok) {
        const applyData = await applyRes.json();
        if (applyData.count > 0) {
          const res2 = await fetch(`/api/transactions?month=${m}&year=${y}`);
          if (res2.ok) {
            const data2 = await res2.json();
            setTransactions(data2.transactions);
            setSummary(data2.summary);
          }
        }
      }
    }).catch(() => {});
  }

  async function fetchRecurring() {
    const res = await fetch("/api/transactions/recurring");
    if (res.ok) {
      setRecurringExpenses(await res.json());
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const isEdit = !!editTx;
    const url = isEdit ? `/api/transactions/${editTx!.id}` : "/api/transactions";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
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
      toast.error(err.error || "فشل في الحفظ");
      return;
    }

    toast.success(isEdit ? "تم التحديث بنجاح" : "تم الحفظ بنجاح");
    setShowAddForm(false);
    setEditTx(null);
    resetForm();
    fetchTransactions(month, year);
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه المعاملة؟")) return;
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("فشل في الحذف"); return; }
    toast.success("تم الحذف بنجاح");
    fetchTransactions(month, year);
  }

  function openEdit(tx: Transaction) {
    setEditTx(tx);
    setFormType(tx.type);
    setFormCategory(tx.category);
    setFormAmount(tx.amount.toString());
    setFormDescription(tx.description || "");
    setFormDate(new Date(tx.date).toISOString().split("T")[0]);
    setFormPatient(tx.patientId || "");
    setShowAddForm(true);
  }

  function resetForm() {
    setFormType("INCOME");
    setFormCategory("CONSULTATION");
    setFormAmount("");
    setFormDescription("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormPatient("");
    setEditTx(null);
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
    setTimeout(() => { window.print(); setStatementMode(false); }, 500);
  }

  // ─── Recurring handlers ───
  async function handleRecurringSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const isEdit = !!editRecurring;
    const url = isEdit ? `/api/transactions/recurring/${editRecurring!.id}` : "/api/transactions/recurring";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: recCategory,
        amount: parseFloat(recAmount),
        description: recDescription,
        notes: recNotes || undefined,
        dayOfMonth: parseInt(recDay),
      }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "فشل في الحفظ");
      return;
    }

    toast.success(isEdit ? "تم التحديث بنجاح" : "تم الحفظ بنجاح");
    setShowRecurringForm(false);
    setEditRecurring(null);
    resetRecurringForm();
    fetchRecurring();
  }

  async function handleDeleteRecurring(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المصروف الثابت؟")) return;
    const res = await fetch(`/api/transactions/recurring/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("فشل في الحذف"); return; }
    toast.success("تم الحذف بنجاح");
    fetchRecurring();
  }

  async function handleApplyRecurring() {
    setApplyingRecurring(true);
    const res = await fetch("/api/transactions/recurring/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, year }),
    });
    setApplyingRecurring(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "فشل في تطبيق المصروفات");
      return;
    }
    const data = await res.json();
    toast.success(`تم إضافة ${data.count} مصروف من أصل ${data.total}`);
    fetchTransactions(month, year);
  }

  function openEditRecurring(ex: RecurringExpense) {
    setEditRecurring(ex);
    setRecCategory(ex.category);
    setRecAmount(ex.amount.toString());
    setRecDescription(ex.description || "");
    setRecNotes(ex.notes || "");
    setRecDay(ex.dayOfMonth.toString());
    setShowRecurringForm(true);
  }

  function resetRecurringForm() {
    setRecCategory("CLINIC_RENT");
    setRecAmount("");
    setRecDescription("");
    setRecNotes("");
    setRecDay("1");
    setEditRecurring(null);
  }

  // Load recurring on tab switch
  React.useEffect(() => {
    if (activeTab === "recurring") fetchRecurring();
  }, [activeTab]);

  // ─── CSV Export ───
  function exportCSV() {
    const headers = ["التاريخ", "النوع", "التصنيف", "الوصف", "المبلغ", "المريض"];
    const rows = filteredTransactions.map((t) => [
      formatDate(t.date),
      t.type === "INCOME" ? "دخل" : "مصروف",
      categoryMeta[t.category]?.label || t.category,
      t.description || "",
      t.amount.toString(),
      t.patient ? `${t.patient.firstName} ${t.patient.lastName}` : "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `تقارير-مالية-${monthName}-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير الملف");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-l from-indigo-600 via-purple-600 to-emerald-600 text-white px-4 py-4 md:px-6 md:py-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-300/20 rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <Wallet className="w-4 h-4" />
                الإدارة المالية
              </div>
              <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">الفواتير والإيرادات</h1>
            </div>
            {activeTab === "monthly" && (
              <div className="flex gap-1.5 md:gap-2">
                <button onClick={() => { resetForm(); setShowAddForm(true); }} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold flex items-center gap-1 md:gap-2 transition-all">
                  <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /><span className="hidden md:inline">إضافة</span><span className="md:hidden">جديد</span>
                </button>
                <button onClick={printStatement} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold items-center gap-1 md:gap-2 transition-all hidden md:flex">
                  <Printer className="w-3.5 h-3.5 md:w-4 md:h-4" />طباعة
                </button>
                <button onClick={exportCSV} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold items-center gap-1 md:gap-2 transition-all hidden md:flex">
                  <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />تصدير
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/10 rounded-lg md:rounded-xl p-0.5 md:p-1 w-fit">
            {[
              { key: "monthly" as TabType, label: "شهري", icon: Calendar },
              { key: "recurring" as TabType, label: "مصروفات", icon: Repeat },
              { key: "reports" as TabType, label: "تقارير", icon: BarChart3 },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-1 md:gap-1.5 px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${activeTab === t.key ? "bg-white text-indigo-700 shadow-sm" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
                  <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />{t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 -mt-4 relative z-10">
        {activeTab === "monthly" && (
          <MonthlyView
            month={month} year={year} monthName={monthName}
            changeMonth={changeMonth}
            incomeTotal={incomeTotal} expenseTotal={expenseTotal} netTotal={netTotal}
            formatCurrency={formatCurrency}
            filterCategory={filterCategory} setFilterCategory={setFilterCategory}
            filterType={filterType} setFilterType={setFilterType}
            filteredTransactions={filteredTransactions}
            categoryBreakdown={categoryBreakdown}
            categoryMeta={categoryMeta}
            formatDate={formatDate}
            openEdit={openEdit}
            handleDelete={handleDelete}
            showAddForm={showAddForm} setShowAddForm={setShowAddForm}
            editTx={editTx} resetForm={resetForm}
            formType={formType} setFormType={setFormType}
            formCategory={formCategory} setFormCategory={setFormCategory}
            formAmount={formAmount} setFormAmount={setFormAmount}
            formDescription={formDescription} setFormDescription={setFormDescription}
            formDate={formDate} setFormDate={setFormDate}
            formPatient={formPatient} setFormPatient={setFormPatient}
            patients={patients}
            submitting={submitting}
            handleSubmit={handleSubmit}
          />
        )}

        {activeTab === "recurring" && (
          <RecurringView
            recurringExpenses={recurringExpenses}
            showRecurringForm={showRecurringForm} setShowRecurringForm={setShowRecurringForm}
            editRecurring={editRecurring}
            recCategory={recCategory} setRecCategory={setRecCategory}
            recAmount={recAmount} setRecAmount={setRecAmount}
            recDescription={recDescription} setRecDescription={setRecDescription}
            recNotes={recNotes} setRecNotes={setRecNotes}
            recDay={recDay} setRecDay={setRecDay}
            submitting={submitting}
            handleRecurringSubmit={handleRecurringSubmit}
            handleDeleteRecurring={handleDeleteRecurring}
            openEditRecurring={openEditRecurring}
            resetRecurringForm={resetRecurringForm}
            handleApplyRecurring={handleApplyRecurring}
            applyingRecurring={applyingRecurring}
            categoryMeta={categoryMeta}
            monthName={monthName}
          />
        )}

        {activeTab === "reports" && (
          <ReportsView
            year={year} setYear={setYear}
            formatCurrency={formatCurrency}
            categoryMeta={categoryMeta}
          />
        )}
      </div>

      {/* Print Statement */}
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
                {filteredTransactions.map((t) => {
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

// ─── Monthly View ───
function MonthlyView({
  month, year, monthName, changeMonth,
  incomeTotal, expenseTotal, netTotal, formatCurrency,
  filterCategory, setFilterCategory, filterType, setFilterType,
  filteredTransactions, categoryBreakdown, categoryMeta, formatDate,
  openEdit, handleDelete,
  showAddForm, setShowAddForm, editTx, resetForm,
  formType, setFormType, formCategory, setFormCategory,
  formAmount, setFormAmount, formDescription, setFormDescription,
  formDate, setFormDate, formPatient, setFormPatient,
  patients, submitting, handleSubmit,
}: any) {
  return (
    <>
      {/* Month Nav + Summary */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-indigo-100/30 border border-slate-100 p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            نظرة عامة
          </h3>
          <div className="flex items-center gap-3">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-all"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
            <span className="font-bold text-slate-700 min-w-[120px] text-center">{monthName} {year}</span>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg transition-all"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SummaryCard title="إجمالي الدخل" amount={incomeTotal} formatCurrency={formatCurrency} type="income" />
          <SummaryCard title="إجمالي المصروفات" amount={expenseTotal} formatCurrency={formatCurrency} type="expense" />
          <SummaryCard title="صافي الأرباح" amount={netTotal} formatCurrency={formatCurrency} type={netTotal >= 0 ? "income" : "expense"} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-36 h-9 text-sm bg-white border-slate-200"><SelectValue placeholder="التصنيف" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل التصنيفات</SelectItem>
              {Object.entries(categoryMeta).map(([key, meta]: [string, typeof categoryMeta[string]]) => (
                <SelectItem key={key} value={key}>{meta.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32 h-9 text-sm bg-white border-slate-200"><SelectValue placeholder="النوع" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="INCOME">دخل</SelectItem>
              <SelectItem value="EXPENSE">مصروف</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span className="text-xs text-slate-400">{filteredTransactions.length} معاملة</span>
      </div>

      {/* Transaction Form Modal */}
      <Modal isOpen={showAddForm} onClose={() => { setShowAddForm(false); resetForm(); }} title={editTx ? "تعديل المعاملة" : "إضافة معاملة جديدة"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>النوع</Label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setFormType("INCOME")} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${formType === "INCOME" ? "bg-emerald-500 text-white shadow-lg" : "bg-slate-100 text-slate-600"}`}>
                <ArrowUpRight className="w-4 h-4 inline ms-1" />دخل
              </button>
              <button type="button" onClick={() => setFormType("EXPENSE")} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${formType === "EXPENSE" ? "bg-rose-500 text-white shadow-lg" : "bg-slate-100 text-slate-600"}`}>
                <ArrowDownRight className="w-4 h-4 inline ms-1" />مصروف
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>التصنيف</Label>
            <Select value={formCategory} onValueChange={setFormCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(categoryMeta).map(([key, meta]: [string, typeof categoryMeta[string]]) => (
                  <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>المبلغ</Label>
              <Input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="0" dir="ltr" required />
            </div>
            <div className="space-y-1.5">
              <Label>التاريخ</Label>
              <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>الوصف</Label>
            <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="وصف المعاملة..." />
          </div>
          <div className="space-y-1.5">
            <Label>المريض (اختياري)</Label>
            <Select value={formPatient} onValueChange={setFormPatient}>
              <SelectTrigger><SelectValue placeholder="اختر مريض..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">بدون مريض</SelectItem>
                {patients.map((p: Patient) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); resetForm(); }}>إلغاء</Button>
            <Button type="submit" disabled={submitting} className="bg-gradient-to-l from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white shadow-lg">
              {submitting ? "جاري الحفظ..." : editTx ? "تحديث" : "حفظ"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Main content: log + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                سجل المعاملات
              </h3>
            </div>
            <div className="divide-y divide-slate-50 max-h-[50vh] md:max-h-[600px] overflow-y-auto">
              {filteredTransactions.length === 0 && (
                <div className="p-10 text-center text-slate-400">
                  <Wallet className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>لا توجد معاملات</p>
                </div>
              )}
              {filteredTransactions.map((t: Transaction) => {
                const meta = categoryMeta[t.category] || categoryMeta.OTHER;
                const Icon = meta.icon;
                return (
                  <div key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.type === "INCOME" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
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
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-indigo-500" />
              توزيع المصروفات
            </h3>
            <div className="space-y-2.5">
              {Object.entries(categoryBreakdown)
                .filter(([, v]: any) => v.expense > 0)
                .sort(([, a]: any, [, b]: any) => b.expense - a.expense)
                .map(([cat, val]: any) => {
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
              {Object.entries(categoryBreakdown).filter(([, v]: any) => v.expense > 0).length === 0 && (
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
                .filter(([, v]: any) => v.income > 0)
                .sort(([, a]: any, [, b]: any) => b.income - a.income)
                .map(([cat, val]: any) => {
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
              {Object.entries(categoryBreakdown).filter(([, v]: any) => v.income > 0).length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">لا يوجد دخل</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SummaryCard({ title, amount, formatCurrency, type }: { title: string; amount: number; formatCurrency: (n: number) => string; type: "income" | "expense" }) {
  const isIncome = type === "income";
  const colors = isIncome ? "emerald" : "rose";
  const Icon = isIncome ? TrendingUp : TrendingDown;
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-${colors}-100 p-4 hover:shadow-md transition-all`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 bg-${colors}-100 rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${colors}-600`} />
        </div>
        <span className={`text-xs font-bold text-${colors}-600 bg-${colors}-50 px-2 py-0.5 rounded-full`}>{isIncome ? "دخل" : type === "expense" ? "مصروف" : "صافي"}</span>
      </div>
      <p className="text-xl font-extrabold text-slate-800">{formatCurrency(amount)}</p>
      <p className="text-xs text-slate-400 mt-0.5">{title}</p>
    </div>
  );
}

// ─── Recurring Expenses View ───
function RecurringView({
  recurringExpenses, showRecurringForm, setShowRecurringForm,
  editRecurring, recCategory, setRecCategory,
  recAmount, setRecAmount, recDescription, setRecDescription,
  recNotes, setRecNotes, recDay, setRecDay,
  submitting, handleRecurringSubmit,
  handleDeleteRecurring, openEditRecurring, resetRecurringForm,
  handleApplyRecurring, applyingRecurring, categoryMeta, monthName,
}: any) {
  return (
    <>
      {/* Header actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-lg text-slate-800">المصروفات الثابتة</h3>
          <p className="text-xs text-slate-400">مصروفات تتكرر شهرياً (إيجار، رواتب، إنترنت...)</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            تلقائي
          </span>
          <button onClick={() => { resetRecurringForm(); setShowRecurringForm(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-200">
            <Plus className="w-4 h-4" />إضافة مصروف ثابت
          </button>
        </div>
      </div>

      {/* Recurring form modal */}
      <Modal isOpen={showRecurringForm} onClose={() => { setShowRecurringForm(false); resetRecurringForm(); }}
        title={editRecurring ? "تعديل مصروف ثابت" : "إضافة مصروف ثابت"}>
        <form onSubmit={handleRecurringSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>التصنيف</Label>
            <Select value={recCategory} onValueChange={setRecCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(categoryMeta).filter(([k]) => k !== "CONSULTATION" && k !== "SERVICES").map(([key, meta]: [string, typeof categoryMeta[string]]) => (
                  <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>المبلغ</Label>
              <Input type="number" value={recAmount} onChange={(e) => setRecAmount(e.target.value)} placeholder="0" dir="ltr" required />
            </div>
            <div className="space-y-1.5">
              <Label>اليوم من الشهر</Label>
              <Input type="number" min={1} max={28} value={recDay} onChange={(e) => setRecDay(e.target.value)} dir="ltr" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>الوصف</Label>
            <Input value={recDescription} onChange={(e) => setRecDescription(e.target.value)} placeholder="مثال: إيجار العيادة" required />
          </div>
          <div className="space-y-1.5">
            <Label>ملاحظات (اختياري)</Label>
            <Input value={recNotes} onChange={(e) => setRecNotes(e.target.value)} placeholder="ملاحظات..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { setShowRecurringForm(false); resetRecurringForm(); }}>إلغاء</Button>
            <Button type="submit" disabled={submitting} className="bg-gradient-to-l from-indigo-600 to-emerald-600 text-white shadow-lg">
              {submitting ? "جاري الحفظ..." : editRecurring ? "تحديث" : "حفظ"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Recurring list */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        {recurringExpenses.length === 0 && (
          <div className="p-10 text-center text-slate-400">
            <Repeat className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>لا توجد مصروفات ثابتة</p>
            <p className="text-xs mt-1">أضف المصروفات الشهرية مثل الإيجار والرواتب والإنترنت</p>
          </div>
        )}
        <div className="divide-y divide-slate-50">
          {recurringExpenses.map((ex: RecurringExpense) => {
            const meta = categoryMeta[ex.category] || categoryMeta.OTHER;
            const Icon = meta.icon;
            return (
              <div key={ex.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-700">{ex.description}</p>
                    {!ex.isActive && <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">غير نشط</span>}
                  </div>
                  <p className="text-xs text-slate-400">{meta.label} • يوم {ex.dayOfMonth} من كل شهر</p>
                </div>
                <span className="text-sm font-extrabold text-rose-600">{formatCurrency(ex.amount)}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditRecurring(ex)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteRecurring(ex.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Reports View ───
function ReportsView({ year, setYear, formatCurrency, categoryMeta }: any) {
  const [monthlyData, setMonthlyData] = useState<Array<{ month: number; income: number; expense: number; net: number }>>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const results = [];
      for (let m = 1; m <= 12; m++) {
        const res = await fetch(`/api/transactions?month=${m}&year=${year}`);
        if (res.ok) {
          const data = await res.json();
          const income = data.summary.totalIncome;
          const expense = data.summary.totalExpense;
          results.push({ month: m, income, expense, net: income - expense });
        }
      }
      setMonthlyData(results);
      setLoading(false);
    }
    load();
  }, [year]);

  const monthNames = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const yearIncome = monthlyData.reduce((s, m) => s + m.income, 0);
  const yearExpense = monthlyData.reduce((s, m) => s + m.expense, 0);
  const yearNet = yearIncome - yearExpense;

  const maxVal = Math.max(...monthlyData.map((m) => Math.max(m.income, m.expense)), 1);

  return (
    <>
      {/* Year selector */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-slate-800">التقارير السنوية</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setYear((y: number) => y - 1)} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
          <span className="font-bold text-lg text-slate-700 min-w-[80px] text-center">{year}</span>
          <button onClick={() => setYear((y: number) => y + 1)} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
        </div>
      </div>

      {/* Year summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl shadow-lg p-5">
          <p className="text-white/80 text-sm">إجمالي الدخل السنوي</p>
          <p className="text-2xl font-extrabold mt-1">{formatCurrency(yearIncome)}</p>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-rose-700 text-white rounded-2xl shadow-lg p-5">
          <p className="text-white/80 text-sm">إجمالي المصروفات السنوي</p>
          <p className="text-2xl font-extrabold mt-1">{formatCurrency(yearExpense)}</p>
        </div>
        <div className={`bg-gradient-to-br ${yearNet >= 0 ? "from-indigo-500 to-purple-700" : "from-rose-600 to-red-800"} text-white rounded-2xl shadow-lg p-5`}>
          <p className="text-white/80 text-sm">صافي الأرباح السنوي</p>
          <p className="text-2xl font-extrabold mt-1">{formatCurrency(yearNet)}</p>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
        <h3 className="font-bold text-slate-800 mb-4">مقارنة شهرية</h3>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        ) : (
          <div className="space-y-1">
            {monthlyData.map((m) => (
              <div key={m.month} className="space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 w-16">{monthNames[m.month - 1]}</span>
                  <div className="flex gap-3 text-[11px]">
                    <span className="text-emerald-600 font-bold">{formatCurrency(m.income)}</span>
                    <span className="text-rose-600 font-bold">{formatCurrency(m.expense)}</span>
                    <span className={`font-bold ${m.net >= 0 ? "text-indigo-600" : "text-rose-700"}`}>{formatCurrency(m.net)}</span>
                  </div>
                </div>
                <div className="h-5 bg-slate-50 rounded-lg overflow-hidden flex">
                  <div className="h-full bg-gradient-to-l from-emerald-400 to-emerald-500 transition-all" style={{ width: `${(m.income / maxVal) * 50}%` }} />
                  <div className="h-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all" style={{ width: `${(m.expense / maxVal) * 50}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Month details table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">تفاصيل الشهور</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500">
                <th className="text-right p-3 font-bold">الشهر</th>
                <th className="text-left p-3 font-bold">الدخل</th>
                <th className="text-left p-3 font-bold">المصروفات</th>
                <th className="text-left p-3 font-bold">الصافي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {monthlyData.map((m) => (
                <tr key={m.month} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-sm font-bold text-slate-700">{monthNames[m.month - 1]}</td>
                  <td className="p-3 text-sm text-left text-emerald-600 font-bold">{formatCurrency(m.income)}</td>
                  <td className="p-3 text-sm text-left text-rose-600 font-bold">{formatCurrency(m.expense)}</td>
                  <td className={`p-3 text-sm text-left font-bold ${m.net >= 0 ? "text-indigo-600" : "text-rose-700"}`}>{formatCurrency(m.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
