"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { 
  ChevronRight, ChevronLeft, Calendar as CalendarIcon, 
  Filter, Plus, Search, User, Clock, CheckCircle, 
  XCircle, AlertCircle, Phone, FileText, Paperclip,
  Users, Trash2, Edit2, PlusCircle, ArrowRight,
  CreditCard, Wallet, RotateCcw, Archive
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
  treatmentNote?: string;
  appointmentNumber?: number;
  caseName?: string;
  colorClass: string;
}

type InteractionType = 'drag' | 'resize';

interface InteractionState {
  apptId: string;
  type: InteractionType;
  startPointerY: number;
  startPointerX: number;
  originalStartTime: Date;
  originalEndTime: Date;
  currentStartTime: Date;
  currentEndTime: Date;
  currentDayIndex?: number; // for week view
}

interface WaitlistEntry {
  id: string;
  patientName: string;
  patientPhone: string;
  appointmentType: string;
  notes?: string;
  addedAt: Date;
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
    treatmentNote: "ضغط الدم 140/90. تم طلب فحوصات إضافية.",
    appointmentNumber: 1,
    caseName: "متابعة ضغط الدم",
    colorClass: "bg-blue-600 border-blue-700 text-white",
  },
  {
    id: "2",
    patientName: "سارة محمد",
    patientPhone: "0509876543",
    service: "مراجعة تحاليل",
    status: "pending",
    startTime: new Date(today.setHours(11, 30, 0, 0)),
    endTime: new Date(today.setHours(12, 0, 0, 0)),
    appointmentNumber: 3,
    caseName: "صداع نصفي مزمن",
    colorClass: "bg-blue-600 border-blue-700 text-white",
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
    appointmentNumber: 1,
    colorClass: "bg-emerald-600 border-emerald-700 text-white",
  },
  {
    id: "4",
    patientName: "نورة عبدالرحمن",
    patientPhone: "0559988776",
    service: "استشارة عن بعد",
    status: "cancelled",
    startTime: new Date(today.setHours(16, 0, 0, 0)),
    endTime: new Date(today.setHours(16, 30, 0, 0)),
    appointmentNumber: 2,
    colorClass: "bg-red-500 border-red-600 text-white",
  },
  {
    id: "5",
    patientName: "ليلى أحمد",
    patientPhone: "0555555555",
    service: "تخطيط قلب",
    status: "confirmed",
    startTime: new Date(today.setHours(9, 15, 0, 0)),
    endTime: new Date(today.setHours(10, 0, 0, 0)),
    appointmentNumber: 1,
    colorClass: "bg-blue-600 border-blue-700 text-white",
  }
];

const MOCK_WAITLIST: WaitlistEntry[] = [
  {
    id: "w1",
    patientName: "محمد الراجحي",
    patientPhone: "0554433221",
    appointmentType: "استشارة طبية عامة",
    notes: "يفضل موعد في الفترة الصباحية",
    addedAt: new Date(new Date().getTime() - 1000 * 60 * 120), // 2 hours ago
  },
  {
    id: "w2",
    patientName: "فاطمة الزهراء",
    patientPhone: "0505500600",
    appointmentType: "مراجعة نتائج",
    addedAt: new Date(new Date().getTime() - 1000 * 60 * 45), // 45 mins ago
  },
  {
    id: "w3",
    patientName: "ياسر القحطاني",
    patientPhone: "0567788990",
    appointmentType: "استشارة قلبية",
    notes: "حالة مستعجلة",
    addedAt: new Date(new Date().getTime() - 1000 * 60 * 10), // 10 mins ago
  }
];

const MOCK_DOCTORS = [
  { id: "d1", name: "د. عبدالمحسن العتيبي", specialty: "استشاري قلب" },
  { id: "d2", name: "د. سمية المطيري", specialty: "استشارية أعصاب" },
  { id: "d3", name: "د. فيصل السعيد", specialty: "طبيب عام" },
];

const MOCK_PATIENTS = [
  { id: "p1", name: "أحمد عبدالله", phone: "0501234567" },
  { id: "p2", name: "سارة محمد", phone: "0509876543" },
  { id: "p3", name: "خالد فهد", phone: "0551122334" },
];

const MOCK_CASES: Record<string, { id: string; title: string; createdAt: Date }[]> = {
  "p1": [{ id: "c1", title: "متابعة ضغط الدم", createdAt: subDays(new Date(), 30) }],
  "p2": [{ id: "c2", title: "صداع نصفي مزمن", createdAt: subDays(new Date(), 15) }],
};

