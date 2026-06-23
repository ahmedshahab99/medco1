import { redis } from "./redis";
import {
  OTP_DIGITS,
  OTP_TTL_SEC,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SEC,
} from "./otp-constants";

const OTP_LEN = OTP_DIGITS;
const MAX_ATTEMPTS = OTP_MAX_ATTEMPTS;
const RESEND_COOLDOWN_SEC = OTP_RESEND_COOLDOWN_SEC;

function otpKey(tenantId: string, phone: string) {

  return `otp:${tenantId}:${phone}`;
}
function pendingKey(token: string) {
  return `pending:${token}`;
}
function cooldownKey(tenantId: string, phone: string) {
  return `otp:cooldown:${tenantId}:${phone}`;
}

function generateCode(): string {
  let code = "";
  for (let i = 0; i < OTP_LEN; i++) code += Math.floor(Math.random() * 10).toString();
  return code;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "•••••";
  return "•".repeat(digits.length - 3) + digits.slice(-3);
}

export interface PendingBooking {
  tenantId: string;
  tenantName: string;
  doctorId: string;
  doctorFirstName: string | null;
  doctorLastName: string | null;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  startTime: string;
  endTime: string;
  patientFullName: string;
  patientFirstName: string;
  patientLastName: string;
  phone: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  notes?: string;
}

export interface OtpRecord {
  code: string;
  pendingToken: string;
  attempts: number;
}

export async function storePendingBooking(
  token: string,
  payload: PendingBooking,
): Promise<boolean> {
  if (!redis) return false;
  await redis.set(pendingKey(token), JSON.stringify(payload), { ex: OTP_TTL_SEC });
  return true;
}

export async function readPendingBooking(token: string): Promise<PendingBooking | null> {
  if (!redis) return null;
  const raw = await redis.get(pendingKey(token));
  if (!raw) return null;
  try {
    if (typeof raw === "string") {
      return JSON.parse(raw) as PendingBooking;
    }
    return raw as PendingBooking;
  } catch {
    return null;
  }
}

export async function deletePendingBooking(token: string): Promise<void> {
  if (!redis) return;
  await redis.del(pendingKey(token));
}

export async function setOtp(
  tenantId: string,
  phone: string,
  pendingToken: string,
): Promise<string | null> {
  if (!redis) return null;
  const code = generateCode();
  const record: OtpRecord = { code, pendingToken, attempts: 0 };
  await redis.set(otpKey(tenantId, phone), JSON.stringify(record), { ex: OTP_TTL_SEC });
  return code;
}

export async function getOtpRecord(
  tenantId: string,
  phone: string,
): Promise<OtpRecord | null> {
  if (!redis) return null;
  const raw = await redis.get(otpKey(tenantId, phone));
  if (!raw) return null;
  try {
    if (typeof raw === "string") {
      return JSON.parse(raw) as OtpRecord;
    }
    return raw as OtpRecord;
  } catch {
    return null;
  }
}

export async function deleteOtp(tenantId: string, phone: string): Promise<void> {
  if (!redis) return;
  await redis.del(otpKey(tenantId, phone));
}

export type OtpVerifyOutcome =
  | "valid"
  | "invalid"
  | "expired"
  | "max_attempts"
  | "unavailable";

export async function verifyOtp(
  tenantId: string,
  phone: string,
  code: string,
): Promise<{ outcome: OtpVerifyOutcome; pendingToken?: string }> {

  if (!redis) return { outcome: "unavailable" };
  const raw = await redis.get(otpKey(tenantId, phone));
  if (!raw) return { outcome: "expired" };
  let record: OtpRecord;
  
  try {
    if (typeof raw === "string") {
      record = JSON.parse(raw) as OtpRecord;
    } else {
      record = raw as OtpRecord;
    }
  } catch {
    return { outcome: "expired" };
  }

  record.attempts += 1;
  if (record.attempts > MAX_ATTEMPTS) {
    await redis.del(otpKey(tenantId, phone));
    await redis.del(pendingKey(record.pendingToken));
    return { outcome: "max_attempts" };
  }

  if (record.code !== code) {
    await redis.set(otpKey(tenantId, phone), JSON.stringify(record), {
      ex: OTP_TTL_SEC,
    });
    return { outcome: "invalid" };
  }

  await redis.del(otpKey(tenantId, phone));
  return { outcome: "valid", pendingToken: record.pendingToken };
}

export async function getResendCooldownRemaining(
  tenantId: string,
  phone: string,
): Promise<number> {
  if (!redis) return 0;
  const ttl = (await redis.ttl(cooldownKey(tenantId, phone))) as number;
  return ttl > 0 ? ttl : 0;
}

export async function setResendCooldown(
  tenantId: string,
  phone: string,
): Promise<void> {
  if (!redis) return;
  await redis.set(cooldownKey(tenantId, phone), "1", {
    ex: RESEND_COOLDOWN_SEC,
  });
}

export const DEFAULT_RESEND_COOLDOWN_SEC = OTP_RESEND_COOLDOWN_SEC;