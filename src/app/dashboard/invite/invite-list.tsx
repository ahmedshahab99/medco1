"use client";

import { useState, useTransition } from "react";
import { cancelInvitation } from "./actions";
import { XCircle, Clock, CheckCircle2, Ban } from "lucide-react";

interface InvitationRow {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  inviter: { email: string; firstName: string | null } | null;
  acceptedProfile: { email: string; firstName: string | null } | null;
}

interface InviteListProps {
  invitations: InvitationRow[];
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: "معلقة", className: "bg-amber-50 text-amber-700", icon: Clock },
  ACCEPTED: { label: "مقبولة", className: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  CANCELLED: { label: "ملغاة", className: "bg-slate-100 text-slate-500", icon: Ban },
  EXPIRED: { label: "منتهية", className: "bg-red-50 text-red-600", icon: XCircle },
};

const ROLE_LABELS: Record<string, string> = {
  DOCTOR: "طبيب",
  RECEPTIONIST: "موظف استقبال",
};

export function InviteList({ invitations }: InviteListProps) {
  const [isPending, startTransition] = useTransition();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = (id: string) => {
    setCancellingId(id);
    startTransition(async () => {
      await cancelInvitation(id);
      setCancellingId(null);
    });
  };

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-sm">لا توجد دعوات حتى الآن.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-start py-3 px-4 font-semibold text-slate-600">البريد الإلكتروني</th>
            <th className="text-start py-3 px-4 font-semibold text-slate-600">الدور</th>
            <th className="text-start py-3 px-4 font-semibold text-slate-600">الحالة</th>
            <th className="text-start py-3 px-4 font-semibold text-slate-600 hidden md:table-cell">تاريخ الإرسال</th>
            <th className="text-start py-3 px-4 font-semibold text-slate-600 hidden md:table-cell">تنتهي الصلاحية</th>
            <th className="text-start py-3 px-4 font-semibold text-slate-600">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {invitations.map((inv) => {
            const statusConfig = STATUS_CONFIG[inv.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = statusConfig.icon;
            const isCancelling = cancellingId === inv.id;

            return (
              <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-4">
                  <span className="font-medium text-slate-800">{inv.email}</span>
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {ROLE_LABELS[inv.role] || inv.role}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500 hidden md:table-cell">
                  {new Date(inv.createdAt).toLocaleDateString("ar-SA")}
                </td>
                <td className="py-3 px-4 text-slate-500 hidden md:table-cell">
                  {new Date(inv.expiresAt).toLocaleDateString("ar-SA")}
                </td>
                <td className="py-3 px-4">
                  {inv.status === "PENDING" && (
                    <button
                      onClick={() => handleCancel(inv.id)}
                      disabled={isPending}
                      className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isCancelling ? "جارٍ..." : "إلغاء"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
