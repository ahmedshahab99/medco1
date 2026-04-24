// app/digital-clinic-finance/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";

// ---------- Type Definitions ----------
type Lang = "ar" | "en";
type PageId =
  | "dashboard"
  | "revenue"
  | "expenses"
  | "invoices"
  | "insurance"
  | "budget"
  | "reports"
  | "vendors";

interface Transaction {
  icon: string;
  color: string;
  nameAr: string;
  nameEn: string;
  catAr: string;
  catEn: string;
  amt: string;
  type: "income" | "expense";
  time: string;
}

interface ExpCategory {
  nameAr: string;
  nameEn: string;
  pct: number;
  val: string;
  color: string;
}

interface RevDept {
  nameAr: string;
  nameEn: string;
  val: string;
  pct: number;
  color: string;
}

interface ExpenseTableRow {
  dateAr: string;
  dateEn: string;
  descAr: string;
  descEn: string;
  vendorAr: string;
  vendorEn: string;
  cat: string;
  catAr: string;
  catEn: string;
  amt: string;
  status: string;
  stAr: string;
  stEn: string;
}

interface Invoice {
  num: string;
  clientAr: string;
  clientEn: string;
  serviceAr: string;
  serviceEn: string;
  amt: string;
  status: string;
  stAr: string;
  stEn: string;
  dateAr: string;
  dateEn: string;
}

interface InsProvider {
  emoji: string;
  color: string;
  nameAr: string;
  nameEn: string;
  claims: number;
  totalAr: string;
  totalEn: string;
  rateAr: string;
  rateEn: string;
  status: string;
  stAr: string;
  stEn: string;
}

interface BudgetItem {
  nameAr: string;
  nameEn: string;
  budget: number;
  spent: number;
  color: string;
}

interface Vendor {
  emoji: string;
  color: string;
  nameAr: string;
  nameEn: string;
  catAr: string;
  catEn: string;
  due: string;
  dueColor: string;
  terms: string;
  status: string;
  stAr: string;
  stEn: string;
}

interface PaymentSchedule {
  dateAr: string;
  dateEn: string;
  vendorAr: string;
  vendorEn: string;
  amt: string;
  urgency: string;
  urgAr: string;
  urgEn: string;
}

// ---------- Constants ----------
const MONTHS = {
  ar: ["سبت", "أكت", "نوف", "ديس", "يناير", "فبر", "مارس", "أبريل"],
  en: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
};
const REV_DATA = [98, 104, 112, 108, 119, 127, 136, 142.8];
const DAILY_REV = [4.1, 3.8, 5.2, 4.7, 5.8, 6.1, 4.4, 5.3, 4.9, 5.7, 6.3, 5.1, 4.8, 4.6];

const TRANSACTIONS: Transaction[] = [
  {
    icon: "🏥",
    color: "rgba(46,204,113,0.15)",
    nameAr: "إيراد عيادة الباطنة",
    nameEn: "Internal Medicine Revenue",
    catAr: "إيراد",
    catEn: "Revenue",
    amt: "+3,450,000",
    type: "income",
    time: "09:14",
  },
  {
    icon: "💊",
    color: "rgba(231,76,60,0.15)",
    nameAr: "مستلزمات طبية - شركة الرازي",
    nameEn: "Medical Supplies - Al-Razi Co.",
    catAr: "مصروف",
    catEn: "Expense",
    amt: "-1,200,000",
    type: "expense",
    time: "08:52",
  },
  {
    icon: "🔬",
    color: "rgba(26,111,186,0.15)",
    nameAr: "إيراد المختبر",
    nameEn: "Laboratory Revenue",
    catAr: "إيراد",
    catEn: "Revenue",
    amt: "+890,000",
    type: "income",
    time: "08:30",
  },
  {
    icon: "🔧",
    color: "rgba(246,173,85,0.15)",
    nameAr: "صيانة معدات الأشعة",
    nameEn: "Radiology Equipment Maintenance",
    catAr: "مصروف",
    catEn: "Expense",
    amt: "-450,000",
    type: "expense",
    time: "07:45",
  },
  {
    icon: "💊",
    color: "rgba(10,191,188,0.15)",
    nameAr: "إيراد الصيدلية",
    nameEn: "Pharmacy Revenue",
    catAr: "إيراد",
    catEn: "Revenue",
    amt: "+620,000",
    type: "income",
    time: "07:20",
  },
];

const EXP_CATS: ExpCategory[] = [
  { nameAr: "الرواتب والأجور", nameEn: "Salaries & Wages", pct: 47, val: "42.1M", color: "#e74c3c" },
  { nameAr: "مستلزمات طبية", nameEn: "Medical Supplies", pct: 21, val: "18.7M", color: "#f6ad55" },
  { nameAr: "مرافق وكهرباء", nameEn: "Utilities & Electric", pct: 8, val: "7.1M", color: "#1a6fba" },
  { nameAr: "صيانة المعدات", nameEn: "Equipment Maintenance", pct: 6, val: "5.4M", color: "#7c3aed" },
  { nameAr: "تسويق وإعلان", nameEn: "Marketing & Ads", pct: 5, val: "4.5M", color: "#ec4899" },
  { nameAr: "مصروفات أخرى", nameEn: "Other Expenses", pct: 13, val: "11.5M", color: "#64748b" },
];

const REV_DEPTS: RevDept[] = [
  { nameAr: "العيادة العامة", nameEn: "General Clinic", val: "28.4M", pct: 20, color: "#2ecc71" },
  { nameAr: "الباطنة والقلبية", nameEn: "Internal & Cardiology", val: "34.4M", pct: 24, color: "#0abfbc" },
  { nameAr: "الجراحة", nameEn: "Surgery", val: "18.6M", pct: 13, color: "#1a6fba" },
  { nameAr: "المختبر", nameEn: "Laboratory", val: "24.8M", pct: 17, color: "#7c3aed" },
  { nameAr: "الأشعة", nameEn: "Radiology", val: "12.3M", pct: 9, color: "#f6ad55" },
  { nameAr: "الصيدلية", nameEn: "Pharmacy", val: "24.3M", pct: 17, color: "#ec4899" },
];

const EXPENSE_TABLE_DATA: ExpenseTableRow[] = [
  {
    dateAr: "14 أبريل",
    dateEn: "Apr 14",
    descAr: "مستلزمات مختبر",
    descEn: "Lab Supplies",
    vendorAr: "شركة الرازي",
    vendorEn: "Al-Razi Co.",
    cat: "b-amber",
    catAr: "مستلزمات",
    catEn: "Supplies",
    amt: "2,400,000",
    status: "b-green",
    stAr: "مدفوع",
    stEn: "Paid",
  },
  {
    dateAr: "13 أبريل",
    dateEn: "Apr 13",
    descAr: "فاتورة الكهرباء",
    descEn: "Electricity Bill",
    vendorAr: "كهرباء بغداد",
    vendorEn: "Baghdad Electric",
    cat: "b-blue",
    catAr: "مرافق",
    catEn: "Utilities",
    amt: "850,000",
    status: "b-green",
    stAr: "مدفوع",
    stEn: "Paid",
  },
  {
    dateAr: "12 أبريل",
    dateEn: "Apr 12",
    descAr: "صيانة جهاز MRI",
    descEn: "MRI Machine Maintenance",
    vendorAr: "الشركة التقنية",
    vendorEn: "Tech Company",
    cat: "b-purple",
    catAr: "صيانة",
    catEn: "Maintenance",
    amt: "1,750,000",
    status: "b-amber",
    stAr: "معلق",
    stEn: "Pending",
  },
  {
    dateAr: "11 أبريل",
    dateEn: "Apr 11",
    descAr: "تجديد اشتراك البرنامج",
    descEn: "Software Subscription Renewal",
    vendorAr: "ميدتك",
    vendorEn: "MedTech",
    cat: "b-teal",
    catAr: "تقنية",
    catEn: "Technology",
    amt: "600,000",
    status: "b-green",
    stAr: "مدفوع",
    stEn: "Paid",
  },
  {
    dateAr: "10 أبريل",
    dateEn: "Apr 10",
    descAr: "مواد التعقيم",
    descEn: "Sterilization Materials",
    vendorAr: "المستلزمات الطبية",
    vendorEn: "Medical Supplies Ltd",
    cat: "b-amber",
    catAr: "مستلزمات",
    catEn: "Supplies",
    amt: "920,000",
    status: "b-red",
    stAr: "متأخر",
    stEn: "Overdue",
  },
];

const INVOICES: Invoice[] = [
  {
    num: "INV-2026-0148",
    clientAr: "أ.د. محمد السعيد",
    clientEn: "Dr. Mohammed Al-Saeed",
    serviceAr: "كشف طبي",
    serviceEn: "Consultation",
    amt: "350,000",
    status: "b-green",
    stAr: "مدفوع",
    stEn: "Paid",
    dateAr: "14 أبريل",
    dateEn: "Apr 14",
  },
  {
    num: "INV-2026-0147",
    clientAr: "مريم حسن",
    clientEn: "Maryam Hassan",
    serviceAr: "تحاليل مختبرية",
    serviceEn: "Lab Tests",
    amt: "890,000",
    status: "b-amber",
    stAr: "معلق",
    stEn: "Pending",
    dateAr: "13 أبريل",
    dateEn: "Apr 13",
  },
  {
    num: "INV-2026-0146",
    clientAr: "التأمين الوطني",
    clientEn: "National Insurance",
    serviceAr: "مطالبة دورية",
    serviceEn: "Monthly Claim",
    amt: "4,200,000",
    status: "b-red",
    stAr: "متأخر",
    stEn: "Overdue",
    dateAr: "1 أبريل",
    dateEn: "Apr 1",
  },
  {
    num: "INV-2026-0145",
    clientAr: "علي كريم",
    clientEn: "Ali Kareem",
    serviceAr: "أشعة مقطعية",
    serviceEn: "CT Scan",
    amt: "1,200,000",
    status: "b-green",
    stAr: "مدفوع",
    stEn: "Paid",
    dateAr: "12 أبريل",
    dateEn: "Apr 12",
  },
  {
    num: "INV-2026-0144",
    clientAr: "سارة أحمد",
    clientEn: "Sara Ahmed",
    serviceAr: "جراحة عيون",
    serviceEn: "Eye Surgery",
    amt: "3,800,000",
    status: "b-amber",
    stAr: "معلق",
    stEn: "Pending",
    dateAr: "10 أبريل",
    dateEn: "Apr 10",
  },
];

const INS_PROVIDERS: InsProvider[] = [
  {
    emoji: "🏛️",
    color: "rgba(26,111,186,0.15)",
    nameAr: "التأمين الوطني",
    nameEn: "National Insurance",
    claims: 48,
    totalAr: "8.4M د.ع",
    totalEn: "8.4M IQD",
    rateAr: "82%",
    rateEn: "82%",
    status: "b-green",
    stAr: "نشط",
    stEn: "Active",
  },
  {
    emoji: "🏦",
    color: "rgba(10,191,188,0.15)",
    nameAr: "الرافدين للتأمين",
    nameEn: "Al-Rafidain Insurance",
    claims: 31,
    totalAr: "5.7M د.ع",
    totalEn: "5.7M IQD",
    rateAr: "78%",
    rateEn: "78%",
    status: "b-green",
    stAr: "نشط",
    stEn: "Active",
  },
  {
    emoji: "🏢",
    color: "rgba(246,173,85,0.15)",
    nameAr: "العراق للتأمين",
    nameEn: "Iraq Insurance Co.",
    claims: 22,
    totalAr: "3.2M د.ع",
    totalEn: "3.2M IQD",
    rateAr: "65%",
    rateEn: "65%",
    status: "b-amber",
    stAr: "مراجعة",
    stEn: "Review",
  },
  {
    emoji: "🌐",
    color: "rgba(124,58,237,0.15)",
    nameAr: "تأمين الخليج",
    nameEn: "Gulf Insurance",
    claims: 18,
    totalAr: "1.3M د.ع",
    totalEn: "1.3M IQD",
    rateAr: "91%",
    rateEn: "91%",
    status: "b-green",
    stAr: "نشط",
    stEn: "Active",
  },
];

const BUDGET_ITEMS: BudgetItem[] = [
  { nameAr: "الرواتب والأجور", nameEn: "Salaries & Wages", budget: 80, spent: 42.1, color: "#e74c3c" },
  { nameAr: "المستلزمات الطبية", nameEn: "Medical Supplies", budget: 20.5, spent: 18.7, color: "#f6ad55" },
  { nameAr: "المرافق", nameEn: "Utilities", budget: 10, spent: 7.1, color: "#1a6fba" },
  { nameAr: "الصيانة", nameEn: "Maintenance", budget: 12, spent: 9.4, color: "#7c3aed" },
  { nameAr: "التسويق", nameEn: "Marketing", budget: 8, spent: 4.5, color: "#ec4899" },
  { nameAr: "الاحتياطي", nameEn: "Reserve", budget: 15, spent: 2.1, color: "#0abfbc" },
];

const VENDORS: Vendor[] = [
  {
    emoji: "💊",
    color: "rgba(46,204,113,0.15)",
    nameAr: "شركة الرازي للأدوية",
    nameEn: "Al-Razi Pharmaceuticals",
    catAr: "أدوية",
    catEn: "Pharma",
    due: "8.4M",
    dueColor: "#f87171",
    terms: "Net 30",
    status: "b-green",
    stAr: "نشط",
    stEn: "Active",
  },
  {
    emoji: "🔬",
    color: "rgba(26,111,186,0.15)",
    nameAr: "تجهيزات المختبر العراقي",
    nameEn: "Iraqi Lab Equipment",
    catAr: "تجهيزات",
    catEn: "Equipment",
    due: "3.7M",
    dueColor: "#f6ad55",
    terms: "Net 60",
    status: "b-amber",
    stAr: "تأخير",
    stEn: "Delayed",
  },
  {
    emoji: "⚡",
    color: "rgba(246,173,85,0.15)",
    nameAr: "كهرباء بغداد",
    nameEn: "Baghdad Electricity",
    catAr: "مرافق",
    catEn: "Utilities",
    due: "850K",
    dueColor: "#4ade80",
    terms: "فوري",
    status: "b-green",
    stAr: "نشط",
    stEn: "Active",
  },
  {
    emoji: "🖥️",
    color: "rgba(124,58,237,0.15)",
    nameAr: "ميدتك للتقنية",
    nameEn: "MedTech Systems",
    catAr: "تقنية",
    catEn: "Technology",
    due: "1.2M",
    dueColor: "#4ade80",
    terms: "Net 30",
    status: "b-green",
    stAr: "نشط",
    stEn: "Active",
  },
  {
    emoji: "🧴",
    color: "rgba(10,191,188,0.15)",
    nameAr: "المستلزمات الطبية العامة",
    nameEn: "General Medical Supplies",
    catAr: "مستلزمات",
    catEn: "Supplies",
    due: "5.1M",
    dueColor: "#f87171",
    terms: "Net 45",
    status: "b-red",
    stAr: "معلق",
    stEn: "Pending",
  },
];

