"use client";

import React, { useState, useEffect } from "react";
import { Plus, Download, Trash2, Calendar, Pill, AlertCircle, Loader2, Printer, ChevronDown, Shield } from "lucide-react";
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

interface Prescription {
  id: string;
  diagnosis: string;
  medications: Medication[];
  notes?: string;
  validityDays?: number;
  createdAt: string;
}

interface PrescriptionTabProps {
  patientId: string;
  patientName: string;
}

interface ClinicInfo {
  name: string;
  specialty: string | null;
  phone: string | null;
  address: string | null;
}

export function PrescriptionTab({ patientId, patientName }: PrescriptionTabProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [doctorName, setDoctorName] = useState("");
  const [formData, setFormData] = useState({
    diagnosis: "",
    medications: [{ id: "1", name: "", dose: "", frequency: "", duration: "", instructions: "" }],
    notes: "",
    validityDays: 30,
  });

  useEffect(() => {
    loadPrescriptions();
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
      // Silent fail - print will still work without clinic info
    }
  };

  const loadPrescriptions = async () => {
    try {
      setIsLoadingPrescriptions(true);
      const response = await fetch(`/api/patients/${patientId}/prescriptions`);
      if (!response.ok) throw new Error("Failed to load prescriptions");
      const data = await response.json();
      setPrescriptions(data);
    } catch (error) {
      console.error("Error loading prescriptions:", error);
      toast.error("فشل تحميل الوصفات الطبية");
    } finally {
      setIsLoadingPrescriptions(false);
    }
  };

  const handleAddMedication = () => {
    setFormData({
      ...formData,
      medications: [
        ...formData.medications,
        {
          id: Date.now().toString(),
          name: "",
          dose: "",
          frequency: "",
          duration: "",
          instructions: "",
        },
      ],
    });
  };

  const handleRemoveMedication = (id: string) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter((m) => m.id !== id),
    });
  };

  const handleMedicationChange = (
    id: string,
    field: keyof Medication,
    value: string
  ) => {
    setFormData({
      ...formData,
      medications: formData.medications.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    });
  };

  const handleSavePrescription = async () => {
    try {
      if (!formData.diagnosis.trim()) {
        toast.error("التشخيص مطلوب");
        return;
      }

      if (formData.medications.some((m) => !m.name.trim() || !m.dose.trim() || !m.frequency.trim() || !m.duration.trim())) {
        toast.error("جميع حقول الدواء مطلوبة");
        return;
      }

      setIsLoading(true);

      const response = await fetch(`/api/patients/${patientId}/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis: formData.diagnosis,
          medications: formData.medications.map(({ id, ...rest }) => rest),
          notes: formData.notes,
          validityDays: formData.validityDays,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save prescription");
      }

      toast.success("تم حفظ الوصفة الطبية بنجاح");
      await loadPrescriptions();
      setFormData({
        diagnosis: "",
        medications: [
          {
            id: "1",
            name: "",
            dose: "",
            frequency: "",
            duration: "",
            instructions: "",
          },
        ],
        notes: "",
        validityDays: 30,
      });
      setShowNewForm(false);
    } catch (error) {
      console.error("Error saving prescription:", error);
      toast.error(error instanceof Error ? error.message : "فشل حفظ الوصفة");
    } finally {
      setIsLoading(false);
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeletePrescription = async (id: string) => {
    try {
      setDeletingId(null);
      setIsLoading(true);
      const response = await fetch(`/api/patients/${patientId}/prescriptions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete prescription");

      toast.success("تم حذف الوصفة الطبية بنجاح");
      await loadPrescriptions();
    } catch (error) {
      console.error("Error deleting prescription:", error);
      toast.error("فشل حذف الوصفة");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintPrescription = (prescription: Prescription) => {
    const clinicName = clinicInfo?.name || "عيادة";
    const doctor = doctorName || "الطبيب المعالج";
    const specialty = clinicInfo?.specialty || "";
    const today = new Date().toLocaleDateString("ar-SA");

    const printContent = `
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>وصفة طبية - ${patientName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
          <style>
            @page { margin: 20mm 15mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Tajawal', 'Amiri', 'Traditional Arabic', 'Arabic Typesetting', 'Almarai', Arial, sans-serif; line-height: 1.7; color: #1e293b; background: #fff; }
            .prescription { max-width: 210mm; margin: 0 auto; padding: 10px; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 80px; opacity: 0.04; color: #1e40af; font-weight: bold; pointer-events: none; white-space: nowrap; z-index: 0; }
            .header { text-align: center; border-bottom: 3px double #1e40af; padding-bottom: 20px; margin-bottom: 25px; position: relative; }
            .clinic-name { font-size: 26px; font-weight: 800; color: #1e40af; letter-spacing: 1px; }
            .clinic-details { font-size: 13px; color: #64748b; margin-top: 5px; }
            .clinic-details span { display: inline-block; margin: 0 8px; }
            .rx-symbol { font-size: 32px; color: #1e40af; text-align: center; margin: 10px 0; font-weight: bold; }
            .doctor-line { text-align: left; font-size: 13px; color: #475569; margin-bottom: 20px; }
            .patient-info { background: #f8fafc; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
            .patient-info table { width: 100%; border-collapse: collapse; }
            .patient-info td { padding: 4px 8px; font-size: 14px; }
            .patient-info td:first-child { font-weight: 600; color: #475569; width: 100px; }
            .patient-info td:last-child { color: #1e293b; }
            .diagnosis-box { background: #eff6ff; padding: 15px 20px; border-right: 5px solid #2563eb; margin: 20px 0; border-radius: 4px; }
            .diagnosis-label { font-weight: 700; color: #1e40af; font-size: 14px; margin-bottom: 5px; }
            .diagnosis-text { color: #1e293b; font-size: 15px; }
            .medications { margin: 20px 0; }
            .medications-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
            .med-table { width: 100%; border-collapse: collapse; }
            .med-table th { background: #1e40af; color: #fff; padding: 10px 12px; font-size: 13px; text-align: center; font-weight: 600; }
            .med-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 14px; }
            .med-table tr:last-child td { border-bottom: none; }
            .med-table tr:nth-child(even) td { background: #f8fafc; }
            .med-name-cell { font-weight: 600; color: #0f172a; }
            .notes-box { background: #fffbeb; padding: 15px 20px; border-right: 5px solid #d97706; border-radius: 4px; margin-top: 20px; }
            .notes-label { font-weight: 700; color: #92400e; font-size: 14px; margin-bottom: 5px; }
            .validity { text-align: center; margin-top: 20px; padding: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; color: #16a34a; font-weight: 700; font-size: 14px; }
            .footer { margin-top: 35px; padding-top: 15px; border-top: 1px solid #cbd5e1; text-align: center; font-size: 11px; color: #94a3b8; }
            .signature { margin-top: 30px; display: flex; justify-content: space-between; align-items: end; }
            .signature-box { text-align: center; }
            .signature-line { width: 200px; border-top: 1px solid #64748b; margin-top: 40px; padding-top: 8px; font-size: 13px; color: #475569; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="watermark">${clinicName}</div>
          <div class="prescription">
            <div class="header">
              <div class="clinic-name">${clinicName}</div>
              <div class="clinic-details">
                ${specialty ? `<span>${specialty}</span> · ` : ""}
                <span>${today}</span>
              </div>
            </div>

            <div class="rx-symbol">℞</div>

            <div class="doctor-line">الطبيب: ${doctor}</div>

            <div class="patient-info">
              <table>
                <tr><td>اسم المريض:</td><td>${patientName}</td></tr>
                <tr><td>التاريخ:</td><td>${new Date(prescription.createdAt).toLocaleDateString("ar-SA")}</td></tr>
                <tr><td>رقم الوصفة:</td><td>#${prescription.id.slice(0, 8)}</td></tr>
              </table>
            </div>

            <div class="diagnosis-box">
              <div class="diagnosis-label">التشخيص</div>
              <div class="diagnosis-text">${prescription.diagnosis}</div>
            </div>

            <div class="medications">
              <div class="medications-title">الأدوية الموصوفة</div>
              <table class="med-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>اسم الدواء</th>
                    <th>الجرعة</th>
                    <th>التكرار</th>
                    <th>المدة</th>
                    ${prescription.medications.some(m => m.instructions) ? "<th>تعليمات</th>" : ""}
                  </tr>
                </thead>
                <tbody>
                  ${prescription.medications.map((med, idx) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td class="med-name-cell">${med.name}</td>
                      <td>${med.dose}</td>
                      <td>${med.frequency}</td>
                      <td>${med.duration}</td>
                      ${med.instructions ? `<td>${med.instructions}</td>` : ""}
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>

            ${prescription.notes ? `
              <div class="notes-box">
                <div class="notes-label">ملاحظات</div>
                <div>${prescription.notes}</div>
              </div>
            ` : ""}

            <div class="validity">
              صالحة لمدة ${prescription.validityDays || 30} يوماً من تاريخ الإصدار
            </div>

            <div class="signature">
              <div class="signature-box">
                <div class="signature-line">ختم العيادة</div>
              </div>
              <div class="signature-box">
                <div class="signature-line">توقيع الطبيب</div>
              </div>
            </div>

            <div class="footer">
              <p>تم إنشاء هذه الوصفة إلكترونياً عبر نظام ميدكو لإدارة العيادات</p>
              <p>${new Date().toLocaleString("ar-SA")}</p>
              ${clinicInfo?.phone ? `<p>للاستفسار: ${clinicInfo.phone}${clinicInfo?.address ? ` · ${clinicInfo.address}` : ""}</p>` : ""}
            </div>
          </div>
        </body>
      </html>
    `;

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
            <Pill className="w-5 h-5 text-blue-600" />
            الوصفات الطبية
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {prescriptions.length} وصفة مسجّلة
          </p>
        </div>
        <Button
          onClick={() => setShowNewForm(!showNewForm)}
          className="gap-2"
          size="sm"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4" />
          وصفة جديدة
        </Button>
      </div>

      {showNewForm && (
        <div className="bg-slate-50 rounded-xl p-6 space-y-4 border border-slate-200">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              التشخيص
            </label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) =>
                setFormData({ ...formData, diagnosis: e.target.value })
              }
              placeholder="أدخل التشخيص الطبي"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              rows={2}
              disabled={isLoading}
            />
          </div>

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
                      onChange={(e) =>
                        handleMedicationChange(med.id, "name", e.target.value)
                      }
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-sm disabled:opacity-50"
                      disabled={isLoading}
                    />
                    <input
                      type="text"
                      placeholder="الجرعة"
                      value={med.dose}
                      onChange={(e) =>
                        handleMedicationChange(med.id, "dose", e.target.value)
                      }
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-sm disabled:opacity-50"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="التكرار (مثل: 3 مرات يومياً)"
                      value={med.frequency}
                      onChange={(e) =>
                        handleMedicationChange(
                          med.id,
                          "frequency",
                          e.target.value
                        )
                      }
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-sm disabled:opacity-50"
                      disabled={isLoading}
                    />
                    <input
                      type="text"
                      placeholder="المدة (مثل: 7 أيام)"
                      value={med.duration}
                      onChange={(e) =>
                        handleMedicationChange(
                          med.id,
                          "duration",
                          e.target.value
                        )
                      }
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-sm disabled:opacity-50"
                      disabled={isLoading}
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="تعليمات إضافية (اختياري)"
                    value={med.instructions || ""}
                    onChange={(e) =>
                      handleMedicationChange(
                        med.id,
                        "instructions",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-sm disabled:opacity-50"
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              ملاحظات إضافية
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="ملاحظات إضافية (اختياري)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right disabled:opacity-50"
              rows={2}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              صلاحية الوصفة (بالأيام)
            </label>
            <input
              type="number"
              value={formData.validityDays}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  validityDays: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right disabled:opacity-50"
              min="1"
              disabled={isLoading}
            />
          </div>

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
              onClick={handleSavePrescription}
              className="gap-2"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              حفظ الوصفة
            </Button>
          </div>
        </div>
      )}

      {isLoadingPrescriptions ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Pill className="w-12 h-12 mx-auto mb-2 opacity-40" />
          <p>لا توجد وصفات طبية مسجّلة</p>
          <p className="text-sm mt-1">
            أنشئ وصفة جديدة لحفظها في السجل الطبي للمريض
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((prescription) => {
            const isExpanded = expandedId === prescription.id;
            const isDeleting = deletingId === prescription.id;

            return (
              <div
                key={prescription.id}
                dir="rtl"
                className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-sm transition-all"
              >
                {/* ── Header (clickable to toggle) ── */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : prescription.id)}
                  className="w-full bg-gradient-to-l from-emerald-700 to-emerald-600 px-5 py-3 flex items-center justify-between gap-3 text-right cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="bg-white/20 rounded-full p-1.5 shrink-0">
                      <Pill className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-white text-sm leading-tight truncate">
                        {prescription.diagnosis}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-emerald-100 text-[11px] flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(prescription.createdAt)}
                        </span>
                        {prescription.medications.length > 0 && (
                          <span className="text-emerald-200 text-[11px] bg-white/10 px-1.5 py-0.5 rounded">
                            {prescription.medications.length} دواء
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handlePrintPrescription(prescription); }}
                      className="bg-white/15 hover:bg-white/25 text-white rounded-lg p-1.5 transition-colors"
                      title="طباعة"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    {isDeleting ? (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeletePrescription(prescription.id); }}
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
                        onClick={(e) => { e.stopPropagation(); setDeletingId(prescription.id); }}
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

                {/* ── Collapsible Details ── */}
                {isExpanded && (
                  <div className="p-4 space-y-3">
                    {prescription.medications.length > 0 && (
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
                                {prescription.medications.some(m => m.instructions) && (
                                  <th className="text-right px-2.5 py-1.5 text-emerald-800 font-semibold text-[11px]">تعليمات</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {prescription.medications.map((med, idx) => (
                                <tr key={med.id} className="border-b border-emerald-50 last:border-b-0 hover:bg-emerald-50/50">
                                  <td className="px-2.5 py-2 text-slate-400 text-[11px] font-mono w-6">{idx + 1}</td>
                                  <td className="px-2.5 py-2 font-semibold text-slate-800 text-sm">{med.name}</td>
                                  <td className="px-2.5 py-2 text-slate-600 text-sm">{med.dose}</td>
                                  <td className="px-2.5 py-2 text-slate-600 text-sm">{med.frequency}</td>
                                  <td className="px-2.5 py-2 text-slate-600 text-sm">{med.duration}</td>
                                  {prescription.medications.some(m => m.instructions) && (
                                    <td className="px-2.5 py-2 text-slate-500 text-[11px]">{med.instructions || "—"}</td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {prescription.validityDays && (
                      <div className="bg-emerald-50 rounded-lg px-3 py-2 text-xs text-emerald-700 font-medium flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" />
                        صالحة لمدة {prescription.validityDays} يوماً من تاريخ الإصدار
                      </div>
                    )}

                    {prescription.notes && (
                      <div className="bg-amber-50 border-r-4 border-amber-400 rounded-lg p-3">
                        <p className="text-[11px] font-semibold text-amber-800 mb-1">ملاحظات</p>
                        <p className="text-sm text-amber-950 leading-relaxed">{prescription.notes}</p>
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
