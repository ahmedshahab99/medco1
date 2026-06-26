import prisma from "@/lib/prisma";
import { getActivePlan, type PlanFeatureKey } from "./limits";
import { getCurrentUsage } from "./usage";

export interface EnforcementResult {
  allowed: boolean;
  reason?: string;
}

const AR_DOCTOR_LIMIT = "وصلت إلى الحد الأقصى من الأطباء في خطتك الحالية";
const AR_PATIENT_LIMIT = "وصلت إلى الحد الأقصى من المرضى في خطتك الحالية";
const AR_APPT_QUOTA = "وصلت إلى الحد الأقصى من المواعيد الشهرية في خطتك";
const AR_WA_QUOTA = "وصلت إلى الحد الأقصى من رسائل واتساب الشهرية في خطتك";
const AR_FEATURE_OFF = "هذه الميزة غير متوفرة في خطتك الحالية";

/**
 * Enforces the per-tenant doctor count limit.
 *
 * @param tenantId - Target tenant
 * @param prospective - Additional doctors being added (default 1)
 * Counts all roles that count toward the doctor slot: DOCTOR and ADMIN.
 */
export async function enforceDoctorLimit(
  tenantId: string,
  prospective = 1,
): Promise<EnforcementResult> {
  const plan = await getActivePlan(tenantId);
  const max = plan.limits.maxDoctors;
  if (max === null) return { allowed: true };

  const current = await prisma.profile.count({
    where: { tenantId, role: { in: ["DOCTOR", "ADMIN"] } },
  });

  if (current + prospective > max) {
    return { allowed: false, reason: AR_DOCTOR_LIMIT };
  }
  return { allowed: true };
}

/**
 * Enforces the per-tenant patient count limit.
 *
 * @param prospective - Additional patients being added (default 1)
 */
export async function enforcePatientLimit(
  tenantId: string,
  prospective = 1,
): Promise<EnforcementResult> {
  const plan = await getActivePlan(tenantId);
  const max = plan.limits.maxPatients;
  if (max === null) return { allowed: true };

  const current = await prisma.patient.count({ where: { tenantId } });

  if (current + prospective > max) {
    return { allowed: false, reason: AR_PATIENT_LIMIT };
  }
  return { allowed: true };
}

/**
 * Enforces the monthly appointments quota.
 * Counts each new appointment against the current calendar month.
 */
export async function enforceAppointmentQuota(
  tenantId: string,
): Promise<EnforcementResult> {
  const plan = await getActivePlan(tenantId);
  const max = plan.limits.appointmentsPerMonth;
  if (max === null) return { allowed: true };

  const usage = await getCurrentUsage(tenantId);

  if (usage.appointments + 1 > max) {
    return { allowed: false, reason: AR_APPT_QUOTA };
  }
  return { allowed: true };
}

/**
 * Enforces the monthly WhatsApp message quota.
 * A limit of 0 (Starter) blocks all outbound messages.
 */
export async function enforceWhatsappQuota(
  tenantId: string,
): Promise<EnforcementResult> {
  const plan = await getActivePlan(tenantId);
  const max = plan.limits.whatsappPerMonth;
  if (max === null) return { allowed: true };

  const usage = await getCurrentUsage(tenantId);

  if (usage.whatsapp + 1 > max) {
    return { allowed: false, reason: AR_WA_QUOTA };
  }
  return { allowed: true };
}

/**
 * Feature gate for boolean features (patientFiles) and
 * graduated features (financialReports / analyticsDashboard).
 *
 * For graduated features any non-"none" level passes; use
 * `assertFeatureLevel` to require a specific level.
 */
export async function assertFeature(
  tenantId: string,
  feature: PlanFeatureKey,
): Promise<EnforcementResult> {
  const plan = await getActivePlan(tenantId);
  const value = plan.limits.features[feature];

  if (typeof value === "boolean") {
    return value ? { allowed: true } : { allowed: false, reason: AR_FEATURE_OFF };
  }
  // Graduated feature — "none" means locked.
  return value === "none"
    ? { allowed: false, reason: AR_FEATURE_OFF }
    : { allowed: true };
}

/**
 * Requires a graduated feature to be at least `requiredLevel`.
 */
export async function assertFeatureLevel(
  tenantId: string,
  feature: "financialReports" | "analyticsDashboard",
  requiredLevel: "basic" | "advanced",
): Promise<EnforcementResult> {
  const plan = await getActivePlan(tenantId);
  const value = plan.limits.features[feature];
  const order: Record<string, number> = { none: 0, basic: 1, advanced: 2 };

  if (order[value] < order[requiredLevel]) {
    return { allowed: false, reason: AR_FEATURE_OFF };
  }
  return { allowed: true };
}