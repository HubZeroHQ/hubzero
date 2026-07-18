import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PublicServiceSummary } from '@/lib/public/domain';
import { Services } from './Services';

describe('public Services experience', () => {
  it('remains substantive without inventing service records', () => {
    const markup = renderToStaticMarkup(<Services services={[]} />);
    expect(markup).toContain('Build the system the');
    expect(markup).toContain('Products and platforms');
    expect(markup).toContain('Focused investigation');
    expect(markup).toContain('Services / no eligible public definitions');
  });

  it('accepts one strong evidence relationship without a numeric minimum', () => {
    const service: PublicServiceSummary = {
      type: 'service',
      title: 'Publishing systems',
      url: '/services',
      summary: 'Editorial systems with explicit publishing and public-read boundaries.',
      technologies: [],
      evidence: [
        {
          kind: 'serviceProvenBy',
          label: 'Proven by',
          target: {
            type: 'note',
            title: 'The public read boundary',
            url: '/notes/public-read-boundary',
          },
        },
      ],
    };
    const markup = renderToStaticMarkup(<Services services={[service]} />);
    expect(markup).toContain('Publishing systems');
    expect(markup).toContain('href="/notes/public-read-boundary"');
    expect(markup).toContain('Proven by / 1');
  });
});
