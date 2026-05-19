"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PatientUpdateInput } from "@/lib/schemas/patient";

export interface PatientCase {
  id: string;
  title: string;
  createdAt: string;
}

export interface MedicalNote {
  id: string;
  content: string;
  createdAt: string;
}

export interface PatientFile {
  id: string;
  name: string;
  url: string;
  size: string;
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
  medicalNotes?: MedicalNote[];
  patientFiles?: PatientFile[];
  tags?: string[];
  nextAppointment?: string;
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

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PatientUpdateInput }) => {
      const res = await fetch(`/api/patients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "فشل في تحديث المريض" }));
        throw new Error(error.error || "فشل في تحديث المريض");
      }
      return res.json() as Promise<Patient>;
    },
    onMutate: async ({ id, data }) => {
      const queryKey = ["patient", id];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Patient>(queryKey);

      if (previous) {
        queryClient.setQueryData<Patient>(queryKey, {
          ...previous,
          ...(data.firstName && data.lastName && { name: `${data.firstName} ${data.lastName}` }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.email !== undefined && { email: data.email }),
          ...(data.dateOfBirth !== undefined && { dateOfBirth: data.dateOfBirth }),
          ...(data.gender !== undefined && { gender: data.gender }),
          ...(data.address !== undefined && { address: data.address }),
        });
      }

      return { previous, queryKey };
    },
    onSuccess: () => {
      toast.success("تم تحديث المريض بنجاح");
    },
    onError: (_err, _vars, context) => {
      toast.error("فشل في تحديث المريض");
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["patient", id] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/patients/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "فشل في حذف المريض" }));
        throw new Error(error.error || "فشل في حذف المريض");
      }
      return res.json() as Promise<{ success: boolean }>;
    },
    onSuccess: () => {
      toast.success("تم حذف المريض بنجاح");
    },
    onError: () => {
      toast.error("فشل في حذف المريض");
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ["patient", id] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
