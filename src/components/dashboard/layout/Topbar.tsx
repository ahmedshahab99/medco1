"use client";

import React from "react";
import { Search, Bell, Menu, User, LogOut } from "lucide-react";
import { Button } from "../../ui/Button";
import { useAuth } from "@/hooks/use-auth";

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

export function Topbar({ onOpenMobileSidebar }: TopbarProps) {
  const { user, logout } = useAuth();
  const displayName = user?.firstName ?? user?.email?.split("@")[0] ?? "مستخدم";
  const displayRole = user?.role ?? "";

  return (
    <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <Button variant="ghost" size="icon" onClick={onOpenMobileSidebar}>
          <Menu className="w-5 h-5 text-slate-600" />
        </Button>
      </div>

     

      <div className="lg:hidden flex-1" />

      <div className="flex items-center gap-1 sm:gap-2 mr-auto">
        

        <button
          onClick={logout}
          className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all group"
        >
          <LogOut className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <button className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-all">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block text-start">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{displayName}</p>
            <p className="text-[11px] text-slate-400">{displayRole}</p>
          </div>
        </button>
      </div>
    </header>
  );
}
