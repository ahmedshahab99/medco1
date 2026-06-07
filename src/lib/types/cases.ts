export type CaseStatus = "ACTIVE" | "INACTIVE";

export const CASE_STATUSES: readonly CaseStatus[] = ["ACTIVE", "INACTIVE"] as const;

export interface PatientCaseRow {
  id: string;
  title: string;
  description: string | null;
  status: CaseStatus;
  appointmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PatientCaseSummary {
  count: number;
  activeCount: number;
}

export interface CaseInput {
  title: string;
  description?: string;
  status?: CaseStatus;
}

export interface ListCasesResult {
  cases: PatientCaseRow[];
  summary: PatientCaseSummary;
}

export interface PatientCaseDetail {
  id: string;
  patientId: string;
  patientName: string;
  tenantName: string;
  title: string;
  description: string | null;
  status: CaseStatus;
  appointments: {
    id: string;
    startTime: string;
    status: string;
    service: { name: string } | null;
  }[];
  createdAt: string;
  updatedAt: string;
}

export type ActionResult<T = void> =
  | (T extends void ? { success: true } : { success: true; data: T })
  | { success: false; error: string };
