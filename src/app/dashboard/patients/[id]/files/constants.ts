export const PATIENT_FILE_BUCKET = "Patient files";
export const PATIENT_FILE_WRITE_ROLES = ["ADMIN", "DOCTOR", "RECEPTIONIST"] as const;
export const SIGNED_URL_TTL_SECONDS = 60;

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export interface PatientFileRow {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  hash: string;
  storagePath: string;
  visitNoteIds: string[];
  uploadedByName: string | null;
  createdAt: string;
}
