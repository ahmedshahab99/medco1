"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  ChevronRight, ChevronLeft, Calendar as CalendarIcon, 
  Filter, Plus, Search, User, Clock, CheckCircle, 
  XCircle, AlertCircle, Phone, FileText, Paperclip 
} from "lucide-react";
import { format, addDays, subDays, isSameDay, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import { arSA } from "date-fns/locale/ar-SA";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";

// ------------- TYPES -------------

type ApptStatus = 'confirmed' | 'pending' | 'arrived' | 'no_show' | 'cancelled';

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  service: string;
  status: ApptStatus;
  startTime: Date;
  endTime: Date;
  notes?: string;
  colorClass: string;
}

// ------------- MOCK DATA -------------

const today = startOfDay(new Date());

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    patientName: "أحمد عبدالله",
    patientPhone: "0501234567",
    service: "استشارة قلبية",
    status: "confirmed",
    startTime: new Date(today.setHours(9, 0, 0, 0)),
    endTime: new Date(today.setHours(9, 45, 0, 0)),
    notes: "المريض يعاني من ألم متقطع في الصدر.",
    colorClass: "bg-blue-50 border-blue-200 text-blue-700",
  },
  {
    id: "2",
    patientName: "سارة محمد",
    patientPhone: "0509876543",
    service: "مراجعة تحاليل",
    status: "pending",
    startTime: new Date(today.setHours(11, 30, 0, 0)),
    endTime: new Date(today.setHours(12, 0, 0, 0)),
    colorClass: "bg-amber-50 border-amber-200 text-amber-700",
  },
  {
    id: "3",
    patientName: "خالد فهد",
    patientPhone: "0551122334",
    service: "فحص روتيني",
    status: "arrived",
    startTime: new Date(today.setHours(14, 0, 0, 0)),
    endTime: new Date(today.setHours(15, 0, 0, 0)),
    notes: "أول زيارة للمريض للعيادة.",
    colorClass: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  {
    id: "4",
    patientName: "نورة عبدالرحمن",
    patientPhone: "0559988776",
    service: "استشارة عن بعد",
    status: "cancelled",
    startTime: new Date(today.setHours(16, 0, 0, 0)),
    endTime: new Date(today.setHours(16, 30, 0, 0)),
    colorClass: "bg-red-50 border-red-200 text-red-700",
  }
];

const STATUS_MAP: Record<ApptStatus, { label: string, icon: React.ElementType, badgeClass: string }> = {
  confirmed: { label: "مؤكد", icon: CheckCircle, badgeClass: "bg-blue-100 text-blue-700" },
  pending: { label: "قيد الانتظار", icon: Clock, badgeClass: "bg-amber-100 text-amber-700" },
  arrived: { label: "تم الوصول", icon: User, badgeClass: "bg-emerald-100 text-emerald-700" },
  no_show: { label: "لم يحضر", icon: AlertCircle, badgeClass: "bg-slate-100 text-slate-700" },
  cancelled: { label: "ملغي", icon: XCircle, badgeClass: "bg-red-100 text-red-700" },
};

