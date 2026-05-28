"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AppointmentCreateInput, AppointmentPatchInput } from "@/lib/schemas/appointment";

export interface CreateAppointmentArgs {
  input: AppointmentCreateInput;
  optimistic: {
    patientName: string;
    patientPhone: string | null;
    doctorName: string;
    serviceName: string;
    serviceColor: string;
  };
}

export interface CalendarAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string | null;
  doctorId: string;
  doctorName: string;
  serviceId: string;
  serviceName: string;
  serviceColor: string;
  status: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  caseId: string | null;
  caseName: string | null;
  consultationFee: number | null;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = "/api/appointments";

function getQueryKey(from: Date, to: Date) {
  return ["appointments", from.toISOString(), to.toISOString()];
}

async function fetchAppointments(from: Date, to: Date): Promise<CalendarAppointment[]> {
  const url = new URL(API_BASE, window.location.origin);
  url.searchParams.set("from", from.toISOString());
  url.searchParams.set("to", to.toISOString());
  const res = await fetch(url.toString());
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch appointments" }));
    throw new Error(error.error || "Failed to fetch appointments");
  }
  return res.json();
}

async function createAppointment(data: AppointmentCreateInput): Promise<CalendarAppointment> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to create appointment" }));
    throw new Error(error.error || "Failed to create appointment");
  }
  return res.json();
}

const pendingUpdates = new Map<string, AbortController>();

async function updateAppointment(id: string, data: AppointmentPatchInput): Promise<CalendarAppointment> {
  pendingUpdates.get(id)?.abort();
  const controller = new AbortController();
  pendingUpdates.set(id, controller);

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Failed to update appointment" }));
      throw new Error(error.error || "Failed to update appointment");
    }
    return res.json();
  } finally {
    if (pendingUpdates.get(id) === controller) {
      pendingUpdates.delete(id);
    }
  }
}

async function deleteAppointment(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to delete appointment" }));
    throw new Error(error.error || "Failed to delete appointment");
  }
}

export function useAppointments(from: Date, to: Date) {
  return useQuery({
    queryKey: getQueryKey(from, to),
    queryFn: () => fetchAppointments(from, to),
  });
}

export function useCreateAppointment(from: Date, to: Date) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: CreateAppointmentArgs) => createAppointment(args.input),
    onMutate: async (args) => {
      const queryKey = getQueryKey(from, to);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CalendarAppointment[]>(queryKey);

      const optimistic: CalendarAppointment = {
        id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        patientId: args.input.patientId ?? `temp-patient-${Date.now()}`,
        patientName: args.optimistic.patientName,
        patientPhone: args.optimistic.patientPhone,
        doctorId: args.input.doctorId,
        doctorName: args.optimistic.doctorName,
        serviceId: args.input.serviceId,
        serviceName: args.optimistic.serviceName,
        serviceColor: args.optimistic.serviceColor,
        status: "SCHEDULED",
        startTime: args.input.startTime,
        endTime: args.input.endTime,
        notes: args.input.notes ?? null,
        caseId: args.input.caseId ?? null,
        caseName: null,
        consultationFee: args.input.consultationFee ? parseFloat(args.input.consultationFee) : null,
        paymentStatus: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<CalendarAppointment[]>(queryKey, (old) =>
        old ? [...old, optimistic] : [optimistic]
      );

      return { previous, queryKey };
    },
    onSuccess: () => {
      toast.success("تم حجز الموعد بنجاح");
    },
    onError: (err, _args, context) => {
      toast.error(err instanceof Error ? err.message : "فشل إنشاء الموعد");
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: (_data, _error, _args, context) => {
      
        
      queryClient.invalidateQueries({ queryKey: getQueryKey(from, to) });
    
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
    },
  });
}

export function useUpdateAppointment(from: Date, to: Date) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AppointmentPatchInput }) =>
      updateAppointment(id, data),
    onMutate: async ({ id, data }) => {
      const queryKey = getQueryKey(from, to);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CalendarAppointment[]>(queryKey);
      queryClient.setQueryData<CalendarAppointment[]>(queryKey, (old) =>
        old?.map((a) =>
          a.id === id
            ? {
                ...a,
                ...(data.status && { status: data.status }),
                ...(data.startTime && { startTime: data.startTime }),
                ...(data.endTime && { endTime: data.endTime }),
                ...(data.notes !== undefined && { notes: data.notes }),
                ...(data.caseId !== undefined && { caseId: data.caseId }),
                ...(data.serviceId && { serviceId: data.serviceId }),
                ...(data.doctorId && { doctorId: data.doctorId }),
                ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
              }
            : a
        )
      );
      return { previous, queryKey };
    },
    onSuccess: () => {
      toast.success("تم تحديث الموعد");
    },
    onError: (err, _vars, context) => {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast.error(err instanceof Error ? err.message : "فشل تعديل الموعد");
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: (_data, _error, _vars, context) => {
      if (context) {
    queryClient.invalidateQueries({
      queryKey: context.queryKey,
      refetchType: 'none',
    });
  }
    },
  });
}

export function useRescheduleAppointment(from: Date, to: Date) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AppointmentPatchInput }) =>
      updateAppointment(id, data),
    onError: (err) => {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast.error(err instanceof Error ? err.message : "فشل تعديل الموعد");
    },
    onSuccess: () => {
      toast.success("تم إعادة جدولة الموعد");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(from, to) });
    },
  });
}

export function useDeleteAppointment(from: Date, to: Date) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAppointment,
    onMutate: async (id) => {
      const queryKey = getQueryKey(from, to);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CalendarAppointment[]>(queryKey);
      queryClient.setQueryData<CalendarAppointment[]>(queryKey, (old) =>
        old?.filter((a) => a.id !== id)
      );
      return { previous, queryKey };
    },
    onSuccess: () => {
      toast.success("تم حذف الموعد");
    },
    onError: (err, _id, context) => {
      toast.error(err instanceof Error ? err.message : "فشل حذف الموعد");
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: (_data, _error, _id, context) => {
      if (context) {
        queryClient.invalidateQueries({ queryKey: context.queryKey, refetchType: 'none' });
      }
    },
  });
}
