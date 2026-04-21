import { ShieldX } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage(): React.ReactElement {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 flex items-center justify-center p-4"
    >
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <ShieldX className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          غير مصرح بالوصول
        </h1>
        <p className="text-slate-500 mb-8">
          ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة. تواصل مع مدير
          النظام إذا كنت تعتقد أن هذا خطأ.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          العودة إلى لوحة التحكم
        </Link>
      </div>
    </div>
  );
}
