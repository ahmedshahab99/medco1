"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, CalendarOff, Settings2, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { WeeklySchedule } from "@/components/features/availability/WeeklySchedule";
import { ExceptionsTab } from "@/components/features/availability/ExceptionsTab";
import { AdvancedSettingsTab } from "@/components/features/availability/AdvancedSettingsTab";
import { CalendarPreview } from "@/components/features/availability/CalendarPreview";
import { QuickSummary } from "@/components/features/availability/QuickSummary";
import { ExceptionFormModal } from "@/components/features/availability/ExceptionFormModal";
import { getClinicAvailability, saveClinicAvailability } from "./actions";
import { uid } from "@/lib/date-utils";
import type { Exception, ExceptionType, WeekSchedule, AdvancedSettings } from "@/components/features/availability/types";

const DEFAULT_SCHEDULE: WeekSchedule = {
  saturday:  { enabled: true,  segments: [{ id: "s1", start: "09:00", end: "17:00" }] },
  sunday:    { enabled: true,  segments: [{ id: "s2", start: "09:00", end: "17:00" }] },
  monday:    { enabled: true,  segments: [{ id: "s3", start: "09:00", end: "17:00" }] },
  tuesday:   { enabled: true,  segments: [{ id: "s4", start: "09:00", end: "17:00" }] },
  wednesday: { enabled: true,  segments: [{ id: "s5", start: "09:00", end: "17:00" }] },
  thursday:  { enabled: true,  segments: [{ id: "s6", start: "09:00", end: "13:00" }] },
  friday:    { enabled: false, segments: [{ id: "s7", start: "09:00", end: "17:00" }] },
};

const DEFAULT_EXCEPTIONS: Exception[] = [];
const DEFAULT_ADVANCED: AdvancedSettings = {
  bufferBefore:  10,
  bufferAfter:   10,
  maxPerDay:     20,
  bookingWindow: 30,
  minNotice:     2,
};

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE);
  const [exceptions, setExceptions] = useState<Exception[]>(DEFAULT_EXCEPTIONS);
  const [advanced, setAdvanced] = useState<AdvancedSettings>(DEFAULT_ADVANCED);
  const [activeTab, setActiveTab] = useState("schedule");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exModal, setExModal] = useState(false);
  const [editingEx, setEditingEx] = useState<Exception | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getClinicAvailability();
        if (data) {
          setSchedule(data.schedule as WeekSchedule);
          setExceptions(data.exceptions as Exception[]);
          setAdvanced(data.settings as AdvancedSettings);
        }
      } catch {
        setError("تعذر تحميل الإعدادات. يرجى المحاولة مرة أخرى.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleDay = (key: string) => {
    setSchedule((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  const updateSegment = (dayKey: string, segId: string, field: "start" | "end", value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        segments: prev[dayKey].segments.map((s) =>
          s.id === segId ? { ...s, [field]: value } : s
        ),
      },
    }));
  };

  const addSegment = (dayKey: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        segments: [...prev[dayKey].segments, { id: uid(), start: "09:00", end: "17:00" }],
      },
    }));
  };

  const removeSegment = (dayKey: string, segId: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        segments: prev[dayKey].segments.filter((s) => s.id !== segId),
      },
    }));
  };

  const openAddEx = (type?: ExceptionType) => {
    setEditingEx(type ? ({ id: "", date: "", type } as Exception) : null);
    setExModal(true);
  };

  const openEditEx = (ex: Exception) => {
    setEditingEx(ex);
    setExModal(true);
  };

  const closeExModal = () => {
    setExModal(false);
    setEditingEx(null);
  };

  const saveException = (data: Exception) => {
    setExceptions((prev) => {
      const idx = prev.findIndex((e) => e.id === data.id);
      return idx >= 0
        ? prev.map((e) => (e.id === data.id ? data : e))
        : [...prev, data];
    });
    closeExModal();
  };

  const deleteException = (id: string) => {
    setExceptions((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    const result = await saveClinicAvailability({ schedule, exceptions, settings: advanced });
    setSaving(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }, [schedule, exceptions, advanced]);

  if (loading) {
    return (
      <div dir="rtl" className="space-y-6 max-w-7xl">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">أوقات العمل والتوفر</h1>
          <p className="text-slate-500 mt-1">حدد ساعات عمل العيادة الأسبوعية وأضف استثناءات حسب الحاجة.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 shrink-0">
          {saving ? (
            <><Save className="w-5 h-5 animate-spin" /> جاري الحفظ...</>
          ) : saved ? (
            <><CheckCircle2 className="w-5 h-5" /> تم الحفظ!</>
          ) : (
            <><Save className="w-5 h-5" /> حفظ الإعدادات</>
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          <Tabs dir="rtl" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="schedule" className="flex-1 gap-2">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">ساعات العمل الأسبوعية</span>
              </TabsTrigger>
              <TabsTrigger value="exceptions" className="flex-1 gap-2">
                <CalendarOff className="w-4 h-4" />
                <span className="hidden sm:inline">الاستثناءات</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex-1 gap-2">
                <Settings2 className="w-4 h-4" />
                <span className="hidden sm:inline">إعدادات متقدمة</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="mt-4">
              <WeeklySchedule
                schedule={schedule}
                onToggleDay={toggleDay}
                onUpdateSegment={updateSegment}
                onAddSegment={addSegment}
                onRemoveSegment={removeSegment}
              />
            </TabsContent>

            <TabsContent value="exceptions" className="mt-4">
              <ExceptionsTab
                exceptions={exceptions}
                onAdd={openAddEx}
                onEdit={openEditEx}
                onDelete={deleteException}
              />
            </TabsContent>

            <TabsContent value="advanced" className="mt-4">
              <AdvancedSettingsTab
                advanced={advanced}
                onChange={setAdvanced}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="xl:w-80 shrink-0 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
              معاينة التقويم
            </h2>
            <CalendarPreview schedule={schedule} exceptions={exceptions} />
          </div>
          <QuickSummary schedule={schedule} />
        </div>
      </div>

      <ExceptionFormModal
        isOpen={exModal}
        editingEx={editingEx}
        onSave={saveException}
        onClose={closeExModal}
      />
    </div>
  );
}
