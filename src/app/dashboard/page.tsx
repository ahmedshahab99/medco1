import React from "react";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { DashboardService } from "@/services/dashboard";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/tenant";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const userId = await getUserId();
  let profile = await prisma.profile.findUnique({
    where: { id: userId },
  });

  // If no profile by ID, try to find by email (handles Google OAuth with existing email)
  if (!profile) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      profile = await prisma.profile.findUnique({ where: { email: user.email } });
      if (profile) {
        // Update profile ID to match current auth user
        await prisma.profile.update({
          where: { id: profile.id },
          data: { id: userId },
        }).catch(() => {
          // If FK constraint fails, keep old ID — lookup by email next time
        });
      }
    }
  }

  const statsData = await DashboardService.getStats();
  const upcomingData = await DashboardService.getUpcomingAppointments();
  
  const stats = statsData.map((s) => ({
    title: s.title,
    value: s.value,
    trend: s.trend,
  }));

  const appointments = upcomingData.map(app => ({
    id: app.id,
    patientId: app.patientId,
    patientName: `${app.patient.firstName} ${app.patient.lastName}`,
    date: app.startTime.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' }),
    time: app.startTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    type: "consultation" as const,
    status: (app.status || "SCHEDULED").toUpperCase() as "SCHEDULED" | "CONFIRMED" | "ARRIVED" | "COMPLETED" | "CANCELLED" | "NO_SHOW",
    doctor: app.doctor?.firstName ? `د. ${app.doctor.firstName}` : "",
    serviceName: app.service?.name ?? "",
  }));

  const profileName = profile?.firstName ? `د. ${profile.firstName}` : "دكتور";

  return (
    <DashboardClient
      profileName={profileName}
      stats={stats}
      initAppointments={appointments}
    />
  );
}
