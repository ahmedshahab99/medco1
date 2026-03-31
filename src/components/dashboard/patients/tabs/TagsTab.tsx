"use client";

import React, { useState } from "react";
import { Patient } from "../../../../lib/types/dashboard";
import { Tag, X, Plus, ShieldAlert, RefreshCw, Star, UserPlus, Stethoscope, Zap } from "lucide-react";
import { ALL_TAGS } from "../../../../lib/mock/patients";

interface TagsTabProps {
  patient: Patient;
}

const TAG_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
  VIP:           { color: "bg-amber-100 text-amber-700 border border-amber-200",     icon: Star },
  مزمن:         { color: "bg-purple-100 text-purple-700 border border-purple-200",  icon: Stethoscope },
  جديد:         { color: "bg-emerald-100 text-emerald-700 border border-emerald-200", icon: UserPlus },
  متابعة:       { color: "bg-blue-100 text-blue-700 border border-blue-200",        icon: RefreshCw },
  "خطر مرتفع": { color: "bg-red-100 text-red-700 border border-red-200",            icon: ShieldAlert },
  حساسية:       { color: "bg-orange-100 text-orange-700 border border-orange-200",  icon: Zap },
};

const SEGMENTS = [
  { label: "يحتاج متابعة", color: "bg-rose-50 text-rose-700 border border-rose-200", active: true },
  { label: "مريض دائم", color: "bg-violet-50 text-violet-700 border border-violet-200", active: false },
  { label: "مرشح للحملات", color: "bg-amber-50 text-amber-700 border border-amber-200", active: false },
];

export function TagsTab({ patient }: TagsTabProps) {
  const [tags, setTags] = useState<string[]>([...patient.tags]);

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function addTag(tag: string) {
    if (!tags.includes(tag)) setTags((prev) => [...prev, tag]);
  }

  const available = ALL_TAGS.filter((t) => !tags.includes(t));

  return (
    <div className="space-y-6">
      {/* Current tags */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">التصنيفات الحالية</p>
        {tags.length === 0 ? (
          <p className="text-sm text-slate-400 py-3 text-center">لا توجد تصنيفات</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const cfg = TAG_CONFIG[tag];
              const Icon = cfg?.icon ?? Tag;
              return (
                <div
                  key={tag}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold ${cfg?.color ?? "bg-slate-100 text-slate-600"}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="mr-1 hover:opacity-60 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add tags */}
      {available.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">إضافة تصنيف</p>
          <div className="flex flex-wrap gap-2">
            {available.map((tag) => {
              const cfg = TAG_CONFIG[tag];
              const Icon = cfg?.icon ?? Tag;
              return (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold border border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all group"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Segments */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">الشرائح التلقائية</p>
        <div className="space-y-2">
          {SEGMENTS.map((seg) => (
            <div
              key={seg.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${seg.color}`}
            >
              <div className={`w-2 h-2 rounded-full ${seg.active ? "bg-current" : "bg-current opacity-40"}`} />
              {seg.label}
              {!seg.active && <span className="mr-auto text-[11px] opacity-60">غير منطبق</span>}
              {seg.active && <span className="mr-auto text-[11px] font-bold">منطبق ✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
