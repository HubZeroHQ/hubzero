import type { MetadataRoute } from 'next';
import { PUBLIC_ENTITY_ROUTES, PUBLIC_SITE } from '@/config/public-site';
import { listPublicDiscoveryEntries } from '@/lib/public/queries';
import { canonicalUrl } from '@/lib/public/discovery/metadata';
import { publicRoute } from '@/lib/public/routes';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!PUBLIC_SITE.release.live) return [];
  const entries = await listPublicDiscoveryEntries();
  /**
   * `enabled` for every entity-route collection reads `PUBLIC_ENTITY_ROUTES`
   * — the "is this route real" registry — rather than a value hand-typed
   * per entry here. `PUBLIC_NAVIGATION.enabled` is a different fact (does
   * this belong in nav/footer) and must not be used for this; see its own
   * doc comment. Order is fixed to match this file's own test expectations
   * (Ledger/About interleaved between collection routes), so this stays an
   * explicit list rather than a derived `Object.entries` map.
   */
  const collections = [
    { enabled: true, path: publicRoute.home() },
    { enabled: PUBLIC_ENTITY_ROUTES.work, path: publicRoute.collection('work') },
    { enabled: PUBLIC_ENTITY_ROUTES.build, path: publicRoute.collection('build') },
    { enabled: PUBLIC_ENTITY_ROUTES.blueprint, path: publicRoute.collection('blueprint') },
    { enabled: PUBLIC_ENTITY_ROUTES.lab, path: publicRoute.collection('lab') },
    { enabled: PUBLIC_ENTITY_ROUTES.note, path: publicRoute.collection('note') },
    {
      enabled: PUBLIC_ENTITY_ROUTES.engineeringProfile,
      path: publicRoute.collection('engineeringProfile'),
    },
    { enabled: true, path: publicRoute.ledger() },
    { enabled: true, path: publicRoute.about() },
    { enabled: true, path: publicRoute.privacy() },
    { enabled: PUBLIC_ENTITY_ROUTES.service, path: publicRoute.collection('service') },
    { enabled: PUBLIC_ENTITY_ROUTES.career, path: publicRoute.collection('career') },
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
