import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PublicHomepageProjection } from '@/lib/public/domain';
import { compareHomepageEngineeringProfiles } from '@/lib/public/repository';
import { Homepage } from './Homepage';

const emptyProjection: PublicHomepageProjection = {
  work: [],
  builds: [],
  labs: [],
  notes: [],
  profiles: [],
};

describe('Homepage', () => {
  it('uses deterministic contribution-count then name ordering for profiles', () => {
    const feature = (title: string, count: number) =>
      ({
        entity: { title },
        relationships: Array.from({ length: count }, () => ({ kind: 'teamContributedToEntry' })),
      }) as never;
    const ordered = [feature('Zed', 1), feature('Ada', 3), feature('Bea', 3)].sort(
      compareHomepageEngineeringProfiles,
    );

    expect(ordered.map((entry: { entity: { title: string } }) => entry.entity.title)).toEqual([
      'Ada',
      'Bea',
      'Zed',
    ]);
  });

  it('renders multiple accountable engineering profiles and their connected contributions', () => {
    const projection: PublicHomepageProjection = {
      ...emptyProjection,
      profiles: [
        {
          entity: {
            type: 'engineeringProfile',
            title: 'Rifaque Ahmed',
            url: '/engineering/rifaque',
            slug: 'rifaque',
            referenceId: 'EP-001',
            summary: 'Builds public systems.',
            role: 'Systems engineer',
            engineeringIdentity: [],
            currentExploration: 'Public graphs',
            technologies: [],
          },
          relationships: [
            {
              kind: 'teamContributedToEntry',
              label: 'Contributor',
              target: { type: 'build', title: 'QueryCraft', url: '/builds/querycraft' },
            },
          ],
        },
        {
          entity: {
            type: 'engineeringProfile',
            title: 'Sultan',
            url: '/engineering/sultan',
            slug: 'sultan',
            referenceId: 'EP-002',
            summary: 'Documents engineering decisions.',
            role: 'Engineer',
            engineeringIdentity: [],
            currentExploration: 'Evidence',
            technologies: [],
          },
          relationships: [
            {
              kind: 'teamContributedToEntry',
              label: 'Contributor',
              target: {
                type: 'build',
                title: 'Bhatkal Time Luxe',
                url: '/builds/bhatkal-time-luxe',
              },
            },
            {
              kind: 'teamContributedToEntry',
              label: 'Contributor',
              target: { type: 'build', title: 'Nexus', url: '/builds/nexus' },
            },
            {
              kind: 'teamContributedToEntry',
              label: 'Contributor',
              target: { type: 'build', title: 'Atlas', url: '/builds/atlas' },
            },
            {
              kind: 'teamContributedToEntry',
              label: 'Contributor',
              target: { type: 'build', title: 'Signal', url: '/builds/signal' },
            },
          ],
        },
      ],
    };

    const markup = renderToStaticMarkup(<Homepage projection={projection} />);

    expect(markup).toContain('Rifaque Ahmed');
    expect(markup).toContain('Sultan');
    expect(markup).toContain('QueryCraft');
    expect(markup).toContain('Bhatkal Time Luxe');
    expect(markup).toContain('Nexus');
    expect(markup).toContain('Atlas');
    expect(markup).not.toContain('Signal');
    expect(markup).toContain('+1 more contribution');
    expect(projection.profiles[1]?.relationships).toHaveLength(4);
  });

  it('links a Build card contributor to their canonical Engineering Profile, never to /about', () => {
    const projection: PublicHomepageProjection = {
      ...emptyProjection,
      builds: [
        {
          entity: {
            type: 'build',
            title: 'QueryCraft',
            url: '/builds/querycraft',
            summary: 'A build.',
            technologies: [],
            slug: 'querycraft',
            referenceId: 'HZ-BLD-001',
            deploymentState: 'live',
            links: [],
          },
          relationships: [
            {
              kind: 'teamContributedToEntry',
              label: 'Contributor',
              target: {
                type: 'teamMember',
                title: 'Rifaque Ahmed',
                url: '/about',
                referenceId: 'HZ-TM-001',
                profileUrl: '/engineering/rifaque-ahmed',
              },
            },
            {
              kind: 'teamContributedToEntry',
              label: 'Contributor',
              target: {
                type: 'teamMember',
                title: 'No Profile Yet',
                url: '/about',
                referenceId: 'HZ-TM-002',
              },
            },
          ],
        },
      ],
    };

    const markup = renderToStaticMarkup(<Homepage projection={projection} />);

    expect(markup).toContain('href="/engineering/rifaque-ahmed"');
    expect(markup).not.toContain('href="/about"');
  });

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
