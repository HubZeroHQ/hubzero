import 'server-only';

import { unstable_cache } from 'next/cache';
import { PUBLIC_ENTITY_ROUTES } from '@/config/public-site';
import { PUBLIC_CACHE_TAGS, PUBLIC_CACHE_VERSION } from './cache';
import {
  createInMemoryPublicSearchProvider,
  createPublicSearchEntryPoint,
} from './discovery/search';
import type { PublicDetailEntityType, PublicEntityType } from './domain';
import { mongoPublicDataSource } from './mongodb-source';
import { createPublicRepository } from './repository';

const repository = createPublicRepository(mongoPublicDataSource);

export function getPublicSummary(type: PublicEntityType, slug: string) {
  return unstable_cache(
    () => repository.findSummary(type, slug),
    cacheKey(type, 'public-summary', slug),
    {
      tags: [
        PUBLIC_CACHE_TAGS.entity(type, slug),
        PUBLIC_CACHE_TAGS.collection(type),
        PUBLIC_CACHE_TAGS.relations,
      ],
    },
  )();
}

export function getPublicDetail(type: PublicDetailEntityType, slug: string) {
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
    tags: [PUBLIC_CACHE_TAGS.collection(type), PUBLIC_CACHE_TAGS.relations],
  })();
}

export function listPublicNoteIndexEntries() {
  return unstable_cache(
    () => repository.listNoteIndexEntries(),
    [PUBLIC_CACHE_VERSION, 'public-note-index'],
    {
      tags: [PUBLIC_CACHE_TAGS.collection('note'), PUBLIC_CACHE_TAGS.relations],
    },
  )();
}

export function listPublicEngineeringProfileIndexEntries() {
  return unstable_cache(
    () => repository.listEngineeringProfileIndexEntries(),
    [PUBLIC_CACHE_VERSION, 'public-engineering-profile-index'],
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
    [PUBLIC_CACHE_VERSION, 'public-discovery', ...activeTypes],
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
  return unstable_cache(() => repository.getHomepage(now), ['public-homepage', day], {
    tags: [
      PUBLIC_CACHE_TAGS.homepage,
      PUBLIC_CACHE_TAGS.relations,
      ...Object.keys(PUBLIC_ENTITY_ROUTES).map((type) =>
        PUBLIC_CACHE_TAGS.collection(type as PublicEntityType),
      ),
    ],
    revalidate: 86_400,
  })();
}

function cacheKey(type: PublicEntityType, ...parts: string[]): string[] {
  return [PUBLIC_CACHE_VERSION, type, ...parts];
}

export { repository as uncachedPublicRepository };
