"use client";

import React, { useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns";
import { arSA } from "date-fns/locale/ar-SA";
import type { CalendarAppointment } from "@/hooks/use-appointments";

interface MonthViewProps {
  appointments: CalendarAppointment[];
  currentDate: Date;
  onChangeDate: (date: Date) => void;
  onSelectAppt: (appt: CalendarAppointment) => void;
  onNewAppointment: (date: Date) => void;
}

function parseApptDates(appt: CalendarAppointment) {
  return {
    ...appt,
    startTime: new Date(appt.startTime),
    endTime: new Date(appt.endTime),
  };
}

function getColorStyle(color: string): React.CSSProperties {
  if (color.startsWith("#") || color.startsWith("rgb") || color.startsWith("hsl")) {
    return { backgroundColor: color };
  }
  return {};
}

function getColorClass(color: string): string {
  if (color.startsWith("#") || color.startsWith("rgb") || color.startsWith("hsl")) {
    return "";
  }
  return color;
}

export default function MonthView({ appointments, currentDate, onChangeDate, onSelectAppt, onNewAppointment }: MonthViewProps) {
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);
  const monthGridStart = useMemo(() => startOfWeek(monthStart, { weekStartsOn: 0 }), [monthStart]);
  const monthGridEnd = useMemo(() => endOfWeek(monthEnd, { weekStartsOn: 0 }), [monthEnd]);
  const monthDays = useMemo(() => eachDayOfInterval({ start: monthGridStart, end: monthGridEnd }), [monthGridStart, monthGridEnd]);

  const parsedAppointments = useMemo(() => appointments.map(parseApptDates), [appointments]);

  return (
    <div className="flex-1 flex flex-col p-3 overflow-hidden">
      <div className="min-w-[500px] flex-1 flex flex-col">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1 shrink-0">
          {["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"].map((day, i) => (
            <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2 border-b border-slate-200 bg-slate-50/30">
              <span className="md:inline">{day}</span>
              <span className="md:hidden">{["ح", "ن", "ث", "ر", "خ", "ج", "س"][i]}</span>
            </div>
          ))}
        </div>

        {/* Month Grid */}
        <div className="flex-1 grid grid-cols-7 border-r border-t border-slate-200">
          {monthDays.map((day) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, currentDate);
            const dayAppts = parsedAppointments.filter((a) => isSameDay(a.startTime, day));

            return (
              <div key={day.toISOString()}
                onClick={() => { onChangeDate(day); if (dayAppts.length === 0) onNewAppointment(day); }}
                className={`min-h-[90px] md:min-h-[110px] p-1.5 border-b border-l border-slate-200 cursor-pointer transition-all hover:bg-slate-50/50 relative
                  ${isCurrentMonth ? "bg-white" : "bg-slate-50/30 text-slate-300"}
                  ${isToday ? "bg-emerald-50/40" : ""}`}>

                {/* Day number */}
                <div className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full mb-1
                  ${isToday ? "bg-emerald-500 text-white shadow-sm" : isSelected ? "bg-emerald-100 text-emerald-700" : isCurrentMonth ? "text-slate-600" : "text-slate-300"}`}>
                  {format(day, "d")}
                </div>

                {/* Desktop appointments */}
                <div className="hidden md:flex flex-col gap-1">
                  {dayAppts.slice(0, 3).map((appt) => (
                    <div key={appt.id} onClick={(e) => { e.stopPropagation(); const orig = appointments.find((a) => a.id === appt.id); if (orig) onSelectAppt(orig); }}
                      className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-emerald-50 border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-all">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-[10px] font-medium text-emerald-800 truncate leading-tight">{appt.patientName}</span>
                    </div>
                  ))}
                  {dayAppts.length > 3 && (
                    <span className="text-[9px] text-slate-400 font-medium px-1">+{dayAppts.length - 3} مواعيد</span>
                  )}
                </div>

                {/* Mobile: dots */}
                <div className="flex md:hidden flex-wrap gap-0.5 mt-0.5">
                  {dayAppts.slice(0, 5).map((appt) => (
                    <div key={appt.id} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  ))}
                </div>

                {/* Appointment count badge */}
                {dayAppts.length > 0 && (
                  <span className="absolute top-1.5 left-1.5 md:hidden text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                    {dayAppts.length}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
