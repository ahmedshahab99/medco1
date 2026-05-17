"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { usePatients } from "@/hooks/use-patients";
import { PatientDetailPanel } from "@/components/dashboard/patients/PatientDetailPanel";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PatientPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: patients, isLoading, error } = usePatients();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)] bg-white rounded-2xl border border-slate-100 shadow-sm">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const patient = patients?.find((p) => p.id === id);

  if (error || !patient) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] gap-4 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-lg font-semibold text-slate-700">المريض غير موجود</p>
        <p className="text-sm">{error?.message || "عذراً، لم نتمكن من العثور على ملف المريض المطلوب."}</p>
        <Button onClick={() => router.push("/dashboard/patients")}>
          العودة لقائمة المرضى
        </Button>
      </div>
    );
  }

  return (
    <PatientDetailPanel
      patient={patient}
      onClose={() => router.push("/dashboard/patients")}
      fullPage
    />
  );
}
