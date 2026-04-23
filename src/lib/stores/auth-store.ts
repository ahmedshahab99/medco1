"use client";

import { create } from "zustand";
import { getAuthState } from "@/lib/auth";
import { logout } from "@/app/auth/logout/action";
import type { AuthProfile } from "@/lib/types/auth";

interface AuthState {
  user: AuthProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  initialize: () => Promise<void>;
  performLogout: () => Promise<void>;
  refresh: () => Promise<void>;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  reset: () => void;
  
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const profile = await getAuthState();
      if (profile) {
        set({
          user: profile,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  performLogout: async () => {
    await logout();
    set({
      user: null,
      isAuthenticated: false,
      isSidebarCollapsed: false,
      isMobileSidebarOpen: false,
    });
  },

  refresh: async () => {
    const profile = await getAuthState();
    if (profile) {
      set({
        user: profile,
        isAuthenticated: true,
      });
    }
  },

  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),

  reset: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isSidebarCollapsed: false,
      isMobileSidebarOpen: false,
    }),
}));
