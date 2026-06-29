import prisma from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { formatNumber } from "@/lib/format-utils";

interface AppointmentFilter {
  doctorId?: string;
}

export const DashboardService = {
  async getStats(doctorId?: string) {
    const tenantId = await getTenantId();
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const appointmentWhere: Record<string, unknown> = {
      tenantId,
      startTime: { gte: todayStart, lte: todayEnd },
    };
    if (doctorId) appointmentWhere.doctorId = doctorId;

    const [totalPatients, todayAppointments, newPatients] = await Promise.all([
      prisma.patient.count({ where: { tenantId } }),
      prisma.appointment.count({ where: appointmentWhere }),
      prisma.patient.count({
        where: {
          tenantId,
          createdAt: { gte: todayStart },
        },
      }),
    ]);

    return [
      { title: "إجمالي المرضى", value: formatNumber(totalPatients), trend: 0 },
      { title: "مواعيد اليوم", value: todayAppointments.toString(), trend: 0 },
      { title: "المرضى الجدد", value: newPatients.toString(), trend: 0 },
    ];
  },

  async getUpcomingAppointments(filter?: AppointmentFilter) {
    const tenantId = await getTenantId();
    const where: Record<string, unknown> = {
      tenantId,
      startTime: { gte: new Date() },
    };
    if (filter?.doctorId) where.doctorId = filter.doctorId;

    return await prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
        service: true,
      },
      orderBy: { startTime: "asc" },
      take: 5,
    });
  },

  async getLastSixMonthsAppointments(doctorId?: string) {
    const tenantId = await getTenantId();
    const months: { label: string; count: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setDate(1); // Set to the first day of the month
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const label = date.toLocaleDateString("ar-SA", { month: "short" });
      const where: Record<string, unknown> = {
        tenantId,
        startTime: { gte: start, lte: end },
      };
      if (doctorId) where.doctorId = doctorId;

      const count = await prisma.appointment.count({ where });
      months.push({ label, count });
    }

    return months;
  },
};
