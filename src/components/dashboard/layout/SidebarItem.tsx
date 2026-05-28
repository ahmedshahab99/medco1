"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { NavItem } from "../../../lib/types/dashboard";

export function SidebarItem({ item, isCollapsed, dark }: { item: NavItem; isCollapsed: boolean; dark?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = useMemo(() => {
    if (!pathname) return false;
    if (item.href.includes("?")) {
      const [basePath, queryStr] = item.href.split("?");
      const targetParams = new URLSearchParams(queryStr);
      const targetTab = targetParams.get("tab");
      const currentTab = searchParams.get("tab") || "overview";
      return pathname === basePath && currentTab === targetTab;
    }
    return pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
  }, [pathname, item.href, searchParams]);

  const Icon = item.icon;

  const baseClasses = dark
    ? "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
    : "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group";

  const activeClasses = dark
    ? "bg-emerald-500/15 text-emerald-400 font-medium shadow-sm"
    : "bg-blue-50 text-blue-700 font-bold";

  const inactiveClasses = dark
    ? "text-white/60 hover:bg-white/5 hover:text-white"
    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

  const iconActiveClasses = dark
    ? "text-emerald-400"
    : "text-blue-600";

  const iconInactiveClasses = dark
    ? "text-white/30 group-hover:text-white/60"
    : "text-slate-400 group-hover:text-slate-600";

  return (
    <Link
      href={item.disabled ? "#" : item.href}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${item.disabled ? "opacity-50 pointer-events-none" : ""}`}
      title={isCollapsed ? item.title : undefined}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? iconActiveClasses : iconInactiveClasses}`} />
      {!isCollapsed && <span className="text-sm truncate">{item.title}</span>}
    </Link>
  );
}
