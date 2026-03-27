import React from "react";
import { CheckCircle2, Calendar as CalendarIcon, Clock } from "lucide-react";

interface BookingSuccessProps {
  onClose: () => void;
  date: Date | null;
  time: string | null;
  doctorName: string;
}

const BookingSuccess: React.FC<BookingSuccessProps> = ({ onClose, date, time, doctorName }) => {
  return (
    <div className="py-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
      <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700">
        <CheckCircle2 size={32} />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Confirmed</h3>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-[280px]">
        Your meeting with {doctorName} has been scheduled.
      </p>

      <div className="bg-zinc-50 dark:bg-zinc-800/40 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-8 w-full">
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-zinc-200 dark:border-zinc-700/50">
          <CalendarIcon size={18} className="text-zinc-400" />
          <p className="font-semibold text-zinc-800 dark:text-zinc-200">{date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3">
          <Clock size={18} className="text-zinc-400" />
          <p className="font-semibold text-zinc-800 dark:text-zinc-200">{time}</p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-4 rounded-xl font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111] text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        Done
      </button>
    </div>
  );
};

export default BookingSuccess;
