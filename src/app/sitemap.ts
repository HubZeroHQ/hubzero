import type { MetadataRoute } from 'next';
import { PUBLIC_SITE } from '@/config/public-site';
import { listPublicDiscoveryEntries } from '@/lib/public/queries';
import { canonicalUrl } from '@/lib/public/discovery/metadata';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!PUBLIC_SITE.release.live) return [];
  const entries = await listPublicDiscoveryEntries();
  const collections = [
    { enabled: true, path: '/' },
    { enabled: entries.some((entry) => entry.type === 'work'), path: '/work' },
    { enabled: entries.some((entry) => entry.type === 'build'), path: '/builds' },
    { enabled: entries.some((entry) => entry.type === 'blueprint'), path: '/blueprints' },
    { enabled: entries.some((entry) => entry.type === 'lab'), path: '/labs' },
    { enabled: entries.some((entry) => entry.type === 'note'), path: '/notes' },
    { enabled: entries.some((entry) => entry.type === 'engineeringProfile'), path: '/engineering' },
    { enabled: entries.some((entry) => entry.type === 'teamMember'), path: '/about' },
    { enabled: entries.some((entry) => entry.type === 'service'), path: '/services' },
    { enabled: PUBLIC_SITE.release.contact, path: '/contact' },
  ];
  const sitemapEntries = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const collection of collections.filter((collection) => collection.enabled)) {
    sitemapEntries.set(collection.path, { url: canonicalUrl(collection.path).toString() });
  }
  for (const entry of entries) {
    sitemapEntries.set(entry.url, {
      url: canonicalUrl(entry.url).toString(),
      ...(entry.lastModified ? { lastModified: new Date(entry.lastModified) } : {}),
    });
  }
  return [...sitemapEntries.values()];
}
