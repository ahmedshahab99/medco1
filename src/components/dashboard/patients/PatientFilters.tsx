"use client";

import React from "react";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button } from "../../ui/Button";
import { ALL_TAGS, DOCTORS } from "../../../lib/mock/patients";

export interface FilterState {
  tags: string[];
  status: "all" | "active" | "inactive";
  doctor: string;
  lastVisit: "all" | "7days" | "30days" | "none";
  hasUpcoming: "all" | "yes" | "no";
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

  function toggleTag(tag: string) {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags: next });
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col border-r border-slate-100 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-lg">الفلاتر</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-7">

          {/* Tags */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">التصنيفات</p>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => {
                const active = filters.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                      active
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">الحالة</p>
            <div className="flex gap-2">
              {(["all", "active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => onChange({ ...filters, status: s })}
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

          {/* Doctor */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">الطبيب المعالج</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onChange({ ...filters, doctor: "" })}
                className={`w-full text-right px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  filters.doctor === ""
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                الكل
              </button>
              {DOCTORS.map((doc) => (
                <button
                  key={doc}
                  onClick={() => onChange({ ...filters, doctor: doc })}
                  className={`w-full text-right px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    filters.doctor === doc
                      ? "bg-blue-50 text-blue-600 border-blue-200"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {doc}
                </button>
              ))}
            </div>
          </div>

          {/* Last Visit */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">آخر زيارة</p>
            <div className="flex flex-col gap-2">
              {([
                { value: "all", label: "الكل" },
                { value: "7days", label: "آخر 7 أيام" },
                { value: "30days", label: "آخر 30 يوم" },
                { value: "none", label: "لا توجد زيارات" },
              ] as { value: FilterState["lastVisit"]; label: string }[]).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onChange({ ...filters, lastVisit: value })}
                  className={`w-full text-right px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    filters.lastVisit === value
                      ? "bg-blue-50 text-blue-600 border-blue-200"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Has Upcoming */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">الموعد القادم</p>
            <div className="flex gap-2">
              {([
                { value: "all", label: "الكل" },
                { value: "yes", label: "موجود" },
                { value: "no", label: "لا يوجد" },
              ] as { value: FilterState["hasUpcoming"]; label: string }[]).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onChange({ ...filters, hasUpcoming: value })}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    filters.hasUpcoming === value
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
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
