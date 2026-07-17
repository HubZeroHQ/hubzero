/**
 * A per-user sliding-window request budget for AI generation, checked before
 * every provider call (`service.ts`). Deliberately in-memory: the Studio runs
 * as a single Next.js server today, and an in-memory `Map` is the honest,
 * minimal thing that satisfies "AI generation must not be abused" without
 * introducing a shared store the rest of the app doesn't otherwise need.
 * Moving to a multi-instance deployment later would swap this module's
 * internals for a Redis/Mongo-backed counter — the call sites in `service.ts`
 * would not change.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;

const buckets = new Map<string, number[]>();

export interface RateLimitCheck {
  allowed: boolean;
  retryAfterMs: number;
}

export function checkRateLimit(userId: string, now = Date.now()): RateLimitCheck {
  const existing = buckets.get(userId) ?? [];
  const withinWindow = existing.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (withinWindow.length >= MAX_REQUESTS_PER_WINDOW) {
    buckets.set(userId, withinWindow);
    const oldest = withinWindow[0]!;
    return { allowed: false, retryAfterMs: WINDOW_MS - (now - oldest) };
  }

  withinWindow.push(now);
  buckets.set(userId, withinWindow);
  return { allowed: true, retryAfterMs: 0 };
}

/** Test-only escape hatch — production code never needs to clear another user's budget. */
export function resetRateLimitForTests(userId: string): void {
  buckets.delete(userId);
}
