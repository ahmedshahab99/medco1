"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { format, isSameDay } from "date-fns";
import { arSA } from "date-fns/locale/ar-SA";
import type { CalendarAppointment } from "@/hooks/use-appointments";
import { START_HOUR, END_HOUR, HOUR_HEIGHT } from "./constants";
import { snapToQuarter, getTimeFromPointer } from "./utils";
import type { InteractionState } from "./types";

interface DayViewProps {
  appointments: CalendarAppointment[];
  currentDate: Date;
  onSelectAppt: (appt: CalendarAppointment) => void;
  onUpdateTime: (id: string, start: Date, end: Date) => void;
  onSlotSelect?: (start: Date, end: Date) => void;
}

function parseApptDates(appt: CalendarAppointment) {
  return {
    ...appt,
    startTime: new Date(appt.startTime),
    endTime: new Date(appt.endTime),
  };
}

function getColorStyle(color: string): React.CSSProperties {
  if (color.startsWith("#") || color.startsWith("rgb") || color.startsWith("hsl")) {
    return { backgroundColor: color };
  }
  return {};
}

function getColorClass(color: string): string {
  if (color.startsWith("#") || color.startsWith("rgb") || color.startsWith("hsl")) {
    return "";
  }
  return color;
}

type ApptWithLayout = ReturnType<typeof parseApptDates> & {
  columnIndex: number;
  totalColumns: number;
  colorClass: string;
  colorStyle: React.CSSProperties;
};

interface CalendarAppointmentCardProps {
  appt: ApptWithLayout;
  isInteracting: boolean;
  interactionStartTs: number;
  interactionEndTs: number;
  onInteractionStart: (
    e: React.PointerEvent,
    appt: ReturnType<typeof parseApptDates>,
    type: InteractionState["type"]
  ) => void;
  onSelect: (apptId: string) => void;
}

const CalendarAppointmentCard = React.memo(function CalendarAppointmentCard({
  appt,
  isInteracting,
  interactionStartTs,
  interactionEndTs,
  onInteractionStart,
  onSelect,
}: CalendarAppointmentCardProps) {
  const displayStart = isInteracting ? new Date(interactionStartTs) : appt.startTime;
  const displayEnd = isInteracting ? new Date(interactionEndTs) : appt.endTime;

  const startH = displayStart.getHours() + displayStart.getMinutes() / 60;
  const endH = displayEnd.getHours() + displayEnd.getMinutes() / 60;

  if (startH < START_HOUR || startH > END_HOUR) return null;

  const topOffset = (startH - START_HOUR) * HOUR_HEIGHT;
  const height = (endH - startH) * HOUR_HEIGHT;

  const widthPercent = isInteracting ? 96 : 100 / appt.totalColumns;
  const rightPercent = isInteracting ? 2 : appt.columnIndex * widthPercent;

  return (
    <div
      className={`absolute rounded-xl border flex flex-col overflow-hidden transition-all hover:shadow-md cursor-grab active:cursor-grabbing shadow-sm text-white ${
        isInteracting ? "opacity-40 z-50 scale-[0.98]" : "hover:z-20"
      } ${appt.colorClass}`}
      style={{
        top: `${topOffset}px`,
        height: `${height}px`,
        width: `calc(${widthPercent}% - ${appt.totalColumns > 1 ? "4px" : "8px"})`,
        right: `calc(${rightPercent}% + ${appt.totalColumns > 1 ? "2px" : "4px"})`,
        ...appt.colorStyle,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(appt.id);
      }}
      onPointerDown={(e) => onInteractionStart(e, appt, "drag")}
    >
      <div
        className={`flex ${
          height < 45
            ? "flex-row items-center gap-2 p-0.5"
            : "flex-col justify-between p-1.5 md:p-3"
        } h-full w-full select-none overflow-hidden relative group/card`}
      >
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-[10px] md:text-sm truncate">
            {appt.patientName}
          </h4>
        </div>
        <div
          className={`flex items-center gap-1 opacity-90 shrink-0 ${
            height < 45 ? "bg-white/20 px-1 rounded" : ""
          }`}
        >
          <span
            className="text-[9px] md:text-xs font-bold whitespace-nowrap"
            dir="ltr"
          >
            {format(displayStart, "HH:mm")} -{" "}
            {format(displayEnd, "HH:mm")}
          </span>
        </div>
      </div>

      {appt.status !== "CANCELLED" && (
        <div
          className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-black/5 flex items-center justify-center group"
          onPointerDown={(e) => onInteractionStart(e, appt, "resize")}
        >
          <div className="w-8 h-1 bg-current opacity-20 rounded-full group-hover:opacity-40" />
        </div>
      )}
    </div>
  );
});

