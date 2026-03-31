"use client";

import React, { useState, useMemo } from "react";
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  Send,
  Zap,
  Play,
  Pause,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Mail,
  Smartphone,
  X,
  ChevronDown,
  Eye,
  BarChart3,
  TrendingUp,
  CalendarClock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

// ─── Types ────────────────────────────────────────────────────────────────────

type TriggerType = "before" | "after";
type TriggerUnit = "hours" | "days";
type Channel = "sms" | "whatsapp" | "email";
type LogStatus = "sent" | "delivered" | "failed" | "pending";

interface ReminderWorkflow {
  id: string;
  name: string;
  triggerType: TriggerType;
  triggerValue: number;
  triggerUnit: TriggerUnit;
  channel: Channel;
  messageTemplate: string;
  isActive: boolean;
  createdAt: string;
}

interface ReminderLog {
  id: string;
  workflowId: string;
  workflowName: string;
  patientName: string;
  patientPhone: string;
  channel: Channel;
  message: string;
  sentAt: string;
  status: LogStatus;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
  before: "قبل الموعد",
  after: "بعد الموعد",
};

const TRIGGER_UNIT_LABELS: Record<TriggerUnit, string> = {
  hours: "ساعة",
  days: "يوم",
};

const CHANNEL_CONFIG: Record<
  Channel,
  { label: string; icon: React.ReactNode; color: string; bgColor: string }
> = {
  sms: {
    label: "رسالة نصية",
    icon: <Smartphone className="w-4 h-4" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-100",
  },
  whatsapp: {
    label: "واتساب",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-100",
  },
  email: {
    label: "بريد إلكتروني",
    icon: <Mail className="w-4 h-4" />,
    color: "text-violet-600",
    bgColor: "bg-violet-50 border-violet-100",
  },
};

const STATUS_CONFIG: Record<
  LogStatus,
  { label: string; variant: "success" | "warning" | "danger" | "default"; icon: React.ReactNode }
