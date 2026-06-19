"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/format-utils";

type DataPoint = {
  label: string;
  income: number;
  expense: number;
};

type IncomeExpenseChartProps = {
  data: DataPoint[];
};

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-4 text-chart-income" />
            الدخل مقابل المصروفات
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
          لا توجد بيانات كافية
        </CardContent>
    </Card>
  );
}

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-4 text-chart-income" />
          الدخل مقابل المصروفات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-income)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--chart-income)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-expense)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--chart-expense)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
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
                formatCurrency(Number(value)),
                "المبلغ",
              ]}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="var(--chart-income)"
              fill="url(#incomeGradient)"
              strokeWidth={2}
              name="income"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="var(--chart-expense)"
              fill="url(#expenseGradient)"
              strokeWidth={2}
              name="expense"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
