import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PublicHomepageProjection } from '@/lib/public/domain';
import { Homepage } from './Homepage';

const emptyProjection: PublicHomepageProjection = {
  work: [],
  builds: [],
  labs: [],
  notes: [],
  profiles: [],
};

describe('Homepage', () => {
  it('keeps the complete narrative rhythm without rendering empty content chapters', () => {
    const markup = renderToStaticMarkup(<Homepage projection={emptyProjection} />);

    expect(markup).toContain('<main id="main-content"');
    expect(markup).toContain('<h1 id="home-title"');
    expect(markup).toContain('Four divisions. One body of');
    expect(markup).toContain('Bring the problem, not a prepared solution.');
    expect(markup).not.toContain('Featured Labs');
    expect(markup).not.toContain('Featured Notes');
    expect(markup).not.toContain('Products / shipped');
  });

  it('uses one h1 and preserves ordered pillar headings', () => {
    const markup = renderToStaticMarkup(<Homepage projection={emptyProjection} />);

    expect(markup.match(/<h1/g)).toHaveLength(1);
    expect(markup.indexOf('Labs')).toBeLessThan(markup.indexOf('Builds'));
    expect(markup.indexOf('Builds')).toBeLessThan(markup.indexOf('Work'));
    expect(markup.indexOf('Work')).toBeLessThan(markup.indexOf('Blueprints'));
  });

  it('uses the full editorial card when featured Work has no visual evidence', () => {
    const projection: PublicHomepageProjection = {
      ...emptyProjection,
      work: [
        {
          entity: {
            type: 'work',
            title: 'Bhatkal Time Luxe',
            url: '/work/bhatkal-time-luxe',
            summary: 'A published engineering record.',
            referenceId: 'work-1',
            slug: 'bhatkal-time-luxe',
            clientType: 'Hospitality',
            timeline: '2025',
            hubZeroRole: 'Engineering',
            categories: [],
            technologies: [],
          },
          relationships: [],
        },
      ],
    };

    const markup = renderToStaticMarkup(<Homepage projection={projection} />);

    expect(markup).toContain('home-card-prominent home-card-editorial');
    expect(markup).not.toContain('home-card-media');
  });

  it('progressively enhances featured Work when authentic visual evidence exists', () => {
    const projection: PublicHomepageProjection = {
      ...emptyProjection,
      work: [
        {
          entity: {
            type: 'work',
            title: 'Work with evidence',
            url: '/work/with-evidence',
            summary: 'A published engineering record with a real capture.',
            referenceId: 'work-2',
            slug: 'with-evidence',
            clientType: 'Product',
            timeline: '2026',
            hubZeroRole: 'Engineering',
            categories: [],
            technologies: [],
            hero: {
              url: '/evidence/work.png',
              width: 1600,
              height: 1000,
              alt: 'The shipped product interface',
              role: 'hero',
              responsive: { srcSet: '/evidence/work.png 1600w', sizes: '100vw' },
              placeholder: { kind: 'color', value: '#141414' },
            },
          },
          relationships: [],
        },
      ],
    };

    const markup = renderToStaticMarkup(<Homepage projection={projection} />);

    expect(markup).toContain('home-card-prominent home-card-with-media');
    expect(markup).toContain('home-card-media');
  });
});