export default function DayView({ appointments, currentDate, onSelectAppt, onUpdateTime, onSlotSelect }: DayViewProps) {
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

  useEffect(() => {
    onUpdateTimeRef.current = onUpdateTime;
    onSlotSelectRef.current = onSlotSelect;
    onSelectApptRef.current = onSelectAppt;
  });

  const parsedAppointments = useMemo(
    () => appointments.map(parseApptDates),
    [appointments]
  );

  const dailyAppointmentsWithLayout = useMemo(() => {
    const dayAppts = parsedAppointments.filter((appt) =>
      isSameDay(appt.startTime, currentDate)
    );

    const sorted = [...dayAppts].sort((a, b) => {
      const startDiff = a.startTime.getTime() - b.startTime.getTime();
      if (startDiff !== 0) return startDiff;
      return (
        b.endTime.getTime() - b.startTime.getTime() -
        (a.endTime.getTime() - a.startTime.getTime())
      );
    });

    type LayoutResult = ReturnType<typeof parseApptDates> & {
      columnIndex: number;
      totalColumns: number;
    };

    const columns: ReturnType<typeof parseApptDates>[][] = [];
    const results: LayoutResult[] = [];

    sorted.forEach((appt) => {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const lastApptInCol = columns[i][columns[i].length - 1];
        if (appt.startTime.getTime() >= lastApptInCol.endTime.getTime()) {
          columns[i].push(appt);
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

    let clusterStart = 0;
    let maxClusterEndTime = 0;

    for (let i = 0; i < results.length; i++) {
      const appt = results[i];
      if (appt.startTime.getTime() >= maxClusterEndTime) {
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

    const lastCluster = results.slice(clusterStart);
    const lastTotalCols = lastCluster.reduce((max, a) => Math.max(max, a.columnIndex + 1), 0);
    for (let j = clusterStart; j < results.length; j++) {
      results[j].totalColumns = lastTotalCols;
    }

    return results.map((a) => ({
      ...a,
      colorClass: getColorClass(a.serviceColor),
      colorStyle: getColorStyle(a.serviceColor),
    })) as ApptWithLayout[];
  }, [parsedAppointments, currentDate]);

  // Current time line
  useEffect(() => {
    const updateTimeLine = () => {
      const now = new Date();
      if (isSameDay(now, currentDate)) {
        const hours = now.getHours() + now.getMinutes() / 60;
        if (hours >= START_HOUR && hours <= END_HOUR) {
          setCurrentTimeLine((hours - START_HOUR) * HOUR_HEIGHT);
          return;
        }
      }
      setCurrentTimeLine(null);
    };
    updateTimeLine();
    const interval = setInterval(updateTimeLine, 60000);
    return () => clearInterval(interval);
  }, [currentDate]);

  const onInteractionStart = useCallback(
    (
      e: React.PointerEvent,
      appt: ReturnType<typeof parseApptDates>,
      type: InteractionState["type"]
    ) => {
      // if (appt.status === "CANCELLED" || appt.status === "NO_SHOW") return;
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      const state: InteractionState = {
        apptId: appt.id,
        type,
        startPointerY: e.clientY,
        startPointerX: e.clientX,
        originalStartTime: new Date(appt.startTime),
        originalEndTime: new Date(appt.endTime),
        currentStartTime: new Date(appt.startTime),
        currentEndTime: new Date(appt.endTime),
      };
      interactionRef.current = state;
      setInteraction(state);
    },
    []
  );

  const onInteractionMove = useCallback(
    (e: PointerEvent) => {
      const current = interactionRef.current;
      if (!current) return;
      if (!wasMovedRef.current) {
        if (Math.abs(e.clientY - current.startPointerY) > 5) {
          wasMovedRef.current = true;
        }
      }

      const deltaY = e.clientY - current.startPointerY;
      const deltaH = deltaY / HOUR_HEIGHT;
      const deltaMs = deltaH * 60 * 60 * 1000;

      if (current.type === "drag") {
        const newStart = new Date(current.originalStartTime.getTime() + deltaMs);
        const duration = current.originalEndTime.getTime() - current.originalStartTime.getTime();
        const snappedStart = snapToQuarter(newStart);

        let finalStart = snappedStart;
        if (finalStart.getHours() < START_HOUR) {
          finalStart = new Date(finalStart);
          finalStart.setHours(START_HOUR, 0, 0, 0);
        }
        const potentialEnd = new Date(finalStart.getTime() + duration);
        if (
          potentialEnd.getHours() > END_HOUR ||
          (potentialEnd.getHours() === END_HOUR && potentialEnd.getMinutes() > 0)
        ) {
          finalStart = new Date(potentialEnd);
          finalStart.setHours(END_HOUR, 0, 0, 0);
          finalStart = new Date(finalStart.getTime() - duration);
        }

        const next = {
          ...current,
          currentStartTime: finalStart,
          currentEndTime: new Date(finalStart.getTime() + duration),
        };
        interactionRef.current = next;
        setInteraction(next);
      } else if (current.type === "resize") {
        const newEnd = new Date(current.originalEndTime.getTime() + deltaMs);
        const minEnd = new Date(current.originalStartTime.getTime() + 15 * 60 * 1000);
        const snappedEnd = snapToQuarter(newEnd);

        const gridEnd = new Date(current.originalStartTime);
        gridEnd.setHours(END_HOUR, 0, 0, 0);

        let finalEnd = snappedEnd;
        if (finalEnd < minEnd) finalEnd = minEnd;
        if (finalEnd > gridEnd) finalEnd = gridEnd;

        const next = { ...current, currentEndTime: finalEnd };
        interactionRef.current = next;
        setInteraction(next);
      }
    },
    []
  );

  const onInteractionEnd = useCallback(
    () => {
      const current = interactionRef.current;
      if (!current) return;
      if (wasMovedRef.current) {
        blockClickRef.current = true;
        onUpdateTimeRef.current(current.apptId, current.currentStartTime, current.currentEndTime);
      }
      interactionRef.current = null;
      setInteraction(null);
      wasMovedRef.current = false;
    },
    []
  );

  const onSlotPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!onSlotSelectRef.current) return;
      const time = getTimeFromPointer(e, currentDate, gridRef);
      const snapped = snapToQuarter(time);

      const clamped = new Date(snapped);
      if (clamped.getHours() < START_HOUR) {
        clamped.setHours(START_HOUR, 0, 0, 0);
      }
      if (clamped.getHours() >= END_HOUR) return;

      const defaultEnd = new Date(clamped.getTime() + 30 * 60 * 1000);
      let clampedEnd = defaultEnd;
      if (clampedEnd.getHours() > END_HOUR || (clampedEnd.getHours() === END_HOUR && clampedEnd.getMinutes() > 0)) {
        clampedEnd = new Date(clamped);
        clampedEnd.setHours(END_HOUR, 0, 0, 0);
      }

      slotMovedRef.current = false;
      slotStartYRef.current = e.clientY;
      const sel = { start: clamped, end: clampedEnd };
      slotSelectionRef.current = sel;
      setSlotSelection(sel);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [currentDate, gridRef]
  );

  const onSlotPointerMove = useCallback(
    (e: PointerEvent) => {
      const sel = slotSelectionRef.current;
      if (!sel) return;
      if (!slotMovedRef.current) {
        if (Math.abs(e.clientY - slotStartYRef.current) > 5) {
          slotMovedRef.current = true;
        }
      }

      const time = getTimeFromPointer(e, currentDate, gridRef);
      const snapped = snapToQuarter(time);

      const minEnd = new Date(sel.start.getTime() + 15 * 60 * 1000);
      const gridEnd = new Date(sel.start);
      gridEnd.setHours(END_HOUR, 0, 0, 0);

      let finalEnd = snapped;
      if (finalEnd < minEnd) finalEnd = minEnd;
      if (finalEnd > gridEnd) finalEnd = gridEnd;

      const next = { ...sel, end: finalEnd };
      slotSelectionRef.current = next;
      setSlotSelection(next);
    },
    [currentDate, gridRef]
  );

  const onSlotPointerUp = useCallback(
    () => {
      const sel = slotSelectionRef.current;
      if (!sel || !onSlotSelectRef.current) return;
      blockClickRef.current = true;
      onSlotSelectRef.current(sel.start, sel.end);
      slotSelectionRef.current = null;
      setSlotSelection(null);
    },
    []
  );

  const handleSelectAppt = useCallback(
    (apptId: string) => {
      if (blockClickRef.current) {
        blockClickRef.current = false;
        return;
      }
      const original = appointments.find((a) => a.id === apptId);
      if (original) onSelectApptRef.current(original);
    },
    [appointments]
  );

  useEffect(() => {
    if (interaction) {
      window.addEventListener("pointermove", onInteractionMove);
      window.addEventListener("pointerup", onInteractionEnd);
    } else {
      window.removeEventListener("pointermove", onInteractionMove);
      window.removeEventListener("pointerup", onInteractionEnd);
    }
    return () => {
      window.removeEventListener("pointermove", onInteractionMove);
      window.removeEventListener("pointerup", onInteractionEnd);
    };
  }, [interaction, onInteractionMove, onInteractionEnd]);

  useEffect(() => {
    if (slotSelection) {
      window.addEventListener("pointermove", onSlotPointerMove);
      window.addEventListener("pointerup", onSlotPointerUp);
    } else {
      window.removeEventListener("pointermove", onSlotPointerMove);
      window.removeEventListener("pointerup", onSlotPointerUp);
    }
    return () => {
      window.removeEventListener("pointermove", onSlotPointerMove);
      window.removeEventListener("pointerup", onSlotPointerUp);
    };
  }, [slotSelection, onSlotPointerMove, onSlotPointerUp]);

  const hoursArray = Array.from(
    { length: END_HOUR - START_HOUR + 1 },
    (_, i) => START_HOUR + i
  );

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar relative" ref={containerRef}>
      <div className="min-w-[400px] md:min-w-0">
        {/* Header row */}
        <div className="sticky top-0 bg-white/95 backdrop-blur z-20 flex border-b border-slate-100">
          <div className="w-16 md:w-24 shrink-0 text-center py-3 text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider border-l border-slate-100">
            الوقت
          </div>
          <div className="flex-1 py-3 px-4 flex justify-center">
            <div className="text-center">
              <div className="font-bold text-slate-800 text-base md:text-lg">
                {format(currentDate, "EEEE", { locale: arSA })}
              </div>
              <div className="text-xs md:text-sm text-slate-500">
                {format(currentDate, "d MMM", { locale: arSA })}
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className="flex relative"
          style={{ height: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT}px` }}
        >
          {/* Time labels */}
          <div className="w-16 md:w-24 shrink-0 border-l border-slate-100 relative bg-slate-50/30">
            {hoursArray.map((hour, index) => {
              const ampm = hour >= 12 ? "م" : "ص";
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

          {/* Tracking area */}
          <div
            className="flex-1 relative cursor-pointer hover:bg-slate-50/30 transition-colors"
            onPointerDown={onSlotPointerDown}
          >
            {/* Horizontal lines */}
            {hoursArray.map((hour, index) => (
              <div
                key={`grid-${hour}`}
                className="absolute w-full border-t border-slate-100"
                style={{ top: `${index * HOUR_HEIGHT}px` }}
              />
            ))}
            {hoursArray.slice(0, -1).map((hour, index) => (
              <div
                key={`grid-half-${hour}`}
                className="absolute w-full border-t border-slate-50 border-dashed"
                style={{ top: `${index * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }}
              />
            ))}

            {/* Current time line */}
            {currentTimeLine !== null && (
              <div
                className="absolute right-0 left-0 z-10 pointer-events-none"
                style={{ top: `${currentTimeLine}px` }}
              >
                <div className="absolute right-[-6px] top-[-5px] w-2.5 h-2.5 rounded-full bg-red-500 z-10" />
                <div className="border-t-2 border-red-500 relative shadow-sm" />
              </div>
            )}

            {/* Appointments */}
            {dailyAppointmentsWithLayout.map((appt) => (
              <CalendarAppointmentCard
                key={appt.id}
                appt={appt}
                isInteracting={interaction?.apptId === appt.id}
                interactionStartTs={interaction?.currentStartTime.getTime() ?? 0}
                interactionEndTs={interaction?.currentEndTime.getTime() ?? 0}
                onInteractionStart={onInteractionStart}
                onSelect={handleSelectAppt}
              />
            ))}

            {/* Ghost overlay for appointment drag/resize */}
            {interaction && isSameDay(interaction.currentStartTime, currentDate) && (
              <div
                className="absolute rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/20 pointer-events-none z-50 flex flex-col p-3"
                style={{
                  top: `${(interaction.currentStartTime.getHours() + interaction.currentStartTime.getMinutes() / 60 - START_HOUR) * HOUR_HEIGHT}px`,
                  height: `${(interaction.currentEndTime.getTime() - interaction.currentStartTime.getTime()) / (1000 * 60 * 60) * HOUR_HEIGHT}px`,
                  width: "calc(100% - 16px)",
                  right: "8px",
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

            {/* Slot selection overlay */}
            {slotSelection && (
              <div
                className="absolute rounded-xl border-2 border-green-400 bg-emerald-500/10 pointer-events-none z-40 flex flex-col p-3"
                style={{
                  top: `${(slotSelection.start.getHours() + slotSelection.start.getMinutes() / 60 - START_HOUR) * HOUR_HEIGHT}px`,
                  height: `${(slotSelection.end.getTime() - slotSelection.start.getTime()) / (1000 * 60 * 60) * HOUR_HEIGHT}px`,
                  width: "calc(100% - 16px)",
                  right: "8px",
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-600 bg-white px-2 py-0.5 rounded shadow-sm border border-emerald-100">
                    {format(slotSelection.start, "h:mm a")}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-white px-2 py-0.5 rounded shadow-sm border border-emerald-100">
                    {format(slotSelection.end, "h:mm a")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
