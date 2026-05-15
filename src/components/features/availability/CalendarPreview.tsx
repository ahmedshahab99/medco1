"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DAYS, getDayOfWeekKey } from "@/lib/date-utils";
import type { WeekSchedule } from "./types";

export function CalendarPreview({
  schedule,
}: {
  schedule: WeekSchedule;
}) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = viewDate.toLocaleDateString("ar-SA", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const offsetMap: Record<number, number> = { 6: 0, 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };
  const startOffset = offsetMap[firstDay];

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <span className="font-bold text-slate-800">{monthName}</span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100">
        {DAYS.map((d) => (
          <div key={d.key} className="py-2 text-center text-xs font-semibold text-slate-500">
            {d.short}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="h-10 border-b border-r border-slate-50 last:border-r-0" />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayKey = getDayOfWeekKey(dateStr);
          const daySchedule = schedule[dayKey];

          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          const isEnabled = daySchedule?.enabled;

          return (
            <div
              key={dateStr}
              className={`h-10 border-b border-r border-slate-100 last:border-r-0 flex flex-col items-center justify-center relative ${
                isEnabled ? "bg-emerald-50" : ""
              }`}
            >
              <span
                className={`text-xs font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                  isToday
                    ? "bg-blue-600 text-white font-bold"
                    : isEnabled
                    ? "text-slate-700"
                    : "text-slate-400"
                }`}
              >
                {day}
              </span>
              {isEnabled && !isToday && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-400" />
              )}
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 border-t border-slate-100 flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          متاح
        </div>
      </div>
    </Card>
  );
}
