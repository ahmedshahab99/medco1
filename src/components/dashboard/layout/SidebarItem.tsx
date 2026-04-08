"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { NavItem } from "../../../lib/types/dashboard";

export function SidebarItem({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Support query parameters for tabs
  const isActive = useMemo(() => {
    if (!pathname) return false;
    
    // If the item href includes a query param (tab)
    if (item.href.includes("?")) {
      const [basePath, queryStr] = item.href.split("?");
      const targetParams = new URLSearchParams(queryStr);
      const targetTab = targetParams.get("tab");
      const currentTab = searchParams.get("tab") || "overview";
      
      return pathname === basePath && currentTab === targetTab;
    }
    
    // Default matching (exact match or parent path)
    return pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
  }, [pathname, item.href, searchParams]);

  const Icon = item.icon;

  return (
    <Link 
      href={item.disabled ? "#" : item.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
        ${isActive ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}
        ${item.disabled ? "opacity-50 pointer-events-none" : ""}
      `}
      title={isCollapsed ? item.title : undefined}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
      {!isCollapsed && (
        <span className="truncate">{item.title} </span>
      )}
    </Link>
  );
}
