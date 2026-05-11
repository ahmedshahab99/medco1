"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { WaitlistCreateInput, WaitlistPatchInput } from "@/lib/schemas/waitlist";

export interface CreateWaitlistArgs {
  input: WaitlistCreateInput;
  optimistic: {
    patientName: string;
    patientPhone: string | null;
  };
}

export interface WaitlistEntry {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string | null;
  notes: string | null;
  status: string;
  addedAt: string;
}

const API_BASE = "/api/waitlist";

async function fetchWaitlist(): Promise<WaitlistEntry[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch waitlist" }));
    throw new Error(error.error || "Failed to fetch waitlist");
  }
  return res.json();
}

async function createWaitlistEntry(data: WaitlistCreateInput): Promise<WaitlistEntry> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to add to waitlist" }));
    throw new Error(error.error || "Failed to add to waitlist");
  }
  return res.json();
}

async function updateWaitlistEntry(id: string, data: WaitlistPatchInput): Promise<WaitlistEntry> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to update waitlist entry" }));
    throw new Error(error.error || "Failed to update waitlist entry");
  }
  return res.json();
}

async function deleteWaitlistEntry(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to delete waitlist entry" }));
    throw new Error(error.error || "Failed to delete waitlist entry");
  }
}

export function useWaitlist() {
  return useQuery({
    queryKey: ["waitlist"],
    queryFn: fetchWaitlist,
  });
}

export function useCreateWaitlistEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: CreateWaitlistArgs) => createWaitlistEntry(args.input),
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey: ["waitlist"] });
      const previous = queryClient.getQueryData<WaitlistEntry[]>(["waitlist"]);

      const optimistic: WaitlistEntry = {
        id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        patientId: args.input.patientId ?? `temp-patient-${Date.now()}`,
        patientName: args.optimistic.patientName,
        patientPhone: args.optimistic.patientPhone,
        notes: args.input.notes ?? null,
        status: "waiting",
        addedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<WaitlistEntry[]>(["waitlist"], (old) =>
        old ? [...old, optimistic] : [optimistic]
      );

      return { previous };
    },
    onSuccess: () => {
      toast.success("تمت الإضافة لقائمة الانتظار");
    },
    onError: (err, _args, context) => {
      toast.error(err instanceof Error ? err.message : "فشل إضافة المريض لقائمة الانتظار");
      if (context?.previous) {
        queryClient.setQueryData(["waitlist"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
    },
  });
}

export function useUpdateWaitlistEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WaitlistPatchInput }) =>
      updateWaitlistEntry(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["waitlist"] });
      const previous = queryClient.getQueryData<WaitlistEntry[]>(["waitlist"]);
      queryClient.setQueryData<WaitlistEntry[]>(["waitlist"], (old) =>
        old?.map((w) =>
          w.id === id
            ? {
                ...w,
                ...(data.notes !== undefined && { notes: data.notes }),
                ...(data.status && { status: data.status }),
              }
            : w
        )
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success("تم تعديل بيانات الانتظار");
    },
    onError: (err, _vars, context) => {
      toast.error(err instanceof Error ? err.message : "فشل تعديل بيانات الانتظار");
      if (context?.previous) {
        queryClient.setQueryData(["waitlist"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
    },
  });
}

export function useDeleteWaitlistEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWaitlistEntry,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["waitlist"] });
      const previous = queryClient.getQueryData<WaitlistEntry[]>(["waitlist"]);
      queryClient.setQueryData<WaitlistEntry[]>(["waitlist"], (old) =>
        old?.filter((w) => w.id !== id)
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success("تم الحذف من قائمة الانتظار");
    },
    onError: (err, _id, context) => {
      toast.error(err instanceof Error ? err.message : "فشل حذف المريض من الانتظار");
      if (context?.previous) {
        queryClient.setQueryData(["waitlist"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
    },
  });
}
