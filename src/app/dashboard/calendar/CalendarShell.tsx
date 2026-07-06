"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { Stethoscope } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";

import { useAppointments, useCreateAppointment, useUpdateAppointment, useDeleteAppointment, useRescheduleAppointment } from "@/hooks/use-appointments";
import { useDoctors } from "@/hooks/use-doctors";
import { useAvailability, useAllDoctorsAvailability } from "@/hooks/use-availability";
import { mergeSchedules } from "@/components/features/availability/merge-schedules";
import { useUnavailableBlocks, useCreateUnavailableBlock, useDeleteUnavailableBlock } from "@/hooks/use-unavailable-blocks";
import { useAuth } from "@/hooks/use-auth";
import { useReminderSettings } from "@/hooks/use-reminder-settings";
import type { CalendarAppointment } from "@/hooks/use-appointments";
import type { AppointmentPatchInput } from "@/lib/schemas/appointment";
import type { ViewMode, DoctorUnavailableBlock } from "./types";
import CalendarHeader from "./CalendarHeader";
import DayView from "./DayView";
import WeekView from "./WeekView";
import MonthView from "./MonthView";
import AppointmentDetailModal from "./AppointmentDetailModal";
import NewAppointmentModal from "./NewAppointmentModal";
import UnavailableBlockModal from "./UnavailableBlockModal";
import { SendReminderDialog } from "@/components/dashboard/appointments/SendReminderDialog";
import { useDebounce } from "@/lib/utils/debounce";

