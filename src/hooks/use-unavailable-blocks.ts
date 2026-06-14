"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { DoctorUnavailableBlock } from "@/app/dashboard/calendar/types";

const API_BASE = "/api/unavailable";

function getQueryKey(from: Date, to: Date, doctorId?: string) {
  return ["unavailable-blocks", from.toISOString(), to.toISOString(), doctorId];
}

async function fetchUnavailableBlocks(
  from: Date,
  to: Date,
  doctorId?: string
): Promise<DoctorUnavailableBlock[]> {
  const url = new URL(API_BASE, window.location.origin);
  url.searchParams.set("from", from.toISOString());
  url.searchParams.set("to", to.toISOString());
  if (doctorId) url.searchParams.set("doctorId", doctorId);
  const res = await fetch(url.toString());
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch unavailable blocks" }));
    throw new Error(error.error || "Failed to fetch unavailable blocks");
  }
  return res.json();
}

async function createUnavailableBlock(data: {
  doctorId: string;
  startTime: string;
  endTime: string;
  reason?: string;
}): Promise<DoctorUnavailableBlock> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to create unavailable block" }));
    throw new Error(error.error || "Failed to create unavailable block");
  }
  return res.json();
}

async function deleteUnavailableBlock(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to delete unavailable block" }));
    throw new Error(error.error || "Failed to delete unavailable block");
  }
}

export function useUnavailableBlocks(
  from: Date,
  to: Date,
  doctorId?: string
) {
  return useQuery({
    queryKey: getQueryKey(from, to, doctorId),
    queryFn: () => fetchUnavailableBlocks(from, to, doctorId),
  });
}

export function useCreateUnavailableBlock(
  from: Date,
  to: Date,
  doctorId?: string
) {
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(from, to, doctorId);

  return useMutation({
    mutationFn: createUnavailableBlock,
    onSuccess: () => {
      toast.success("تم حجز الوقت بنجاح");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "فشل حجز الوقت"
      );
    },
  });
}

export function useDeleteUnavailableBlock(
  from: Date,
  to: Date,
  doctorId?: string
) {
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(from, to, doctorId);

  return useMutation({
    mutationFn: deleteUnavailableBlock,
    onSuccess: () => {
      toast.success("تم إلغاء حجز الوقت");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "فشل إلغاء حجز الوقت"
      );
    },
  });
}
