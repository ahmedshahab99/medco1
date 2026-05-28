"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Settings2, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { WeeklySchedule } from "@/components/features/availability/WeeklySchedule";
import { AdvancedSettingsTab } from "@/components/features/availability/AdvancedSettingsTab";
import { CalendarPreview } from "@/components/features/availability/CalendarPreview";
import { QuickSummary } from "@/components/features/availability/QuickSummary";
import { getClinicAvailability, saveClinicAvailability } from "./actions";
import { uid } from "@/lib/date-utils";
import type { WeekSchedule, AdvancedSettings } from "@/components/features/availability/types";
import { DEFAULT_SCHEDULE, DEFAULT_ADVANCED } from "@/components/features/availability/constants";

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE);
  const [advanced, setAdvanced] = useState<AdvancedSettings>(DEFAULT_ADVANCED);
  const [activeTab, setActiveTab] = useState("schedule");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getClinicAvailability();
        if (data) {
          setSchedule(data.schedule as WeekSchedule);
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

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    const result = await saveClinicAvailability({ schedule, settings: advanced });
    setSaving(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }, [schedule, advanced]);

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
          <p className="text-slate-500 mt-1">حدد ساعات عمل العيادة الأسبوعية وإعدادات الحجز عبر الإنترنت.</p>
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
              <TabsTrigger value="advanced" className="flex-1 gap-2">
                <Settings2 className="w-4 h-4" />
                <span className="hidden sm:inline">الحجز عبر الإنترنت</span>
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
            <CalendarPreview schedule={schedule} />
          </div>
          <QuickSummary schedule={schedule} />
        </div>
      </div>

    </div>
  );
}
