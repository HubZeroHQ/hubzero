import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type {
  PublicBuildSummary,
  PublicEntityDetail,
  PublicLabSummary,
  PublicWorkSummary,
} from '@/lib/public/domain';
import { PublicCollectionDetail } from './PublicCollectionDetail';
import { PublicCollectionIndex } from './PublicCollectionIndex';

const buildSummary: PublicBuildSummary = {
  type: 'build',
  title: 'Release Ledger',
  slug: 'release-ledger',
  url: '/builds/release-ledger',
  referenceId: 'HZ-BL-101',
  summary: 'A product record for release decisions and their supporting evidence.',
  deploymentState: 'live',
  state: 'live',
  technologies: [{ kind: 'technology', label: 'TypeScript', slug: 'typescript' }],
  links: [{ kind: 'live', label: 'Open product', url: 'https://example.com' }],
};

const labSummary: PublicLabSummary = {
  type: 'lab',
  title: 'Cache Consistency Study',
  slug: 'cache-consistency-study',
  url: '/labs/cache-consistency-study',
  referenceId: 'HZ-LB-101',
  summary: 'An investigation into predictable cache invalidation across related records.',
  stage: 'testing',
  state: 'testing',
  researchDirection: 'Compare explicit dependency graphs under mixed visibility changes.',
  currentMilestone: 'Complete the inverse-relation invalidation matrix.',
  startDate: '2026-06-01T00:00:00.000Z',
  lastMajorUpdate: '2026-07-18T00:00:00.000Z',
  technologies: [{ kind: 'technology', label: 'MongoDB', slug: 'mongodb' }],
  links: [],
};

const workSummary: PublicWorkSummary = {
  type: 'work',
  title: 'Operational release review',
  slug: 'operational-release-review',
  url: '/work/operational-release-review',
  referenceId: 'HZ-WK-101',
  summary: 'A release workflow rebuilt around explicit evidence and review responsibility.',
  clientType: 'Product team',
  timeline: '12 weeks',
  hubZeroRole: 'Product engineering',
  technologies: [{ kind: 'technology', label: 'TypeScript', slug: 'typescript' }],
  categories: [{ kind: 'category', label: 'Developer tools', slug: 'developer-tools' }],
};

