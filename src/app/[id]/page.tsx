"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  MessageCircle,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  Phone,
  Mail,
  Moon,
  Sun,
} from "lucide-react";

import ProfileHeader from "@/components/profile/ProfileHeader";
import BioSection from "@/components/profile/BioSection";
import ProfileLinks from "@/components/profile/ProfileLinks";
import ReviewSection from "@/components/profile/ReviewSection";
import SocialFooter from "@/components/profile/SocialFooter";
import BookingModal from "@/components/profile/BookingModal";

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
        <ProfileHeader doctor={DOCTOR} />

        {/* --- BIO SECTION --- */}
        <BioSection bio={DOCTOR.bio} experience={DOCTOR.experience} />

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
        <ProfileLinks links={DOCTOR.links} />

        {/* --- REVIEWS SECTION --- */}
        <ReviewSection reviews={DOCTOR.reviews} />

        {/* --- FOOTER SOCIALS --- */}
        <SocialFooter socials={DOCTOR.socials} />

        {/* CAL.COM STYLE BOOKING OVERLAY */}
        <BookingModal 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)} 
          doctorName={DOCTOR.name}
          timeSlots={TIME_SLOTS}
        />
        
      </div>
    </div>
  );
}
