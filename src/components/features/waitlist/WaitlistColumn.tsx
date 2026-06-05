"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CalendarPlus, Clock, Activity, CheckCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { PatientCard } from "./PatientCard";
import type { BoardPatient, WaitlistStatus, ColumnDefinition } from "@/lib/types/waitlist-board";

interface WaitlistColumnProps {
  column: ColumnDefinition;
  patients: BoardPatient[];
  onAdvance?: (patientId: string) => void;
  onAddClick?: () => void;
}

export function WaitlistColumn({ column, patients, onAdvance, onAddClick }: WaitlistColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const patientIds = patients.map((p) => p.id);
  const isLastStage = column.id === "COMPLETED";

  return (
    <div
      className={cn(
        "flex w-full md:w-72 md:shrink-0 flex-col border rounded-t-xl bg-white",
        isOver && "ring-2 ring-primary/20 border-primary/40 bg-primary/5 "  
      )}
    >
      <div className={cn("flex items-center justify-between px-4 pt-3 pb-2 rounded-t-xl", column.headerBgColor)}>
        <div className="flex items-center gap-2">
          <span className="size-4">
            {column.id === "BOOKING" && <CalendarPlus className="size-4 text-white" />}
            {column.id === "WAITING" && <Clock className="size-4 text-white" />}
            {column.id === "IN_PROGRESS" && <Activity className="size-4 text-white" />}
            {column.id === "COMPLETED" && <CheckCircle className="size-4 text-white" />}
          </span>
          <h3 className="text-sm font-bold text-white">
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
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddClick?.();
          }}
          aria-label="إضافة موعد جديد"
          className="flex size-6 items-center justify-center rounded-full text-white/90 hover:bg-white/15 active:bg-white/25 transition-colors"
        >
          <Plus className="size-4" />
        </button>
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
