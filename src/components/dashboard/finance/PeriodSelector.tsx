"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/date-utils";

export type PeriodMode = "month" | "week" | "custom";

type PeriodSelectorProps = {
  mode: PeriodMode;
  onModeChange: (mode: PeriodMode) => void;
  currentMonth: number;
  currentYear: number;
  onMonthChange: (delta: number) => void;
  monthLabel: string;
  weekStart: string;
  weekEnd: string;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (v: string) => void;
  onCustomEndChange: (v: string) => void;
  onApplyCustom: () => void;
};

export function PeriodSelector({
  mode,
  onModeChange,
  currentYear,
  onMonthChange,
  monthLabel,
  weekStart,
  weekEnd,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  onApplyCustom,
}: PeriodSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={mode} onValueChange={(v) => onModeChange(v as PeriodMode)}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">شهري</SelectItem>
          <SelectItem value="week">أسبوعي</SelectItem>
          <SelectItem value="custom">مخصص</SelectItem>
        </SelectContent>
      </Select>

      {mode === "month" && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => onMonthChange(-1)}>
            <ChevronRight className="size-4" />
          </Button>
          <span className="min-w-[140px] text-center font-bold text-sm">
            {monthLabel} {currentYear}
          </span>
          <Button variant="outline" size="icon-sm" onClick={() => onMonthChange(1)}>
            <ChevronLeft className="size-4" />
          </Button>
        </div>
      )}

      {mode === "week" && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => onMonthChange(-1)}>
            <ChevronRight className="size-4" />
          </Button>
          <span className="min-w-[200px] text-center font-bold text-sm whitespace-nowrap">
            {new Date(weekStart).toLocaleDateString("ar-SA", { day: "numeric", month: "short" })}
            {" - "}
            {formatDate(weekEnd, { month: "short" })}
          </span>
          <Button variant="outline" size="icon-sm" onClick={() => onMonthChange(1)}>
            <ChevronLeft className="size-4" />
          </Button>
        </div>
      )}

      {mode === "custom" && (
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            type="date"
            value={customStart}
            onChange={(e) => onCustomStartChange(e.target.value)}
            className="w-36"
          />
          <span className="text-sm text-muted-foreground">إلى</span>
          <Input
            type="date"
            value={customEnd}
            onChange={(e) => onCustomEndChange(e.target.value)}
            className="w-36"
          />
          <Button variant="outline" size="sm" onClick={onApplyCustom}>
            تطبيق
          </Button>
        </div>
      )}
    </div>
  );
}
