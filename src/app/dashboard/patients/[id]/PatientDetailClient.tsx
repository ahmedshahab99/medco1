"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OverviewTab } from "@/components/dashboard/patients/tabs/OverviewTab";
import { HistoryTab } from "@/components/dashboard/patients/tabs/HistoryTab";
import { NotesTab } from "@/components/dashboard/patients/tabs/NotesTab";
import { FilesTab } from "@/components/dashboard/patients/tabs/FilesTab";
import { PrescriptionTab } from "@/components/dashboard/patients/tabs/PrescriptionTab";
import { Patient } from "@/lib/types/dashboard";
import { Pill, Stethoscope } from "lucide-react";

interface PatientDetailClientProps {
  patient: Patient;
}

const tabs = [
  { key: "overview", label: "نظرة عامة" },
  { key: "prescriptions", label: "الوصفات" },
  { key: "notes", label: "ملاحظات" },
  { key: "files", label: "ملفات" },
  { key: "history", label: "السجل" },
];

export default function PatientDetailClient({ patient }: PatientDetailClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "overview";

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
          <p className="text-slate-500 text-sm">ملف رقم {patient.id}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            تعديل البيانات
          </button>

          <button
            onClick={() => router.push(`/dashboard/patients/${patient.id}/prescribe`)}
            className="px-4 py-2 bg-gradient-to-l from-emerald-700 to-emerald-500 rounded-xl text-sm font-bold text-white hover:from-emerald-600 hover:to-emerald-400 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <Stethoscope className="w-4 h-4" />
            إضافة وصفة طبية
          </button>

          <button className="px-4 py-2 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-colors">
            حجز موعد جديد
          </button>
        </div>
      </div>

      <div className="border-b border-slate-200 flex gap-0 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.key === "prescriptions" && <Pill className="w-4 h-4 inline ms-1" />}
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 min-h-[calc(100vh-16rem)]">
        {activeTab === "overview" && <OverviewTab patient={patient} />}
        {activeTab === "prescriptions" && <PrescriptionTab patientId={patient.id} patientName={patient.name} />}
        {activeTab === "notes" && <NotesTab patient={patient} />}
        {activeTab === "files" && <FilesTab patient={patient} />}
        {activeTab === "history" && <HistoryTab patient={patient} />}
        
        {activeTab === "appointments" && (
          <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
            <p className="text-lg font-medium">قريباً: عرض جميع المواعيد الخاصة بالمريض</p>
          </div>
        )}
        {activeTab === "payment" && (
          <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
            <p className="text-lg font-medium">قريباً: سجل المدفوعات والفواتير</p>
          </div>
        )}
        {activeTab === "reminders" && (
          <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
            <p className="text-lg font-medium">قريباً: التذكيرات والإشعارات</p>
          </div>
        )}
      </div>
    </div>
  );
}
