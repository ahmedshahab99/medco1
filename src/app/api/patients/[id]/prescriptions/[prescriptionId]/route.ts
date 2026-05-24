import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/tenant";
import prisma from "@/lib/prisma";

async function verifyPrescriptionAccess(tenantId: string, patientId: string, prescriptionId: string) {
  const rows = await prisma.$queryRaw`
    SELECT "tenantId", "patientId" FROM "Prescription" WHERE id = ${prescriptionId}
  `;
  const rx = (rows as any[])[0];
  if (!rx || rx.tenantId !== tenantId || rx.patientId !== patientId) {
    return null;
  }
  return rx;
}

/**
 * PUT /api/patients/[id]/prescriptions/[prescriptionId]
 * Update a prescription
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; prescriptionId: string }> }
) {
  try {
    const tenantId = await getTenantId();
    const { id: patientId, prescriptionId } = await params;

    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rx = await verifyPrescriptionAccess(tenantId, patientId, prescriptionId);
    if (!rx) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    const body = await request.json();
    const { diagnosis, medications, notes, validityDays } = body;

    if (medications) {
      await prisma.$executeRaw`DELETE FROM "PrescriptionMedication" WHERE "prescriptionId" = ${prescriptionId}`;
      for (const med of medications) {
        await prisma.$executeRaw`
          INSERT INTO "PrescriptionMedication" (id, "prescriptionId", name, dose, frequency, duration, instructions)
          VALUES (${crypto.randomUUID()}, ${prescriptionId}, ${med.name}, ${med.dose}, ${med.frequency}, ${med.duration}, ${med.instructions ?? null})
        `;
      }
    }

    // Update prescription fields
    await prisma.$executeRaw`
      UPDATE "Prescription" SET
        "diagnosis" = ${diagnosis},
        "notes" = ${notes ?? null},
        "validityDays" = ${validityDays ?? null},
        "updatedAt" = NOW()
      WHERE id = ${prescriptionId}
    `;

    // Return updated
    const updatedRx = await prisma.$queryRaw`SELECT * FROM "Prescription" WHERE id = ${prescriptionId}`;
    const updatedMeds = await prisma.$queryRaw`
      SELECT * FROM "PrescriptionMedication" WHERE "prescriptionId" = ${prescriptionId} ORDER BY name ASC
    `;

    return NextResponse.json({ ...(updatedRx as any[])[0], medications: updatedMeds });
  } catch (error) {
    console.error("Error updating prescription:", error);
    return NextResponse.json(
      { error: "Failed to update prescription" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/patients/[id]/prescriptions/[prescriptionId]
 * Delete a prescription
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; prescriptionId: string }> }
) {
  try {
    const tenantId = await getTenantId();
    const { id: patientId, prescriptionId } = await params;

    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rx = await verifyPrescriptionAccess(tenantId, patientId, prescriptionId);
    if (!rx) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    // Cascade delete (medications first, then prescription)
    await prisma.$executeRaw`DELETE FROM "PrescriptionMedication" WHERE "prescriptionId" = ${prescriptionId}`;
    await prisma.$executeRaw`DELETE FROM "Prescription" WHERE id = ${prescriptionId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prescription:", error);
    return NextResponse.json(
      { error: "Failed to delete prescription" },
      { status: 500 }
    );
  }
}
