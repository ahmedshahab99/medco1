"use client";

import { useState, useEffect } from "react";
import { CalendarOff, CalendarClock, Coffee } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { uid } from "@/lib/date-utils";
import type { Exception, ExceptionType } from "./types";

const EXCEPTION_TYPE_LABELS: Record<ExceptionType, string> = {
  off: "يوم إجازة",
  custom: "ساعات مخصصة",
  break: "استراحة جزئية",
};

const EXCEPTION_TYPE_ICONS: Record<ExceptionType, React.ReactNode> = {
  off:     <CalendarOff className="w-4 h-4" />,
  custom:  <CalendarClock className="w-4 h-4" />,
  break:   <Coffee className="w-4 h-4" />,
};

export function ExceptionFormModal({
  isOpen,
  editingEx,
  onSave,
  onClose,
}: {
  isOpen: boolean;
  editingEx: Exception | null;
  onSave: (data: Exception) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Exception>>({});

  useEffect(() => {
    if (editingEx) {
      setForm(editingEx);
    } else {
      setForm({ type: "off" });
    }
  }, [editingEx, isOpen]);

  const handleSave = () => {
    if (!form.date || !form.type) return;
    onSave({
      id: editingEx?.id || uid(),
      date: form.date,
      type: form.type as ExceptionType,
      startTime: form.startTime,
      endTime: form.endTime,
      label: form.label,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEx ? "تعديل الاستثناء" : "إضافة استثناء جديد"}
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            التاريخ <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={form.date || ""}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">نوع الاستثناء</label>
          <div className="grid grid-cols-3 gap-2">
            {(["off", "custom", "break"] as ExceptionType[]).map((type) => (
              <button
                key={type}
                onClick={() => setForm({ ...form, type })}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                  form.type === type
                    ? type === "off"    ? "border-red-500 bg-red-50 text-red-600"       :
                      type === "custom" ? "border-blue-500 bg-blue-50 text-blue-600"    :
                                          "border-amber-500 bg-amber-50 text-amber-600"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {EXCEPTION_TYPE_ICONS[type]}
                {EXCEPTION_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {(form.type === "custom" || form.type === "break") && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">وقت البداية</label>
              <Input
                type="time"
                value={form.startTime || ""}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">وقت النهاية</label>
              <Input
                type="time"
                value={form.endTime || ""}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">ملاحظة (اختياري)</label>
          <Input
            placeholder="مثال: عيد الفطر، مؤتمر طبي..."
            value={form.label || ""}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={handleSave} disabled={!form.date || !form.type}>
            {editingEx ? "حفظ التعديلات" : "إضافة الاستثناء"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
