"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { format, isSameDay } from "date-fns";
import { arSA } from "date-fns/locale/ar-SA";
import { enUS } from "date-fns/locale/en-US";
import type { CalendarAppointment } from "@/hooks/use-appointments";
import { HOUR_HEIGHT } from "./constants";
import { snapToQuarter, getTimeFromPointer } from "./utils";
import type { InteractionState } from "./types";

interface DayViewProps {
  appointments: CalendarAppointment[];
  currentDate: Date;
  startHour: number;
  endHour: number;
  schedule?: any;
  onSelectAppt: (appt: CalendarAppointment) => void;
  onUpdateTime: (id: string, start: Date, end: Date) => void;
  onSlotSelect?: (start: Date, end: Date) => void;
}

function parseApptDates(appt: CalendarAppointment) {
  return { ...appt, startTime: new Date(appt.startTime), endTime: new Date(appt.endTime) };
}

function getColorStyle(color: string): React.CSSProperties {
  return color.startsWith("#") || color.startsWith("rgb") || color.startsWith("hsl") ? { backgroundColor: color } : {};
}

function getColorClass(color: string): string {
  return color.startsWith("#") || color.startsWith("rgb") || color.startsWith("hsl") ? "" : color;
}

type ApptWithLayout = ReturnType<typeof parseApptDates> & {
  columnIndex: number; totalColumns: number; colorClass: string; colorStyle: React.CSSProperties;
};

const statusColors: Record<string, string> = {
  SCHEDULED: "border-r-emerald-400",
  CONFIRMED: "border-r-blue-400",
  ARRIVED: "border-r-amber-400",
  COMPLETED: "border-r-slate-400",
  CANCELLED: "border-r-rose-400",
  NO_SHOW: "border-r-red-400",
};

