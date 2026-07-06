import { useQuery } from "@tanstack/react-query";
import { getDoctorAvailability, getAllDoctorsAvailability } from "@/app/dashboard/availability/actions";
import type { WeekSchedule, AdvancedSettings } from "@/components/features/availability/types";

export interface DoctorAvailabilityData {
  schedule: WeekSchedule;
  settings: AdvancedSettings;
}

export interface DoctorAvailabilityEntry extends DoctorAvailabilityData {
  doctorId: string;
}

/**
 * Fetch a single doctor's availability.
 * Pass `doctorId` to target a specific doctor (ADMIN), or omit for the caller's own (DOCTOR).
 */
export function useAvailability(doctorId?: string) {
  return useQuery({
    queryKey: ["availability", doctorId ?? "self"],
    queryFn: async () => {
      const data = await getDoctorAvailability(doctorId);
      return data as DoctorAvailabilityData | null;
    },
    staleTime: "static",
  });
}

/**
 * Fetch every bookable doctor's availability in the tenant.
 * Used by the calendar's "all doctors" aggregate view.
 */
export function useAllDoctorsAvailability() {
  return useQuery({
    queryKey: ["availability", "all"],
    queryFn: async () => {
      const data = await getAllDoctorsAvailability();
      return data as DoctorAvailabilityEntry[];
    },
    staleTime: "static",
  });
}
