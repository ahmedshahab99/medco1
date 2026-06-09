import { useCallback } from "react";

export interface Medication {
  id?: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface VisitNote {
  id: string;
  appointmentId?: string;
  content?: string;
  diagnosis?: string;
  medications: Medication[];
  notes?: string;
  validityDays?: number;
  createdAt: string;
  updatedAt: string;
}

interface UseVisitNotesParams {
  patientId: string;
}

export function useVisitNotes({ patientId }: UseVisitNotesParams) {
  const fetchVisitNotes = useCallback(async (): Promise<VisitNote[]> => {
    const response = await fetch(`/api/patients/${patientId}/visit-notes`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch visit notes");
    }
    return response.json();
  }, [patientId]);

  const createVisitNote = useCallback(
    async (data: Omit<VisitNote, "id" | "createdAt" | "updatedAt">) => {
      const response = await fetch(`/api/patients/${patientId}/visit-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create visit note");
      }

      return response.json() as Promise<VisitNote>;
    },
    [patientId]
  );

  const updateVisitNote = useCallback(
    async (id: string, data: Partial<Omit<VisitNote, "id" | "createdAt" | "updatedAt">>) => {
      const response = await fetch(`/api/patients/${patientId}/visit-notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update visit note");
      }

      return response.json() as Promise<VisitNote>;
    },
    [patientId]
  );

  const deleteVisitNote = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/patients/${patientId}/visit-notes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete visit note");
      }

      return response.json();
    },
    [patientId]
  );

  return {
    fetchVisitNotes,
    createVisitNote,
    updateVisitNote,
    deleteVisitNote,
  };
}
