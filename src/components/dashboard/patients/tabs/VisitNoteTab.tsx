"use client";

import React, { useState, useEffect } from "react";
import { Plus, Download, Trash2, Calendar, Pill, AlertCircle, Loader2, Printer, ChevronDown, Shield, FileText, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface VisitNote {
  id: string;
  appointmentId?: string;
  content?: string;
  diagnosis?: string;
  medications: Medication[];
  notes?: string;
  validityDays?: number;
  createdAt: string;
}

interface VisitNoteTabProps {
  patientId: string;
  patientName: string;
}

interface ClinicInfo {
  name: string;
  specialty: string | null;
  phone: string | null;
  address: string | null;
}

export function VisitNoteTab({ patientId, patientName }: VisitNoteTabProps) {
  const [visitNotes, setVisitNotes] = useState<VisitNote[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [doctorName, setDoctorName] = useState("");
  const [formData, setFormData] = useState({
    appointmentId: "",
    content: "",
    diagnosis: "",
    medications: [{ id: "1", name: "", dose: "", frequency: "", duration: "", instructions: "" }] as Medication[],
    notes: "",
    validityDays: 30,
  });

  useEffect(() => {
    loadVisitNotes();
    loadClinicInfo();
  }, [patientId]);

  const loadClinicInfo = async () => {
    try {
      const [tenantRes, doctorsRes] = await Promise.all([
        fetch("/api/tenant"),
        fetch("/api/doctors"),
      ]);
      if (tenantRes.ok) {
        const tenant = await tenantRes.json();
        setClinicInfo({
          name: tenant.name,
          specialty: tenant.specialty,
          phone: tenant.phone,
          address: tenant.address,
        });
      }
      if (doctorsRes.ok) {
        const doctors = await doctorsRes.json();
        if (doctors.length > 0) {
          setDoctorName(doctors[0].name);
        }
      }
    } catch {
      // Silent fail
    }
  };

  const loadVisitNotes = async () => {
    try {
      setIsLoadingNotes(true);
      const response = await fetch(`/api/patients/${patientId}/visit-notes`);
      if (!response.ok) throw new Error("Failed to load visit notes");
      const data = await response.json();
      setVisitNotes(data);
    } catch (error) {
      console.error("Error loading visit notes:", error);
      toast.error("فشل تحميل ملاحظات الزيارة");
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleAddMedication = () => {
    setFormData({
      ...formData,
      medications: [
        ...formData.medications,
        { id: Date.now().toString(), name: "", dose: "", frequency: "", duration: "", instructions: "" },
      ],
    });
  };

  const handleRemoveMedication = (id: string) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter((m) => m.id !== id),
    });
  };

  const handleMedicationChange = (id: string, field: keyof Medication, value: string) => {
    setFormData({
      ...formData,
      medications: formData.medications.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    });
  };

  const handleSave = async () => {
    try {
      const hasContent = formData.content.trim();
      const hasDiagnosis = formData.diagnosis.trim();
      const hasMedications = formData.medications.some((m) => m.name.trim());

      if (!hasContent && !hasDiagnosis && !hasMedications) {
        toast.error("يجب إدخال ملاحظات أو تشخيص أو دواء واحد على الأقل");
        return;
      }

      if (hasMedications && formData.medications.some((m) => m.name.trim() && (!m.dose.trim() || !m.frequency.trim() || !m.duration.trim()))) {
        toast.error("جميع حقول الدواء مطلوبة");
        return;
      }

      setIsLoading(true);

      const body: any = {
        appointmentId: formData.appointmentId || undefined,
        content: formData.content || undefined,
        diagnosis: formData.diagnosis || undefined,
        medications: formData.medications.filter((m) => m.name.trim()).map(({ id, ...rest }) => rest),
        notes: formData.notes || undefined,
        validityDays: formData.validityDays,
      };

      const response = await fetch(`/api/patients/${patientId}/visit-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save visit note");
      }

      toast.success("تم حفظ ملاحظة الزيارة بنجاح");
      await loadVisitNotes();
      setFormData({
        appointmentId: "",
        content: "",
        diagnosis: "",
        medications: [{ id: "1", name: "", dose: "", frequency: "", duration: "", instructions: "" }],
        notes: "",
        validityDays: 30,
      });
      setShowNewForm(false);
    } catch (error) {
      console.error("Error saving visit note:", error);
      toast.error(error instanceof Error ? error.message : "فشل حفظ الملاحظة");
    } finally {
      setIsLoading(false);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(null);
      setIsLoading(true);
      const response = await fetch(`/api/patients/${patientId}/visit-notes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete visit note");

      toast.success("تم حذف ملاحظة الزيارة بنجاح");
      await loadVisitNotes();
    } catch (error) {
      console.error("Error deleting visit note:", error);
      toast.error("فشل حذف الملاحظة");
    } finally {
      setIsLoading(false);
    }
  };

  const escapeHtml = (unsafe: string) => {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
  }

  const handlePrint = (note: VisitNote) => {
    const clinicName = clinicInfo?.name || "عيادة";
    const doctor = doctorName || "الطبيب المعالج";
    const specialty = clinicInfo?.specialty || "";
    const today = new Date().toLocaleDateString("ar-SA");

    const esc = escapeHtml;
    const createdDate = new Date(note.createdAt).toLocaleDateString("ar-SA");
    const now = new Date().toLocaleString("ar-SA");
    const hasMeds = note.medications && note.medications.length > 0;
    const medRows = hasMeds ? note.medications.map((med, idx) =>
      `<tr><td>${idx + 1}</td><td class="med-name-cell">${esc(med.name)}</td><td>${esc(med.dose)}</td><td>${esc(med.frequency)}</td><td>${esc(med.duration)}</td>${med.instructions ? `<td>${esc(med.instructions)}</td>` : ""}</tr>`
    ).join("") : "";
    const hasInstructions = hasMeds && note.medications.some(m => m.instructions);

    const printContent = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><title>ملاحظة زيارة - ${esc(patientName)}</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
<style>@page{size:A4 portrait;margin:12mm 10mm}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Tajawal','Amiri',sans-serif;line-height:1.7;color:#1e293b;background:#fff}.prescription{max-width:210mm;margin:0 auto;padding:10px}.watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%)rotate(-30deg);font-size:80px;opacity:.04;color:#1e40af;font-weight:bold;pointer-events:none;z-index:0}.header{text-align:center;border-bottom:3px double #1e40af;padding-bottom:20px;margin-bottom:25px}.clinic-name{font-size:26px;font-weight:800;color:#1e40af;letter-spacing:1px}.clinic-details{font-size:13px;color:#64748b;margin-top:5px}.doctor-line{text-align:left;font-size:13px;color:#475569;margin-bottom:20px}.patient-info{background:#f8fafc;padding:15px 20px;border-radius:8px;margin-bottom:20px;border:1px solid #e2e8f0}.patient-info table{width:100%;border-collapse:collapse}.patient-info td{padding:4px 8px;font-size:14px}.patient-info td:first-child{font-weight:600;color:#475569;width:100px}.patient-info td:last-child{color:#1e293b}.diagnosis-box{background:#eff6ff;padding:15px 20px;border-right:5px solid #2563eb;margin:20px 0;border-radius:4px}.diagnosis-label{font-weight:700;color:#1e40af;font-size:14px;margin-bottom:5px}.diagnosis-text{color:#1e293b;font-size:15px}.notes-box{background:#fffbeb;padding:15px 20px;border-right:5px solid #d97706;border-radius:4px;margin-top:20px}.notes-label{font-weight:700;color:#b45309;font-size:13px;margin-bottom:4px}.medications{margin:20px 0}.medications-title{font-size:16px;font-weight:700;color:#1e293b;margin-bottom:12px;border-bottom:2px solid #e2e8f0;padding-bottom:8px}.med-table{width:100%;border-collapse:collapse}.med-table th{background:#1e40af;color:#fff;padding:10px 12px;font-size:13px;text-align:center;font-weight:600}.med-table td{padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:14px}.med-table tr:last-child td{border-bottom:none}.med-table tr:nth-child(even) td{background:#f8fafc}.med-name-cell{font-weight:600;color:#0f172a}.content-box{background:#f0fdf4;padding:15px 20px;border-right:5px solid #059669;border-radius:4px;margin:20px 0}.content-label{font-weight:700;color:#047857;font-size:14px;margin-bottom:5px}.content-text{color:#1e293b;font-size:14px;line-height:1.8}.validity{text-align:center;font-size:13px;color:#64748b;margin:25px 0 10px;padding:10px;border:1px dashed #cbd5e1;border-radius:8px}.signature{display:flex;justify-content:space-between;margin-top:40px}.signature-box{text-align:center}.signature-line{margin-top:40px;border-top:1px solid #1e293b;width:180px;display:inline-block;font-size:12px;color:#64748b;padding-top:4px}.footer{text-align:center;margin-top:50px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:15px}.footer p{margin:2px 0}</style>
</head>
<body>
<div class="watermark">${esc(clinicName)}</div>
<div class="prescription">
<div class="header"><div class="clinic-name">${esc(clinicName)}</div><div class="clinic-details">${specialty ? `<span>${esc(specialty)}</span> &middot; ` : ""}<span>${today}</span></div></div>
<div class="doctor-line">الطبيب: ${esc(doctor)}</div>
<div class="patient-info"><table><tr><td>اسم المريض:</td><td>${esc(patientName)}</td></tr><tr><td>التاريخ:</td><td>${createdDate}</td></tr><tr><td>رقم الملاحظة:</td><td>#${esc(note.id.slice(0, 8))}</td></tr></table></div>
${note.content ? `<div class="content-box"><div class="content-label">ملاحظات الزيارة</div><div class="content-text">${esc(note.content)}</div></div>` : ""}
${note.diagnosis ? `<div class="diagnosis-box"><div class="diagnosis-label">التشخيص</div><div class="diagnosis-text">${esc(note.diagnosis)}</div></div>` : ""}
${hasMeds ? `<div class="medications"><div class="medications-title">الأدوية الموصوفة</div><table class="med-table"><thead><tr><th>#</th><th>اسم الدواء</th><th>الجرعة</th><th>التكرار</th><th>المدة</th>${hasInstructions ? "<th>تعليمات</th>" : ""}</tr></thead><tbody>${medRows}</tbody></table></div>` : ""}
${note.notes ? `<div class="notes-box"><div class="notes-label">ملاحظات إضافية</div><div>${esc(note.notes)}</div></div>` : ""}
${note.validityDays && hasMeds ? `<div class="validity">صالحة لمدة ${note.validityDays} يوماً من تاريخ الإصدار</div>` : ""}
<div class="signature"><div class="signature-box"><div class="signature-line">ختم العيادة</div></div><div class="signature-box"><div class="signature-line">توقيع الطبيب</div></div></div>
<div class="footer"><p>تم إنشاء هذه الملاحظة إلكترونياً عبر نظام ميدكو لإدارة العيادات</p><p>${now}</p>${clinicInfo?.phone ? `<p>للاستفسار: ${esc(clinicInfo.phone)}${clinicInfo?.address ? ` &middot; ${esc(clinicInfo.address)}` : ""}</p>` : ""}</div>
</div>
</body>
</html>`;

    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:-9999px;left:0;width:210mm;height:297mm;border:none";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) { document.body.removeChild(iframe); return; }
    doc.open();
    doc.write(printContent);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 400);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("ar-SA");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-600" />
            ملاحظات الزيارة
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {visitNotes.length} ملاحظة مسجّلة
          </p>
        </div>
        <Button
          onClick={() => setShowNewForm(!showNewForm)}
          className="gap-2"
          size="sm"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4" />
          ملاحظة جديدة
        </Button>
      </div>

      {showNewForm && (
        <div className="bg-slate-50 rounded-xl p-6 space-y-4 border border-slate-200">
          {/* Content - free text clinical notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              ملاحظات الزيارة
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="أدخل ملاحظات الزيارة (الفحص، الأعراض، التوصيات...)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              التشخيص
            </label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="أدخل التشخيص الطبي"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
              rows={2}
              disabled={isLoading}
            />
          </div>

          {/* Medications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-slate-700">
                الأدوية
              </label>
              <Button
                onClick={handleAddMedication}
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={isLoading}
              >
                <Plus className="w-3 h-3" />
                إضافة دواء
              </Button>
            </div>

            <div className="space-y-3">
              {formData.medications.map((med, idx) => (
                <div
                  key={med.id}
                  className="bg-white p-4 rounded-lg border border-slate-200 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-slate-500">
                      الدواء {idx + 1}
                    </span>
                    {formData.medications.length > 1 && (
                      <button
                        onClick={() => handleRemoveMedication(med.id)}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="اسم الدواء"
                      value={med.name}
                      onChange={(e) => handleMedicationChange(med.id, "name", e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right text-sm disabled:opacity-50"
                      disabled={isLoading}
                    />
                    <input
                      type="text"
                      placeholder="الجرعة"
                      value={med.dose}
                      onChange={(e) => handleMedicationChange(med.id, "dose", e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right text-sm disabled:opacity-50"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="التكرار (مثل: 3 مرات يومياً)"
                      value={med.frequency}
                      onChange={(e) => handleMedicationChange(med.id, "frequency", e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right text-sm disabled:opacity-50"
                      disabled={isLoading}
                    />
                    <input
                      type="text"
                      placeholder="المدة (مثل: 7 أيام)"
                      value={med.duration}
                      onChange={(e) => handleMedicationChange(med.id, "duration", e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right text-sm disabled:opacity-50"
                      disabled={isLoading}
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="تعليمات إضافية (اختياري)"
                    value={med.instructions || ""}
                    onChange={(e) => handleMedicationChange(med.id, "instructions", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right text-sm disabled:opacity-50"
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Extra Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              ملاحظات إضافية
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="ملاحظات إضافية (اختياري)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right disabled:opacity-50"
              rows={2}
              disabled={isLoading}
            />
          </div>

          {/* Validity (shown when there are medications) */}
          {formData.medications.some((m) => m.name.trim()) && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                صلاحية الوصفة (بالأيام)
              </label>
              <input
                type="number"
                value={formData.validityDays}
                onChange={(e) =>
                  setFormData({ ...formData, validityDays: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right disabled:opacity-50"
                min="1"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              onClick={() => setShowNewForm(false)}
              variant="outline"
              className="gap-2"
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              className="gap-2"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              حفظ الملاحظة
            </Button>
          </div>
        </div>
      )}

      {isLoadingNotes ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : visitNotes.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Stethoscope className="w-12 h-12 mx-auto mb-2 opacity-40" />
          <p>لا توجد ملاحظات زيارة مسجّلة</p>
          <p className="text-sm mt-1">
            أنشئ ملاحظة جديدة لتوثيق الزيارة وتشخيص المريض ووصف الأدوية
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visitNotes.map((note) => {
            const isExpanded = expandedId === note.id;
            const isDeleting = deletingId === note.id;

            return (
              <div
                key={note.id}
                dir="rtl"
                className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-sm transition-all"
              >
                {/* Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : note.id)}
                  className="w-full bg-gradient-to-l from-emerald-700 to-emerald-600 px-5 py-3 flex items-center justify-between gap-3 text-right cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="bg-white/20 rounded-full p-1.5 shrink-0">
                      <Stethoscope className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-white text-sm leading-tight truncate">
                        {note.diagnosis || note.content?.slice(0, 60) || "ملاحظة زيارة"}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-emerald-100 text-[11px] flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(note.createdAt)}
                        </span>
                        {note.medications.length > 0 && (
                          <span className="text-emerald-200 text-[11px] bg-white/10 px-1.5 py-0.5 rounded">
                            <Pill className="w-3 h-3 inline me-1" />
                            {note.medications.length} دواء
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handlePrint(note); }}
                      className="bg-white/15 hover:bg-white/25 text-white rounded-lg p-1.5 transition-colors"
                      title="طباعة"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    {isDeleting ? (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                          className="bg-red-500 text-white rounded-lg px-2 py-1.5 text-[11px] font-bold transition-colors"
                          disabled={isLoading}
                        >
                          تأكيد
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                          className="bg-white/15 hover:bg-white/25 text-white rounded-lg px-2 py-1.5 text-[11px] transition-colors"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingId(note.id); }}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg p-1.5 transition-colors"
                        title="حذف"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className={`text-white/60 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 space-y-3">
                    {note.content && (
                      <div>
                        <h5 className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span className="w-1 h-3.5 bg-emerald-500 rounded-full inline-block shrink-0" />
                          ملاحظات الزيارة
                        </h5>
                        <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                        </div>
                      </div>
                    )}

                    {note.diagnosis && (
                      <div>
                        <h5 className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span className="w-1 h-3.5 bg-emerald-500 rounded-full inline-block shrink-0" />
                          التشخيص
                        </h5>
                        <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                          <p className="text-sm text-slate-700 leading-relaxed">{note.diagnosis}</p>
                        </div>
                      </div>
                    )}

                    {note.medications.length > 0 && (
                      <div>
                        <h5 className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span className="w-1 h-3.5 bg-emerald-500 rounded-full inline-block shrink-0" />
                          الأدوية الموصوفة
                        </h5>
                        <div className="bg-emerald-50/50 rounded-xl overflow-hidden border border-emerald-100">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-emerald-100">
                                <th className="text-right px-2.5 py-1.5 text-emerald-800 font-semibold text-[11px]">#</th>
                                <th className="text-right px-2.5 py-1.5 text-emerald-800 font-semibold text-[11px]">الدواء</th>
                                <th className="text-right px-2.5 py-1.5 text-emerald-800 font-semibold text-[11px]">الجرعة</th>
                                <th className="text-right px-2.5 py-1.5 text-emerald-800 font-semibold text-[11px]">التكرار</th>
                                <th className="text-right px-2.5 py-1.5 text-emerald-800 font-semibold text-[11px]">المدة</th>
                                {note.medications.some(m => m.instructions) && (
                                  <th className="text-right px-2.5 py-1.5 text-emerald-800 font-semibold text-[11px]">تعليمات</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {note.medications.map((med, idx) => (
                                <tr key={med.id} className="border-b border-emerald-50 last:border-b-0 hover:bg-emerald-50/50">
                                  <td className="px-2.5 py-2 text-slate-400 text-[11px] font-mono w-6">{idx + 1}</td>
                                  <td className="px-2.5 py-2 font-semibold text-slate-800 text-sm">{med.name}</td>
                                  <td className="px-2.5 py-2 text-slate-600 text-sm">{med.dose}</td>
                                  <td className="px-2.5 py-2 text-slate-600 text-sm">{med.frequency}</td>
                                  <td className="px-2.5 py-2 text-slate-600 text-sm">{med.duration}</td>
                                  {note.medications.some(m => m.instructions) && (
                                    <td className="px-2.5 py-2 text-slate-500 text-[11px]">{med.instructions || "—"}</td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {note.validityDays && note.medications.length > 0 && (
                      <div className="bg-emerald-50 rounded-lg px-3 py-2 text-xs text-emerald-700 font-medium flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" />
                        صالحة لمدة {note.validityDays} يوماً من تاريخ الإصدار
                      </div>
                    )}

                    {note.notes && (
                      <div className="bg-amber-50 border-r-4 border-amber-400 rounded-lg p-3">
                        <p className="text-[11px] font-semibold text-amber-800 mb-1">ملاحظات إضافية</p>
                        <p className="text-sm text-amber-950 leading-relaxed">{note.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
