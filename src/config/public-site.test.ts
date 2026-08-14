import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PUBLIC_PRIVACY, PUBLIC_TITLE_TEMPLATE } from './public-site';

describe('public release metadata and privacy contract', () => {
  it('uses exactly one U+2014 em dash in the public title template', () => {
    expect(PUBLIC_TITLE_TEMPLATE).toBe('%s — HubZero');
    expect([...PUBLIC_TITLE_TEMPLATE].filter((character) => character === '—')).toHaveLength(1);
    expect(PUBLIC_TITLE_TEMPLATE).not.toContain('â');
  });

  it('discloses the enabled Vercel Speed Insights data flow', () => {
    const disclosure = PUBLIC_PRIVACY.sections.flatMap((section) => section.body).join(' ');
    const publicLayout = readFileSync('src/app/(public)/layout.tsx', 'utf8');
    expect(publicLayout).toContain('<SpeedInsights />');
    expect(disclosure).toContain('Vercel Speed Insights');
    expect(disclosure).toContain('Web Vital');
    expect(disclosure).toContain('not tied to an individual visitor or IP address');
    expect(disclosure).not.toContain('does not use analytics, advertising');
    expect(PUBLIC_PRIVACY.lastUpdated).toBe('14 August 2026');
  });
});
