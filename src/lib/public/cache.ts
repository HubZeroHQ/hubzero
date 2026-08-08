import 'server-only';

import { revalidateTag } from 'next/cache';
import type { PublicEntityType } from './domain';

/** Bump when the serialized public-read contract or editorial eligibility changes. */
export const PUBLIC_CACHE_VERSION = 'phase-22-v1';

let cachedDatasetId: string | undefined;

/**
 * Every public cache key is scoped to the Mongo dataset. The database name is
 * stable and contains no credentials, unlike the connection string.
 */
export function publicCacheDatasetId(): string {
  if (cachedDatasetId === undefined) {
    cachedDatasetId = databaseNameFrom(process.env.MONGODB_URI);
  }
  return cachedDatasetId;
}

function databaseNameFrom(uri: string | undefined): string {
  if (!uri) return 'unknown-db';
  try {
    const name = new URL(uri).pathname.replace(/^\//, '');
    return name === '' ? 'default-db' : name;
  } catch {
    return 'unknown-db';
  }
}

export function publicCacheScope(): string {
  return `${PUBLIC_CACHE_VERSION}:${publicCacheDatasetId()}`;
}

export const PUBLIC_CACHE_TAGS = {
  entity: (type: PublicEntityType, slug: string) => `public:entity:${type}:${slug}`,
  collection: (type: PublicEntityType) => `public:collection:${type}`,
  /**
   * Public detail pages and the evidence-derived indexes share one graph.
   * An entity relation can affect a reciprocal page in another collection,
   * so this cross-cutting tag is intentionally global. Plain collection
   * summaries do not carry it.
   */
  relations: 'public:relations',
  authors: 'public:authors',
  homepage: 'public:homepage',
  discovery: 'public:discovery',
} as const;

export interface PublicCacheTarget {
  type: PublicEntityType;
  slug?: string;
}

function invalidateTargets(
  targets: readonly PublicCacheTarget[],
  surfaces: {
    collections?: boolean;
    relations?: boolean;
    authors?: boolean;
    homepage?: boolean;
    discovery?: boolean;
  },
): void {
  const entityTags = new Set<string>();
  const collectionTypes = new Set<PublicEntityType>();

  for (const target of targets) {
    if (target.slug) {
      entityTags.add(PUBLIC_CACHE_TAGS.entity(target.type, target.slug));
    }
    if (surfaces.collections) {
      collectionTypes.add(target.type);
    }
  }

  for (const tag of entityTags) revalidateTag(tag);
  for (const type of collectionTypes) revalidateTag(PUBLIC_CACHE_TAGS.collection(type));
  if (surfaces.relations) revalidateTag(PUBLIC_CACHE_TAGS.relations);
  if (surfaces.authors) revalidateTag(PUBLIC_CACHE_TAGS.authors);
  if (surfaces.homepage) revalidateTag(PUBLIC_CACHE_TAGS.homepage);
  if (surfaces.discovery) revalidateTag(PUBLIC_CACHE_TAGS.discovery);
}

/**
 * Metadata, visibility, or relationship mutations can affect the entity,
 * its index, reciprocal relationship pages, homepage, search, sitemap, JSON-LD,
 * and route metadata. Sitemap reads discovery; RSS reads the Note collection,
 * so their correctness follows from these real query dependencies rather than
 * dead surface-specific tags.
 */
export function invalidatePublicEntity(type: PublicEntityType, slug?: string): void {
  invalidatePublicTargets([{ type, ...(slug ? { slug } : {}) }]);
}

/** Full public dependency invalidation for an already-resolved target set. */
export function invalidatePublicTargets(targets: readonly PublicCacheTarget[]): void {
  if (targets.length === 0) return;
  invalidateTargets(targets, {
    collections: true,
    relations: true,
    authors: targets.some(
      (target) => target.type === 'teamMember' || target.type === 'engineeringProfile',
    ),
    homepage: true,
    discovery: true,
  });
}

/** Featured order is consumed only by the owning collection and homepage. */
export function invalidatePublicFeaturedOrder(type: PublicEntityType): void {
  revalidateTag(PUBLIC_CACHE_TAGS.collection(type));
  revalidateTag(PUBLIC_CACHE_TAGS.homepage);
}

/**
 * Media metadata/file changes affect only entries that reference the asset.
 * Their detail/collection presentation, homepage cards, and media-bearing
 * discovery projection are refreshed; unrelated collections and the evidence
 * graph remain warm.
 */
export function invalidatePublicMediaTargets(targets: readonly PublicCacheTarget[]): void {
  if (targets.length === 0) return;
  invalidateTargets(targets, { collections: true, homepage: true, discovery: true });
}

/**
 * Taxonomy labels/slugs affect the precise referencing entries, their
 * collection indexes, homepage cards, and discovery/search projection.
 */
export function invalidatePublicTaxonomyTargets(targets: readonly PublicCacheTarget[]): void {
  if (targets.length === 0) return;
  invalidateTargets(targets, {
    collections: true,
    // Engineering-profile technologies are embedded in relationship targets
    // on other cached detail pages. Other entity taxonomy stays local.
    relations: targets.some((target) => target.type === 'engineeringProfile'),
    authors: targets.some((target) => target.type === 'engineeringProfile'),
    homepage: true,
    discovery: true,
  });
}
