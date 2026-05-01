import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getUsers } from "./actions";
import { UserList } from "./user-list";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UsersSettingsPage() {
  const admin = await requireRole(["ADMIN"]);

  if (!admin.tenantId) {
    redirect("/setup");
  }

  const users = await getUsers();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">المستخدمين والصلاحيات</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            إدارة أعضاء فريق العمل في عيادتك. يمكنك تعديل أدوارهم أو حذفهم.
          </p>
        </div>
      </div>

      <UserList users={users} currentUserId={admin.id} />
    </div>
  );
}