// ------------- HELPER CONSTANTS -------------
const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_HEIGHT = 120; // 120px per hour for lots of breathing room and precision

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "agenda">("day");
  
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  
  const [isNewApptModalOpen, setIsNewApptModalOpen] = useState(false);
  const [currentTimeLine, setCurrentTimeLine] = useState<number | null>(null);

  // Filter appointments for the current day
  const dailyAppointments = useMemo(() => {
    return appointments.filter(appt => isSameDay(appt.startTime, currentDate));
  }, [appointments, currentDate]);

  // Update real-time line
  useEffect(() => {
    const updateTimeLine = () => {
      const now = new Date();
      if (isSameDay(now, currentDate)) {
        const hours = now.getHours() + (now.getMinutes() / 60);
        if (hours >= START_HOUR && hours <= END_HOUR) {
          const top = (hours - START_HOUR) * HOUR_HEIGHT;
          setCurrentTimeLine(top);
          return;
        }
      }
      setCurrentTimeLine(null);
    };
    
    updateTimeLine();
    const interval = setInterval(updateTimeLine, 60000); // update every minute
    return () => clearInterval(interval);
  }, [currentDate]);

  const handlePrev = () => {
    if (viewMode === "week") setCurrentDate(prev => subDays(prev, 7));
    else if (viewMode === "month") setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    else setCurrentDate(prev => subDays(prev, 1));
  };
  const handleNext = () => {
    if (viewMode === "week") setCurrentDate(prev => addDays(prev, 7));
    else if (viewMode === "month") setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    else setCurrentDate(prev => addDays(prev, 1));
  };
  const handleToday = () => setCurrentDate(new Date());

  // Week view calculations
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 0 }), [currentDate]);
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Month view calculations
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);
  const monthGridStart = useMemo(() => startOfWeek(monthStart, { weekStartsOn: 0 }), [monthStart]);
  const monthGridEnd = useMemo(() => endOfWeek(monthEnd, { weekStartsOn: 0 }), [monthEnd]);
  const monthDays = useMemo(() => {
    return eachDayOfInterval({ start: monthGridStart, end: monthGridEnd });
  }, [monthGridStart, monthGridEnd]);

  // Hours array for grid
  const hoursArray = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 shrink-0 z-10">
        
        {/* Left: Date Nav */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleToday} className="font-semibold px-4">
            اليوم
          </Button>
          <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 border border-slate-100">
            <button onClick={handlePrev} className="p-1 hover:bg-white rounded-md transition-colors shadow-sm">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
            <button onClick={handleNext} className="p-1 hover:bg-white rounded-md transition-colors shadow-sm">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-slate-800 min-w-[200px] flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            {viewMode === "week" ? (
              `${format(weekStart, "d MMM", { locale: arSA })} - ${format(endOfWeek(currentDate, { weekStartsOn: 0 }), "d MMM yyyy", { locale: arSA })}`
            ) : viewMode === "month" ? (
              format(currentDate, "MMMM yyyy", { locale: arSA })
            ) : (
              format(currentDate, "EEEE، d MMMM yyyy", { locale: arSA })
            )}
          </h2>
        </div>

        {/* Center: View Switcher */}
        <div className="flex items-center p-1 bg-slate-50 border border-slate-100 rounded-lg self-start md:self-auto">
          {(["day", "week", "month", "agenda"] as const).map(mode => (
            <button 
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === mode ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              {mode === "day" && "يوم"}
              {mode === "week" && "أسبوع"}
              {mode === "month" && "شهر"}
              {mode === "agenda" && "أجندة"}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            فلترة
          </Button>
          <Button size="sm" className="gap-2 shrink-0" onClick={() => setIsNewApptModalOpen(true)}>
            <Plus className="w-4 h-4" />
            موعد جديد
          </Button>
        </div>
      </div>

      {/* CALENDAR BODY */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col relative">
        
        {/* DAY VIEW SCOPE */}
        {viewMode === "day" && (
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div className="min-w-[800px]">
              {/* Header row for 'Day' view is practically just spacing over the timeline */}
              <div className="sticky top-0 bg-white/95 backdrop-blur z-20 flex border-b border-slate-100">
                <div className="w-24 shrink-0 text-center py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-l border-slate-100">
                  الوقت
                </div>
                <div className="flex-1 py-3 px-4 flex justify-center">
                   <div className="text-center">
                     <div className="font-bold text-slate-800 text-lg">{format(currentDate, "EEEE", { locale: arSA })}</div>
                     <div className="text-sm text-slate-500">{format(currentDate, "d MMM", { locale: arSA })}</div>
                   </div>
                </div>
              </div>

              {/* Grid content */}
              <div className="flex relative" style={{ height: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT}px` }}>
                
                {/* Time labels column */}
                <div className="w-24 shrink-0 border-l border-slate-100 relative bg-slate-50/30">
                  {hoursArray.map((hour, index) => {
                    const ampm = hour >= 12 ? 'م' : 'ص';
                    const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                    return (
                      <div 
                        key={hour} 
                        className="absolute w-full text-center text-sm font-medium text-slate-500 -mt-3 pr-2"
                        style={{ top: `${index * HOUR_HEIGHT}px` }}
                      >
                       {h12}:00 {ampm}
                      </div>
                    );
                  })}
                </div>

                {/* Tracking Area */}
                <div className="flex-1 relative cursor-pointer hover:bg-slate-50/30 transition-colors" onClick={() => setIsNewApptModalOpen(true)}>
                  
                  {/* Horizontal Guide Lines */}
                  {hoursArray.map((hour, index) => (
                    <div 
                      key={`grid-${hour}`}
                      className="absolute w-full border-t border-slate-100"
                      style={{ top: `${index * HOUR_HEIGHT}px` }}
                    />
                  ))}
                  
                  {/* Half-hour guide lines */}
                  {hoursArray.slice(0, -1).map((hour, index) => (
                    <div 
                      key={`grid-half-${hour}`}
                      className="absolute w-full border-t border-slate-50 border-dashed"
                      style={{ top: `${index * HOUR_HEIGHT + (HOUR_HEIGHT / 2)}px` }}
                    />
                  ))}

                  {/* Current Time Indicator logic */}
                  {currentTimeLine !== null && (
                    <div 
                       className="absolute right-0 left-0 z-10 pointer-events-none"
                       style={{ top: `${currentTimeLine}px` }}
                    >
                      <div className="absolute right-[-6px] top-[-5px] w-2.5 h-2.5 rounded-full bg-red-500 z-10" />
                      <div className="border-t-2 border-red-500 relative shadow-sm" />
                    </div>
                  )}

                  {/* Render Appointments */}
                  {dailyAppointments.map((appt) => {
                    // Calculation for Y and Height
                    const startH = appt.startTime.getHours() + (appt.startTime.getMinutes() / 60);
                    const endH = appt.endTime.getHours() + (appt.endTime.getMinutes() / 60);
                    
                    if (startH < START_HOUR || startH > END_HOUR) return null; // out of scope
                    
                    const topOffset = (startH - START_HOUR) * HOUR_HEIGHT;
                    const durationInH = endH - startH;
                    const height = durationInH * HOUR_HEIGHT;
                    const StatusIcon = STATUS_MAP[appt.status].icon;

                    return (
                      <div
                        key={appt.id}
                        className={`absolute right-4 left-4 rounded-xl border p-3 flex flex-col overflow-hidden transition-all hover:shadow-md hover:z-20 cursor-pointer shadow-sm ${appt.colorClass}`}
                        style={{ top: `${topOffset}px`, height: `${height}px` }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppt(appt);
                        }}
                      >
                        <div className="flex justify-between items-start mb-1 h-full flex-col sm:flex-row gap-1">
                           <div>
                             <h4 className="font-bold text-sm line-clamp-1">{appt.patientName}</h4>
                             <p className="text-xs font-medium opacity-80 mt-0.5 line-clamp-1">{appt.service}</p>
                           </div>
                           <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="text-xs font-semibold whitespace-nowrap bg-white/50 px-2 py-0.5 rounded-md">
                                {format(appt.startTime, "h:mm a")} - {format(appt.endTime, "h:mm a")}
                              </span>
                              {height > 60 && (
                                <StatusIcon className="w-4 h-4 opacity-70 mt-1" />
                              )}
                           </div>
                        </div>
                        {height > 100 && appt.notes && (
                          <div className="mt-auto pt-2 border-t border-current/10">
                            <p className="text-xs opacity-80 line-clamp-2">{appt.notes}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WEEK VIEW SCOPE */}
        {viewMode === "week" && (
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            <div className="min-w-[1000px]">
              {/* Header row for 'Week' view */}
              <div className="sticky top-0 bg-white/95 backdrop-blur z-30 flex border-b border-slate-100">
                <div className="w-20 shrink-0 text-center py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-l border-slate-100 z-30 bg-white/95">
                  الوقت
                </div>
                <div className="flex-1 flex">
                  {weekDays.map(day => {
                    const isToday = isSameDay(day, new Date());
                    return (
                      <div key={day.toISOString()} className="flex-1 py-3 px-2 flex justify-center border-l border-slate-100 last:border-l-0">
                         <div className={`text-center px-4 py-1.5 rounded-xl ${isToday ? 'bg-blue-50' : ''}`}>
                           <div className={`font-bold text-sm ${isToday ? 'text-blue-700' : 'text-slate-800'}`}>
                             {format(day, "EEEE", { locale: arSA })}
                           </div>
                           <div className={`text-xs mt-0.5 ${isToday ? 'text-blue-600 font-semibold' : 'text-slate-500'}`}>
                             {format(day, "d MMM", { locale: arSA })}
                           </div>
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid content */}
              <div className="flex relative" style={{ height: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT}px` }}>
                
                {/* Time labels column */}
                <div className="w-20 shrink-0 border-l border-slate-100 relative bg-slate-50/30">
                  {hoursArray.map((hour, index) => {
                    const ampm = hour >= 12 ? 'م' : 'ص';
                    const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                    return (
                      <div 
                        key={hour} 
                        className="absolute w-full text-center text-xs font-medium text-slate-500 -mt-2 pr-1"
                        style={{ top: `${index * HOUR_HEIGHT}px` }}
                      >
                       {h12}:00 {ampm}
                      </div>
                    );
                  })}
                </div>

                {/* Week Columns Wrapper */}
                <div className="flex-1 flex relative bg-slate-50/10">
                  
                  {/* Background Grid Lines */}
                  <div className="absolute inset-0 pointer-events-none z-0">
                    {hoursArray.map((hour, index) => (
                      <div 
                        key={`grid-week-${hour}`}
                        className="absolute w-full border-t border-slate-100"
                        style={{ top: `${index * HOUR_HEIGHT}px` }}
                      />
                    ))}
                    {hoursArray.slice(0, -1).map((hour, index) => (
                      <div 
                        key={`grid-half-week-${hour}`}
                        className="absolute w-full border-t border-slate-50 border-dashed"
                        style={{ top: `${index * HOUR_HEIGHT + (HOUR_HEIGHT / 2)}px` }}
                      />
                    ))}
                  </div>

                  {/* Day Columns */}
                  {weekDays.map(day => {
                    const dayAppointments = appointments.filter(appt => isSameDay(appt.startTime, day));
                    const isToday = isSameDay(day, new Date());

                    return (
                      <div 
                        key={day.toISOString()} 
                        className="flex-1 relative cursor-pointer hover:bg-slate-50/50 transition-colors border-l border-slate-100 last:border-l-0 z-10" 
                        onClick={() => {
                          setCurrentDate(day);
                          setIsNewApptModalOpen(true);
                        }}
                      >
                        {/* Current Time Indicator logic */}
                        {isToday && currentTimeLine !== null && (
                          <div 
                             className="absolute right-0 left-0 z-20 pointer-events-none"
                             style={{ top: `${currentTimeLine}px` }}
                          >
                            <div className="absolute right-[-4px] top-[-4px] w-2 h-2 rounded-full bg-red-500 z-10" />
                            <div className="border-t-[1.5px] border-red-500 relative shadow-sm" />
                          </div>
                        )}

                        {/* Render Appointments */}
                        {dayAppointments.map((appt) => {
                          const startH = appt.startTime.getHours() + (appt.startTime.getMinutes() / 60);
                          const endH = appt.endTime.getHours() + (appt.endTime.getMinutes() / 60);
                          
                          if (startH < START_HOUR || startH > END_HOUR) return null;
                          
                          const topOffset = (startH - START_HOUR) * HOUR_HEIGHT;
                          const height = (endH - startH) * HOUR_HEIGHT;

                          return (
                            <div
                              key={appt.id}
                              className={`absolute right-1.5 left-1.5 rounded-lg border p-1.5 flex flex-col overflow-hidden transition-all hover:shadow-md hover:z-30 cursor-pointer shadow-sm ${appt.colorClass}`}
                              style={{ top: `${topOffset}px`, height: `${height}px` }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAppt(appt);
                              }}
                            >
                              <div className="flex flex-col h-full gap-0.5 relative">
                                 <h4 className="font-bold text-[11px] leading-tight line-clamp-1">{appt.patientName}</h4>
                                 {height >= 45 && (
                                   <p className="text-[10px] font-medium opacity-80 leading-tight line-clamp-1">{appt.service}</p>
                                 )}
                                 {height >= 60 && (
                                   <div className="mt-auto text-[10px] font-semibold opacity-80 flex items-center justify-between">
                                     <span dir="ltr">{format(appt.startTime, "h:mm")}</span>
                                     {React.createElement(STATUS_MAP[appt.status].icon, { className: "w-3 h-3" })}
                                   </div>
                                 )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MONTH VIEW SCOPE */}
        {viewMode === "month" && (
          <div className="flex-1 flex flex-col p-4 overflow-hidden min-h-[600px] overflow-y-auto">
            <div className="min-w-[800px] flex-1 flex flex-col h-full">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-2 mb-2 shrink-0">
                {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider py-2 bg-slate-50/50 rounded-xl border border-slate-100/50">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Month Grid */}
              <div className="flex-1 grid grid-cols-7 auto-rows-fr gap-2">
                {monthDays.map(day => {
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isToday = isSameDay(day, new Date());
                  const dayAppointments = appointments.filter(appt => isSameDay(appt.startTime, day));
                  
                  return (
                    <div 
                      key={day.toISOString()}
                      onClick={() => {
                        setCurrentDate(day);
                        if (dayAppointments.length > 0) {
                          setViewMode("day");
                        } else {
                          setIsNewApptModalOpen(true);
                        }
                      }}
                      className={`
                        min-h-[100px] p-2 flex flex-col rounded-2xl border transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5
                        ${isCurrentMonth ? 'bg-white border-slate-100' : 'bg-slate-50/50 border-transparent text-slate-400 opacity-60 hover:opacity-100'}
                        ${isToday ? 'ring-2 ring-blue-500 shadow-sm' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`
                          w-7 h-7 flex items-center justify-center text-sm font-bold rounded-full
                          ${isToday ? 'bg-blue-600 text-white shadow-sm ring-4 ring-blue-50' : isCurrentMonth ? 'text-slate-700 bg-slate-50' : 'text-slate-400'}
                        `}>
                          {format(day, 'd')}
                        </span>
                        {dayAppointments.length > 0 && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full">
                            {dayAppointments.length}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 overflow-hidden">
                        {dayAppointments.slice(0, 3).map(appt => (
                          <div 
                            key={appt.id} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppt(appt);
                            }}
                            className={`text-[10px] px-2 py-1.5 rounded-lg font-medium leading-tight line-clamp-1 border transition-all hover:brightness-95 ${appt.colorClass}`}
                          >
                            <span dir="ltr" className="mr-1 font-semibold opacity-80 inline-block">{format(appt.startTime, "h:mm")}</span> 
                            {appt.patientName}
                          </div>
                        ))}
                        {dayAppointments.length > 3 && (
                          <div className="text-[10px] text-slate-500 font-bold px-1 mt-0.5 hover:text-blue-600 transition-colors">
                            عرض {dayAppointments.length - 3} موعد إضافي...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MOCKUP PLACEHOLDERS FOR OTHER VIEWS */}
        {viewMode === "agenda" && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12">
            <CalendarIcon className="w-16 h-16 mb-4 text-slate-200" />
            <h2 className="text-xl font-bold text-slate-700 mb-2">قيد التطوير</h2>
            <p className="text-slate-500 max-w-sm text-center">عرض الـ (agenda) جاري العمل عليه الآن، يمكنك اختبار العروض الأخرى المتاحة.</p>
          </div>
        )}
      </div>

      {/* ----------------- MODALS ----------------- */}
      
      {/* Appointment Detail Modal */}
      <Modal isOpen={!!selectedAppt} onClose={() => setSelectedAppt(null)} title="تفاصيل الموعد">
        {selectedAppt && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
               <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                 {selectedAppt.patientName.charAt(0)}
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-slate-900 text-lg">{selectedAppt.patientName}</h3>
                 <p className="text-slate-500 text-sm flex items-center gap-1 mt-0.5">
                   <Phone className="w-3.5 h-3.5" />
                   <span dir="ltr">{selectedAppt.patientPhone}</span>
                 </p>
               </div>
               <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 text-sm font-semibold ${STATUS_MAP[selectedAppt.status].badgeClass}`}>
                  {React.createElement(STATUS_MAP[selectedAppt.status].icon, { className: "w-4 h-4" })}
                  {STATUS_MAP[selectedAppt.status].label}
               </div>
            </div>

            {/* Mock Tabs Structure */}
            <div className="flex border-b border-slate-100">
              <button className="px-4 py-2 text-sm font-semibold text-blue-600 border-b-2 border-blue-600">التفاصيل</button>
              <button className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:border-b-2 hover:border-slate-300 transition-colors">ملاحظات الطبيب</button>
              <button className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:border-b-2 hover:border-slate-300 transition-colors">الملفات</button>
            </div>

            <div className="space-y-4">
               <div>
                 <p className="text-sm text-slate-500 font-medium mb-1">الخدمة الطبية</p>
                 <p className="font-semibold text-slate-800">{selectedAppt.service}</p>
               </div>
               <div>
                 <p className="text-sm text-slate-500 font-medium mb-1">تاريخ ووقت الموعد</p>
                 <p className="font-semibold text-slate-800 flex items-center gap-2">
                   {format(selectedAppt.startTime, "dd MMMM yyyy", { locale: arSA })}
                   <span className="text-slate-400">|</span>
                   <span dir="ltr" className="font-mono text-sm">{format(selectedAppt.startTime, "hh:mm a")} - {format(selectedAppt.endTime, "hh:mm a")}</span>
                 </p>
               </div>
               {selectedAppt.notes && (
                 <div>
                   <p className="text-sm text-slate-500 font-medium mb-1">ملاحظات مبدئية</p>
                   <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm leading-relaxed text-slate-700">
                     {selectedAppt.notes}
                   </div>
                 </div>
               )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3 flex-wrap">
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                 تأكيد الحضور
              </Button>
              <Button variant="outline" className="flex-1 border-slate-200">
                 إعادة جدولة
              </Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-transparent">
                 إلغاء الموعد
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* New Appointment Modal */}
      <Modal isOpen={isNewApptModalOpen} onClose={() => setIsNewApptModalOpen(false)} title="حجز موعد جديد">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">ابحث عن مريض أو أضف مريض جديد</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input className="pr-10" placeholder="اسم المريض، رقم الملف، الهاتف..." />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">الخدمة الطبية</label>
            <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none">
              <option disabled selected>اختر الخدمة...</option>
              <option>استشارة طبية عامة (30 دقيقة)</option>
              <option>مراجعة نتائج (15 دقيقة)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">التاريخ</label>
                <Input type="date" value={format(currentDate, "yyyy-MM-dd")} />
             </div>
             <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">وقت البدء</label>
                <Input type="time" dir="ltr" className="text-right" />
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">ملاحظات (اختياري)</label>
            <Textarea placeholder="أضف أي ملاحظات قبل الزيارة..." className="h-24" />
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsNewApptModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => setIsNewApptModalOpen(false)}>
              تأكيد الحجز
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
