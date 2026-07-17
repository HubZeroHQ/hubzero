import { PUBLIC_SITE } from '@/config/public-site';
import { publicEnv } from '@/lib/env';

export type JsonLd = Record<string, unknown>;

const absolute = (path: string) => new URL(path, publicEnv().NEXT_PUBLIC_SITE_URL).toString();

export function organizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${absolute('/')}#organization`,
    name: PUBLIC_SITE.name,
    url: absolute('/'),
    logo: absolute('/brand/hubzero-logo-black.png'),
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${absolute('/')}#website`,
    name: PUBLIC_SITE.name,
    url: absolute('/'),
    publisher: { '@id': `${absolute('/')}#organization` },
  };
}

export function breadcrumbJsonLd(items: readonly { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}
