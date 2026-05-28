"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getAvailableSlots } from "@/actions/public-booking";
import { formatTime12 } from "@/lib/date-utils";

interface TimeSlotsProps {
  date: Date | null;
  slug: string;
  doctorId: string;
  onSelectTime: (time: string) => void;
  onBack: () => void;
}

export default function TimeSlots({
  date,
  slug,
  doctorId,
  onSelectTime,
  onBack,
}: TimeSlotsProps) {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;

    setLoading(true);
    setError(null);
    setSelected(null);

    const dateStr = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    getAvailableSlots(slug, dateStr, doctorId)
      .then((result) => {
        if (result.error) {
          setError(result.error);
          setSlots([]);
        } else {
          setSlots(result.slots);
        }
      })
      .catch(() => setError("حدث خطأ أثناء تحميل المواعيد"))
      .finally(() => setLoading(false));
  }, [date, slug, doctorId]);

  return (
    <div className="w-full">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-6">
        <ArrowLeft size={16} />
        {doctorId ? "الطبيب" : "التاريخ"}
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
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-12 bg-muted animate-pulse rounded-xl border"
            />
          ))
        ) : error ? (
          <div className="col-span-2 text-center py-6 text-muted-foreground text-sm">
            <p>{error}</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="col-span-2 text-center py-6 text-muted-foreground text-sm">
            <p>لا توجد مواعيد متاحة في هذا اليوم</p>
          </div>
        ) : (
          slots.map((time) => (
            <Button
              key={time}
              variant={selected === time ? "default" : "outline"}
              className="rounded-xl h-12"
              onClick={() => setSelected(time)}
            >
              {formatTime12(time)}
            </Button>
          ))
        )}
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
