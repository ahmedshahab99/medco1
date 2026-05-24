import { useCallback } from "react";
import { toast } from "sonner";

export interface Medication {
  id?: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  diagnosis: string;
  medications: Medication[];
  notes?: string;
  validityDays?: number;
  createdAt: string;
  updatedAt: string;
}

interface UsePrescriptionsParams {
  patientId: string;
}

export function usePrescriptions({ patientId }: UsePrescriptionsParams) {
  const fetchPrescriptions = useCallback(async (): Promise<Prescription[]> => {
    const response = await fetch(`/api/patients/${patientId}/prescriptions`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch prescriptions");
    }
    return response.json();
  }, [patientId]);

  const createPrescription = useCallback(
    async (data: Omit<Prescription, "id" | "createdAt" | "updatedAt">) => {
      const response = await fetch(`/api/patients/${patientId}/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create prescription");
      }

      return response.json() as Promise<Prescription>;
    },
    [patientId]
  );

  const updatePrescription = useCallback(
    async (id: string, data: Partial<Omit<Prescription, "id" | "createdAt" | "updatedAt">>) => {
      const response = await fetch(`/api/patients/${patientId}/prescriptions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update prescription");
      }

      return response.json() as Promise<Prescription>;
    },
    [patientId]
  );

  const deletePrescription = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/patients/${patientId}/prescriptions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete prescription");
      }

      return response.json();
    },
    [patientId]
  );

  return {
    fetchPrescriptions,
    createPrescription,
    updatePrescription,
    deletePrescription,
  };
}
