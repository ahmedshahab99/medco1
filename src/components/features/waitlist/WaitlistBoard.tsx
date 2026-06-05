"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { RefreshCw } from "lucide-react";
import { WaitlistColumn } from "./WaitlistColumn";
import { PatientCard } from "./PatientCard";
import { COLUMNS } from "@/lib/types/waitlist-board";
import type { BoardPatient, WaitlistStatus } from "@/lib/types/waitlist-board";
import { useAppointments, useUpdateAppointment, useCreateAppointment } from "@/hooks/use-appointments";
import type { CalendarAppointment } from "@/hooks/use-appointments";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import QuickAppointmentModal from "./QuickAppointmentModal";

const STAGE_ORDER: WaitlistStatus[] = [
  "BOOKING",
  "WAITING",
  "IN_PROGRESS",
  "COMPLETED",
];

const BOOKING_STATUSES = new Set(["BOOKING", "SCHEDULED", "CONFIRMED"]);
const WAITING_STATUSES = new Set(["WAITING", "ARRIVED"]);

function mapAppointmentStatus(status: string): WaitlistStatus {
  if (BOOKING_STATUSES.has(status)) return "BOOKING";
  if (WAITING_STATUSES.has(status)) return "WAITING";
  if (status === "IN_PROGRESS") return "IN_PROGRESS";
  if (status === "COMPLETED") return "COMPLETED";
  return "BOOKING";
}

function toBoardPatient(a: CalendarAppointment): BoardPatient {
  return {
    id: a.id,
    name: a.patientName,
    phone: a.patientPhone,
    notes: a.notes,
    status: mapAppointmentStatus(a.status),
    addedAt: a.createdAt,
    appointmentStartTime: a.startTime,
    appointmentEndTime: a.endTime,
    serviceName: a.serviceName,
    serviceColor: a.serviceColor,
    doctorName: a.doctorName,
  };
}

function groupByStatus(patients: BoardPatient[]): Record<WaitlistStatus, BoardPatient[]> {
  const grouped: Record<WaitlistStatus, BoardPatient[]> = {
    BOOKING: [],
    WAITING: [],
    IN_PROGRESS: [],
    COMPLETED: [],
  };
  for (const p of patients) {
    grouped[p.status].push(p);
  }
  grouped.BOOKING.sort(
    (a, b) =>
      new Date(a.appointmentStartTime!).getTime() -
      new Date(b.appointmentStartTime!).getTime()
  );
  for (const col of ["WAITING", "IN_PROGRESS", "COMPLETED"] as WaitlistStatus[]) {
    grouped[col].sort(
      (a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
    );
  }
  return grouped;
}

function findColumnByPatientId(
  columns: Record<WaitlistStatus, BoardPatient[]>,
  patientId: string
): WaitlistStatus | null {
  for (const status of STAGE_ORDER) {
    if (columns[status].some((p) => p.id === patientId)) return status;
  }
  return null;
}

function isColumnId(value: string): value is WaitlistStatus {
  return STAGE_ORDER.includes(value as WaitlistStatus);
}

interface WaitlistBoardProps {
  doctorId: string | undefined;
}

function todayRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  return {
    from: new Date(Date.UTC(y, m, d)),
    to: new Date(Date.UTC(y, m, d, 23, 59, 59, 999)),
  };
}

export function WaitlistBoard({ doctorId }: WaitlistBoardProps) {
  const { from, to } = useMemo(() => todayRange(), []);
  const {
    data: appointments,
    isLoading,
    error,
    refetch,
  } = useAppointments(from, to);
  const updateAppointment = useUpdateAppointment(from, to);
  const { mutate: createAppointment } = useCreateAppointment(from, to);

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<WaitlistStatus>("BOOKING");

  const columns = useMemo(() => {
    if (!appointments) {
      return { BOOKING: [], WAITING: [], IN_PROGRESS: [], COMPLETED: [] } as Record<
        WaitlistStatus,
        BoardPatient[]
      >;
    }
    let filtered = appointments.filter(
      (a) => a.status !== "CANCELLED" && a.status !== "NO_SHOW"
    );
    if (doctorId) {
      filtered = filtered.filter((a) => a.doctorId === doctorId);
    }
    return groupByStatus(filtered.map(toBoardPatient));
  }, [appointments, doctorId]);

  const [activePatient, setActivePatient] = useState<BoardPatient | null>(null);
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = event.active.id as string;
      const currentColumns = columnsRef.current;
      const sourceCol = findColumnByPatientId(currentColumns, id);
      if (!sourceCol) {
        setActivePatient(null);
        return;
      }
      setActivePatient(currentColumns[sourceCol].find((p) => p.id === id) ?? null);
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActivePatient(null);

      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const currentColumns = columnsRef.current;
      const sourceCol = findColumnByPatientId(currentColumns, activeId);
      if (!sourceCol) return;

      let targetCol: WaitlistStatus | null = null;

      if (isColumnId(overId)) {
        targetCol = overId;
      } else {
        targetCol = findColumnByPatientId(currentColumns, overId);
      }

      if (!targetCol || targetCol === sourceCol) return;

      updateAppointment.mutate({
        id: activeId,
        data: { status: targetCol },
      });
    },
    [updateAppointment]
  );

  const handleAdvance = useCallback(
    (patientId: string) => {
      const currentColumns = columnsRef.current;
      const sourceCol = findColumnByPatientId(currentColumns, patientId);
      if (!sourceCol) return;

      const currentIndex = STAGE_ORDER.indexOf(sourceCol);
      if (currentIndex === STAGE_ORDER.length - 1) return;

      const targetCol = STAGE_ORDER[currentIndex + 1];
      updateAppointment.mutate({
        id: patientId,
        data: { status: targetCol },
      });
    },
    [updateAppointment]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 md:flex-row md:overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className="flex w-full md:w-72 md:shrink-0 flex-col border rounded-t-xl bg-white"
          >
            <div className={column.headerBgColor + " flex items-center justify-between px-4 pt-3 pb-2 rounded-t-xl"}>
              <Skeleton className="h-4 w-20 bg-white/30" />
              <Skeleton className="size-6 rounded-full bg-white/30" />
            </div>
            <div className="flex flex-col gap-2 p-2 min-h-[200px]">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-sm text-slate-500">فشل تحميل المواعيد</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="size-4 ms-0 me-1" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-4 md:flex-row md:overflow-x-auto pb-4 custom-scrollbar">
          {COLUMNS.map((column) => (
            <WaitlistColumn
              key={column.id}
              column={column}
              patients={columns[column.id]}
              onAdvance={handleAdvance}
              onAddClick={() => {
                setTargetStatus(column.id);
                setIsNewOpen(true);
              }}
            />
          ))}
        </div>

        <DragOverlay>
          {activePatient ? (
            <PatientCard patient={activePatient} isDragOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      <QuickAppointmentModal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        initialStatus={targetStatus}
        onCreate={(args) => createAppointment(args)}
      />
    </>
  );
}
