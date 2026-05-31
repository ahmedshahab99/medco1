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

  // If user is a SalesRep (مندوب), redirect them to their portal
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email) {
    const salesRep = await prisma.salesRep.findUnique({ where: { email: user.email } });
    if (salesRep) redirect("/salesrep");
  }

  const jwtClaims = decodeJwtClaims(session.access_token);
  if (!jwtClaims?.tenant_id) redirect("/setup");

  return <DashboardShell>{children}</DashboardShell>;
}
