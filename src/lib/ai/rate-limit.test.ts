import { describe, expect, it } from 'vitest';
import { checkRateLimit, resetRateLimitForTests } from './rate-limit';

describe('checkRateLimit', () => {
  it('allows requests under the per-window budget', () => {
    resetRateLimitForTests('user-a');
    for (let i = 0; i < 8; i += 1) {
      expect(checkRateLimit('user-a').allowed).toBe(true);
    }
  });

  it('rejects the request once the budget is exceeded within the window', () => {
    resetRateLimitForTests('user-b');
    for (let i = 0; i < 8; i += 1) {
      checkRateLimit('user-b');
    }
    const result = checkRateLimit('user-b');
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('tracks each user independently', () => {
    resetRateLimitForTests('user-c');
    resetRateLimitForTests('user-d');
    for (let i = 0; i < 8; i += 1) {
      checkRateLimit('user-c');
    }
    expect(checkRateLimit('user-c').allowed).toBe(false);
    expect(checkRateLimit('user-d').allowed).toBe(true);
  });

  it('allows requests again once the window has elapsed', () => {
    resetRateLimitForTests('user-e');
    const start = 1_000_000;
    for (let i = 0; i < 8; i += 1) {
      checkRateLimit('user-e', start);
    }
    expect(checkRateLimit('user-e', start).allowed).toBe(false);
    expect(checkRateLimit('user-e', start + 60_001).allowed).toBe(true);
  });
});
