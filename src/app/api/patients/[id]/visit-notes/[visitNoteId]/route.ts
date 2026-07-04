import { NextRequest, NextResponse } from "next/server";
import { getTenantId } from "@/lib/tenant";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

async function verifyVisitNoteAccess(tenantId: string, patientId: string, visitNoteId: string) {
  const rows = await prisma.$queryRaw`
    SELECT "tenantId", "patientId" FROM "VisitNote" WHERE id = ${visitNoteId}
  `;
  const note = (rows as any[])[0];
  if (!note || note.tenantId !== tenantId || note.patientId !== patientId) {
    return null;
  }
  return note;
}

/**
 * PUT /api/patients/[id]/visit-notes/[visitNoteId]
 * Update a visit note
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; visitNoteId: string }> }
) {
  try {
    const tenantId = await getTenantId();
    const { id: patientId, visitNoteId } = await params;

    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    const profile = await prisma.profile.findUnique({ where: { id: user.id, deletedAt: null } });
    if (!profile || (profile.role !== "ADMIN" && profile.role !== "DOCTOR")) {
      return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
    }

    const note = await verifyVisitNoteAccess(tenantId, patientId, visitNoteId);
    if (!note) {
      return NextResponse.json({ error: "Visit note not found" }, { status: 404 });
    }

    const body = await request.json();
    const { appointmentId, content, diagnosis, medications, notes, validityDays } = body;

    if (medications) {
      await prisma.$executeRaw`DELETE FROM "Medication" WHERE "visitNoteId" = ${visitNoteId}`;
      for (const med of medications) {
        await prisma.$executeRaw`
          INSERT INTO "Medication" (id, "visitNoteId", name, dose, frequency, duration, instructions)
          VALUES (${crypto.randomUUID()}, ${visitNoteId}, ${med.name}, ${med.dose || null}, ${med.frequency || null}, ${med.duration || null}, ${med.instructions || null})
        `;
      }
    }

    await prisma.$executeRaw`
      UPDATE "VisitNote" SET
        "appointmentId" = ${appointmentId ?? null},
        "content" = ${content ?? null},
        "diagnosis" = ${diagnosis ?? null},
        "notes" = ${notes ?? null},
        "validityDays" = ${validityDays ?? null},
        "updatedAt" = NOW()
      WHERE id = ${visitNoteId}
    `;

    const updatedNote = await prisma.$queryRaw`SELECT * FROM "VisitNote" WHERE id = ${visitNoteId}`;
    const updatedMeds = await prisma.$queryRaw`
      SELECT * FROM "Medication" WHERE "visitNoteId" = ${visitNoteId} ORDER BY name ASC
    `;

    return NextResponse.json({ ...(updatedNote as any[])[0], medications: updatedMeds });
  } catch (error) {
    console.error("Error updating visit note:", error);
    return NextResponse.json(
      { error: "Failed to update visit note" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/patients/[id]/visit-notes/[visitNoteId]
 * Delete a visit note
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; visitNoteId: string }> }
) {
  try {
    const tenantId = await getTenantId();
    const { id: patientId, visitNoteId } = await params;

    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    const profile = await prisma.profile.findUnique({ where: { id: user.id, deletedAt: null } });
    if (!profile || (profile.role !== "ADMIN" && profile.role !== "DOCTOR")) {
      return NextResponse.json({ error: "ليس لديك صلاحية" }, { status: 403 });
    }

    const note = await verifyVisitNoteAccess(tenantId, patientId, visitNoteId);
    if (!note) {
      return NextResponse.json({ error: "Visit note not found" }, { status: 404 });
    }

    await prisma.$executeRaw`DELETE FROM "Medication" WHERE "visitNoteId" = ${visitNoteId}`;
    await prisma.$executeRaw`DELETE FROM "VisitNote" WHERE id = ${visitNoteId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting visit note:", error);
    return NextResponse.json(
      { error: "Failed to delete visit note" },
      { status: 500 }
    );
  }
}