const PAYMENT_SCHED: PaymentSchedule[] = [
  {
    dateAr: "15 أبريل",
    dateEn: "Apr 15",
    vendorAr: "شركة الرازي",
    vendorEn: "Al-Razi Co.",
    amt: "8,400,000",
    urgency: "b-red",
    urgAr: "اليوم",
    urgEn: "Today",
  },
  {
    dateAr: "18 أبريل",
    dateEn: "Apr 18",
    vendorAr: "تجهيزات المختبر",
    vendorEn: "Iraqi Lab Equipment",
    amt: "3,700,000",
    urgency: "b-amber",
    urgAr: "3 أيام",
    urgEn: "3 days",
  },
  {
    dateAr: "20 أبريل",
    dateEn: "Apr 20",
    vendorAr: "ميدتك",
    vendorEn: "MedTech",
    amt: "1,200,000",
    urgency: "b-blue",
    urgAr: "6 أيام",
    urgEn: "6 days",
  },
  {
    dateAr: "25 أبريل",
    dateEn: "Apr 25",
    vendorAr: "المستلزمات العامة",
    vendorEn: "General Supplies",
    amt: "5,100,000",
    urgency: "b-gray",
    urgAr: "11 يوم",
    urgEn: "11 days",
  },
];

const PAGE_TITLES: Record<Lang, Record<PageId, string>> = {
  ar: {
    dashboard: "لوحة التحكم المالي",
    revenue: "إدارة الإيرادات",
    expenses: "إدارة المصروفات",
    invoices: "الفواتير والمستحقات",
    insurance: "مطالبات التأمين",
    budget: "الميزانية والتخطيط",
    reports: "التقارير المالية",
    vendors: "إدارة الموردين",
  },
  en: {
    dashboard: "Financial Dashboard",
    revenue: "Revenue Management",
    expenses: "Expense Management",
    invoices: "Invoices & Receivables",
    insurance: "Insurance Claims",
    budget: "Budget & Planning",
    reports: "Financial Reports",
    vendors: "Vendor Management",
  },
};