> = {
  sent: {
    label: "تم الإرسال",
    variant: "default",
    icon: <Send className="w-3 h-3" />,
  },
  delivered: {
    label: "تم التوصيل",
    variant: "success",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  failed: {
    label: "فشل الإرسال",
    variant: "danger",
    icon: <XCircle className="w-3 h-3" />,
  },
  pending: {
    label: "قيد الانتظار",
    variant: "warning",
    icon: <Clock className="w-3 h-3" />,
  },
};

const MESSAGE_VARIABLES = [
  { key: "{patient_name}", label: "اسم المريض" },
  { key: "{appointment_date}", label: "تاريخ الموعد" },
  { key: "{appointment_time}", label: "وقت الموعد" },
  { key: "{doctor_name}", label: "اسم الطبيب" },
  { key: "{clinic_name}", label: "اسم العيادة" },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_WORKFLOWS: ReminderWorkflow[] = [
  {
    id: "w1",
    name: "تذكير قبل الموعد",
    triggerType: "before",
    triggerValue: 24,
    triggerUnit: "hours",
    channel: "whatsapp",
    messageTemplate:
      "مرحباً {patient_name}، نود تذكيرك بموعدك يوم {appointment_date} الساعة {appointment_time} مع {doctor_name} في {clinic_name}. نتطلع لرؤيتك!",
    isActive: true,
    createdAt: "2026-03-15",
  },
  {
    id: "w2",
    name: "تأكيد بعد الحجز",
    triggerType: "after",
    triggerValue: 0,
    triggerUnit: "hours",
    channel: "sms",
    messageTemplate:
      "تم تأكيد حجزك بنجاح يا {patient_name}! موعدك يوم {appointment_date} الساعة {appointment_time}. شكراً لاختيارك {clinic_name}.",
    isActive: true,
    createdAt: "2026-03-10",
  },
  {
    id: "w3",
    name: "تذكير مراجعة دورية",
    triggerType: "after",
    triggerValue: 30,
    triggerUnit: "days",
    channel: "email",
    messageTemplate:
      "عزيزنا {patient_name}، مرّ شهر على آخر زيارة لك. ننصحك بحجز موعد للمراجعة مع {doctor_name}. صحتك تهمنا في {clinic_name}.",
    isActive: false,
    createdAt: "2026-03-05",
  },
];

const INITIAL_LOGS: ReminderLog[] = [
  {
    id: "l1",
    workflowId: "w1",
    workflowName: "تذكير قبل الموعد",
    patientName: "أحمد محمد السيد",
    patientPhone: "0501234567",
    channel: "whatsapp",
    message: "مرحباً أحمد محمد السيد، نود تذكيرك بموعدك يوم...",
    sentAt: "2026-03-31T10:30:00",
    status: "delivered",
  },
  {
    id: "l2",
    workflowId: "w2",
    workflowName: "تأكيد بعد الحجز",
    patientName: "فاطمة علي حسن",
    patientPhone: "0559876543",
    channel: "sms",
    message: "تم تأكيد حجزك بنجاح يا فاطمة علي حسن!...",
    sentAt: "2026-03-31T09:15:00",
    status: "sent",
  },
  {
    id: "l3",
    workflowId: "w1",
    workflowName: "تذكير قبل الموعد",
    patientName: "خالد إبراهيم",
    patientPhone: "0541112233",
    channel: "whatsapp",
    message: "مرحباً خالد إبراهيم، نود تذكيرك بموعدك...",
    sentAt: "2026-03-31T08:00:00",
    status: "failed",
  },
  {
    id: "l4",
    workflowId: "w1",
    workflowName: "تذكير قبل الموعد",
    patientName: "سارة عبدالرحمن",
    patientPhone: "0567778899",
    channel: "whatsapp",
    message: "مرحباً سارة عبدالرحمن، نود تذكيرك...",
    sentAt: "2026-03-30T14:45:00",
    status: "delivered",
  },
  {
    id: "l5",
    workflowId: "w3",
    workflowName: "تذكير مراجعة دورية",
    patientName: "محمد عبدالله",
    patientPhone: "0533445566",
    channel: "email",
    message: "عزيزنا محمد عبدالله، مرّ شهر على...",
    sentAt: "2026-03-30T12:00:00",
    status: "delivered",
  },
  {
    id: "l6",
    workflowId: "w2",
    workflowName: "تأكيد بعد الحجز",
    patientName: "نورة سعد",
    patientPhone: "0588990011",
    channel: "sms",
    message: "تم تأكيد حجزك بنجاح يا نورة سعد!...",
    sentAt: "2026-03-30T11:30:00",
    status: "sent",
  },
  {
    id: "l7",
    workflowId: "w1",
    workflowName: "تذكير قبل الموعد",
    patientName: "عبدالعزيز الشمري",
    patientPhone: "0512345678",
    channel: "whatsapp",
    message: "مرحباً عبدالعزيز الشمري، نود تذكيرك...",
    sentAt: "2026-03-29T16:20:00",
    status: "pending",
  },
  {
    id: "l8",
    workflowId: "w2",
    workflowName: "تأكيد بعد الحجز",
    patientName: "ريم الخالدي",
    patientPhone: "0576543210",
    channel: "sms",
    message: "تم تأكيد حجزك بنجاح يا ريم الخالدي!...",
    sentAt: "2026-03-29T10:00:00",
    status: "delivered",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function formatArabicDateTime(dateStr: string) {
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

function formatArabicDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildTriggerDescription(w: ReminderWorkflow) {
  if (w.triggerValue === 0 && w.triggerType === "after") {
    return "فوراً بعد الحجز";
  }
  return `${TRIGGER_TYPE_LABELS[w.triggerType]} بـ ${w.triggerValue} ${TRIGGER_UNIT_LABELS[w.triggerUnit]}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "-translate-x-6" : "-translate-x-1"
        }`}
      />
    </button>
  );
}

// ─── Workflow Card ─────────────────────────────────────────────────────────────

function WorkflowCard({
  workflow,
  onToggle,
  onEdit,
  onDelete,
}: {
  workflow: ReminderWorkflow;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const ch = CHANNEL_CONFIG[workflow.channel];
  return (
    <Card
      className={`p-0 overflow-hidden transition-all duration-200 hover:shadow-md ${
        !workflow.isActive ? "opacity-70" : ""
      }`}
    >
      {/* Top accent bar */}
      <div
        className={`h-1 ${
          workflow.isActive
            ? workflow.channel === "whatsapp"
              ? "bg-gradient-to-l from-emerald-400 to-emerald-500"
              : workflow.channel === "sms"
              ? "bg-gradient-to-l from-blue-400 to-blue-500"
              : "bg-gradient-to-l from-violet-400 to-violet-500"
            : "bg-slate-200"
        }`}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                workflow.isActive
                  ? `${ch.bgColor} ${ch.color}`
                  : "bg-slate-100 text-slate-400"
              } border`}
            >
              {ch.icon}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 text-sm truncate">
                {workflow.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                أُنشئ في {formatArabicDate(workflow.createdAt)}
              </p>
            </div>
          </div>
          <Toggle enabled={workflow.isActive} onChange={onToggle} />
        </div>

        {/* Trigger & Channel badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
            <Clock className="w-3.5 h-3.5" />
            {buildTriggerDescription(workflow)}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${ch.bgColor} ${ch.color}`}
          >
            {ch.icon}
            {ch.label}
          </span>
        </div>

        {/* Message preview */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
          <p className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
            <MessageSquare className="w-3 h-3" />
            قالب الرسالة
          </p>
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
            {workflow.messageTemplate}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span
            className={`text-xs font-semibold flex items-center gap-1.5 ${
              workflow.isActive ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            {workflow.isActive ? (
              <>
                <Play className="w-3 h-3" />
                نشط
              </>
            ) : (
              <>
                <Pause className="w-3 h-3" />
                متوقف
              </>
            )}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="تعديل"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RemindersPage() {
  const [workflows, setWorkflows] =
    useState<ReminderWorkflow[]>(INITIAL_WORKFLOWS);
  const [logs] = useState<ReminderLog[]>(INITIAL_LOGS);
  const [activeTab, setActiveTab] = useState<"workflows" | "logs">("workflows");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] =
    useState<ReminderWorkflow | null>(null);
  const [form, setForm] = useState<Partial<ReminderWorkflow>>({});

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Log filters
  const [logSearch, setLogSearch] = useState("");
  const [logStatusFilter, setLogStatusFilter] = useState<LogStatus | "all">(
    "all"
  );

  // Preview modal
  const [previewLog, setPreviewLog] = useState<ReminderLog | null>(null);

  // ── Workflow helpers ──────────────────────────────────────────────────────

  const openCreateModal = () => {
    setEditingWorkflow(null);
    setForm({
      name: "",
      triggerType: "before",
      triggerValue: 24,
      triggerUnit: "hours",
      channel: "whatsapp",
      messageTemplate: "",
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (w: ReminderWorkflow) => {
    setEditingWorkflow(w);
    setForm({ ...w });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingWorkflow(null);
    setForm({});
  };

  const saveWorkflow = () => {
    if (!form.name || !form.messageTemplate) return;
    if (editingWorkflow) {
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === editingWorkflow.id
            ? ({ ...w, ...form } as ReminderWorkflow)
            : w
        )
      );
    } else {
      const newWorkflow: ReminderWorkflow = {
        id: uid(),
        name: form.name!,
        triggerType: form.triggerType || "before",
        triggerValue: form.triggerValue ?? 24,
        triggerUnit: form.triggerUnit || "hours",
        channel: form.channel || "whatsapp",
        messageTemplate: form.messageTemplate!,
        isActive: form.isActive ?? true,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setWorkflows((prev) => [...prev, newWorkflow]);
    }
    closeModal();
  };

  const toggleWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isActive: !w.isActive } : w))
    );
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
    setDeleteConfirm(null);
  };

  // ── Log helpers ───────────────────────────────────────────────────────────

  const filteredLogs = useMemo(() => {
    let result = [...logs];
    if (logStatusFilter !== "all") {
      result = result.filter((l) => l.status === logStatusFilter);
    }
    if (logSearch.trim()) {
      const q = logSearch.trim().toLowerCase();
      result = result.filter(
        (l) =>
          l.patientName.toLowerCase().includes(q) ||
          l.workflowName.toLowerCase().includes(q)
      );
    }
    return result.sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  }, [logs, logStatusFilter, logSearch]);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const activeCount = workflows.filter((w) => w.isActive).length;
    const today = new Date().toISOString().split("T")[0];
    const todayLogs = logs.filter((l) => l.sentAt.startsWith(today));
    const deliveredCount = logs.filter((l) => l.status === "delivered").length;
    const successRate =
      logs.length > 0 ? Math.round((deliveredCount / logs.length) * 100) : 0;
    return {
      activeWorkflows: activeCount,
      sentToday: todayLogs.length,
      successRate,
      totalLogs: logs.length,
    };
  }, [workflows, logs]);

  // ── Tabs ──────────────────────────────────────────────────────────────────

  const tabs = [
    {
      id: "workflows" as const,
      label: "سير العمل",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: "logs" as const,
      label: "سجل الإرسال",
      icon: <Send className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Bell className="w-5 h-5" />
            </div>
            التذكيرات التلقائية
          </h1>
          <p className="text-slate-500 mt-1">
            أنشئ تذكيرات تلقائية للمرضى وتتبع حالة الإرسال.
          </p>
        </div>
        {activeTab === "workflows" && (
          <Button onClick={openCreateModal} className="gap-2 shrink-0">
            <Plus className="w-5 h-5" />
            إنشاء سير عمل جديد
          </Button>
        )}
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

          {/* ── Tab: Workflows ── */}
          {activeTab === "workflows" && (
            <div className="space-y-4">
              {workflows.length === 0 ? (
                <Card className="flex flex-col items-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-300">
                    <Zap className="w-8 h-8" />
                  </div>
                  <p className="text-slate-600 font-bold text-lg">
                    لا توجد تذكيرات حتى الآن
                  </p>
                  <p className="text-slate-400 text-sm mt-1 max-w-xs">
                    أنشئ سير عمل جديد لإرسال تذكيرات تلقائية للمرضى قبل أو بعد
                    مواعيدهم.
                  </p>
                  <Button
                    onClick={openCreateModal}
                    className="mt-6 gap-2"
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                    إنشاء أول سير عمل
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {workflows.map((w) => (
                    <div key={w.id} className="relative">
                      <WorkflowCard
                        workflow={w}
                        onToggle={() => toggleWorkflow(w.id)}
                        onEdit={() => openEditModal(w)}
                        onDelete={() => setDeleteConfirm(w.id)}
                      />
                      {/* Delete confirmation overlay */}
                      {deleteConfirm === w.id && (
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl border border-red-200 flex flex-col items-center justify-center gap-3 z-10 p-6 animate-in fade-in zoom-in-95 duration-200">
                          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                            <Trash2 className="w-6 h-6" />
                          </div>
                          <p className="font-bold text-slate-800 text-center">
                            حذف &quot;{w.name}&quot;؟
                          </p>
                          <p className="text-sm text-slate-500 text-center">
                            سيتم حذف سير العمل نهائياً ولا يمكن التراجع.
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              إلغاء
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => deleteWorkflow(w.id)}
                            >
                              حذف
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Logs ── */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              {/* Filter bar */}
              <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="بحث باسم المريض أو سير العمل..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white pr-10 pl-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  {/* Status filter */}
                  <div className="relative">
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      value={logStatusFilter}
                      onChange={(e) =>
                        setLogStatusFilter(e.target.value as LogStatus | "all")
                      }
                      className="appearance-none rounded-xl border border-slate-200 bg-white pr-10 pl-9 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer min-w-[160px]"
                    >
                      <option value="all">جميع الحالات</option>
                      <option value="delivered">تم التوصيل</option>
                      <option value="sent">تم الإرسال</option>
                      <option value="pending">قيد الانتظار</option>
                      <option value="failed">فشل</option>
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </Card>

              {/* Logs table */}
              <Card className="p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800">سجل الإرسال</h2>
                    <p className="text-xs text-slate-500">
                      {filteredLogs.length} رسالة{" "}
                      {logStatusFilter !== "all"
                        ? `(${STATUS_CONFIG[logStatusFilter].label})`
                        : ""}
                    </p>
                  </div>
                </div>

                {filteredLogs.length === 0 ? (
                  <div className="flex flex-col items-center py-14 text-center">
                    <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-3 text-slate-300">
                      <Send className="w-7 h-7" />
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
                          <TableHead>سير العمل</TableHead>
                          <TableHead>القناة</TableHead>
                          <TableHead>تاريخ الإرسال</TableHead>
                          <TableHead>الحالة</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLogs.map((log) => {
                          const ch = CHANNEL_CONFIG[log.channel];
                          const st = STATUS_CONFIG[log.status];
                          return (
                            <TableRow key={log.id}>
                              <TableCell>
                                <div>
                                  <p className="font-semibold text-slate-800 text-sm">
                                    {log.patientName}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-0.5 font-mono" dir="ltr">
                                    {log.patientPhone}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-slate-600">
                                  {log.workflowName}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${ch.color}`}
                                >
                                  {ch.icon}
                                  {ch.label}
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
                                  <Eye className="w-4 h-4" />
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
            </div>
          )}
        </div>

        {/* ── Right panel: Stats ── */}
        <div className="xl:w-80 shrink-0 space-y-4">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
            نظرة عامة
          </h2>

          {/* Stats cards */}
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
            <Card className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.activeWorkflows}
                </p>
                <p className="text-xs text-slate-500">تذكيرات نشطة</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.sentToday}
                </p>
                <p className="text-xs text-slate-500">أُرسلت اليوم</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.successRate}%
                </p>
                <p className="text-xs text-slate-500">نسبة التوصيل</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats.totalLogs}
                </p>
                <p className="text-xs text-slate-500">إجمالي الرسائل</p>
              </div>
            </Card>
          </div>

          {/* Channel breakdown */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <div className="w-1.5 h-4 rounded-full bg-blue-500" />
              التوزيع حسب القناة
            </h3>
            {(["whatsapp", "sms", "email"] as Channel[]).map((channel) => {
              const ch = CHANNEL_CONFIG[channel];
              const count = logs.filter((l) => l.channel === channel).length;
              const pct =
                logs.length > 0
                  ? Math.round((count / logs.length) * 100)
                  : 0;
              return (
                <div key={channel} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={`flex items-center gap-1.5 font-medium ${ch.color}`}
                    >
                      {ch.icon}
                      {ch.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        channel === "whatsapp"
                          ? "bg-emerald-500"
                          : channel === "sms"
                          ? "bg-blue-500"
                          : "bg-violet-500"
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
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
                        log.status === "delivered"
                          ? "bg-emerald-50 text-emerald-500"
                          : log.status === "failed"
                          ? "bg-red-50 text-red-500"
                          : log.status === "pending"
                          ? "bg-amber-50 text-amber-500"
                          : "bg-blue-50 text-blue-500"
                      }`}
                    >
                      {st.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-700 font-medium truncate">
                        {log.patientName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {log.workflowName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Create / Edit Workflow Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          editingWorkflow ? "تعديل سير العمل" : "إنشاء سير عمل جديد"
        }
      >
        <div className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              اسم التذكير <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="مثال: تذكير قبل الموعد بيوم"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Trigger */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              توقيت الإرسال
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Type selector */}
              <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                {(["before", "after"] as TriggerType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setForm({ ...form, triggerType: type })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      form.triggerType === type
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {TRIGGER_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>

              {/* Value */}
              <span className="text-sm text-slate-500">بـ</span>
              <input
                type="number"
                min={0}
                max={365}
                value={form.triggerValue ?? 24}
                onChange={(e) =>
                  setForm({
                    ...form,
                    triggerValue: parseInt(e.target.value) || 0,
                  })
                }
                className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-center outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

              {/* Unit selector */}
              <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                {(["hours", "days"] as TriggerUnit[]).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setForm({ ...form, triggerUnit: unit })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      form.triggerUnit === unit
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {TRIGGER_UNIT_LABELS[unit]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Channel */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              قناة الإرسال
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["whatsapp", "sms", "email"] as Channel[]).map((channel) => {
                const ch = CHANNEL_CONFIG[channel];
                const isSelected = form.channel === channel;
                return (
                  <button
                    key={channel}
                    onClick={() => setForm({ ...form, channel })}
                    className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? channel === "whatsapp"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                          : channel === "sms"
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-violet-500 bg-violet-50 text-violet-600"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {ch.icon}
                    {ch.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message template */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              قالب الرسالة <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="اكتب رسالة التذكير هنا... يمكنك استخدام المتغيرات أدناه."
              value={form.messageTemplate || ""}
              onChange={(e) =>
                setForm({ ...form, messageTemplate: e.target.value })
              }
              className="min-h-[100px]"
            />
            {/* Variable pills */}
            <div className="flex flex-wrap gap-1.5">
              {MESSAGE_VARIABLES.map((v) => (
                <button
                  key={v.key}
                  onClick={() =>
                    setForm({
                      ...form,
                      messageTemplate:
                        (form.messageTemplate || "") + " " + v.key,
                    })
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors font-mono"
                  title={`إضافة ${v.label}`}
                >
                  <Plus className="w-3 h-3" />
                  {v.key}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              انقر على المتغير لإضافته إلى الرسالة. سيتم استبداله ببيانات
              المريض الفعلية عند الإرسال.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" onClick={closeModal}>
              إلغاء
            </Button>
            <Button
              onClick={saveWorkflow}
              disabled={!form.name || !form.messageTemplate}
              className="gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {editingWorkflow ? "حفظ التعديلات" : "إنشاء سير العمل"}
            </Button>
          </div>
        </div>
      </Modal>

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
                  {previewLog.patientName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-semibold">الهاتف</p>
                <p className="text-sm text-slate-800 font-mono" dir="ltr">
                  {previewLog.patientPhone}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-semibold">
                  سير العمل
                </p>
                <p className="text-sm text-slate-800">
                  {previewLog.workflowName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-semibold">القناة</p>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    CHANNEL_CONFIG[previewLog.channel].color
                  }`}
                >
                  {CHANNEL_CONFIG[previewLog.channel].icon}
                  {CHANNEL_CONFIG[previewLog.channel].label}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-semibold">
                  تاريخ الإرسال
                </p>
                <p className="text-sm text-slate-800">
                  {formatArabicDateTime(previewLog.sentAt)}
                </p>
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
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-semibold">
                محتوى الرسالة
              </p>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {previewLog.message}
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
  );
}