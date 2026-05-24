import React from "react";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { Users, CalendarCheck, TrendingUp, DollarSign } from "lucide-react";
import { DashboardService } from "@/services/dashboard";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/tenant";

export default async function DashboardPage() {
  const userId = await getUserId();
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
  });

  const statsData = await DashboardService.getStats();
  const upcomingData = await DashboardService.getUpcomingAppointments();
  
  const icons = [Users, CalendarCheck, TrendingUp, DollarSign];
  const stats = statsData.map((s, i) => ({
    ...s,
    icon: icons[i],
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
