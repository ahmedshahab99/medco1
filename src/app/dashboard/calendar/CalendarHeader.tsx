"use client";

import React from "react";
import {
  ChevronRight,
  ChevronLeft,
  Calendar as CalendarIcon,
  Plus,
  Users,
} from "lucide-react";
import { format, addDays, subDays, endOfWeek } from "date-fns";
import { arSA } from "date-fns/locale/ar-SA";
import { Button } from "@/components/ui/Button";
import type { ViewMode } from "./types";

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  onChangeView: (mode: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewAppointment: () => void;
  onOpenWaitlist: () => void;
  waitlistCount: number;
}

export default function CalendarHeader({
  currentDate,
  viewMode,
  onChangeView,
  onPrev,
  onNext,
  onToday,
  onNewAppointment,
  onOpenWaitlist,
  waitlistCount,
}: CalendarHeaderProps) {
  const weekStart = subDays(currentDate, currentDate.getDay());

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-slate-100 mb-4 md:mb-6 shrink-0 z-10">
      {/* Left: Date Nav */}
      <div className="flex items-center flex-wrap gap-2 md:gap-3">
        <Button variant="outline" size="sm" onClick={onToday} className="font-semibold px-3 md:px-4">
          اليوم
        </Button>
        <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 border border-slate-100">
          <button onClick={onPrev} className="p-1 hover:bg-white rounded-md transition-colors shadow-sm">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
          <button onClick={onNext} className="p-1 hover:bg-white rounded-md transition-colors shadow-sm">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        <h2 className="text-base md:text-xl font-bold text-slate-800 md:min-w-[200px] flex items-center gap-2 truncate">
          <CalendarIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-600 shrink-0" />
          <span className="truncate">
            {viewMode === "week" ? (
              `${format(weekStart, "d MMM", { locale: arSA })} - ${format(
                endOfWeek(currentDate, { weekStartsOn: 0 }),
                "d MMM yyyy",
                { locale: arSA }
              )}`
            ) : viewMode === "month" ? (
              format(currentDate, "MMMM yyyy", { locale: arSA })
            ) : (
              format(currentDate, "EEEE، d MMMM yyyy", { locale: arSA })
            )}
          </span>
        </h2>
      </div>

      {/* Center: View Switcher */}
      <div className="flex items-center p-1 bg-slate-50 border border-slate-100 rounded-lg overflow-x-auto no-scrollbar max-w-full">
        {(["day", "week", "month"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onChangeView(mode)}
            className={`px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap ${
              viewMode === mode
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {mode === "day" && "يوم"}
            {mode === "week" && "أسبوع"}
            {mode === "month" && "شهر"}


          </button>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-3 ml-auto md:ml-0">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 h-9 px-2 md:px-3"
          onClick={onOpenWaitlist}
        >
          <Users className="w-4 h-4" />
          <span className="hidden md:inline text-xs font-bold">قائمة الانتظار</span>
          {waitlistCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center font-bold">
              {waitlistCount}
            </span>
          )}
        </Button>

        <Button size="sm" className="gap-2 shrink-0 h-9 px-3 md:px-4" onClick={onNewAppointment}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-bold">موعد جديد</span>
          <span className="sm:hidden text-xs font-bold">جديد</span>
        </Button>
      </div>
    </div>
  );
}
