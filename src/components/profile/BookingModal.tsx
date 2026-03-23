import React, { useState } from "react";
import { X } from "lucide-react";
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

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, doctorName, timeSlots }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSelectedDate(null);
      setSelectedTime(null);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-all overflow-hidden scrollbar-hide">
      <div className="bg-white dark:bg-[#111] w-full max-w-[480px] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-transparent dark:border-zinc-800 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 relative flex flex-col max-h-[95vh] sm:max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center z-10 sticky top-0 bg-white dark:bg-[#111] rounded-t-3xl">
          <div>
            {step < 4 && (
              <div className="text-xs font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase mb-1">Step {step} of 3</div>
            )}
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              {step === 1 ? 'Select a Date' : step === 2 ? 'Select a Time' : step === 3 ? 'Your Details' : ''}
            </h3>
          </div>
          <button onClick={resetAndClose} className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {step === 1 && <CalendarView onSelectDate={(date) => { setSelectedDate(date); setStep(2); }} />}
          {step === 2 && <TimeSlots date={selectedDate} timeSlots={timeSlots} onSelectTime={(time: string) => { setSelectedTime(time); setStep(3); }} onBack={() => setStep(1)} />}
          {step === 3 && <BookingForm date={selectedDate} time={selectedTime} onBack={() => setStep(2)} onSubmit={() => setStep(4)} />}
          {step === 4 && <BookingSuccess onClose={resetAndClose} date={selectedDate} time={selectedTime} doctorName={doctorName} />}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
