import type { MetadataRoute } from 'next';
import { PUBLIC_SITE } from '@/config/public-site';
import { listPublicDiscoveryEntries } from '@/lib/public/queries';
import { canonicalUrl } from '@/lib/public/discovery/metadata';
import { publicRoute } from '@/lib/public/routes';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!PUBLIC_SITE.release.live) return [];
  const entries = await listPublicDiscoveryEntries();
  const collections = [
    { enabled: true, path: publicRoute.home() },
    { enabled: true, path: publicRoute.collection('work') },
    { enabled: true, path: publicRoute.collection('build') },
    { enabled: true, path: publicRoute.collection('blueprint') },
    { enabled: true, path: publicRoute.collection('lab') },
    { enabled: true, path: publicRoute.collection('note') },
    { enabled: true, path: publicRoute.collection('engineeringProfile') },
    { enabled: true, path: publicRoute.about() },
    { enabled: true, path: publicRoute.collection('service') },
    { enabled: PUBLIC_SITE.release.contact, path: publicRoute.contact() },
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
