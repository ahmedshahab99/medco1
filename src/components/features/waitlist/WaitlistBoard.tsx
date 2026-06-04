"use client";

import { useState, useCallback } from "react";
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
import { arrayMove } from "@dnd-kit/sortable";
import { WaitlistColumn } from "./WaitlistColumn";
import { PatientCard } from "./PatientCard";
import { COLUMNS } from "@/lib/types/waitlist-board";
import {
  mockPatients,
  type BoardPatient,
  type WaitlistStatus,
} from "@/lib/mock/waitlist-data";

const STAGE_ORDER: WaitlistStatus[] = [
  "BOOKING",
  "WAITING",
  "IN_PROGRESS",
  "COMPLETED",
];

function groupByStatus(
  patients: BoardPatient[]
): Record<WaitlistStatus, BoardPatient[]> {
  const grouped: Record<WaitlistStatus, BoardPatient[]> = {
    BOOKING: [],
    WAITING: [],
    IN_PROGRESS: [],
    COMPLETED: [],
  };
  for (const p of patients) {
    grouped[p.status].push(p);
  }
  for (const status of Object.keys(grouped) as WaitlistStatus[]) {
    grouped[status].sort(
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

export function WaitlistBoard() {
  const [columns, setColumns] =
    useState<Record<WaitlistStatus, BoardPatient[]>>(() =>
      groupByStatus(mockPatients)
    );
  const [activePatient, setActivePatient] = useState<BoardPatient | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = event.active.id as string;
    setColumns((prev) => {
      const sourceCol = findColumnByPatientId(prev, id);
      if (!sourceCol) {
        setActivePatient(null);
        return prev;
      }
      const patient = prev[sourceCol].find((p) => p.id === id) ?? null;
      setActivePatient(patient);
      return prev;
    });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActivePatient(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    setColumns((prev) => {
      const sourceCol = findColumnByPatientId(prev, activeId);
      if (!sourceCol) return prev;

      const fromIndex = prev[sourceCol].findIndex((p) => p.id === activeId);
      if (fromIndex === -1) return prev;

      const next = { ...prev };

      if (isColumnId(overId)) {
        if (sourceCol === overId) return prev;
        next[sourceCol] = [...prev[sourceCol]];
        const [moved] = next[sourceCol].splice(fromIndex, 1);
        next[overId] = [...prev[overId], { ...moved, status: overId }];
        return next;
      }

      const targetCol = findColumnByPatientId(prev, overId);
      if (!targetCol) return prev;

      const toIndex = prev[targetCol].findIndex((p) => p.id === overId);
      if (toIndex === -1) return prev;

      if (sourceCol === targetCol) {
        next[sourceCol] = arrayMove(
          prev[sourceCol].map((p) => ({ ...p })),
          fromIndex,
          toIndex
        );
        return next;
      }

      next[sourceCol] = [...prev[sourceCol]];
      const [moved] = next[sourceCol].splice(fromIndex, 1);
      const updated = { ...moved, status: targetCol };
      next[targetCol] = [...prev[targetCol]];
      next[targetCol].splice(toIndex, 0, updated);
      return next;
    });
  }, []);

  const handleAdvance = useCallback((patientId: string) => {
    setColumns((prev) => {
      const sourceCol = findColumnByPatientId(prev, patientId);
      if (!sourceCol) return prev;

      const currentIndex = STAGE_ORDER.indexOf(sourceCol);
      if (currentIndex === STAGE_ORDER.length - 1) return prev;

      const targetCol = STAGE_ORDER[currentIndex + 1];
      const patientIndex = prev[sourceCol].findIndex((p) => p.id === patientId);
      if (patientIndex === -1) return prev;

      const next = { ...prev };
      next[sourceCol] = [...prev[sourceCol]];
      const [moved] = next[sourceCol].splice(patientIndex, 1);
      next[targetCol] = [...prev[targetCol], { ...moved, status: targetCol }];
      return next;
    });
  }, []);

  return (
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
          />
        ))}
      </div>

      <DragOverlay>
        {activePatient ? (
          <PatientCard patient={activePatient} isDragOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
