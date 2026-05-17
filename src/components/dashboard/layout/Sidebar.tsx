"use client";

import React, { useMemo } from "react";
import { navigationGroups } from "../../../lib/constants/navigation";
import { SidebarItem } from "./SidebarItem";
import { 
  Activity, Menu, ChevronLeft, User, FileText, 
  Files, Calendar, Briefcase, CreditCard, Bell 
} from "lucide-react";
import { Button } from "../../ui/Button";
import { useParams, usePathname } from "next/navigation";
import { usePatients } from "@/hooks/use-patients";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }: SidebarProps) {
  const params = useParams();
  const pathname = usePathname();
  const patientId = params.id as string;

  const { data: patientsData } = usePatients();

  const patient = useMemo(() => {
    if (!patientId || !patientsData) return null;
    return patientsData.find((p) => p.id === patientId);
  }, [patientId, patientsData]);

  // Specific links for the patient context
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
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 bottom-0 z-50 flex flex-col bg-white border-l border-slate-200 transition-all duration-300 h-screen
          ${isCollapsed ? "w-20" : "w-72"}
          ${isMobileOpen ? "translate-x-0 right-0" : "translate-x-full right-0 lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Activity className="text-white w-6 h-6" />
            </div>
            {!isCollapsed && (
              <span className="text-2xl font-black bg-gradient-to-l from-blue-700 to-blue-400 bg-clip-text text-transparent truncate">
                ميدكو
              </span>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleCollapse}
            className="hidden lg:flex text-slate-500 hover:text-slate-900"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation Wrapper */}
        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <div className="flex flex-col gap-6">
            {/* Patient Specific Context */}
            {patient && (
              <div className="mb-2 animate-in slide-in-from-right-4 duration-300">
                {!isCollapsed && (
                  <div className="px-3 mb-4">
                    <button 
                      onClick={() => window.location.href = "/dashboard/patients"}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider mb-3"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      العودة للمرضى
                    </button>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{patient.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">#{patient.id}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col gap-1">
                  {patientLinks.map((item, idx) => (
                    <SidebarItem 
                      key={idx} 
                      item={item} 
                      isCollapsed={isCollapsed} 
                    />
                  ))}
                </div>
                
                {!isCollapsed && <div className="mt-6 border-t border-slate-100 mx-3" />}
              </div>
            )}

            {/* Main Navigation */}
            {navigationGroups.map((group, idx) => (
              <div key={idx} className={patient ? "opacity-60" : ""}>
                {!isCollapsed && (
                  <h4 className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {group.label}
                  </h4>
                )}
                {isCollapsed && <div className="h-4" />}
                <div className="flex flex-col gap-1">
                  {group.items.map((item, itemIdx) => (
                    <SidebarItem 
                      key={itemIdx} 
                      item={item} 
                      isCollapsed={isCollapsed} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-100 flex-shrink-0">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-sm font-bold text-slate-800">باقة العيادة الذكية</p>
              <p className="text-xs text-slate-500 mt-1">تجديد: ١٥ أكتوبر ٢٠٢٦</p>
              <Button size="sm" className="w-full mt-3 bg-slate-900 hover:bg-slate-800">الترقية الآن</Button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
