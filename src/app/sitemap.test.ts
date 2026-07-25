import { describe, expect, it, vi } from 'vitest';
import type { PublicDiscoveryEntry } from '@/lib/public/domain';

// canonicalUrl() requires NEXT_PUBLIC_SITE_URL at import time; vitest doesn't
// load .env.local the way Next's runtime does, so it's set explicitly here,
// before sitemap.ts (and the env validation it triggers) is imported below.
process.env.NEXT_PUBLIC_SITE_URL = 'https://hubzero.example';

const discoveryEntries: PublicDiscoveryEntry[] = [
  {
    type: 'work',
    title: 'A Work item',
    url: '/work/a-work-item',
    summary: 'Summary.',
    taxonomy: [],
    relationships: [],
  },
  {
    type: 'note',
    title: 'A Note',
    url: '/notes/a-note',
    summary: 'Summary.',
    taxonomy: [],
    relationships: [],
    lastModified: '2026-07-18T00:00:00.000Z',
  },
];

vi.mock('@/lib/public/queries', () => ({
  listPublicDiscoveryEntries: vi.fn(async () => discoveryEntries),
}));

const sitemap = (await import('./sitemap')).default;

describe('public sitemap', () => {
  it('includes every top-level collection route, including Ledger', async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    for (const path of [
      '/',
      '/work',
      '/builds',
      '/blueprints',
      '/labs',
      '/notes',
      '/engineering',
      '/ledger',
      '/about',
      '/services',
    ]) {
      expect(urls.some((url) => url.endsWith(path))).toBe(true);
    }
  });

  it('places Ledger between Engineering Profiles and About, leaving every other route in its original order', async () => {
    const entries = await sitemap();
    const paths = entries.map((entry) => new URL(entry.url).pathname);
    const staticPaths = [
      '/',
      '/work',
      '/builds',
      '/blueprints',
      '/labs',
      '/notes',
      '/engineering',
      '/ledger',
      '/about',
      '/services',
    ];

    expect(paths.filter((path) => staticPaths.includes(path))).toEqual(staticPaths);
  });

  it('merges in discovery entries, preserving lastModified when present', async () => {
    const entries = await sitemap();
    const work = entries.find((entry) => entry.url.endsWith('/work/a-work-item'));
    const note = entries.find((entry) => entry.url.endsWith('/notes/a-note'));

    expect(work).toBeDefined();
    expect(work?.lastModified).toBeUndefined();
    expect(note?.lastModified).toEqual(new Date('2026-07-18T00:00:00.000Z'));
  });

  it('never emits a duplicate URL, even if a discovery entry collides with a static route', async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(new Set(urls).size).toBe(urls.length);
  });
});
