"use client";

import React, { useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { MOCK_PATIENTS } from "@/lib/mock/patients";
import { OverviewTab } from "@/components/dashboard/patients/tabs/OverviewTab";
import { HistoryTab } from "@/components/dashboard/patients/tabs/HistoryTab";
import { NotesTab } from "@/components/dashboard/patients/tabs/NotesTab";
import { FilesTab } from "@/components/dashboard/patients/tabs/FilesTab";

export default function PatientPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const activeTab = searchParams.get("tab") || "overview";

  const patient = useMemo(() => {
    return MOCK_PATIENTS.find((p) => p.id === id);
  }, [id]);

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] gap-4 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-lg font-semibold text-slate-700">المريض غير موجود</p>
        <p className="text-sm">عذراً، لم نتمكن من العثور على ملف المريض المطلوب.</p>
        <button
          onClick={() => router.push("/dashboard/patients")}
          className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          العودة لقائمة المرضى
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
          <p className="text-slate-500 text-sm">ملف رقم {patient.id}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            تعديل البيانات
          </button>
          <button className="px-4 py-2 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-colors">
            حجز موعد جديد
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 min-h-[calc(100vh-16rem)]">
        {activeTab === "overview" && <OverviewTab patient={patient} />}
        {activeTab === "notes" && <NotesTab patient={patient} />}
        {activeTab === "files" && <FilesTab patient={patient} />}
        {activeTab === "history" && <HistoryTab patient={patient} />}
        
        {/* Placeholders for new tabs */}
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
