import prisma from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";

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
    
    return await prisma.appointment.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }
};
