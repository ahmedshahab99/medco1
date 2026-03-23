"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar as CalendarIcon,
  MessageCircle,
  Globe,
  Instagram,
  Facebook,
  Star,
  Moon,
  Sun,
  Clock,
  X,
  CheckCircle2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

// --- MOCK DATA ---
const DOCTOR = {
  name: "Dr. Ahmed Hassan",
  specialization: "Senior Cardiologist",
  location: "HeartCare Clinic, Dubai",
  experience: "15+ Years Experience",
  image:
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=256&auto=format&fit=crop",
  bio: "Dedicated cardiologist with over 15 years of experience diagnosing and treating cardiovascular diseases. Passionate about patient education and preventive heart care.",
  links: [
    {
      id: 1,
      title: "WhatsApp Consultation",
      type: "whatsapp",
      url: "#",
      icon: MessageCircle,
      bgColor: "bg-emerald-500",
      hoverColor: "hover:bg-emerald-600",
      textColor: "text-white",
    },
    {
      id: 2,
      title: "Clinic Directions",
      type: "map",
      url: "#",
      icon: MapPin,
      bgColor: "bg-slate-100 dark:bg-zinc-800",
      hoverColor: "hover:bg-slate-200 dark:hover:bg-zinc-700",
      textColor: "text-slate-800 dark:text-zinc-100",
    },
    {
      id: 3,
      title: "Personal Website",
      type: "website",
      url: "#",
      icon: Globe,
      bgColor: "bg-slate-100 dark:bg-zinc-800",
      hoverColor: "hover:bg-slate-200 dark:hover:bg-zinc-700",
      textColor: "text-slate-800 dark:text-zinc-100",
    },
  ],
  socials: [
    { id: 1, icon: Instagram, url: "#" },
    { id: 2, icon: Facebook, url: "#" },
    { id: 3, icon: Phone, url: "#" },
    { id: 4, icon: Mail, url: "#" },
  ],
  reviews: [
    {
      id: 1,
      author: "Sarah M.",
      rating: 5,
      date: "2 weeks ago",
      text: "Dr. Ahmed is incredibly patient and thorough. He explained everything clearly.",
    },
    {
      id: 2,
      author: "Mohammed A.",
      rating: 5,
      date: "1 month ago",
      text: "Best cardiologist in the city. The clinic staff is also very welcoming.",
    },
  ],
};

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "11:00 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "04:30 PM",
];

// --- COMPONENTS ---

const CalendarView = ({ onSelectDate }: { onSelectDate: (date: Date) => void }) => {
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

const TimeSlots = ({ date, onSelectTime, onBack }: any) => {
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
          TIME_SLOTS.map(time => (
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
          onClick={() => onSelectTime(selected)}
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

const BookingForm = ({ date, time, onBack, onSubmit }: any) => {
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

const BookingSuccess = ({ onClose, date, time }: any) => {
  return (
    <div className="py-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
      <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700">
        <CheckCircle2 size={32} />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Confirmed</h3>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-[280px]">
        Your meeting with {DOCTOR.name} has been scheduled.
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

const BookingModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
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
          {step === 2 && <TimeSlots date={selectedDate} onSelectTime={(time: string) => { setSelectedTime(time); setStep(3); }} onBack={() => setStep(1)} />}
          {step === 3 && <BookingForm date={selectedDate} time={selectedTime} onBack={() => setStep(2)} onSubmit={() => setStep(4)} />}
          {step === 4 && <BookingSuccess onClose={resetAndClose} date={selectedDate} time={selectedTime} />}
        </div>
      </div>
    </div>
  );
};

export default function DoctorProfile() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "dark bg-[#0a0a0a]" : "bg-zinc-50"}`}>
      <div className="max-w-md mx-auto min-h-screen relative p-4 sm:p-6 lg:p-8 dark:text-zinc-100 text-zinc-900 pb-24">
        
        {/* Theme Toggle & Top Action */}
        <div className="flex justify-between items-center mb-8">
          <div className="w-10"></div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* --- PROFILE HEADER --- */}
        <header className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-5 p-1 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full shadow-lg shadow-blue-500/20">
            <img
              src={DOCTOR.image}
              alt={DOCTOR.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-[#0a0a0a]"
            />
            <div className="absolute bottom-1 right-1 bg-white dark:bg-[#0a0a0a] p-1.5 rounded-full shadow-sm text-blue-500 dark:text-blue-400">
              <CheckCircle2 size={16} className="fill-current text-white dark:text-[#0a0a0a]" 
                style={{ stroke: "currentColor", fill: "currentColor" }} />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 dark:text-white">
            {DOCTOR.name}
          </h1>
          <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
            {DOCTOR.specialization}
          </p>
          <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            <MapPin size={14} />
            <span>{DOCTOR.location}</span>
          </div>
        </header>

        {/* --- BIO SECTION --- */}
        <section className="bg-white dark:bg-zinc-900/70 rounded-3xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 mb-8 max-w-[400px] mx-auto text-center backdrop-blur-sm">
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
            {DOCTOR.bio}
          </p>
          <div className="inline-block bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700">
            {DOCTOR.experience}
          </div>
        </section>

        {/* --- QUICK ACTION - PRIMARY --- */}
        <div className="mb-6">
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-semibold text-lg transition-all active:scale-95 shadow-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 border border-transparent shadow-zinc-900/10"
          >
            <CalendarIcon size={20} />
            Book Appointment
          </button>
        </div>

        {/* --- LINKS SECTION --- */}
        <section className="flex flex-col gap-3 mb-10">
          {DOCTOR.links.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.id}
                href={link.url}
                className={`w-full flex items-center p-4 rounded-2xl transition-all active:scale-95 shadow-sm border border-zinc-200 dark:border-zinc-800 ${link.bgColor} ${link.hoverColor} ${link.textColor}`}
              >
                <div className="w-10 flex justify-center">
                  <Icon size={22} className={link.type === 'whatsapp' ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'} />
                </div>
                <span className="flex-1 font-medium text-center pr-10">
                  {link.title}
                </span>
              </a>
            );
          })}
        </section>

        {/* --- REVIEWS SECTION --- */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 dark:text-white px-2">Patient Reviews</h2>
          <div className="flex flex-col gap-4">
            {DOCTOR.reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-zinc-900/70 p-5 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-100">{review.author}</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < review.rating ? "fill-zinc-900 text-zinc-900 dark:fill-zinc-100 dark:text-zinc-100" : "fill-zinc-200 text-zinc-200 dark:fill-zinc-800 dark:text-zinc-800"} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-3">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 w-fit px-2 py-1 rounded-md">
                   <Clock size={12} /> {review.date}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- FOOTER SOCIALS --- */}
        <footer className="flex justify-center items-center gap-6 pt-6 pb-12 border-t border-zinc-200 dark:border-zinc-800">
          {DOCTOR.socials.map((social) => {
            const Icon = social.icon;
            return (
              <a key={social.id} href={social.url} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <Icon size={20} />
              </a>
            );
          })}
        </footer>

        {/* CAL.COM STYLE BOOKING OVERLAY */}
        <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
        
      </div>
    </div>
  );
}
