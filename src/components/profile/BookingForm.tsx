import React, { useState } from "react";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";

interface BookingFormProps {
  date: Date | null;
  time: string | null;
  onBack: () => void;
  onSubmit: (formData: any) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ date, time, onBack, onSubmit }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSubmit(formData);
    }, 1500);
  };

  return (
    <div className="w-full animate-in slide-in-from-right-8 duration-300">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-zinc-500 mb-6 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors w-min whitespace-nowrap">
        <ArrowLeft size={16} /> <span className="font-medium">Time</span>
      </button>

      <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-6 flex items-start gap-4">
        <div className="bg-white dark:bg-zinc-700/50 p-2.5 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
          <CalendarIcon size={20} className="text-zinc-600 dark:text-zinc-300" />
        </div>
        <div>
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base mb-0.5">
            {time}
          </h4>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">Full Name</label>
          <input required type="text" placeholder="John Doe" className="w-full px-4 py-3 bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">Email Address</label>
          <input required type="email" placeholder="john@example.com" className="w-full px-4 py-3 bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">Phone Number</label>
          <input required type="tel" placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">Additional Notes</label>
          <textarea rows={3} placeholder="Please share anything that will help prepare for our meeting." className="w-full px-4 py-3 bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all dark:text-white resize-none" />
        </div>

        <div className="pt-4 mt-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center transition-all ${
              loading
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 shadow-xl shadow-zinc-900/10 dark:shadow-none active:scale-95'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-zinc-400 dark:border-zinc-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Confirm Booking"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
