"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

function formatCurrency(amount: number) {
  return amount.toLocaleString("ar-IQ") + " د.ع";
}

type SummaryCardsProps = {
  totalIncome: number;
  totalExpense: number;
  net: number;
};

export function SummaryCards({ totalIncome, totalExpense, net }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card size="sm">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">إجمالي الدخل</CardTitle>
            <div className="size-9 rounded-lg bg-chart-income/10 flex items-center justify-center">
              <TrendingUp className="size-4 text-chart-income" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">{formatCurrency(totalIncome)}</p>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">إجمالي المصروفات</CardTitle>
            <div className="size-9 rounded-lg bg-chart-expense/10 flex items-center justify-center">
              <TrendingDown className="size-4 text-chart-expense" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">{formatCurrency(totalExpense)}</p>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">صافي الأرباح</CardTitle>
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="size-4 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className={`text-xl font-bold ${net >= 0 ? "text-chart-income" : "text-chart-expense"}`}>
            {formatCurrency(net)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
