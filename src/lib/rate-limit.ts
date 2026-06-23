import { headers } from "next/headers";
import { redis } from "./redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return h.get("x-real-ip") ?? "unknown";
}

export async function checkRateLimit(
  key: string,
  max: number,
  windowSec: number,
): Promise<RateLimitResult> {
  if (!redis) return { allowed: true, remaining: max, retryAfter: 0 };
  const count = (await redis.incr(key)) as number;
  if (count === 1) await redis.expire(key, windowSec);
  if (count > max) {
    const ttl = (await redis.ttl(key)) as number;
    return { allowed: false, remaining: 0, retryAfter: ttl > 0 ? ttl : windowSec };
  }
  return { allowed: true, remaining: max - count, retryAfter: 0 };
}