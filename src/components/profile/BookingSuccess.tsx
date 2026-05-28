"use client";

import { CheckCircle2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatTime12 } from "@/lib/date-utils";

interface BookingSuccessProps {
  onClose: () => void;
  date: Date | null;
  time: string | null;
  doctorName: string;
}

export default function BookingSuccess({
  onClose,
  date,
  time,
  doctorName,
}: BookingSuccessProps) {
  return (
    <div className="py-8 flex flex-col items-center text-center">
      <div className="size-20 bg-muted rounded-full flex items-center justify-center mb-6 text-foreground shadow-sm border">
        <CheckCircle2 size={32} />
      </div>
      <h3 className="text-2xl font-bold mb-2">تم التأكيد</h3>
      <p className="text-muted-foreground mb-8 max-w-[280px]">
        تم حجز موعدك مع {doctorName}
      </p>

      <div className="bg-muted/50 p-5 rounded-2xl border mb-8 w-full">
        <div className="flex items-center gap-3 mb-3 pb-3 border-b">
          <CalendarIcon size={18} className="text-muted-foreground" />
          <p className="font-semibold">
            {date?.toLocaleDateString("ar-SA", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Clock size={18} className="text-muted-foreground" />
          <p className="font-semibold">{time ? formatTime12(time) : ""}</p>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={onClose} size="lg">
        تم
      </Button>
    </div>
  );
}
