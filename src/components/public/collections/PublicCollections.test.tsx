import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PublicBuildSummary, PublicEntityDetail, PublicLabSummary } from '@/lib/public/domain';
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
      relationships: [],
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
    expect(markup).toContain('Updated');
  });
});
