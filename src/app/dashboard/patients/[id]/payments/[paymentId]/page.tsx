import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getPatientPaymentAction } from "../actions";
import { PaymentDetailActions } from "./payment-actions";

interface PaymentDetailPageProps {
  params: Promise<{ id: string; paymentId: string }>;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ar-IQ", { maximumFractionDigits: 0 }).format(amount) + " د.ع";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-IQ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const CATEGORY_LABELS: Record<string, string> = {
  CONSULTATION: "كشف",
  MEDICATIONS: "أدوية",
  SERVICES: "خدمات",
  OTHER: "أخرى",
};

export default async function PaymentDetailPage({ params }: PaymentDetailPageProps) {
  const { id: patientId, paymentId } = await params;

  const result = await getPatientPaymentAction(paymentId);

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] gap-4 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-lg font-semibold text-slate-700">الدفعة غير موجودة</p>
        <p className="text-sm">{result.error}</p>
        <Link
          href={`/dashboard/patients/${patientId}?tab=payments`}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          العودة للمدفوعات
        </Link>
      </div>
    );
  }

  const payment = result.data;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/dashboard/patients/${patientId}?tab=payments`}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors w-fit"
      >
        <ChevronRight className="w-4 h-4" />
        العودة للمدفوعات
      </Link>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900">تفاصيل الدفعة</h1>
          <p className="text-sm text-slate-500">للمريض: {payment.patientName}</p>
        </div>
        <PaymentDetailActions
          paymentId={payment.id}
          patientId={patientId}
          patientName={payment.patientName}
          tenantName={payment.tenantName}
          payment={{
            amount: payment.amount,
            category: payment.category,
            date: payment.date.split("T")[0],
            description: payment.description ?? "",
            appointmentId: payment.appointmentId,
            serviceName: payment.service?.name ?? null,
            serviceId: payment.serviceId,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DetailCard
          label="المبلغ"
          value={formatCurrency(payment.amount)}
          variant="emerald"
        />
        <DetailCard
          label="التاريخ"
          value={formatDate(payment.date)}
        />
        <DetailCard
          label="الفئة"
          value={CATEGORY_LABELS[payment.category] ?? payment.category}
        />
        {payment.appointment && (
          <DetailCard
            label="الموعد المرتبط"
            value={`${payment.appointment.service?.name ?? "موعد"} · ${formatDate(payment.appointment.startTime)}`}
          />
        )}
        {payment.appointment?.doctor && (
          <DetailCard
            label="الطبيب"
            value={`${payment.appointment.doctor.firstName ?? payment.appointment.doctor.email} ${payment.appointment.doctor.lastName ?? ""}`}
            subtle
          />
        )}
        <DetailCard
          label="تاريخ التسجيل"
          value={formatDate(payment.createdAt)}
          subtle
        />
        {payment.updatedAt !== payment.createdAt && (
          <DetailCard
            label="آخر تحديث"
            value={formatDate(payment.updatedAt)}
            subtle
          />
        )}
      </div>

      {payment.description && (
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">الوصف</span>
          <p className="text-sm text-slate-700 mt-1 leading-relaxed">{payment.description}</p>
        </div>
      )}     
      {!payment.description && !payment.appointment && (
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-8 text-center">
          <p className="text-sm text-slate-400">لا توجد تفاصيل إضافية لهذه الدفعة</p>
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
