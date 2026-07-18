import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import robots from '@/app/robots';
import { canonicalUrl, createPublicMetadata } from './metadata';
import { createPublicSearchEntryPoint } from './search';
import { renderRssFeed } from './feed';
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  organizationJsonLd,
  publicArtifactJsonLd,
  websiteJsonLd,
} from './structured-data';
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

  it('describes collection membership without inventing records', () => {
    expect(
      collectionPageJsonLd({
        name: 'HubZero Builds',
        description: 'Published products.',
        path: '/builds',
        entries: [{ title: 'Release Ledger', url: '/builds/release-ledger' }],
      }),
    ).toMatchObject({
      '@type': 'CollectionPage',
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: 1,
        itemListElement: [{ position: 1, name: 'Release Ledger' }],
      },
    });
  });

  it('uses a truthful product type for Build structured data', () => {
    expect(
      publicArtifactJsonLd({
        type: 'build',
        title: 'Release Ledger',
        slug: 'release-ledger',
        url: '/builds/release-ledger',
        referenceId: 'HZ-BL-101',
        summary: 'A release record.',
        technologies: [],
        deploymentState: 'live',
        links: [],
      }),
    ).toMatchObject({ '@type': 'Product', name: 'Release Ledger' });
  });

  it('describes Work as an organization-authored engineering case study', () => {
    expect(
      publicArtifactJsonLd({
        type: 'work',
        title: 'Operational release review',
        slug: 'operational-release-review',
        url: '/work/operational-release-review',
        referenceId: 'HZ-WK-101',
        summary: 'A release workflow rebuilt around explicit evidence.',
        clientType: 'Product team',
        timeline: '12 weeks',
        hubZeroRole: 'Product engineering',
        technologies: [{ kind: 'technology', label: 'TypeScript', slug: 'typescript' }],
        categories: [{ kind: 'category', label: 'Developer tools', slug: 'developer-tools' }],
      }),
    ).toMatchObject({
      '@type': 'CreativeWork',
      genre: 'Engineering case study',
      about: ['Developer tools'],
      creator: { '@id': 'https://hubzero.in/#organization' },
    });
  });

  it('describes a Blueprint as a versioned reusable engineering publication', () => {
    expect(
      publicArtifactJsonLd({
        type: 'blueprint',
        title: 'Blueprint-SaaS-Editorial',
        slug: 'blueprint-saas-editorial',
        url: '/blueprints/blueprint-saas-editorial',
        referenceId: 'HZ-BP-101',
        summary: 'A reusable software documentation foundation.',
        architecture: 'SaaS',
        designLanguage: 'Editorial',
        version: '1.2.0',
        technologies: [],
        links: [],
        previewMedia: [],
      }),
    ).toMatchObject({
      '@type': 'CreativeWork',
      genre: 'Reusable engineering blueprint',
      version: '1.2.0',
      about: ['SaaS', 'Editorial'],
    });
  });

  it('keeps robots closed while the public release gate is disabled', () => {
    expect(robots()).toEqual({ rules: { userAgent: '*', disallow: '/' } });
  });
});
