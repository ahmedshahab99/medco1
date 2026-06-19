"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Plus, Download } from "lucide-react";
import { toast } from "sonner";

import { SummaryCards } from "./SummaryCards";
import {
  PeriodSelector,
  type PeriodMode,
} from "./PeriodSelector";
import { IncomeExpenseChart } from "./IncomeExpenseChart";
import { IncomeByDoctorChart } from "./IncomeByDoctorChart";
import { CategoryPieChart } from "./CategoryPieChart";
import { TransactionTimeline } from "./TransactionTimeline";
import { AddTransactionDialog, type TransactionFormData } from "./AddTransactionDialog";
import { AddRecurringDialog } from "./AddRecurringDialog";
import { formatCurrency } from "@/lib/date-utils";
import { RecurringExpensesSection } from "./RecurringExpenseRow";
import { MonthComparison } from "./MonthComparison";
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/ConfirmDialog";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  description: string | null;
  date: string;
  patientId: string | null;
  patient: { name: string } | null;
  appointment: {
    id: string;
    doctor: { id: string; name: string } | null;
  } | null;
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

type DoctorIncome = {
  doctorId: string;
  doctorName: string;
  totalIncome: number;
  appointmentCount: number;
};

type CategoryBreakdown = {
  category: string;
  income: number;
  expense: number;
};

type MonthlyTrend = {
  month: number;
  label: string;
  income: number;
  expense: number;
  net: number;
};

type InitialData = {
  summary: { totalIncome: number; totalExpense: number; net: number };
  incomeByDoctor: DoctorIncome[];
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrend: MonthlyTrend[];
  transactions: Transaction[];
  recurringExpenses: RecurringExpense[];
};

const monthNames = [
  "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

  const defaultTxForm: TransactionFormData = {
    type: "INCOME",
    category: "CONSULTATION",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  };

const defaultRecForm = {
  category: "CLINIC_RENT",
  amount: "",
  description: "",
  notes: "",
  dayOfMonth: "1",
};

function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 0, 23, 59, 59, 999),
  };
}

type FinancePageProps = {
  initialData: InitialData;
  currentMonth: number;
  currentYear: number;
};

