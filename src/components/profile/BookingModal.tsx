"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { getPublicClinicData } from "@/actions/public-booking";
import type { PublicClinicData } from "@/actions/public-booking";
import CalendarView from "./CalendarView";
import DoctorSelect from "./DoctorSelect";
import TimeSlots from "./TimeSlots";
import BookingForm from "./BookingForm";
import BookingSuccess from "./BookingSuccess";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  slug,
}: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedDoctorName, setSelectedDoctorName] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clinicData, setClinicData] = useState<PublicClinicData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && slug) {
      setDataLoading(true);
      setDataError(null);
      getPublicClinicData(slug)
        .then((data) => {
          if (data) {
            setClinicData(data);
          } else {
            setDataError("العيادة غير موجودة");
          }
        })
        .catch(() => setDataError("حدث خطأ أثناء تحميل البيانات"))
        .finally(() => setDataLoading(false));
    }
  }, [isOpen, slug]);

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSelectedDate(null);
      setSelectedDoctorId(null);
      setSelectedDoctorName("");
      setSelectedTime(null);
    }, 300);
  };

  const doctorCount = clinicData?.doctors.length ?? 0;

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (doctorCount === 1) {
      const doc = clinicData!.doctors[0];
      setSelectedDoctorId(doc.id);
      setSelectedDoctorName(
        [doc.firstName, doc.lastName].filter(Boolean).join(" ") || "الطبيب"
      );
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleDoctorSelect = (doctorId: string, doctorName: string) => {
    setSelectedDoctorId(doctorId);
    setSelectedDoctorName(doctorName);
    setStep(3);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(4);
  };

  const stepTitles: Record<number, string> = {
    1: "اختر التاريخ",
    2: "اختر الطبيب",
    3: "اختر الوقت",
    4: "بياناتك",
    5: "",
  };

  const totalSteps = doctorCount > 1 ? 4 : 3;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent
        className="max-h-[90vh] sm:max-h-[85vh] overflow-y-auto p-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] font-sans"
        showCloseButton
      >
        <DialogHeader className="px-6 pt-4 pb-2 border-b sticky top-0 bg-popover z-10 rounded-t-xl">
          {step < 5 && (
            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-1">
              الخطوة {step} من {totalSteps}
            </span>
          )}
          <DialogTitle>{stepTitles[step]}</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 pt-2">
          {dataLoading && (
            <div className="flex justify-center py-12">
              <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {dataError && (
            <div className="text-center py-8 text-muted-foreground">
              <p>{dataError}</p>
            </div>
          )}

          {!dataLoading && !dataError && clinicData && (
            <>
              {step === 1 && (
                <CalendarView
                  onSelectDate={handleDateSelect}
                  enabledDays={clinicData.enabledDays}
                  bookingWindow={clinicData.bookingWindow}
                />
              )}
              {step === 2 && doctorCount > 1 && (
                <DoctorSelect
                  slug={slug}
                  doctors={clinicData.doctors}
                  selectedDate={selectedDate}
                  onSelectDoctor={handleDoctorSelect}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && selectedDoctorId && (
                <TimeSlots
                  date={selectedDate}
                  slug={slug}
                  doctorId={selectedDoctorId}
                  onSelectTime={handleTimeSelect}
                  onBack={() => setStep(doctorCount > 1 ? 2 : 1)}
                />
              )}
              {step === 4 && (
                <BookingForm
                  date={selectedDate}
                  time={selectedTime}
                  slug={slug}
                  doctorId={selectedDoctorId!}
                  doctorName={selectedDoctorName}
                  onBack={() => setStep(3)}
                  onSuccess={(result) => {
                    setSelectedDoctorName(result.doctorName || selectedDoctorName);
                    setStep(5);
                  }}
                />
              )}
              {step === 5 && (
                <BookingSuccess
                  onClose={resetAndClose}
                  date={selectedDate}
                  time={selectedTime}
                  doctorName={selectedDoctorName}
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
