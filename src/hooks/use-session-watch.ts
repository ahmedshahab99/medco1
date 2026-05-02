"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useToast, type ToastType } from "@/components/ui/Toast";

const POLL_INTERVAL_MS = 60_000;

interface SessionWatchResult {
  toast: { message: string; type: ToastType; visible: boolean };
  hideToast: () => void;
}

/**
 * Watches the current session for revocation by polling /api/session-check.
 * If the session was revoked (e.g., admin changed role or deleted user),
 * it shows a toast, signs the user out locally, and redirects to /login.
 *
 * Mount this inside the dashboard shell so it runs for all protected pages.
 * Render the <Toast /> component using the returned toast state.
 */
export function useSessionWatch(): SessionWatchResult {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const isCheckingRef = useRef(false);

  useEffect(() => {
    async function checkSession() {
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;

      try {
        const res = await fetch("/api/session-check", {
          cache: "no-store",
        });
        const data = await res.json();

        if (data.revoked) {
          showToast("انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.", "warning");

          // Small delay so the user sees the toast before redirect
          setTimeout(async () => {
            const supabase = createClient();
            await supabase.auth.signOut({ scope: "local" });
            router.push("/login");
          }, 3500);
        }
      } catch {
        // Silent fail — next poll will retry
      } finally {
        isCheckingRef.current = false;
      }
    }

    // Initial check
    checkSession();

    const intervalId = setInterval(checkSession, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [router, showToast]);

  return { toast, hideToast };
}
