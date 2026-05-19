import React from "react";
import { StatCard } from "../../components/dashboard/widgets/StatCard";
import { UpcomingAppointments } from "../../components/dashboard/widgets/UpcomingAppointments";
import { RevenueChart } from "../../components/dashboard/widgets/RevenueChart";
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
    patientName: `${app.patient.firstName} ${app.patient.lastName}`,
    date: app.startTime.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' }),
    time: app.startTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    type: "consultation" as const,
    status: (app.status || "SCHEDULED").toUpperCase() as "SCHEDULED" | "CONFIRMED" | "ARRIVED" | "COMPLETED" | "CANCELLED" | "NO_SHOW",
    doctor: profile?.firstName || "",
  }));

  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          مرحباً، {profile?.firstName ? `د. ${profile.firstName}` : "دكتور"} 👋
        </h1>
        <p className="text-slate-500 mt-1 font-medium">إليك نظرة سريعة على أداء عيادتك اليوم.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} data={stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        <UpcomingAppointments appointments={appointments} />
        <div className="col-span-1">
          <RevenueChart />
        </div>
      </div>
    </div>
  );
}