export function FinancePage({
  initialData,
  currentMonth,
  currentYear,
}: FinancePageProps) {
  const [periodMode, setPeriodMode] = useState<PeriodMode>("month");
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    () => getWeekRange(new Date()).start
  );

  const currentWeekRange = React.useMemo(
    () => getWeekRange(weekStartDate),
    [weekStartDate]
  );

  const [summary, setSummary] = useState(initialData.summary);
  const [transactions, setTransactions] = useState<Transaction[]>(
    initialData.transactions
  );
  const [incomeByDoctor, setIncomeByDoctor] = useState<DoctorIncome[]>(
    initialData.incomeByDoctor
  );
  const [categoryBreakdown, setCategoryBreakdown] = useState<
    CategoryBreakdown[]
  >(initialData.categoryBreakdown);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>(
    initialData.monthlyTrend
  );
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(
    initialData.recurringExpenses
  );

  // Add transaction dialog
  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [txForm, setTxForm] = useState(defaultTxForm);
  const [editTxId, setEditTxId] = useState<string | null>(null);
  const [submittingTx, setSubmittingTx] = useState(false);

  // Recurring dialog
  const [recDialogOpen, setRecDialogOpen] = useState(false);
  const [recForm, setRecForm] = useState(defaultRecForm);
  const [editRecId, setEditRecId] = useState<string | null>(null);
  const [submittingRec, setSubmittingRec] = useState(false);

  // Confirm dialog
  const { confirmState, confirm, closeConfirm } = useConfirmDialog();

  const loadData = useCallback(
    async (startDate: string, endDate: string) => {
      setLoading(true);
      const params = new URLSearchParams({ startDate, endDate, year: String(year) });
      const res = await fetch(`/api/transactions/summary?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setTransactions(data.transactions);
        setIncomeByDoctor(data.incomeByDoctor);
        setCategoryBreakdown(data.categoryBreakdown);
        setMonthlyTrend(data.monthlyTrend);
        setRecurringExpenses(data.recurringExpenses);
      }
      setLoading(false);
    },
    [year]
  );

  const fetchRecurring = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/transactions/recurring");
    if (res.ok) {
      setRecurringExpenses(await res.json());
    }
    setLoading(false);
  }, []);

  const computePeriodRange = useCallback(
    (mode: PeriodMode, m: number, y: number): { startDate: string; endDate: string } => {
      if (mode === "month") {
        const range = getMonthRange(y, m);
        return { startDate: range.start.toISOString(), endDate: range.end.toISOString() };
      }
      return { startDate: customStart, endDate: customEnd };
    },
    [customStart, customEnd]
  );

  const refetchCurrentPeriod = useCallback(() => {
    let startDate: string;
    let endDate: string;

    if (periodMode === "week") {
      const range = getWeekRange(weekStartDate);
      startDate = range.start.toISOString();
      endDate = range.end.toISOString();
    } else {
      const range = computePeriodRange(periodMode, month, year);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    loadData(startDate, endDate);
  }, [loadData, computePeriodRange, periodMode, month, year, weekStartDate]);

  const handleMonthChange = (delta: number) => {
    if (periodMode === "month") {
      let m = month + delta;
      let y = year;
      if (m < 1) { m = 12; y--; }
      if (m > 12) { m = 1; y++; }
      setMonth(m);
      setYear(y);
      const { startDate, endDate } = computePeriodRange("month", m, y);
      loadData(startDate, endDate);
    } else if (periodMode === "week") {
      const newStart = new Date(weekStartDate);
      newStart.setDate(newStart.getDate() + delta * 7);
      const range = getWeekRange(newStart);
      setWeekStartDate(range.start);
      setMonth(range.start.getMonth() + 1);
      setYear(range.start.getFullYear());
      loadData(range.start.toISOString(), range.end.toISOString());
    }
  };

  const handleModeChange = (newMode: PeriodMode) => {
    setPeriodMode(newMode);
    if (newMode === "week") {
      const range = getWeekRange(new Date());
      setWeekStartDate(range.start);
      setMonth(range.start.getMonth() + 1);
      setYear(range.start.getFullYear());
      loadData(range.start.toISOString(), range.end.toISOString());
    } else if (newMode === "month") {
      const { startDate, endDate } = computePeriodRange("month", month, year);
      loadData(startDate, endDate);
    }
  };

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      loadData(customStart, customEnd);
    }
  };

  const monthLabel = monthNames[month - 1];

  // ─── Transaction CRUD ───
  const handleTxSubmit = async () => {
    setSubmittingTx(true);
    const url = editTxId
      ? `/api/transactions/${editTxId}`
      : "/api/transactions";
    const method = editTxId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: txForm.type,
        category: txForm.category,
        amount: parseFloat(txForm.amount),
        description: txForm.description || undefined,
        date: txForm.date,
      }),
    });

    setSubmittingTx(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "فشل في الحفظ");
      return;
    }
    toast.success(editTxId ? "تم التحديث بنجاح" : "تم الحفظ بنجاح");
    setTxDialogOpen(false);
    setEditTxId(null);
    setTxForm(defaultTxForm);
    refetchCurrentPeriod();
  };

  const handleEditTx = (tx: Transaction) => {
    setTxForm({
      type: tx.type,
      category: tx.category,
      amount: String(tx.amount),
      description: tx.description || "",
      date: new Date(tx.date).toISOString().split("T")[0],
    });
    setEditTxId(tx.id);
    setTxDialogOpen(true);
  };

  const handleDeleteTx = (id: string) => {
    confirm({
      title: "حذف المعاملة",
      message: "هل أنت متأكد من حذف هذه المعاملة؟ لا يمكن التراجع عن هذا الإجراء.",
      onConfirm: async () => {
        closeConfirm();
        const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
        if (!res.ok) {
          toast.error("فشل في الحذف");
          return;
        }
        toast.success("تم الحذف بنجاح");
        refetchCurrentPeriod();
      },
    });
  };

  // ─── Recurring CRUD ───
  const handleRecSubmit = async () => {
    setSubmittingRec(true);
    const url = editRecId
      ? `/api/transactions/recurring/${editRecId}`
      : "/api/transactions/recurring";
    const method = editRecId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: recForm.category,
        amount: parseFloat(recForm.amount),
        description: recForm.description,
        notes: recForm.notes || undefined,
        dayOfMonth: parseInt(recForm.dayOfMonth),
      }),
    });

    setSubmittingRec(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || "فشل في الحفظ");
      return;
    }
    toast.success(editRecId ? "تم التحديث بنجاح" : "تم الحفظ بنجاح");
    setRecDialogOpen(false);
    setEditRecId(null);
    setRecForm(defaultRecForm);
    fetchRecurring();
    refetchCurrentPeriod();
  };

  const handleEditRec = (ex: RecurringExpense) => {
    setRecForm({
      category: ex.category,
      amount: String(ex.amount),
      description: ex.description || "",
      notes: ex.notes || "",
      dayOfMonth: String(ex.dayOfMonth),
    });
    setEditRecId(ex.id);
    setRecDialogOpen(true);
  };

  const handleDeleteRec = (id: string) => {
    confirm({
      title: "حذف المصروف الثابت",
      message: "هل أنت متأكد من حذف هذا المصروف الثابت؟ لا يمكن التراجع عن هذا الإجراء.",
      onConfirm: async () => {
        closeConfirm();
        const res = await fetch(`/api/transactions/recurring/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          toast.error("فشل في الحذف");
          return;
        }
        toast.success("تم الحذف بنجاح");
        fetchRecurring();
      },
    });
  };

  // ─── Daily aggregation for area chart ───
  const dailyData = React.useMemo(() => {
    if (periodMode === "week") {
      const range = getWeekRange(weekStartDate);
      const days: Array<{ label: string; income: number; expense: number }> = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(range.start);
        d.setDate(d.getDate() + i);
        const label = d.toLocaleDateString("ar-SA", { weekday: "short", day: "numeric" });
        days.push({ label, income: 0, expense: 0 });
      }

      for (const t of transactions) {
        const tDate = new Date(t.date);
        if (tDate >= range.start && tDate <= range.end) {
          const dayIndex = tDate.getDay();
          const idx = dayIndex === 0 ? 6 : dayIndex - 1;
          if (t.type === "INCOME") days[idx].income += t.amount;
          else days[idx].expense += t.amount;
        }
      }

      return days;
    }

    if (periodMode === "custom") {
      const map = new Map<string, { income: number; expense: number }>();
      for (const t of transactions) {
        const key = new Date(t.date).toLocaleDateString("ar-SA", {
          day: "numeric",
          month: "short",
        });
        const entry = map.get(key) || { income: 0, expense: 0 };
        if (t.type === "INCOME") entry.income += t.amount;
        else entry.expense += t.amount;
        map.set(key, entry);
      }
      return Array.from(map.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([label, val]) => ({ label, ...val }));
    }
    return monthlyTrend.map((m) => ({
      label: m.label,
      income: m.income,
      expense: m.expense,
    }));
  }, [periodMode, transactions, monthlyTrend, weekStartDate]);

  // ─── CSV Export ───
  const exportCSV = () => {
    const categoryLabels: Record<string, string> = {
      CONSULTATION: "الكشفية",
      MEDICATIONS: "الأدوية",
      SERVICES: "الخدمات",
      CLINIC_RENT: "إيجار العيادة",
      INTERNET: "الإنترنت",
      SALARIES: "الرواتب",
      UTILITIES: "الفواتير",
      SUPPLIES: "المستلزمات",
      MARKETING: "التسويق",
      INSURANCE: "التأمين",
      TAXES: "الضرائب",
      MAINTENANCE: "الصيانة",
      OTHER: "أخرى",
    };

    const headers = ["التاريخ", "النوع", "التصنيف", "الوصف", "المبلغ"];
    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleDateString("ar-SA"),
      t.type === "INCOME" ? "دخل" : "مصروف",
      categoryLabels[t.category] || t.category,
      t.description || "",
      String(t.amount),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `المعاملات-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير الملف");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PeriodSelector
          mode={periodMode}
          onModeChange={handleModeChange}
          currentMonth={month}
          currentYear={year}
          onMonthChange={handleMonthChange}
          monthLabel={monthLabel}
          weekStart={currentWeekRange.start.toISOString()}
          weekEnd={currentWeekRange.end.toISOString()}
          customStart={customStart}
          customEnd={customEnd}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
          onApplyCustom={handleApplyCustom}
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="gap-1.5"
          >
            <Download className="size-3.5" />
            تصدير CSV
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setTxForm(defaultTxForm);
              setEditTxId(null);
              setTxDialogOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="size-3.5" />
            معاملة جديدة
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} size="sm">
              <CardHeader className="border-b pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="size-9 rounded-lg" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <SummaryCards
          totalIncome={summary.totalIncome}
          totalExpense={summary.totalExpense}
          net={summary.net}
        />
      )}

      {/* Charts Row */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncomeExpenseChart data={dailyData} />
          <IncomeByDoctorChart data={incomeByDoctor} />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Skeleton className="size-64 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryPieChart data={categoryBreakdown} type="income" />
          <CategoryPieChart data={categoryBreakdown} type="expense" />
        </div>
      )}

      {/* Transactions + Recurring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <Card>
              <CardHeader className="border-b pb-3">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-32" />
                    <div className="flex-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <TransactionTimeline
              transactions={transactions}
              onEdit={handleEditTx}
              onDelete={handleDeleteTx}
            />
          )}
        </div>
        <div>
          {loading ? (
            <Card>
              <CardHeader className="border-b pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-7 w-16 rounded-lg" />
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <Skeleton className="size-9 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <RecurringExpensesSection
              expenses={recurringExpenses}
              onAdd={() => {
                setRecForm(defaultRecForm);
                setEditRecId(null);
                setRecDialogOpen(true);
              }}
              onEdit={handleEditRec}
              onDelete={handleDeleteRec}
            />
          )}
        </div>
      </div>

      {/* Month Comparison */}
      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-7 w-36" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <MonthComparison
          monthlyData={monthlyTrend}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        open={txDialogOpen}
        onOpenChange={(open) => {
          setTxDialogOpen(open);
          if (!open) {
            setTxForm(defaultTxForm);
            setEditTxId(null);
          }
        }}
        form={txForm}
        onFormChange={setTxForm}
        onSubmit={handleTxSubmit}
        submitting={submittingTx}
        editMode={!!editTxId}
        recurringExpenses={recurringExpenses}
      />

      {/* Add Recurring Dialog */}
      <AddRecurringDialog
        open={recDialogOpen}
        onOpenChange={(open) => {
          setRecDialogOpen(open);
          if (!open) {
            setRecForm(defaultRecForm);
            setEditRecId(null);
          }
        }}
        form={recForm}
        onFormChange={setRecForm}
        onSubmit={handleRecSubmit}
        submitting={submittingRec}
        editMode={!!editRecId}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={() => confirmState.onConfirm?.()}
        onCancel={closeConfirm}
        type="danger"
        confirmLabel="حذف"
        cancelLabel="إلغاء"
      />
    </div>
  );
}
