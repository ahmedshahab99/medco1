"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PieChartIcon } from "lucide-react";
import { statusLabels } from "./types";
import type { StatusBreakdown } from "./types";

type AppointmentStatusChartProps = {
  data: StatusBreakdown[];
};

const pieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-income)",
  "var(--chart-expense)",
];

export function AppointmentStatusChart({ data }: AppointmentStatusChartProps) {
  const filtered = data
    .filter((d) => d.count > 0)
    .map((d) => ({
      name: statusLabels[d.status] || d.status,
      value: d.count,
    }))
    .sort((a, b) => b.value - a.value);

  if (filtered.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="size-4 text-muted-foreground" />
            توزيع حالات المواعيد
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
          لا توجد بيانات
        </CardContent>
      </Card>
    );
  }

  const total = filtered.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="size-4 text-muted-foreground" />
          توزيع حالات المواعيد
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={filtered}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {filtered.map((_, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                fontSize: 12,
                direction: "rtl",
              }}
              formatter={(value) => [
                `${Number(value)} (${total > 0 ? ((Number(value) / total) * 100).toFixed(1) : 0}%)`,
                "",
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span className="text-xs text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
