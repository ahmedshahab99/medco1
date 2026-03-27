import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";

interface TimeSlotsProps {
  date: Date | null;
  timeSlots: string[];
  onSelectTime: (time: string) => void;
  onBack: () => void;
}

const TimeSlots: React.FC<TimeSlotsProps> = ({ date, timeSlots, onSelectTime, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, [date]);

  return (
    <div className="w-full animate-in slide-in-from-right-8 duration-300">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-zinc-500 mb-6 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors w-min whitespace-nowrap">
        <ArrowLeft size={16} /> <span className="font-medium">Date</span>
      </button>

      <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
        <CalendarIcon size={18} className="text-zinc-400" />
        {date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </h4>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-xl border border-zinc-200 dark:border-zinc-800"></div>
          ))
        ) : (
          timeSlots.map(time => (
            <button
              key={time}
              onClick={() => setSelected(time)}
              className={`py-3 px-2 text-sm rounded-xl border transition-all font-medium ${
                selected === time
                  ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900 shadow-md'
                  : 'bg-white dark:bg-[#111] border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'
              }`}
            >
              {time}
            </button>
          ))
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <button
          disabled={!selected}
          onClick={() => onSelectTime(selected!)}
          className={`px-8 py-3 rounded-xl font-semibold transition-all ${
            !selected
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
              : 'bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 shadow-lg active:scale-95'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default TimeSlots;
