import type { MetadataRoute } from 'next';
import { PUBLIC_ENTITY_ROUTES, PUBLIC_SITE } from '@/config/public-site';
import { listPublicDiscoveryEntries } from '@/lib/public/queries';
import { canonicalUrl } from '@/lib/public/discovery/metadata';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!PUBLIC_SITE.release.live) return [];
  const entries = await listPublicDiscoveryEntries();
  const collections = [
    { enabled: true, path: '/' },
    { enabled: PUBLIC_ENTITY_ROUTES.work, path: '/work' },
    { enabled: entries.some((entry) => entry.type === 'build'), path: '/builds' },
    { enabled: PUBLIC_ENTITY_ROUTES.blueprint, path: '/blueprints' },
    { enabled: entries.some((entry) => entry.type === 'lab'), path: '/labs' },
    { enabled: PUBLIC_ENTITY_ROUTES.note, path: '/notes' },
  ];
  return [
    ...collections
      .filter((collection) => collection.enabled)
      .map((collection) => ({ url: canonicalUrl(collection.path).toString() })),
    ...entries.map((entry) => ({ url: canonicalUrl(entry.url).toString() })),
  ];
}
