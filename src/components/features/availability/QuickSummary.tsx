"use client";

import { Card } from "@/components/ui/Card";
import { DAYS, formatTime12 } from "@/lib/date-utils";
import type { WeekSchedule } from "./types";

export function QuickSummary({ schedule }: { schedule: WeekSchedule }) {
  return (
    <Card className="p-4 space-y-3">
      <h3 className="text-sm font-bold text-slate-700">ملخص سريع</h3>
      <div className="space-y-2">
        {DAYS.map((d) => {
          const ds = schedule[d.key];
          return (
            <div key={d.key} className="flex items-center justify-between text-sm">
              <span className={ds.enabled ? "text-slate-700" : "text-slate-400"}>
                {d.label}
              </span>
              {ds.enabled ? (
                <div className="flex flex-col items-end gap-0.5">
                  {ds.segments.map((seg, i) => (
                    <span key={i} className="text-xs text-blue-600 font-medium">
                      {formatTime12(seg.start)} – {formatTime12(seg.end)}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">مغلق</span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
