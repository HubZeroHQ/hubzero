import 'server-only';

import { revalidateTag } from 'next/cache';
import type { PublicEntityType } from './domain';

/** Bump when the serialized public-read contract or editorial eligibility changes. */
export const PUBLIC_CACHE_VERSION = 'phase-22-v1';

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
