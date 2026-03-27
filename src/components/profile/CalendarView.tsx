import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewProps {
  onSelectDate: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="w-full animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h4>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <ChevronLeft size={16} className="text-zinc-600 dark:text-zinc-400" />
          </button>
          <button onClick={nextMonth} className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <ChevronRight size={16} className="text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-xs font-medium text-zinc-400 uppercase tracking-wider py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {padding.map(i => <div key={`pad-${i}`} className="p-2" />)}
        {days.map(day => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isPast = date < today;
          // Mock unavailability (e.g. Sundays and every 4th day)
          const isUnavailable = date.getDay() === 0 || day % 4 === 0;
          const disabled = isPast || (isUnavailable && !isPast);
          const isToday = date.getTime() === today.getTime();

          return (
            <button
              key={day}
              disabled={disabled}
              onClick={() => onSelectDate(date)}
              className={`
                aspect-square flex items-center justify-center rounded-xl text-sm transition-all
                ${disabled
                  ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                  : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white font-medium cursor-pointer'
                }
                ${isToday && !disabled ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
