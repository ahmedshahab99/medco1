"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { serviceRoleClient } from "@/utils/supabase/service-role";
import { assertFeature } from "@/lib/plans/enforce";
import {
  PATIENT_FILE_BUCKET,
  PATIENT_FILE_WRITE_ROLES,
  SIGNED_URL_TTL_SECONDS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  type PatientFileRow,
} from "./constants";

type ActionResult<T = void> =
  | (T extends void ? { success: true } : { success: true; data: T })
  | { success: false; error: string };

async function getAuthorizedActor(): Promise<
  { tenantId: string; role: string; userId: string } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  const actor = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!actor || !actor.tenantId) return { error: "غير مصرح" };

  return { tenantId: actor.tenantId, role: actor.role, userId: actor.id };
}

function canWritePatientFiles(role: string): boolean {
  return (PATIENT_FILE_WRITE_ROLES as readonly string[]).includes(role);
}

function sha256Hex(buffer: Buffer | Uint8Array): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function getExtension(fileName: string, mimeType: string): string {
  const fromName = fileName.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{1,8}$/.test(fromName)) return fromName;
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "application/msword") return "doc";
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }
  return "bin";
}

function sanitizeName(name: string): string {
  return name
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function mapFileRow(
  file: {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    hash: string;
    storagePath: string;
    createdAt: Date;
    uploadedBy: {
      firstName: string | null;
      lastName: string | null;
      email: string;
    } | null;
    visitNoteLinks: { visitNoteId: string }[];
  }
): PatientFileRow {
  const uploader = file.uploadedBy;
  let uploaderName: string | null = null;
  if (uploader) {
    const full = `${uploader.firstName ?? ""} ${uploader.lastName ?? ""}`.trim();
    uploaderName = full || uploader.email;
  }
  return {
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    size: file.size,
    hash: file.hash,
    storagePath: file.storagePath,
    visitNoteIds: file.visitNoteLinks.map((l) => l.visitNoteId),
    uploadedByName: uploaderName,
    createdAt: file.createdAt.toISOString(),
  };
}

export async function listPatientFilesAction(
  patientId: string,
  opts?: { visitNoteId?: string }
): Promise<ActionResult<PatientFileRow[]>> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, tenantId: auth.tenantId },
    select: { id: true },
  });
  if (!patient) return { success: false, error: "المريض غير موجود" };

  const files = await prisma.patientFile.findMany({
    where: {
      tenantId: auth.tenantId,
      patientId,
      ...(opts?.visitNoteId
        ? {
            visitNoteLinks: {
              some: { visitNoteId: opts.visitNoteId },
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: { select: { firstName: true, lastName: true, email: true } },
      visitNoteLinks: { select: { visitNoteId: true } },
    },
  });

  return { success: true, data: files.map(mapFileRow) };
}

export async function listUnattachedPatientFilesAction(
  patientId: string,
  visitNoteId: string
): Promise<ActionResult<PatientFileRow[]>> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, tenantId: auth.tenantId },
    select: { id: true },
  });
  if (!patient) return { success: false, error: "المريض غير موجود" };

  const visitNote = await prisma.visitNote.findFirst({
    where: { id: visitNoteId, tenantId: auth.tenantId, patientId },
    select: { id: true },
  });
  if (!visitNote) return { success: false, error: "ملاحظة الزيارة غير موجودة" };

  const files = await prisma.patientFile.findMany({
    where: {
      tenantId: auth.tenantId,
      patientId,
      NOT: { visitNoteLinks: { some: { visitNoteId } } },
    },
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: { select: { firstName: true, lastName: true, email: true } },
      visitNoteLinks: { select: { visitNoteId: true } },
    },
  });

  return { success: true, data: files.map(mapFileRow) };
}

