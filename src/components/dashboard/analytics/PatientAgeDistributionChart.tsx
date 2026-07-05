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
import { Button } from "@/components/ui/Button";
import { Users } from "lucide-react";
import type { AgeBucket } from "./types";

type PatientAgeDistributionChartProps = {
  data: AgeBucket[];
  genderFilter: "ALL" | "MALE" | "FEMALE";
  onGenderFilterChange: (value: "ALL" | "MALE" | "FEMALE") => void;
};

const filterOptions: Array<{ value: "ALL" | "MALE" | "FEMALE"; label: string }> = [
  { value: "ALL", label: "الكل" },
  { value: "MALE", label: "ذكر" },
  { value: "FEMALE", label: "أنثى" },
];

export function PatientAgeDistributionChart({
  data,
  genderFilter,
  onGenderFilterChange,
}: PatientAgeDistributionChartProps) {
  const total = useMemo(
    () => data.reduce((s, d) => s + d.count, 0),
    [data]
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4 text-chart-3" />
            توزيع المرضى حسب العمر
          </CardTitle>
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            {filterOptions.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                size="sm"
                variant={genderFilter === opt.value ? "default" : "ghost"}
                className="h-7 px-3 text-xs"
                onClick={() => onGenderFilterChange(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
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
                formatter={(value) => [
                  `${Number(value)} (${total > 0 ? ((Number(value) / total) * 100).toFixed(1) : 0}%)`,
                  "المرضى",
                ]}
                cursor={{ fill: "var(--muted)" }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="var(--chart-3)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
