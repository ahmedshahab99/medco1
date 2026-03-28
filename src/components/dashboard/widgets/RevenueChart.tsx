import React from "react";
import { Card, CardTitle } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { CalendarDays } from "lucide-react";

export function RevenueChart() {
  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"];
  const values = [40, 60, 45, 80, 55, 90]; // mock percentages

  return (
    <Card className="flex flex-col h-full min-h-[300px]">
      <div className="flex items-center justify-between mb-6">
        <CardTitle className="mb-0">نظرة على الإيرادات</CardTitle>
        <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 text-slate-500">
          <CalendarDays className="w-4 h-4" />
          <span>آخر ٦ أشهر</span>
        </Button>
      </div>

      <div className="flex-1 flex items-end justify-between gap-2 xl:gap-4 mt-auto pt-8">
        {months.map((month, i) => (
          <div key={month} className="flex flex-col items-center gap-3 w-full group">
            <div className="w-full relative bg-slate-100 rounded-t-md h-[150px] overflow-hidden">
              <div 
                className="absolute bottom-0 w-full bg-blue-500 rounded-t-md transition-all duration-500 group-hover:bg-blue-600"
                style={{ height: `${values[i]}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-800 transition-colors">
              {month}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
