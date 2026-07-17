import type { MetadataRoute } from 'next';
import { PUBLIC_SITE } from '@/config/public-site';
import { listPublicDiscoveryEntries } from '@/lib/public/queries';
import { canonicalUrl } from '@/lib/public/discovery/metadata';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!PUBLIC_SITE.release.live) return [];
  const entries = await listPublicDiscoveryEntries();
  return entries.map((entry) => ({ url: canonicalUrl(entry.url).toString() }));
}
