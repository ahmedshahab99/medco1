"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CalendarDays } from "lucide-react";
import type { DayOfWeekBreakdown } from "./types";

type AppointmentsByDayChartProps = {
  data: DayOfWeekBreakdown[];
};

export function AppointmentsByDayChart({ data }: AppointmentsByDayChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="size-4 text-chart-5" />
          توزيع المواعيد حسب اليوم
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.every((d) => d.count === 0) ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
            لا توجد بيانات كافية
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={data}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 12,
                  direction: "rtl",
                }}
                formatter={(value) => [Number(value), "المواعيد"]}
                cursor={{ fill: "var(--muted)" }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="var(--chart-1)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
