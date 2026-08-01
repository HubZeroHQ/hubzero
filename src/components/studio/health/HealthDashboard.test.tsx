import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { HealthReport } from '@/lib/studio/health/types';
import { HealthDashboard } from './HealthDashboard';

const base: HealthReport = {
  sections: [
    {
      key: 'featured',
      label: 'Featured',
      description: 'Whether featuring matches what the site can show.',
      issues: [],
    },
  ],
  counts: { critical: 0, warning: 0, info: 0 },
  healthy: true,
  generatedAt: new Date('2026-08-01T00:00:00.000Z'),
};

describe('HealthDashboard', () => {
  it('states the healthy case explicitly rather than rendering an empty page', () => {
    const markup = renderToStaticMarkup(<HealthDashboard report={base} />);

    expect(markup).toContain('The public site is healthy');
    // A clear section still explains what it checks, so "no issues" is
    // distinguishable from "not checked".
    expect(markup).toContain('Whether featuring matches what the site can show.');
    expect(markup).toContain('Nothing to resolve here.');
  });

  it('renders what is wrong, why, how to fix it, and where to go', () => {
    const markup = renderToStaticMarkup(
      <HealthDashboard
        report={{
          ...base,
          healthy: false,
          counts: { critical: 0, warning: 1, info: 0 },
          sections: [
            {
              ...base.sections[0]!,
              issues: [
                {
                  id: 'a',
                  section: 'featured',
                  severity: 'warning',
                  title: 'Atlas is featured but will not appear',
                  detail: 'It does not qualify: Needs a preview image.',
                  remedy: 'Add a preview image, or remove it from the featured order.',
                  href: '/studio/content/blueprints/featured',
                },
              ],
            },
          ],
        }}
      />,
    );

    expect(markup).toContain('Atlas is featured but will not appear');
    expect(markup).toContain('Needs a preview image.');
    expect(markup).toContain('Add a preview image, or remove it from the featured order.');
    expect(markup).toContain('href="/studio/content/blueprints/featured"');
  });

  it('conveys severity as text, not colour alone', () => {
    const markup = renderToStaticMarkup(
      <HealthDashboard
        report={{
          ...base,
          healthy: false,
          counts: { critical: 1, warning: 0, info: 0 },
          sections: [
            {
              ...base.sections[0]!,
              issues: [
                {
                  id: 'a',
                  section: 'featured',
                  severity: 'critical',
                  title: 'Duplicate featured positions',
                  detail: 'Position 1 is used twice.',
                  remedy: 'Open Featured Order and save once.',
                  href: '/studio/content/blueprints/featured',
                },
              ],
            },
          ],
        }}
      />,
    );

    expect(markup).toContain('Severity: critical.');
    expect(markup).toContain('How to fix: ');
    expect(markup).toContain('1 critical');
  });
});
