"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TimeSlotsProps {
  date: Date | null;
  timeSlots: string[];
  onSelectTime: (time: string) => void;
  onBack: () => void;
}

export default function TimeSlots({
  date,
  timeSlots,
  onSelectTime,
  onBack,
}: TimeSlotsProps) {
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setSelected(null);
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, [date]);

  return (
    <div className="w-full">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-6">
        <ArrowLeft size={16} />
        التاريخ
      </Button>

      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CalendarIcon size={18} className="text-muted-foreground" />
        {date?.toLocaleDateString("ar-SA", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </h4>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-muted animate-pulse rounded-xl border"
              />
            ))
          : timeSlots.map((time) => (
              <Button
                key={time}
                variant={selected === time ? "default" : "outline"}
                className="rounded-xl h-12"
                onClick={() => setSelected(time)}
              >
                {time}
              </Button>
            ))}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button
          disabled={!selected}
          onClick={() => selected && onSelectTime(selected)}
        >
          متابعة
        </Button>
      </div>
    </div>
  );
}
