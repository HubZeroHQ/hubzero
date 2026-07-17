import { describe, expect, it } from 'vitest';
import { createPublicSearchEntryPoint } from './search';
import { renderRssFeed } from './feed';
import { PUBLIC_MOTION } from '../motion';

describe('public discovery foundations', () => {
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
});
