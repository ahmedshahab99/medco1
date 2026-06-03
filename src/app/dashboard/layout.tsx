import React from "react";
import DashboardShell from "./DashboardShell";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

function decodeJwtClaims(accessToken: string | undefined): { tenant_id: string | null } | null {
  if (!accessToken) return null;
  try {
    const jwtParts = accessToken.split(".");
    if (jwtParts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(jwtParts[1], "base64").toString("utf-8"));
    return { tenant_id: payload.tenant_id ?? null };
  } catch { return null; }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) redirect("/signup");

  const jwtClaims = decodeJwtClaims(session.access_token);
  if (jwtClaims?.tenant_id) return <DashboardShell>{children}</DashboardShell>;

  // JWT doesn't have tenant_id — check database as fallback
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email) {
    const profile = await prisma.profile.findUnique({ where: { email: user.email } });
    if (profile?.tenantId) {
      // Update profile ID to match current auth user, then refresh session
      if (profile.id !== user.id) {
        try { await prisma.profile.update({ where: { id: profile.id }, data: { id: user.id } }); } catch {}
      }
      await supabase.auth.refreshSession();
      return <DashboardShell>{children}</DashboardShell>;
    }
  }

  redirect("/setup");
}
