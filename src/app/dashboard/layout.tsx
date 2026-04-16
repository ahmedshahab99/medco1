import React from "react";
import DashboardShell from "./DashboardShell";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if profile exists and has tenant
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { tenantId: true },
  });

  if (!profile || !profile.tenantId) {
    redirect("/setup");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
