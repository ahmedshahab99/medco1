import { getInvitations } from "./actions";
import { InviteForm } from "./invite-form";
import { InviteList } from "./invite-list";
import { UsersRound } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InvitePage() {
  const invitations = await getInvitations();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
          <UsersRound className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">دعوة أعضاء جدد</h1>
          <p className="text-sm text-slate-500 mt-0.5">أرسل دعوات لأعضاء فريقك للانضمام إلى العيادة.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-800 mb-4">إرسال دعوة جديدة</h2>
        <InviteForm />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-800 mb-4">الدعوات السابقة</h2>
        <InviteList invitations={invitations} />
      </div>
    </div>
  );
}
