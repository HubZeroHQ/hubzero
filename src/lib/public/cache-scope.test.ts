import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The cache-isolation guarantee (v3.1 Milestone 14): a cache entry produced
 * from one database must never be reusable by a server reading another.
 * `publicCacheScope` is the whole mechanism, so these are the tests that hold
 * it in place.
 */

const ORIGINAL = process.env.MONGODB_URI;

async function scopeFor(uri: string | undefined): Promise<string> {
  if (uri === undefined) delete process.env.MONGODB_URI;
  else process.env.MONGODB_URI = uri;
  // Re-imported per case because the dataset id is memoised per module load,
  // which is what keeps it free at request time.
  vi.resetModules();
  const mod = await import('./cache');
  return mod.publicCacheScope();
}

beforeEach(() => {
  process.env.MONGODB_URI = ORIGINAL;
});

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.MONGODB_URI;
  else process.env.MONGODB_URI = ORIGINAL;
});

describe('publicCacheScope', () => {
  it('differs between two databases on the same cluster', async () => {
    const prod = await scopeFor('mongodb+srv://u:p@host.mongodb.net/hubzero?appName=x');
    const scratch = await scopeFor('mongodb+srv://u:p@host.mongodb.net/hubzero_scratch?appName=x');

    // The exact case that leaked: same cluster, same credentials, different db.
    expect(prod).not.toBe(scratch);
    expect(prod).toContain('hubzero');
    expect(scratch).toContain('hubzero_scratch');
  });

  it('is stable across repeated calls, so the persistent cache still works', async () => {
    const uri = 'mongodb+srv://u:p@host.mongodb.net/hubzero_scratch';
    expect(await scopeFor(uri)).toBe(await scopeFor(uri));
  });

  /** A key can reach file names and logs; credentials must never travel there. */
  it('never contains credentials or host', async () => {
    const scope = await scopeFor('mongodb+srv://secretuser:secretpass@cluster.mongodb.net/hubzero');

    expect(scope).not.toContain('secretuser');
    expect(scope).not.toContain('secretpass');
    expect(scope).not.toContain('cluster.mongodb.net');
  });

  it('still carries the schema contract version', async () => {
    const { PUBLIC_CACHE_VERSION } = await import('./cache');
    expect(await scopeFor('mongodb://localhost:27017/hubzero')).toContain(PUBLIC_CACHE_VERSION);
  });

  it('falls back to a constant rather than throwing or randomising', async () => {
    // A per-process random value would silently disable the persistent cache.
    expect(await scopeFor(undefined)).toBe(await scopeFor(undefined));
    expect(await scopeFor('not-a-uri')).toBe(await scopeFor('not-a-uri'));
  });

  it('distinguishes a URI with no database from a named one', async () => {
    const none = await scopeFor('mongodb://localhost:27017');
    const named = await scopeFor('mongodb://localhost:27017/hubzero');
    expect(none).not.toBe(named);
  });
});
