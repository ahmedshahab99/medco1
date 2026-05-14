"use client";

import { Settings2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { AdvancedSettings } from "./types";

function AdvancedField({
  label, hint, unit, value, onChange, min, max, step,
}: {
  label: string; hint: string; unit: string;
  value: number; onChange: (v: number) => void;
  min: number; max: number; step: number;
}) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <p className="text-xs text-slate-400">{hint}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-lg transition-colors"
        >
          −
        </button>
        <div className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50">
          <span className="text-lg font-bold text-slate-800">{value}</span>
          <span className="text-sm text-slate-500">{unit}</span>
        </div>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-lg transition-colors"
        >
          +
        </button>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600 h-1.5 rounded-full"
      />
    </div>
  );
}

export function AdvancedSettingsTab({
  advanced,
  onChange,
}: {
  advanced: AdvancedSettings;
  onChange: (next: AdvancedSettings) => void;
}) {
  const set = (field: keyof AdvancedSettings) => (v: number) =>
    onChange({ ...advanced, [field]: v });

  return (
    <div className="space-y-4">
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
            <Settings2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">الإعدادات المتقدمة</h2>
            <p className="text-xs text-slate-500">تحكم دقيق في كيفية حجز المواعيد</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-blue-500" />
              وقت الاستعداد (Buffer)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdvancedField
                label="قبل الموعد" hint="وقت التحضير" unit="دقيقة"
                value={advanced.bufferBefore} onChange={set("bufferBefore")}
                min={0} max={60} step={5}
              />
              <AdvancedField
                label="بعد الموعد" hint="وقت التنظيف" unit="دقيقة"
                value={advanced.bufferAfter} onChange={set("bufferAfter")}
                min={0} max={60} step={5}
              />
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-emerald-500" />
              حدود المواعيد
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdvancedField
                label="الحد الأقصى يومياً" hint="عدد المرضى" unit="موعد"
                value={advanced.maxPerDay} onChange={set("maxPerDay")}
                min={1} max={100} step={1}
              />
              <AdvancedField
                label="نافذة الحجز المسبق" hint="أقصى فترة مستقبلية" unit="يوم"
                value={advanced.bookingWindow} onChange={set("bookingWindow")}
                min={1} max={365} step={1}
              />
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-amber-500" />
              الحد الأدنى للإشعار المسبق
            </h3>
            <AdvancedField
              label="لا يُقبل حجز قبل الموعد بأقل من" hint="منع الحجز اللحظي" unit="ساعة"
              value={advanced.minNotice} onChange={set("minNotice")}
              min={0} max={72} step={1}
            />
          </div>
        </div>
      </Card>

      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-semibold">ملاحظة</p>
          <p className="mt-0.5 leading-relaxed text-blue-600">
            هذه الإعدادات تؤثر على كيفية حجز المرضى للمواعيد. التغييرات لا تؤثر على المواعيد المحجوزة مسبقاً.
          </p>
        </div>
      </div>
    </div>
  );
}
