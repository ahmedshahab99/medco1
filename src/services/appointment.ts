import prisma from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { enforceAppointmentQuota } from "@/lib/plans/enforce";
import { incrementAppointments } from "@/lib/plans/usage";

export const AppointmentService = {
  async getAppointments(start: Date, end: Date) {
    const tenantId = await getTenantId();
    
    return await prisma.appointment.findMany({
      where: {
        tenantId,
        startTime: {
          gte: start,
          lte: end,
        },
      },
      include: {
        patient: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });
  },

  async createAppointment(data: {
    patientId: string;
    doctorId: string;
    serviceId: string;
    startTime: Date;
    endTime: Date;
    status?: any;
    notes?: string;
  }) {
    const tenantId = await getTenantId();

    const guard = await enforceAppointmentQuota(tenantId);
    if (!guard.allowed) {
      throw new Error(guard.reason ?? "appointment quota reached");
    }

    const appointment = await prisma.appointment.create({
      data: {
        ...data,
        tenantId,
      },
    });

    await incrementAppointments(tenantId);
    return appointment;
  }
};
