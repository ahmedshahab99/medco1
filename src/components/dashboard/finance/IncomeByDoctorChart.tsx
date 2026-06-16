"use client";

import React, { useState, useMemo } from "react";
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
import { Checkbox } from "@/components/ui/Checkbox";
import { Users } from "lucide-react";

type DoctorIncome = {
  doctorId: string;
  doctorName: string;
  totalIncome: number;
  appointmentCount: number;
};

type IncomeByDoctorChartProps = {
  data: DoctorIncome[];
};

function formatCurrency(amount: number) {
  return amount.toLocaleString("ar-IQ");
}

function truncateName(name: string, maxLen: number = 18) {
  return name.length > maxLen ? name.slice(0, maxLen - 1) + "…" : name;
}

export function IncomeByDoctorChart({ data }: IncomeByDoctorChartProps) {
  const [hiddenDoctors, setHiddenDoctors] = useState<Set<string>>(new Set());

  const visibleData = useMemo(
    () => data.filter((d) => !hiddenDoctors.has(d.doctorId)),
    [data, hiddenDoctors]
  );

  const allSelected = hiddenDoctors.size === 0;

  const toggleDoctor = (doctorId: string) => {
    setHiddenDoctors((prev) => {
      const next = new Set(prev);
      if (next.has(doctorId)) {
        next.delete(doctorId);
      } else {
        next.add(doctorId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setHiddenDoctors(new Set(data.map((d) => d.doctorId)));
    } else {
      setHiddenDoctors(new Set());
    }
  };

  const barColors = [
    "var(--chart-1)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Users className="size-4 text-chart-3" />
          الدخل حسب الطبيب
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer select-none rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
                className="size-3.5"
              />
              الكل
            </label>
            {data.map((doctor, i) => (
              <label
                key={doctor.doctorId}
                className="flex items-center gap-1.5 cursor-pointer select-none rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-muted"
                style={{ color: barColors[i % barColors.length] }}
              >
                <Checkbox
                  checked={!hiddenDoctors.has(doctor.doctorId)}
                  onCheckedChange={() => toggleDoctor(doctor.doctorId)}
                  className="size-3.5"
                  style={
                    {
                      "--primary": barColors[i % barColors.length],
                    } as React.CSSProperties
                  }
                />
                {truncateName(doctor.doctorName, 14)}
              </label>
            ))}
          </div>
        )}
        {visibleData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
            لا توجد بيانات كافية
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={visibleData}
              layout="vertical"
              margin={{ top: 5, right: 5, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
              />
              <YAxis
                type="category"
                dataKey="doctorName"
                orientation="left"
                tick={{ fontSize: 12, fill: "var(--foreground)" }}
                axisLine={false}
                tickLine={false}
                width={130}
                tickMargin={70}
                
                tickFormatter={(v) => truncateName(v, 18)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 12,
                  direction: "rtl",
                }}
                formatter={(value) => [formatCurrency(Number(value)), "الدخل"]}
              />
              <Bar dataKey="totalIncome" radius={[0, 6, 6, 0]} maxBarSize={32}>
                {visibleData.map((_, index) => {
                  const origIndex = data.findIndex((d) => d.doctorId === visibleData[index].doctorId);
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={barColors[origIndex % barColors.length]}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
