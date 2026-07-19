import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type {
  PublicEngineeringProfileIndexEntry,
  PublicEngineeringProfileSummary,
  PublicEntityDetail,
} from '@/lib/public/domain';
import { EngineeringProfileDetail } from './EngineeringProfileDetail';
import { EngineeringProfilesIndex } from './EngineeringProfilesIndex';

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
  });

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
