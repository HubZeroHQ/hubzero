import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type {
  PublicEngineeringProfileIndexEntry,
  PublicEngineeringProfileSummary,
  PublicEntityDetail,
  PublicMedia,
} from '@/lib/public/domain';
import { EngineeringProfileDetail } from './EngineeringProfileDetail';
import { EngineeringProfilesIndex } from './EngineeringProfilesIndex';

function media(url: string): PublicMedia {
  return {
    url,
    width: 1600,
    height: 1000,
    alt: 'Screenshot',
    role: 'gallery',
    responsive: { srcSet: '', sizes: '' },
    placeholder: { kind: 'color', value: '#141414' },
  };
}

const summary: PublicEngineeringProfileSummary = {
  type: 'engineeringProfile',
  title: 'Ari Rao',
  slug: 'ari-rao',
  url: '/engineering/ari-rao',
  referenceId: 'EP-101',
  summary: 'Builds public systems around explicit ownership and observable state.',
  role: 'Systems engineer',
  engineeringIdentity: ['Make boundaries explicit before optimizing them.'],
  currentExploration: 'Deterministic public read models',
  state: 'Deterministic public read models',
  technologies: [{ kind: 'technology', label: 'TypeScript', slug: 'typescript' }],
};

const relationships = [
  {
    kind: 'profileFeaturesEvidence' as const,
    label: 'Selected work',
    target: { type: 'work' as const, title: 'Release review', url: '/work/release-review' },
  },
  {
    kind: 'profileFeaturesEvidence' as const,
    label: 'Authored notes',
    target: { type: 'note' as const, title: 'Ownership first', url: '/notes/ownership-first' },
  },
  {
    kind: 'careerHiringManager' as const,
    label: 'Hiring for',
    target: { type: 'career' as const, title: 'Senior Engineer', url: '/careers/senior-engineer' },
  },
];

