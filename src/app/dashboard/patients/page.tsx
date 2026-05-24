"use client";

import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Plus, UsersRound, ChevronRight, ChevronLeft, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PatientTable } from "@/components/dashboard/patients/PatientTable";
import { PatientFilters, FilterState } from "@/components/dashboard/patients/PatientFilters";
import { TodaySchedule } from "@/components/dashboard/patients/TodaySchedule";
import { NewPatientModal } from "@/components/dashboard/patients/NewPatientModal";
import { usePatients, PaginatedPatients } from "@/hooks/use-patients";
import { useAppointments } from "@/hooks/use-appointments";

const PAGE_SIZE = 10;

const DEFAULT_FILTERS: FilterState = {
  status: "all",
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function PatientsPage() {
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounce(searchRaw, 250);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);

const router = useRouter();
const [page, setPage] = useState(1);

const { data: result, isLoading, error, refetch } = usePatients({ search, page, pageSize: PAGE_SIZE, status: filters.status === "all" ? undefined : filters.status });

const today = new Date();
const { data: todayApps, isLoading: appsLoading, error: appsError, refetch: refetchApps } = useAppointments(startOfDay(today), endOfDay(today));

  const patients = (result as PaginatedPatients)?.data ?? [];
  const total = (result as PaginatedPatients)?.total ?? 0;
  const totalPages = (result as PaginatedPatients)?.totalPages ?? 1;

  useEffect(() => { setPage(1); }, [search, filters]);

  const activeFilterCount = filters.status !== "all" ? 1 : 0;

  const handleSelectPatient = (p: { id: string }) => {
    router.push(`/dashboard/patients/${p.id}`);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
            <UsersRound className="w-6 h-6 text-blue-600" />
            المرضى
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isLoading ? "جارٍ التحميل..." : `${total} مريض مسجّل`}
          </p>
        </div>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        <div className="flex flex-col gap-5 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <TodaySchedule appointments={todayApps} isLoading={appsLoading} error={appsError} onRefetch={refetchApps} />

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden shrink-0">
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
                <button
                  onClick={() => setSearchRaw("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

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
                  <span className="absolute -top-1.5 -left-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center w-5 h-5">
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

          {activeFilterCount > 0 && (
            <div className="px-4 py-2.5 border-b border-slate-50 flex items-center gap-2 flex-wrap bg-slate-50/50">
              <span className="text-xs text-slate-400 font-medium">فلاتر نشطة:</span>
              {filters.status !== "all" && (
                <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                  {filters.status === "active" ? "نشط" : "غير نشط"}
                  <button onClick={() => setFilters((f) => ({ ...f, status: "all" }))}><X className="w-3 h-3" /></button>
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

          <div className="px-4 py-2 border-b border-slate-50 flex items-center justify-between text-xs text-slate-400">
            <span>
              {isLoading
                ? "جارٍ التحميل..."
                : `عرض ${patients.length} من أصل ${total} مريض`}
            </span>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            {error && (
              <div className="text-center py-20 text-slate-400">
                <p className="text-lg font-semibold text-red-500 mb-1">حدث خطأ</p>
                <p className="text-sm mb-4">{error.message ?? "حدث خطأ غير متوقع"}</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  إعادة المحاولة
                </Button>
              </div>
            )}
            {!error && isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            )}
            {!error && !isLoading && (
              <PatientTable
                patients={patients}
                onSelectPatient={handleSelectPatient}
              />
            )}
          </div>

          {!isLoading && !error && totalPages > 1 && (
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
                      variant={pg === page ? "default" : "ghost"}
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
      </div>
      </div>

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
