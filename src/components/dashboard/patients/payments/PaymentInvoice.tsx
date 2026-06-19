"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/date-utils";

interface PaymentInvoiceProps {
  patientName: string;
  tenantName: string;
  iconOnly?: boolean;
  payment: {
    id: string;
    amount: number;
    category: string;
    date: string;
    description: string;
    serviceName: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  CONSULTATION: "كشف",
  MEDICATIONS: "أدوية",
  SERVICES: "خدمات",
  OTHER: "أخرى",
};

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function PaymentInvoice({ patientName, tenantName, payment, iconOnly }: PaymentInvoiceProps) {
  const invoiceRef = payment.id.slice(0, 8).toUpperCase();
  const year = new Date(payment.date).getFullYear();
  const invoiceNumber = `INV-${year}-${invoiceRef}`;
  const esc = escapeHtml;
  const today = new Date().toLocaleDateString("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function handlePrint() {
    const printContent = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>فاتورة - ${esc(patientName)}</title>
  <style>
    @page{size:A4 portrait;margin:12mm 10mm}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI','Tajawal',sans-serif;line-height:1.8;color:#1e293b;background:#fff}
    .invoice{max-width:210mm;margin:0 auto;padding:10px}
    .header{text-align:center;border-bottom:2px solid #0d9488;padding-bottom:20px;margin-bottom:25px}
    .clinic-name{font-size:22px;font-weight:800;color:#0f766e;letter-spacing:1px}
    .invoice-title{font-size:18px;font-weight:700;color:#475569;margin-top:8px}
    .invoice-number{font-size:13px;color:#94a3b8;margin-top:4px}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
    .info-box{background:#f0fdfa;padding:14px 16px;border-radius:8px;border:1px solid #ccfbf1}
    .info-label{font-size:11px;font-weight:700;color:#0f766e;text-transform:uppercase;letter-spacing:1px}
    .info-value{font-size:15px;font-weight:600;color:#1e293b;margin-top:4px}
    .amount-box{background:#ecfdf5;padding:16px;border-radius:8px;border:1px solid #a7f3d0;text-align:center;margin-bottom:20px}
    .amount-label{font-size:12px;font-weight:700;color:#065f46;text-transform:uppercase;letter-spacing:1px}
    .amount-value{font-size:32px;font-weight:800;color:#047857;margin-top:8px}
    .details-box{background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:20px}
    .details-title{font-size:14px;font-weight:700;color:#334155;margin-bottom:12px;border-bottom:1px solid #e2e8f0;padding-bottom:8px}
    .detail-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dotted #e2e8f0;font-size:14px}
    .detail-row:last-child{border-bottom:none}
    .detail-key{font-weight:600;color:#64748b}
    .detail-val{font-weight:500;color:#1e293b}
    .timestamps{font-size:11px;color:#94a3b8;text-align:center;margin-top:16px}
    .footer{border-top:1px solid #e2e8f0;margin-top:24px;padding-top:16px;text-align:center;font-size:12px;color:#94a3b8}
    .footer p{margin-bottom:4px}
    @media print{
      body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="clinic-name">${esc(tenantName)}</div>
      <div class="invoice-title">فاتورة دفع</div>
      <div class="invoice-number">${esc(invoiceNumber)}</div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">المريض</div>
        <div class="info-value">${esc(patientName)}</div>
      </div>
      <div class="info-box">
        <div class="info-label">التاريخ</div>
        <div class="info-value">${esc(formatDate(payment.date))}</div>
      </div>
    </div>

    <div class="amount-box">
      <div class="amount-label">المبلغ المدفوع</div>
      <div class="amount-value">${formatCurrency(payment.amount)}</div>
    </div>

    <div class="details-box">
      <div class="details-title">تفاصيل الدفعة</div>
      <div class="detail-row">
        <span class="detail-key">الفئة</span>
        <span class="detail-val">${CATEGORY_LABELS[payment.category] ?? payment.category}</span>
      </div>
      ${payment.serviceName ? `<div class="detail-row"><span class="detail-key">الخدمة</span><span class="detail-val">${esc(payment.serviceName)}</span></div>` : ""}
      ${payment.description ? `<div class="detail-row"><span class="detail-key">الوصف</span><span class="detail-val">${esc(payment.description)}</span></div>` : ""}
    </div>

    <div class="timestamps">
      تاريخ التسجيل: ${esc(formatDateTime(payment.createdAt))}
      ${payment.updatedAt !== payment.createdAt ? ` · آخر تحديث: ${esc(formatDateTime(payment.updatedAt))}` : ""}
    </div>

    <div class="footer">
      <p>تم إنشاء هذه الفاتورة إلكترونياً عبر نظام ميدكو لإدارة العيادات</p>
      <p>${today}</p>
    </div>
  </div>
</body>
</html>`;

    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:-9999px;left:0;width:210mm;height:297mm;border:none";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }
    doc.open();
    doc.write(printContent);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 400);
  }

  return iconOnly ? (
    <button
      onClick={handlePrint}
      className="p-1.5 rounded-md text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
      title="طباعة الفاتورة"
    >
      <Printer className="w-3.5 h-3.5" />
    </button>
  ) : (
    <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
      <Printer className="w-4 h-4" />
      طباعة الفاتورة
    </Button>
  );
}
