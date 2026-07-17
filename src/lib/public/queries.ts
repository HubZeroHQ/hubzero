import 'server-only';

import { unstable_cache } from 'next/cache';
import { PUBLIC_ENTITY_ROUTES } from '@/config/public-site';
import { PUBLIC_CACHE_TAGS } from './cache';
import type { PublicDetailEntityType, PublicEntityType } from './domain';
import { mongoPublicDataSource } from './mongodb-source';
import { createPublicRepository } from './repository';

const repository = createPublicRepository(mongoPublicDataSource);

export function getPublicSummary(type: PublicEntityType, slug: string) {
  return unstable_cache(() => repository.findSummary(type, slug), ['public-summary', type, slug], {
    tags: [
      PUBLIC_CACHE_TAGS.entity(type, slug),
      PUBLIC_CACHE_TAGS.collection(type),
      PUBLIC_CACHE_TAGS.relations,
    ],
  })();
}

export function getPublicDetail(type: PublicDetailEntityType, slug: string) {
  return unstable_cache(() => repository.findDetail(type, slug), ['public-detail', type, slug], {
    tags: [
      PUBLIC_CACHE_TAGS.entity(type, slug),
      PUBLIC_CACHE_TAGS.collection(type),
      PUBLIC_CACHE_TAGS.relations,
    ],
  })();
}

export function listPublicSummaries(type: PublicEntityType) {
  return unstable_cache(() => repository.listSummaries(type), ['public-collection', type], {
    tags: [PUBLIC_CACHE_TAGS.collection(type), PUBLIC_CACHE_TAGS.relations],
  })();
}

export function listPublicDiscoveryEntries() {
  const activeTypes = (Object.entries(PUBLIC_ENTITY_ROUTES) as Array<[PublicEntityType, boolean]>)
    .filter(([, enabled]) => enabled)
    .map(([type]) => type);
  if (!activeTypes.length) return Promise.resolve([]);
  return unstable_cache(
    () => repository.listDiscoveryEntries(activeTypes),
    ['public-discovery', ...activeTypes],
    { tags: [PUBLIC_CACHE_TAGS.discovery, PUBLIC_CACHE_TAGS.relations] },
  )();
}

export { repository as uncachedPublicRepository };
