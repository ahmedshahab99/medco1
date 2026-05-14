"use client";

import { Plus, X, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { DAYS } from "@/lib/date-utils";
import type { WeekSchedule } from "./types";

export function WeeklySchedule({
  schedule,
  onToggleDay,
  onUpdateSegment,
  onAddSegment,
  onRemoveSegment,
}: {
  schedule: WeekSchedule;
  onToggleDay: (key: string) => void;
  onUpdateSegment: (dayKey: string, segId: string, field: "start" | "end", value: string) => void;
  onAddSegment: (dayKey: string) => void;
  onRemoveSegment: (dayKey: string, segId: string) => void;
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800">الجدول الأسبوعي المتكرر</h2>
          <p className="text-xs text-slate-500">فعّل الأيام وحدد أوقات العمل لكل يوم</p>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {DAYS.map((day) => {
          const ds = schedule[day.key];
          return (
            <div
              key={day.key}
              className={`px-6 py-4 transition-colors ${
                ds.enabled ? "bg-white" : "bg-slate-50/60"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-3 w-36 shrink-0 pt-1">
                  <Switch
                    checked={ds.enabled}
                    onCheckedChange={() => onToggleDay(day.key)}
                    size="sm"
                  />
                  <span
                    className={`font-semibold text-sm ${
                      ds.enabled ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {day.label}
                  </span>
                </div>

                {ds.enabled ? (
                  <div className="flex-1 space-y-2">
                    {ds.segments.map((seg) => (
                      <div key={seg.id} className="flex items-center gap-2">
                        <div className="flex items-center gap-2 flex-1 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                          <Input
                            type="time"
                            value={seg.start}
                            onChange={(e) => onUpdateSegment(day.key, seg.id, "start", e.target.value)}
                            className="bg-transparent border-0 shadow-none w-24 p-0 h-auto"
                          />
                          <span className="text-slate-400 text-sm">—</span>
                          <Input
                            type="time"
                            value={seg.end}
                            onChange={(e) => onUpdateSegment(day.key, seg.id, "end", e.target.value)}
                            className="bg-transparent border-0 shadow-none w-24 p-0 h-auto"
                          />
                        </div>
                        {ds.segments.length > 1 && (
                          <button
                            onClick={() => onRemoveSegment(day.key, seg.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => onAddSegment(day.key)}
                      className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 mt-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      إضافة فترة أخرى
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center">
                    <span className="text-sm text-slate-400 italic">مغلق – لا توجد مواعيد</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
