"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Send,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  REMINDER_TYPE_CONFIG,
  type ReminderType,
} from "@/lib/reminders/templates";
import { getMessageLogs } from "@/app/dashboard/reminders/actions";
import type { MessageStatus } from "@prisma/client";

// ─── Types ──────────────────────────────────────────────────────────────────

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

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "success" | "warning" | "danger" | "default"; icon: React.ReactNode }
> = {
  SENT: { label: "تم الإرسال", variant: "default", icon: <Send className="size-3" /> },
  FAILED: { label: "فشل الإرسال", variant: "danger", icon: <XCircle className="size-3" /> },
};

const PAGE_SIZE = 10;

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

// ─── Main Component ─────────────────────────────────────────────────────────

interface RemindersTabProps {
  patientId: string;
}

export function RemindersTab({ patientId }: RemindersTabProps) {
  const [logs, setLogs] = useState<MessageLogRow[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<ReminderType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<MessageStatus | "all">("all");

  const fetchLogs = useCallback(
    async (page: number, type: ReminderType | "all", status: MessageStatus | "all") => {
      setIsLoading(true);
      const result = await getMessageLogs({
        patientId,
        page,
        pageSize: PAGE_SIZE,
        type: type === "all" ? undefined : type,
        status: status === "all" ? undefined : status,
      });
      if (result) {
        setLogs(result.logs);
        setTotalLogs(result.total);
      }
      setIsLoading(false);
    },
    [patientId]
  );

  useEffect(() => {
    let cancelled = false;
    getMessageLogs({ patientId, page: 1, pageSize: PAGE_SIZE }).then((result) => {
      if (cancelled) return;
      if (result) {
        setLogs(result.logs);
        setTotalLogs(result.total);
      }
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  function handlePageChange(page: number) {
    setCurrentPage(page);
    fetchLogs(page, typeFilter, statusFilter);
  }

  function handleFilterChange(type: ReminderType | "all", status: MessageStatus | "all") {
    setCurrentPage(1);
    fetchLogs(1, type, status);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            التذكيرات والإشعارات
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {totalLogs > 0
              ? `${totalLogs} رسالة`
              : "لا توجد رسائل مرسلة"}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      {!isLoading && totalLogs > 0 && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <select
                value={typeFilter}
                onChange={(e) => {
                  const val = e.target.value as ReminderType | "all";
                  setTypeFilter(val);
                  handleFilterChange(val, statusFilter);
                }}
                className="appearance-none rounded-xl border border-slate-200 bg-white pe-10 ps-9 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
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
                value={statusFilter}
                onChange={(e) => {
                  const val = e.target.value as MessageStatus | "all";
                  setStatusFilter(val);
                  handleFilterChange(typeFilter, val);
                }}
                className="appearance-none rounded-xl border border-slate-200 bg-white pe-10 ps-9 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer min-w-[160px]"
              >
                <option value="all">جميع الحالات</option>
                <option value="SENT">تم الإرسال</option>
                <option value="FAILED">فشل</option>
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <RemindersSkeleton />
      ) : logs.length === 0 ? (
        <RemindersEmpty />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>النوع</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>تاريخ الإرسال</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const st = STATUS_CONFIG[log.status];
                  const typeConfig = REMINDER_TYPE_CONFIG[log.type];
                  const TypeIcon = typeConfig.icon;
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${typeConfig.color}`}>
                          <TypeIcon className="size-3.5" />
                          {typeConfig.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-600 font-mono" dir="ltr">
                          {log.toPhone}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-500">
                          {formatArabicDateTime(log.sentAt) || formatArabicDateTime(log.createdAt)}
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
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
                  <span key={`ellipsis-${i}`} className="flex items-center justify-center size-8 text-slate-400">
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
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function RemindersSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

function RemindersEmpty() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-3 border border-indigo-100">
        <Bell className="w-6 h-6 text-indigo-300" />
      </div>
      <p className="text-sm font-medium text-slate-600">لا توجد رسائل مرسلة</p>
      <p className="text-xs text-slate-400 mt-1">
        تظهر هنا رسائل واتساب المرسلة لهذا المريض من نظام التذكيرات.
      </p>
    </div>
  );
}
