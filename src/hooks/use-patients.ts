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
  address: string | null;
  cases: PatientCase[];
  createdAt: string;
  updatedAt: string;
}

export interface UsePatientsParams {
  search?: string;
  page?: number;
  pageSize?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedPatients {
  data: Patient[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function buildPatientsUrl(params: UsePatientsParams): URL {
  const url = new URL("/api/patients", window.location.origin);
  if (params.search) url.searchParams.set("search", params.search);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.pageSize) url.searchParams.set("pageSize", String(params.pageSize));
  if (params.status) url.searchParams.set("status", params.status);
  if (params.sortBy) url.searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) url.searchParams.set("sortOrder", params.sortOrder);
  return url;
}

async function fetchPatients(params: UsePatientsParams): Promise<Patient[] | PaginatedPatients> {
  const url = buildPatientsUrl(params);
  const res = await fetch(url.toString());
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch patients" }));
    throw new Error(error.error || "Failed to fetch patients");
  }
  return res.json();
}

export function usePatient(id: string) {
  
  return useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const res = await fetch(`/api/patients/${id}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to fetch patient" }));
        throw new Error(error.error || "Failed to fetch patient");
      }
      return res.json() as Promise<Patient>;
    },
    enabled: !!id,
  });
}

export function usePatients(search?: string): import("@tanstack/react-query").UseQueryResult<Patient[]>;
export function usePatients(params: UsePatientsParams & { page: number }): import("@tanstack/react-query").UseQueryResult<PaginatedPatients>;
export function usePatients(params?: UsePatientsParams): import("@tanstack/react-query").UseQueryResult<Patient[]>;
export function usePatients(params?: string | UsePatientsParams): import("@tanstack/react-query").UseQueryResult<Patient[] | PaginatedPatients> {
  const options: UsePatientsParams =
    typeof params === "string"
      ? { search: params }
      : params ?? {};
  return useQuery({
    queryKey: ["patients", options],
    queryFn: () => fetchPatients(options),
    enabled: true,
  });
}
