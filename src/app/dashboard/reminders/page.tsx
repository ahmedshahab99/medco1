"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Send,
  Zap,
  Search,
  Filter,
  XCircle,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  BarChart3,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  REMINDER_TEMPLATES,
  REMINDER_TYPE_CONFIG,
  type ReminderType,
} from "@/lib/reminders/templates";
import {
  getTenantReminders,
  toggleReminder,
  updateReminderTiming,
  getMessageLogs,
} from "./actions";
import type { MessageStatus } from "@prisma/client";
import { PlanGate } from "@/components/ui/PlanGate";

// ─── Serialized types ───────────────────────────────────────────────────────

interface ReminderRow {
  id: string;
  tenantId: string;
  type: ReminderType;
  name: string;
  isActive: boolean;
  triggerBeforeMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

interface MessageLogRow {
  id: string;
  tenantId: string;
  reminderId: string | null;
  type: ReminderType;
  appointmentId: string | null;
  patientId: string | null;
  toPhone: string;
  messageContent: string;
  status: MessageStatus;
  externalId: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  patient: { id: string; firstName: string; lastName: string } | null;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, {
  label: string;
  variant: "success" | "warning" | "danger" | "default";
  icon: React.ReactNode;
}> = {
  SENT: {
    label: "تم الإرسال",
    variant: "default",
    icon: <Send className="size-3" />,
  },
  FAILED: {
    label: "فشل الإرسال",
    variant: "danger",
    icon: <XCircle className="size-3" />,
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatArabicDateTime(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${date} · ${time}`;
}

function formatArabicDate(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function minutesToHours(minutes: number | null) {
  return minutes ? Math.round(minutes / 60) : 24;
}

function parseMessageContent(raw: string, type: ReminderType): string {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.template && parsed?.variables) {
      const template = REMINDER_TEMPLATES[type] ?? "";
      return template.replace(/\{(\w+)\}/g, (_, key: string) => {
        if (parsed.variables[key] !== undefined) return parsed.variables[key];
        return `{${key}}`;
      });
    }
    return raw;
  } catch {
    return raw;
  }
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        enabled ? "bg-blue-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "-translate-x-6" : "-translate-x-1"
        }`}
      />
    </button>
  );
}

function TimingEditor({
  minutes,
  onSave,
  saving,
  error,
}: {
  minutes: number | null;
  onSave: (min: number) => void;
  saving: boolean;
  error?: string | null;
}) {
  const [hours, setHours] = useState(minutesToHours(minutes));
  const [dirty, setDirty] = useState(false);

  const isValid = hours >= 4 && hours <= 24;
  const displayError =
    !isValid && dirty ? "يجب أن يكون بين 4 و 24 ساعة" : error;

  const handleSave = () => {
    if (!isValid) return;
    onSave(hours * 60);
    setDirty(false);
  };

  return (
    <div className="pt-3 border-t border-slate-100">
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-slate-400 shrink-0" />
        <span className="text-sm text-slate-600">قبل الموعد بـ</span>
        <input
          type="number"
          min={4}
          max={24}
          value={hours}
          onChange={(e) => {
            setHours(Math.max(1, parseInt(e.target.value) || 1));
            setDirty(true);
          }}
          className={`w-16 rounded-lg border bg-white px-2 py-1.5 text-sm text-center outline-none transition-all ${
            displayError
              ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          }`}
        />
        <span className="text-sm text-slate-600">ساعة</span>
        {dirty && (
          <button
            onClick={handleSave}
            disabled={saving || !isValid}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "..." : "حفظ"}
          </button>
        )}
      </div>
      {displayError && (
        <p className="text-xs text-red-500 mt-1.5 me-8">{displayError}</p>
      )}
    </div>
  );
}

// ─── ReminderCard ───────────────────────────────────────────────────────────

function ReminderCard({
  reminder,
  onToggle,
  onSaveTiming,
  saving,
  error,
}: {
  reminder: ReminderRow;
  onToggle: () => void;
  onSaveTiming: (min: number) => void;
  saving: boolean;
  error?: string | null;
}) {
  const config = REMINDER_TYPE_CONFIG[reminder.type];
  const Icon = config.icon;
  const template = REMINDER_TEMPLATES[reminder.type];

  return (
    <Card
      className={`p-0 overflow-hidden transition-all duration-200 hover:shadow-md ${
        !reminder.isActive ? "opacity-70" : ""
      }`}
    >
      <div
        className={`h-1 ${
          reminder.isActive
            ? reminder.type === "CONFIRM"
              ? "bg-emerald-500"
              : reminder.type === "REMINDER"
                ? "bg-blue-500"
                : reminder.type === "RESCHEDULE"
                  ? "bg-amber-500"
                  : "bg-red-500"
            : "bg-slate-200"
        }`}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                reminder.isActive
                  ? `${config.bgColor} ${config.color} border`
                  : "bg-slate-100 text-slate-400 border border-slate-200"
              }`}
            >
              <Icon className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 text-sm truncate">
                {config.label}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {config.description}
              </p>
            </div>
          </div>
          <Toggle enabled={reminder.isActive} onChange={onToggle} />
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
          <p className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
            <MessageSquare className="size-3" />
            قالب الرسالة
          </p>
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
            {template}
          </p>
        </div>

        {reminder.type === "REMINDER" && (
          <TimingEditor
            minutes={reminder.triggerBeforeMinutes}
            onSave={onSaveTiming}
            saving={saving}
            error={error}
          />
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span
            className={`text-xs font-semibold flex items-center gap-1.5 ${
              reminder.isActive ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            {reminder.isActive ? (
              <>
                <div className="size-1.5 rounded-full bg-emerald-500" />
                نشط
              </>
            ) : (
              <>
                <div className="size-1.5 rounded-full bg-slate-300" />
                متوقف
              </>
            )}
          </span>
          {reminder.type === "REMINDER" && (
            <span className="text-xs text-slate-400">
              أُنشئ في {formatArabicDate(reminder.createdAt)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function RemindersPage() {
  const [reminders, setReminders] = useState<ReminderRow[]>([]);
  const [logs, setLogs] = useState<MessageLogRow[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"reminders" | "logs">("reminders");

  const [logSearch, setLogSearch] = useState("");
  const [logStatusFilter, setLogStatusFilter] = useState<MessageStatus | "all">(
    "all"
  );
  const [logTypeFilter, setLogTypeFilter] = useState<ReminderType | "all">(
    "all"
  );
  const [previewLog, setPreviewLog] = useState<MessageLogRow | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [logStats, setLogStats] = useState({
    sentToday: 0,
    deliveredCount: 0,
    totalMessages: 0,
    typeDistribution: [] as { type: ReminderType; count: number; pct: number }[],
  });
  const queryClient = useQueryClient();

  const PAGE_SIZE = 15;

  // ── Load data ────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [remindersData, logsData] = await Promise.all([
        getTenantReminders(),
        getMessageLogs({ page: 1, pageSize: PAGE_SIZE }),
      ]);
      if (Array.isArray(remindersData)) setReminders(remindersData);
      if (logsData) {
        setLogs(logsData.logs);
        setTotalLogs(logsData.total);
        setLogStats(logsData.stats);
      }
      setLoading(false);
    })();
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleToggle = useCallback(async (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
    await toggleReminder(id);
    queryClient.invalidateQueries({ queryKey: ["reminder-settings"] });
  }, [queryClient]);

  const handleSaveTiming = useCallback(
    async (id: string, minutes: number) => {
      setSaving(true);
      setErrors((e) => ({ ...e, [id]: "" }));
      const prevMinutes = reminders.find((r) => r.id === id)?.triggerBeforeMinutes ?? null;
      setReminders((rows) =>
        rows.map((r) =>
          r.id === id ? { ...r, triggerBeforeMinutes: minutes } : r
        )
      );
      const result = await updateReminderTiming(id, minutes);
      if (result && "error" in result) {
        setErrors((e) => ({ ...e, [id]: result.error }) as Record<string, string>);
        setReminders((rows) =>
          rows.map((r) =>
            r.id === id ? { ...r, triggerBeforeMinutes: prevMinutes } : r
          )
        );
      } else {
        setErrors((e) => ({ ...e, [id]: "" }) as Record<string, string>);
      }
      queryClient.invalidateQueries({ queryKey: ["reminder-settings"] });
      setSaving(false);
    },
    [queryClient, reminders]
  );

  const fetchLogs = useCallback(
    async (params: {
      page: number;
      status: MessageStatus | "all";
      type: ReminderType | "all";
      search: string;
    }) => {
      const result = await getMessageLogs({
        page: params.page,
        pageSize: PAGE_SIZE,
        status: params.status === "all" ? undefined : params.status,
        type: params.type === "all" ? undefined : params.type,
        search: params.search.trim() || undefined,
      });
      if (result) {
        setLogs(result.logs);
        setTotalLogs(result.total);
        setLogStats(result.stats);
      }
    },
    [PAGE_SIZE]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchLogs({ page, status: logStatusFilter, type: logTypeFilter, search: logSearch });
    },
    [fetchLogs, logStatusFilter, logTypeFilter, logSearch]
  );

  const handleStatusFilterChange = useCallback(
    (value: MessageStatus | "all") => {
      setLogStatusFilter(value);
      setCurrentPage(1);
      fetchLogs({ page: 1, status: value, type: logTypeFilter, search: logSearch });
    },
    [fetchLogs, logTypeFilter, logSearch]
  );

  const handleTypeFilterChange = useCallback(
    (value: ReminderType | "all") => {
      setLogTypeFilter(value);
      setCurrentPage(1);
      fetchLogs({ page: 1, status: logStatusFilter, type: value, search: logSearch });
    },
    [fetchLogs, logStatusFilter, logSearch]
  );

  const handleSearchClick = useCallback(() => {
    setCurrentPage(1);
    fetchLogs({ page: 1, status: logStatusFilter, type: logTypeFilter, search: logSearch });
  }, [fetchLogs, logStatusFilter, logTypeFilter, logSearch]);

  // ── Stats ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const activeCount = reminders.filter((r) => r.isActive).length;
    
    return {
      activeReminders: activeCount,
      sentToday: logStats.sentToday,
      totalLogs,
    };
  }, [reminders, logStats, totalLogs]);

