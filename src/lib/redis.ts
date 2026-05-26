import { Redis } from "@upstash/redis";

/**
 * Upstash Redis client for Edge-compatible token blacklisting.
 * Uses HTTP REST — safe for Next.js middleware and server actions.
 * Returns null if Redis is not configured (graceful fallback).
 */
function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export const redis = createRedis();
