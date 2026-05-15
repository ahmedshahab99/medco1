import { useQuery } from "@tanstack/react-query";
import { getClinicAvailability } from "@/app/dashboard/availability/actions";

export function useAvailability() {
  return useQuery({
    queryKey: ["availability"],
    queryFn: async () => {
      const data = await getClinicAvailability();
      return data;
    },
    staleTime: "static", // 5 minutes
  });
}
