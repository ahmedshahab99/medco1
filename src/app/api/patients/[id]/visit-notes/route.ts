import { NextRequest, NextResponse } from "next/server";
import { getTenantId, getUserId } from "@/lib/tenant";
import prisma from "@/lib/prisma";
import { visitNoteCreateSchema } from "@/lib/schemas/visit-note";

/**
 * GET /api/patients/[id]/visit-notes
 * Fetch all visit notes for a patient
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

    const rows = await prisma.$queryRaw`
      SELECT * FROM "VisitNote"
      WHERE "patientId" = ${patientId} AND "tenantId" = ${tenantId}
      ORDER BY "createdAt" DESC
    `;
    const medRows = await prisma.$queryRaw`
      SELECT * FROM "Medication"
      WHERE "visitNoteId" IN (SELECT id FROM "VisitNote" WHERE "patientId" = ${patientId} AND "tenantId" = ${tenantId})
      ORDER BY name ASC
    `;
    const medsByNote = new Map<string, any[]>();
    for (const m of medRows as any[]) {
      const list = medsByNote.get(m.visitNoteId) ?? [];
      list.push(m);
      medsByNote.set(m.visitNoteId, list);
    }
    const visitNotes = (rows as any[]).map((r: any) => ({
      ...r,
      medications: medsByNote.get(r.id) ?? [],
    }));

    return NextResponse.json(visitNotes);
  } catch (error) {
    console.error("Error fetching visit notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch visit notes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/patients/[id]/visit-notes
 * Create a new visit note for a patient
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

    const validationResult = visitNoteCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { appointmentId, content, diagnosis, medications, notes, validityDays } =
      validationResult.data;

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

    const noteId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "VisitNote" (id, "tenantId", "patientId", "appointmentId", content, diagnosis, notes, "validityDays", "createdAt", "updatedAt")
      VALUES (${noteId}, ${tenantId}, ${patientId}, ${appointmentId ?? null}, ${content ?? null}, ${diagnosis ?? null}, ${notes ?? null}, ${validityDays ?? 30}, NOW(), NOW())
    `;

    for (const med of medications) {
      await prisma.$executeRaw`
        INSERT INTO "Medication" (id, "visitNoteId", name, dose, frequency, duration, instructions)
        VALUES (${crypto.randomUUID()}, ${noteId}, ${med.name}, ${med.dose}, ${med.frequency}, ${med.duration}, ${med.instructions ?? null})
      `;
    }

    const visitNote = await prisma.$queryRaw`
      SELECT * FROM "VisitNote" WHERE id = ${noteId}
    `;
    const noteMeds = await prisma.$queryRaw`
      SELECT * FROM "Medication" WHERE "visitNoteId" = ${noteId}
      ORDER BY name ASC
    `;

    return NextResponse.json(
      { ...(visitNote as any[])[0], medications: noteMeds },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating visit note:", error);
    return NextResponse.json(
      { error: "فشل إنشاء ملاحظة الزيارة" },
      { status: 500 }
    );
  }
}