export async function uploadPatientFileAction(
  patientId: string,
  formData: FormData,
  opts: { visitNoteId?: string } = {}
): Promise<ActionResult<PatientFileRow>> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  if (!canWritePatientFiles(auth.role)) {
    return { success: false, error: "ليس لديك صلاحية لرفع الملفات" };
  }

  const fileFeatureGuard = await assertFeature(auth.tenantId, "patientFiles");
  if (!fileFeatureGuard.allowed) {
    return { success: false, error: fileFeatureGuard.reason! };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "لم يتم اختيار ملف" };
  }

  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return { success: false, error: "نوع الملف غير مدعوم" };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { success: false, error: "حجم الملف يتجاوز الحد المسموح (20 ميجابايت)" };
  }

  if (file.size === 0) {
    return { success: false, error: "الملف فارغ" };
  }

  const displayNameRaw = formData.get("displayName");
  const displayName =
    typeof displayNameRaw === "string" && displayNameRaw.trim().length > 0
      ? sanitizeName(displayNameRaw)
      : sanitizeName(file.name);

  if (!displayName) {
    return { success: false, error: "اسم الملف مطلوب" };
  }

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, tenantId: auth.tenantId },
    select: { id: true },
  });
  if (!patient) return { success: false, error: "المريض غير موجود" };

  if (opts.visitNoteId) {
    const visitNote = await prisma.visitNote.findFirst({
      where: {
        id: opts.visitNoteId,
        tenantId: auth.tenantId,
        patientId,
      },
      select: { id: true },
    });
    if (!visitNote) {
      return { success: false, error: "ملاحظة الزيارة غير موجودة" };
    }
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const hash = sha256Hex(buffer);
  const ext = getExtension(file.name, file.type);
  const storagePath = `${auth.tenantId}/${patientId}/${hash}.${ext}`;

  const { error: uploadError } = await serviceRoleClient.storage
    .from(PATIENT_FILE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return { success: false, error: `فشل رفع الملف: ${uploadError.message}` };
  }

  const fileRow = await prisma.patientFile.create({
    data: {
      tenantId: auth.tenantId,
      patientId,
      name: displayName,
      storagePath,
      hash,
      mimeType: file.type,
      size: file.size,
      uploadedById: auth.userId,
      ...(opts.visitNoteId
        ? {
            visitNoteLinks: {
              create: {
                tenantId: auth.tenantId,
                visitNoteId: opts.visitNoteId,
              },
            },
          }
        : {}),
    },
    include: {
      uploadedBy: { select: { firstName: true, lastName: true, email: true } },
      visitNoteLinks: { select: { visitNoteId: true } },
    },
  });

  revalidatePath(`/dashboard/patients/${patientId}`);
  if (opts.visitNoteId) {
    revalidatePath(
      `/dashboard/patients/${patientId}/visit-notes/${opts.visitNoteId}`
    );
  }

  return { success: true, data: mapFileRow(fileRow) };
}

export async function deletePatientFileAction(
  fileId: string
): Promise<ActionResult> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  if (!canWritePatientFiles(auth.role)) {
    return { success: false, error: "ليس لديك صلاحية لحذف الملفات" };
  }

  const fileFeatureGuard = await assertFeature(auth.tenantId, "patientFiles");
  if (!fileFeatureGuard.allowed) {
    return { success: false, error: fileFeatureGuard.reason! };
  }

  const file = await prisma.patientFile.findFirst({
    where: { id: fileId, tenantId: auth.tenantId },
    select: {
      id: true,
      patientId: true,
      storagePath: true,
      visitNoteLinks: { select: { visitNoteId: true } },
    },
  });
  if (!file) return { success: false, error: "الملف غير موجود" };

  await prisma.patientFile.delete({ where: { id: fileId } });

  const { error: removeError } = await serviceRoleClient.storage
    .from(PATIENT_FILE_BUCKET)
    .remove([file.storagePath]);

  if (removeError) {
    console.error("Storage remove error:", removeError);
  }

  revalidatePath(`/dashboard/patients/${file.patientId}`);
  for (const link of file.visitNoteLinks) {
    revalidatePath(
      `/dashboard/patients/${file.patientId}/visit-notes/${link.visitNoteId}`
    );
  }

  return { success: true };
}

export async function getPatientFileSignedUrlAction(
  fileId: string
): Promise<ActionResult<{ url: string; expiresIn: number }>> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  const file = await prisma.patientFile.findFirst({
    where: { id: fileId, tenantId: auth.tenantId },
    select: { id: true, storagePath: true, name: true },
  });
  if (!file) return { success: false, error: "الملف غير موجود" };

  const { data, error } = await serviceRoleClient.storage
    .from(PATIENT_FILE_BUCKET)
    .createSignedUrl(file.storagePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    return {
      success: false,
      error: error?.message ?? "تعذّر إنشاء رابط التنزيل",
    };
  }

  return {
    success: true,
    data: { url: data.signedUrl, expiresIn: SIGNED_URL_TTL_SECONDS },
  };
}

