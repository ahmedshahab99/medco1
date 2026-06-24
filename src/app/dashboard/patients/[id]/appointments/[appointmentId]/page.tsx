import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getPatientAppointmentAction } from "../actions";
import { AppointmentDetailActions } from "./appointment-actions";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/date-utils";

interface AppointmentDetailPageProps {
  params: Promise<{ id: string; appointmentId: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  BOOKING: "حجز",
  WAITING: "انتظار",
  SCHEDULED: "مجدول",
  CONFIRMED: "مؤكد",
  IN_PROGRESS: "قيد التنفيذ",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
  NO_SHOW: "لم يحضر",
};

const STATUS_VARIANT: Record<string, string> = {
  BOOKING: "slate",
  WAITING: "slate",
  SCHEDULED: "blue",
  CONFIRMED: "indigo",
  IN_PROGRESS: "amber",
  COMPLETED: "emerald",
  CANCELLED: "red",
  NO_SHOW: "slate",
};

export default async function AppointmentDetailPage({ params }: AppointmentDetailPageProps) {
  const { id: patientId, appointmentId } = await params;

  const result = await getPatientAppointmentAction(appointmentId);

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] gap-4 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-lg font-semibold text-slate-700">الموعد غير موجود</p>
        <p className="text-sm">{result.error}</p>
        <Link
          href={`/dashboard/patients/${patientId}?tab=appointments`}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          العودة للمواعيد
        </Link>
      </div>
    );
  }

  const a = result.data;
  const variant = STATUS_VARIANT[a.status] ?? "slate";

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/dashboard/patients/${patientId}?tab=appointments`}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors w-fit"
      >
        <ChevronRight className="w-4 h-4" />
        العودة للمواعيد
      </Link>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900">تفاصيل الموعد</h1>
          <p className="text-sm text-slate-500">للمريض: {a.patientName}</p>
        </div>
        <AppointmentDetailActions
          appointmentId={a.id}
          patientId={patientId}
          patientName={a.patientName}
          appointmentData={{
            status: a.status,
            notes: a.notes,
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DetailCard
          label="الخدمة"
          value={a.serviceName}
        />
        <DetailCard
          label="الطبيب"
          value={a.doctorName}
        />
        <DetailCard
          label="التاريخ والوقت"
          value={formatDateTime(a.startTime)}
        />
        <DetailCard
          label="الحالة"
          value={STATUS_LABELS[a.status] ?? a.status}
          variant={variant as "emerald"}
        />
        <DetailCard
          label="حالة الدفع"
          value={a.transactions && a.transactions.length > 0 ? "مدفوع" : "غير مدفوع"}
          variant={a.transactions && a.transactions.length > 0 ? "emerald" : undefined}
        />
        <DetailCard
          label="تاريخ التسجيل"
          value={formatDate(a.createdAt)}
          subtle
        />
        {a.updatedAt !== a.createdAt && (
          <DetailCard
            label="آخر تحديث"
            value={formatDate(a.updatedAt)}
            subtle
          />
        )}
      </div>

      {a.caseName && (
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">الحالة المرتبطة</span>
          <p className="text-sm text-slate-800 font-medium mt-1">{a.caseName}</p>
        </div>
      )}

      {a.notes && (
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">الملاحظات</span>
          <p className="text-sm text-slate-700 mt-1 leading-relaxed">{a.notes}</p>
        </div>
      )}

      {a.transactions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              المدفوعات المرتبطة ({a.transactions.length})
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {a.transactions.map((t) => (
              <div key={t.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {formatCurrency(Number(t.amount))}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatDate(t.date)}
                    {t.description && ` · ${t.description}`}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full border text-xs font-bold bg-slate-50 text-slate-600 border-slate-200">
                  {t.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!a.notes && !a.caseName && a.transactions.length === 0 && (
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-8 text-center">
          <p className="text-sm text-slate-400">لا توجد تفاصيل إضافية لهذا الموعد</p>
        </div>
      )}
    </div>
  );
}

function DetailCard({
  label,
  value,
  variant,
  subtle,
}: {
  label: string;
  value: string;
  variant?: "emerald";
  subtle?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 p-4 ${subtle ? "opacity-60" : ""}`}>
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <p className={`text-base font-bold mt-1 ${variant === "emerald" ? "text-emerald-700" : "text-slate-800"}`}>
        {value}
      </p>
    </div>
  );
}
