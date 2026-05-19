import prisma from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { Patient, PatientStatus, PatientGender } from "@/lib/types/dashboard";

/**
 * Service to handle patient data with strict tenant isolation.
 */
export const PatientService = {
  /**
   * Fetches all patients for the current tenant.
   */
  async getPatients() {
    const tenantId = await getTenantId();
    
    const patients = await prisma.patient.findMany({
      where: {
        tenantId: tenantId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        appointments: {
          orderBy: {
            startTime: 'asc',
          },
          take: 1,
          where: {
            startTime: {
              gte: new Date(),
            }
          }
        },
      }
    });

    // Map Prisma models to the UI Patient type
    return patients.map(p => ({
      id: p.id,
      name: `${p.firstName} ${p.lastName}`,
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email || undefined,
      phone: p.phone || "",
      dateOfBirth: p.dateOfBirth?.toISOString(),
      gender: (p.gender?.toLowerCase() as PatientGender) || undefined,
      status: (p.status as PatientStatus) || "active",
      tags: [], // Tags might need a separate model or JSON field
      totalVisits: 0, // Should be calculated
      visitHistory: [],
      notes: [],
      files: [],
      communications: [],
      nextAppointment: p.appointments[0]?.startTime.toISOString(),
    } as Patient));
  },

  /**
   * Fetches a single patient by ID, ensuring they belong to the current tenant.
   */
  async getPatientById(id: string) {
    const tenantId = await getTenantId();

    const patient = await prisma.patient.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        appointments: {
          orderBy: { startTime: 'desc' }
        },
        medicalNotes: {
          orderBy: { createdAt: 'desc' }
        },
        patientFiles: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!patient) return null;

    // Map to UI Patient type
    return {
      id: patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email || undefined,
      phone: patient.phone || "",
      status: (patient.status as PatientStatus) || "active",
      tags: [],
      totalVisits: patient.appointments.length,
      visitHistory: patient.appointments.map(app => ({
        id: app.id,
        date: app.startTime.toISOString(),
        time: app.startTime.toLocaleTimeString(),
        service: "استشارة", // Could be in DB
        doctor: "دكتور",
        status: app.status.toLowerCase() as any,
      })),
      notes: patient.medicalNotes.map(note => ({
        id: note.id,
        appointmentId: note.appointmentId,
        content: note.content,
        createdAt: note.createdAt.toISOString(),
        doctorName: "دكتور",
      })),
      files: patient.patientFiles.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type as any,
        size: Number(file.size),
        date: file.createdAt.toISOString(),
        url: file.url,
      })),
      communications: [],
    } as Patient;
  },

  /**
   * Creates a new patient for the current tenant.
   */
  async createPatient(data: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    gender?: PatientGender;
    dateOfBirth?: Date;
  }) {
    const tenantId = await getTenantId();
    
    return await prisma.patient.create({
      data: {
        ...data,
        tenantId,
        gender: data.gender ? (data.gender.toUpperCase() as any) : undefined,
      },
    });
  }
};
