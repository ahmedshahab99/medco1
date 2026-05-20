"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import CalendarView from "./CalendarView";
import TimeSlots from "./TimeSlots";
import BookingForm from "./BookingForm";
import BookingSuccess from "./BookingSuccess";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
  timeSlots: string[];
}

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  doctorName,
  timeSlots,
}: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSelectedDate(null);
      setSelectedTime(null);
    }, 300);
  };

  const stepTitles: Record<number, string> = {
    1: "اختر التاريخ",
    2: "اختر الوقت",
    3: "بياناتك",
    4: "",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent
        className="max-h-[90vh] sm:max-h-[85vh] overflow-y-auto p-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        showCloseButton
      >
        <DialogHeader className="px-6 pt-4 pb-2 border-b sticky top-0 bg-popover z-10 rounded-t-xl">
          {step < 4 && (
            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-1">
              الخطوة {step} من 3
            </span>
          )}
          <DialogTitle>{stepTitles[step]}</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 pt-2">
          {step === 1 && (
            <CalendarView
              onSelectDate={(date: Date) => {
                setSelectedDate(date);
                setStep(2);
              }}
            />
          )}
          {step === 2 && (
            <TimeSlots
              date={selectedDate}
              timeSlots={timeSlots}
              onSelectTime={(time: string) => {
                setSelectedTime(time);
                setStep(3);
              }}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <BookingForm
              date={selectedDate}
              time={selectedTime}
              onBack={() => setStep(2)}
              onSubmit={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <BookingSuccess
              onClose={resetAndClose}
              date={selectedDate}
              time={selectedTime}
              doctorName={doctorName}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { BookingFormData };
