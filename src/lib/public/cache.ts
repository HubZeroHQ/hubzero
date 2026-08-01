import 'server-only';

import { revalidateTag } from 'next/cache';
import type { PublicEntityType } from './domain';

/** Bump when the serialized public-read contract or editorial eligibility changes. */
export const PUBLIC_CACHE_VERSION = 'phase-22-v1';

/**
 * The dataset a cache entry was produced from (v3.1 Milestone 14).
 *
 * Every public cache key is prefixed with this. Without it a key states only
 * *what shape* the cached bytes have, never *which database they came from* —
 * and since `unstable_cache` entries persist to `.next/cache`, which every dev
 * server started from the same working directory shares, a server pointed at a
 * scratch database will happily serve entries another server wrote from
 * production. That is not hypothetical: it is exactly what invalidated
 * Milestone 12's verification, and this prefix is what makes it impossible.
 *
 * The database name is the right identifier because it is **canonical and
 * stable**: it is the dataset's actual name, it is already what `getDb()`
 * connects to, and it cannot vary between two requests of the same process.
 * Deliberately *not* the connection string — a cache key can surface in file
 * names and logs, and credentials must never travel there. Host is excluded
 * for the same reason and because two hosts serving the same database name in
 * development is not a case worth encoding.
 *
 * In production this changes the key exactly once, on the deploy that
 * introduces it: existing entries are simply not found, are recomputed on
 * first read, and the old ones age out. There is one database per deployment
 * there, so this can never cause a cross-database read in production — it only
 * closes the development hole.
 */
let cachedDatasetId: string | undefined;

export function publicCacheDatasetId(): string {
  if (cachedDatasetId === undefined) {
    cachedDatasetId = databaseNameFrom(process.env.MONGODB_URI);
  }
  return cachedDatasetId;
}

/**
 * The database name from a Mongo connection string, with no credentials.
 *
 * Falls back to a constant rather than throwing: a missing or unparseable URI
 * is already fatal elsewhere (`serverEnv()`), and a cache key is the wrong
 * place to raise it. The fallback is deliberately not random — a value that
 * changed per process would defeat the persistent cache entirely.
 */
function databaseNameFrom(uri: string | undefined): string {
  if (!uri) return 'unknown-db';
  try {
    const name = new URL(uri).pathname.replace(/^\//, '');
    return name === '' ? 'default-db' : name;
  } catch {
    return 'unknown-db';
  }
}

/**
 * The prefix every public cache key starts with: schema contract *and*
 * dataset. Both must match for an entry to be reused.
 */
export function publicCacheScope(): string {
  return `${PUBLIC_CACHE_VERSION}:${publicCacheDatasetId()}`;
}

export const PUBLIC_CACHE_TAGS = {
  entity: (type: PublicEntityType, slug: string) => `public:entity:${type}:${slug}`,
  collection: (type: PublicEntityType) => `public:collection:${type}`,
  relations: 'public:relations',
  homepage: 'public:homepage',
  discovery: 'public:discovery',
  sitemap: 'public:sitemap',
  feed: 'public:feed',
  media: (id: string) => `public:media:${id}`,
} as const;

const ALL_PUBLIC_TYPES: readonly PublicEntityType[] = [
  'work',
  'build',
  'blueprint',
  'lab',
  'note',
  'engineeringProfile',
  'teamMember',
  'service',
  'career',
];

function invalidateAllCollections(): void {
  for (const type of ALL_PUBLIC_TYPES) revalidateTag(PUBLIC_CACHE_TAGS.collection(type));
}

export function invalidatePublicEntity(type: PublicEntityType, slug?: string): void {
  if (slug) revalidateTag(PUBLIC_CACHE_TAGS.entity(type, slug));
  revalidateTag(PUBLIC_CACHE_TAGS.collection(type));
  revalidateTag(PUBLIC_CACHE_TAGS.relations);
  revalidateTag(PUBLIC_CACHE_TAGS.homepage);
  revalidateTag(PUBLIC_CACHE_TAGS.discovery);
  revalidateTag(PUBLIC_CACHE_TAGS.sitemap);
  revalidateTag(PUBLIC_CACHE_TAGS.feed);
}

export function invalidatePublicMedia(id: string): void {
  revalidateTag(PUBLIC_CACHE_TAGS.media(id));
  invalidateAllCollections();
  revalidateTag(PUBLIC_CACHE_TAGS.relations);
  revalidateTag(PUBLIC_CACHE_TAGS.homepage);
  revalidateTag(PUBLIC_CACHE_TAGS.discovery);
  revalidateTag(PUBLIC_CACHE_TAGS.sitemap);
  revalidateTag(PUBLIC_CACHE_TAGS.feed);
}
