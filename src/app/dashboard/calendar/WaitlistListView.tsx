"use client"

import React from "react"
import { Users, Phone, Edit2, Trash2, PlusCircle } from "lucide-react"
import { format } from "date-fns"
import { arSA } from "date-fns/locale/ar-SA"
import { Button } from "@/components/ui/Button"
import type { WaitlistEntry } from "@/hooks/use-waitlist"

interface WaitlistListViewProps {
  entries: WaitlistEntry[]
  onEdit: (entry: WaitlistEntry) => void
  onRequestDelete: (id: string) => void
  onAdd: () => void
  onAddNew?: () => void
}

function WaitlistEntryCard({
  entry,
  onEdit,
  onRequestDelete,
}: {
  entry: WaitlistEntry
  onEdit: (entry: WaitlistEntry) => void
  onRequestDelete: (id: string) => void
}) {
  return (
    <div className="group p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all flex justify-between items-center">
      <div className="flex gap-4 items-start">
        <div className="size-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold shrink-0">
          {entry.patientName.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm md:text-base">
            {entry.patientName}
          </h4>
          <div className="flex flex-col md:flex-row md:items-center gap-x-4 gap-y-1 mt-1 text-[11px] md:text-sm">
            <p className="text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
              <Phone className="w-3 md:w-3.5 h-3 md:h-3.5" />
              <span dir="ltr">{entry.patientPhone}</span>
            </p>
          </div>
          {entry.notes && (
            <div className="mt-2 text-[10px] md:text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
              {entry.notes}
            </div>
          )}
          <p className="text-[9px] md:text-[10px] text-slate-400 mt-2 italic">
            تمت الإضافة:{" "}
            {format(new Date(entry.addedAt), "hh:mm a", { locale: arSA })}
          </p>
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onEdit(entry)}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onRequestDelete(entry.id)}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function WaitlistListView({
  entries,
  onEdit,
  onRequestDelete,
  onAdd,
  onAddNew,
}: WaitlistListViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-slate-500">
          يوجد{" "}
          <span className="font-bold text-slate-900">{entries.length}</span>{" "}
          مرضى في الانتظار
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={onAdd}
          >
            <PlusCircle className="w-4 h-4" />
            إضافة مريض
          </Button>
          {onAddNew && (
            <Button
              size="sm"
              variant="outline"
              className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              onClick={onAddNew}
            >
              <PlusCircle className="w-4 h-4" />
              مريض جديد
            </Button>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Users className="w-12 h-12 mb-3 opacity-20" />
          <p>قائمة الانتظار فارغة حالياً</p>
        </div>
      ) : (
        <div className="grid gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pe-1">
          {entries.map((entry) => (
            <WaitlistEntryCard
              key={entry.id}
              entry={entry}
              onEdit={onEdit}
              onRequestDelete={onRequestDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
