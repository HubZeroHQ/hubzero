import { headers } from "next/headers";

/**
 * In-memory, fixed-window rate limiting for the two unauthenticated
 * mutation entry points that had none (`/studio/login`'s `authorize()`,
 * `/contact`'s `submitLead`) — a production-readiness gap flagged in this
 * session's security audit. In-memory (not Redis/Upstash) is the right
 * amount of infrastructure for `ARCHITECTURE/08_TECHNICAL_ARCHITECTURE.md`
 * §8's single self-hosted instance; a distributed store would only earn its
 * complexity once the app runs on more than one instance.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastSweepAt = Date.now();

/** Bounds memory growth from the set of distinct keys seen over time (mostly IPs) without a timer/interval — an opportunistic sweep piggybacked on real traffic. */
function sweepExpired(now: number): void {
  if (now - lastSweepAt < 60_000) return;
  lastSweepAt = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweepExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true };
}

/** Best-effort client IP from the standard proxy headers — `unknown` (one shared bucket) is the safe fallback, never a thrown error, so a misconfigured proxy degrades to coarser rate limiting instead of breaking the request. */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return headerList.get("x-real-ip") ?? "unknown";
}
