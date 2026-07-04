"use client";

import React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface VisitNoteInvoiceProps {
  note: {
    id: string;
    createdAt: string;
    content: string | null;
    diagnosis: string | null;
    notes: string | null;
    validityDays: number | null;
    medications: {
      id: string;
      name: string;
      dose: string | null;
      frequency: string | null;
      duration: string | null;
      instructions: string | null;
    }[];
  };
  patientName: string;
  clinicName?: string;
  doctorName?: string;
  clinicSpecialty?: string | null;
  clinicPhone?: string | null;
  clinicAddress?: string | null;
  iconOnly?: boolean;
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function VisitNoteInvoice({
  note,
  patientName,
  clinicName = "عيادة",
  doctorName = "الطبيب المعالج",
  clinicSpecialty = "",
  clinicPhone,
  clinicAddress,
  iconOnly = false,
}: VisitNoteInvoiceProps) {
  const handlePrint = () => {
    const esc = escapeHtml;
    const today = new Date().toLocaleDateString("ar-SA");
    const createdDate = new Date(note.createdAt).toLocaleDateString("ar-SA");
    const now = new Date().toLocaleString("ar-SA");
    const hasMeds = note.medications && note.medications.length > 0;
    const medRows = hasMeds
      ? note.medications
          .map(
            (med, idx) =>
              `<tr><td>${idx + 1}</td><td class="med-name-cell">${esc(med.name)}</td><td>${esc(med.dose ?? "")}</td><td>${esc(med.frequency ?? "")}</td><td>${esc(med.duration ?? "")}</td>${med.instructions ? `<td>${esc(med.instructions)}</td>` : ""}</tr>`
          )
          .join("")
      : "";
    const hasInstructions = hasMeds && note.medications.some((m) => m.instructions);

    const printContent = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><title>ملاحظة زيارة - ${esc(patientName)}</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
<style>@page{size:A4 portrait;margin:12mm 10mm}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Tajawal','Amiri',sans-serif;line-height:1.7;color:#1e293b;background:#fff}.prescription{max-width:210mm;margin:0 auto;padding:10px}.watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%)rotate(-30deg);font-size:80px;opacity:.04;color:#1e40af;font-weight:bold;pointer-events:none;z-index:0}.header{text-align:center;border-bottom:3px double #1e40af;padding-bottom:20px;margin-bottom:25px}.clinic-name{font-size:26px;font-weight:800;color:#1e40af;letter-spacing:1px}.clinic-details{font-size:13px;color:#64748b;margin-top:5px}.doctor-line{text-align:left;font-size:13px;color:#475569;margin-bottom:20px}.patient-info{background:#f8fafc;padding:15px 20px;border-radius:8px;margin-bottom:20px;border:1px solid #e2e8f0}.patient-info table{width:100%;border-collapse:collapse}.patient-info td{padding:4px 8px;font-size:14px}.patient-info td:first-child{font-weight:600;color:#475569;width:100px}.patient-info td:last-child{color:#1e293b}.content-box{background:#f0fdf4;padding:15px 20px;border-right:5px solid #16a34a;margin:20px 0;border-radius:4px}.content-label{font-weight:700;color:#166534;font-size:14px;margin-bottom:5px}.content-text{color:#1e293b;font-size:15px;white-space:pre-wrap}.diagnosis-box{background:#eff6ff;padding:15px 20px;border-right:5px solid #2563eb;margin:20px 0;border-radius:4px}.diagnosis-label{font-weight:700;color:#1e40af;font-size:14px;margin-bottom:5px}.diagnosis-text{color:#1e293b;font-size:15px}.notes-box{background:#fffbeb;padding:15px 20px;border-right:5px solid #d97706;border-radius:4px;margin-top:20px}.notes-label{font-weight:700;color:#b45309;font-size:13px;margin-bottom:4px}.medications{margin:20px 0}.medications-title{font-size:16px;font-weight:700;color:#1e293b;margin-bottom:12px;border-bottom:2px solid #e2e8f0;padding-bottom:8px}.med-table{width:100%;border-collapse:collapse}.med-table th{background:#1e40af;color:#fff;padding:10px 12px;font-size:13px;text-align:center;font-weight:600}.med-table td{padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:14px}.med-table tr:last-child td{border-bottom:none}.med-table tr:nth-child(even) td{background:#f8fafc}.med-name-cell{font-weight:600}.validity{text-align:center;margin-top:15px;font-size:12px;color:#64748b;font-weight:600}.signature{display:flex;justify-content:space-between;margin-top:50px;gap:40px}.signature-box{flex:1;text-align:center}.signature-line{border-bottom:1px solid #94a3b8;padding-bottom:30px;font-size:12px;color:#94a3b8}.footer{text-align:center;margin-top:40px;padding-top:15px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;line-height:1.8}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style>
</head>
<body>
<div class="watermark">${esc(clinicName)}</div>
<div class="prescription">
<div class="header"><div class="clinic-name">${esc(clinicName)}</div><div class="clinic-details">${clinicSpecialty ? `<span>${esc(clinicSpecialty)}</span> &middot; ` : ""}<span>${today}</span></div></div>
<div class="doctor-line">الطبيب: ${esc(doctorName)}</div>
<div class="patient-info"><table><tr><td>اسم المريض:</td><td>${esc(patientName)}</td></tr><tr><td>التاريخ:</td><td>${createdDate}</td></tr><tr><td>رقم الملاحظة:</td><td>#${esc(note.id.slice(0, 8))}</td></tr></table></div>
${note.content ? `<div class="content-box"><div class="content-label">ملاحظات الزيارة</div><div class="content-text">${esc(note.content)}</div></div>` : ""}

${hasMeds ? `<div class="medications"><div class="medications-title">الأدوية الموصوفة</div><table class="med-table"><thead><tr><th>#</th><th>اسم الدواء</th><th>الجرعة</th><th>التكرار</th><th>المدة</th>${hasInstructions ? "<th>تعليمات</th>" : ""}</tr></thead><tbody>${medRows}</tbody></table></div>` : ""}
${note.notes ? `<div class="notes-box"><div class="notes-label">ملاحظات إضافية</div><div>${esc(note.notes)}</div></div>` : ""}
${note.validityDays && hasMeds ? `<div class="validity">صالحة لمدة ${note.validityDays} يوماً من تاريخ الإصدار</div>` : ""}
<div class="signature"><div class="signature-box"><div class="signature-line">ختم العيادة</div></div><div class="signature-box"><div class="signature-line">توقيع الطبيب</div></div></div>
<div class="footer"><p>تم إنشاء هذه الملاحظة إلكترونياً عبر نظام ميدكو لإدارة العيادات</p><p>${now}</p>${clinicPhone ? `<p>للاستفسار: ${esc(clinicPhone)}${clinicAddress ? ` &middot; ${esc(clinicAddress)}` : ""}</p>` : ""}</div>
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
  };

  if (iconOnly) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrint}
        title="طباعة"
      >
        <Printer className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
      <Printer className="w-4 h-4" />
      طباعة
    </Button>
  );
}
