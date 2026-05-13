// Service hooks for React Query
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface Service {
  id: string
  tenantId: string
  name: string
  description: string | null
  duration: number
  color: string
  price: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ServiceCreateInput {
  name: string
  description?: string | null
  duration: number
  color: string
  price?: number | null
  isActive?: boolean
}

export interface ServiceUpdateInput {
  name?: string
  description?: string | null
  duration?: number
  color?: string
  price?: number | null
  isActive?: boolean
}

const API_BASE = "/api/services"

async function fetchServices(): Promise<Service[]> {
  const res = await fetch(API_BASE)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch services" }))
    throw new Error(error.error || "Failed to fetch services")
  }
  return res.json()
}

async function fetchService(id: string): Promise<Service> {
  const res = await fetch(`${API_BASE}/${id}`)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Service not found" }))
    throw new Error(error.error || "Failed to fetch service")
  }
  return res.json()
}

async function createService(data: ServiceCreateInput): Promise<Service> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to create service" }))
    throw new Error(error.error || "Failed to create service")
  }
  return res.json()
}

async function updateService(id: string, data: ServiceUpdateInput): Promise<Service> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to update service" }))
    throw new Error(error.error || "Failed to update service")
  }
  return res.json()
}

async function deleteService(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to delete service" }))
    throw new Error(error.error || "Failed to delete service")
  }
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useService(id: string) {
  return useQuery({
    queryKey: ["services", id],
    queryFn: () => fetchService(id),
    enabled: !!id,
    
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
    },
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServiceUpdateInput }) =>
      updateService(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["services"] })
      const previous = queryClient.getQueryData<Service[]>(["services"])
      queryClient.setQueryData<Service[]>(["services"], (old) =>
        old?.map((s) => (s.id === id ? { ...s, ...data } : s))
      )
      return { previous }
    },
    onError: (err, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["services"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
    },
  })
}

export function useDeleteService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteService,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["services"] })
      const previous = queryClient.getQueryData<Service[]>(["services"])
      queryClient.setQueryData<Service[]>(["services"], (old) =>
        old?.filter((s) => s.id !== id)
      )
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["services"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
    },
  })
}