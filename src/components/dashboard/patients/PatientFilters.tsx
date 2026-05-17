"use client";

import React from "react";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button } from "../../ui/Button";

export interface FilterState {
  status: "all" | "active" | "inactive";
}

interface PatientFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onReset: () => void;
}

export function PatientFilters({ isOpen, onClose, filters, onChange, onReset }: PatientFiltersProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col border-r border-slate-100 animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-lg">الفلاتر</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-7">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">الحالة</p>
            <div className="flex gap-2">
              {(["all", "active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => onChange({ status: s })}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    filters.status === s
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {s === "all" ? "الكل" : s === "active" ? "نشط" : "غير نشط"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 flex gap-3">
          <Button variant="outline" className="flex-1 gap-1.5" onClick={onReset}>
            <RotateCcw className="w-4 h-4" />
            مسح الفلاتر
          </Button>
          <Button className="flex-1" onClick={onClose}>
            تطبيق
          </Button>
        </div>
      </div>
    </>
  );
}
