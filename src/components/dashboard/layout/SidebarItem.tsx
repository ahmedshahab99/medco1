"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem } from "../../../lib/types/dashboard";

export function SidebarItem({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  const pathname = usePathname();
  // Assume active if exact match or if it's a sub-route (excluding base /dashboard)
  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));

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
        <span className="truncate">{item.title}</span>
      )}
    </Link>
  );
}
