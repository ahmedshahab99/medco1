import React from "react";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { DashboardService } from "@/services/dashboard";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/tenant";
import { createClient } from "@/utils/supabase/server";
import type { UserRole } from "@/lib/types/auth";

export default async function DashboardPage() {
  const userId = await getUserId();
  let profile = await prisma.profile.findUnique({
    where: { id: userId, deletedAt: null },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });

  if (!profile) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      profile = await prisma.profile.findUnique({
        where: { email: user.email, deletedAt: null },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
      });
      if (profile) {
        await prisma.profile.update({
          where: { id: profile.id },
          data: { id: userId },
        }).catch(() => {});
      }
    }
  }

  const role: UserRole = profile?.role ?? "DOCTOR";
  const doctorId = role === "DOCTOR" ? userId : undefined;

  const [statsData, upcomingData, monthlyAppointments] = await Promise.all([
    DashboardService.getStats(doctorId),
    DashboardService.getUpcomingAppointments(doctorId ? { doctorId } : undefined),
    DashboardService.getLastSixMonthsAppointments(doctorId),
  ]);

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
    status: (app.status || "SCHEDULED").toUpperCase() as "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW",
    doctor: app.doctor?.firstName ? `د. ${app.doctor.firstName}` : "",
    serviceName: app.service?.name ?? "",
  }));

  const isDoctorRole = role === "DOCTOR" || role === "ADMIN";
  const profileName = profile?.firstName
    ? (isDoctorRole ? `د. ${profile.firstName}` : profile.firstName)
    : (isDoctorRole ? "دكتور" : "مستخدم");
  const requireProfileName: boolean = !profile?.firstName;

  return (
    <DashboardClient
      profileName={profileName}
      role={role}
      doctorId={doctorId ?? null}
      stats={stats}
      initAppointments={appointments}
      monthlyAppointments={monthlyAppointments}
      requireProfileName={requireProfileName}
    />
  );
}
