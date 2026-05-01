"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateUserRole, deleteUser } from "./actions";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast, useToast } from "@/components/ui/Toast";
import { ShieldCheck, Trash2, UserPlus, Loader2 } from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
}

interface UserListProps {
  users: UserRow[];
  currentUserId: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "مدير",
  DOCTOR: "طبيب",
  RECEPTIONIST: "موظف استقبال",
};

const ROLE_BADGE_VARIANTS: Record<string, "success" | "warning" | "danger" | "default"> = {
  ADMIN: "danger",
  DOCTOR: "default",
  RECEPTIONIST: "warning",
};

export function UserList({ users, currentUserId }: UserListProps) {
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { confirmState, confirm, closeConfirm } = useConfirmDialog();
  const { toast, showToast, hideToast } = useToast();

  const handleRoleChange = (userId: string, newRole: string) => {
    setUpdatingId(userId);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("role", newRole);
      const result = await updateUserRole(formData);
      setUpdatingId(null);

      if (result.error) {
        showToast(result.error, "error");
      } else {
        showToast("تم تحديث الدور بنجاح. سيتم تسجيل خروج المستخدم لإعادة تسجيل الدخول.", "success");
      }
    });
  };

  const handleDelete = (user: UserRow) => {
    confirm({
      title: "حذف المستخدم",
      message: `هل أنت متأكد من حذف "${user.firstName ?? ""} ${user.lastName ?? ""}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      onConfirm: () => {
        setDeletingId(user.id);
        startTransition(async () => {
          const formData = new FormData();
          formData.append("userId", user.id);
          const result = await deleteUser(formData);
          setDeletingId(null);
          closeConfirm();

          if (result.error) {
            showToast(result.error, "error");
          } else {
            showToast("تم حذف المستخدم بنجاح.", "success");
          }
        });
      },
    });
  };

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-semibold text-slate-700">لا يوجد مستخدمون</h3>
        <p className="text-sm text-slate-500">
          لا يوجد مستخدمون مسجلون في العيادة بعد. أرسل دعوة لأول عضو في فريقك.
        </p>
        <Link href="/dashboard/invite">
          <Button className="mt-2 gap-2">
            <UserPlus className="w-4 h-4" />
            دعوة مستخدم جديد
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-800">فريق العمل</h2>
        <Link href="/dashboard/invite">
          <Button size="sm" className="gap-2">
            <UserPlus className="w-4 h-4" />
            دعوة مستخدم جديد
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم الكامل</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>الدور</TableHead>
              <TableHead className="hidden md:table-cell">تاريخ الانضمام</TableHead>
              <TableHead className="text-start">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
              const isCurrentUser = user.id === currentUserId;
              const isUpdating = updatingId === user.id;
              const isDeleting = deletingId === user.id;

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <span className="font-medium text-slate-800">
                      {fullName}
                      {isCurrentUser && (
                        <span className="text-xs text-slate-400 me-2">(أنت)</span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600">{user.email}</TableCell>
                  <TableCell>
                    {isCurrentUser ? (
                      <Badge variant={ROLE_BADGE_VARIANTS[user.role] ?? "default"}>
                        {ROLE_LABELS[user.role] ?? user.role}
                      </Badge>
                    ) : (
                      <div className="relative inline-block">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={isUpdating || isPending}
                          className="h-9 ps-3 pe-8 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 appearance-none cursor-pointer"
                        >
                          <option value="ADMIN">مدير</option>
                          <option value="DOCTOR">طبيب</option>
                          <option value="RECEPTIONIST">موظف استقبال</option>
                        </select>
                        {isUpdating && (
                          <Loader2 className="absolute start-2 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 animate-spin" />
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString("ar-SA")}
                  </TableCell>
                  <TableCell className="text-start">
                    {!isCurrentUser && (
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={isDeleting || isPending}
                        className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                        title="حذف المستخدم"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        حذف
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={() => confirmState.onConfirm?.()}
        onCancel={closeConfirm}
        type="danger"
        confirmLabel="حذف"
        cancelLabel="إلغاء"
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={hideToast}
      />
    </div>
  );
}
