"use client";

import { useAuthStore } from "@/lib/stores/auth-store";
import type { UserRole } from "@/lib/types/auth";
import { isRoleAllowed } from "@/lib/types/auth";

export function useAuth() {
  const store = useAuthStore();

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    role: store.user?.role ?? null,
    tenantId: store.user?.tenantId ?? null,
    isSidebarCollapsed: store.isSidebarCollapsed,
    isMobileSidebarOpen: store.isMobileSidebarOpen,
    setSidebarCollapsed: store.setSidebarCollapsed,
    setMobileSidebarOpen: store.setMobileSidebarOpen,
    hasRole: (role: UserRole) => store.user?.role === role,
    hasAnyRole: (roles: UserRole[]) =>
      store.user ? isRoleAllowed(store.user.role, roles) : false,
    logout: store.performLogout,
    refresh: store.refresh,
    initialize: store.initialize,
    reset: store.reset,
  };
}
