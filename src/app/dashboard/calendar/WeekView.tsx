"use client";

import React, { useMemo, useState, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay, endOfWeek } from "date-fns";
import { arSA } from "date-fns/locale/ar-SA";
import type { CalendarAppointment } from "@/hooks/use-appointments";
import { START_HOUR, END_HOUR, HOUR_HEIGHT } from "./constants";
import { STATUS_MAP } from "./utils";

interface WeekViewProps {
  appointments: CalendarAppointment[];
  currentDate: Date;
  onSelectAppt: (appt: CalendarAppointment) => void;
  onChangeDate: (date: Date) => void;
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

export default function WeekView({ appointments, currentDate, onSelectAppt, onChangeDate, onNewAppointment }: WeekViewProps) {
  const [currentTimeLine, setCurrentTimeLine] = useState<number | null>(null);

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 0 }), [currentDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const parsedAppointments = useMemo(() => appointments.map(parseApptDates), [appointments]);

  useEffect(() => {
    const updateTimeLine = () => {
      const now = new Date();
      const todayIndex = weekDays.findIndex((d) => isSameDay(d, now));
      if (todayIndex !== -1) {
        const hours = now.getHours() + now.getMinutes() / 60;
        if (hours >= START_HOUR && hours <= END_HOUR) {
          setCurrentTimeLine((hours - START_HOUR) * HOUR_HEIGHT);
          return;
        }
      }
      setCurrentTimeLine(null);
    };
    updateTimeLine();
    const interval = setInterval(updateTimeLine, 60000);
    return () => clearInterval(interval);
  }, [weekDays]);

  const hoursArray = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="flex-1 overflow-auto custom-scrollbar relative">
      <div className="min-w-[700px] md:min-w-0 h-full flex flex-col">
        {/* Header row */}
        <div className="sticky top-0 bg-white/95 backdrop-blur z-30 flex border-b border-slate-100 shrink-0">
          <div className="w-14 md:w-20 shrink-0 text-center py-2 md:py-3 text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider border-l border-slate-100 z-30 bg-white/95">
            الوقت
          </div>
          <div className="flex-1 flex">
            {weekDays.map((day) => {
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, currentDate);
              return (
                <div
                  key={day.toISOString()}
                  className="flex-1 py-1.5 md:py-3 px-1 md:px-2 flex justify-center border-l border-slate-100 last:border-l-0"
                >
                  <div className={`text-center px-2 md:px-4 py-1 rounded-xl transition-all ${isToday ? "bg-blue-50" : ""} ${isSelected && !isToday ? "ring-2 ring-blue-200 bg-blue-50/50" : ""}`}>
                    <div className={`font-bold text-[10px] md:text-sm ${isToday ? "text-blue-700" : isSelected ? "text-blue-600" : "text-slate-800"}`}>
                      {format(day, "EEE", { locale: arSA })}
                    </div>
                    <div className={`text-[9px] md:text-xs mt-0.5 ${isToday ? "text-blue-600 font-semibold" : isSelected ? "text-blue-500 font-semibold" : "text-slate-500"}`}>
                      {format(day, "d MMM", { locale: arSA })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="flex relative" style={{ height: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT}px` }}>
          {/* Time labels */}
          <div className="w-14 md:w-20 shrink-0 border-l border-slate-100 relative bg-slate-50/30">
            {hoursArray.map((hour, index) => {
              const ampm = hour >= 12 ? "م" : "ص";
              const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
              return (
                <div
                  key={hour}
                  className="absolute w-full text-center text-[10px] md:text-xs font-medium text-slate-500 -mt-2 pr-1"
                  style={{ top: `${index * HOUR_HEIGHT}px` }}
                >
                  {h12}:00 {ampm}
                </div>
              );
            })}
          </div>

          {/* Columns wrapper */}
          <div className="flex-1 flex relative bg-slate-50/10">
            {/* Background lines */}
            <div className="absolute inset-0 pointer-events-none z-0">
              {hoursArray.map((hour, index) => (
                <div
                  key={`grid-week-${hour}`}
                  className="absolute w-full border-t border-slate-100"
                  style={{ top: `${index * HOUR_HEIGHT}px` }}
                />
              ))}
              {hoursArray.slice(0, -1).map((hour, index) => (
                <div
                  key={`grid-half-week-${hour}`}
                  className="absolute w-full border-t border-slate-50 border-dashed"
                  style={{ top: `${index * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }}
                />
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day) => {
              const dayAppointments = parsedAppointments.filter((appt) =>
                isSameDay(appt.startTime, day)
              );
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className="flex-1 relative cursor-pointer hover:bg-slate-50/50 transition-colors border-l border-slate-100 last:border-l-0 z-10"
                  onClick={() => {
                    onChangeDate(day);
                    onNewAppointment(day);
                  }}
                >
                  {isToday && currentTimeLine !== null && (
                    <div
                      className="absolute right-0 left-0 z-20 pointer-events-none"
                      style={{ top: `${currentTimeLine}px` }}
                    >
                      <div className="absolute right-[-4px] top-[-4px] w-2 h-2 rounded-full bg-red-500 z-10" />
                      <div className="border-t-[1.5px] border-red-500 relative shadow-sm" />
                    </div>
                  )}

                  {dayAppointments.map((appt) => {
                    const startH = appt.startTime.getHours() + appt.startTime.getMinutes() / 60;
                    const endH = appt.endTime.getHours() + appt.endTime.getMinutes() / 60;

                    if (startH < START_HOUR || startH > END_HOUR) return null;

                    const topOffset = (startH - START_HOUR) * HOUR_HEIGHT;
                    const height = (endH - startH) * HOUR_HEIGHT;
                    const colorClass = getColorClass(appt.serviceColor);
                    const colorStyle = getColorStyle(appt.serviceColor);
                    const StatusIcon = STATUS_MAP[appt.status]?.icon;

                    return (
                      <div
                        key={appt.id}
                        className={`absolute right-0.5 left-0.5 md:right-1.5 md:left-1.5 rounded-lg border p-1 md:p-1.5 flex flex-col overflow-hidden transition-all hover:shadow-md hover:z-30 cursor-pointer shadow-sm text-white ${colorClass}`}
                        style={{ top: `${topOffset}px`, height: `${height}px`, ...colorStyle }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const original = appointments.find((a) => a.id === appt.id);
                          if (original) onSelectAppt(original);
                        }}
                      >
                        <div className="flex flex-col h-full gap-0.5 relative">
                          <h4 className="font-bold text-[9px] md:text-[11px] leading-tight line-clamp-1">
                            {appt.patientName}
                          </h4>
                          {height >= 45 && (
                            <p className="text-[8px] md:text-[10px] font-medium opacity-80 leading-tight line-clamp-1">
                              {appt.serviceName}
                            </p>
                          )}
                          {height >= 60 && StatusIcon && (
                            <div className="mt-auto text-[8px] md:text-[10px] font-semibold opacity-80 flex items-center justify-between">
                              <span dir="ltr" className="md:inline hidden">
                                {format(appt.startTime, "h:mm")}
                              </span>
                              <StatusIcon className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
