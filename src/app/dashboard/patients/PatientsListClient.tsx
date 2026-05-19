"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Search, SlidersHorizontal, Plus, UsersRound, ChevronRight, ChevronLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PatientTable } from "@/components/dashboard/patients/PatientTable";
import { PatientFilters, FilterState } from "@/components/dashboard/patients/PatientFilters";
import { NewPatientModal } from "@/components/dashboard/patients/NewPatientModal";
import { Patient } from "@/hooks/use-patients";

const PAGE_SIZE = 10;

const DEFAULT_FILTERS: FilterState = {
  tags: [],
  status: "all",
  doctor: "",
  lastVisit: "all",
  hasUpcoming: "all",
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function matchesLastVisit(patient: Patient, filter: FilterState["lastVisit"]) {
  if (filter === "all") return true;
  if (filter === "none") return !patient.nextAppointment;
  if (!patient.nextAppointment) return false;
  const visitDate = new Date(patient.nextAppointment).getTime();
  const now = Date.now();
  if (filter === "7days")  return now - visitDate <= 7  * 24 * 60 * 60 * 1000;
  if (filter === "30days") return now - visitDate <= 30 * 24 * 60 * 60 * 1000;
  return true;
}

interface PatientsListClientProps {
  initialPatients: Patient[];
}

export default function PatientsListClient({ initialPatients }: PatientsListClientProps) {
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounce(searchRaw, 250);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);

  const router = useRouter();
  const [page, setPage] = useState(1);

  // Filtering + search logic
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return initialPatients.filter((p) => {
      // Search
      if (q) {
        const nameMatch  = p.name.toLowerCase().includes(q);
        const phoneMatch = p.phone?.includes(q) ?? false;
        const idMatch    = p.id.toLowerCase().includes(q);
        const emailMatch = (p.email ?? "").toLowerCase().includes(q);
        if (!nameMatch && !phoneMatch && !idMatch && !emailMatch) return false;
      }
      // Filters
      if (filters.status !== "all" && p.status !== filters.status) return false;
      if (filters.doctor) return false;
      if (filters.tags?.length && !filters.tags.every((t) => p.tags?.includes(t) ?? false)) return false;
      if (!matchesLastVisit(p, filters.lastVisit)) return false;
      if (filters.hasUpcoming === "yes" && !p.nextAppointment) return false;
      if (filters.hasUpcoming === "no"  &&  p.nextAppointment) return false;
      return true;
    });
  }, [search, filters, initialPatients]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  // Reset page when filters/search change
  useEffect(() => { setPage(1); }, [search, filters]);

  const activeFilterCount =
    (filters.tags?.length ?? 0) +
    (filters.status !== "all" ? 1 : 0) +
    (filters.doctor ? 1 : 0) +
    (filters.lastVisit !== "all" ? 1 : 0) +
    (filters.hasUpcoming !== "all" ? 1 : 0);

  const handleSelectPatient = useCallback((p: Patient) => {
    router.push(`/dashboard/patients/${p.id}`);
  }, [router]);

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
            <UsersRound className="w-6 h-6 text-blue-600" />
            المرضى
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {initialPatients.length} مريض مسجّل · {initialPatients.filter((p) => p.status === "active").length} نشط
          </p>
        </div>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                className="pr-10 w-full"
                placeholder="ابحث باسم المريض، رقم الهاتف، المعرّف..."
                value={searchRaw}
                onChange={(e) => setSearchRaw(e.target.value)}
              />
              {searchRaw && (
                <button onClick={() => setSearchRaw("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" className="gap-2 relative" onClick={() => setIsFiltersOpen(true)}>
                <SlidersHorizontal className="w-4 h-4" />
                فلتر
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <Button size="sm" className="gap-2" onClick={() => setIsNewPatientOpen(true)}>
                <Plus className="w-4 h-4" />
                مريض جديد
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <PatientTable patients={paginated} onSelectPatient={handleSelectPatient} />
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between shrink-0">
              <p className="text-xs text-slate-500">صفحة {page} من {totalPages}</p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 p-0">
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 p-0">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <PatientFilters isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} filters={filters} onChange={setFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />
      <NewPatientModal isOpen={isNewPatientOpen} onClose={() => setIsNewPatientOpen(false)} />
    </div>
  );
}
