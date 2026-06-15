import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getPatientCaseAction } from "../actions";
import { CaseDetailActions } from "./case-actions";

interface CaseDetailPageProps {
  params: Promise<{ id: string; caseId: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "نشطة",
  INACTIVE: "غير نشطة",
};

const STATUS_VARIANT: Record<string, string> = {
  ACTIVE: "emerald",
  INACTIVE: "slate",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-IQ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("ar-IQ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id: patientId, caseId } = await params;

  const result = await getPatientCaseAction(caseId);

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] gap-4 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-lg font-semibold text-slate-700">الحالة غير موجودة</p>
        <p className="text-sm">{result.error}</p>
        <Link
          href={`/dashboard/patients/${patientId}?tab=cases`}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          العودة للحالات
        </Link>
      </div>
    );
  }

  const c = result.data;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/dashboard/patients/${patientId}?tab=cases`}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors w-fit"
      >
        <ChevronRight className="w-4 h-4" />
        العودة للحالات
      </Link>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900">تفاصيل الحالة</h1>
          <p className="text-sm text-slate-500">للمريض: {c.patientName}</p>
        </div>
        <CaseDetailActions
          caseId={c.id}
          patientId={patientId}
          caseData={{
            title: c.title,
            description: c.description,
            status: c.status,
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DetailCard
          label="عنوان الحالة"
          value={c.title}
        />
        <DetailCard
          label="الحالة"
          value={STATUS_LABELS[c.status] ?? c.status}
          variant={STATUS_VARIANT[c.status] as "emerald" | undefined}
        />
        <DetailCard
          label="تاريخ الإنشاء"
          value={formatDate(c.createdAt)}
        />
        {c.updatedAt !== c.createdAt && (
          <DetailCard
            label="آخر تحديث"
            value={formatDate(c.updatedAt)}
            subtle
          />
        )}
      </div>

      {c.description && (
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">الوصف</span>
          <p className="text-sm text-slate-700 mt-1 leading-relaxed">{c.description}</p>
        </div>
      )}

      {c.appointments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              المواعيد المرتبطة ({c.appointments.length})
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {c.appointments.map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {a.service?.name ?? "موعد"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(a.startTime)}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full border text-xs font-bold bg-slate-50 text-slate-600 border-slate-200">
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!c.description && c.appointments.length === 0 && (
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-8 text-center">
          <p className="text-sm text-slate-400">لا توجد تفاصيل إضافية لهذه الحالة</p>
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
