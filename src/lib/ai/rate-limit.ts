/**
 * Replaceable rate-limit boundary. The default backend is intentionally
 * process-local; a distributed deployment can inject Redis/Upstash here
 * without changing the AI service or any Server Action.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;
const SWEEP_INTERVAL_MS = 60_000;

export interface RateLimitCheck {
  allowed: boolean;
  retryAfterMs: number;
}

export interface AiRateLimiter {
  consume(key: string, now?: number): Promise<RateLimitCheck> | RateLimitCheck;
}

export class InMemorySlidingWindowRateLimiter implements AiRateLimiter {
  private readonly buckets = new Map<string, number[]>();
  private lastSweep = 0;

  consume(key: string, now = Date.now()): RateLimitCheck {
    if (now - this.lastSweep >= SWEEP_INTERVAL_MS) {
      for (const [bucketKey, timestamps] of this.buckets) {
        if (!timestamps.some((timestamp) => now - timestamp < WINDOW_MS)) {
          this.buckets.delete(bucketKey);
        }
      }
      this.lastSweep = now;
    }

    const withinWindow = (this.buckets.get(key) ?? []).filter(
      (timestamp) => now - timestamp < WINDOW_MS,
    );
    if (withinWindow.length >= MAX_REQUESTS_PER_WINDOW) {
      this.buckets.set(key, withinWindow);
      return { allowed: false, retryAfterMs: WINDOW_MS - (now - withinWindow[0]!) };
    }

    withinWindow.push(now);
    this.buckets.set(key, withinWindow);
    return { allowed: true, retryAfterMs: 0 };
  }

  resetForTests(key: string): void {
    this.buckets.delete(key);
  }
}

export const aiRateLimiter = new InMemorySlidingWindowRateLimiter();

/** Compatibility wrapper for existing callers and focused unit tests. */
export function checkRateLimit(userId: string, now = Date.now()): RateLimitCheck {
  return aiRateLimiter.consume(userId, now) as RateLimitCheck;
}

export function resetRateLimitForTests(userId: string): void {
  aiRateLimiter.resetForTests(userId);
}