describe('public Engineering Profiles experience', () => {
  it('renders an editorial empty state without inventing engineers', () => {
    const markup = renderToStaticMarkup(<EngineeringProfilesIndex entries={[]} />);
    expect(markup).toContain('Expertise documented through the work.');
    expect(markup).toContain('Profiles / no eligible entries');
    expect(markup).not.toContain(summary.title);
  });

  it('renders role, expertise, technologies, and typed evidence on the index', () => {
    const entry: PublicEngineeringProfileIndexEntry = {
      profile: summary,
      areasOfExpertise: ['Public data architecture', 'Publishing systems'],
      relationships,
    };
    const markup = renderToStaticMarkup(<EngineeringProfilesIndex entries={[entry]} />);
    expect(markup).toContain('EP-101');
    expect(markup).toContain('Systems engineer');
    expect(markup).toContain('Public data architecture');
    expect(markup).toContain('TypeScript');
    expect(markup).toContain('href="/work/release-review"');
    expect(markup).toContain('href="/notes/ownership-first"');
  });

  it('renders one semantic profile article with identity, evidence, and owned documents', () => {
    const detail: Extract<PublicEntityDetail, { type: 'engineeringProfile' }> = {
      ...summary,
      engineeringPhilosophy:
        'A system becomes maintainable when its ownership and failure behavior are visible.',
      currentInterests: ['Cache dependencies'],
      areasOfExpertise: ['Public data architecture'],
      relationships,
      gallery: [],
      documents: [
        {
          role: 'introduction',
          outline: [{ id: 'boundaries', level: 2, text: 'Boundaries before implementation' }],
          blocks: [
            {
              id: 'boundaries',
              type: 'heading',
              data: { level: 2, text: 'Boundaries before implementation' },
            },
            {
              id: 'position',
              type: 'paragraph',
              data: { text: 'The public contract is designed before the storage mapper.' },
            },
          ],
        },
      ],
    };
    const markup = renderToStaticMarkup(<EngineeringProfileDetail profile={detail} />);
    expect(markup.match(/<article/g)).toHaveLength(1);
    expect(markup).toContain('<h1>Ari Rao</h1>');
    expect(markup).toContain('How the work is approached.');
    expect(markup).toContain('Related Work');
    expect(markup).toContain('Authored Notes');
    expect(markup).toContain('Position and practice');
    expect(markup).toContain('<h3 id="boundaries">Boundaries before implementation</h3>');
    expect(markup).toContain('How HubZero operates');

    // Milestone 4 (Relationship Integrity): a group a grouping array had
    // previously forgotten (Career→Profile) now surfaces, and the same
    // relationships array is what the graph draws — so it must appear there too.
    expect(markup).toContain('Hiring for');
    expect(markup).toContain('href="/careers/senior-engineer"');
    const graphAriaLabel = markup.match(
      /class="evidence-graph" role="img" aria-label="([^"]*)"/,
    )?.[1];
    expect(graphAriaLabel).toContain('Senior Engineer');
  });

  it('keeps interview and timeline headings one level below their profile section heading', () => {
    const detail: Extract<PublicEntityDetail, { type: 'engineeringProfile' }> = {
      ...summary,
      engineeringPhilosophy: 'Systems should expose their decisions.',
      currentInterests: [],
      areasOfExpertise: ['Systems design'],
      relationships: [],
      gallery: [],
      documents: [
        {
          role: 'interview',
          outline: [{ id: 'question', level: 3, text: 'What changed?' }],
          blocks: [{ id: 'question', type: 'heading', data: { level: 3, text: 'What changed?' } }],
        },
        {
          role: 'timeline',
          blocks: [
            {
              id: 'changes',
              type: 'timeline',
              data: {
                events: [
                  { date: '2026', title: 'Made the public contract explicit', description: '' },
                ],
              },
            },
          ],
        },
      ],
    };

    const markup = renderToStaticMarkup(<EngineeringProfileDetail profile={detail} />);
    const headingLevels = [...markup.matchAll(/<h([1-6])(?:\s|>)/g)].map((match) =>
      Number(match[1]),
    );
    expect(markup).toContain('<h2 id="profile-document-interview">Questions from the work</h2>');
    expect(markup).toContain('<h3 id="question">What changed?</h3>');
    expect(markup).toContain('<h2 id="profile-document-timeline">Changes in practice</h2>');
    expect(markup).toContain('<h3>Made the public contract explicit</h3>');
    expect(
      headingLevels.every((level, index) => index === 0 || level <= headingLevels[index - 1]! + 1),
    ).toBe(true);
  });

  it.each([
    ['rifaque', 'founder-profile-network'],
    ['raif', 'founder-profile-dependency-graph'],
    ['iyad', 'founder-profile-traveler'],
    ['sultan', 'founder-profile-editorial-grid'],
    ['salsabeel', 'founder-profile-pcb-trace'],
  ] as const)(
    'composes hero media, evidence, documents, and gallery from shared primitives for %s',
    (slug, founderClass) => {
      const detail: Extract<PublicEntityDetail, { type: 'engineeringProfile' }> = {
        ...summary,
        slug,
        hero: media('/media/hero.png'),
        engineeringPhilosophy: 'Systems should stay legible as they grow.',
        currentInterests: [],
        areasOfExpertise: ['Systems design'],
        relationships,
        gallery: [media('/media/gallery-one.png')],
        documents: [
          {
            role: 'introduction',
            outline: [{ id: 'boundaries', level: 2, text: 'Boundaries before implementation' }],
            blocks: [
              {
                id: 'boundaries',
                type: 'heading',
                data: { level: 2, text: 'Boundaries before implementation' },
              },
            ],
          },
        ],
      };
      const markup = renderToStaticMarkup(<EngineeringProfileDetail profile={detail} />);

      // one article, delegated to the bespoke composition, not the generic template
      expect(markup.match(/<article/g)).toHaveLength(1);
      expect(markup).toContain(founderClass);

      // ProfileHeroMedia (Next's Image rewrites the src through /_next/image?url=...)
      expect(markup).toContain('class="public-section profile-hero-media"');
      expect(markup).toContain('url=%2Fmedia%2Fhero.png');

      // RelatedRecordsSection + ProfileEvidenceGraph, replacing the founders'
      // former inline evidence markup
      expect(markup).toContain('Related Work');
      expect(markup).toContain('Authored Notes');
      expect(markup).toContain('class="evidence-graph"');

      // ProfileDocuments
      expect(markup).toContain('<h3 id="boundaries">Boundaries before implementation</h3>');

      // DetailGallery
      expect(markup).toContain('class="detail-gallery-grid"');
      expect(markup).toContain('url=%2Fmedia%2Fgallery-one.png');

      expect(markup).toContain('How HubZero operates');
    },
  );

  it('delegates a founder slug to its bespoke composition instead of the generic template', () => {
    const detail: Extract<PublicEntityDetail, { type: 'engineeringProfile' }> = {
      ...summary,
      title: 'Rifaque Ahmed',
      slug: 'rifaque',
      technologies: [
        { kind: 'technology', label: 'TypeScript', slug: 'typescript' },
        { kind: 'technology', label: 'Next.js', slug: 'nextjs' },
      ],
      engineeringPhilosophy: 'Systems should stay legible as they grow.',
      currentInterests: [],
      areasOfExpertise: ['Systems design'],
      relationships,
      gallery: [],
      documents: [],
    };
    const markup = renderToStaticMarkup(<EngineeringProfileDetail profile={detail} />);
    expect(markup.match(/<article/g)).toHaveLength(1);
    expect(markup).toContain('<h1>Rifaque Ahmed</h1>');
    expect(markup).toContain('founder-profile-network');
    expect(markup).toContain('founder-motif-network');
    expect(markup).toContain('TypeScript');
    expect(markup).toContain('How HubZero operates');
  });
});