// ---------- Component ----------
export default function DigitalClinicFinance() {
  const [lang, setLang] = useState<Lang>("ar");
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: string }>({
    show: false,
    message: "",
    type: "success",
  });

  // Tabs state
  const [invTab, setInvTab] = useState("all");
  const [reportTab, setReportTab] = useState("pl");

  const dir = lang === "ar" ? "rtl" : "ltr";

  const openModal = (id: string) => setModalOpen(id);
  const closeModal = () => setModalOpen(null);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const showToast = (msg: string, type: string = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  const gotoPage = (page: PageId) => {
    setActivePage(page);
    closeSidebar();
  };

  const handleLangSwitch = (newLang: Lang) => {
    setLang(newLang);
  };

  // Modal save handlers (simulate actions)
  const saveTransaction = () => {
    closeModal();
    showToast(lang === "ar" ? "✅ تم الحفظ بنجاح" : "✅ Saved successfully");
  };
  const saveExpense = () => {
    closeModal();
    showToast(lang === "ar" ? "✅ تم تسجيل المصروف" : "✅ Expense recorded");
  };
  const saveInvoice = () => {
    closeModal();
    showToast(lang === "ar" ? "✅ تم إصدار الفاتورة" : "✅ Invoice issued");
  };
  const saveClaim = () => {
    closeModal();
    showToast(lang === "ar" ? "✅ تم تقديم المطالبة" : "✅ Claim submitted");
  };
  const saveVendor = () => {
    closeModal();
    showToast(lang === "ar" ? "✅ تم إضافة المورد" : "✅ Vendor added");
  };
  const exportReport = () => {
    closeModal();
    showToast(lang === "ar" ? "✅ جاري تصدير التقرير" : "✅ Exporting report");
  };
  const saveBudgetAdjustment = () => {
    showToast(lang === "ar" ? "✅ تم حفظ التعديل" : "✅ Adjustment saved");
  };

  // Helper to format numbers
  const fmt = (n: number) => n.toLocaleString();

  // Render functions for dynamic sections
  const renderRevChart = () => {
    const max = Math.max(...REV_DATA);
    return REV_DATA.map((v, i) => (
      <div className="bar-wrap" key={i}>
        <div className="bar-val">{v}M</div>
        <div
          className="bar"
          style={{
            height: `${(v / max) * 100}%`,
            background:
              i === REV_DATA.length - 1
                ? "linear-gradient(180deg, var(--green), var(--teal))"
                : "var(--s3)",
          }}
        />
        <div className="bar-lbl">{MONTHS[lang][i]}</div>
      </div>
    ));
  };

  const renderDailyRevChart = () => {
    const max = Math.max(...DAILY_REV);
    return DAILY_REV.map((v, i) => (
      <div className="bar-wrap" key={i}>
        <div className="bar-val" style={{ fontSize: "8.5px" }}>
          {v}M
        </div>
        <div
          className="bar"
          style={{
            height: `${(v / max) * 100}%`,
            background:
              v === max ? "linear-gradient(180deg, var(--teal), var(--blue))" : "var(--s3)",
          }}
        />
        <div className="bar-lbl">{i + 1}</div>
      </div>
    ));
  };

  const renderRecentTx = () => (
    <>
      {TRANSACTIONS.map((t, idx) => (
        <div className="tx-item" key={idx}>
          <div className="tx-icon" style={{ background: t.color }}>
            {t.icon}
          </div>
          <div className="tx-info">
            <div className="tx-name">{lang === "ar" ? t.nameAr : t.nameEn}</div>
            <div className="tx-meta">
              <span className={`badge ${t.type === "income" ? "b-green" : "b-red"}`}>
                {lang === "ar" ? t.catAr : t.catEn}
              </span>{" "}
              · {t.time}
            </div>
          </div>
          <div className={`tx-amt ${t.type}`}>{t.amt}</div>
        </div>
      ))}
    </>
  );

  const renderExpBreakdown = () => (
    <>
      {EXP_CATS.map((e, idx) => (
        <div style={{ marginBottom: "12px" }} key={idx}>
          <div className="fbetween" style={{ marginBottom: "6px" }}>
            <span className="fs12 fw8">{lang === "ar" ? e.nameAr : e.nameEn}</span>
            <div className="frow gap2">
              <span className="fs12 fw8">{e.val}</span>
              <span className="fs11 c-muted">({e.pct}%)</span>
            </div>
          </div>
          <div className="prog">
            <div className="prog-fill" style={{ width: `${e.pct}%`, background: e.color }} />
          </div>
        </div>
      ))}
    </>
  );

  const renderRevDepts = () => (
    <>
      {REV_DEPTS.map((d, idx) => (
        <div style={{ marginBottom: "12px" }} key={idx}>
          <div className="fbetween" style={{ marginBottom: "6px" }}>
            <span className="fs12 fw8">{lang === "ar" ? d.nameAr : d.nameEn}</span>
            <div className="frow gap2">
              <span className="fs12 fw8" style={{ color: d.color }}>
                {d.val}
              </span>
              <span className="fs11 c-muted">{d.pct}%</span>
            </div>
          </div>
          <div className="prog">
            <div className="prog-fill" style={{ width: `${d.pct * 4}%`, background: d.color }} />
          </div>
        </div>
      ))}
    </>
  );

  const renderExpTable = () => {
    const isAr = lang === "ar";
    return (
      <table className="dtable">
        <thead>
          <tr>
            <th>{isAr ? "التاريخ" : "Date"}</th>
            <th>{isAr ? "الوصف" : "Description"}</th>
            <th>{isAr ? "المورد" : "Vendor"}</th>
            <th>{isAr ? "الفئة" : "Category"}</th>
            <th>{isAr ? "المبلغ (د.ع)" : "Amount (IQD)"}</th>
            <th>{isAr ? "الحالة" : "Status"}</th>
            <th>{isAr ? "إجراء" : "Action"}</th>
          </tr>
        </thead>
        <tbody>
          {EXPENSE_TABLE_DATA.map((e, idx) => (
            <tr key={idx}>
              <td className="c-muted">{isAr ? e.dateAr : e.dateEn}</td>
              <td className="fw8">{isAr ? e.descAr : e.descEn}</td>
              <td className="c-muted">{isAr ? e.vendorAr : e.vendorEn}</td>
              <td>
                <span className={`badge ${e.cat}`}>{isAr ? e.catAr : e.catEn}</span>
              </td>
              <td className="fw8 c-red">-{e.amt}</td>
              <td>
                <span className={`badge ${e.status}`}>{isAr ? e.stAr : e.stEn}</span>
              </td>
              <td>
                <button className="btn btn-ghost btn-xs">{isAr ? "عرض" : "View"}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderExpCats = () => (
    <>
      {EXP_CATS.map((e, idx) => (
        <div className="budget-row" key={idx}>
          <div className="budget-top">
            <span className="budget-name">{lang === "ar" ? e.nameAr : e.nameEn}</span>
            <div className="frow gap2">
              <span className="budget-used">{e.val}</span>
              <span className="fs11 c-muted">{e.pct}%</span>
            </div>
          </div>
          <div className="prog">
            <div className="prog-fill" style={{ width: `${e.pct}%`, background: e.color }} />
          </div>
        </div>
      ))}
    </>
  );

  const renderInvTable = () => {
    const isAr = lang === "ar";
    return (
      <table className="dtable">
        <thead>
          <tr>
            <th>{isAr ? "رقم الفاتورة" : "Invoice #"}</th>
            <th>{isAr ? "العميل" : "Client"}</th>
            <th>{isAr ? "الخدمة" : "Service"}</th>
            <th>{isAr ? "المبلغ" : "Amount"}</th>
            <th>{isAr ? "التاريخ" : "Date"}</th>
            <th>{isAr ? "الحالة" : "Status"}</th>
            <th>{isAr ? "إجراء" : "Action"}</th>
          </tr>
        </thead>
        <tbody>
          {INVOICES.map((iv, idx) => (
            <tr key={idx}>
              <td>
                <span className="fw8 c-blue">{iv.num}</span>
              </td>
              <td className="fw8">{isAr ? iv.clientAr : iv.clientEn}</td>
              <td className="c-muted">{isAr ? iv.serviceAr : iv.serviceEn}</td>
              <td className="fw8">{iv.amt}</td>
              <td className="c-muted">{isAr ? iv.dateAr : iv.dateEn}</td>
              <td>
                <span className={`badge ${iv.status}`}>{isAr ? iv.stAr : iv.stEn}</span>
              </td>
              <td>
                <button className="btn btn-ghost btn-xs">{isAr ? "معاينة" : "Preview"}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderInvPreview = () => {
    const isAr = lang === "ar";
    return (
      <div className="inv-paper" dir={dir}>
        <div className="inv-hd">
          <div>
            <div className="inv-logo">💰 {isAr ? "العيادة الرقمية" : "Digital Clinic"}</div>
            <div className="inv-sub">
              {isAr
                ? "نظام الإدارة المالية • بغداد، العراق"
                : "Finance Management System • Baghdad, Iraq"}
            </div>
          </div>
          <div style={{ textAlign: isAr ? "left" : "right" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#2ecc71", marginBottom: "5px" }}>
              INV-2026-0147
            </div>
            <div className="inv-stamp pend">{isAr ? "⏳ معلق" : "⏳ PENDING"}</div>
          </div>
        </div>
        <div className="inv-meta">
          <div>
            <div className="inv-bl">{isAr ? "من" : "FROM"}</div>
            <div className="inv-bv">{isAr ? "العيادة الرقمية" : "Digital Clinic"}</div>
            <div className="inv-bs">{isAr ? "بغداد، العراق" : "Baghdad, Iraq"}</div>
            <div className="inv-bs">finance@digital-clinic.io</div>
          </div>
          <div>
            <div className="inv-bl">{isAr ? "إلى" : "TO"}</div>
            <div className="inv-bv">{isAr ? "مريم حسن" : "Maryam Hassan"}</div>
            <div className="inv-bs">{isAr ? "مريضة" : "Patient"}</div>
            <div className="inv-bs">
              {isAr ? "تاريخ الاستحقاق: 20 أبريل 2026" : "Due: April 20, 2026"}
            </div>
          </div>
        </div>
        <table className="inv-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{isAr ? "الخدمة" : "Service"}</th>
              <th>{isAr ? "الكمية" : "Qty"}</th>
              <th>{isAr ? "السعر" : "Price"}</th>
              <th>{isAr ? "الإجمالي" : "Total"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>
                <strong>
                  {isAr ? "تحاليل مختبرية شاملة" : "Comprehensive Lab Tests"}
                </strong>
              </td>
              <td>1</td>
              <td>650,000</td>
              <td style={{ fontWeight: 800 }}>650,000</td>
            </tr>
            <tr>
              <td>2</td>
              <td>
                <strong>{isAr ? "رسوم الاستشارة" : "Consultation Fee"}</strong>
              </td>
              <td>1</td>
              <td>150,000</td>
              <td style={{ fontWeight: 800 }}>150,000</td>
            </tr>
            <tr>
              <td>3</td>
              <td>
                <strong>{isAr ? "مستلزمات طبية" : "Medical Supplies"}</strong>
              </td>
              <td>—</td>
              <td>—</td>
              <td style={{ fontWeight: 800, color: "#d97706" }}>+90,000</td>
            </tr>
          </tbody>
        </table>
        <div className="inv-totals">
          <div className="inv-tline">
            <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
            <span>800,000 {isAr ? "د.ع" : "IQD"}</span>
          </div>
          <div className="inv-tline">
            <span>{isAr ? "إضافات" : "Additions"}</span>
            <span style={{ color: "#d97706" }}>+90,000 {isAr ? "د.ع" : "IQD"}</span>
          </div>
          <div className="inv-tline grand">
            <span>{isAr ? "الإجمالي" : "Grand Total"}</span>
            <span>890,000 {isAr ? "د.ع" : "IQD"}</span>
          </div>
        </div>
        <div className="inv-footer">
          <span>{isAr ? "شكراً لثقتكم بالعيادة الرقمية" : "Thank you for trusting Digital Clinic"}</span>
          <span>
            {isAr ? "للاستفسار: +964 770 000 0000" : "Inquiries: +964 770 000 0000"}
          </span>
        </div>
      </div>
    );
  };

  const renderInsProviders = () => (
    <>
      {INS_PROVIDERS.map((p, idx) => (
        <div className="vendor-row" key={idx}>
          <div className="vendor-av" style={{ background: p.color }}>
            {p.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="vendor-name">{lang === "ar" ? p.nameAr : p.nameEn}</div>
            <div className="vendor-cat">
              {lang === "ar" ? `${p.claims} مطالبة` : `${p.claims} claims`} ·{" "}
              {lang === "ar" ? `تسوية: ${p.rateAr}` : `Settlement: ${p.rateEn}`}
            </div>
          </div>
          <div>
            <div className="vendor-due" style={{ color: "#60a5fa", textAlign: "center" }}>
              {lang === "ar" ? p.totalAr : p.totalEn}
            </div>
            <div style={{ textAlign: "center", marginTop: 4 }}>
              <span className={`badge ${p.status}`}>{lang === "ar" ? p.stAr : p.stEn}</span>
            </div>
          </div>
        </div>
      ))}
    </>
  );

  const renderClaimsTable = () => {
    const isAr = lang === "ar";
    return (
      <table className="dtable">
        <thead>
          <tr>
            <th>{isAr ? "رقم المطالبة" : "Claim #"}</th>
            <th>{isAr ? "شركة التأمين" : "Insurance Co."}</th>
            <th>{isAr ? "المريض" : "Patient"}</th>
            <th>{isAr ? "المبلغ (د.ع)" : "Amount (IQD)"}</th>
            <th>{isAr ? "التاريخ" : "Date"}</th>
            <th>{isAr ? "الحالة" : "Status"}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="fw8 c-blue">CLM-2026-048</td>
            <td>{isAr ? "التأمين الوطني" : "National Insurance"}</td>
            <td>{isAr ? "أحمد علي" : "Ahmed Ali"}</td>
            <td className="fw8">450,000</td>
            <td className="c-muted">{isAr ? "14 أبريل" : "Apr 14"}</td>
            <td>
              <span className="badge b-amber">{isAr ? "قيد المراجعة" : "Under Review"}</span>
            </td>
          </tr>
          <tr>
            <td className="fw8 c-blue">CLM-2026-047</td>
            <td>{isAr ? "الرافدين للتأمين" : "Al-Rafidain Insurance"}</td>
            <td>{isAr ? "سارة أحمد" : "Sara Ahmed"}</td>
            <td className="fw8">1,200,000</td>
            <td className="c-muted">{isAr ? "12 أبريل" : "Apr 12"}</td>
            <td>
              <span className="badge b-green">{isAr ? "مقبول" : "Accepted"}</span>
            </td>
          </tr>
          <tr>
            <td className="fw8 c-blue">CLM-2026-046</td>
            <td>{isAr ? "تأمين الخليج" : "Gulf Insurance"}</td>
            <td>{isAr ? "علي كريم" : "Ali Kareem"}</td>
            <td className="fw8">680,000</td>
            <td className="c-muted">{isAr ? "10 أبريل" : "Apr 10"}</td>
            <td>
              <span className="badge b-red">{isAr ? "مرفوض" : "Rejected"}</span>
            </td>
          </tr>
          <tr>
            <td className="fw8 c-blue">CLM-2026-045</td>
            <td>{isAr ? "العراق للتأمين" : "Iraq Insurance"}</td>
            <td>{isAr ? "مريم حسن" : "Maryam Hassan"}</td>
            <td className="fw8">890,000</td>
            <td className="c-muted">{isAr ? "8 أبريل" : "Apr 8"}</td>
            <td>
              <span className="badge b-green">{isAr ? "مقبول" : "Accepted"}</span>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  const renderBudgetItems = () => {
    const isAr = lang === "ar";
    return (
      <>
        {BUDGET_ITEMS.map((b, idx) => {
          const pct = Math.round((b.spent / b.budget) * 100);
          const warn = pct > 90;
          return (
            <div className="budget-row" key={idx}>
              <div className="budget-top">
                <span className="budget-name">{isAr ? b.nameAr : b.nameEn}</span>
                <div className="budget-nums">
                  <span
                    className="budget-used"
                    style={{ color: warn ? "#f87171" : "var(--text)" }}
                  >
                    {b.spent}M / {b.budget}M
                  </span>
                  <span className={`badge ${warn ? "b-red" : "b-gray"}`}>{pct}%</span>
                </div>
              </div>
              <div className="prog">
                <div
                  className="prog-fill"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: warn ? "var(--red)" : b.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </>
    );
  };

  const renderPL = () => {
    const isAr = lang === "ar";
    const row = (label: string, val: string, cls = "") => (
      <div className="fbetween" style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
        <span className="fs12">{label}</span>
        <span className={`fw8 ${cls}`}>{val}</span>
      </div>
    );
    const section = (t: string) => (
      <div
        style={{
          padding: "12px 0 5px",
          fontSize: "11px",
          fontWeight: 800,
          color: "var(--muted2)",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {t}
      </div>
    );
    return (
      <>
        {section(isAr ? "الإيرادات" : "Revenues")}
        {row(isAr ? "كشوف العيادة" : "Clinic Visits", "62,830,000", "c-green")}
        {row(isAr ? "مختبر وأشعة" : "Lab & Radiology", "37,100,000", "c-green")}
        {row(isAr ? "الصيدلية" : "Pharmacy", "24,270,000", "c-green")}
        {row(isAr ? "التأمين الصحي" : "Insurance", "18,600,000", "c-green")}
        <div
          className="fbetween"
          style={{
            padding: "12px",
            background: "rgba(46,204,113,0.05)",
            borderRadius: "var(--rsm)",
            marginTop: "6px",
          }}
        >
          <span className="fw8">{isAr ? "إجمالي الإيرادات" : "Total Revenue"}</span>
          <span className="fw8 c-green" style={{ fontSize: "15px" }}>
            142,800,000
          </span>
        </div>

        {section(isAr ? "المصروفات" : "Expenses")}
        {row(isAr ? "الرواتب والأجور" : "Salaries & Wages", "42,100,000", "c-red")}
        {row(isAr ? "المستلزمات الطبية" : "Medical Supplies", "18,700,000", "c-red")}
        {row(isAr ? "المرافق والكهرباء" : "Utilities & Electric", "7,100,000", "c-red")}
        {row(isAr ? "الصيانة" : "Maintenance", "5,400,000", "c-red")}
        {row(isAr ? "التسويق" : "Marketing", "4,500,000", "c-red")}
        {row(isAr ? "مصروفات أخرى" : "Other Expenses", "11,500,000", "c-red")}
        <div
          className="fbetween"
          style={{
            padding: "12px",
            background: "rgba(231,76,60,0.05)",
            borderRadius: "var(--rsm)",
            marginTop: "6px",
          }}
        >
          <span className="fw8">{isAr ? "إجمالي المصروفات" : "Total Expenses"}</span>
          <span className="fw8 c-red" style={{ fontSize: "15px" }}>
            89,300,000
          </span>
        </div>

        <div
          className="fbetween"
          style={{
            padding: "16px",
            background: "linear-gradient(135deg, rgba(46,204,113,0.12), rgba(10,191,188,0.06))",
            border: "1px solid rgba(46,204,113,0.2)",
            borderRadius: "var(--rsm)",
            marginTop: "14px",
          }}
        >
          <span style={{ fontSize: "15px", fontWeight: 900 }}>
            {isAr ? "✅ صافي الربح" : "✅ Net Profit"}
          </span>
          <span style={{ fontSize: "20px", fontWeight: 900, color: "#4ade80" }}>
            53,500,000 {isAr ? "د.ع" : "IQD"}
          </span>
        </div>
        <div className="frow gap2" style={{ marginTop: "10px", justifyContent: "flex-end" }}>
          <span className="badge b-green">
            ▲ +23.7% <span>{isAr ? "مقارنة بالشهر السابق" : "vs last month"}</span>
          </span>
          <span className="badge b-teal">{isAr ? "هامش الربح: 37.5%" : "Margin: 37.5%"}</span>
        </div>
      </>
    );
  };

  const renderBS = () => {
    const isAr = lang === "ar";
    const row = (l: string, v: string, cls = "") => (
      <div className="fbetween" style={{ padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
        <span className="fs12">{l}</span>
        <span className={`fw8 ${cls}`}>{v}</span>
      </div>
    );
    const sec = (t: string) => (
      <div
        style={{
          padding: "12px 0 5px",
          fontSize: "11px",
          fontWeight: 800,
          color: "var(--muted2)",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {t}
      </div>
    );
    return (
      <>
        {sec(isAr ? "الأصول" : "Assets")}
        {row(isAr ? "نقد وما يعادله" : "Cash & Equivalents", "87,200,000", "c-green")}
        {row(isAr ? "أصول بنكية" : "Bank Assets", "34,500,000", "c-blue")}
        {row(isAr ? "ذمم مدينة" : "Accounts Receivable", "18,400,000", "c-amber")}
        {row(isAr ? "مخزون طبي" : "Medical Inventory", "9,800,000")}
        {row(isAr ? "أصول ثابتة" : "Fixed Assets", "62,100,000")}
        <div
          className="fbetween"
          style={{
            padding: "12px",
            background: "rgba(26,111,186,0.07)",
            borderRadius: "var(--rsm)",
            marginTop: "6px",
          }}
        >
          <span className="fw8">{isAr ? "إجمالي الأصول" : "Total Assets"}</span>
          <span className="fw8 c-blue" style={{ fontSize: "15px" }}>
            212,000,000
          </span>
        </div>

        {sec(isAr ? "الالتزامات وحقوق الملكية" : "Liabilities & Equity")}
        {row(isAr ? "ذمم دائنة" : "Accounts Payable", "31,200,000", "c-red")}
        {row(isAr ? "التزامات قصيرة الأجل" : "Short-term Liabilities", "18,500,000", "c-red")}
        {row(isAr ? "حقوق الملكية" : "Owner's Equity", "162,300,000")}
        <div
          className="fbetween"
          style={{
            padding: "12px",
            background: "rgba(46,204,113,0.07)",
            borderRadius: "var(--rsm)",
            marginTop: "6px",
          }}
        >
          <span className="fw8">
            {isAr ? "إجمالي الالتزامات + حقوق الملكية" : "Total Liabilities + Equity"}
          </span>
          <span className="fw8 c-green" style={{ fontSize: "15px" }}>
            212,000,000
          </span>
        </div>
      </>
    );
  };

  const renderCF = () => {
    const isAr = lang === "ar";
    const row = (l: string, v: string, cls = "") => (
      <div className="fbetween" style={{ padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
        <span className="fs12">{l}</span>
        <span className={`fw8 ${cls}`}>{v}</span>
      </div>
    );
    const sec = (t: string) => (
      <div
        style={{
          padding: "12px 0 5px",
          fontSize: "11px",
          fontWeight: 800,
          color: "var(--muted2)",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {t}
      </div>
    );
    return (
      <>
        {sec(isAr ? "التدفقات التشغيلية" : "Operating Activities")}
        {row(isAr ? "نقد واردة من المرضى" : "Cash received from patients", "+89,400,000", "c-green")}
        {row(
          isAr ? "تحصيل مطالبات التأمين" : "Insurance claims collected",
          "+14,200,000",
          "c-green"
        )}
        {row(isAr ? "مدفوعات للموردين" : "Payments to suppliers", "-18,700,000", "c-red")}
        {row(isAr ? "رواتب الموظفين" : "Employee salaries", "-42,100,000", "c-red")}
        {row(isAr ? "مصروفات تشغيلية" : "Operating expenses", "-12,000,000", "c-red")}
        <div
          className="fbetween"
          style={{
            padding: "10px",
            background: "rgba(10,191,188,0.07)",
            borderRadius: "var(--rsm)",
            margin: "6px 0",
          }}
        >
          <span className="fw8">{isAr ? "صافي التدفق التشغيلي" : "Net Operating CF"}</span>
          <span className="fw8 c-teal">+30,800,000</span>
        </div>

        {sec(isAr ? "التدفقات الاستثمارية" : "Investing Activities")}
        {row(isAr ? "شراء معدات طبية" : "Medical equipment purchase", "-8,200,000", "c-red")}
        {row(isAr ? "تطوير البنية التحتية" : "Infrastructure development", "-3,100,000", "c-red")}
        <div
          className="fbetween"
          style={{
            padding: "10px",
            background: "rgba(231,76,60,0.06)",
            borderRadius: "var(--rsm)",
            margin: "6px 0",
          }}
        >
          <span className="fw8">{isAr ? "صافي التدفق الاستثماري" : "Net Investing CF"}</span>
          <span className="fw8 c-red">-11,300,000</span>
        </div>

        <div
          className="fbetween"
          style={{
            padding: "16px",
            background: "linear-gradient(135deg, rgba(46,204,113,0.12), rgba(10,191,188,0.06))",
            border: "1px solid rgba(46,204,113,0.2)",
            borderRadius: "var(--rsm)",
            marginTop: "14px",
          }}
        >
          <span className="fw8" style={{ fontSize: "14px" }}>
            {isAr ? "💰 صافي التدفق النقدي" : "💰 Net Cash Flow"}
          </span>
          <span style={{ fontSize: "18px", fontWeight: 900, color: "#4ade80" }}>
            +19,500,000 {isAr ? "د.ع" : "IQD"}
          </span>
        </div>
      </>
    );
  };

  const renderVendorList = () => (
    <>
      {VENDORS.map((v, idx) => (
        <div className="vendor-row" key={idx}>
          <div className="vendor-av" style={{ background: v.color }}>
            {v.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="vendor-name">{lang === "ar" ? v.nameAr : v.nameEn}</div>
            <div className="vendor-cat">
              {lang === "ar" ? v.catAr : v.catEn} · {v.terms}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="vendor-due" style={{ color: v.dueColor }}>
              {v.due}
            </div>
            <span className={`badge ${v.status}`} style={{ marginTop: "4px" }}>
              {lang === "ar" ? v.stAr : v.stEn}
            </span>
          </div>
        </div>
      ))}
    </>
  );

  const renderPaymentSched = () => (
    <>
      <div style={{ marginBottom: "12px" }}>
        <div className="fs11 c-muted fw8">
          {lang === "ar" ? "المدفوعات القادمة" : "Upcoming Payments"}
        </div>
      </div>
      {PAYMENT_SCHED.map((p, idx) => (
        <div className="vendor-row" key={idx}>
          <div style={{ minWidth: "52px" }}>
            <div className="fs12 fw8">{lang === "ar" ? p.dateAr : p.dateEn}</div>
            <span className={`badge ${p.urgency}`} style={{ marginTop: "4px" }}>
              {lang === "ar" ? p.urgAr : p.urgEn}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingInline: "10px" }}>
            <div className="vendor-name">{lang === "ar" ? p.vendorAr : p.vendorEn}</div>
          </div>
          <div className="vendor-due c-amber">{p.amt}</div>
        </div>
      ))}
    </>
  );

  // Navigation items
  const navItems: { id: PageId; icon: string; labelAr: string; labelEn: string; badge?: number }[] = [
    { id: "dashboard", icon: "📊", labelAr: "لوحة التحكم", labelEn: "Dashboard" },
    { id: "revenue", icon: "💵", labelAr: "الإيرادات", labelEn: "Revenue" },
    { id: "expenses", icon: "🧾", labelAr: "المصروفات", labelEn: "Expenses" },
    { id: "invoices", icon: "📄", labelAr: "الفواتير", labelEn: "Invoices", badge: 7 },
    { id: "insurance", icon: "🏛️", labelAr: "التأمين", labelEn: "Insurance" },
    { id: "budget", icon: "🎯", labelAr: "الميزانية", labelEn: "Budget" },
    { id: "reports", icon: "📈", labelAr: "التقارير المالية", labelEn: "Financial Reports" },
    { id: "vendors", icon: "🤝", labelAr: "الموردون", labelEn: "Vendors" },
  ];

  return (
    <>
      {/* Global styles */}
      <style jsx global>{`
        :root {
          --bg: #0b0f18;
          --surface: #111827;
          --s2: #1a2235;
          --s3: #222e42;
          --s4: #2a3850;
          --blue: #1a6fba;
          --blue2: #2e86de;
          --teal: #0abfbc;
          --green: #2ecc71;
          --amber: #f6ad55;
          --red: #e74c3c;
          --purple: #7c3aed;
          --pink: #ec4899;
          --text: #e2e8f0;
          --muted: #64748b;
          --muted2: #94a3b8;
          --border: rgba(255, 255, 255, 0.06);
          --border2: rgba(255, 255, 255, 0.11);
          --border3: rgba(255, 255, 255, 0.16);
          --radius: 14px;
          --rsm: 9px;
          --rxs: 6px;
          --sidebar-w: 252px;
          --topbar-h: 60px;
          --bottom-nav-h: 64px;
          --shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
          --shadow-lg: 0 12px 48px rgba(0, 0, 0, 0.55);
          --safe-bottom: env(safe-area-inset-bottom, 0px);
        }
        *,
        *::before,
        *::after {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }
        html {
          scroll-behavior: smooth;
          height: 100%;
        }
        body {
          font-family: "Cairo", sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100%;
          overflow-x: hidden;
        }
        [dir="rtl"] {
          direction: rtl;
        }
        [dir="ltr"] {
          direction: ltr;
        }
        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: var(--s3);
          border-radius: 20px;
        }
        img {
          max-width: 100%;
        }
        button {
          cursor: pointer;
          font-family: "Cairo", sans-serif;
          border: none;
        }
        input,
        select,
        textarea {
          font-family: "Cairo", sans-serif;
        }

        .shell {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }
        .main-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .sidebar {
          width: var(--sidebar-w);
          min-width: var(--sidebar-w);
          background: var(--surface);
          border-inline-end: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          z-index: 200;
          flex-shrink: 0;
          transition: transform 0.3s ease, width 0.3s ease;
        }
        .sidebar-logo {
          padding: 18px 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 11px;
        }
        .logo-mark {
          width: 40px;
          height: 40px;
          min-width: 40px;
          background: linear-gradient(135deg, var(--green), var(--teal));
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          box-shadow: 0 4px 14px rgba(46, 204, 113, 0.35);
        }
        .logo-text-main {
          font-size: 14.5px;
          font-weight: 800;
          color: var(--text);
          line-height: 1.2;
        }
        .logo-text-sub {
          font-size: 10.5px;
          color: var(--muted2);
          margin-top: 2px;
        }
        .nav-group-label {
          padding: 13px 16px 5px;
          font-size: 9.5px;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 1.6px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          margin: 1px 7px;
          border-radius: var(--rsm);
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: var(--muted2);
          transition: all 0.17s;
          white-space: nowrap;
          position: relative;
        }
        .nav-item:hover {
          background: var(--s2);
          color: var(--text);
        }
        .nav-item.active {
          background: linear-gradient(135deg, rgba(46, 204, 113, 0.15), rgba(10, 191, 188, 0.07));
          color: #4ade80;
          border: 1px solid rgba(46, 204, 113, 0.2);
        }
        .nav-item.active::before {
          content: "";
          position: absolute;
          inset-inline-end: calc(-7px - 1px);
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 18px;
          background: linear-gradient(180deg, var(--green), var(--teal));
          border-radius: 3px 0 0 3px;
        }
        [dir="ltr"] .nav-item.active::before {
          inset-inline-end: auto;
          inset-inline-start: calc(-7px - 1px);
          border-radius: 0 3px 3px 0;
        }
        .nav-icon {
          font-size: 16px;
          flex-shrink: 0;
          width: 21px;
          text-align: center;
        }
        .nav-lbl {
          flex: 1;
          min-width: 0;
        }
        .nav-badge {
          background: var(--red);
          color: #fff;
          font-size: 9.5px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 20px;
        }
        .sidebar-footer {
          margin-top: auto;
          padding: 12px 12px 16px;
          border-top: 1px solid var(--border);
        }
        .user-card {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 11px;
          background: var(--s2);
          border-radius: var(--rsm);
          border: 1px solid var(--border);
        }
        .user-av {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--green), var(--teal));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 800;
          flex-shrink: 0;
          color: #fff;
        }
        .user-name {
          font-size: 12px;
          font-weight: 700;
          color: var(--text);
        }
        .user-role {
          font-size: 10px;
          color: var(--muted2);
        }
        .user-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--green);
          margin-inline-start: auto;
          flex-shrink: 0;
          box-shadow: 0 0 5px var(--green);
        }
        .lang-toggle {
          display: flex;
          gap: 4px;
          margin-bottom: 10px;
          background: var(--s3);
          padding: 3px;
          border-radius: var(--rxs);
        }
        .lang-btn {
          flex: 1;
          padding: 6px;
          border-radius: 4px;
          font-size: 11.5px;
          font-weight: 700;
          background: none;
          color: var(--muted2);
          transition: all 0.18s;
        }
        .lang-btn.active {
          background: var(--surface);
          color: var(--text);
        }

        .topbar {
          height: var(--topbar-h);
          background: rgba(17, 24, 39, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          padding: 0 18px;
          gap: 12px;
          position: sticky;
          top: 0;
          z-index: 100;
          flex-shrink: 0;
        }
        .topbar-menu-btn {
          width: 38px;
          height: 38px;
          border-radius: var(--rsm);
          background: var(--s2);
          border: 1px solid var(--border2);
          color: var(--text);
          font-size: 18px;
          display: none;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .topbar-title-wrap {
          flex: 1;
          min-width: 0;
        }
        .topbar-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--text);
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .topbar-sub {
          font-size: 11px;
          color: var(--muted2);
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: calc(var(--bottom-nav-h) + var(--safe-bottom));
          padding-bottom: var(--safe-bottom);
          background: var(--surface);
          border-top: 1px solid var(--border);
          z-index: 300;
          justify-content: space-around;
          align-items: center;
        }
        .bn-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 6px 8px;
          border-radius: var(--rsm);
          cursor: pointer;
          font-size: 9.5px;
          font-weight: 700;
          color: var(--muted);
          background: none;
          transition: color 0.18s;
          flex: 1;
          min-width: 0;
        }
        .bn-item.active {
          color: #4ade80;
        }
        .bn-icon {
          font-size: 21px;
          line-height: 1;
        }
        .bn-badge {
          position: absolute;
          top: -4px;
          inset-inline-end: -4px;
          background: var(--red);
          color: #fff;
          font-size: 8px;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 10px;
        }
        .bn-icon-wrap {
          position: relative;
          display: inline-block;
        }

        .content {
          padding: 20px 18px;
          flex: 1;
        }
        .main-area {
          padding-bottom: 0;
        }
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 150;
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
        }
        .sidebar-overlay.open {
          display: block;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 16px;
          border-radius: var(--rsm);
          font-size: 13px;
          font-weight: 700;
          transition: all 0.17s;
          white-space: nowrap;
          line-height: 1;
          min-height: 38px;
        }
        .btn-primary {
          background: linear-gradient(135deg, var(--green), var(--teal));
          color: #fff;
          box-shadow: 0 4px 14px rgba(46, 204, 113, 0.28);
        }
        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .btn-blue {
          background: linear-gradient(135deg, var(--blue), var(--blue2));
          color: #fff;
          box-shadow: 0 4px 14px rgba(26, 111, 186, 0.3);
        }
        .btn-blue:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .btn-outline {
          background: transparent;
          border: 1px solid var(--border3);
          color: var(--text);
        }
        .btn-outline:hover {
          background: var(--s2);
        }
        .btn-ghost {
          background: var(--s2);
          color: var(--muted2);
          border: 1px solid var(--border);
        }
        .btn-ghost:hover {
          background: var(--s3);
          color: var(--text);
        }
        .btn-success {
          background: rgba(46, 204, 113, 0.14);
          border: 1px solid rgba(46, 204, 113, 0.28);
          color: #4ade80;
        }
        .btn-danger {
          background: rgba(231, 76, 60, 0.12);
          border: 1px solid rgba(231, 76, 60, 0.24);
          color: #f87171;
        }
        .btn-amber {
          background: rgba(246, 173, 85, 0.12);
          border: 1px solid rgba(246, 173, 85, 0.24);
          color: var(--amber);
        }
        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
          min-height: 32px;
        }
        .btn-xs {
          padding: 5px 9px;
          font-size: 11px;
          min-height: 28px;
        }
        .btn-lg {
          padding: 12px 24px;
          font-size: 15px;
          min-height: 46px;
        }
        .btn-block {
          width: 100%;
        }
        .btn-icon {
          padding: 8px;
          width: 38px;
          height: 38px;
        }

        .card {
          background: var(--surface);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .card-header {
          padding: 14px 18px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }
        .card-title {
          font-size: 13.5px;
          font-weight: 800;
          color: var(--text);
        }
        .card-subtitle {
          font-size: 11px;
          color: var(--muted2);
          margin-top: 2px;
        }
        .card-body {
          padding: 18px;
        }
        .card-footer {
          padding: 12px 18px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        .stat-card {
          background: var(--surface);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          padding: 18px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          border-color: var(--border2);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.28);
        }
        .stat-card::after {
          content: "";
          position: absolute;
          top: -28px;
          inset-inline-end: -28px;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          opacity: 0.06;
        }
        .stat-card.cb::after {
          background: var(--blue);
        }
        .stat-card.cg::after {
          background: var(--green);
        }
        .stat-card.ca::after {
          background: var(--amber);
        }
        .stat-card.cp::after {
          background: var(--purple);
        }
        .stat-card.ct::after {
          background: var(--teal);
        }
        .stat-card.cr::after {
          background: var(--red);
        }
        .stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          margin-bottom: 12px;
        }
        .ib {
          background: rgba(26, 111, 186, 0.15);
        }
        .ig {
          background: rgba(46, 204, 113, 0.15);
        }
        .ia {
          background: rgba(246, 173, 85, 0.15);
        }
        .ip {
          background: rgba(124, 58, 237, 0.15);
        }
        .it {
          background: rgba(10, 191, 188, 0.15);
        }
        .ir {
          background: rgba(231, 76, 60, 0.15);
        }
        .stat-val {
          font-size: 26px;
          font-weight: 900;
          color: var(--text);
          line-height: 1;
        }
        .stat-lbl {
          font-size: 11.5px;
          color: var(--muted2);
          margin-top: 5px;
          font-weight: 500;
        }
        .stat-chg {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 700;
          margin-top: 9px;
          padding: 3px 8px;
          border-radius: 20px;
        }
        .sup {
          background: rgba(46, 204, 113, 0.11);
          color: #4ade80;
        }
        .sdn {
          background: rgba(231, 76, 60, 0.11);
          color: #f87171;
        }
        .snu {
          background: rgba(100, 116, 139, 0.14);
          color: var(--muted2);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 3px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.4;
          white-space: nowrap;
        }
        .b-blue {
          background: rgba(26, 111, 186, 0.17);
          color: #60a5fa;
          border: 1px solid rgba(26, 111, 186, 0.23);
        }
        .b-green {
          background: rgba(46, 204, 113, 0.14);
          color: #4ade80;
          border: 1px solid rgba(46, 204, 113, 0.23);
        }
        .b-amber {
          background: rgba(246, 173, 85, 0.14);
          color: var(--amber);
          border: 1px solid rgba(246, 173, 85, 0.23);
        }
        .b-red {
          background: rgba(231, 76, 60, 0.14);
          color: #f87171;
          border: 1px solid rgba(231, 76, 60, 0.23);
        }
        .b-purple {
          background: rgba(124, 58, 237, 0.14);
          color: #a78bfa;
          border: 1px solid rgba(124, 58, 237, 0.23);
        }
        .b-teal {
          background: rgba(10, 191, 188, 0.14);
          color: var(--teal);
          border: 1px solid rgba(10, 191, 188, 0.23);
        }
        .b-gray {
          background: rgba(100, 116, 139, 0.14);
          color: var(--muted2);
          border: 1px solid rgba(100, 116, 139, 0.18);
        }

        .g4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .g3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .g2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .g23 {
          display: grid;
          grid-template-columns: 2fr 3fr;
          gap: 14px;
        }
        .g32 {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 14px;
        }
        .mb4 {
          margin-bottom: 16px;
        }
        .mb6 {
          margin-bottom: 22px;
        }

        .form-group {
          margin-bottom: 14px;
        }
        .form-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: var(--muted2);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .req {
          color: var(--red);
          margin-inline-start: 2px;
        }
        .form-control {
          width: 100%;
          padding: 10px 13px;
          background: var(--s2);
          border: 1px solid var(--border2);
          border-radius: var(--rsm);
          color: var(--text);
          font-size: 13px;
          transition: border-color 0.18s, box-shadow 0.18s;
          appearance: none;
          -webkit-appearance: none;
        }
        .form-control:focus {
          outline: none;
          border-color: var(--green);
          box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.12);
        }
        .form-control::placeholder {
          color: var(--muted);
        }
        select.form-control option {
          background: var(--surface);
        }
        textarea.form-control {
          resize: vertical;
          min-height: 90px;
          line-height: 1.6;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .form-hint {
          font-size: 10.5px;
          color: var(--muted);
          margin-top: 4px;
        }
        .form-divider {
          height: 1px;
          background: var(--border);
          margin: 16px 0;
        }
        .form-section {
          font-size: 12.5px;
          font-weight: 800;
          color: var(--muted2);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .dtable {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
          min-width: 560px;
        }
        .dtable thead th {
          padding: 10px 14px;
          text-align: inherit;
          font-size: 10px;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.7px;
          background: var(--s2);
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .dtable tbody td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--border);
          color: var(--text);
          font-weight: 500;
        }
        .dtable tbody tr:last-child td {
          border-bottom: none;
        }
        .dtable tbody tr:hover td {
          background: rgba(255, 255, 255, 0.018);
        }
        .cell-name {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cell-av {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .cell-s {
          font-weight: 800;
        }
        .cell-m {
          color: var(--muted2);
          font-size: 11px;
          margin-top: 1px;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 500;
          display: none;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
          padding: 16px;
        }
        .modal-backdrop.open {
          display: flex;
        }
        .modal {
          background: var(--surface);
          border-radius: var(--radius);
          border: 1px solid var(--border2);
          width: 100%;
          max-width: 540px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-lg);
        }
        .modal-header {
          padding: 18px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          position: sticky;
          top: 0;
          background: var(--surface);
          z-index: 1;
        }
        .modal-title {
          font-size: 15px;
          font-weight: 800;
          color: var(--text);
        }
        .modal-close {
          width: 32px;
          height: 32px;
          border-radius: var(--rxs);
          background: var(--s2);
          border: 1px solid var(--border);
          color: var(--muted2);
          font-size: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .modal-close:hover {
          color: var(--text);
        }
        .modal-body {
          padding: 20px;
        }
        .modal-footer {
          padding: 14px 20px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 9px;
          flex-wrap: wrap;
        }

        .prog {
          height: 6px;
          background: var(--s3);
          border-radius: 4px;
          overflow: hidden;
          flex: 1;
        }
        .prog-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        #toast {
          position: fixed;
          bottom: calc(var(--bottom-nav-h) + 12px + var(--safe-bottom));
          inset-inline-start: 16px;
          z-index: 9999;
          display: none;
          pointer-events: none;
        }
        #toast-inner {
          background: var(--s4);
          border: 1px solid var(--border2);
          border-radius: var(--rsm);
          padding: 12px 16px;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--text);
          box-shadow: var(--shadow-lg);
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 240px;
          max-width: 90vw;
        }

        .page {
          display: none;
        }
        .page.active {
          display: block;
        }

        .bar-chart {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          height: 120px;
          padding: 8px 0;
        }
        .bar-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          flex: 1;
        }
        .bar {
          width: 100%;
          border-radius: 5px 5px 0 0;
          transition: height 0.5s ease;
          min-height: 4px;
        }
        .bar-lbl {
          font-size: 9.5px;
          color: var(--muted2);
          font-weight: 600;
          white-space: nowrap;
        }
        .bar-val {
          font-size: 9px;
          color: var(--muted2);
          font-weight: 700;
        }

        .donut-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .donut-center {
          position: absolute;
          text-align: center;
        }
        .donut-center-val {
          font-size: 18px;
          font-weight: 900;
          color: var(--text);
        }
        .donut-center-lbl {
          font-size: 10px;
          color: var(--muted2);
          font-weight: 600;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11.5px;
          font-weight: 600;
        }
        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .legend-lbl {
          color: var(--muted2);
          flex: 1;
        }
        .legend-val {
          color: var(--text);
          font-weight: 800;
        }
        .legend-pct {
          color: var(--muted);
          font-size: 10.5px;
        }

        .tx-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }
        .tx-item:last-child {
          border-bottom: none;
        }
        .tx-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          flex-shrink: 0;
        }
        .tx-info {
          flex: 1;
          min-width: 0;
        }
        .tx-name {
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tx-meta {
          font-size: 11px;
          color: var(--muted2);
          margin-top: 2px;
        }
        .tx-amt {
          font-size: 14px;
          font-weight: 900;
          white-space: nowrap;
        }
        .tx-amt.income {
          color: #4ade80;
        }
        .tx-amt.expense {
          color: #f87171;
        }

        .budget-row {
          padding: 14px 0;
          border-bottom: 1px solid var(--border);
        }
        .budget-row:last-child {
          border-bottom: none;
        }
        .budget-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .budget-name {
          font-size: 13px;
          font-weight: 700;
        }
        .budget-nums {
          font-size: 11.5px;
          color: var(--muted2);
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .budget-used {
          font-weight: 800;
          color: var(--text);
        }

        .inv-paper {
          background: #fff;
          color: #1e293b;
          border-radius: var(--radius);
          padding: 28px;
          font-family: "Cairo", sans-serif;
          box-shadow: 0 16px 50px rgba(0, 0, 0, 0.35);
        }
        .inv-hd {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 20px;
          margin-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
          flex-wrap: wrap;
          gap: 12px;
        }
        .inv-logo {
          font-size: 19px;
          font-weight: 900;
          color: #2ecc71;
        }
        .inv-sub {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 3px;
        }
        .inv-stamp {
          text-align: center;
          padding: 7px 16px;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 800;
          border: 2px solid;
        }
        .inv-stamp.paid {
          color: #16a34a;
          border-color: #16a34a;
          background: rgba(22, 163, 74, 0.06);
        }
        .inv-stamp.pend {
          color: #d97706;
          border-color: #d97706;
          background: rgba(217, 119, 6, 0.06);
        }
        .inv-stamp.ovrd {
          color: #dc2626;
          border-color: #dc2626;
          background: rgba(220, 38, 38, 0.06);
        }
        .inv-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-bottom: 20px;
        }
        .inv-bl {
          font-size: 9.5px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }
        .inv-bv {
          font-size: 13.5px;
          font-weight: 800;
          color: #1e293b;
        }
        .inv-bs {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }
        .inv-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 18px;
          font-size: 12px;
        }
        .inv-table thead th {
          padding: 9px 12px;
          background: #f8fafc;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          text-align: inherit;
          border-bottom: 2px solid #e2e8f0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .inv-table tbody td {
          padding: 10px 12px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          font-weight: 600;
        }
        .inv-totals {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 7px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }
        .inv-tline {
          display: flex;
          gap: 48px;
          font-size: 12.5px;
          font-weight: 600;
          color: #64748b;
          align-items: center;
        }
        .inv-tline.grand {
          font-size: 16px;
          font-weight: 900;
          color: #16a34a;
          padding-top: 10px;
          margin-top: 3px;
          border-top: 2px solid #16a34a;
        }
        .inv-footer {
          margin-top: 24px;
          padding-top: 14px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #94a3b8;
          flex-wrap: wrap;
          gap: 6px;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: var(--rsm);
          font-size: 12.5px;
          font-weight: 600;
          margin-bottom: 14px;
        }
        .alert-warn {
          background: rgba(246, 173, 85, 0.1);
          border: 1px solid rgba(246, 173, 85, 0.25);
          color: var(--amber);
        }
        .alert-info {
          background: rgba(26, 111, 186, 0.1);
          border: 1px solid rgba(26, 111, 186, 0.2);
          color: #60a5fa;
        }
        .alert-danger {
          background: rgba(231, 76, 60, 0.1);
          border: 1px solid rgba(231, 76, 60, 0.2);
          color: #f87171;
        }
        .alert-success {
          background: rgba(46, 204, 113, 0.1);
          border: 1px solid rgba(46, 204, 113, 0.2);
          color: #4ade80;
        }

        .kpi-mini {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 14px 10px;
          background: var(--s2);
          border-radius: var(--rsm);
          border: 1px solid var(--border);
        }
        .kpi-v {
          font-size: 20px;
          font-weight: 900;
          line-height: 1;
        }
        .kpi-l {
          font-size: 10.5px;
          color: var(--muted2);
          margin-top: 4px;
          font-weight: 600;
        }

        .stabs {
          display: flex;
          gap: 4px;
          background: var(--s2);
          padding: 4px;
          border-radius: var(--rsm);
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .stab {
          padding: 7px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          color: var(--muted2);
          background: none;
          cursor: pointer;
          transition: all 0.17s;
          white-space: nowrap;
        }
        .stab.active {
          background: var(--surface);
          color: var(--text);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .fact-strip {
          display: flex;
          gap: 1px;
          background: var(--border);
          border-radius: var(--rsm);
          overflow: hidden;
          margin-bottom: 18px;
        }
        .fact-item {
          flex: 1;
          background: var(--surface);
          padding: 12px 14px;
          text-align: center;
        }
        .fact-v {
          font-size: 15px;
          font-weight: 900;
        }
        .fact-l {
          font-size: 10px;
          color: var(--muted2);
          margin-top: 2px;
          font-weight: 600;
        }

        .vendor-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 0;
          border-bottom: 1px solid var(--border);
        }
        .vendor-row:last-child {
          border-bottom: none;
        }
        .vendor-av {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .vendor-name {
          font-size: 13px;
          font-weight: 700;
        }
        .vendor-cat {
          font-size: 11px;
          color: var(--muted2);
        }
        .vendor-due {
          font-size: 13px;
          font-weight: 800;
        }

        .frow {
          display: flex;
          align-items: center;
        }
        .fbetween {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .gap2 {
          gap: 8px;
        }
        .gap3 {
          gap: 12px;
        }
        .gap4 {
          gap: 16px;
        }
        .fw8 {
          font-weight: 800;
        }
        .fs12 {
          font-size: 12px;
        }
        .fs11 {
          font-size: 11px;
        }
        .c-muted {
          color: var(--muted2);
        }
        .c-green {
          color: #4ade80;
        }
        .c-blue {
          color: #60a5fa;
        }
        .c-amber {
          color: var(--amber);
        }
        .c-red {
          color: #f87171;
        }
        .c-teal {
          color: var(--teal);
        }
        .pulse {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--green);
          position: relative;
        }
        .pulse::after {
          content: "";
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 2px solid var(--green);
          opacity: 0;
          animation: pr 1.8s ease infinite;
        }
        @keyframes pr {
          0% {
            transform: scale(0.8);
            opacity: 0.7;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }

        @media (max-width: 900px) {
          .shell {
            flex-direction: column;
          }
          .sidebar {
            position: fixed;
            top: 0;
            inset-inline-start: 0;
            height: 100vh;
            z-index: 200;
            transform: translateX(100%);
            border-inline-end: 1px solid var(--border2);
          }
          [dir="ltr"] .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .topbar-menu-btn {
            display: flex;
          }
          .bottom-nav {
            display: flex;
          }
          .main-area {
            padding-bottom: calc(var(--bottom-nav-h) + var(--safe-bottom));
          }
          #toast {
            bottom: calc(var(--bottom-nav-h) + 12px + var(--safe-bottom));
          }
          .g4 {
            grid-template-columns: 1fr 1fr;
          }
          .g3 {
            grid-template-columns: 1fr 1fr;
          }
          .g2,
          .g23,
          .g32 {
            grid-template-columns: 1fr;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .inv-meta {
            grid-template-columns: 1fr 1fr;
          }
          .content {
            padding: 14px;
          }
          .topbar {
            padding: 0 14px;
            height: 56px;
          }
          .stat-val {
            font-size: 22px;
          }
        }
        @media (max-width: 540px) {
          .g4,
          .g3 {
            grid-template-columns: 1fr 1fr;
          }
          .inv-meta {
            grid-template-columns: 1fr;
          }
          .inv-paper {
            padding: 18px;
          }
          .topbar-actions .btn-sm:not(.keep) {
            display: none;
          }
          .card-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .fact-strip {
            flex-wrap: wrap;
          }
          .fact-item {
            min-width: 50%;
          }
        }
        @media (max-width: 380px) {
          .g4 {
            grid-template-columns: 1fr 1fr;
          }
          .bn-item span.bn-text {
            font-size: 8.5px;
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .page.active .content > * {
          animation: fadeUp 0.25s ease both;
        }
        .page.active .content > *:nth-child(2) {
          animation-delay: 0.04s;
        }
        .page.active .content > *:nth-child(3) {
          animation-delay: 0.08s;
        }
        .page.active .content > *:nth-child(4) {
          animation-delay: 0.12s;
        }
        .page.active .content > *:nth-child(5) {
          animation-delay: 0.16s;
        }
      `}</style>

      <div dir={dir} lang={lang}>
        {/* Overlay */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
          onClick={closeSidebar}
        />

        <div className="shell">
          {/* Sidebar */}
          <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="sidebar-logo">
              <div className="logo-mark">💰</div>
              <div>
                <div className="logo-text-main">
                  {lang === "ar" ? "العيادة الرقمية" : "Digital Clinic"}
                </div>
                <div className="logo-text-sub">
                  {lang === "ar" ? "نظام الإدارة المالية" : "Finance Management"}
                </div>
              </div>
            </div>

            <div className="nav-group-label">{lang === "ar" ? "الرئيسية" : "MAIN"}</div>
            {navItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className={`nav-item ${activePage === item.id ? "active" : ""}`}
                onClick={() => gotoPage(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-lbl">{lang === "ar" ? item.labelAr : item.labelEn}</span>
              </div>
            ))}

            <div className="nav-group-label">{lang === "ar" ? "الفوترة" : "BILLING"}</div>
            {navItems.slice(3, 5).map((item) => (
              <div
                key={item.id}
                className={`nav-item ${activePage === item.id ? "active" : ""}`}
                onClick={() => gotoPage(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-lbl">{lang === "ar" ? item.labelAr : item.labelEn}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}

            <div className="nav-group-label">{lang === "ar" ? "التحليل" : "ANALYSIS"}</div>
            {navItems.slice(5).map((item) => (
              <div
                key={item.id}
                className={`nav-item ${activePage === item.id ? "active" : ""}`}
                onClick={() => gotoPage(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-lbl">{lang === "ar" ? item.labelAr : item.labelEn}</span>
              </div>
            ))}

            <div className="sidebar-footer">
              <div className="lang-toggle">
                <button
                  className={`lang-btn ${lang === "ar" ? "active" : ""}`}
                  onClick={() => handleLangSwitch("ar")}
                >
                  العربية
                </button>
                <button
                  className={`lang-btn ${lang === "en" ? "active" : ""}`}
                  onClick={() => handleLangSwitch("en")}
                >
                  English
                </button>
              </div>
              <div className="user-card">
                <div className="user-av">م</div>
                <div>
                  <div className="user-name">
                    {lang === "ar" ? "م. سامي الراشد" : "Sami Al-Rashed"}
                  </div>
                  <div className="user-role">
                    {lang === "ar" ? "المدير المالي" : "Finance Director"}
                  </div>
                </div>
                <div className="user-dot"></div>
              </div>
            </div>
          </aside>

          {/* Main area */}
          <div className="main-area">
            {/* Topbar */}
            <div className="topbar">
              <button className="topbar-menu-btn" onClick={openSidebar}>
                ☰
              </button>
              <div className="topbar-title-wrap">
                <div className="topbar-title">
                  {PAGE_TITLES[lang][activePage]}
                </div>
                <div className="topbar-sub">
                  {lang === "ar"
                    ? "أبريل 2026 • العيادة الرقمية، بغداد"
                    : "April 2026 • Digital Clinic, Baghdad"}
                </div>
              </div>
              <div className="topbar-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => openModal("modal-add-tx")}>
                  <span>+</span>
                  <span>{lang === "ar" ? "قيد جديد" : "New Entry"}</span>
                </button>
                <button className="btn btn-primary btn-sm keep" onClick={() => openModal("modal-report")}>
                  <span>📤</span>
                  <span>{lang === "ar" ? "تصدير" : "Export"}</span>
                </button>
              </div>
            </div>

            {/* Page content */}
            {activePage === "dashboard" && (
              <div className="page active">
                <div className="content">
                  <div className="alert alert-warn mb4">
                    <span>⚠️</span>
                    <span>
                      {lang === "ar"
                        ? "3 فواتير متأخرة بإجمالي 4,200,000 د.ع — يرجى المراجعة الفورية"
                        : "3 overdue invoices totaling 4,200,000 IQD — immediate review required"}
                    </span>
                  </div>

                  <div className="g4 mb6">
                    <div className="stat-card cg">
                      <div className="stat-icon ig">💰</div>
                      <div className="stat-val">142.8M</div>
                      <div className="stat-lbl">
                        {lang === "ar" ? "إجمالي الإيرادات (د.ع)" : "Total Revenue (IQD)"}
                      </div>
                      <div className="stat-chg sup">
                        ▲ +12.4%{" "}
                        <span>{lang === "ar" ? "عن الشهر السابق" : "vs last month"}</span>
                      </div>
                    </div>
                    <div className="stat-card cr">
                      <div className="stat-icon ir">💸</div>
                      <div className="stat-val">89.3M</div>
                      <div className="stat-lbl">
                        {lang === "ar" ? "إجمالي المصروفات (د.ع)" : "Total Expenses (IQD)"}
                      </div>
                      <div className="stat-chg sdn">
                        ▲ +5.1%{" "}
                        <span>{lang === "ar" ? "عن الشهر السابق" : "vs last month"}</span>
                      </div>
                    </div>
                    <div className="stat-card ct">
                      <div className="stat-icon it">📈</div>
                      <div className="stat-val">53.5M</div>
                      <div className="stat-lbl">
                        {lang === "ar" ? "صافي الربح (د.ع)" : "Net Profit (IQD)"}
                      </div>
                      <div className="stat-chg sup">
                        ▲ +23.7%{" "}
                        <span>{lang === "ar" ? "عن الشهر السابق" : "vs last month"}</span>
                      </div>
                    </div>
                    <div className="stat-card ca">
                      <div className="stat-icon ia">⏳</div>
                      <div className="stat-val">18.4M</div>
                      <div className="stat-lbl">
                        {lang === "ar" ? "مستحقات معلقة (د.ع)" : "Outstanding Receivables"}
                      </div>
                      <div className="stat-chg sdn">
                        ▼ -3.2% <span>{lang === "ar" ? "تحسن" : "improvement"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="g32 mb6">
                    <div className="card">
                      <div className="card-header">
                        <div>
                          <div className="card-title">
                            {lang === "ar" ? "الإيرادات الشهرية" : "Monthly Revenue"}
                          </div>
                          <div className="card-subtitle">
                            {lang === "ar"
                              ? "آخر 8 أشهر — بالمليون د.ع"
                              : "Last 8 months — in million IQD"}
                          </div>
                        </div>
                        <span className="badge b-green">2025–2026</span>
                      </div>
                      <div className="card-body">
                        <div className="bar-chart">{renderRevChart()}</div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-header">
                        <div>
                          <div className="card-title">
                            {lang === "ar" ? "مصادر الإيرادات" : "Revenue Sources"}
                          </div>
                          <div className="card-subtitle">
                            {lang === "ar" ? "أبريل 2026" : "April 2026"}
                          </div>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="donut-wrap mb4" style={{ height: "130px" }}>
                          <svg viewBox="0 0 120 120" width="130" height="130">
                            <circle
                              cx="60"
                              cy="60"
                              r="50"
                              fill="none"
                              stroke="var(--s3)"
                              strokeWidth="18"
                            />
                            <circle
                              cx="60"
                              cy="60"
                              r="50"
                              fill="none"
                              stroke="#2ecc71"
                              strokeWidth="18"
                              strokeDasharray="138 176"
                              strokeDashoffset="0"
                              strokeLinecap="round"
                            />
                            <circle
                              cx="60"
                              cy="60"
                              r="50"
                              fill="none"
                              stroke="#1a6fba"
                              strokeWidth="18"
                              strokeDasharray="82 232"
                              strokeDashoffset="-138"
                              strokeLinecap="round"
                            />
                            <circle
                              cx="60"
                              cy="60"
                              r="50"
                              fill="none"
                              stroke="#f6ad55"
                              strokeWidth="18"
                              strokeDasharray="52 262"
                              strokeDashoffset="-220"
                              strokeLinecap="round"
                            />
                            <circle
                              cx="60"
                              cy="60"
                              r="50"
                              fill="none"
                              stroke="#0abfbc"
                              strokeWidth="18"
                              strokeDasharray="42 272"
                              strokeDashoffset="-272"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="donut-center">
                            <div className="donut-center-val">142.8M</div>
                            <div className="donut-center-lbl">
                              {lang === "ar" ? "إجمالي" : "Total"}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                          <div className="legend-item">
                            <div className="legend-dot" style={{ background: "#2ecc71" }}></div>
                            <span className="legend-lbl">
                              {lang === "ar" ? "كشوف عيادة" : "Clinic Visits"}
                            </span>
                            <span className="legend-pct">44%</span>
                            <span className="legend-val">62.8M</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-dot" style={{ background: "#1a6fba" }}></div>
                            <span className="legend-lbl">
                              {lang === "ar" ? "مختبر وأشعة" : "Lab & Radiology"}
                            </span>
                            <span className="legend-pct">26%</span>
                            <span className="legend-val">37.1M</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-dot" style={{ background: "#f6ad55" }}></div>
                            <span className="legend-lbl">
                              {lang === "ar" ? "صيدلية" : "Pharmacy"}
                            </span>
                            <span className="legend-pct">17%</span>
                            <span className="legend-val">24.3M</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-dot" style={{ background: "#0abfbc" }}></div>
                            <span className="legend-lbl">
                              {lang === "ar" ? "تأمين صحي" : "Insurance"}
                            </span>
                            <span className="legend-pct">13%</span>
                            <span className="legend-val">18.6M</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="g2 mb6">
                    <div className="card">
                      <div className="card-header">
                        <div>
                          <div className="card-title">
                            {lang === "ar" ? "آخر المعاملات" : "Recent Transactions"}
                          </div>
                          <div className="card-subtitle">{lang === "ar" ? "اليوم" : "Today"}</div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => gotoPage("expenses")}>
                          <span>{lang === "ar" ? "عرض الكل" : "View All"}</span>
                        </button>
                      </div>
                      <div className="card-body">{renderRecentTx()}</div>
                    </div>

                    <div className="card">
                      <div className="card-header">
                        <div>
                          <div className="card-title">
                            {lang === "ar" ? "الوضع النقدي" : "Cash Position"}
                          </div>
                          <div className="card-subtitle">
                            {lang === "ar" ? "أبريل 2026" : "April 2026"}
                          </div>
                        </div>
                        <span className="badge b-teal">
                          <span className="pulse" style={{ marginInlineEnd: "4px" }}></span>
                          <span>{lang === "ar" ? "مباشر" : "Live"}</span>
                        </span>
                      </div>
                      <div className="card-body">
                        <div className="g3 mb6" style={{ gap: "10px" }}>
                          <div className="kpi-mini">
                            <div className="kpi-v c-green">87.2M</div>
                            <div className="kpi-l">{lang === "ar" ? "نقدي" : "Cash"}</div>
                          </div>
                          <div className="kpi-mini">
                            <div className="kpi-v c-blue">34.5M</div>
                            <div className="kpi-l">{lang === "ar" ? "بنكي" : "Bank"}</div>
                          </div>
                          <div className="kpi-mini">
                            <div className="kpi-v c-amber">18.4M</div>
                            <div className="kpi-l">{lang === "ar" ? "ذمم" : "Receivable"}</div>
                          </div>
                        </div>
                        <div style={{ marginBottom: "12px" }}>
                          <div className="fbetween mb4" style={{ marginBottom: "6px" }}>
                            <span className="fs11 c-muted">
                              {lang === "ar" ? "نسبة الربح" : "Profit Margin"}
                            </span>
                            <span className="fw8 c-green">37.5%</span>
                          </div>
                          <div className="prog">
                            <div
                              className="prog-fill"
                              style={{ width: "37.5%", background: "var(--green)" }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="fbetween mb4" style={{ marginBottom: "6px" }}>
                            <span className="fs11 c-muted">
                              {lang === "ar" ? "تحصيل الذمم" : "Collection Rate"}
                            </span>
                            <span className="fw8 c-blue">78.2%</span>
                          </div>
                          <div className="prog">
                            <div
                              className="prog-fill"
                              style={{ width: "78.2%", background: "var(--blue2)" }}
                            />
                          </div>
                        </div>
                        <div style={{ marginTop: "12px" }}>
                          <div className="fbetween mb4" style={{ marginBottom: "6px" }}>
                            <span className="fs11 c-muted">
                              {lang === "ar" ? "تنفيذ الميزانية" : "Budget Execution"}
                            </span>
                            <span className="fw8 c-amber">62.8%</span>
                          </div>
                          <div className="prog">
                            <div
                              className="prog-fill"
                              style={{ width: "62.8%", background: "var(--amber)" }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="card-footer">
                        <span className="fs11 c-muted">
                          {lang === "ar"
                            ? "آخر تحديث: منذ 5 دقائق"
                            : "Last updated: 5 minutes ago"}
                        </span>
                        <button className="btn btn-primary btn-sm" onClick={() => gotoPage("reports")}>
                          <span>{lang === "ar" ? "التقرير الكامل" : "Full Report"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">
                          {lang === "ar" ? "توزيع المصروفات" : "Expense Breakdown"}
                        </div>
                        <div className="card-subtitle">
                          {lang === "ar"
                            ? "أبريل 2026 — بالمليون د.ع"
                            : "April 2026 — in million IQD"}
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => gotoPage("expenses")}>
                        <span>{lang === "ar" ? "التفاصيل" : "Details"}</span>
                      </button>
                    </div>
                    <div className="card-body">{renderExpBreakdown()}</div>
                  </div>
                </div>
              </div>
            )}

            {activePage === "revenue" && (
              <div className="page active">
                <div className="content">
                  <div className="fact-strip">
                    <div className="fact-item">
                      <div className="fact-v c-green">142.8M</div>
                      <div className="fact-l">
                        {lang === "ar" ? "إجمالي الإيرادات" : "Total Revenue"}
                      </div>
                    </div>
                    <div className="fact-item">
                      <div className="fact-v c-blue">4,812</div>
                      <div className="fact-l">
                        {lang === "ar" ? "عدد المرضى" : "Patient Visits"}
                      </div>
                    </div>
                    <div className="fact-item">
                      <div className="fact-v c-amber">29,680</div>
                      <div className="fact-l">
                        {lang === "ar" ? "متوسط الزيارة (د.ع)" : "Avg per Visit (IQD)"}
                      </div>
                    </div>
                    <div className="fact-item">
                      <div className="fact-v c-teal">+12.4%</div>
                      <div className="fact-l">
                        {lang === "ar" ? "نمو شهري" : "Monthly Growth"}
                      </div>
                    </div>
                  </div>

                  <div className="g2 mb6">
                    <div className="card">
                      <div className="card-header">
                        <div className="card-title">
                          {lang === "ar" ? "الإيرادات حسب القسم" : "Revenue by Department"}
                        </div>
                      </div>
                      <div className="card-body">{renderRevDepts()}</div>
                    </div>
                    <div className="card">
                      <div className="card-header">
                        <div className="card-title">
                          {lang === "ar" ? "الإيرادات اليومية — أبريل" : "Daily Revenue — April"}
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="bar-chart">{renderDailyRevChart()}</div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <div className="card-title">
                        {lang === "ar" ? "سجل الإيرادات التفصيلي" : "Detailed Revenue Log"}
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <select
                          className="form-control btn-sm"
                          style={{ width: "auto", minHeight: "unset", padding: "6px 10px" }}
                        >
                          <option>{lang === "ar" ? "كل الأقسام" : "All Departments"}</option>
                          <option>{lang === "ar" ? "العيادة العامة" : "General Clinic"}</option>
                          <option>{lang === "ar" ? "المختبر" : "Laboratory"}</option>
                          <option>{lang === "ar" ? "الصيدلية" : "Pharmacy"}</option>
                        </select>
                        <button className="btn btn-primary btn-sm">
                          <span>📤 {lang === "ar" ? "تصدير" : "Export"}</span>
                        </button>
                      </div>
                    </div>
                    <div className="table-wrap">
                      <table className="dtable">
                        <thead>
                          <tr>
                            <th>{lang === "ar" ? "التاريخ" : "Date"}</th>
                            <th>{lang === "ar" ? "المريض / المصدر" : "Patient / Source"}</th>
                            <th>{lang === "ar" ? "القسم" : "Department"}</th>
                            <th>{lang === "ar" ? "الخدمة" : "Service"}</th>
                            <th>{lang === "ar" ? "المبلغ (د.ع)" : "Amount (IQD)"}</th>
                            <th>{lang === "ar" ? "طريقة الدفع" : "Payment"}</th>
                            <th>{lang === "ar" ? "الحالة" : "Status"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="c-muted">14/4</td>
                            <td className="fw8">
                              {lang === "ar" ? "أحمد علي" : "Ahmed Ali"}
                            </td>
                            <td>
                              <span className="badge b-teal">
                                {lang === "ar" ? "عيادة" : "Clinic"}
                              </span>
                            </td>
                            <td>{lang === "ar" ? "كشف" : "Consult"}</td>
                            <td className="fw8 c-green">350,000</td>
                            <td className="c-muted">{lang === "ar" ? "نقدي" : "Cash"}</td>
                            <td>
                              <span className="badge b-green">
                                {lang === "ar" ? "مدفوع" : "Paid"}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="c-muted">14/4</td>
                            <td className="fw8">
                              {lang === "ar" ? "مريم حسن" : "Maryam Hassan"}
                            </td>
                            <td>
                              <span className="badge b-blue">
                                {lang === "ar" ? "مختبر" : "Lab"}
                              </span>
                            </td>
                            <td>{lang === "ar" ? "تحليل" : "Tests"}</td>
                            <td className="fw8 c-green">890,000</td>
                            <td className="c-muted">{lang === "ar" ? "بنكي" : "Bank"}</td>
                            <td>
                              <span className="badge b-green">
                                {lang === "ar" ? "مدفوع" : "Paid"}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="c-muted">13/4</td>
                            <td className="fw8">
                              {lang === "ar" ? "التأمين الوطني" : "Natl. Insurance"}
                            </td>
                            <td>
                              <span className="badge b-purple">
                                {lang === "ar" ? "تأمين" : "Insurance"}
                              </span>
                            </td>
                            <td>{lang === "ar" ? "مطالبة" : "Claim"}</td>
                            <td className="fw8 c-green">4,200,000</td>
                            <td className="c-muted">{lang === "ar" ? "تحويل" : "Transfer"}</td>
                            <td>
                              <span className="badge b-amber">
                                {lang === "ar" ? "معلق" : "Pending"}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="c-muted">13/4</td>
                            <td className="fw8">
                              {lang === "ar" ? "سارة أحمد" : "Sara Ahmed"}
                            </td>
                            <td>
                              <span className="badge b-amber">
                                {lang === "ar" ? "أشعة" : "Radiology"}
                              </span>
                            </td>
                            <td>CT</td>
                            <td className="fw8 c-green">1,200,000</td>
                            <td className="c-muted">{lang === "ar" ? "نقدي" : "Cash"}</td>
                            <td>
                              <span className="badge b-green">
                                {lang === "ar" ? "مدفوع" : "Paid"}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="c-muted">12/4</td>
                            <td className="fw8">
                              {lang === "ar" ? "علي كريم" : "Ali Kareem"}
                            </td>
                            <td>
                              <span className="badge b-teal">
                                {lang === "ar" ? "صيدلية" : "Pharmacy"}
                              </span>
                            </td>
                            <td>{lang === "ar" ? "أدوية" : "Drugs"}</td>
                            <td className="fw8 c-green">280,000</td>
                            <td className="c-muted">{lang === "ar" ? "بنكي" : "Bank"}</td>
                            <td>
                              <span className="badge b-green">
                                {lang === "ar" ? "مدفوع" : "Paid"}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="card-footer">
                      <span className="fs11 c-muted">
                        {lang === "ar"
                          ? "عرض 1–10 من 148 سجل"
                          : "Showing 1–10 of 148 records"}
                      </span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button className="btn btn-ghost btn-xs">‹</button>
                        <button className="btn btn-primary btn-xs">1</button>
                        <button className="btn btn-ghost btn-xs">2</button>
                        <button className="btn btn-ghost btn-xs">3</button>
                        <button className="btn btn-ghost btn-xs">›</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePage === "expenses" && (
              <div className="page active">
                <div className="content">
                  <div className="g4 mb6">
                    <div className="stat-card cr">
                      <div className="stat-icon ir">🏥</div>
                      <div className="stat-val">42.1M</div>
                      <div className="stat-lbl">
                        {lang === "ar" ? "رواتب وأجور" : "Salaries & Wages"}
                      </div>
                      <div className="stat-chg snu">
                        47% <span>{lang === "ar" ? "من الكل" : "of total"}</span>
                      </div>
                    </div>
                    <div className="stat-card ca">
                      <div className="stat-icon ia">💊</div>
                      <div className="stat-val">18.7M</div>
                      <div className="stat-lbl">
                        {lang === "ar" ? "مستلزمات طبية" : "Medical Supplies"}
                      </div>
                      <div className="stat-chg snu">
                        21% <span>{lang === "ar" ? "من الكل" : "of total"}</span>
                      </div>
                    </div>
                    <div className="stat-card cb">
                      <div className="stat-icon ib">🔧</div>
                      <div className="stat-val">9.4M</div>
                      <div className="stat-lbl">
                        {lang === "ar" ? "صيانة ومرافق" : "Maintenance & Utilities"}
                      </div>
                      <div className="stat-chg snu">
                        11% <span>{lang === "ar" ? "من الكل" : "of total"}</span>
                      </div>
                    </div>
                    <div className="stat-card cp">
                      <div className="stat-icon ip">📦</div>
                      <div className="stat-val">19.1M</div>
                      <div className="stat-lbl">
                        {lang === "ar" ? "مصروفات أخرى" : "Other Expenses"}
                      </div>
                      <div className="stat-chg snu">
                        21% <span>{lang === "ar" ? "من الكل" : "of total"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="g32 mb6">
                    <div className="card">
                      <div className="card-header">
                        <div className="card-title">
                          {lang === "ar" ? "سجل المصروفات" : "Expense Register"}
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => openModal("modal-add-exp")}>
                          <span>+</span>
                          <span>{lang === "ar" ? "مصروف جديد" : "Add Expense"}</span>
                        </button>
                      </div>
                      <div className="table-wrap">{renderExpTable()}</div>
                    </div>
                    <div className="card">
                      <div className="card-header">
                        <div className="card-title">
                          {lang === "ar" ? "أكثر بنود الإنفاق" : "Top Spending Categories"}
                        </div>
                      </div>
                      <div className="card-body">{renderExpCats()}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePage === "invoices" && (
              <div className="page active">
                <div className="content">
                  <div className="stabs">
                    <button
                      className={`stab ${invTab === "all" ? "active" : ""}`}
                      onClick={() => setInvTab("all")}
                    >
                      {lang === "ar" ? "الكل (32)" : "All (32)"}
                    </button>
                    <button
                      className={`stab ${invTab === "pending" ? "active" : ""}`}
                      onClick={() => setInvTab("pending")}
                    >
                      {lang === "ar" ? "معلق (7)" : "Pending (7)"}
                    </button>
                    <button
                      className={`stab ${invTab === "paid" ? "active" : ""}`}
                      onClick={() => setInvTab("paid")}
                    >
                      {lang === "ar" ? "مدفوع (22)" : "Paid (22)"}
                    </button>
                    <button
                      className={`stab ${invTab === "overdue" ? "active" : ""}`}
                      onClick={() => setInvTab("overdue")}
                    >
                      {lang === "ar" ? "متأخر (3)" : "Overdue (3)"}
                    </button>
                  </div>

                  <div className="g2 mb6">
                    <div className="kpi-mini">
                      <div className="kpi-v c-green">124.3M</div>
                      <div className="kpi-l">
                        {lang === "ar" ? "إجمالي المفاتير" : "Total Invoiced"}
                      </div>
                    </div>
                    <div className="kpi-mini">
                      <div className="kpi-v c-amber">18.4M</div>
                      <div className="kpi-l">
                        {lang === "ar" ? "قيد التحصيل" : "Pending Collection"}
                      </div>
                    </div>
                  </div>

                  <div className="g32 mb6">
                    <div className="card">
                      <div className="card-header">
                        <div className="card-title">
                          {lang === "ar" ? "قائمة الفواتير" : "Invoice List"}
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => openModal("modal-new-inv")}>
                          <span>+</span>
                          <span>{lang === "ar" ? "فاتورة جديدة" : "New Invoice"}</span>
                        </button>
                      </div>
                      <div className="table-wrap">{renderInvTable()}</div>
                    </div>
                    <div className="card">
                      <div className="card-header">
                        <div className="card-title">
                          {lang === "ar" ? "معاينة الفاتورة" : "Invoice Preview"}
                        </div>
                      </div>
                      <div className="card-body">{renderInvPreview()}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePage === "insurance" && (
              <div className="page active">
                <div className="content">
                  <div className="g3 mb6">
                    <div className="stat-card ct">
                      <div className="stat-icon it">🏛️</div>
                      <div className="stat-val">18.6M</div>
                      <div className="stat-lbl">
                        {lang === "ar" ? "مطالبات التأمين (د.ع)" : "Insurance Claims (IQD)"}
                      </div>
                      <div className="stat-chg sup">▲ +8.2%</div>
                    </div>
                    <div className="stat-card cg">
                      <div className="stat-icon ig">✅</div>
                      <div className="stat-val">14.2M</div>
                      <div className="stat-lbl">
                        {lang === "ar" ? "مطالبات مقبولة" : "Accepted Claims"}
                      </div>
                      <div className="stat-chg snu">76.3%</div>
                    </div>
                    <div className="stat-card cr">
                      <div className="stat-icon ir">❌</div>
                      <div className="stat-val">4.4M</div>
                      <div className="stat-lbl">
                        {lang === "ar" ? "مطالبات مرفوضة" : "Rejected Claims"}
                      </div>
                      <div className="stat-chg sdn">23.7%</div>
                    </div>
                  </div>

                  <div className="card mb6">
                    <div className="card-header">
                      <div className="card-title">
                        {lang === "ar" ? "شركات التأمين" : "Insurance Providers"}
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => openModal("modal-claim")}>
                        <span>+</span>
                        <span>{lang === "ar" ? "مطالبة جديدة" : "New Claim"}</span>
                      </button>
                    </div>
                    <div className="card-body">{renderInsProviders()}</div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <div className="card-title">
                        {lang === "ar" ? "سجل المطالبات" : "Claims Register"}
                      </div>
                    </div>
                    <div className="table-wrap">{renderClaimsTable()}</div>
                  </div>
                </div>
              </div>
            )}

            {activePage === "budget" && (
              <div className="page active">
                <div className="content">
                  <div className="alert alert-info mb4">
                    <span>ℹ️</span>
                    <span>
                      {lang === "ar"
                        ? "تم تنفيذ 62.8% من الميزانية السنوية — الوتيرة ضمن الخطة"
                        : "62.8% of annual budget executed — pace within plan"}
                    </span>
                  </div>

                  <div className="g4 mb6">
                    <div className="stat-card cb">
                      <div className="stat-icon ib">📋</div>
                      <div className="stat-val">200M</div>
                      <div className="stat-lbl">
                        {lang === "ar" ? "الميزانية السنوية" : "Annual Budget"}
                      </div>
                      <div className="stat-chg snu">100%</div>
                    </div>
                    <div className="stat-card cg">
                      <div className="stat-icon ig">✅</div>
                      <div className="stat-val">125.6M</div>
                      <div className="stat-lbl">
                        {lang === "ar" ? "المنفق حتى الآن" : "Spent to Date"}
                      </div>
                      <div className="stat-chg snu">62.8%</div>
                    </div>
                    <div className="stat-card ct">
                      <div className="stat-icon it">💹</div>
                      <div className="stat-val">74.4M</div>
                      <div className="stat-lbl">
                        {lang === "ar" ? "الرصيد المتبقي" : "Remaining Balance"}
                      </div>
                      <div className="stat-chg sup">37.2%</div>
                    </div>
                    <div className="stat-card ca">
                      <div className="stat-icon ia">📆</div>
                      <div className="stat-val">8.5</div>
                      <div className="stat-lbl">
                        {lang === "ar" ? "شهور متبقية" : "Months Remaining"}
                      </div>
                      <div className="stat-chg snu">{lang === "ar" ? "من 12" : "of 12"}</div>
                    </div>
                  </div>

                  <div className="g32 mb6">
                    <div className="card">
                      <div className="card-header">
                        <div className="card-title">
                          {lang === "ar" ? "الميزانية مقابل الفعلي" : "Budget vs Actual"}
                        </div>
                      </div>
                      <div className="card-body">{renderBudgetItems()}</div>
                    </div>
                    <div className="card">
                      <div className="card-header">
                        <div className="card-title">
                          {lang === "ar" ? "تعديل الميزانية" : "Budget Adjustment"}
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-warn mb4">
                          <span>⚠️</span>
                          <span className="fs11">
                            {lang === "ar"
                              ? "بند المستلزمات الطبية يقترب من الحد الأقصى (91%)"
                              : "Medical Supplies line approaching limit (91%)"}
                          </span>
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            {lang === "ar" ? "البند" : "Budget Line"}
                          </label>
                          <select className="form-control">
                            <option>{lang === "ar" ? "الرواتب" : "Salaries"}</option>
                            <option>
                              {lang === "ar" ? "المستلزمات الطبية" : "Medical Supplies"}
                            </option>
                            <option>{lang === "ar" ? "الصيانة" : "Maintenance"}</option>
                            <option>{lang === "ar" ? "التسويق" : "Marketing"}</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            {lang === "ar" ? "مبلغ التعديل (د.ع)" : "Adjustment Amount (IQD)"}
                          </label>
                          <input type="number" className="form-control" placeholder="0" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            {lang === "ar" ? "سبب التعديل" : "Reason"}
                          </label>
                          <textarea className="form-control" rows={2} placeholder="..." />
                        </div>
                        <button
                          className="btn btn-primary btn-block"
                          onClick={saveBudgetAdjustment}
                        >
                          <span>
                            💾 {lang === "ar" ? "حفظ التعديل" : "Save Adjustment"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePage === "reports" && (
              <div className="page active">
                <div className="content">
                  <div className="stabs">
                    <button
                      className={`stab ${reportTab === "pl" ? "active" : ""}`}
                      onClick={() => setReportTab("pl")}
                    >
                      {lang === "ar" ? "الأرباح والخسائر" : "P&L"}
                    </button>
                    <button
                      className={`stab ${reportTab === "bs" ? "active" : ""}`}
                      onClick={() => setReportTab("bs")}
                    >
                      {lang === "ar" ? "الميزانية العمومية" : "Balance Sheet"}
                    </button>
                    <button
                      className={`stab ${reportTab === "cf" ? "active" : ""}`}
                      onClick={() => setReportTab("cf")}
                    >
                      {lang === "ar" ? "التدفق النقدي" : "Cash Flow"}
                    </button>
                  </div>

                  {reportTab === "pl" && (
                    <div className="card mb6">
                      <div className="card-header">
                        <div>
                          <div className="card-title">
                            {lang === "ar" ? "بيان الأرباح والخسائر" : "Profit & Loss Statement"}
                          </div>
                          <div className="card-subtitle">
                            {lang === "ar" ? "أبريل 2026" : "April 2026"}
                          </div>
                        </div>
                        <button className="btn btn-blue btn-sm">
                          <span>📥</span>
                          <span>{lang === "ar" ? "تحميل PDF" : "Download PDF"}</span>
                        </button>
                      </div>
                      <div className="card-body">{renderPL()}</div>
                    </div>
                  )}

                  {reportTab === "bs" && (
                    <div className="card mb6">
                      <div className="card-header">
                        <div className="card-title">
                          {lang === "ar" ? "الميزانية العمومية" : "Balance Sheet"}
                        </div>
                        <button className="btn btn-blue btn-sm">
                          <span>📥</span>
                          <span>{lang === "ar" ? "تحميل PDF" : "Download PDF"}</span>
                        </button>
                      </div>
                      <div className="card-body">{renderBS()}</div>
                    </div>
                  )}

                  {reportTab === "cf" && (
                    <div className="card mb6">
                      <div className="card-header">
                        <div className="card-title">
                          {lang === "ar" ? "قائمة التدفق النقدي" : "Cash Flow Statement"}
                        </div>
                        <button className="btn btn-blue btn-sm">
                          <span>📥</span>
                          <span>{lang === "ar" ? "تحميل PDF" : "Download PDF"}</span>
                        </button>
                      </div>
                      <div className="card-body">{renderCF()}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activePage === "vendors" && (
              <div className="page active">
                <div className="content">
                  <div className="g3 mb6">
                    <div className="stat-card ca">
                      <div className="stat-icon ia">🤝</div>
                      <div className="stat-val">24</div>
                      <div className="stat-lbl">
                        {lang === "ar" ? "عدد الموردين" : "Total Vendors"}
                      </div>
                      <div className="stat-chg sup">
                        +3 <span>{lang === "ar" ? "هذا الشهر" : "this month"}</span>
                      </div>
                    </div>
                    <div className="stat-card cr">
                      <div className="stat-icon ir">💳</div>
                      <div className="stat-val">31.2M</div>
                      <div className="stat-lbl">
                        {lang === "ar" ? "المستحقات للموردين" : "Payables (IQD)"}
                      </div>
                      <div className="stat-chg sdn">▲ +4.1%</div>
                    </div>
                    <div className="stat-card cg">
                      <div className="stat-icon ig">📦</div>
                      <div className="stat-val">18</div>
                      <div className="stat-lbl">
                        {lang === "ar" ? "طلبات نشطة" : "Active Orders"}
                      </div>
                      <div className="stat-chg snu">
                        <span>{lang === "ar" ? "قيد التسليم" : "in delivery"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="g32 mb6">
                    <div className="card">
                      <div className="card-header">
                        <div className="card-title">
                          {lang === "ar" ? "قائمة الموردين" : "Vendor Directory"}
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => openModal("modal-vendor")}>
                          <span>+</span>
                          <span>{lang === "ar" ? "مورد جديد" : "Add Vendor"}</span>
                        </button>
                      </div>
                      <div className="card-body">{renderVendorList()}</div>
                    </div>
                    <div className="card">
                      <div className="card-header">
                        <div className="card-title">
                          {lang === "ar" ? "جدولة المدفوعات" : "Payment Schedule"}
                        </div>
                      </div>
                      <div className="card-body">{renderPaymentSched()}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom nav (mobile) */}
        <nav className="bottom-nav">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              className={`bn-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => gotoPage(item.id)}
            >
              <div className="bn-icon-wrap">
                <span className="bn-icon">{item.icon}</span>
                {item.badge && <span className="bn-badge">{item.badge}</span>}
              </div>
              <span className="bn-text">{lang === "ar" ? item.labelAr : item.labelEn}</span>
            </button>
          ))}
        </nav>

        {/* Toast */}
        {toast.show && (
          <div id="toast" style={{ display: "block" }}>
            <div
              id="toast-inner"
              style={{
                borderColor:
                  toast.type === "success"
                    ? "rgba(46,204,113,0.3)"
                    : toast.type === "error"
                    ? "rgba(231,76,60,0.3)"
                    : "rgba(246,173,85,0.3)",
              }}
            >
              {toast.message}
            </div>
          </div>
        )}

        {/* Modals */}
        {/* Add Transaction Modal */}
        <div className={`modal-backdrop ${modalOpen === "modal-add-tx" ? "open" : ""}`} onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {lang === "ar" ? "قيد مالي جديد" : "New Financial Entry"}
              </div>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  {lang === "ar" ? "نوع القيد" : "Entry Type"} <span className="req">*</span>
                </label>
                <select className="form-control">
                  <option>{lang === "ar" ? "إيراد" : "Revenue"}</option>
                  <option>{lang === "ar" ? "مصروف" : "Expense"}</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    {lang === "ar" ? "المبلغ (د.ع)" : "Amount (IQD)"}{" "}
                    <span className="req">*</span>
                  </label>
                  <input type="number" className="form-control" placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    {lang === "ar" ? "التاريخ" : "Date"} <span className="req">*</span>
                  </label>
                  <input type="date" className="form-control" defaultValue="2026-04-14" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {lang === "ar" ? "الفئة" : "Category"} <span className="req">*</span>
                </label>
                <select className="form-control">
                  <option>{lang === "ar" ? "رواتب وأجور" : "Salaries"}</option>
                  <option>{lang === "ar" ? "مستلزمات طبية" : "Medical Supplies"}</option>
                  <option>{lang === "ar" ? "صيانة" : "Maintenance"}</option>
                  <option>{lang === "ar" ? "إيراد عيادة" : "Clinic Revenue"}</option>
                  <option>{lang === "ar" ? "إيراد مختبر" : "Lab Revenue"}</option>
                  <option>{lang === "ar" ? "إيراد صيدلية" : "Pharmacy Revenue"}</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{lang === "ar" ? "الوصف" : "Description"}</label>
                <textarea className="form-control" rows={2} placeholder="..." />
              </div>
              <div className="form-group">
                <label className="form-label">{lang === "ar" ? "المرفقات" : "Attachments"}</label>
                <div
                  style={{
                    border: "1px dashed var(--border2)",
                    borderRadius: "var(--rsm)",
                    padding: "20px",
                    textAlign: "center",
                    color: "var(--muted2)",
                    fontSize: "12px",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "6px" }}>📎</div>
                  <span>
                    {lang === "ar"
                      ? "انقر لرفع الملف أو اسحب هنا"
                      : "Click to upload or drag here"}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button className="btn btn-primary" onClick={saveTransaction}>
                <span>💾 {lang === "ar" ? "حفظ القيد" : "Save Entry"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Add Expense Modal */}
        <div className={`modal-backdrop ${modalOpen === "modal-add-exp" ? "open" : ""}`} onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {lang === "ar" ? "تسجيل مصروف" : "Register Expense"}
              </div>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    {lang === "ar" ? "المورد" : "Vendor"} <span className="req">*</span>
                  </label>
                  <select className="form-control">
                    <option>
                      {lang === "ar" ? "شركة الأدوية الوطنية" : "National Pharma Co."}
                    </option>
                    <option>
                      {lang === "ar" ? "مركز التجهيزات الطبية" : "Medical Equipment Center"}
                    </option>
                    <option>{lang === "ar" ? "مزود الكهرباء" : "Electricity Provider"}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    {lang === "ar" ? "المبلغ (د.ع)" : "Amount (IQD)"}{" "}
                    <span className="req">*</span>
                  </label>
                  <input type="number" className="form-control" placeholder="0" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{lang === "ar" ? "التاريخ" : "Date"}</label>
                  <input type="date" className="form-control" defaultValue="2026-04-14" />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === "ar" ? "الفئة" : "Category"}</label>
                  <select className="form-control">
                    <option>{lang === "ar" ? "مستلزمات طبية" : "Medical Supplies"}</option>
                    <option>{lang === "ar" ? "صيانة" : "Maintenance"}</option>
                    <option>{lang === "ar" ? "مرافق" : "Utilities"}</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{lang === "ar" ? "رقم الفاتورة" : "Invoice #"}</label>
                <input type="text" className="form-control" placeholder="INV-2026-..." />
              </div>
              <div className="form-group">
                <label className="form-label">{lang === "ar" ? "طريقة الدفع" : "Payment Method"}</label>
                <select className="form-control">
                  <option>{lang === "ar" ? "تحويل بنكي" : "Bank Transfer"}</option>
                  <option>{lang === "ar" ? "نقدي" : "Cash"}</option>
                  <option>{lang === "ar" ? "شيك" : "Cheque"}</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button className="btn btn-danger" onClick={saveExpense}>
                <span>💸 {lang === "ar" ? "تسجيل المصروف" : "Save Expense"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* New Invoice Modal */}
        <div className={`modal-backdrop ${modalOpen === "modal-new-inv" ? "open" : ""}`} onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {lang === "ar" ? "فاتورة جديدة" : "New Invoice"}
              </div>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    {lang === "ar" ? "العميل / المريض" : "Client / Patient"}{" "}
                    <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={lang === "ar" ? "اسم المريض" : "Patient name"}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === "ar" ? "تاريخ الفاتورة" : "Invoice Date"}</label>
                  <input type="date" className="form-control" defaultValue="2026-04-14" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{lang === "ar" ? "تاريخ الاستحقاق" : "Due Date"}</label>
                  <input type="date" className="form-control" defaultValue="2026-04-21" />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === "ar" ? "الخدمة" : "Service"}</label>
                  <select className="form-control">
                    <option>{lang === "ar" ? "كشف طبي" : "Medical Consultation"}</option>
                    <option>{lang === "ar" ? "تحاليل مختبرية" : "Lab Tests"}</option>
                    <option>{lang === "ar" ? "أشعة" : "Radiology"}</option>
                    <option>{lang === "ar" ? "عملية جراحية" : "Surgery"}</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    {lang === "ar" ? "المبلغ (د.ع)" : "Amount (IQD)"}{" "}
                    <span className="req">*</span>
                  </label>
                  <input type="number" className="form-control" placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    {lang === "ar" ? "نسبة التأمين %" : "Insurance %"}
                  </label>
                  <input type="number" className="form-control" placeholder="0" min="0" max="100" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{lang === "ar" ? "ملاحظات" : "Notes"}</label>
                <textarea className="form-control" rows={2} placeholder="..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button className="btn btn-primary" onClick={saveInvoice}>
                <span>📄 {lang === "ar" ? "إصدار الفاتورة" : "Issue Invoice"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Insurance Claim Modal */}
        <div className={`modal-backdrop ${modalOpen === "modal-claim" ? "open" : ""}`} onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {lang === "ar" ? "مطالبة تأمين جديدة" : "New Insurance Claim"}
              </div>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  {lang === "ar" ? "شركة التأمين" : "Insurance Company"}{" "}
                  <span className="req">*</span>
                </label>
                <select className="form-control">
                  <option>{lang === "ar" ? "التأمين الوطني" : "National Insurance"}</option>
                  <option>{lang === "ar" ? "العراق للتأمين" : "Iraq Insurance"}</option>
                  <option>{lang === "ar" ? "الرافدين للتأمين" : "Al-Rafidain Insurance"}</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    {lang === "ar" ? "رقم الوثيقة" : "Policy Number"}{" "}
                    <span className="req">*</span>
                  </label>
                  <input type="text" className="form-control" placeholder="POL-..." />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    {lang === "ar" ? "مبلغ المطالبة (د.ع)" : "Claim Amount (IQD)"}{" "}
                    <span className="req">*</span>
                  </label>
                  <input type="number" className="form-control" placeholder="0" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{lang === "ar" ? "وصف الحالة" : "Case Description"}</label>
                <textarea className="form-control" rows={2} placeholder="..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button className="btn btn-blue" onClick={saveClaim}>
                <span>🏛️ {lang === "ar" ? "تقديم المطالبة" : "Submit Claim"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Vendor Modal */}
        <div className={`modal-backdrop ${modalOpen === "modal-vendor" ? "open" : ""}`} onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {lang === "ar" ? "إضافة مورد جديد" : "Add New Vendor"}
              </div>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  {lang === "ar" ? "اسم المورد" : "Vendor Name"} <span className="req">*</span>
                </label>
                <input type="text" className="form-control" placeholder="..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{lang === "ar" ? "الفئة" : "Category"}</label>
                  <select className="form-control">
                    <option>{lang === "ar" ? "أدوية" : "Pharmaceuticals"}</option>
                    <option>{lang === "ar" ? "تجهيزات طبية" : "Medical Equipment"}</option>
                    <option>{lang === "ar" ? "مرافق" : "Utilities"}</option>
                    <option>{lang === "ar" ? "خدمات" : "Services"}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === "ar" ? "شروط الدفع" : "Payment Terms"}</label>
                  <select className="form-control">
                    <option>Net 30</option>
                    <option>Net 60</option>
                    <option>{lang === "ar" ? "فوري" : "Immediate"}</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{lang === "ar" ? "رقم التواصل" : "Contact Number"}</label>
                <input type="tel" className="form-control" placeholder="+964 ..." />
              </div>
              <div className="form-group">
                <label className="form-label">{lang === "ar" ? "البريد الإلكتروني" : "Email"}</label>
                <input type="email" className="form-control" placeholder="vendor@..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button className="btn btn-primary" onClick={saveVendor}>
                <span>💾 {lang === "ar" ? "إضافة المورد" : "Add Vendor"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Report Export Modal */}
        <div className={`modal-backdrop ${modalOpen === "modal-report" ? "open" : ""}`} onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {lang === "ar" ? "تصدير التقرير المالي" : "Export Financial Report"}
              </div>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">{lang === "ar" ? "نوع التقرير" : "Report Type"}</label>
                <select className="form-control">
                  <option>{lang === "ar" ? "أرباح وخسائر" : "P&L Statement"}</option>
                  <option>{lang === "ar" ? "ميزانية عمومية" : "Balance Sheet"}</option>
                  <option>{lang === "ar" ? "تدفق نقدي" : "Cash Flow"}</option>
                  <option>{lang === "ar" ? "ملخص شامل" : "Full Summary"}</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{lang === "ar" ? "من تاريخ" : "From Date"}</label>
                  <input type="date" className="form-control" defaultValue="2026-04-01" />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === "ar" ? "إلى تاريخ" : "To Date"}</label>
                  <input type="date" className="form-control" defaultValue="2026-04-30" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{lang === "ar" ? "صيغة الملف" : "File Format"}</label>
                <div className="lang-toggle" style={{ margin: 0 }}>
                  <button className="lang-btn active">PDF</button>
                  <button className="lang-btn">Excel</button>
                  <button className="lang-btn">CSV</button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button className="btn btn-primary" onClick={exportReport}>
                <span>📤 {lang === "ar" ? "تصدير الآن" : "Export Now"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}