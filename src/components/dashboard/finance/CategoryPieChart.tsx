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
import { formatCurrency } from "@/lib/format-utils";

type CategoryData = {
  category: string;
  income: number;
  expense: number;
};

type CategoryPieChartProps = {
  data: CategoryData[];
  type: "income" | "expense";
};

const categoryLabels: Record<string, string> = {
  CONSULTATION: "الكشفية",
  MEDICATIONS: "الأدوية",
  SERVICES: "الخدمات",
  CLINIC_RENT: "إيجار العيادة",
  INTERNET: "الإنترنت",
  SALARIES: "الرواتب",
  UTILITIES: "الفواتير",
  SUPPLIES: "المستلزمات",
  MARKETING: "التسويق",
  INSURANCE: "التأمين",
  TAXES: "الضرائب",
  MAINTENANCE: "الصيانة",
  OTHER: "أخرى",
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

export function CategoryPieChart({ data, type }: CategoryPieChartProps) {
  const filtered = data
    .filter((d) => (type === "income" ? d.income > 0 : d.expense > 0))
    .map((d) => ({
      name: categoryLabels[d.category] || d.category,
      value: type === "income" ? d.income : d.expense,
      originalCategory: d.category,
    }))
    .sort((a, b) => b.value - a.value);

  if (filtered.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="size-4 text-muted-foreground" />
            {type === "income" ? "توزيع الدخل" : "توزيع المصروفات"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
          لا توجد بيانات
        </CardContent>
      </Card>
    );
  }

  const title = type === "income" ? "توزيع الدخل" : "توزيع المصروفات";
  const total = filtered.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="size-4 text-muted-foreground" />
          {title}
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
                `${formatCurrency(Number(value))} (${total > 0 ? ((Number(value) / total) * 100).toFixed(1) : 0}%)`,
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
