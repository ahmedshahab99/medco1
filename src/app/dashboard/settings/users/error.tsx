"use client";

import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-900">حدث خطأ</h2>
        <p className="text-sm text-slate-500 max-w-md">
          تعذر تحميل قائمة المستخدمين. يرجى المحاولة مرة أخرى.
        </p>
      </div>
      <Button onClick={reset} variant="outline">
        إعادة المحاولة
      </Button>
    </div>
  );
}
