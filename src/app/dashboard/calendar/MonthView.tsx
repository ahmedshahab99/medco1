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
    <div className="flex-1 flex flex-col p-2 md:p-4 overflow-hidden min-h-[500px] md:min-h-[600px] overflow-y-auto">
      <div className="min-w-[500px] md:min-w-0 flex-1 flex flex-col h-full">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 shrink-0">
          {["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"].map((day, i) => (
            <div key={day} className="text-center text-[10px] md:text-sm font-semibold text-slate-400 uppercase tracking-wider py-1.5 md:py-2 bg-slate-50/50 rounded-lg md:rounded-xl border border-slate-100/50">
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">
                {["ح", "ن", "ث", "ر", "خ", "ج", "س"][i]}
              </span>
            </div>
          ))}
        </div>

        {/* Month Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr gap-1 md:gap-2">
          {monthDays.map((day) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, currentDate);
            const dayAppointments = parsedAppointments.filter((appt) =>
              isSameDay(appt.startTime, day)
            );

            return (
              <div
                key={day.toISOString()}
                onClick={() => {
                  onChangeDate(day);
                  if (dayAppointments.length > 0) {
                    // switch to day view handled by parent if needed
                  } else {
                    onNewAppointment(day);
                  }
                }}
                className={`
                  min-h-[80px] md:min-h-[100px] p-1.5 md:p-2 flex flex-col rounded-xl md:rounded-2xl border transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5
                  ${isCurrentMonth ? "bg-white border-slate-100" : "bg-slate-50/50 border-transparent text-slate-400 opacity-60 hover:opacity-100"}
                  ${isToday ? "ring-2 ring-blue-500 shadow-sm" : ""}
                  ${isSelected && !isToday ? "ring-2 ring-blue-300 bg-blue-50/50" : ""}
                `}
              >
                <div className="flex justify-between items-start mb-1 md:mb-2 text-right">
                  <span
                    className={`
                      w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-[11px] md:text-sm font-bold rounded-full
                      ${isToday ? "bg-blue-600 text-white shadow-sm ring-2 md:ring-4 ring-blue-50" : isSelected ? "bg-blue-100 text-blue-700 ring-2 ring-blue-200" : isCurrentMonth ? "text-slate-700 bg-slate-50" : "text-slate-400"}
                    `}
                  >
                    {format(day, "d")}
                  </span>
                  {dayAppointments.length > 0 && (
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full inline md:hidden">
                      {dayAppointments.length}
                    </span>
                  )}
                  {dayAppointments.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full hidden md:inline">
                      {dayAppointments.length}
                    </span>
                  )}
                </div>

                <div className="hidden md:flex flex-col gap-1.5 overflow-hidden">
                  {dayAppointments.slice(0, 3).map((appt) => {
                    const colorClass = getColorClass(appt.serviceColor);
                    const colorStyle = getColorStyle(appt.serviceColor);
                    return (
                      <div
                        key={appt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          const original = appointments.find((a) => a.id === appt.id);
                          if (original) onSelectAppt(original);
                        }}
                        className={`text-[10px] px-2 py-1.5 rounded-lg font-medium leading-tight line-clamp-1 border transition-all hover:brightness-95 text-white ${colorClass}`}
                        style={colorStyle}
                      >
                        <span dir="ltr" className="mr-1 font-semibold opacity-80 inline-block">
                          {format(appt.startTime, "h:mm")}
                        </span>
                        {appt.patientName}
                      </div>
                    );
                  })}
                  {dayAppointments.length > 3 && (
                    <div className="text-[10px] text-slate-500 font-bold px-1 mt-0.5 hover:text-blue-600 transition-colors">
                      عرض {dayAppointments.length - 3} إضافي...
                    </div>
                  )}
                </div>

                {/* Mobile dots */}
                <div className="flex md:hidden flex-wrap gap-0.5 mt-auto">
                  {dayAppointments.slice(0, 4).map((appt) => (
                    <div
                      key={appt.id}
                      className={`w-1.5 h-1.5 rounded-full ${getColorClass(appt.serviceColor)}`}
                      style={getColorStyle(appt.serviceColor)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
