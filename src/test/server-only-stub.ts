/**
 * Test-time stand-in for the `server-only` package.
 *
 * `server-only` throws on import outside a React Server Component, which is
 * exactly what makes it useful in the app and useless under Vitest: a unit test
 * importing a server module (`lib/events/record.ts` via the action factories)
 * would fail at import time for a reason that has nothing to do with the test.
 *
 * Aliased in `vitest.config.ts`. The real guard stays in place for the build,
 * so the boundary is still enforced where it matters.
 */
export {};
