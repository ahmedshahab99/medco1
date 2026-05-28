"use client";

import React, { useMemo } from "react";
import { navigationGroups } from "../../../lib/constants/navigation";
import { SidebarItem } from "./SidebarItem";
import { 
  Activity, ChevronLeft, ChevronRight, User, FileText, 
  Files, Calendar, Briefcase, CreditCard, Bell, PanelLeftClose, PanelLeft
} from "lucide-react";
import { useParams } from "next/navigation";
import { usePatient } from "@/hooks/use-patients";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }: SidebarProps) {
  const params = useParams();
  const patientId = params.id as string;
  const { data: patient } = usePatient(patientId);

  const patientLinks = useMemo(() => {
    if (!patientId) return [];
    const baseUrl = `/dashboard/patients/${patientId}`;
    return [
      { title: "تفاصيل المريض", href: `${baseUrl}?tab=overview`, icon: User },
      { title: "ملاحظات العلاج", href: `${baseUrl}?tab=notes`, icon: FileText },
      { title: "الملفات", href: `${baseUrl}?tab=files`, icon: Files },
      { title: "المواعيد", href: `${baseUrl}?tab=appointments`, icon: Calendar },
      { title: "الحالات", href: `${baseUrl}?tab=history`, icon: Briefcase },
      { title: "المدفوعات", href: `${baseUrl}?tab=payment`, icon: CreditCard },
      { title: "التذكيرات", href: `${baseUrl}?tab=reminders`, icon: Bell },
    ];
  }, [patientId]);

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={onCloseMobile} />
      )}

      <aside className={`fixed lg:sticky top-0 bottom-0 z-50 flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 transition-all duration-300 h-screen
        ${isCollapsed ? "w-[72px]" : "w-64"}
        ${isMobileOpen ? "translate-x-0 right-0" : "-translate-x-full right-0 lg:translate-x-0"}
      `}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
              <Activity className="text-white w-5 h-5" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-black text-white tracking-tight">ميدكو</span>
            )}
          </div>
          <button onClick={onToggleCollapse} className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar scrollbar-thin">
          <div className="flex flex-col gap-5">

            {/* Patient Context */}
            {patient && (
              <div>
                {!isCollapsed && (
                  <div className="px-2 mb-3">
                    <button onClick={() => window.location.href = "/dashboard/patients"}
                      className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors mb-3">
                      <ChevronRight className="w-3 h-3" />
                      العودة للمرضى
                    </button>
                    <div className="flex items-center gap-3 p-2.5 bg-white/5 rounded-xl border border-white/10">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {patient.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{patient.name}</p>
                        <p className="text-[10px] text-white/40">#{patient.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-0.5">
                  {patientLinks.map((item, idx) => (
                    <SidebarItem key={idx} item={item} isCollapsed={isCollapsed} dark />
                  ))}
                </div>
                {!isCollapsed && <div className="mt-4 border-t border-white/5 mx-2" />}
              </div>
            )}

            {/* Navigation Groups */}
            {navigationGroups.map((group, idx) => (
              <div key={idx} className={patient ? "opacity-50" : ""}>
                {!isCollapsed && (
                  <h4 className="px-3 mb-2 text-[11px] font-bold text-white/30 uppercase tracking-widest">
                    {group.label}
                  </h4>
                )}
                {isCollapsed && <div className="h-3" />}
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item, itemIdx) => (
                    <SidebarItem key={itemIdx} item={item} isCollapsed={isCollapsed} dark />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-3 mx-3 mb-3 bg-white/5 rounded-xl border border-white/10 flex-shrink-0">
            <p className="text-xs font-bold text-white/80">باقة العيادة الذكية</p>
            <p className="text-[10px] text-white/40 mt-0.5">تجديد: ١٥ أكتوبر ٢٠٢٦</p>
            <button className="w-full mt-2 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">الترقية</button>
          </div>
        )}
      </aside>
    </>
  );
}