export default function CalendarShell() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const debouncedCurrentDate = useDebounce(currentDate, 350);
  const isDebouncePending = currentDate.getTime() !== debouncedCurrentDate.getTime();
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedAppt, setSelectedAppt] = useState<CalendarAppointment | null>(null);
  const [isNewApptOpen, setIsNewApptOpen] = useState(false);
  const [newApptPatientId, setNewApptPatientId] = useState<string | undefined>();
  const [newApptSlot, setNewApptSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [rescheduleAppt, setRescheduleAppt] = useState<CalendarAppointment | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [reminderDialog, setReminderDialog] = useState<{
    open: boolean;
    appointmentId: string;
    patientName: string;
    type: "CANCEL" | "RESCHEDULE";
  }>({ open: false, appointmentId: "", patientName: "", type: "CANCEL" });

  const { from, to } = useMemo(() => {
    if (viewMode === "week") {
      return { from: startOfWeek(debouncedCurrentDate, { weekStartsOn: 0 }), to: endOfWeek(debouncedCurrentDate, { weekStartsOn: 0 }) };
    }
    if (viewMode === "month") {
      return { from: startOfMonth(debouncedCurrentDate), to: endOfMonth(debouncedCurrentDate) };
    }
    return { from: startOfDay(debouncedCurrentDate), to: endOfDay(debouncedCurrentDate) };
  }, [debouncedCurrentDate, viewMode]);

  const { data: appointments, isLoading: apptsLoading } = useAppointments(from, to);
  const { data: doctors } = useDoctors();

  const { user, role } = useAuth();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("all");

  useEffect(() => {
    if (role === "DOCTOR" && user?.id && selectedDoctorId !== user.id) {
      setSelectedDoctorId(user.id);
    }
  }, [role, user?.id, selectedDoctorId]);

  // Per-doctor schedule for the selected doctor, plus the full tenant map for
  // the "all doctors" aggregate view. Both hooks are always called (rules of
  // hooks); the effective schedule is chosen based on the current selection.
  const isAggregate = selectedDoctorId === "all";
  const { data: singleAvailability, isLoading: singleLoading } = useAvailability(
    isAggregate ? undefined : selectedDoctorId || undefined,
  );
  const { data: allAvailability, isLoading: allLoading } = useAllDoctorsAvailability();

  const effectiveSchedule = useMemo(() => {
    if (isAggregate) {
      return allAvailability?.length ? mergeSchedules(allAvailability.map((a) => a.schedule)) : undefined;
    }
    return singleAvailability?.schedule;
  }, [isAggregate, allAvailability, singleAvailability]);

  const availabilityLoading = isAggregate ? allLoading : singleLoading;

  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    if (selectedDoctorId === "all") return appointments;
    return appointments.filter((a) => a.doctorId === selectedDoctorId);
  }, [appointments, selectedDoctorId]);

  const doctorName = useMemo(() => {
    if (role !== "DOCTOR") return "";
    if (user?.firstName && user?.lastName) {
      return `د. ${user.firstName} ${user.lastName}`;
    }
    return user?.email ?? "";
  }, [role, user]);

  const unavailableDoctorId = role === "DOCTOR" ? user?.id : (selectedDoctorId !== "all" ? selectedDoctorId : undefined);
  const { data: unavailableBlocks } = useUnavailableBlocks(from, to, unavailableDoctorId);
  const { mutate: createUnavailableBlock, isPending: isCreatingBlock } = useCreateUnavailableBlock(from, to, unavailableDoctorId);
  const { mutate: deleteUnavailableBlock } = useDeleteUnavailableBlock(from, to, unavailableDoctorId);

  const { dynamicStartHour, dynamicEndHour } = useMemo(() => {
    let minHour = 8;
    let maxHour = 20;

    if (effectiveSchedule) {
      let earliest = 24;
      let latest = 0;

      Object.values(effectiveSchedule).forEach((day) => {
        if (day.enabled && day.segments && day.segments.length > 0) {
          day.segments.forEach((seg) => {
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
  }, [effectiveSchedule]);

  const { mutate: createAppt } = useCreateAppointment(from, to);
  const { mutate: updateAppt, isPending: isUpdatingAppt } = useUpdateAppointment(from, to);
  const { mutate: deleteAppt, isPending: isDeletingAppt } = useDeleteAppointment(from, to);
  const { mutateAsync: rescheduleApptAsync } = useRescheduleAppointment(from, to);
  const { data: reminderSettings } = useReminderSettings();

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

    if (status === "CANCELLED" && reminderSettings?.cancelActive) {
      const appt = appointments?.find((a) => a.id === id);
      updateAppt({ id, data: { status } }, {
        onSuccess: () => {
          setReminderDialog({
            open: true,
            appointmentId: id,
            patientName: appt?.patientName ?? "",
            type: "CANCEL",
          });
        },
      });
    } else {
      updateAppt({ id, data: { status } });
    }

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

  const handleBlockTime = useCallback(
    (data: { doctorId: string; startTime: string; endTime: string; reason?: string }) => {
      createUnavailableBlock(data, {
        onSuccess: () => setIsBlockModalOpen(false),
      });
    },
    [createUnavailableBlock]
  );

  const handleDeleteBlock = useCallback(
    (id: string) => {
      deleteUnavailableBlock(id);
    },
    [deleteUnavailableBlock]
  );

  

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] min-h-[calc(100dvh-8rem)]">
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
        onBlockTime={() => setIsBlockModalOpen(true)}
        showBlockTime={role === "DOCTOR" || role === "ADMIN" || role === "RECEPTIONIST"}
      />

      {/* Doctor filter bar */}
      {role === "DOCTOR" ? (
        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 mb-4 shrink-0">
          <Stethoscope className="size-4 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold text-emerald-700">{doctorName}</span>
          <span className="text-xs text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded-full">
            جدول مواعيدي
          </span>
        </div>
      ) : role === "ADMIN" || role === "RECEPTIONIST" ? (
        <div className="flex items-center gap-2 mb-4 shrink-0">
          <Stethoscope className="size-4 text-emerald-500 shrink-0" />
          <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
            <SelectTrigger className="h-9 w-56 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأطباء</SelectItem>
              {doctors?.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col relative">
        {(apptsLoading || availabilityLoading || isDebouncePending) && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm text-slate-500 font-medium">جاري التحميل...</p>
            </div>
          </div>
        )}

        {viewMode === "day" && (
          <DayView
            appointments={filteredAppointments}
            currentDate={currentDate}
            startHour={dynamicStartHour}
            endHour={dynamicEndHour}
            schedule={effectiveSchedule}
            unavailableBlocks={unavailableBlocks ?? []}
            onSelectAppt={setSelectedAppt}
            onUpdateTime={handleUpdateTime}
            onDeleteBlock={handleDeleteBlock}
            onSlotSelect={(start, end) => {
              setNewApptSlot({ start, end });
              
              setIsNewApptOpen(true);
            }}
          />
        )}

        {viewMode === "week" && (
          <WeekView
            appointments={filteredAppointments}
            currentDate={currentDate}
            startHour={dynamicStartHour}
            endHour={dynamicEndHour}
            schedule={effectiveSchedule}
            unavailableBlocks={unavailableBlocks ?? []}
            onSelectAppt={setSelectedAppt}
            onChangeDate={setCurrentDate}
            onDeleteBlock={handleDeleteBlock}
            onNewAppointment={(date) => {
              setCurrentDate(date);
              setNewApptSlot(null);
              setIsNewApptOpen(true);
            }}
          />
        )}

        {viewMode === "month" && (
          <MonthView
            appointments={filteredAppointments}
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
        onDelete={handleDelete}
        onBookAnother={handleBookAnother}
        onReschedule={handleReschedule}
      />

      {isNewApptOpen && (
        <NewAppointmentModal
          isOpen={isNewApptOpen}
          onClose={() => { setIsNewApptOpen(false); setRescheduleAppt(null); setNewApptSlot(null); }}
          initialDate={currentDate}
          doctors={doctors ?? []}
          initialPatientId={rescheduleAppt ? rescheduleAppt.patientId : newApptPatientId}
          initialDoctorId={selectedDoctorId !== "all" ? selectedDoctorId : undefined}
          initialStart={newApptSlot?.start}
          initialEnd={newApptSlot?.end}
          editingAppointment={rescheduleAppt ?? undefined}
          onCreate={(args) => createAppt(args)}
          onUpdate={async (args) => {
            const appt = rescheduleAppt;
            await rescheduleApptAsync(args);
            if (appt && reminderSettings?.rescheduleActive) {
              setReminderDialog({
                open: true,
                appointmentId: appt.id,
                patientName: appt.patientName,
                type: "RESCHEDULE",
              });
            }
          }}
        />
      )}

      <UnavailableBlockModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        initialDate={currentDate}
        doctorId={user?.id ?? ""}
        doctors={doctors ?? []}
        userRole={role ?? "DOCTOR"}
        onSubmit={handleBlockTime}
        isSubmitting={isCreatingBlock}
      />

      <SendReminderDialog
        open={reminderDialog.open}
        onOpenChange={(open) =>
          setReminderDialog((prev) => ({ ...prev, open }))
        }
        appointmentId={reminderDialog.appointmentId}
        patientName={reminderDialog.patientName}
        type={reminderDialog.type}
      />

    </div>
  );
}
