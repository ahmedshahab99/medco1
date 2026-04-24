import React from "react";
import DashboardShell from "./DashboardShell";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

function decodeJwtClaims(accessToken: string | undefined): { tenant_id: string | null } | null {
  if (!accessToken) return null;
  try {
    const jwtParts = accessToken.split(".");
    if (jwtParts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(jwtParts[1], "base64").toString("utf-8"));
    return {
      tenant_id: payload.tenant_id ?? null,
    };
  } catch {
    return null;
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) redirect("/login");

  const jwtClaims = decodeJwtClaims(session.access_token);
  if (!jwtClaims?.tenant_id) redirect("/setup");

  return <DashboardShell>{children}</DashboardShell>;
}
