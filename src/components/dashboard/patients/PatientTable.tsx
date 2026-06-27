"use client";

import React from "react";
import { Patient } from "../../../hooks/use-patients";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

interface PatientTableProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (field: string) => void;
}

type SortField = "name" | "createdAt";

function calcAge(dob?: string | null) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function formatDate(iso?: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "؟";
  if (parts.length === 1) return parts[0].slice(0, 1);
  return (parts[0][0] ?? "") + (parts[1][0] ?? "");
}

export function PatientTable({
  patients,
  onSelectPatient,
  sortBy,
  sortOrder,
  onSortChange,
}: PatientTableProps) {
  if (patients.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-lg font-semibold text-slate-600 mb-1">لا توجد نتائج</p>
        <p className="text-sm">جرّب تغيير كلمة البحث أو الفلاتر</p>
      </div>
    );
  }

  const renderSortIcon = (field: SortField) => {
    const isActive = sortBy === field;
    if (!isActive) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
    );
  };

  const renderSortableHead = (field: SortField, label: string) => {
    const isActive = sortBy === field;
    const Icon = renderSortIcon(field);
    if (!onSortChange) {
      return (
        <TableHead className="text-start font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            {label}
            {Icon}
          </span>
        </TableHead>
      );
    }
    return (
      <TableHead className="text-start">
        <button
          type="button"
          onClick={() => onSortChange(field)}
          className="inline-flex items-center gap-1.5 text-start font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          {label}
          {Icon}
          {isActive && (
            <span className="sr-only">
              {sortOrder === "asc" ? "مرتب تصاعدياً" : "مرتب تنازلياً"}
            </span>
          )}
        </button>
      </TableHead>
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50/60 hover:bg-slate-50/60">
          {renderSortableHead("name", "الاسم")}
          <TableHead className="text-start">الهاتف</TableHead>
          <TableHead className="text-start">العمر / الجنس</TableHead>
          <TableHead className="text-start">الحالة</TableHead>
          {renderSortableHead("createdAt", "تاريخ التسجيل")}
          <TableHead className="text-start w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => {
          const age = calcAge(patient.dateOfBirth);
          return (
            <TableRow
              key={patient.id}
              onClick={() => onSelectPatient(patient)}
              className="cursor-pointer"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {getInitials(patient.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">
                      {patient.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      #{patient.id.slice(0, 8)}
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-slate-700" dir="rtl">
                {patient.phone ? (
                  <span className="font-medium">{patient.phone}</span>
                ) : (
                  <span className="text-slate-300">—</span>
                )}
              </TableCell>

              <TableCell className="text-slate-700">
                {age !== null || patient.gender ? (
                  <span className="inline-flex items-center gap-1.5">
                    {age !== null && <span>{age} سنة</span>}
                    {age !== null && patient.gender && (
                      <span className="text-slate-300">·</span>
                    )}
                    {patient.gender && (
                      <span>
                        {patient.gender === "MALE" ? "ذكر" : "أنثى"}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-slate-300">—</span>
                )}
              </TableCell>

              <TableCell>
                {patient.status === "active" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium text-xs">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    نشط
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium text-xs">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    غير نشط
                  </span>
                )}
              </TableCell>

              <TableCell className="text-slate-500 text-xs whitespace-nowrap">
                {formatDate(patient.createdAt) ?? "—"}
              </TableCell>

              <TableCell className="text-slate-300">
                <span aria-hidden className="block text-end">
                  ←
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