function CalendarAppointmentCard({ appt, isInteracting, interactionStartTs, interactionEndTs, onInteractionStart, onSelect, startHour, endHour }: any) {
  const displayStart = isInteracting ? new Date(interactionStartTs) : appt.startTime;
  const displayEnd = isInteracting ? new Date(interactionEndTs) : appt.endTime;
  const startH = displayStart.getHours() + displayStart.getMinutes() / 60;
  const endH = displayEnd.getHours() + displayEnd.getMinutes() / 60;
  if (startH < startHour || startH > endHour) return null;

  const topOffset = (startH - startHour) * HOUR_HEIGHT;
  const height = (endH - startH) * HOUR_HEIGHT;
  const widthPercent = isInteracting ? 96 : 100 / appt.totalColumns;
  const rightPercent = isInteracting ? 2 : appt.columnIndex * widthPercent;

  return (
    <div
      className={`absolute rounded-lg border border-r-4 flex flex-col overflow-hidden transition-all hover:shadow-md cursor-pointer bg-white shadow-sm
        ${isInteracting ? "opacity-40 z-50 scale-[0.98]" : "hover:z-20"}
        ${statusColors[appt.status] || "border-r-emerald-400"}`}
      style={{
        top: `${topOffset}px`, height: `${height}px`,
        width: `calc(${widthPercent}% - ${appt.totalColumns > 1 ? "4px" : "8px"})`,
        right: `calc(${rightPercent}% + ${appt.totalColumns > 1 ? "2px" : "4px"})`,
      }}
      onClick={(e) => { e.stopPropagation(); onSelect(appt.id); }}
      onPointerDown={(e) => onInteractionStart(e, appt, "drag")}
    >
      <div className={`flex ${height < 45 ? "flex-row items-center gap-1.5 p-1" : "flex-col p-2"} h-full w-full select-none`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-slate-800 truncate text-xs">{appt.patientName}</p>
            {appt.consultationFee && (
              <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${appt.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {Number(appt.consultationFee).toLocaleString("ar-IQ")}
              </span>
            )}
          </div>
          {height >= 45 && appt.serviceName && <p className="text-[10px] text-slate-400 truncate">{appt.serviceName}</p>}
        </div>
        <div className={`flex items-center gap-1 text-slate-500 ${height < 45 ? "bg-slate-50 px-1.5 rounded" : ""}`}>
          <span className="text-[10px] font-medium" dir="ltr">{format(displayStart, "HH:mm")} - {format(displayEnd, "HH:mm")}</span>
        </div>
      </div>
    </div>
  );
}

function getUnavailableBlocks(daySettings: any, startHour: number, endHour: number) {
  if (!daySettings || !daySettings.enabled) return [{ start: startHour, end: endHour }];
  const blocks: { start: number; end: number }[] = [];
  let current = startHour;
  const segments = [...daySettings.segments].sort((a: any, b: any) => {
    const aH = parseInt(a.start.split(":")[0]) + parseInt(a.start.split(":")[1])/60;
    const bH = parseInt(b.start.split(":")[0]) + parseInt(b.start.split(":")[1])/60;
    return aH - bH;
  });
  for (const seg of segments) {
    const segStart = parseInt(seg.start.split(":")[0]) + parseInt(seg.start.split(":")[1])/60;
    const segEnd = parseInt(seg.end.split(":")[0]) + parseInt(seg.end.split(":")[1])/60;
    if (segStart > current) blocks.push({ start: current, end: Math.min(segStart, endHour) });
    current = Math.max(current, segEnd);
  }
  if (current < endHour) blocks.push({ start: current, end: endHour });
  return blocks;
}

export default function DayView({ appointments, currentDate, startHour, endHour, schedule, onSelectAppt, onUpdateTime, onSlotSelect }: DayViewProps) {
  const [interaction, setInteraction] = useState<InteractionState | null>(null);
  const [slotSelection, setSlotSelection] = useState<{ start: Date; end: Date } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const wasMovedRef = useRef(false);
  const blockClickRef = useRef(false);
  const slotMovedRef = useRef(false);
  const slotStartYRef = useRef(0);
  const [currentTimeLine, setCurrentTimeLine] = useState<number | null>(null);
  const interactionRef = useRef<InteractionState | null>(null);
  const slotSelectionRef = useRef<{ start: Date; end: Date } | null>(null);
  const onUpdateTimeRef = useRef(onUpdateTime);
  const onSlotSelectRef = useRef(onSlotSelect);
  const onSelectApptRef = useRef(onSelectAppt);
  useEffect(() => { onUpdateTimeRef.current = onUpdateTime; onSlotSelectRef.current = onSlotSelect; onSelectApptRef.current = onSelectAppt; });

  const parsedAppointments = useMemo(() => appointments.map(parseApptDates), [appointments]);

  const dailyAppointmentsWithLayout = useMemo(() => {
    const dayAppts = parsedAppointments.filter((appt) => isSameDay(appt.startTime, currentDate));
    const sorted = [...dayAppts].sort((a, b) => {
      const startDiff = a.startTime.getTime() - b.startTime.getTime();
      return startDiff !== 0 ? startDiff : (b.endTime.getTime() - b.startTime.getTime()) - (a.endTime.getTime() - a.startTime.getTime());
    });
    const columns: ReturnType<typeof parseApptDates>[][] = [];
    const results: any[] = [];
    sorted.forEach((appt) => {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const last = columns[i][columns[i].length - 1];
        if (appt.startTime.getTime() >= last.endTime.getTime()) {
          columns[i].push(appt); results.push({ ...appt, columnIndex: i, totalColumns: 0 }); placed = true; break;
        }
      }
      if (!placed) { results.push({ ...appt, columnIndex: columns.length, totalColumns: 0 }); columns.push([appt]); }
    });
    let clusterStart = 0, maxClusterEndTime = 0;
    for (let i = 0; i < results.length; i++) {
      const appt = results[i];
      if (appt.startTime.getTime() >= maxClusterEndTime) {
        const cluster = results.slice(clusterStart, i);
        const totalCols = cluster.reduce((max: number, a: any) => Math.max(max, a.columnIndex + 1), 0);
        for (let j = clusterStart; j < i; j++) results[j].totalColumns = totalCols;
        clusterStart = i; maxClusterEndTime = appt.endTime.getTime();
      } else maxClusterEndTime = Math.max(maxClusterEndTime, appt.endTime.getTime());
    }
    const lastCluster = results.slice(clusterStart);
    const lastTotalCols = lastCluster.reduce((max: number, a: any) => Math.max(max, a.columnIndex + 1), 0);
    for (let j = clusterStart; j < results.length; j++) results[j].totalColumns = lastTotalCols;
    return results.map((a: any) => ({ ...a, colorClass: getColorClass(a.serviceColor), colorStyle: getColorStyle(a.serviceColor) }));
  }, [parsedAppointments, currentDate]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      if (isSameDay(now, currentDate)) {
        const hours = now.getHours() + now.getMinutes() / 60;
        if (hours >= startHour && hours <= endHour) setCurrentTimeLine((hours - startHour) * HOUR_HEIGHT);
        else setCurrentTimeLine(null);
      } else setCurrentTimeLine(null);
    };
    update(); const i = setInterval(update, 60000); return () => clearInterval(i);
  }, [currentDate, startHour, endHour]);

  const unavailableBlocks = useMemo(() => {
    if (!schedule) return [];
    const dayKey = format(currentDate, "EEEE", { locale: enUS }).toLowerCase();
    return getUnavailableBlocks(schedule[dayKey], startHour, endHour);
  }, [schedule, currentDate, startHour, endHour]);

  const onInteractionStart = useCallback((e: React.PointerEvent, appt: any, type: InteractionState["type"]) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const state: InteractionState = { apptId: appt.id, type, startPointerY: e.clientY, startPointerX: e.clientX, originalStartTime: new Date(appt.startTime), originalEndTime: new Date(appt.endTime), currentStartTime: new Date(appt.startTime), currentEndTime: new Date(appt.endTime) };
    interactionRef.current = state; setInteraction(state);
  }, []);

  const onInteractionMove = useCallback((e: PointerEvent) => {
    const current = interactionRef.current;
    if (!current) return;
    if (!wasMovedRef.current && Math.abs(e.clientY - current.startPointerY) > 5) wasMovedRef.current = true;
    const deltaMs = ((e.clientY - current.startPointerY) / HOUR_HEIGHT) * 60 * 60 * 1000;
    if (current.type === "drag") {
      const newStart = new Date(current.originalStartTime.getTime() + deltaMs);
      const duration = current.originalEndTime.getTime() - current.originalStartTime.getTime();
      const snappedStart = snapToQuarter(newStart);
      let finalStart = snappedStart;
      if (finalStart.getHours() < startHour) { finalStart = new Date(finalStart); finalStart.setHours(startHour, 0, 0, 0); }
      const potentialEnd = new Date(finalStart.getTime() + duration);
      if (potentialEnd.getHours() > endHour || (potentialEnd.getHours() === endHour && potentialEnd.getMinutes() > 0)) {
        finalStart = new Date(potentialEnd); finalStart.setHours(endHour, 0, 0, 0); finalStart = new Date(finalStart.getTime() - duration);
      }
      const next = { ...current, currentStartTime: finalStart, currentEndTime: new Date(finalStart.getTime() + duration) };
      interactionRef.current = next; setInteraction(next);
    } else {
      const newEnd = new Date(current.originalEndTime.getTime() + deltaMs);
      const minEnd = new Date(current.originalStartTime.getTime() + 15 * 60 * 1000);
      const snappedEnd = snapToQuarter(newEnd);
      const gridEnd = new Date(current.originalStartTime); gridEnd.setHours(endHour, 0, 0, 0);
      let finalEnd = snappedEnd;
      if (finalEnd < minEnd) finalEnd = minEnd;
      if (finalEnd > gridEnd) finalEnd = gridEnd;
      const next = { ...current, currentEndTime: finalEnd };
      interactionRef.current = next; setInteraction(next);
    }
  }, []);

  const onInteractionEnd = useCallback(() => {
    const current = interactionRef.current;
    if (!current) return;
    if (wasMovedRef.current) { blockClickRef.current = true; onUpdateTimeRef.current(current.apptId, current.currentStartTime, current.currentEndTime); }
    interactionRef.current = null; setInteraction(null); wasMovedRef.current = false;
  }, []);

  const onSlotPointerDown = useCallback((e: React.PointerEvent) => {
    if (!onSlotSelectRef.current) return;
    const time = getTimeFromPointer(e, currentDate, gridRef);
    const snapped = snapToQuarter(time);
    const clamped = new Date(snapped);
    if (clamped.getHours() < startHour) clamped.setHours(startHour, 0, 0, 0);
    if (clamped.getHours() >= endHour) return;
    const defaultEnd = new Date(clamped.getTime() + 30 * 60 * 1000);
    let clampedEnd = defaultEnd;
    if (clampedEnd.getHours() > endHour || (clampedEnd.getHours() === endHour && clampedEnd.getMinutes() > 0)) {
      clampedEnd = new Date(clamped); clampedEnd.setHours(endHour, 0, 0, 0);
    }
    slotMovedRef.current = false; slotStartYRef.current = e.clientY;
    const sel = { start: clamped, end: clampedEnd };
    slotSelectionRef.current = sel; setSlotSelection(sel);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [currentDate]);

  const onSlotPointerMove = useCallback((e: PointerEvent) => {
    const sel = slotSelectionRef.current;
    if (!sel) return;
    if (!slotMovedRef.current && Math.abs(e.clientY - slotStartYRef.current) > 5) slotMovedRef.current = true;
    const time = getTimeFromPointer(e, currentDate, gridRef);
    const snapped = snapToQuarter(time);
    const minEnd = new Date(sel.start.getTime() + 15 * 60 * 1000);
    const gridEnd = new Date(sel.start); gridEnd.setHours(endHour, 0, 0, 0);
    let finalEnd = snapped;
    if (finalEnd < minEnd) finalEnd = minEnd;
    if (finalEnd > gridEnd) finalEnd = gridEnd;
    const next = { ...sel, end: finalEnd };
    slotSelectionRef.current = next; setSlotSelection(next);
  }, [currentDate]);

  const onSlotPointerUp = useCallback(() => {
    const sel = slotSelectionRef.current;
    if (!sel || !onSlotSelectRef.current) return;
    blockClickRef.current = true;
    onSlotSelectRef.current(sel.start, sel.end);
    slotSelectionRef.current = null; setSlotSelection(null);
  }, []);

  const handleSelectAppt = useCallback((apptId: string) => {
    if (blockClickRef.current) { blockClickRef.current = false; return; }
    const original = appointments.find((a) => a.id === apptId);
    if (original) onSelectApptRef.current(original);
  }, [appointments]);

  useEffect(() => {
    if (interaction) { window.addEventListener("pointermove", onInteractionMove); window.addEventListener("pointerup", onInteractionEnd); }
    else { window.removeEventListener("pointermove", onInteractionMove); window.removeEventListener("pointerup", onInteractionEnd); }
    return () => { window.removeEventListener("pointermove", onInteractionMove); window.removeEventListener("pointerup", onInteractionEnd); };
  }, [interaction, onInteractionMove, onInteractionEnd]);

  useEffect(() => {
    if (slotSelection) { window.addEventListener("pointermove", onSlotPointerMove); window.addEventListener("pointerup", onSlotPointerUp); }
    else { window.removeEventListener("pointermove", onSlotPointerMove); window.removeEventListener("pointerup", onSlotPointerUp); }
    return () => { window.removeEventListener("pointermove", onSlotPointerMove); window.removeEventListener("pointerup", onSlotPointerUp); };
  }, [slotSelection, onSlotPointerMove, onSlotPointerUp]);

  const hoursArray = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar" ref={containerRef}>
      <div className="min-w-0 md:min-w-[400px]">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 flex border-b border-slate-100">
          <div className="w-16 md:w-20 shrink-0 text-center py-3 text-[10px] font-semibold text-slate-400 border-l border-slate-100">
            الوقت
          </div>
          <div className="flex-1 py-3 px-4 flex items-center justify-center gap-3">
            <div className="text-center">
              <p className="font-bold text-slate-800 text-sm">{format(currentDate, "EEEE", { locale: arSA })}</p>
              <p className="text-xs text-slate-400">{format(currentDate, "d MMM", { locale: arSA })}</p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="flex relative" style={{ height: `${(endHour - startHour + 1) * HOUR_HEIGHT}px` }}>
          {/* Time Labels */}
          <div className="w-16 md:w-20 shrink-0 border-l border-slate-100 relative bg-slate-50/20">
            {hoursArray.map((hour, i) => (
              <div key={hour} className="absolute w-full text-center text-[11px] text-slate-400 -mt-2.5" style={{ top: `${i * HOUR_HEIGHT}px` }}>
                {hour > 12 ? hour - 12 : hour === 0 ? 12 : hour} {hour >= 12 ? "م" : "ص"}
              </div>
            ))}
          </div>

          {/* Tracking Area */}
          <div className="flex-1 relative cursor-pointer" onPointerDown={onSlotPointerDown}>
            {/* Grid lines */}
            {hoursArray.map((hour, i) => (
              <div key={i} className="absolute w-full border-t border-slate-100" style={{ top: `${i * HOUR_HEIGHT}px` }} />
            ))}
            {hoursArray.slice(0, -1).map((hour, i) => (
              <div key={`h-${i}`} className="absolute w-full border-t border-dashed border-slate-50" style={{ top: `${i * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }} />
            ))}

            {/* Current time */}
            {currentTimeLine !== null && (
              <div className="absolute right-0 left-0 z-10 pointer-events-none" style={{ top: `${currentTimeLine}px` }}>
                <div className="border-t-2 border-rose-400 relative" />
              </div>
            )}

            {/* Unavailable blocks */}
            {unavailableBlocks.map((block, i) => (
              <div key={i} className="absolute w-full bg-slate-50/60 pointer-events-none z-0" style={{ top: `${(block.start - startHour) * HOUR_HEIGHT}px`, height: `${(block.end - block.start) * HOUR_HEIGHT}px` }} />
            ))}

            {/* Appointments */}
            {dailyAppointmentsWithLayout.map((appt: any) => (
              <CalendarAppointmentCard key={appt.id} appt={appt}
                isInteracting={interaction?.apptId === appt.id}
                interactionStartTs={interaction?.currentStartTime.getTime() ?? 0}
                interactionEndTs={interaction?.currentEndTime.getTime() ?? 0}
                onInteractionStart={onInteractionStart} onSelect={handleSelectAppt}
                startHour={startHour} endHour={endHour} />
            ))}

            {/* Ghost drag overlay */}
            {interaction && isSameDay(interaction.currentStartTime, currentDate) && (
              <div className="absolute rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50/20 pointer-events-none z-50"
                style={{ top: `${(interaction.currentStartTime.getHours() + interaction.currentStartTime.getMinutes() / 60 - startHour) * HOUR_HEIGHT}px`,
                  height: `${(interaction.currentEndTime.getTime() - interaction.currentStartTime.getTime()) / (1000 * 60 * 60) * HOUR_HEIGHT}px`,
                  width: "calc(100% - 12px)", right: "6px" }}>
                <div className="flex justify-between p-1">
                  <span className="text-[10px] font-bold text-emerald-600 bg-white px-1.5 py-0.5 rounded shadow-sm">{format(interaction.currentStartTime, "HH:mm")}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-white px-1.5 py-0.5 rounded shadow-sm">{format(interaction.currentEndTime, "HH:mm")}</span>
                </div>
              </div>
            )}

            {/* Slot selection */}
            {slotSelection && (
              <div className="absolute rounded-lg border-2 border-emerald-300 bg-emerald-50/30 pointer-events-none z-40"
                style={{ top: `${(slotSelection.start.getHours() + slotSelection.start.getMinutes() / 60 - startHour) * HOUR_HEIGHT}px`,
                  height: `${(slotSelection.end.getTime() - slotSelection.start.getTime()) / (1000 * 60 * 60) * HOUR_HEIGHT}px`,
                  width: "calc(100% - 12px)", right: "6px" }}>
                <div className="flex justify-between p-1">
                  <span className="text-[10px] font-bold text-emerald-600 bg-white px-1.5 py-0.5 rounded shadow-sm">{format(slotSelection.start, "HH:mm")}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-white px-1.5 py-0.5 rounded shadow-sm">{format(slotSelection.end, "HH:mm")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
