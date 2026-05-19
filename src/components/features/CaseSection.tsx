"use client";

import React, { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { Patient, PatientCase } from "@/hooks/use-patients";

interface CaseSectionProps {
  patients: Patient[];
}

export default function CaseSection({ patients }: CaseSectionProps) {
  const { register, control, setValue, formState: { errors } } = useFormContext();

  const patientMode = useWatch({ control, name: "patientMode" });
  const patientId = useWatch({ control, name: "patientId" });

  const [showCaseForm, setShowCaseForm] = useState(false);

  const selectedPatient = React.useMemo(
    () => patients.find((p) => p.id === patientId),
    [patients, patientId]
  );

  const hasCases = selectedPatient && selectedPatient.cases.length > 0;
  const isNewPatient = patientMode === "new";

  useEffect(() => {
    setValue("caseId", "");
    setShowCaseForm(false);
  }, [patientId, patientMode, setValue]);

  if (patientMode === "waitlist") return null;

  const fieldError = (path: string) => {
    const e = path.split(".").reduce((obj: any, key: string) => obj?.[key], errors as Record<string, any>);
    return e?.message as string | undefined;
  };

  return (
    <div className="border-t border-slate-100 pt-5 space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">الملف الطبي / الحالة</label>
        <button
          type="button"
          onClick={() => setShowCaseForm((prev) => !prev)}
          className={`px-3 py-1 text-xs font-bold rounded transition-all ${
            showCaseForm
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
          }`}
        >
          {showCaseForm ? "إلغاء" : "+ إضافة حالة"}
        </button>
      </div>

      {!isNewPatient && hasCases && (
        <div>
          <select
            className={`w-full rounded-xl border bg-white px-4 py-2.5 outline-none transition-all appearance-none text-sm ${
              fieldError("caseId")
                ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            }`}
            {...register("caseId")}
          >
            <option value="">لا يوجد / زيارة عامة</option>
            {selectedPatient?.cases.map((c: PatientCase) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          {fieldError("caseId") && <p className="mt-1 text-sm text-red-500">{fieldError("caseId")}</p>}
        </div>
      )}

      {showCaseForm && (
        <div className="space-y-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
          <Input
            placeholder="عنوان الحالة (مثلاً: متابعة سكري)"
            className="bg-white border-blue-100"
            {...register("newCase.title")}
          />
          <Textarea
            placeholder="ملاحظات تشخيصية أولية..."
            className="bg-white border-blue-100 h-20 text-sm"
            {...register("newCase.description")}
          />
        </div>
      )}
    </div>
  );
}
