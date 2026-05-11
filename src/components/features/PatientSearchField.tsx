"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { usePatients } from "@/hooks/use-patients";

interface PatientSearchFieldProps {
  value?: string;
  onChange: (patientId: string) => void;
  initialPatientId?: string;
  error?: string;
}

export default function PatientSearchField({
  value,
  onChange,
  initialPatientId,
  error,
}: PatientSearchFieldProps) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: patientsData, isFetching } = usePatients(debounced || undefined);
  const patients = patientsData ?? [];

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setDebounced("");
      return;
    }
    const timer = setTimeout(() => setDebounced(trimmed), 400);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (value && initialPatientId && initialPatientId === value && !selectedName) {
      const p = patients.find((x) => x.id === value);
      if (p) setSelectedName(`${p.name} - ${p.phone ?? ""}`);
    }
  }, [value, initialPatientId, patients, selectedName]);

  const handleSelect = useCallback(
    (id: string, name: string) => {
      onChange(id);
      setSelectedName(name);
      setQuery("");
      setIsOpen(false);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange("");
    setSelectedName("");
    setQuery("");
    inputRef.current?.focus();
  }, [onChange]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (selectedName) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-700">{selectedName}</span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        
      </div>
    );
  }

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="ابحث بالاسم أو رقم الهاتف..."
          className="w-full rounded-xl border border-slate-200 bg-white pe-10 ps-4 py-2.5 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setDebounced("");
            }}
            className="absolute start-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded-full"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>

      {isOpen && debounced && isFetching && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 flex items-center justify-center gap-2 text-sm text-slate-400">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
          جاري البحث...
        </div>
      )}

      {isOpen && debounced && !isFetching && patients.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {patients.map((p) => (
            <button
              key={p.id}
              type="button"
              className="w-full text-right px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors flex items-center justify-between border-b border-slate-50 last:border-0"
              onClick={() => handleSelect(p.id, `${p.name} - ${p.phone ?? ""}`)}
            >
              <span className="font-medium text-slate-800">{p.name}</span>
              {p.phone && <span className="text-slate-400 text-xs" dir="ltr">{p.phone}</span>}
            </button>
          ))}
        </div>
      )}

      {isOpen && debounced && !isFetching && patients.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center text-sm text-slate-400">
          لا توجد نتائج
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
