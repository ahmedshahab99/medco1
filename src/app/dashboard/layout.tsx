import React from "react";
import DashboardShell from "./DashboardShell";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import type { AuthProfile } from "@/lib/types/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  if (!user) {
    redirect("/login");
  }
  console.log("Authenticated user:", session?.user.app_metadata.user_role);

  // Fetch profile with role for RBAC-aware rendering
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      tenantId: true,
    },
  });


  if (!profile || !profile.tenantId) {
    redirect("/setup");
  }

  return <DashboardShell userProfile={profile as AuthProfile}>{children}</DashboardShell>;
}

