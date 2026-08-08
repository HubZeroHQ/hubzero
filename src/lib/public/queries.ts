import 'server-only';

import { unstable_cache } from 'next/cache';
import { PUBLIC_ENTITY_ROUTES } from '@/config/public-site';
import { PUBLIC_CACHE_TAGS, publicCacheScope } from './cache';
import {
  createInMemoryPublicSearchProvider,
  createPublicSearchEntryPoint,
} from './discovery/search';
import type { PublicDetailEntityType, PublicEntityType } from './domain';
import { buildLedger } from './ledger-projection';
import { mongoPublicDataSource } from './mongodb-source';
import { createPublicRepository } from './repository';

const repository = createPublicRepository(mongoPublicDataSource);

/**
 * `preview: true` is Draft Mode's path (Experience v3 Preview Integrity
 * milestone) — deliberately bypasses `unstable_cache` entirely rather than
 * threading preview through the cache key. A previewed entity's `status`
 * (and everything else about it) can change from one moment to the next
 * while an editor is actively working on it; caching that under a key that
 * could collide with — or go stale relative to — the real public cache
 * entry for the same slug is exactly the kind of risk this bypasses.
 * Next.js already renders the page fully dynamically whenever Draft Mode's
 * cookie is present, so an uncached read here doesn't cost anything a real
 * visitor would ever pay for.
 */
export function getPublicDetail(
  type: PublicDetailEntityType,
  slug: string,
  options?: { preview?: boolean },
) {
  if (options?.preview) {
    return repository.findDetail(type, slug, { preview: true });
  }
  return unstable_cache(
    () => repository.findDetail(type, slug),
    cacheKey(type, 'public-detail', slug),
    {
      tags: [
        PUBLIC_CACHE_TAGS.entity(type, slug),
        PUBLIC_CACHE_TAGS.collection(type),
        PUBLIC_CACHE_TAGS.relations,
      ],
    },
  )();
}

export function listPublicSummaries(type: PublicEntityType) {
  return unstable_cache(() => repository.listSummaries(type), cacheKey(type, 'public-collection'), {
    // Service cards derive their evidence count from the relationship graph.
    // Other collection summaries do not, so tagging all of them with the
    // global graph used to evict every public index after any entity edit.
    tags:
      type === 'service'
        ? [PUBLIC_CACHE_TAGS.collection(type), PUBLIC_CACHE_TAGS.relations]
        : type === 'note'
          ? [PUBLIC_CACHE_TAGS.collection(type), PUBLIC_CACHE_TAGS.authors]
          : [PUBLIC_CACHE_TAGS.collection(type)],
  })();
}

export function listPublicNoteIndexEntries() {
  return unstable_cache(
    () => repository.listNoteIndexEntries(),
    [publicCacheScope(), 'public-note-index'],
    {
      tags: [
        PUBLIC_CACHE_TAGS.collection('note'),
        PUBLIC_CACHE_TAGS.relations,
        PUBLIC_CACHE_TAGS.authors,
      ],
    },
  )();
}

export function listPublicEngineeringProfileIndexEntries() {
  return unstable_cache(
    () => repository.listEngineeringProfileIndexEntries(),
    [publicCacheScope(), 'public-engineering-profile-index'],
    {
      tags: [
        PUBLIC_CACHE_TAGS.collection('engineeringProfile'),
        PUBLIC_CACHE_TAGS.collection('teamMember'),
        PUBLIC_CACHE_TAGS.relations,
      ],
    },
  )();
}

export function listPublicDiscoveryEntries() {
  const activeTypes = (Object.entries(PUBLIC_ENTITY_ROUTES) as Array<[PublicEntityType, boolean]>)
    .filter(([, enabled]) => enabled)
    .map(([type]) => type);
  if (!activeTypes.length) return Promise.resolve([]);
  return unstable_cache(
    () => repository.listDiscoveryEntries(activeTypes),
    [publicCacheScope(), 'public-discovery', ...activeTypes],
    { tags: [PUBLIC_CACHE_TAGS.discovery, PUBLIC_CACHE_TAGS.relations] },
  )();
}

export async function searchPublicContent(query: string, limit = 24) {
  const entries = await listPublicDiscoveryEntries();
  return createPublicSearchEntryPoint(createInMemoryPublicSearchProvider(entries)).search({
    query,
    limit,
  });
}

export function getPublicHomepage(now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  return unstable_cache(
    () => repository.getHomepage(now),
    [publicCacheScope(), 'public-homepage', day],
    {
      tags: [
        PUBLIC_CACHE_TAGS.homepage,
        PUBLIC_CACHE_TAGS.relations,
        ...Object.keys(PUBLIC_ENTITY_ROUTES).map((type) =>
          PUBLIC_CACHE_TAGS.collection(type as PublicEntityType),
        ),
      ],
      revalidate: 86_400,
    },
  )();
}

/**
 * Ledger (v2.5 Phase 7): composes two already-cached, already-existing
 * queries rather than adding a new repository method or a new cache
 * entry. `listPublicSummaries` individually caches Notes and Labs; this
 * only concatenates and runs them through the pure, dependency-free
 * `buildLedger` sort — no new persistence, no new query.
 */
export async function getPublicLedger() {
  const [notes, labs] = await Promise.all([
    listPublicSummaries('note'),
    listPublicSummaries('lab'),
  ]);
  return buildLedger([...notes, ...labs]);
}

/**
 * Every public cache key starts with the scope — schema contract *and* the
 * database the bytes came from — so an entry can only be reused by a server
 * reading the same dataset. See `publicCacheScope`.
 */
function cacheKey(type: PublicEntityType, ...parts: string[]): string[] {
  return [publicCacheScope(), type, ...parts];
}

/**
 * Homepage eligibility for a collection, for the Studio's Featured Order
 * screen (v3.1 Milestone 2 finalization).
 *
 * Deliberately uncached: this is a Studio-side authoring aid read by an
 * editor who has just changed the very content it describes, and serving them
 * a day-old answer about why their entry cannot appear would be worse than
 * recomputing it. The public homepage keeps its own cached path.
 */
export function listHomepageEligibility(type: PublicDetailEntityType, now = new Date()) {
  return repository.listHomepageEligibility(type, now);
}
