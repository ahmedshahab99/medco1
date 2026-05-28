"use client";

import React, { useState, useMemo, useEffect } from "react";
import { addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";

import { useAppointments, useCreateAppointment, useUpdateAppointment, useDeleteAppointment, useRescheduleAppointment } from "@/hooks/use-appointments";
import { useWaitlist, useCreateWaitlistEntry, useUpdateWaitlistEntry, useDeleteWaitlistEntry } from "@/hooks/use-waitlist";
import { useDoctors } from "@/hooks/use-doctors";
import { useAvailability } from "@/hooks/use-availability";
import type { CalendarAppointment } from "@/hooks/use-appointments";
import type { AppointmentPatchInput } from "@/lib/schemas/appointment";
import type { ViewMode } from "./types";
import CalendarHeader from "./CalendarHeader";
import DayView from "./DayView";
import WeekView from "./WeekView";
import MonthView from "./MonthView";
import AppointmentDetailModal from "./AppointmentDetailModal";
import NewAppointmentModal from "./NewAppointmentModal";
import WaitlistModal from "./WaitlistModal";

export default function CalendarShell() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedAppt, setSelectedAppt] = useState<CalendarAppointment | null>(null);
  const [isNewApptOpen, setIsNewApptOpen] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [newApptPatientId, setNewApptPatientId] = useState<string | undefined>();
  const [newApptSlot, setNewApptSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [rescheduleAppt, setRescheduleAppt] = useState<CalendarAppointment | null>(null);

  const { from, to } = useMemo(() => {
    if (viewMode === "week") {
      return { from: startOfWeek(currentDate, { weekStartsOn: 0 }), to: endOfWeek(currentDate, { weekStartsOn: 0 }) };
    }
    if (viewMode === "month") {
      return { from: startOfMonth(currentDate), to: endOfMonth(currentDate) };
    }
    return { from: startOfDay(currentDate), to: endOfDay(currentDate) };
  }, [currentDate, viewMode]);

  const { data: appointments, isLoading: apptsLoading } = useAppointments(from, to);
  const { data: doctors } = useDoctors();
  const { data: waitlistData } = useWaitlist();
  const { data: availability, isLoading: availabilityLoading } = useAvailability();

  const { dynamicStartHour, dynamicEndHour } = useMemo(() => {
    let minHour = 8;
    let maxHour = 20;

    if (availability?.schedule) {
      let earliest = 24;
      let latest = 0;

      Object.values(availability.schedule as any).forEach((day: any) => {
        if (day.enabled && day.segments && day.segments.length > 0) {
          day.segments.forEach((seg: any) => {
            const startH = parseInt(seg.start.split(":")[0], 10);
            const endH = parseInt(seg.end.split(":")[0], 10) + (parseInt(seg.end.split(":")[1], 10) > 0 ? 1 : 0);
            if (startH < earliest) earliest = startH;
            if (endH > latest) latest = endH;
          });
        }
      });

      if (earliest < 24) {
        minHour = Math.max(0, earliest - 1); // 1 hour padding
        maxHour = Math.min(24, latest + 1);  // 1 hour padding
      }
    }

    return { dynamicStartHour: minHour, dynamicEndHour: maxHour };
  }, [availability]);

  const { mutate: createAppt } = useCreateAppointment(from, to);
  const { mutate: updateAppt, isPending: isUpdatingAppt } = useUpdateAppointment(from, to);
  const { mutate: deleteAppt, isPending: isDeletingAppt } = useDeleteAppointment(from, to);
  const { mutateAsync: rescheduleApptAsync } = useRescheduleAppointment(from, to);

  const { mutate: createWaitlist } = useCreateWaitlistEntry();
  const updateWaitlist = useUpdateWaitlistEntry();
  const deleteWaitlist = useDeleteWaitlistEntry();

  const handlePrev = () => {
    if (viewMode === "week") setCurrentDate((prev) => subDays(prev, 7));
    else if (viewMode === "month") setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    else setCurrentDate((prev) => subDays(prev, 1));
  };

  const handleNext = () => {
    if (viewMode === "week") setCurrentDate((prev) => addDays(prev, 7));
    else if (viewMode === "month") setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    else setCurrentDate((prev) => addDays(prev, 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleStatusChange = (id: string, status: AppointmentPatchInput["status"]) => {
    if (!status) return;
    updateAppt({ id, data: { status } });
    setSelectedAppt((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  };

  const handleDelete = (id: string) => {
    deleteAppt(id);
    setSelectedAppt(null);
  };

  const handleUpdateTime = (id: string, start: Date, end: Date) => {
    updateAppt({
      id,
      data: { startTime: start.toISOString(), endTime: end.toISOString() },
    });
  };

  const handleBookAnother = (appt: CalendarAppointment) => {
    setNewApptPatientId(appt.patientId);
    setNewApptSlot(null);
    setIsNewApptOpen(true);
  };

  const handleReschedule = (appt: CalendarAppointment) => {
    setRescheduleAppt(appt);
    setIsNewApptOpen(true);
    setSelectedAppt(null);
  };

  

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onChangeView={setViewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onNewAppointment={() => {
          setNewApptPatientId(undefined);
          setNewApptSlot(null);
          setIsNewApptOpen(true);
        }}
        onOpenWaitlist={() => setIsWaitlistOpen(true)}
        waitlistCount={waitlistData?.length ?? 0}
      />

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col relative">
        {(apptsLoading || availabilityLoading) && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm text-slate-500 font-medium">جاري التحميل...</p>
            </div>
          </div>
        )}

        {viewMode === "day" && (
          <DayView
            appointments={appointments ?? []}
            currentDate={currentDate}
            startHour={dynamicStartHour}
            endHour={dynamicEndHour}
            schedule={availability?.schedule}
            onSelectAppt={setSelectedAppt}
            onUpdateTime={handleUpdateTime}
            onSlotSelect={(start, end) => {
              setNewApptSlot({ start, end });
              
              setIsNewApptOpen(true);
            }}
          />
        )}

        {viewMode === "week" && (
          <WeekView
            appointments={appointments ?? []}
            currentDate={currentDate}
            startHour={dynamicStartHour}
            endHour={dynamicEndHour}
            schedule={availability?.schedule}
            onSelectAppt={setSelectedAppt}
            onChangeDate={setCurrentDate}
            onNewAppointment={(date) => {
              setCurrentDate(date);
              setNewApptSlot(null);
              setIsNewApptOpen(true);
            }}
          />
        )}

        {viewMode === "month" && (
          <MonthView
            appointments={appointments ?? []}
            currentDate={currentDate}
            onChangeDate={setCurrentDate}
            onSelectAppt={setSelectedAppt}
            onNewAppointment={(date) => {
              setCurrentDate(date);
              setNewApptSlot(null);
              setIsNewApptOpen(true);
            }}
          />
        )}


      </div>

      <AppointmentDetailModal
        appointment={selectedAppt}
        onClose={() => setSelectedAppt(null)}
        isUpdating={isUpdatingAppt}
        isDeleting={isDeletingAppt}
        onStatusChange={handleStatusChange}
        onMarkAsPaid={(id) => updateAppt({ id, data: { paymentStatus: "PAID" } })}
        onDelete={handleDelete}
        onBookAnother={handleBookAnother}
        onReschedule={handleReschedule}
      />

      <NewAppointmentModal
        isOpen={isNewApptOpen}
        onClose={() => { setIsNewApptOpen(false); setRescheduleAppt(null); setNewApptSlot(null); }}
        initialDate={currentDate}
        doctors={doctors ?? []}
        waitlist={waitlistData ?? []}
        initialPatientId={rescheduleAppt ? rescheduleAppt.patientId : newApptPatientId}
        initialStart={newApptSlot?.start}
        initialEnd={newApptSlot?.end}
        editingAppointment={rescheduleAppt ?? undefined}
        onCreate={(args) => createAppt(args)}
        onUpdate={async (args) => {await rescheduleApptAsync(args); }}
      />

      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        waitlist={waitlistData ?? []}
        onCreate={(args) => createWaitlist(args)}
        onUpdate={(id, data) => updateWaitlist.mutate({ id, data })}
        onDelete={(id) => deleteWaitlist.mutate(id)}
      />
    </div>
  );
}