describe('Builds and Labs public collections', () => {
  it('renders an editorial collection empty state without fabricated records', () => {
    const markup = renderToStaticMarkup(<PublicCollectionIndex type="build" entries={[]} />);

    expect(markup).toContain('<h1 id="collection-title">Products built to remain useful.</h1>');
    expect(markup).toContain('Public record / no eligible entries');
    expect(markup).not.toContain('Release Ledger');
  });

  it('renders a semantic collection grid with metadata and taxonomy', () => {
    const markup = renderToStaticMarkup(
      <PublicCollectionIndex type="build" entries={[buildSummary]} />,
    );

    expect(markup.match(/<h1/g)).toHaveLength(1);
    expect(markup).toContain('href="/builds/release-ledger"');
    expect(markup).toContain('HZ-BL-101');
    expect(markup).toContain('TypeScript');
    expect(markup).toContain('href="/search?q=TypeScript"');
  });

  it('renders Work category filters as URL-addressable server navigation', () => {
    const markup = renderToStaticMarkup(
      <PublicCollectionIndex
        type="work"
        entries={[workSummary]}
        categoryFilters={workSummary.categories}
        activeCategory="developer-tools"
      />,
    );

    expect(markup).toContain('aria-label="Filter Work by category"');
    expect(markup).toContain('href="/work?category=developer-tools"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('Developer tools');
    expect(markup).toContain('href="/work?category=developer-tools"');
  });

  it('renders Work as a long-form engineering publication with typed continuation paths', () => {
    const detail: Extract<PublicEntityDetail, { type: 'work' }> = {
      ...workSummary,
      links: [],
      documents: [
        {
          role: 'caseStudy',
          outline: [{ id: 'constraint', level: 2, text: 'Constraint' }],
          blocks: [
            { id: 'constraint', type: 'heading', data: { level: 2, text: 'Constraint' } },
            {
              id: 'decision',
              type: 'paragraph',
              data: { text: 'The review boundary was made explicit before implementation.' },
            },
            {
              id: 'milestones',
              type: 'timeline',
              data: {
                events: [
                  {
                    date: '2026-06',
                    title: 'Review boundary agreed',
                    description: 'The decision record became the source of truth.',
                  },
                ],
              },
            },
            {
              id: 'decision-record',
              type: 'fileAttachment',
              data: { url: 'https://example.com/decision.pdf', fileName: 'Decision record.pdf' },
            },
          ],
        },
      ],
      relationships: [
        {
          kind: 'buildAppliedInWork',
          label: 'Informed by',
          target: { type: 'build', title: 'Release Ledger', url: '/builds/release-ledger' },
        },
        {
          kind: 'noteDiscussesArtifact',
          label: 'Engineering notes',
          target: { type: 'note', title: 'Review boundaries', url: '/notes/review-boundaries' },
        },
        {
          kind: 'workRelatedLab',
          label: 'Related investigation',
          target: { type: 'lab', title: 'Review systems Lab', url: '/labs/review-systems' },
        },
        {
          kind: 'teamContributedToEntry',
          label: 'Engineering contributor',
          target: {
            type: 'engineeringProfile',
            title: 'Public Engineer',
            url: '/engineering/public-engineer',
            role: 'Founder & Full-Stack Engineer',
          },
        },
      ],
    };
    const markup = renderToStaticMarkup(<PublicCollectionDetail entity={detail} />);

    expect(markup).toContain('Work / engineering case study');
    expect(markup).toContain('Context to consequence');
    expect(markup).toContain('Review boundary agreed');
    expect(markup).toContain('Decision record.pdf');
    expect(markup).toContain('Continue through the engineering record');
    expect(markup).toContain('Engineering foundations');
    expect(markup).toContain('Engineering notes');
    expect(markup).toContain('Connected investigations');
    expect(markup).toContain('Return to Work');

    // Engineering contributors render as publication metadata, before the case study body.
    expect(markup).toContain('Contributors');
    expect(markup).toContain('Public Engineer');
    expect(markup).toContain('Founder &amp; Full-Stack Engineer');
    expect(markup).toContain('href="/engineering/public-engineer"');
    expect(markup.indexOf('Contributors')).toBeLessThan(markup.indexOf('Context to consequence'));
    // No longer duplicated further down as a relationship group.
    expect(markup).not.toContain('Engineering attribution');
  });

  it('renders Build Documents, external destinations, and typed lineage', () => {
    const detail: Extract<PublicEntityDetail, { type: 'build' }> = {
      ...buildSummary,
      documents: [
        {
          role: 'caseStudy',
          blocks: [{ id: 'product-context', type: 'heading', data: { level: 2, text: 'Context' } }],
        },
        {
          role: 'technical',
          blocks: [
            { id: 'architecture', type: 'heading', data: { level: 2, text: 'Architecture' } },
          ],
        },
      ],
      relationships: [
        {
          kind: 'labGraduatedToBuild',
          label: 'Originated in',
          target: {
            type: 'lab',
            title: labSummary.title,
            url: labSummary.url,
            referenceId: labSummary.referenceId,
          },
        },
        {
          kind: 'teamContributedToEntry',
          label: 'Engineering contributor',
          target: {
            type: 'engineeringProfile',
            title: 'Public Engineer',
            url: '/engineering/public-engineer',
            role: 'Backend Engineer',
          },
        },
      ],
      gallery: [],
    };
    const markup = renderToStaticMarkup(<PublicCollectionDetail entity={detail} />);

    expect(markup.match(/<h1/g)).toHaveLength(1);
    expect(markup).toContain('Product story');
    expect(markup).toContain('Architecture and decisions');
    expect(markup).toContain('<h3 id="product-context">Context</h3>');
    expect(markup).toContain('href="/labs/cache-consistency-study"');
    expect(markup).toContain('opens in a new tab');

    // Engineering contributors render as publication metadata, before the case study body.
    expect(markup).toContain('Contributors');
    expect(markup).toContain('Public Engineer');
    expect(markup).toContain('Backend Engineer');
    expect(markup.indexOf('Contributors')).toBeLessThan(markup.indexOf('Product story'));
  });

  it('renders Lab state, milestones, and research Documents in narrative order', () => {
    const detail: Extract<PublicEntityDetail, { type: 'lab' }> = {
      ...labSummary,
      documents: [
        {
          role: 'engineeringJournal',
          blocks: [{ id: 'journal-entry', type: 'paragraph', data: { text: 'Observed result.' } }],
        },
      ],
      relationships: [
        {
          kind: 'teamContributedToEntry',
          label: 'Engineering contributor',
          target: {
            type: 'engineeringProfile',
            title: 'Public Engineer',
            url: '/engineering/public-engineer',
            role: 'Backend Engineer',
          },
        },
      ],
      graduationCriteria: 'The resolver remains deterministic across every visibility transition.',
      gallery: [],
      milestones: [
        {
          title: 'Conflict matrix complete',
          date: '2026-07-18T00:00:00.000Z',
          summary: 'Every exclusive-edge conflict now has an expected public outcome.',
        },
      ],
    };
    const markup = renderToStaticMarkup(<PublicCollectionDetail entity={detail} />);

    expect(markup.indexOf('What the investigation is moving toward')).toBeLessThan(
      markup.indexOf('Engineering journal'),
    );
    expect(markup).toContain('Conflict matrix complete');
    expect(markup).toContain('Graduation criteria');

    // Engineering contributors render as publication metadata, before the research Documents.
    expect(markup).toContain('Contributors');
    expect(markup).toContain('Public Engineer');
    expect(markup.indexOf('Contributors')).toBeLessThan(markup.indexOf('Engineering journal'));
    expect(markup).toContain('Updated');
  });
});
