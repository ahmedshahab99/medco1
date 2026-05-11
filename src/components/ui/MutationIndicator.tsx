"use client";

import { useIsMutating } from "@tanstack/react-query";
import { Spinner } from "./Spinner";

export function MutationIndicator() {
  const isMutating = useIsMutating() > 0;

  if (!isMutating) return null;

  return (
    <div className="fixed bottom-4 end-4 z-50 flex items-center gap-2 bg-white shadow-lg border border-border rounded-full px-4 py-2 text-sm text-muted-foreground">
      <Spinner className="size-3.5" />
      جاري الحفظ...
    </div>
  );
}
