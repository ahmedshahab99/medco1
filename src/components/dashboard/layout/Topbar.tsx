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

      <div className="hidden lg:flex items-center bg-slate-100/80 rounded-xl px-3.5 py-2 hover:bg-slate-200/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500 transition-all w-[360px] border border-transparent">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="ابحث عن مريض، موعد..."
          className="bg-transparent border-none outline-none text-sm px-2.5 w-full placeholder:text-slate-400 focus:ring-0 text-slate-700"
        />
      </div>

      <div className="lg:hidden flex-1" />

      <div className="flex items-center gap-1 sm:gap-2">
        <button className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-all group">
          <Bell className="w-4.5 h-4.5 text-slate-500 group-hover:text-slate-700" />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <button onClick={() => logout()} className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all group">
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
