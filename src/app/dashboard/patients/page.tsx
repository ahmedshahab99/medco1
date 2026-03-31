"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Search, SlidersHorizontal, Plus, UsersRound, ChevronRight, ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PatientTable } from "@/components/dashboard/patients/PatientTable";
import { PatientFilters, FilterState } from "@/components/dashboard/patients/PatientFilters";
import { PatientDetailPanel } from "@/components/dashboard/patients/PatientDetailPanel";
import { NewPatientModal } from "@/components/dashboard/patients/NewPatientModal";
import { MOCK_PATIENTS } from "@/lib/mock/patients";
import { Patient } from "@/lib/types/dashboard";

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
  if (filter === "none") return !patient.lastVisit;
  if (!patient.lastVisit) return false;
  const visitDate = new Date(patient.lastVisit).getTime();
  const now = Date.now();
  if (filter === "7days")  return now - visitDate <= 7  * 24 * 60 * 60 * 1000;
  if (filter === "30days") return now - visitDate <= 30 * 24 * 60 * 60 * 1000;
  return true;
}

export default function PatientsPage() {
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounce(searchRaw, 250);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [page, setPage] = useState(1);

  // Responsive: detect if side panel should be full-page
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Filtering + search logic
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return MOCK_PATIENTS.filter((p) => {
      // Search
      if (q) {
        const nameMatch  = p.name.toLowerCase().includes(q);
        const phoneMatch = p.phone.includes(q);
        const idMatch    = p.id.toLowerCase().includes(q);
        const emailMatch = (p.email ?? "").toLowerCase().includes(q);
        if (!nameMatch && !phoneMatch && !idMatch && !emailMatch) return false;
      }
      // Filters
      if (filters.status !== "all" && p.status !== filters.status) return false;
      if (filters.doctor && p.doctor !== filters.doctor) return false;
      if (filters.tags.length > 0 && !filters.tags.every((t) => p.tags.includes(t))) return false;
      if (!matchesLastVisit(p, filters.lastVisit)) return false;
      if (filters.hasUpcoming === "yes" && !p.nextAppointment) return false;
      if (filters.hasUpcoming === "no"  &&  p.nextAppointment) return false;
      return true;
    });
  }, [search, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  // Reset page when filters/search change
  useEffect(() => { setPage(1); }, [search, filters]);

  const activeFilterCount =
    filters.tags.length +
    (filters.status !== "all" ? 1 : 0) +
    (filters.doctor ? 1 : 0) +
    (filters.lastVisit !== "all" ? 1 : 0) +
    (filters.hasUpcoming !== "all" ? 1 : 0);

  const handleSelectPatient = useCallback((p: Patient) => {
    setSelectedPatient((prev) => (prev?.id === p.id ? null : p));
  }, []);

  const handleBookAppointment = useCallback((p: Patient) => {
    // TODO: open booking modal pre-filled with patient
    console.log("Book appointment for", p.name);
  }, []);

  const showPanel = !!selectedPatient;
  const panelFullPage = isMobile && showPanel;

  return (
    <div className="flex flex-col h-full gap-6">
      {/* ── PAGE TITLE ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
            <UsersRound className="w-6 h-6 text-blue-600" />
            المرضى
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {MOCK_PATIENTS.length} مريض مسجّل · {MOCK_PATIENTS.filter((p) => p.status === "active").length} نشط
          </p>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex gap-5 flex-1 min-h-0">

        {/* ═══ LEFT: List panel ═══ */}
        <div
          className={`flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 ${
            showPanel && !isMobile ? "flex-1" : "w-full"
          } ${panelFullPage ? "hidden" : "flex"}`}
        >
          {/* Top Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                className="pr-10 w-full"
                placeholder="ابحث باسم المريض، رقم الهاتف، المعرّف..."
                value={searchRaw}
                onChange={(e) => setSearchRaw(e.target.value)}
              />
              {searchRaw && (
                <button
                  onClick={() => setSearchRaw("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 relative"
                onClick={() => setIsFiltersOpen(true)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                فلتر
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 w-4.5 h-4.5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center w-5 h-5">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setIsNewPatientOpen(true)}
              >
                <Plus className="w-4 h-4" />
                مريض جديد
              </Button>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="px-4 py-2.5 border-b border-slate-50 flex items-center gap-2 flex-wrap bg-slate-50/50">
              <span className="text-xs text-slate-400 font-medium">فلاتر نشطة:</span>
              {filters.tags.map((tag) => (
                <span key={tag} className="text-xs font-bold bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                  {tag}
                  <button onClick={() => setFilters((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.status !== "all" && (
                <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                  {filters.status === "active" ? "نشط" : "غير نشط"}
                  <button onClick={() => setFilters((f) => ({ ...f, status: "all" }))}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.doctor && (
                <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                  {filters.doctor}
                  <button onClick={() => setFilters((f) => ({ ...f, doctor: "" }))}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors mr-auto"
              >
                مسح الكل
              </button>
            </div>
          )}

          {/* Results count */}
          <div className="px-4 py-2 border-b border-slate-50 flex items-center justify-between text-xs text-slate-400">
            <span>
              {filtered.length === MOCK_PATIENTS.length
                ? `عرض ${filtered.length} مريض`
                : `${filtered.length} نتيجة من أصل ${MOCK_PATIENTS.length}`}
            </span>
            {showPanel && (
              <span className="text-blue-500 font-semibold">ملف مفتوح: {selectedPatient?.name}</span>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            <PatientTable
              patients={paginated}
              onSelectPatient={handleSelectPatient}
              selectedPatientId={selectedPatient?.id}
              onBookAppointment={handleBookAppointment}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between shrink-0">
              <p className="text-xs text-slate-500">
                صفحة {page} من {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <Button
                      key={pg}
                      variant={pg === page ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setPage(pg)}
                      className="w-8 h-8 p-0 text-xs"
                    >
                      {pg}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ═══ RIGHT: Detail panel (desktop side panel) ═══ */}
        {showPanel && !isMobile && (
          <div className="w-[440px] shrink-0 rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-14rem)] sticky top-0">
            <PatientDetailPanel
              patient={selectedPatient!}
              onClose={() => setSelectedPatient(null)}
              onBookAppointment={handleBookAppointment}
              fullPage={false}
            />
          </div>
        )}

        {/* ═══ Mobile: Full page overlay ═══ */}
        {panelFullPage && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col">
            <PatientDetailPanel
              patient={selectedPatient!}
              onClose={() => setSelectedPatient(null)}
              onBookAppointment={handleBookAppointment}
              fullPage={true}
            />
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <PatientFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      <NewPatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
      />
    </div>
  );
}
