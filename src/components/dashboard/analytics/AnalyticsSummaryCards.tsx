"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CalendarCheck, CheckCircle2, XCircle, UserPlus } from "lucide-react";
import { formatNumber } from "@/lib/format-utils";
import type { AnalyticsSummary } from "./types";

type AnalyticsSummaryCardsProps = {
  summary: AnalyticsSummary;
};

export function AnalyticsSummaryCards({ summary }: AnalyticsSummaryCardsProps) {
  const { totalAppointments, completed, cancelledNoShow, newPatients } = summary;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card size="sm">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">إجمالي المواعيد</CardTitle>
            <div className="size-9 rounded-lg bg-chart-1/10 flex items-center justify-center">
              <CalendarCheck className="size-4 text-chart-1" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">{formatNumber(totalAppointments)}</p>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">المواعيد المكتملة</CardTitle>
            <div className="size-9 rounded-lg bg-chart-income/10 flex items-center justify-center">
              <CheckCircle2 className="size-4 text-chart-income" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">{formatNumber(completed)}</p>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">ملغي / لم يحضر</CardTitle>
            <div className="size-9 rounded-lg bg-chart-expense/10 flex items-center justify-center">
              <XCircle className="size-4 text-chart-expense" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">{formatNumber(cancelledNoShow)}</p>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">المرضى الجدد</CardTitle>
            <div className="size-9 rounded-lg bg-chart-3/10 flex items-center justify-center">
              <UserPlus className="size-4 text-chart-3" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">{formatNumber(newPatients)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
