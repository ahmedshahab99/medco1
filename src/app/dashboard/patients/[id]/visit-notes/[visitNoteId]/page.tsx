import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getVisitNoteAction } from "../actions";
import { listPatientFilesAction } from "../../files/actions";
import { VisitNoteDetailActions } from "./note-actions";
import { VisitNoteFilesSection } from "@/components/dashboard/patients/visit-notes/VisitNoteFilesSection";
import { formatDate } from "@/lib/date-utils";

interface VisitNoteDetailPageProps {
  params: Promise<{ id: string; visitNoteId: string }>;
}

export default async function VisitNoteDetailPage({ params }: VisitNoteDetailPageProps) {
  const { id: patientId, visitNoteId } = await params;

  const result = await getVisitNoteAction(visitNoteId);

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] gap-4 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-lg font-semibold text-slate-700">ملاحظة الزيارة غير موجودة</p>
        <p className="text-sm">{result.error}</p>
        <Link
          href={`/dashboard/patients/${patientId}?tab=visits`}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors"
        >
          العودة للملاحظات
        </Link>
      </div>
    );
  }

  const note = result.data;

  const filesResult = await listPatientFilesAction(patientId, {
    visitNoteId: note.id,
  });
  const attachedFiles = filesResult.success ? filesResult.data : [];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/dashboard/patients/${patientId}?tab=visit-notes`}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 transition-colors w-fit"
      >
        <ChevronRight className="w-4 h-4" />
        العودة للملاحظات
      </Link>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900">تفاصيل ملاحظة الزيارة</h1>
          <p className="text-sm text-slate-500">للمريض: {note.patientName}</p>
        </div>
        <VisitNoteDetailActions
          visitNoteId={note.id}
          patientId={patientId}
          patientName={note.patientName}
          clinicName={note.tenantName}
          note={{
            id: note.id,
            content: note.content,
            diagnosis: note.diagnosis,
            notes: note.notes,
            validityDays: note.validityDays,
            createdAt: note.createdAt,
            medications: note.medications,
            appointmentId: note.appointmentId,
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DetailCard
          label="تاريخ الزيارة"
          value={formatDate(note.createdAt)}
        />
        {note.validityDays && note.medications.length > 0 && (
          <DetailCard
            label="صلاحية الوصفة"
            value={`${note.validityDays} يوم`}
            variant="emerald"
          />
        )}
        {note.appointment && (
          <DetailCard
            label="الموعد المرتبط"
            value={`${note.appointment.service?.name ?? "موعد"} · ${formatDate(note.appointment.startTime)}`}
          />
        )}
        {note.appointment?.doctor && (
          <DetailCard
            label="الطبيب"
            value={`${note.appointment.doctor.firstName ?? note.appointment.doctor.email} ${note.appointment.doctor.lastName ?? ""}`}
            subtle
          />
        )}
        <DetailCard
          label="آخر تحديث"
          value={formatDate(note.updatedAt)}
          subtle
        />
      </div>

      {note.diagnosis && (
        <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
          <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
            <span className="text-sm font-bold text-blue-700">التشخيص</span>
          </div>
          <div className="p-4">
            <p className="text-sm text-slate-700 leading-relaxed">{note.diagnosis}</p>
          </div>
        </div>
      )}

      {note.content && (
        <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
          <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
            <span className="text-sm font-bold text-emerald-700">ملاحظات الزيارة</span>
          </div>
          <div className="p-4">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
          </div>
        </div>
      )}

      {note.medications.length > 0 && (
        <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
          <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
            <span className="text-sm font-bold text-emerald-700">الأدوية الموصوفة</span>
          </div>
          <div className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-emerald-100 bg-emerald-50/50">
                  <th className="text-right px-3 py-2 text-emerald-800 font-semibold text-xs">#</th>
                  <th className="text-right px-3 py-2 text-emerald-800 font-semibold text-xs">الدواء</th>
                  <th className="text-right px-3 py-2 text-emerald-800 font-semibold text-xs">الجرعة</th>
                  <th className="text-right px-3 py-2 text-emerald-800 font-semibold text-xs">التكرار</th>
                  <th className="text-right px-3 py-2 text-emerald-800 font-semibold text-xs">المدة</th>
                  {note.medications.some((m) => m.instructions) && (
                    <th className="text-right px-3 py-2 text-emerald-800 font-semibold text-xs">تعليمات</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {note.medications.map((med, idx) => (
                  <tr key={med.id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50">
                    <td className="px-3 py-2 text-slate-400 text-xs font-mono">{idx + 1}</td>
                    <td className="px-3 py-2 font-semibold text-slate-800 text-sm">{med.name}</td>
                    <td className="px-3 py-2 text-slate-600 text-sm">{med.dose || "—"}</td>
                    <td className="px-3 py-2 text-slate-600 text-sm">{med.frequency || "—"}</td>
                    <td className="px-3 py-2 text-slate-600 text-sm">{med.duration || "—"}</td>
                    {note.medications.some((m) => m.instructions) && (
                      <td className="px-3 py-2 text-slate-500 text-xs">{med.instructions || "—"}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {note.notes && (
        <div className="bg-amber-50 border-r-4 border-amber-400 rounded-lg p-4">
          <p className="text-xs font-semibold text-amber-800 mb-1">ملاحظات إضافية</p>
          <p className="text-sm text-amber-950 leading-relaxed">{note.notes}</p>
        </div>
      )}

      <VisitNoteFilesSection
        patientId={patientId}
        visitNoteId={note.id}
        initialFiles={attachedFiles}
      />

      {!note.content && !note.diagnosis && note.medications.length === 0 && (
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-8 text-center">
          <p className="text-sm text-slate-400">لا توجد تفاصيل إضافية لهذه الملاحظة</p>
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
