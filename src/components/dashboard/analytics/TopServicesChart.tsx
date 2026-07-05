"use client";

import React, { useMemo } from "react";
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
import { Stethoscope } from "lucide-react";
import type { ServiceBreakdown } from "./types";

type TopServicesChartProps = {
  data: ServiceBreakdown[];
};

function truncateName(name: string, maxLen: number = 22) {
  return name.length > maxLen ? name.slice(0, maxLen - 1) + "…" : name;
}

const barColors = [
  "var(--chart-1)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function TopServicesChart({ data }: TopServicesChartProps) {
  const sorted = useMemo(
    () =>
      [...data]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((d) => ({ ...d, shortName: truncateName(d.serviceName, 22) })),
    [data]
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="size-4 text-chart-4" />
          أكثر الخدمات
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
            لا توجد بيانات كافية
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={sorted}
              layout="vertical"
              margin={{ top: 5, right: 5, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="shortName"
                orientation="left"
                tick={{ fontSize: 12, fill: "var(--foreground)" }}
                axisLine={false}
                tickLine={false}
                width={140}
                tickMargin={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 12,
                  direction: "rtl",
                }}
                formatter={(value, _name, item) => [
                  Number(value),
                  item?.payload?.serviceName ?? "المواعيد",
                ]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {sorted.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
