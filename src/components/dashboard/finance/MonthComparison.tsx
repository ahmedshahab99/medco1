"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

type MonthData = {
  month: number;
  label: string;
  income: number;
  expense: number;
  net: number;
};

type MonthComparisonProps = {
  monthlyData: MonthData[];
  formatCurrency: (amount: number) => string;
};

export function MonthComparison({
  monthlyData,
  formatCurrency,
}: MonthComparisonProps) {
  const defaultMonths = useMemo(() => {
    if (monthlyData.length >= 2) {
      return {
        a: String(monthlyData[monthlyData.length - 1].month),
        b: String(monthlyData[monthlyData.length - 2].month),
      };
    }
    return { a: "", b: "" };
  }, [monthlyData]);

  const [monthA, setMonthA] = useState<string>(defaultMonths.a);
  const [monthB, setMonthB] = useState<string>(defaultMonths.b);

  const dataA = monthlyData.find((m) => m.month === Number(monthA));
  const dataB = monthlyData.find((m) => m.month === Number(monthB));

  const diff = dataA && dataB ? dataA.net - dataB.net : 0;
  const pctChange =
    dataA && dataB && dataB.net !== 0
      ? ((dataA.net - dataB.net) / Math.abs(dataB.net)) * 100
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">مقارنة شهرين</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Select value={monthA} onValueChange={setMonthA}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="الشهر الأول" />
            </SelectTrigger>
            <SelectContent>
              {monthlyData.map((m) => (
                <SelectItem key={m.month} value={String(m.month)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">مقابل</span>
          <Select value={monthB} onValueChange={setMonthB}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="الشهر الثاني" />
            </SelectTrigger>
            <SelectContent>
              {monthlyData.map((m) => (
                <SelectItem key={m.month} value={String(m.month)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {dataA && dataB ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  {dataA.label}
                </p>
                <p className="text-lg font-bold">{formatCurrency(dataA.net)}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>دخل: {formatCurrency(dataA.income)}</span>
                  <span>مصروف: {formatCurrency(dataA.expense)}</span>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  {dataB.label}
                </p>
                <p className="text-lg font-bold">{formatCurrency(dataB.net)}</p>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>دخل: {formatCurrency(dataB.income)}</span>
                  <span>مصروف: {formatCurrency(dataB.expense)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 py-2">
              <div className="flex items-center gap-1">
                {diff > 0 ? (
                  <ArrowUp className="size-4 text-chart-income" />
                ) : diff < 0 ? (
                  <ArrowDown className="size-4 text-chart-expense" />
                ) : (
                  <Minus className="size-4 text-muted-foreground" />
                )}
                <span
                  className={`text-sm font-bold ${
                    diff > 0
                      ? "text-chart-income"
                      : diff < 0
                      ? "text-chart-expense"
                      : "text-muted-foreground"
                  }`}
                >
                  {diff >= 0 ? "+" : ""}
                  {formatCurrency(diff)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                ({pctChange >= 0 ? "+" : ""}
                {pctChange.toFixed(1)}%)
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            اختر شهرين للمقارنة
          </div>
        )}
      </CardContent>
    </Card>
  );
}
