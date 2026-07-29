import type { MetadataRoute } from 'next';
import { PUBLIC_SITE } from '@/config/public-site';
import { publicEnv } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const site = publicEnv().NEXT_PUBLIC_SITE_URL;
  if (!PUBLIC_SITE.release.live) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/studio/', '/api/'] }],
    sitemap: new URL('/sitemap.xml', site).toString(),
    host: site,
  };
}
