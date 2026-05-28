"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("Profile page error:", error);
  }, [error]);

  return (
    <div className="max-w-5xl flex flex-col items-center justify-center py-20 text-center space-y-4">
      <h2 className="text-xl font-bold text-slate-900">
        حدث خطأ في تحميل البيانات
      </h2>
      <p className="text-slate-500">
        تعذر تحميل بيانات العيادة، يرجى المحاولة مرة أخرى.
      </p>
      {showDetails && error && (
        <p className="text-xs text-red-500 bg-red-50 p-3 rounded-xl max-w-md font-mono" dir="ltr">
          {error.message}
        </p>
      )}
      <div className="flex gap-3">
        <Button onClick={() => reset()}>إعادة المحاولة</Button>
        <Button variant="outline" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? "إخفاء التفاصيل" : "عرض التفاصيل"}
        </Button>
      </div>
    </div>
  );
}
