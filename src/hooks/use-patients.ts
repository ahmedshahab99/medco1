"use client";

import { useQuery } from "@tanstack/react-query";

export interface PatientCase {
  id: string;
  title: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  status: string;
  cases: PatientCase[];
  createdAt: string;
  updatedAt: string;
}

async function fetchPatients(search?: string): Promise<Patient[]> {
  const url = new URL("/api/patients", window.location.origin);
  if (search) url.searchParams.set("search", search);
  const res = await fetch(url.toString());
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch patients" }));
    throw new Error(error.error || "Failed to fetch patients");
  }
  return res.json();
}

export function usePatients(search?: string) {
  return useQuery({
    queryKey: ["patients", search ?? ""],
    queryFn: () => fetchPatients(search),
    // Always fetch; empty search returns all patients (up to 100)
    enabled: true,
  });
}
