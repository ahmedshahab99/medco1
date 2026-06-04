"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { PatientCard } from "./PatientCard";
import type { BoardPatient, WaitlistStatus } from "@/lib/mock/waitlist-data";
import type { ColumnDefinition } from "@/lib/types/waitlist-board";

interface WaitlistColumnProps {
  column: ColumnDefinition;
  patients: BoardPatient[];
  onAdvance?: (patientId: string) => void;
}

export function WaitlistColumn({ column, patients, onAdvance }: WaitlistColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const patientIds = patients.map((p) => p.id);
  const isLastStage = column.id === "COMPLETED";

  return (
    <div
      className={cn(
        "flex w-full md:w-72 md:shrink-0 flex-col rounded-xl border bg-slate-50/50",
        isOver && "ring-2 ring-primary/20 border-primary/40 bg-primary/5"
      )}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "size-2 rounded-full",
              column.id === "BOOKING" && "bg-blue-500",
              column.id === "WAITING" && "bg-amber-500",
              column.id === "IN_PROGRESS" && "bg-emerald-500",
              column.id === "COMPLETED" && "bg-slate-400"
            )}
          />
          <h3 className={cn("text-sm font-bold", column.color)}>
            {column.title}
          </h3>
        </div>
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full text-xs font-bold",
            column.bgColor,
            column.color
          )}
        >
          {patients.length}
        </span>
      </div>

      <SortableContext items={patientIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            "flex flex-col gap-2 p-2 min-h-[200px] transition-colors rounded-b-xl",
            isOver && "bg-primary/5"
          )}
        >
          {patients.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-8">
              <p className="text-xs text-slate-400">لا يوجد مرضى</p>
            </div>
          ) : (
            patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onAdvance={onAdvance}
                isLastStage={isLastStage}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