  // ── Type distribution ────────────────────────────────────────────────────

  const typeDistribution = useMemo(() => {
    return logStats.typeDistribution;
  }, [logStats.typeDistribution]);

  // ── Tabs ─────────────────────────────────────────────────────────────────

  const tabs = [
    {
      id: "reminders" as const,
      label: "إعدادات التذكير",
      icon: <Zap className="size-4" />,
    },
    {
      id: "logs" as const,
      label: "سجل الإرسال",
      icon: <Send className="size-4" />,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-slate-100 animate-pulse" />
          <div>
            <div className="h-6 w-48 bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-64 bg-slate-100 rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-0 overflow-hidden">
              <div className="h-1 bg-slate-100" />
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-slate-100 animate-pulse" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-11 rounded-full bg-slate-100 animate-pulse" />
                </div>
                <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
    </div>
    );
  }

  return (
    <PlanGate condition={(plan) => (plan.limits.whatsappPerMonth ?? 0) > 0}>
    <div className="space-y-6 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Bell className="size-5" />
            </div>
            التذكيرات
          </h1>
          <p className="text-slate-500 mt-1">
            إدارة إعدادات التذكير للمرضى وتتبع حالة الإرسال عبر واتساب.
          </p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* ── Left panel ── */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === t.id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab: Reminders ── */}
          {activeTab === "reminders" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {reminders.map((r) => (
                <ReminderCard
                  key={r.id}
                  reminder={r}
                  onToggle={() => handleToggle(r.id)}
                  onSaveTiming={(min) => handleSaveTiming(r.id, min)}
                  saving={saving}
                  error={errors[r.id]}
                />
              ))}
            </div>
          )}

          {/* ── Tab: Logs ── */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              {/* Filter bar */}
              <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="بحث باسم المريض أو رقم الهاتف..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white pe-10 ps-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="relative">
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                    <select
                      value={logTypeFilter}
                      onChange={(e) =>
                        handleTypeFilterChange(e.target.value as ReminderType | "all")
                      }
                      className="appearance-none rounded-xl border border-slate-200 bg-white pe-10 ps-9 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="all">جميع الأنواع</option>
                      <option value="CONFIRM">تأكيد الحجز</option>
                      <option value="REMINDER">تذكير</option>
                      <option value="RESCHEDULE">إعادة جدولة</option>
                      <option value="CANCEL">إلغاء</option>
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                    <select
                      value={logStatusFilter}
                      onChange={(e) =>
                        handleStatusFilterChange(
                          e.target.value as MessageStatus | "all"
                        )
                      }
                      className="appearance-none rounded-xl border border-slate-200 bg-white pe-10 ps-9 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer min-w-[160px]"
                    >
                      <option value="all">جميع الحالات</option>
                      <option value="SENT">تم الإرسال</option>
                      <option value="FAILED">فشل</option>
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSearchClick}
                    className="gap-2"
                  >
                    <Search className="size-4" />
                    بحث
                  </Button>
                </div>
              </Card>

              {/* Logs table */}
              <Card className="p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Send className="size-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800">سجل الإرسال</h2>
                    <p className="text-xs text-slate-500">
                      {totalLogs > 0
                        ? `عرض ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, totalLogs)} من ${totalLogs}`
                        : "لا توجد رسائل"}
                    </p>
                  </div>
                </div>

                {logs.length === 0 ? (
                  <div className="flex flex-col items-center py-14 text-center">
                    <div className="size-14 rounded-full bg-slate-50 flex items-center justify-center mb-3 text-slate-300">
                      <Send className="size-7" />
                    </div>
                    <p className="text-slate-500 font-medium">
                      لا توجد رسائل مطابقة
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      حاول تعديل معايير البحث أو الفلتر.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>المريض</TableHead>
                          <TableHead>نوع التذكير</TableHead>
                          <TableHead>تاريخ الإرسال</TableHead>
                          <TableHead>الحالة</TableHead>
                          
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => {
                          const st = STATUS_CONFIG[log.status];
                          const typeConfig = REMINDER_TYPE_CONFIG[log.type];
                          const TypeIcon = typeConfig.icon;
                          const patientName =
                            log.patient?.firstName && log.patient?.lastName
                              ? `${log.patient.firstName} ${log.patient.lastName}`
                              : "—";
                          return (
                            <TableRow key={log.id}>
                              <TableCell>
                                <div>
                                  <p className="font-semibold text-slate-800 text-sm">
                                    {patientName}
                                  </p>
                                  <p
                                    className="text-xs text-slate-400 mt-0.5 font-mono"
                                    dir="ltr"
                                  >
                                    {log.toPhone}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${typeConfig.color}`}
                                >
                                  <TypeIcon className="size-3.5" />
                                  {typeConfig.label}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-xs text-slate-500">
                                  {formatArabicDateTime(log.sentAt)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant={st.variant}>
                                  <span className="flex items-center gap-1">
                                    {st.icon}
                                    {st.label}
                                  </span>
                                </Badge>
                              </TableCell>
                              
                              <TableCell>
                                <button
                                  onClick={() => setPreviewLog(log)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="عرض الرسالة"
                                >
                                  <Eye className="size-4" />
                                </button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>

              {totalLogs > PAGE_SIZE && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    صفحة {currentPage} من {Math.ceil(totalLogs / PAGE_SIZE)}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                    {(() => {
                      const totalPages = Math.ceil(totalLogs / PAGE_SIZE);
                      const pages: (number | "...")[] = [];
                      if (totalPages <= 7) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                      } else {
                        pages.push(1);
                        if (currentPage > 3) pages.push("...");
                        const start = Math.max(2, currentPage - 1);
                        const end = Math.min(totalPages - 1, currentPage + 1);
                        for (let i = start; i <= end; i++) pages.push(i);
                        if (currentPage < totalPages - 2) pages.push("...");
                        pages.push(totalPages);
                      }
                      return pages.map((p, i) =>
                        p === "..." ? (
                          <span
                            key={`ellipsis-${i}`}
                            className="flex items-center justify-center size-8 text-slate-400"
                          >
                            ...
                          </span>
                        ) : (
                          <Button
                            key={p}
                            variant={currentPage === p ? "outline" : "ghost"}
                            size="icon"
                            onClick={() => handlePageChange(p as number)}
                          >
                            {p}
                          </Button>
                        )
                      );
                    })()}
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={currentPage >= Math.ceil(totalLogs / PAGE_SIZE)}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right panel: Stats ── */}
        <div className="xl:w-80 shrink-0 space-y-4">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
            نظرة عامة
          </h2>

          <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
            <Card className="p-4 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Zap className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.activeReminders}
                  <span className="text-sm font-normal text-slate-400">
                    /4
                  </span>
                </p>
                <p className="text-xs text-slate-500">أنواع مفعّلة</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Send className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.sentToday}
                </p>
                <p className="text-xs text-slate-500">أُرسلت اليوم</p>
              </div>
            </Card>

            

            <Card className="p-4 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <BarChart3 className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.totalLogs}
                </p>
                <p className="text-xs text-slate-500">إجمالي الرسائل</p>
              </div>
            </Card>
          </div>

          {/* Type distribution */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-blue-500" />
              التوزيع حسب النوع
            </h3>
            {typeDistribution.map(({ type, count, pct }) => {
              const config = REMINDER_TYPE_CONFIG[type];
              const Icon = config.icon;
              return (
                <div key={type} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={`flex items-center gap-1.5 font-medium ${config.color}`}
                    >
                      <Icon className="size-3.5" />
                      {config.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        type === "CONFIRM"
                          ? "bg-emerald-500"
                          : type === "REMINDER"
                            ? "bg-blue-500"
                            : type === "RESCHEDULE"
                              ? "bg-amber-500"
                              : "bg-red-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Recent activity */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-emerald-500" />
              آخر النشاطات
            </h3>
            <div className="space-y-3">
              {logs.slice(0, 4).map((log) => {
                const st = STATUS_CONFIG[log.status];
                const patientName =
                  log.patient?.firstName && log.patient?.lastName
                    ? `${log.patient.firstName} ${log.patient.lastName}`
                    : log.toPhone;
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div
                      className={`size-6 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
                        log.status === "FAILED"
                          ? "bg-red-50 text-red-500"
                          : "bg-blue-50 text-blue-500"
                      }`}
                    >
                      {st.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-700 font-medium truncate">
                        {patientName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {REMINDER_TYPE_CONFIG[log.type].label}
                      </p>
                    </div>
                  </div>
                );
              })}
              {logs.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2">
                  لا توجد رسائل بعد
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Message Preview Modal ── */}
      <Modal
        isOpen={!!previewLog}
        onClose={() => setPreviewLog(null)}
        title="تفاصيل الرسالة"
      >
        {previewLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-semibold">المريض</p>
                <p className="text-sm text-slate-800 font-medium">
                  {previewLog.patient?.firstName && previewLog.patient?.lastName
                    ? `${previewLog.patient.firstName} ${previewLog.patient.lastName}`
                    : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-semibold">الهاتف</p>
                <p className="text-sm text-slate-800 font-mono" dir="ltr">
                  {previewLog.toPhone}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-semibold">
                  نوع التذكير
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    REMINDER_TYPE_CONFIG[previewLog.type].color
                  }`}
                >
                  {(() => {
                    const Icon = REMINDER_TYPE_CONFIG[previewLog.type].icon;
                    return <Icon className="size-3.5" />;
                  })()}
                  {REMINDER_TYPE_CONFIG[previewLog.type].label}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-semibold">الحالة</p>
                <Badge variant={STATUS_CONFIG[previewLog.status].variant}>
                  <span className="flex items-center gap-1">
                    {STATUS_CONFIG[previewLog.status].icon}
                    {STATUS_CONFIG[previewLog.status].label}
                  </span>
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-semibold">
                  تاريخ الإرسال
                </p>
                <p className="text-sm text-slate-800">
                  {formatArabicDateTime(previewLog.sentAt)}
                </p>
              </div>
              {previewLog.deliveredAt && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-semibold">
                    تاريخ التوصيل
                  </p>
                  <p className="text-sm text-slate-800">
                    {formatArabicDateTime(previewLog.deliveredAt)}
                  </p>
                </div>
              )}
              {previewLog.errorMessage && (
                <div className="col-span-2 space-y-1">
                  <p className="text-xs text-red-500 font-semibold">
                    خطأ في الإرسال
                  </p>
                  <p className="text-sm text-red-600">
                    {previewLog.errorMessage}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-semibold">
                محتوى الرسالة
              </p>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {parseMessageContent(previewLog.messageContent, previewLog.type)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="outline" onClick={() => setPreviewLog(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
    </PlanGate>
  );
}
