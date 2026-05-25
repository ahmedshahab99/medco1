import { NextRequest, NextResponse } from "next/server";
import { getTenantId, getUserId } from "@/lib/tenant";
import prisma from "@/lib/prisma";
import { prescriptionCreateSchema } from "@/lib/schemas/prescription";

/**
 * GET /api/patients/[id]/prescriptions
 * Fetch all prescriptions for a patient
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantId();
    const userId = await getUserId();
    const { id: patientId } = await params;

    if (!tenantId || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify patient belongs to tenant
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { tenantId: true },
    });

    if (!patient || patient.tenantId !== tenantId) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Fetch prescriptions with medications
    const rows = await prisma.$queryRaw`
      SELECT * FROM "Prescription"
      WHERE "patientId" = ${patientId} AND "tenantId" = ${tenantId}
      ORDER BY "createdAt" DESC
    `;
    const medRows = await prisma.$queryRaw`
      SELECT * FROM "PrescriptionMedication"
      WHERE "prescriptionId" IN (SELECT id FROM "Prescription" WHERE "patientId" = ${patientId} AND "tenantId" = ${tenantId})
      ORDER BY name ASC
    `;
    const medsByRx = new Map<string, any[]>();
    for (const m of medRows as any[]) {
      const list = medsByRx.get(m.prescriptionId) ?? [];
      list.push(m);
      medsByRx.set(m.prescriptionId, list);
    }
    const prescriptions = (rows as any[]).map((r: any) => ({
      ...r,
      medications: medsByRx.get(r.id) ?? [],
    }));

    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/patients/[id]/prescriptions
 * Create a new prescription for a patient
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantId();
    const userId = await getUserId();
    const { id: patientId } = await params;

    if (!tenantId || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const profile = await prisma.profile.findUnique({ where: { id: userId } });
    if (!profile || (profile.role !== "ADMIN" && profile.role !== "DOCTOR")) {
      return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
    }

    const body = await request.json();

    // Validate input
    const validationResult = prescriptionCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { diagnosis, medications, notes, validityDays } = validationResult.data;

    // Verify patient exists and belongs to tenant
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { tenantId: true, id: true },
    });

    if (!patient || patient.tenantId !== tenantId) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Create prescription via raw SQL (bypasses model accessor issue)
    const rxId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "Prescription" (id, "tenantId", "patientId", diagnosis, notes, "validityDays", "createdAt", "updatedAt")
      VALUES (${rxId}, ${tenantId}, ${patientId}, ${diagnosis}, ${notes ?? null}, ${validityDays ?? 30}, NOW(), NOW())
    `;

    // Insert medications
    for (const med of medications) {
      await prisma.$executeRaw`
        INSERT INTO "PrescriptionMedication" (id, "prescriptionId", name, dose, frequency, duration, instructions)
        VALUES (${crypto.randomUUID()}, ${rxId}, ${med.name}, ${med.dose}, ${med.frequency}, ${med.duration}, ${med.instructions ?? null})
      `;
    }

    // Fetch the created prescription with medications
    const prescription = await prisma.$queryRaw`
      SELECT * FROM "Prescription" WHERE id = ${rxId}
    `;
    const prescriptionMeds = await prisma.$queryRaw`
      SELECT * FROM "PrescriptionMedication" WHERE "prescriptionId" = ${rxId}
      ORDER BY name ASC
    `;

    return NextResponse.json(
      { ...(prescription as any[])[0], medications: prescriptionMeds },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating prescription:", error);
    return NextResponse.json(
      { error: "فشل إنشاء الوصفة الطبية" },
      { status: 500 }
    );
  }
}
