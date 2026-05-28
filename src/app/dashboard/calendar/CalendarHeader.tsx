"use client";

import React from "react";
import { ChevronRight, ChevronLeft, Plus, Users } from "lucide-react";
import { format, endOfWeek } from "date-fns";
import { arSA } from "date-fns/locale/ar-SA";
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
  currentDate, viewMode, onChangeView, onPrev, onNext,
  onToday, onNewAppointment, onOpenWaitlist, waitlistCount,
}: CalendarHeaderProps) {
  const weekStart = new Date(currentDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-slate-100 mb-4 shrink-0">
      
      {/* Date Navigation */}
      <div className="flex items-center gap-3">
        <button onClick={onToday} className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all">
          اليوم
        </button>
        <div className="flex items-center gap-0.5">
          <button onClick={onPrev} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all">
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
          <button onClick={onNext} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all">
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <h2 className="text-base md:text-lg font-bold text-slate-800 min-w-[160px]">
          {viewMode === "week" ? (
            `${format(weekStart, "d MMM", { locale: arSA })} - ${format(endOfWeek(currentDate, { weekStartsOn: 0 }), "d MMM yyyy", { locale: arSA })}`
          ) : viewMode === "month" ? (
            format(currentDate, "MMMM yyyy", { locale: arSA })
          ) : (
            format(currentDate, "EEEE، d MMMM yyyy", { locale: arSA })
          )}
        </h2>
      </div>

      {/* View Switcher + Actions */}
      <div className="flex items-center gap-3">
        {/* View Mode */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
          {(["day", "week", "month"] as ViewMode[]).map((mode) => (
            <button key={mode} onClick={() => onChangeView(mode)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === mode ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}>
              {mode === "day" ? "يوم" : mode === "week" ? "أسبوع" : "شهر"}
            </button>
          ))}
        </div>

        {/* Waitlist */}
        <button onClick={onOpenWaitlist}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all">
          <Users className="w-3.5 h-3.5" />
          الانتظار
          {waitlistCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">{waitlistCount}</span>
          )}
        </button>

        {/* New Appointment */}
        <button onClick={onNewAppointment}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-lg shadow-sm shadow-emerald-200 transition-all">
          <Plus className="w-3.5 h-3.5" />
          موعد جديد
        </button>
      </div>
    </div>
  );
}
