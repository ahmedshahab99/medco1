"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CalendarViewProps {
  onSelectDate: (date: Date) => void;
}

const WEEKDAYS = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

export default function CalendarView({ onSelectDate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-semibold">
          {currentDate.toLocaleDateString("ar-SA", {
            month: "long",
            year: "numeric",
          })}
        </h4>
        <div className="flex gap-2">
          <Button variant="outline" size="icon-sm" onClick={prevMonth}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={nextMonth}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-xs font-medium text-muted-foreground uppercase py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {padding.map((i) => (
          <div key={`pad-${i}`} className="p-2" />
        ))}
        {days.map((day) => {
          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
          );
          const isPast = date < today;
          const isUnavailable = date.getDay() === 5 || day % 5 === 0;
          const disabled = isPast || isUnavailable;
          const isToday = date.getTime() === today.getTime();

          if (disabled) {
            return (
              <Button
                key={day}
                disabled
                variant="ghost"
                size="sm"
                className="aspect-square rounded-xl text-muted-foreground/40"
              >
                {day}
              </Button>
            );
          }

          return (
            <Button
              key={day}
              variant={isToday ? "secondary" : "ghost"}
              size="sm"
              className="aspect-square rounded-xl"
              onClick={() => onSelectDate(date)}
            >
              {day}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
