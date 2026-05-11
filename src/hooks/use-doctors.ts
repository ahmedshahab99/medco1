"use client";

import { useQuery } from "@tanstack/react-query";

export interface Doctor {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchDoctors(): Promise<Doctor[]> {
  const res = await fetch("/api/doctors");
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch doctors" }));
    throw new Error(error.error || "Failed to fetch doctors");
  }
  return res.json();
}

export function useDoctors() {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctors,
  });
}
