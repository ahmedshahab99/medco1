"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-5xl flex flex-col items-center justify-center py-20 text-center space-y-4">
      <h2 className="text-xl font-bold text-slate-900">
        حدث خطأ في تحميل البيانات
      </h2>
      <p className="text-slate-500">
        تعذر تحميل بيانات العيادة، يرجى المحاولة مرة أخرى.
      </p>
      <Button onClick={() => reset()}>إعادة المحاولة</Button>
    </div>
  );
}
