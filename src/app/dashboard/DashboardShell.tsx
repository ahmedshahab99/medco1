"use client";

import React, { useEffect } from "react";
import { Sidebar } from "@/components/dashboard/layout/Sidebar";
import { Topbar } from "@/components/dashboard/layout/Topbar";
import { useAuth } from "@/hooks/use-auth";
import { useSessionWatch } from "@/hooks/use-session-watch";
import { Toast } from "@/components/ui/Toast";
import { Toaster } from "sonner";
import { MutationIndicator } from "@/components/ui/MutationIndicator";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const {
    initialize,
    isLoading,
    isSidebarCollapsed,
    isMobileSidebarOpen,
    setSidebarCollapsed,
    setMobileSidebarOpen,
  } = useAuth();

  const { toast, hideToast } = useSessionWatch();
  

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 flex text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto custom-scrollbar">
        <Topbar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-3 md:p-4 lg:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={hideToast}
      />
      <Toaster position="top-center" />
      <MutationIndicator />
    </div>
  );
}
