import React from "react";
import { StatCard } from "../../components/dashboard/widgets/StatCard";
import { UpcomingAppointments } from "../../components/dashboard/widgets/UpcomingAppointments";
import { RevenueChart } from "../../components/dashboard/widgets/RevenueChart";
import { StatCardData } from "../../lib/types/dashboard";
import { Users, CalendarCheck, TrendingUp, DollarSign } from "lucide-react";

const stats: StatCardData[] = [
  { title: "إجمالي المرضى", value: "1,248", trend: 12, icon: Users },
  { title: "مواعيد اليوم", value: "24", trend: 5, icon: CalendarCheck },
  { title: "المرضى الجدد", value: "15", trend: -2, icon: TrendingUp },
  { title: "إيرادات اليوم", value: "٤,٥٠٠ ر.س", trend: 8, icon: DollarSign },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">مرحباً، د. أحمد 👋</h1>
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
        <UpcomingAppointments />
        <div className="col-span-1">
          <RevenueChart />
        </div>
      </div>
    </div>
  );
}
