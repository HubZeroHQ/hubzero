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
    { enabled: PUBLIC_ENTITY_ROUTES.engineeringProfile, path: '/engineering' },
    { enabled: PUBLIC_ENTITY_ROUTES.teamMember, path: '/about' },
    { enabled: PUBLIC_ENTITY_ROUTES.service, path: '/services' },
    { enabled: PUBLIC_SITE.release.contact, path: '/contact' },
  ];
  const paths = [
    ...collections.filter((collection) => collection.enabled).map((collection) => collection.path),
    ...entries.map((entry) => entry.url),
  ];
  return [...new Set(paths)].map((path) => ({ url: canonicalUrl(path).toString() }));
}
