"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Check, Clock, Phone, Stethoscope, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BoardPatient } from "@/lib/types/waitlist-board";

interface PatientCardProps {
  patient: BoardPatient;
  isDragOverlay?: boolean;
}

interface PatientCardStandaloneProps extends PatientCardProps {
  onAdvance?: (patientId: string) => void;
  isLastStage?: boolean;
  onViewAppointment?: (patientId: string) => void;
}

export function PatientCard({
  patient,
  isDragOverlay = false,
  onAdvance,
  isLastStage = false,
  onViewAppointment,
}: PatientCardStandaloneProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: patient.id,
    data: { patient, sourceStatus: patient.status },
  });

  const style = transform
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
      }
    : undefined;

  const addedDate = new Date(patient.addedAt);
  const timeStr = addedDate.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const appointmentTime = patient.appointmentStartTime
    ? new Date(patient.appointmentStartTime).toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-white shadow-sm",
        isDragging && !isDragOverlay && "opacity-30",
        isDragOverlay && "shadow-lg rotate-2 scale-105",
        "select-none"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="p-3 cursor-grab active:cursor-grabbing"
      >
        <h4 className="text-sm font-semibold text-slate-800 truncate">
          {patient.name}
        </h4>

        {patient.phone && (
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <Phone className="size-3 shrink-0" />
            <span className="truncate">{patient.phone}</span>
          </div>
        )}

        {patient.doctorName && (
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <Stethoscope className="size-3 shrink-0" />
            <span className="truncate">{patient.doctorName}</span>
          </div>
        )}

        {patient.notes && (
          <div className="mt-1.5 flex items-start gap-1 text-xs text-slate-500">
            <StickyNote className="size-3 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{patient.notes}</span>
          </div>
        )}

        <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
          {appointmentTime ? (
            <Clock className="size-3 shrink-0" />
          ) : (
            <Calendar className="size-3 shrink-0" />
          )}
          <span>{appointmentTime ?? timeStr}</span>
        </div>
      </div>

      {(onViewAppointment || (onAdvance && !isLastStage)) && (
        <div className="flex items-center justify-center gap-2 px-2 pb-2">
          {onViewAppointment && (
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                onViewAppointment(patient.id);
              }}
              className="flex size-8 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <Calendar className="size-4" />
            </button>
          )}
          {onAdvance && !isLastStage && (
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                onAdvance(patient.id);
              }}
              className="flex size-8 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors cursor-pointer"
            >
              <Check className="size-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function PatientCardOverlay({ patient, isDragOverlay }: PatientCardProps) {
  return <PatientCard patient={patient} isDragOverlay={isDragOverlay} />;
}
