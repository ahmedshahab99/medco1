import { Redis } from "@upstash/redis";

/**
 * Upstash Redis client for Edge-compatible token blacklisting.
 * Uses HTTP REST — safe for Next.js middleware and server actions.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
