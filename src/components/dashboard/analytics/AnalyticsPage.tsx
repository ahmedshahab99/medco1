"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { AnalyticsSummaryCards } from "./AnalyticsSummaryCards";
import {
  PeriodSelector,
  type PeriodMode,
} from "@/components/dashboard/finance/PeriodSelector";
import { AppointmentsTrendChart } from "./AppointmentsTrendChart";
import { AppointmentsByDoctorChart } from "./AppointmentsByDoctorChart";
import { AppointmentStatusChart } from "./AppointmentStatusChart";
import { PatientsDemographicsChart } from "./PatientsDemographicsChart";
import { AnalyticsMonthComparison } from "./AnalyticsMonthComparison";
import { statusLabels, monthNames } from "./types";
import type {
  AnalyticsAppointment,
  AnalyticsInitialData,
  AnalyticsSummary,
  DoctorAppointments,
  GenderBreakdown,
  MonthlyTrend,
  StatusBreakdown,
} from "./types";

function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 0, 23, 59, 59, 999),
  };
}

type AnalyticsPageProps = {
  initialData: AnalyticsInitialData;
  currentMonth: number;
  currentYear: number;
};

export function AnalyticsPage({
  initialData,
  currentMonth,
  currentYear,
}: AnalyticsPageProps) {
  const [periodMode, setPeriodMode] = useState<PeriodMode>("month");
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    () => getWeekRange(new Date()).start
  );

  const currentWeekRange = React.useMemo(
    () => getWeekRange(weekStartDate),
    [weekStartDate]
  );

  const [summary, setSummary] = useState<AnalyticsSummary>(initialData.summary);
  const [appointments, setAppointments] = useState<AnalyticsAppointment[]>(
    initialData.appointments
  );
  const [byDoctor, setByDoctor] = useState<DoctorAppointments[]>(
    initialData.byDoctor
  );
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown[]>(
    initialData.statusBreakdown
  );
  const [genderBreakdown, setGenderBreakdown] = useState<GenderBreakdown[]>(
    initialData.genderBreakdown
  );
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>(
    initialData.monthlyTrend
  );

  const loadData = useCallback(
    async (startDate: string, endDate: string) => {
      setLoading(true);
      const params = new URLSearchParams({ startDate, endDate, year: String(year) });
      const res = await fetch(`/api/analytics/summary?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setAppointments(data.appointments);
        setByDoctor(data.byDoctor);
        setStatusBreakdown(data.statusBreakdown);
        setGenderBreakdown(data.genderBreakdown);
        setMonthlyTrend(data.monthlyTrend);
      }
      setLoading(false);
    },
    [year]
  );

  const computePeriodRange = useCallback(
    (mode: PeriodMode, m: number, y: number): { startDate: string; endDate: string } => {
      if (mode === "month") {
        const range = getMonthRange(y, m);
        return { startDate: range.start.toISOString(), endDate: range.end.toISOString() };
      }
      return { startDate: customStart, endDate: customEnd };
    },
    [customStart, customEnd]
  );

  const handleMonthChange = (delta: number) => {
    if (periodMode === "month") {
      let m = month + delta;
      let y = year;
      if (m < 1) { m = 12; y--; }
      if (m > 12) { m = 1; y++; }
      setMonth(m);
      setYear(y);
      const { startDate, endDate } = computePeriodRange("month", m, y);
      loadData(startDate, endDate);
    } else if (periodMode === "week") {
      const newStart = new Date(weekStartDate);
      newStart.setDate(newStart.getDate() + delta * 7);
      const range = getWeekRange(newStart);
      setWeekStartDate(range.start);
      setMonth(range.start.getMonth() + 1);
      setYear(range.start.getFullYear());
      loadData(range.start.toISOString(), range.end.toISOString());
    }
  };

  const handleModeChange = (newMode: PeriodMode) => {
    setPeriodMode(newMode);
    if (newMode === "week") {
      const range = getWeekRange(new Date());
      setWeekStartDate(range.start);
      setMonth(range.start.getMonth() + 1);
      setYear(range.start.getFullYear());
      loadData(range.start.toISOString(), range.end.toISOString());
    } else if (newMode === "month") {
      const { startDate, endDate } = computePeriodRange("month", month, year);
      loadData(startDate, endDate);
    }
  };

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      loadData(customStart, customEnd);
    }
  };

  const monthLabel = monthNames[month - 1];

  // Daily aggregation for area chart
  const dailyData = React.useMemo(() => {
    if (periodMode === "week") {
      const range = getWeekRange(weekStartDate);
      const days: Array<{ label: string; appointments: number; completed: number }> = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(range.start);
        d.setDate(d.getDate() + i);
        const label = d.toLocaleDateString("ar-SA", { weekday: "short", day: "numeric" });
        days.push({ label, appointments: 0, completed: 0 });
      }

      for (const a of appointments) {
        const aDate = new Date(a.startTime);
        if (aDate >= range.start && aDate <= range.end) {
          const dayIndex = aDate.getDay();
          const idx = dayIndex === 0 ? 6 : dayIndex - 1;
          days[idx].appointments += 1;
          if (a.status === "COMPLETED") days[idx].completed += 1;
        }
      }

      return days;
    }

    if (periodMode === "custom") {
      const map = new Map<string, { appointments: number; completed: number }>();
      for (const a of appointments) {
        const key = new Date(a.startTime).toLocaleDateString("ar-SA", {
          day: "numeric",
          month: "short",
        });
        const entry = map.get(key) || { appointments: 0, completed: 0 };
        entry.appointments += 1;
        if (a.status === "COMPLETED") entry.completed += 1;
        map.set(key, entry);
      }
      return Array.from(map.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([label, val]) => ({ label, ...val }));
    }
    return monthlyTrend.map((m) => ({
      label: m.label,
      appointments: m.appointments,
      completed: m.completed,
    }));
  }, [periodMode, appointments, monthlyTrend, weekStartDate]);

  const exportCSV = () => {
    const headers = ["التاريخ", "الحالة", "المريض", "الطبيب", "الخدمة"];
    const rows = appointments.map((a) => [
      new Date(a.startTime).toLocaleDateString("ar-SA"),
      statusLabels[a.status] || a.status,
      a.patient?.name || "",
      a.doctor?.name || "",
      a.service?.name || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `تحليلات-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير الملف");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PeriodSelector
          mode={periodMode}
          onModeChange={handleModeChange}
          currentMonth={month}
          currentYear={year}
          onMonthChange={handleMonthChange}
          monthLabel={monthLabel}
          weekStart={currentWeekRange.start.toISOString()}
          weekEnd={currentWeekRange.end.toISOString()}
          customStart={customStart}
          customEnd={customEnd}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
          onApplyCustom={handleApplyCustom}
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="gap-1.5"
          >
            <Download className="size-3.5" />
            تصدير CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} size="sm">
              <CardHeader className="border-b pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="size-9 rounded-lg" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <AnalyticsSummaryCards summary={summary} />
      )}

      {/* Charts Row 1: Trend + By Doctor */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AppointmentsTrendChart data={dailyData} />
          <AppointmentsByDoctorChart data={byDoctor} />
        </div>
      )}

      {/* Charts Row 2: Status + Demographics */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <Skeleton className="size-64 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AppointmentStatusChart data={statusBreakdown} />
          <PatientsDemographicsChart data={genderBreakdown} />
        </div>
      )}

      {/* Month Comparison */}
      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-7 w-36" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <AnalyticsMonthComparison monthlyData={monthlyTrend} />
      )}
    </div>
  );
}
