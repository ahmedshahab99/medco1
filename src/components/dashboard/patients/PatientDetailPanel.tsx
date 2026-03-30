"use client";

import React, { useState } from "react";
import { Patient } from "../../../lib/types/dashboard";
import {
  X, Phone, Mail, CalendarDays, CalendarCheck, MessageSquare,
  Edit2, ChevronLeft, Stethoscope,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { OverviewTab } from "./tabs/OverviewTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { NotesTab } from "./tabs/NotesTab";
import { FilesTab } from "./tabs/FilesTab";
import { CommunicationsTab } from "./tabs/CommunicationsTab";
import { TagsTab } from "./tabs/TagsTab";

interface PatientDetailPanelProps {
  patient: Patient;
  onClose: () => void;
  onBookAppointment: (patient: Patient) => void;
  /** If true, renders as a full page (mobile). If false, renders as side panel. */
  fullPage?: boolean;
}

type TabKey = "overview" | "history" | "notes" | "files" | "comms" | "tags";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "نظرة عامة" },
  { key: "history",  label: "التاريخ الطبي" },
  { key: "notes",    label: "الملاحظات" },
  { key: "files",    label: "الملفات" },
  { key: "comms",    label: "التواصل" },
  { key: "tags",     label: "التصنيفات" },
];

const TAG_COLORS: Record<string, string> = {
  VIP:           "bg-amber-100 text-amber-700",
  مزمن:         "bg-purple-100 text-purple-700",
  جديد:         "bg-emerald-100 text-emerald-700",
  متابعة:       "bg-blue-100 text-blue-700",
  "خطر مرتفع": "bg-red-100 text-red-700",
  حساسية:       "bg-orange-100 text-orange-700",
};

const AVATAR_COLORS = [
  "from-blue-400 to-blue-600",
  "from-violet-400 to-violet-600",
  "from-emerald-400 to-emerald-600",
  "from-rose-400 to-rose-600",
  "from-amber-400 to-amber-600",
  "from-cyan-400 to-cyan-600",
];

function getAvatarGradient(id: string) {
  const idx = id.charCodeAt(id.length - 1) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
}

function calcAge(dob?: string) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export function PatientDetailPanel({
  patient,
  onClose,
  onBookAppointment,
  fullPage = false,
}: PatientDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const age = calcAge(patient.dateOfBirth);

  return (
    <div
      className={`flex flex-col bg-white h-full ${
        fullPage ? "w-full" : "w-full border-r border-slate-100 shadow-xl"
      }`}
    >
      {/* ── HEADER ── */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 shrink-0">
        {/* Top row: close + back */}
        <div className="flex items-center justify-between mb-4">
          {fullPage ? (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              العودة للقائمة
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient info */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarGradient(patient.id)} flex items-center justify-center font-bold text-white text-xl shrink-0 shadow-lg`}
          >
            {getInitials(patient.name)}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-white text-lg leading-tight truncate">{patient.name}</h2>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              {age && (
                <span className="text-slate-400 text-sm">{age} سنة</span>
              )}
              {patient.gender && (
                <span className="text-slate-400 text-sm">
                  {patient.gender === "male" ? "ذكر" : "أنثى"}
                </span>
              )}
              <span className="text-slate-500 text-[11px]">#{patient.id}</span>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-0.5 mt-2">
              <a href={`tel:${patient.phone}`} className="text-slate-300 text-xs flex items-center gap-1.5 hover:text-white transition-colors" dir="ltr">
                <Phone className="w-3 h-3 shrink-0" />
                {patient.phone}
              </a>
              {patient.email && (
                <a href={`mailto:${patient.email}`} className="text-slate-300 text-xs flex items-center gap-1.5 hover:text-white transition-colors">
                  <Mail className="w-3 h-3 shrink-0" />
                  {patient.email}
                </a>
              )}
              {patient.doctor && (
                <span className="text-slate-400 text-xs flex items-center gap-1.5">
                  <Stethoscope className="w-3 h-3 shrink-0" />
                  {patient.doctor}
                </span>
              )}
            </div>

            {/* Tags */}
            {patient.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {patient.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[tag] ?? "bg-slate-700 text-slate-300"}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700 gap-1.5 text-xs"
            onClick={() => onBookAppointment(patient)}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            حجز موعد
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="flex-1 text-white hover:bg-white/10 gap-1.5 text-xs border border-white/20"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            رسالة
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10 border border-white/20"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="border-b border-slate-100 shrink-0">
        <div className="flex overflow-x-auto custom-scrollbar-x">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.key
                  ? "text-blue-600 border-blue-600"
                  : "text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-200"
              }`}
            >
              {tab.label}
              {tab.key === "notes" && patient.notes.length > 0 && (
                <span className="mr-1.5 text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                  {patient.notes.length}
                </span>
              )}
              {tab.key === "files" && patient.files.length > 0 && (
                <span className="mr-1.5 text-[10px] font-bold bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full">
                  {patient.files.length}
                </span>
              )}
              {tab.key === "comms" && patient.communications.length > 0 && (
                <span className="mr-1.5 text-[10px] font-bold bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full">
                  {patient.communications.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
        {activeTab === "overview" && <OverviewTab patient={patient} />}
        {activeTab === "history"  && <HistoryTab patient={patient} />}
        {activeTab === "notes"    && <NotesTab patient={patient} />}
        {activeTab === "files"    && <FilesTab patient={patient} />}
        {activeTab === "comms"    && <CommunicationsTab patient={patient} />}
        {activeTab === "tags"     && <TagsTab patient={patient} />}
      </div>
    </div>
  );
}