const STATUS_MAP: Record<ApptStatus, { label: string, icon: React.ElementType, badgeClass: string }> = {
  confirmed: { label: "مؤكد", icon: CheckCircle, badgeClass: "bg-blue-100 text-blue-700" },
  pending: { label: "قيد الانتظار", icon: Clock, badgeClass: "bg-blue-100 text-blue-700" },
  arrived: { label: "تم الوصول", icon: User, badgeClass: "bg-emerald-100 text-emerald-700" },
  no_show: { label: "لم يحضر", icon: AlertCircle, badgeClass: "bg-red-100 text-red-700" },
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
  
  const [interaction, setInteraction] = useState<InteractionState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wasMovedRef = useRef(false);
  const blockClickRef = useRef(false);

  // Waitlist State
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(MOCK_WAITLIST);
  const [isAddingWaitlist, setIsAddingWaitlist] = useState(false);
  const [editingWaitlistId, setEditingWaitlistId] = useState<string | null>(null);
  
  // Waitlist Form State (for simple waitlist modal)
  const [waitlistForm, setWaitlistForm] = useState({
    patientName: "",
    patientPhone: "",
    appointmentType: "استشارة طبية عامة",
    notes: "",
    isNewPatient: false
  });

  // NEW APPOINTMENT FORM STATE
  const [newApptForm, setNewApptForm] = useState({
    doctorId: MOCK_DOCTORS[0].id,
    appointmentType: "استشارة طبية عامة (30 دقيقة)",
    patientMode: "existing" as 'existing' | 'new' | 'waitlist',
    patientId: "", 
    waitlistId: "",
    newPatientName: "",
    newPatientPhone: "",
    caseMode: "existing" as 'existing' | 'new',
    caseId: "",
    newCaseTitle: "",
    newCaseNote: "",
    date: format(currentDate, "yyyy-MM-dd"),
    startTime: "09:00",
    notes: ""
  });

  // Modal Panel State
  const [apptDetailPanel, setApptDetailPanel] = useState<'none' | 'payment' | 'notes' | 'reschedule'>('none');
  const [tempTreatmentNote, setTempTreatmentNote] = useState("");
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });

  // Update functions
  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    if (selectedAppt?.id === id) {
      setSelectedAppt(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleArrived = (appt: Appointment) => updateAppointment(appt.id, { status: "arrived", colorClass: "bg-emerald-600 border-emerald-700 text-white" });
  const handleNoShow = (appt: Appointment) => updateAppointment(appt.id, { status: "no_show", colorClass: "bg-red-600 border-red-700 text-white" });
  const handleCancelAppt = (apptId: string) => {
    updateAppointment(apptId, { status: "cancelled", colorClass: "bg-red-600 border-red-700 text-white" });
    setSelectedAppt(null);
  };
  const handleArchiveAppt = (apptId: string) => {
    setAppointments(prev => prev.filter(a => a.id !== apptId));
    setSelectedAppt(null);
  };

  const saveTreatmentNote = () => {
    if (selectedAppt) {
      updateAppointment(selectedAppt.id, { treatmentNote: tempTreatmentNote });
      setApptDetailPanel('none');
    }
  };

  useEffect(() => {
    if (selectedAppt) {
      setTempTreatmentNote(selectedAppt.treatmentNote || "");
      setApptDetailPanel('none');
    }
  }, [selectedAppt]);

  // Sync date when currentDate changes
  useEffect(() => {
    setNewApptForm(prev => ({ ...prev, date: format(currentDate, "yyyy-MM-dd") }));
  }, [currentDate]);

  // ------------- HELPERS -------------

  const snapToQuarter = (date: Date): Date => {
    const minutes = date.getMinutes();
    const snappedMinutes = Math.round(minutes / 15) * 15;
    const newDate = new Date(date);
    newDate.setMinutes(snappedMinutes);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
  };

  const pixelsToTime = (y: number, baseDate: Date): Date => {
    const hoursDecimal = (y / HOUR_HEIGHT) + START_HOUR;
    const hours = Math.floor(hoursDecimal);
    const minutes = Math.round((hoursDecimal - hours) * 60);
    
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const getTimeFromPointer = (e: React.PointerEvent | PointerEvent, baseDate: Date) => {
    if (!containerRef.current) return baseDate;
    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top + containerRef.current.scrollTop;
    return pixelsToTime(y, baseDate);
  };

  // ------------- EVENT HANDLERS -------------

  const onInteractionStart = (e: React.PointerEvent, appt: Appointment, type: InteractionType) => {
    // Only allow interactions in 'day' view
    if (viewMode !== 'day') return;
    // Only allow drag/resize for certain statuses
    if (appt.status === 'cancelled') return;
    
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setInteraction({
      apptId: appt.id,
      type,
      startPointerY: e.clientY,
      startPointerX: e.clientX,
      originalStartTime: new Date(appt.startTime),
      originalEndTime: new Date(appt.endTime),
      currentStartTime: new Date(appt.startTime),
      currentEndTime: new Date(appt.endTime),
    });
  };

  const onInteractionMove = useCallback((e: PointerEvent) => {
    if (!interaction) return;

    if (!wasMovedRef.current) {
        // Small threshold to prevent unintended drag detection
        if (Math.abs(e.clientY - interaction.startPointerY) > 5) {
            wasMovedRef.current = true;
        }
    }

    const deltaY = e.clientY - interaction.startPointerY;
    const deltaH = (deltaY / HOUR_HEIGHT);
    const deltaMs = deltaH * 60 * 60 * 1000;

    if (interaction.type === 'drag') {
      const newStart = new Date(interaction.originalStartTime.getTime() + deltaMs);
      const duration = interaction.originalEndTime.getTime() - interaction.originalStartTime.getTime();
      
      // Snapping
      const snappedStart = snapToQuarter(newStart);
      
      // Clamping to grid hours
      const gridStart = new Date(snappedStart);
      gridStart.setHours(START_HOUR, 0, 0, 0);
      const gridEnd = new Date(snappedStart);
      gridEnd.setHours(END_HOUR, 0, 0, 0);
      
      let finalStart = snappedStart;
      if (finalStart.getHours() < START_HOUR) {
        finalStart = new Date(finalStart);
        finalStart.setHours(START_HOUR, 0, 0, 0);
      }
      const potentialEnd = new Date(finalStart.getTime() + duration);
      if (potentialEnd.getHours() > END_HOUR || (potentialEnd.getHours() === END_HOUR && potentialEnd.getMinutes() > 0)) {
          finalStart = new Date(potentialEnd);
          finalStart.setHours(END_HOUR, 0, 0, 0);
          finalStart = new Date(finalStart.getTime() - duration);
      }

      setInteraction(prev => prev ? {
        ...prev,
        currentStartTime: finalStart,
        currentEndTime: new Date(finalStart.getTime() + duration)
      } : null);

    } else if (interaction.type === 'resize') {
      const newEnd = new Date(interaction.originalEndTime.getTime() + deltaMs);
      const minEnd = new Date(interaction.originalStartTime.getTime() + 15 * 60 * 1000); // min 15 min
      
      const snappedEnd = snapToQuarter(newEnd);
      
      const gridEnd = new Date(interaction.originalStartTime);
      gridEnd.setHours(END_HOUR, 0, 0, 0);

      let finalEnd = snappedEnd;
      if (finalEnd < minEnd) finalEnd = minEnd;
      if (finalEnd > gridEnd) finalEnd = gridEnd;

      setInteraction(prev => prev ? {
        ...prev,
        currentEndTime: finalEnd
      } : null);
    }
  }, [interaction]);

  const onInteractionEnd = useCallback((e: PointerEvent) => {
    if (!interaction) return;

    if (wasMovedRef.current) {
      blockClickRef.current = true;
      setAppointments(prev => prev.map(appt => {
        if (appt.id === interaction.apptId) {
          return {
            ...appt,
            startTime: interaction.currentStartTime,
            endTime: interaction.currentEndTime
          };
        }
        return appt;
      }));
    }

    setInteraction(null);
    wasMovedRef.current = false;
  }, [interaction]);

  useEffect(() => {
    if (interaction) {
      window.addEventListener('pointermove', onInteractionMove);
      window.addEventListener('pointerup', onInteractionEnd);
    } else {
      window.removeEventListener('pointermove', onInteractionMove);
      window.removeEventListener('pointerup', onInteractionEnd);
    }
    return () => {
      window.removeEventListener('pointermove', onInteractionMove);
      window.removeEventListener('pointerup', onInteractionEnd);
    };
  }, [interaction, onInteractionMove, onInteractionEnd]);

  // Filter and process layout for Day view appointments
  const dailyAppointmentsWithLayout = useMemo(() => {
    // 1. Filter for current day
    const dayAppts = appointments.filter(appt => isSameDay(appt.startTime, currentDate));
    
    // 2. Sort by start time, then duration
    const sorted = [...dayAppts].sort((a, b) => {
      const startDiff = a.startTime.getTime() - b.startTime.getTime();
      if (startDiff !== 0) return startDiff;
      return (b.endTime.getTime() - b.startTime.getTime()) - (a.endTime.getTime() - a.startTime.getTime());
    });

    const columns: Appointment[][] = [];
    const results: (Appointment & { columnIndex: number; totalColumns: number })[] = [];

    // 3. Assign each appt to a column greedily
    sorted.forEach(appt => {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const lastApptInCol = columns[i][columns[i].length - 1];
        if (appt.startTime.getTime() >= lastApptInCol.endTime.getTime()) {
          columns[i].push(appt);
          // Temporary placeholder for final column count
          results.push({ ...appt, columnIndex: i, totalColumns: 0 });
          placed = true;
          break;
        }
      }
      if (!placed) {
        results.push({ ...appt, columnIndex: columns.length, totalColumns: 0 });
        columns.push([appt]);
      }
    });

    // 4. Calculate total columns for overlapping clusters
    // This is a simple cluster-based approach:
    // Any group of overlapping appointments shares the max columns within that cluster.
    let clusterStart = 0;
    let maxClusterEndTime = 0;

    for (let i = 0; i < results.length; i++) {
        const appt = results[i];
        if (appt.startTime.getTime() >= maxClusterEndTime) {
            // New cluster found, process previous cluster
            const cluster = results.slice(clusterStart, i);
            const totalCols = cluster.reduce((max, a) => Math.max(max, a.columnIndex + 1), 0);
            for (let j = clusterStart; j < i; j++) {
                results[j].totalColumns = totalCols;
            }
            clusterStart = i;
            maxClusterEndTime = appt.endTime.getTime();
        } else {
            maxClusterEndTime = Math.max(maxClusterEndTime, appt.endTime.getTime());
        }
    }
    // Process final cluster
    const lastCluster = results.slice(clusterStart);
    const lastTotalCols = lastCluster.reduce((max, a) => Math.max(max, a.columnIndex + 1), 0);
    for (let j = clusterStart; j < results.length; j++) {
        results[j].totalColumns = lastTotalCols;
    }

    return results;
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-slate-100 mb-4 md:mb-6 shrink-0 z-10">
        
        {/* Left: Date Nav */}
        <div className="flex items-center flex-wrap gap-2 md:gap-3">
          <Button variant="outline" size="sm" onClick={handleToday} className="font-semibold px-3 md:px-4">
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
          <h2 className="text-base md:text-xl font-bold text-slate-800 md:min-w-[200px] flex items-center gap-2 truncate">
            <CalendarIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-600 shrink-0" />
            <span className="truncate">
              {viewMode === "week" ? (
                `${format(weekStart, "d MMM", { locale: arSA })} - ${format(endOfWeek(currentDate, { weekStartsOn: 0 }), "d MMM yyyy", { locale: arSA })}`
              ) : viewMode === "month" ? (
                format(currentDate, "MMMM yyyy", { locale: arSA })
              ) : (
                format(currentDate, "EEEE، d MMMM yyyy", { locale: arSA })
              )}
            </span>
          </h2>
        </div>

        {/* Center: View Switcher */}
        <div className="flex items-center p-1 bg-slate-50 border border-slate-100 rounded-lg overflow-x-auto no-scrollbar max-w-full">
          {(["day", "week", "month", "agenda"] as const).map(mode => (
            <button 
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap ${viewMode === mode ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              {mode === "day" && "يوم"}
              {mode === "week" && "أسبوع"}
              {mode === "month" && "شهر"}
              {mode === "agenda" && "أجندة"}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3 ml-auto md:ml-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 h-9 px-2 md:px-3"
            onClick={() => setIsWaitlistModalOpen(true)}
          >
            <Users className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-bold">قائمة الانتظار</span>
            {waitlist.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center font-bold">
                {waitlist.length}
              </span>
            )}
          </Button>
          
          <Button size="sm" className="gap-2 shrink-0 h-9 px-3 md:px-4" onClick={() => setIsNewApptModalOpen(true)}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-bold">موعد جديد</span>
            <span className="sm:hidden text-xs font-bold">جديد</span>
          </Button>
        </div>
      </div>

      {/* CALENDAR BODY */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col relative">
        
        {/* DAY VIEW SCOPE */}
        {viewMode === "day" && (
          <div className="flex-1 overflow-y-auto custom-scrollbar relative" ref={containerRef}>
            <div className="min-w-[400px] md:min-w-0">
              {/* Header row for 'Day' view is practically just spacing over the timeline */}
              <div className="sticky top-0 bg-white/95 backdrop-blur z-20 flex border-b border-slate-100">
                <div className="w-16 md:w-24 shrink-0 text-center py-3 text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider border-l border-slate-100">
                  الوقت
                </div>
                <div className="flex-1 py-3 px-4 flex justify-center">
                   <div className="text-center">
                     <div className="font-bold text-slate-800 text-base md:text-lg">{format(currentDate, "EEEE", { locale: arSA })}</div>
                     <div className="text-xs md:text-sm text-slate-500">{format(currentDate, "d MMM", { locale: arSA })}</div>
                   </div>
                </div>
              </div>

              {/* Grid content */}
              <div className="flex relative" style={{ height: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT}px` }}>
                
                {/* Time labels column */}
                <div className="w-16 md:w-24 shrink-0 border-l border-slate-100 relative bg-slate-50/30">
                  {hoursArray.map((hour, index) => {
                    const ampm = hour >= 12 ? 'م' : 'ص';
                    const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                    return (
                      <div 
                        key={hour} 
                        className="absolute w-full text-center text-[10px] md:text-sm font-medium text-slate-500 -mt-3 pr-1 md:pr-2"
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
                  {dailyAppointmentsWithLayout.map((appt) => {
                    const isInteracting = interaction?.apptId === appt.id;
                    const displayStart = isInteracting ? interaction.currentStartTime : appt.startTime;
                    const displayEnd = isInteracting ? interaction.currentEndTime : appt.endTime;

                    const startH = displayStart.getHours() + (displayStart.getMinutes() / 60);
                    const endH = displayEnd.getHours() + (displayEnd.getMinutes() / 60);
                    
                    if (startH < START_HOUR || startH > END_HOUR) return null;
                    
                    const topOffset = (startH - START_HOUR) * HOUR_HEIGHT;
                    const height = (endH - startH) * HOUR_HEIGHT;
                    const StatusIcon = STATUS_MAP[appt.status].icon;

                    // Compute layout with shared width
                    // If interacting, we go full width for visibility (optional) or stick with shared width
                    const widthPercent = isInteracting ? 96 : (100 / appt.totalColumns);
                    const rightPercent = isInteracting ? 2 : (appt.columnIndex * widthPercent);

                    return (
                      <div
                        key={appt.id}
                        className={`absolute rounded-xl border flex flex-col overflow-hidden transition-all hover:shadow-md cursor-grab active:cursor-grabbing shadow-sm ${appt.colorClass} ${isInteracting ? 'opacity-40 z-50 scale-[0.98]' : 'hover:z-20'}`}
                        style={{ 
                            top: `${topOffset}px`, 
                            height: `${height}px`,
                            width: `calc(${widthPercent}% - ${appt.totalColumns > 1 ? '4px' : '8px'})`,
                            right: `calc(${rightPercent}% + ${appt.totalColumns > 1 ? '2px' : '4px'})`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (blockClickRef.current) {
                            blockClickRef.current = false;
                            return;
                          }
                          setSelectedAppt(appt);
                        }}
                        onPointerDown={(e) => onInteractionStart(e, appt, 'drag')}
                      >
                        <div className={`flex ${height < 45 ? 'flex-row items-center gap-2 p-0.5' : 'flex-col justify-between p-1.5 md:p-3'} h-full w-full select-none overflow-hidden relative group/card`}>
                           <div className="flex-1 min-w-0">
                             <h4 className="font-bold text-[10px] md:text-sm truncate">
                               {appt.patientName}
                             </h4>
                           </div>
                           
                           <div className={`flex items-center gap-1 opacity-90 shrink-0 ${height < 45 ? 'bg-white/20 px-1 rounded' : ''}`}>
                              <span className="text-[9px] md:text-xs font-bold whitespace-nowrap" dir="ltr">
                                {format(displayStart, "HH:mm")} - {format(displayEnd, "HH:mm")}
                              </span>
                           </div>
                        </div>

                        {/* Resize Handle */}
                        {appt.status !== 'cancelled' && (
                          <div 
                            className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-black/5 flex items-center justify-center group"
                            onPointerDown={(e) => onInteractionStart(e, appt, 'resize')}
                          >
                            <div className="w-8 h-1 bg-current opacity-20 rounded-full group-hover:opacity-40" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Drag/Resize Ghost Overlay */}
                  {interaction && isSameDay(interaction.currentStartTime, currentDate) && (
                    <div 
                      className="absolute rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/20 pointer-events-none z-50 flex flex-col p-3"
                      style={{ 
                        top: `${(interaction.currentStartTime.getHours() + interaction.currentStartTime.getMinutes()/60 - START_HOUR) * HOUR_HEIGHT}px`,
                        height: `${(interaction.currentEndTime.getTime() - interaction.currentStartTime.getTime()) / (1000 * 60 * 60) * HOUR_HEIGHT}px`,
                        width: 'calc(100% - 16px)',
                        right: '8px'
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-600 bg-white px-2 py-0.5 rounded shadow-sm border border-blue-100">
                          {format(interaction.currentStartTime, "h:mm a")}
                        </span>
                        <span className="text-xs font-bold text-blue-600 bg-white px-2 py-0.5 rounded shadow-sm border border-blue-100">
                          {format(interaction.currentEndTime, "h:mm a")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WEEK VIEW SCOPE */}
        {viewMode === "week" && (
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            <div className="min-w-[700px] md:min-w-0 h-full flex flex-col">
              {/* Header row for 'Week' view */}
              <div className="sticky top-0 bg-white/95 backdrop-blur z-30 flex border-b border-slate-100 shrink-0">
                <div className="w-14 md:w-20 shrink-0 text-center py-2 md:py-3 text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider border-l border-slate-100 z-30 bg-white/95">
                  الوقت
                </div>
                <div className="flex-1 flex">
                  {weekDays.map(day => {
                    const isToday = isSameDay(day, new Date());
                    return (
                      <div key={day.toISOString()} className="flex-1 py-1.5 md:py-3 px-1 md:px-2 flex justify-center border-l border-slate-100 last:border-l-0">
                         <div className={`text-center px-2 md:px-4 py-1 rounded-xl ${isToday ? 'bg-blue-50' : ''}`}>
                           <div className={`font-bold text-[10px] md:text-sm ${isToday ? 'text-blue-700' : 'text-slate-800'}`}>
                             {format(day, "EEE", { locale: arSA })}
                           </div>
                           <div className={`text-[9px] md:text-xs mt-0.5 ${isToday ? 'text-blue-600 font-semibold' : 'text-slate-500'}`}>
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
                <div className="w-14 md:w-20 shrink-0 border-l border-slate-100 relative bg-slate-50/30">
                  {hoursArray.map((hour, index) => {
                    const ampm = hour >= 12 ? 'م' : 'ص';
                    const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                    return (
                      <div 
                        key={hour} 
                        className="absolute w-full text-center text-[10px] md:text-xs font-medium text-slate-500 -mt-2 pr-1"
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
                              className={`absolute right-0.5 left-0.5 md:right-1.5 md:left-1.5 rounded-lg border p-1 md:p-1.5 flex flex-col overflow-hidden transition-all hover:shadow-md hover:z-30 cursor-pointer shadow-sm ${appt.colorClass}`}
                              style={{ top: `${topOffset}px`, height: `${height}px` }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAppt(appt);
                              }}
                            >
                              <div className="flex flex-col h-full gap-0.5 relative">
                                 <h4 className="font-bold text-[9px] md:text-[11px] leading-tight line-clamp-1">{appt.patientName}</h4>
                                 {height >= 45 && (
                                   <p className="text-[8px] md:text-[10px] font-medium opacity-80 leading-tight line-clamp-1">{appt.service}</p>
                                 )}
                                 {height >= 60 && (
                                   <div className="mt-auto text-[8px] md:text-[10px] font-semibold opacity-80 flex items-center justify-between">
                                     <span dir="ltr" className="md:inline hidden">{format(appt.startTime, "h:mm")}</span>
                                     {React.createElement(STATUS_MAP[appt.status].icon, { className: "w-2.5 h-2.5 md:w-3 md:h-3" })}
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
          <div className="flex-1 flex flex-col p-2 md:p-4 overflow-hidden min-h-[500px] md:min-h-[600px] overflow-y-auto">
            <div className="min-w-[500px] md:min-w-0 flex-1 flex flex-col h-full">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 shrink-0">
                {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day, i) => (
                  <div key={day} className="text-center text-[10px] md:text-sm font-semibold text-slate-400 uppercase tracking-wider py-1.5 md:py-2 bg-slate-50/50 rounded-lg md:rounded-xl border border-slate-100/50">
                    <span className="hidden md:inline">{day}</span>
                    <span className="md:hidden">
                        {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'][i]}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Month Grid */}
              <div className="flex-1 grid grid-cols-7 auto-rows-fr gap-1 md:gap-2">
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
                        min-h-[80px] md:min-h-[100px] p-1.5 md:p-2 flex flex-col rounded-xl md:rounded-2xl border transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5
                        ${isCurrentMonth ? 'bg-white border-slate-100' : 'bg-slate-50/50 border-transparent text-slate-400 opacity-60 hover:opacity-100'}
                        ${isToday ? 'ring-2 ring-blue-500 shadow-sm' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start mb-1 md:mb-2 text-right">
                        <span className={`
                          w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-[11px] md:text-sm font-bold rounded-full
                          ${isToday ? 'bg-blue-600 text-white shadow-sm ring-2 md:ring-4 ring-blue-50' : isCurrentMonth ? 'text-slate-700 bg-slate-50' : 'text-slate-400'}
                        `}>
                          {format(day, 'd')}
                        </span>
                        {dayAppointments.length > 0 && (
                          <span className="text-[9px] md:text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full inline md:hidden">
                            {dayAppointments.length}
                          </span>
                        )}
                        {dayAppointments.length > 0 && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full hidden md:inline">
                            {dayAppointments.length}
                          </span>
                        )}
                      </div>

                      <div className="hidden md:flex flex-col gap-1.5 overflow-hidden">
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
                            عرض {dayAppointments.length - 3} إضافي...
                          </div>
                        )}
                      </div>

                      {/* Mobile Appointment Dots */}
                      <div className="flex md:hidden flex-wrap gap-0.5 mt-auto">
                        {dayAppointments.slice(0, 4).map(appt => (
                          <div key={appt.id} className={`w-1.5 h-1.5 rounded-full ${appt.colorClass.split(' ')[0]}`} />
                        ))}
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
      
      {/* Appointment Detail Modal Redesign */}
      {selectedAppt && (
        <Modal 
          isOpen={!!selectedAppt} 
          onClose={() => setSelectedAppt(null)} 
          hideHeader
          width="max-w-2xl w-[95%] md:w-full"
        >
          <div className="flex flex-col shadow-2xl rounded-2xl overflow-hidden bg-white">
            {/* 1. Colored Header */}
            <div className={`${selectedAppt.colorClass} p-4 md:p-6 border-b`}>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl md:text-2xl font-bold">{selectedAppt.service.split('(')[0].trim() || "موعد"}</h2>
                <button 
                   onClick={() => setSelectedAppt(null)}
                   className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <XCircle className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg md:text-xl font-semibold opacity-95">{selectedAppt.patientName}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm font-medium opacity-90">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    {format(selectedAppt.startTime, "EEEE، d MMMM yyyy", { locale: arSA })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    في {format(selectedAppt.startTime, "hh:mm a")}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Body Grid */}
            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 bg-white min-h-[300px]">
              {/* Left Column - Info */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg md:text-xl font-bold text-slate-800 mb-1">{selectedAppt.patientName}</h4>
                  <div className="space-y-2.5 mt-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-blue-600">الحالة</span>
                      <a href="#" className="text-slate-700 font-medium underline hover:text-blue-700 transition-colors">
                        {selectedAppt.caseName || "زيارة عامة"}
                      </a>
                    </div>
                    <div className="text-slate-600 text-sm font-medium">
                      الموعد رقم {selectedAppt.appointmentNumber || 1}
                    </div>
                    <div className="flex flex-col gap-0.5 mt-2">
                       <span className="text-sm font-semibold text-blue-600">الموعد القادم</span>
                       <span className="text-slate-500 font-medium">لا يوجد</span>
                    </div>
                    <div className="flex flex-col gap-0.5 mt-2">
                       <span className="text-sm font-semibold text-blue-600">النماذج</span>
                       <span className="text-slate-500 font-medium">لا يوجد</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Controls */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button 
                    className={`flex-1 gap-2 ${selectedAppt.status === 'arrived' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-none'}`}
                    onClick={() => handleArrived(selectedAppt)}
                  >
                    <CheckCircle className="w-4 h-4" />
                    حضر
                  </Button>
                  <Button 
                    variant="outline"
                    className={`flex-1 gap-2 ${selectedAppt.status === 'no_show' ? 'bg-red-50 border-red-200 text-red-600' : 'text-slate-500 border-slate-200'}`}
                    onClick={() => handleNoShow(selectedAppt)}
                  >
                    <XCircle className="w-4 h-4" />
                    لم يحضر
                  </Button>
                </div>

                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between items-center text-slate-700 border-slate-200 h-11"
                    onClick={() => setApptDetailPanel(prev => prev === 'payment' ? 'none' : 'payment')}
                  >
                    <span className="flex items-center gap-2">إضافة دفعة (فاتورة)</span>
                    <CreditCard className="w-4 h-4 text-slate-400" />
                  </Button>
                  
                  {apptDetailPanel === 'payment' && (
                    <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in slide-in-from-top-2 duration-200">
                      <div className="space-y-3">
                        <Input placeholder="المبلغ" type="number" className="bg-white" />
                        <select className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm outline-none">
                          <option>نقداً</option>
                          <option>بطاقة مدى</option>
                          <option>تحويل بنكي</option>
                        </select>
                        <Button className="w-full h-10 bg-blue-600" onClick={() => setApptDetailPanel('none')}>تسجيل الدفعة</Button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                   <Button 
                    variant="outline" 
                    className="w-full justify-between items-center text-slate-700 border-slate-200 h-11"
                    onClick={() => setApptDetailPanel(prev => prev === 'notes' ? 'none' : 'notes')}
                  >
                    <span className="flex items-center gap-2">ملاحظات العلاج</span>
                    <Edit2 className="w-4 h-4 text-slate-400" />
                  </Button>

                  {apptDetailPanel === 'notes' && (
                    <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in slide-in-from-top-2 duration-200">
                      <Textarea 
                        placeholder="أدخل ملاحظات العلاج هنا..." 
                        className="bg-white min-h-[100px] mb-3 text-sm" 
                        value={tempTreatmentNote}
                        onChange={(e) => setTempTreatmentNote(e.target.value)}
                      />
                      <Button className="w-full h-10 bg-blue-600 font-bold" onClick={saveTreatmentNote}>حفظ الملاحظة</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Dark Footer Action Bar */}
            <div className="bg-[#2D2431] p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 overflow-hidden shrink-0">
               <div className="flex bg-white/5 rounded-lg overflow-x-auto no-scrollbar border border-white/10 w-full md:w-auto">
                 <button 
                  className="px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-white hover:bg-white/10 border-l border-white/10 flex items-center gap-2 whitespace-nowrap"
                  onClick={() => {
                    setNewApptForm(prev => ({ 
                      ...prev, 
                      patientMode: 'existing', 
                      patientId: MOCK_PATIENTS.find(p => p.name === selectedAppt.patientName)?.id || "" 
                    }));
                    setIsNewApptModalOpen(true);
                  }}
                 >
                   <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                   حجز آخر
                 </button>
                  <button 
                   className="px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-white hover:bg-white/10 border-l border-white/10 whitespace-nowrap"
                   onClick={() => setApptDetailPanel(prev => prev === 'reschedule' ? 'none' : 'reschedule')}
                 >
                   إعادة جدولة
                 </button>
                 <button 
                  className="px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-white hover:bg-white/10 border-l border-white/10 whitespace-nowrap"
                  onClick={() => {
                     // In real app, this would open edit modal
                     alert("تعديل بيانات الموعد");
                  }}
                 >
                   تعديل
                 </button>
                 <button 
                  className="px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-white hover:bg-white/10 whitespace-nowrap"
                  onClick={() => handleCancelAppt(selectedAppt.id)}
                 >
                   إلغاء
                 </button>
               </div>

               <button 
                 className="flex items-center gap-2 text-slate-300 hover:text-white px-2 md:px-4 py-2 text-xs md:text-sm font-semibold transition-colors self-end md:self-auto"
                 onClick={() => handleArchiveAppt(selectedAppt.id)}
                >
                 <Archive className="w-3.5 h-3.5 md:w-4 md:h-4" />
                 أرشفة
               </button>
            </div>
            
            {/* 4. Last Updated line */}
            <div className="bg-slate-100 py-3 text-center">
              <p className="text-[11px] italic text-slate-500 font-medium">
                آخر تحديث: {format(new Date(), "d MMM yyyy، hh:mm a", { locale: arSA })}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* New Appointment Modal */}
      <Modal 
        isOpen={isNewApptModalOpen} 
        onClose={() => setIsNewApptModalOpen(false)} 
        title="حجز موعد جديد"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar px-1">
          
          {/* A. PROVIDER & SERVICE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">الطبيب المعالج</label>
              <select 
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none text-sm"
                value={newApptForm.doctorId}
                onChange={(e) => setNewApptForm({...newApptForm, doctorId: e.target.value})}
              >
                {MOCK_DOCTORS.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">نوع الموعد</label>
              <select 
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none text-sm"
                value={newApptForm.appointmentType}
                onChange={(e) => setNewApptForm({...newApptForm, appointmentType: e.target.value})}
              >
                <option>استشارة طبية عامة (30 دقيقة)</option>
                <option>مراجعة نتائج (15 دقيقة)</option>
                <option>استشارة قلبية (45 دقيقة)</option>
                <option>تخطيط قلب (20 دقيقة)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5"></div>

          {/* B. PATIENT SELECTION */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-700">بيانات المريض</label>
            <div className="flex p-1 bg-slate-100 rounded-lg">
              {(['existing', 'new', 'waitlist'] as const).map((mode) => (
                <button 
                  key={mode}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${newApptForm.patientMode === mode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                  onClick={() => setNewApptForm(prev => ({ 
                    ...prev, 
                    patientMode: mode,
                    caseMode: mode === 'new' ? 'new' : prev.caseMode 
                  }))}
                >
                  {mode === 'existing' && 'مريض موجود'}
                  {mode === 'new' && 'مريض جديد'}
                  {mode === 'waitlist' && 'من الانتظار'}
                </button>
              ))}
            </div>

            {newApptForm.patientMode === 'existing' && (
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  className="w-full rounded-xl border border-slate-200 bg-white pr-10 pl-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none text-sm"
                  value={newApptForm.patientId}
                  onChange={(e) => setNewApptForm({...newApptForm, patientId: e.target.value})}
                >
                  <option value="" disabled>اختر المريض...</option>
                  {MOCK_PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name} - {p.phone}</option>)}
                </select>
              </div>
            )}

            {newApptForm.patientMode === 'new' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  placeholder="اسم المريض بالكامل" 
                  value={newApptForm.newPatientName}
                  onChange={(e) => setNewApptForm({...newApptForm, newPatientName: e.target.value})}
                />
                <Input 
                   placeholder="رقم الجوال" 
                   dir="ltr" 
                   value={newApptForm.newPatientPhone}
                   onChange={(e) => setNewApptForm({...newApptForm, newPatientPhone: e.target.value})}
                />
              </div>
            )}

            {newApptForm.patientMode === 'waitlist' && (
               <select 
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none text-sm"
                  value={newApptForm.waitlistId}
                  onChange={(e) => {
                    const entry = waitlist.find(w => w.id === e.target.value);
                    setNewApptForm({
                      ...newApptForm, 
                      waitlistId: e.target.value,
                      appointmentType: entry?.appointmentType || newApptForm.appointmentType
                    });
                  }}
               >
                 <option value="" disabled>اختر من القائمة...</option>
                 {waitlist.map(w => <option key={w.id} value={w.id}>{w.patientName} - {w.appointmentType}</option>)}
               </select>
            )}
          </div>

          {/* C. CASE DETAILS */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">الملف الطبي / الحالة</label>
              {newApptForm.patientMode !== 'new' && (
                <div className="flex p-0.5 bg-slate-100 rounded-md">
                   <button 
                    className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${newApptForm.caseMode === 'existing' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                    onClick={() => setNewApptForm({...newApptForm, caseMode: 'existing'})}
                   >
                     ملف حالي
                   </button>
                   <button 
                    className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${newApptForm.caseMode === 'new' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                    onClick={() => setNewApptForm({...newApptForm, caseMode: 'new'})}
                   >
                     جديد
                   </button>
                </div>
              )}
            </div>

            {newApptForm.caseMode === 'existing' && newApptForm.patientMode !== 'new' && (
              <select 
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none text-sm"
                value={newApptForm.caseId}
                onChange={(e) => setNewApptForm({...newApptForm, caseId: e.target.value})}
              >
                <option value="">لا يوجد / زيارة عامة</option>
                {newApptForm.patientId && MOCK_CASES[newApptForm.patientId]?.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            )}

            {newApptForm.caseMode === 'new' && (
              <div className="space-y-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <Input 
                  placeholder="عنوان الحالة (مثلاً: متابعة سكري)" 
                  className="bg-white border-blue-100"
                  value={newApptForm.newCaseTitle}
                  onChange={(e) => setNewApptForm({...newApptForm, newCaseTitle: e.target.value})}
                />
                <Textarea 
                  placeholder="ملاحظات تشخيصية أولية..." 
                  className="bg-white border-blue-100 h-20 text-sm"
                  value={newApptForm.newCaseNote}
                  onChange={(e) => setNewApptForm({...newApptForm, newCaseNote: e.target.value})}
                />
              </div>
            )}
          </div>

          {/* D. SCHEDULING DETAILS */}
          <div className="border-t border-slate-100 pt-5 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">التاريخ</label>
              <Input 
                type="date" 
                value={newApptForm.date} 
                onChange={(e) => setNewApptForm({...newApptForm, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">الوقت</label>
              <Input 
                type="time" 
                dir="ltr" 
                className="text-right" 
                value={newApptForm.startTime}
                onChange={(e) => setNewApptForm({...newApptForm, startTime: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">ملاحظات إضافية</label>
            <Textarea 
              placeholder="أضف أي ملاحظات إدارية هنا..." 
              className="h-20 text-sm"
              value={newApptForm.notes}
              onChange={(e) => setNewApptForm({...newApptForm, notes: e.target.value})}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsNewApptModalOpen(false)}>إلغاء</Button>
            <Button 
              className="px-8 shadow-md shadow-blue-100"
              onClick={() => {
                // Validation logic (summary)
                let name = "";
                let phone = "";
                
                if (newApptForm.patientMode === 'existing') {
                  const p = MOCK_PATIENTS.find(p => p.id === newApptForm.patientId);
                  name = p?.name || "مريض موجود";
                  phone = p?.phone || "";
                } else if (newApptForm.patientMode === 'new') {
                  name = newApptForm.newPatientName;
                  phone = newApptForm.newPatientPhone;
                } else if (newApptForm.patientMode === 'waitlist') {
                  const w = waitlist.find(w => w.id === newApptForm.waitlistId);
                  name = w?.patientName || "مريض من القائمة";
                  phone = w?.patientPhone || "";
                  // Remove from waitlist
                  setWaitlist(prev => prev.filter(item => item.id !== newApptForm.waitlistId));
                }

                if (!name) {
                  alert("يرجى اختيار مريض");
                  return;
                }

                const [h, m] = newApptForm.startTime.split(':').map(Number);
                const start = new Date(newApptForm.date);
                start.setHours(h || 9, m || 0, 0, 0);
                
                const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 min default

                const newAppt: Appointment = {
                  id: `appt-${Date.now()}`,
                  patientName: name,
                  patientPhone: phone,
                  service: newApptForm.appointmentType,
                  status: 'confirmed',
                  startTime: start,
                  endTime: end,
                  notes: newApptForm.notes || newApptForm.newCaseNote,
                  colorClass: "bg-blue-600 border-blue-700 text-white",
                };

                setAppointments(prev => [...prev, newAppt]);
                setIsNewApptModalOpen(false);
              }}
            >
              تأكيد الحجز
            </Button>
          </div>
        </div>
      </Modal>
      {/* Waitlist Modal */}
      <Modal 
        isOpen={isWaitlistModalOpen} 
        onClose={() => {
          setIsWaitlistModalOpen(false);
          setIsAddingWaitlist(false);
          setEditingWaitlistId(null);
        }} 
        title={editingWaitlistId ? "تعديل بيانات الانتظار" : isAddingWaitlist ? "إضافة مريض للقائمة" : "قائمة الانتظار الحالية"}
      >
        {!isAddingWaitlist && !editingWaitlistId ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-slate-500">
                يوجد <span className="font-bold text-slate-900">{waitlist.length}</span> مرضى في الانتظار
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => {
                  setWaitlistForm({
                    patientName: "",
                    patientPhone: "",
                    appointmentType: "استشارة طبية عامة",
                    notes: "",
                    isNewPatient: false
                  });
                  setIsAddingWaitlist(true);
                }}
              >
                <PlusCircle className="w-4 h-4" />
                إضافة مريض
              </Button>
            </div>

            {waitlist.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Users className="w-12 h-12 mb-3 opacity-20" />
                <p>قائمة الانتظار فارغة حالياً</p>
              </div>
            ) : (
              <div className="grid gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                {waitlist.map((entry) => (
                  <div key={entry.id} className="group p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all flex justify-between items-center">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                        {entry.patientName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm md:text-base">{entry.patientName}</h4>
                        <div className="flex flex-col md:flex-row md:items-center gap-x-4 gap-y-1 mt-1 text-[11px] md:text-sm">
                          <p className="text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
                            <Phone className="w-3 md:w-3.5 h-3 md:h-3.5" />
                            <span dir="ltr">{entry.patientPhone}</span>
                          </p>
                          <p className="text-blue-600 font-medium flex items-center gap-1.5 whitespace-nowrap">
                            <Clock className="w-3 md:w-3.5 h-3 md:h-3.5" />
                            {entry.appointmentType}
                          </p>
                        </div>
                        {entry.notes && (
                          <div className="mt-2 text-[10px] md:text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                            {entry.notes}
                          </div>
                        )}
                        <p className="text-[9px] md:text-[10px] text-slate-400 mt-2 italic">
                          تمت الإضافة: {format(entry.addedAt, "hh:mm a", { locale: arSA })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingWaitlistId(entry.id);
                          setWaitlistForm({
                            patientName: entry.patientName,
                            patientPhone: entry.patientPhone,
                            appointmentType: entry.appointmentType,
                            notes: entry.notes || "",
                            isNewPatient: false
                          });
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setWaitlist(prev => prev.filter(w => w.id !== entry.id))}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-2 text-sm text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => {
              setIsAddingWaitlist(false);
              setEditingWaitlistId(null);
            }}>
              <ArrowRight className="w-4 h-4" />
              العودة للقائمة
            </div>

            {!editingWaitlistId && (
              <div className="flex p-1 bg-slate-100 rounded-lg">
                <button 
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!waitlistForm.isNewPatient ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                  onClick={() => setWaitlistForm(prev => ({ ...prev, isNewPatient: false }))}
                >
                  مريض موجود
                </button>
                <button 
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${waitlistForm.isNewPatient ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                  onClick={() => setWaitlistForm(prev => ({ ...prev, isNewPatient: true }))}
                >
                  مريض جديد
                </button>
              </div>
            )}

            <div className="space-y-4">
              {waitlistForm.isNewPatient || editingWaitlistId ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">اسم المريض</label>
                    <Input 
                      placeholder="الاسم الكامل" 
                      value={waitlistForm.patientName}
                      onChange={e => setWaitlistForm(prev => ({ ...prev, patientName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">رقم الجوال</label>
                    <Input 
                      placeholder="05xxxxxxx" 
                      dir="ltr"
                      value={waitlistForm.patientPhone}
                      onChange={e => setWaitlistForm(prev => ({ ...prev, patientPhone: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">ابحث عن مريض</label>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      className="pr-10" 
                      placeholder="اسم المريض، رقم الهاتف..." 
                      value={waitlistForm.patientName}
                      onChange={e => setWaitlistForm(prev => ({ ...prev, patientName: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">نوع الموعد المطلوب</label>
                <select 
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                  value={waitlistForm.appointmentType}
                  onChange={e => setWaitlistForm(prev => ({ ...prev, appointmentType: e.target.value }))}
                >
                  <option>استشارة طبية عامة</option>
                  <option>مراجعة نتائج</option>
                  <option>استشارة قلبية</option>
                  <option>تخطيط قلب</option>
                  <option>فحص روتيني</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">ملاحظات إضافية</label>
                <Textarea 
                  placeholder="أدخل أي تفاصيل إضافية..." 
                  className="h-24" 
                  value={waitlistForm.notes}
                  onChange={e => setWaitlistForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setIsAddingWaitlist(false);
                  setEditingWaitlistId(null);
                }}
              >
                إلغاء
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  if (editingWaitlistId) {
                    setWaitlist(prev => prev.map(w => w.id === editingWaitlistId ? {
                      ...w,
                      patientName: waitlistForm.patientName,
                      patientPhone: waitlistForm.patientPhone,
                      appointmentType: waitlistForm.appointmentType,
                      notes: waitlistForm.notes
                    } : w));
                  } else {
                    const newEntry: WaitlistEntry = {
                      id: `w${Date.now()}`,
                      patientName: waitlistForm.patientName,
                      patientPhone: waitlistForm.patientPhone,
                      appointmentType: waitlistForm.appointmentType,
                      notes: waitlistForm.notes,
                      addedAt: new Date(),
                    };
                    setWaitlist(prev => [newEntry, ...prev]);
                  }
                  setIsAddingWaitlist(false);
                  setEditingWaitlistId(null);
                }}
              >
                {editingWaitlistId ? "حفظ التعديلات" : "إضافة للقائمة"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
