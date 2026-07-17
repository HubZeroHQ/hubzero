import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import robots from '@/app/robots';
import { canonicalUrl, createPublicMetadata } from './metadata';
import { createPublicSearchEntryPoint } from './search';
import { renderRssFeed } from './feed';
import { breadcrumbJsonLd, organizationJsonLd, websiteJsonLd } from './structured-data';
import { PUBLIC_MOTION } from '../motion';

describe('public discovery foundations', () => {
  const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://hubzero.in';
  });

  afterAll(() => {
    if (previousSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
  });

  it('keeps search behind a provider contract and normalizes empty input', async () => {
    let calls = 0;
    const entry = createPublicSearchEntryPoint({
      search: async () => {
        calls += 1;
        return [];
      },
    });
    expect(await entry.search({ query: '   ' })).toEqual([]);
    expect(calls).toBe(0);
    await entry.search({ query: '  build  ' });
    expect(calls).toBe(1);
  });

  it('escapes RSS content and uses canonical URLs as GUIDs', () => {
    const xml = renderRssFeed({
      title: 'HubZero Notes',
      description: 'Engineering <notes>',
      siteUrl: 'https://hubzero.in',
      feedUrl: 'https://hubzero.in/feed.xml',
      items: [
        {
          title: 'Models & boundaries',
          url: 'https://hubzero.in/notes/models',
          summary: 'A <safe> summary',
          publicationDate: '2026-07-18T00:00:00.000Z',
          author: { kind: 'organization', name: 'HubZero', url: '/about' },
        },
      ],
    });
    expect(xml).toContain('Models &amp; boundaries');
    expect(xml).toContain('A &lt;safe&gt; summary');
    expect(xml).toContain('<guid isPermaLink="true">https://hubzero.in/notes/models</guid>');
  });

  it('keeps every shared motion duration within the canonical budget', () => {
    expect(Math.max(...Object.values(PUBLIC_MOTION.duration))).toBeLessThanOrEqual(500);
  });

  it('builds canonical metadata, titles, descriptions, and Open Graph fields', () => {
    expect(canonicalUrl('/labs/runtime').toString()).toBe('https://hubzero.in/labs/runtime');
    const metadata = createPublicMetadata({
      title: 'Runtime Lab',
      description: 'Current engineering research.',
      path: '/labs/runtime',
      type: 'article',
    });
    expect(metadata).toMatchObject({
      title: 'Runtime Lab',
      description: 'Current engineering research.',
      alternates: { canonical: new URL('https://hubzero.in/labs/runtime') },
      openGraph: {
        title: 'Runtime Lab — HubZero',
        description: 'Current engineering research.',
        url: new URL('https://hubzero.in/labs/runtime'),
        type: 'article',
      },
    });
  });

  it('builds bounded Organization, Website, and Breadcrumb structured data', () => {
    expect(organizationJsonLd()).toMatchObject({
      '@type': 'Organization',
      name: 'HubZero',
      url: 'https://hubzero.in/',
    });
    expect(websiteJsonLd()).toMatchObject({ '@type': 'WebSite', name: 'HubZero' });
    expect(breadcrumbJsonLd([{ name: 'Labs', path: '/labs' }])).toMatchObject({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Labs', item: 'https://hubzero.in/labs' },
      ],
    });
  });

  it('keeps robots closed while the public release gate is disabled', () => {
    expect(robots()).toEqual({ rules: { userAgent: '*', disallow: '/' } });
  });
});
