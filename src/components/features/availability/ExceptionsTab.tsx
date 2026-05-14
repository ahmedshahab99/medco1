"use client";

import { Plus, CalendarOff, CalendarClock, Coffee, Edit2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatArabicDate, formatTime12 } from "@/lib/date-utils";
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

const EXCEPTION_TYPE_COLORS: Record<ExceptionType, string> = {
  off:    "bg-red-50 text-red-600 border-red-100",
  custom: "bg-blue-50 text-blue-600 border-blue-100",
  break:  "bg-amber-50 text-amber-600 border-amber-100",
};

export function ExceptionsTab({
  exceptions,
  onAdd,
  onEdit,
  onDelete,
}: {
  exceptions: Exception[];
  onAdd: (type?: ExceptionType) => void;
  onEdit: (ex: Exception) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <CalendarOff className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">الاستثناءات والإجازات</h2>
              <p className="text-xs text-slate-500">أيام خاصة تتجاوز الجدول الأسبوعي</p>
            </div>
          </div>
          <Button size="sm" onClick={() => onAdd()} className="gap-1.5">
            <Plus className="w-4 h-4" />
            إضافة استثناء
          </Button>
        </div>

        {exceptions.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-3 text-slate-300">
              <CalendarOff className="w-7 h-7" />
            </div>
            <p className="text-slate-500 font-medium">لا توجد استثناءات مضافة</p>
            <p className="text-slate-400 text-sm mt-1">أضف إجازات أو أيام بساعات مختلفة</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {exceptions
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((ex) => (
                <div key={ex.id} className="px-6 py-4 flex items-center gap-4">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border shrink-0 ${
                      EXCEPTION_TYPE_COLORS[ex.type]
                    }`}
                  >
                    {EXCEPTION_TYPE_ICONS[ex.type]}
                    {EXCEPTION_TYPE_LABELS[ex.type]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {ex.label || EXCEPTION_TYPE_LABELS[ex.type]}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatArabicDate(ex.date)}
                      {ex.startTime && ex.endTime &&
                        ` · ${formatTime12(ex.startTime)} – ${formatTime12(ex.endTime)}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEdit(ex)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(ex.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(["off", "custom", "break"] as ExceptionType[]).map((type) => (
          <button
            key={type}
            onClick={() => onAdd(type)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed text-right transition-colors hover:bg-slate-50 ${
              type === "off"    ? "border-red-200 hover:border-red-300"   :
              type === "custom" ? "border-blue-200 hover:border-blue-300" :
                                  "border-amber-200 hover:border-amber-300"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                type === "off"    ? "bg-red-50 text-red-500"    :
                type === "custom" ? "bg-blue-50 text-blue-500"  :
                                    "bg-amber-50 text-amber-500"
              }`}
            >
              {EXCEPTION_TYPE_ICONS[type]}
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-700">{EXCEPTION_TYPE_LABELS[type]}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {type === "off"    ? "يوم إجازة كامل" :
                 type === "custom" ? "تحديد ساعات خاصة" :
                                     "استراحة ضمن اليوم"}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
