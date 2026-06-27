import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import type { AppointmentStatus } from "@/lib/types/appointments";

const monthNames = [
  "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.profile.findUnique({ where: { id: user.id, deletedAt: null } });
  if (!actor?.tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = actor.tenantId;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const yearParam = searchParams.get("year");

  const now = new Date();
  const year = yearParam ? parseInt(yearParam) : now.getFullYear();

  let start: Date;
  let end: Date;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  const dateFilter = { gte: start, lte: end };

  const [appointments, byDoctorRaw] = await Promise.all([
    prisma.appointment.findMany({
      where: { tenantId, startTime: dateFilter },
      orderBy: { startTime: "desc" },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, gender: true } },
        doctor: { select: { id: true, firstName: true, lastName: true } },
        service: { select: { name: true } },
      },
    }),
    prisma.appointment.groupBy({
      by: ["doctorId"],
      where: { tenantId, startTime: dateFilter },
      _count: { _all: true },
    }),
  ]);

  const totalAppointments = appointments.length;
  const completed = appointments.filter((a) => a.status === "COMPLETED").length;
  const cancelledNoShow = appointments.filter(
    (a) => a.status === "CANCELLED" || a.status === "NO_SHOW"
  ).length;

  const newPatients = await prisma.patient.count({
    where: { tenantId, createdAt: dateFilter },
  });

  // Status breakdown
  const statusMap = new Map<AppointmentStatus, number>();
  for (const a of appointments) {
    statusMap.set(a.status, (statusMap.get(a.status) ?? 0) + 1);
  }
  const statusBreakdown = Array.from(statusMap.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  // Gender breakdown of patients seen in period (per-appointment count)
  const genderMap = new Map<string, number>();
  for (const a of appointments) {
    const g = a.patient?.gender ?? "UNKNOWN";
    genderMap.set(g, (genderMap.get(g) ?? 0) + 1);
  }
  const genderBreakdown = Array.from(genderMap.entries())
    .map(([gender, count]) => ({ gender, count }))
    .sort((a, b) => b.count - a.count);

  // By doctor
  const doctorIds = byDoctorRaw.map((d) => d.doctorId);
  const doctors = doctorIds.length > 0
    ? await prisma.profile.findMany({
        where: { id: { in: doctorIds } },
        select: { id: true, firstName: true, lastName: true },
      })
    : [];

  const doctorNameMap = new Map<string, string>();
  for (const d of doctors) {
    doctorNameMap.set(
      d.id,
      `${d.firstName || ""} ${d.lastName || ""}`.trim() || d.id.slice(0, 8)
    );
  }

  const completedByDoctorMap = new Map<string, number>();
  for (const a of appointments) {
    if (a.status === "COMPLETED") {
      completedByDoctorMap.set(a.doctorId, (completedByDoctorMap.get(a.doctorId) ?? 0) + 1);
    }
  }

  const byDoctor = byDoctorRaw
    .map((d) => ({
      doctorId: d.doctorId,
      doctorName: doctorNameMap.get(d.doctorId) ?? d.doctorId.slice(0, 8),
      totalAppointments: d._count._all,
      completedCount: completedByDoctorMap.get(d.doctorId) ?? 0,
    }))
    .sort((a, b) => b.totalAppointments - a.totalAppointments);

  // Monthly trend (12 months of selected year)
  const monthlyTrend: Array<{
    month: number;
    label: string;
    appointments: number;
    completed: number;
    newPatients: number;
  }> = [];
  for (let m = 1; m <= 12; m++) {
    const mStart = new Date(year, m - 1, 1);
    const mEnd = new Date(year, m, 0, 23, 59, 59, 999);

    const [apptAgg, completedAgg, newPatiAgg] = await Promise.all([
      prisma.appointment.count({
        where: { tenantId, startTime: { gte: mStart, lte: mEnd } },
      }),
      prisma.appointment.count({
        where: { tenantId, status: "COMPLETED", startTime: { gte: mStart, lte: mEnd } },
      }),
      prisma.patient.count({
        where: { tenantId, createdAt: { gte: mStart, lte: mEnd } },
      }),
    ]);

    monthlyTrend.push({
      month: m,
      label: monthNames[m - 1],
      appointments: apptAgg,
      completed: completedAgg,
      newPatients: newPatiAgg,
    });
  }

  const serializedAppointments = appointments.map((a) => ({
    id: a.id,
    status: a.status,
    startTime: a.startTime.toISOString(),
    endTime: a.endTime.toISOString(),
    patient: a.patient
      ? {
          id: a.patient.id,
          name: `${a.patient.firstName} ${a.patient.lastName}`,
        }
      : null,
    doctor: a.doctor
      ? {
          id: a.doctor.id,
          name:
            `${a.doctor.firstName || ""} ${a.doctor.lastName || ""}`.trim() ||
            a.doctor.id.slice(0, 8),
        }
      : null,
    service: a.service ? { name: a.service.name } : null,
  }));

  return NextResponse.json({
    summary: { totalAppointments, completed, cancelledNoShow, newPatients },
    appointments: serializedAppointments,
    byDoctor,
    statusBreakdown,
    genderBreakdown,
    monthlyTrend,
  });
}
