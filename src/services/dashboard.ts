import prisma from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";

export const DashboardService = {
  async getStats() {
    const tenantId = await getTenantId();
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const [totalPatients, todayAppointments, newPatients] = await Promise.all([
      prisma.patient.count({ where: { tenantId } }),
      prisma.appointment.count({
        where: {
          tenantId,
          startTime: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      prisma.patient.count({
        where: {
          tenantId,
          createdAt: {
            gte: todayStart,
          },
        },
      }),
    ]);

    return [
      { title: "إجمالي المرضى", value: totalPatients.toLocaleString(), trend: 0 },
      { title: "مواعيد اليوم", value: todayAppointments.toString(), trend: 0 },
      { title: "المرضى الجدد", value: newPatients.toString(), trend: 0 },
      { title: "إيرادات اليوم", value: "٠ ر.س", trend: 0 }, // Revenue needs billing model
    ];
  },

  async getUpcomingAppointments() {
    const tenantId = await getTenantId();
    return await prisma.appointment.findMany({
      where: {
        tenantId,
        startTime: {
          gte: new Date(),
        },
      },
      include: {
        patient: true,
        doctor: true,
        service: true,
      },
      orderBy: {
        startTime: "asc",
      },
      take: 5,
    });
  }
};
