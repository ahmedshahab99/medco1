"use client";

import React from "react";
import { Search, Bell, Menu, User } from "lucide-react";
import { Button } from "../../ui/Button";

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

export function Topbar({ onOpenMobileSidebar }: TopbarProps) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      {/* Mobile Menu Button & Title */}
      <div className="flex items-center gap-4 lg:hidden">
        <Button variant="ghost" size="icon" onClick={onOpenMobileSidebar}>
          <Menu className="w-5 h-5 text-slate-700" />
        </Button>
        <span className="text-lg font-bold text-slate-800">اللوحة الرئيسية</span>
      </div>

      {/* Global Search - Hidden on mobile */}
      <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-4 py-2 hover:bg-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all w-[400px]">
        <Search className="w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="ابحث عن مريض، موعد، أو تقرير..." 
          className="bg-transparent border-none outline-none text-sm px-3 w-full placeholder:text-slate-500 focus:ring-0 text-slate-800"
        />
      </div>

      {/* Placeholder to balance mobile header if needed */}
      <div className="lg:hidden flex-1" />

      {/* Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" className="relative group">
          <Bell className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 border border-white"></span>
        </Button>
        
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
        
        <button className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-50 transition-colors text-start focus:ring-2 focus:ring-blue-500 outline-none">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-tight">د. أحمد مجدي</p>
            <p className="text-xs text-slate-500">طبيب أسنان</p>
          </div>
        </button>
      </div>
    </header>
  );
}