export async function attachFileToVisitNoteAction(
  visitNoteId: string,
  fileId: string
): Promise<ActionResult> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  if (!canWritePatientFiles(auth.role)) {
    return { success: false, error: "ليس لديك صلاحية لإرفاق الملفات" };
  }

  const fileFeatureGuard = await assertFeature(auth.tenantId, "patientFiles");
  if (!fileFeatureGuard.allowed) {
    return { success: false, error: fileFeatureGuard.reason! };
  }

  const visitNote = await prisma.visitNote.findFirst({
    where: { id: visitNoteId, tenantId: auth.tenantId },
    select: { id: true, patientId: true },
  });
  if (!visitNote) return { success: false, error: "ملاحظة الزيارة غير موجودة" };

  const file = await prisma.patientFile.findFirst({
    where: {
      id: fileId,
      tenantId: auth.tenantId,
      patientId: visitNote.patientId,
    },
    select: { id: true },
  });
  if (!file) {
    return { success: false, error: "الملف غير موجود للمريض" };
  }

  await prisma.visitNoteFile.upsert({
    where: { visitNoteId_fileId: { visitNoteId, fileId } },
    create: {
      tenantId: auth.tenantId,
      visitNoteId,
      fileId,
    },
    update: {},
  });

  revalidatePath(`/dashboard/patients/${visitNote.patientId}`);
  revalidatePath(
    `/dashboard/patients/${visitNote.patientId}/visit-notes/${visitNoteId}`
  );
  return { success: true };
}

export async function detachFileFromVisitNoteAction(
  visitNoteId: string,
  fileId: string
): Promise<ActionResult> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  if (!canWritePatientFiles(auth.role)) {
    return { success: false, error: "ليس لديك صلاحية لإزالة المرفقات" };
  }

  const fileFeatureGuard = await assertFeature(auth.tenantId, "patientFiles");
  if (!fileFeatureGuard.allowed) {
    return { success: false, error: fileFeatureGuard.reason! };
  }

  const visitNote = await prisma.visitNote.findFirst({
    where: { id: visitNoteId, tenantId: auth.tenantId },
    select: { id: true, patientId: true },
  });
  if (!visitNote) return { success: false, error: "ملاحظة الزيارة غير موجودة" };

  await prisma.visitNoteFile.deleteMany({
    where: {
      tenantId: auth.tenantId,
      visitNoteId,
      fileId,
    },
  });

  revalidatePath(`/dashboard/patients/${visitNote.patientId}`);
  revalidatePath(
    `/dashboard/patients/${visitNote.patientId}/visit-notes/${visitNoteId}`
  );
  return { success: true };
}

export async function updatePatientFileNameAction(
  fileId: string,
  name: string
): Promise<ActionResult> {
  const auth = await getAuthorizedActor();
  if ("error" in auth) return { success: false, error: auth.error };

  if (!canWritePatientFiles(auth.role)) {
    return { success: false, error: "ليس لديك صلاحية لتعديل الملفات" };
  }

  const fileFeatureGuard = await assertFeature(auth.tenantId, "patientFiles");
  if (!fileFeatureGuard.allowed) {
    return { success: false, error: fileFeatureGuard.reason! };
  }

  const cleanName = sanitizeName(name);
  if (!cleanName) {
    return { success: false, error: "اسم الملف مطلوب" };
  }

  const file = await prisma.patientFile.findFirst({
    where: { id: fileId, tenantId: auth.tenantId },
    select: {
      id: true,
      patientId: true,
      visitNoteLinks: { select: { visitNoteId: true } },
    },
  });
  if (!file) return { success: false, error: "الملف غير موجود" };

  await prisma.patientFile.update({
    where: { id: fileId },
    data: { name: cleanName },
  });

  revalidatePath(`/dashboard/patients/${file.patientId}`);
  for (const link of file.visitNoteLinks) {
    revalidatePath(
      `/dashboard/patients/${file.patientId}/visit-notes/${link.visitNoteId}`
    );
  }
  return { success: true };
}
