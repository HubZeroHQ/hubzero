import { describe, expect, it } from 'vitest';
import type { FeaturedCollectionEntry } from '@/lib/studio/featured-collections';
import type { ReferenceId, ReferenceIdPrefix } from '@/types/studio';
import {
  buildSections,
  emptyHomepageSections,
  featuredButInvisible,
  nonCanonicalFeaturedOrder,
  publishedButIneligible,
  publishingCounts,
  recentActivity,
  relationshipDefects,
  reviewQueue,
  type HealthCollectionSnapshot,
  type HealthSnapshot,
} from './rules';
import { countBySeverity } from './types';

const now = new Date('2026-08-01T00:00:00.000Z');

function entry(overrides: Partial<FeaturedCollectionEntry> = {}): FeaturedCollectionEntry {
  return {
    id: overrides.id ?? 'id-1',
    slug: 'slug',
    referenceId: 'HZ-BP-001' as ReferenceId<ReferenceIdPrefix>,
    label: 'An entry',
    status: 'published',
    featuredOrder: null,
    updatedAt: now,
    homepage: { kind: 'eligible' },
    ...overrides,
  };
}

function collection(overrides: Partial<HealthCollectionSnapshot> = {}): HealthCollectionSnapshot {
  return {
    key: 'blueprints',
    label: 'Blueprints',
    listPath: '/studio/content/blueprints',
    featuredPath: '/studio/content/blueprints/featured',
    entries: [],
    ...overrides,
  };
}

function snapshot(collections: HealthCollectionSnapshot[]): HealthSnapshot {
  return {
    collections,
    relationshipIssues: { critical: 0, warning: 0, info: 0 },
    now,
  };
}

describe('featuredButInvisible', () => {
  it('reports a featured entry that does not qualify, quoting the public reason', () => {
    const issues = featuredButInvisible(
      snapshot([
        collection({
          entries: [
            entry({
              featuredOrder: 1,
              homepage: { kind: 'ineligible', reason: 'Needs at least one preview image.' },
            }),
          ],
        }),
      ]),
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.severity).toBe('warning');
    expect(issues[0]?.detail).toContain('Needs at least one preview image.');
    expect(issues[0]?.remedy).not.toBe('');
  });

  it('reports a featured but unpublished entry differently from an ineligible one', () => {
    const issues = featuredButInvisible(
      snapshot([
        collection({
          entries: [
            entry({ featuredOrder: 1, status: 'draft', homepage: { kind: 'notPublished' } }),
          ],
        }),
      ]),
    );

    expect(issues[0]?.detail).toContain('not published');
    expect(issues[0]?.remedy).toContain('Publish it');
  });

  it('stays silent when every featured entry qualifies', () => {
    const issues = featuredButInvisible(
      snapshot([collection({ entries: [entry({ featuredOrder: 1 })] })]),
    );
    expect(issues).toEqual([]);
  });
});

describe('nonCanonicalFeaturedOrder', () => {
  it('is silent on a canonical 1..N order', () => {
    const issues = nonCanonicalFeaturedOrder(
      snapshot([
        collection({
          entries: [
            entry({ id: 'a', featuredOrder: 1 }),
            entry({ id: 'b', featuredOrder: 2 }),
            entry({ id: 'c', featuredOrder: 3 }),
          ],
        }),
      ]),
    );
    expect(issues).toEqual([]);
  });

  it('reports duplicate positions as critical', () => {
    const issues = nonCanonicalFeaturedOrder(
      snapshot([
        collection({
          entries: [entry({ id: 'a', featuredOrder: 1 }), entry({ id: 'b', featuredOrder: 1 })],
        }),
      ]),
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.severity).toBe('critical');
    expect(issues[0]?.title).toContain('duplicate');
  });

  it('reports gaps as critical — the 1, 3, 9, 14 shape', () => {
    const issues = nonCanonicalFeaturedOrder(
      snapshot([
        collection({
          entries: [
            entry({ id: 'a', featuredOrder: 1 }),
            entry({ id: 'b', featuredOrder: 3 }),
            entry({ id: 'c', featuredOrder: 9 }),
          ],
        }),
      ]),
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.severity).toBe('critical');
    expect(issues[0]?.detail).toContain('1, 3, 9');
  });

  it('reports an invalid stored position per entry', () => {
    const issues = nonCanonicalFeaturedOrder(
      snapshot([collection({ entries: [entry({ id: 'a', featuredOrder: 2.5 })] })]),
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.severity).toBe('critical');
    expect(issues[0]?.entity?.label).toBe('An entry');
  });
});

describe('emptyHomepageSections', () => {
  it('reports a collection with eligible content but nothing featured', () => {
    const issues = emptyHomepageSections(
      snapshot([collection({ entries: [entry(), entry({ id: 'b' })] })]),
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.severity).toBe('warning');
    expect(issues[0]?.href).toBe('/studio/content/blueprints/featured');
  });

  it('does not report a collection with nothing eligible — an empty section is then honest', () => {
    const issues = emptyHomepageSections(
      snapshot([
        collection({ entries: [entry({ status: 'draft', homepage: { kind: 'notPublished' } })] }),
      ]),
    );
    expect(issues).toEqual([]);
  });

  it('does not report a collection that already has something featured', () => {
    const issues = emptyHomepageSections(
      snapshot([collection({ entries: [entry({ featuredOrder: 1 })] })]),
    );
    expect(issues).toEqual([]);
  });

  it('skips collections that do not support featuring at all', () => {
    const issues = emptyHomepageSections(
      snapshot([
        collection({ key: 'team', label: 'Team', featuredPath: undefined, entries: [entry()] }),
      ]),
    );
    expect(issues).toEqual([]);
  });
});

describe('publishedButIneligible', () => {
  it('reports a live entry that cannot reach the homepage bar, as info not a defect', () => {
    const issues = publishedButIneligible(
      snapshot([
        collection({
          entries: [
            entry({ homepage: { kind: 'ineligible', reason: 'Needs a substantive case study.' } }),
          ],
        }),
      ]),
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.severity).toBe('info');
    expect(issues[0]?.detail).toContain('Needs a substantive case study.');
  });

  it('does not double-report something already flagged as featured-but-invisible', () => {
    const issues = publishedButIneligible(
      snapshot([
        collection({
          entries: [
            entry({ featuredOrder: 1, homepage: { kind: 'ineligible', reason: 'Needs media.' } }),
          ],
        }),
      ]),
    );
    expect(issues).toEqual([]);
  });
});

describe('reviewQueue', () => {
  it('reports work awaiting review and work approved but unpublished separately', () => {
    const issues = reviewQueue(
      snapshot([
        collection({
          entries: [entry({ id: 'a', status: 'inReview' }), entry({ id: 'b', status: 'approved' })],
        }),
      ]),
    );

    expect(issues).toHaveLength(2);
    expect(issues.every((issue) => issue.severity === 'warning')).toBe(true);
    expect(issues[0]?.href).toContain('status=inReview');
    expect(issues[1]?.href).toContain('status=approved');
  });

  it('is silent when nothing is queued', () => {
    expect(reviewQueue(snapshot([collection({ entries: [entry()] })]))).toEqual([]);
  });
});

describe('publishingCounts', () => {
  it('summarizes each collection as info, including empty ones', () => {
    const issues = publishingCounts(
      snapshot([
        collection({ entries: [entry(), entry({ id: 'b', status: 'draft' })] }),
        collection({ key: 'labs', label: 'Labs', entries: [] }),
      ]),
    );

    expect(issues).toHaveLength(2);
    expect(issues.every((issue) => issue.severity === 'info')).toBe(true);
    expect(issues[0]?.detail).toContain('1 published');
    expect(issues[1]?.detail).toBe('No entries yet.');
  });
});

describe('recentActivity', () => {
  it('reports only collections edited within the last seven days', () => {
    const stale = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const issues = recentActivity(
      snapshot([
        collection({ entries: [entry({ updatedAt: now })] }),
        collection({ key: 'labs', label: 'Labs', entries: [entry({ updatedAt: stale })] }),
      ]),
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.title).toContain('Blueprints');
  });
});

describe('relationshipDefects', () => {
  it('reports dangling references as critical and orphans as info', () => {
    const issues = relationshipDefects({
      ...snapshot([]),
      relationshipIssues: { critical: 2, warning: 0, info: 1 },
    });

    expect(issues.map((issue) => issue.severity)).toEqual(['critical', 'info']);
  });

  it('is silent when the graph is intact', () => {
    expect(relationshipDefects(snapshot([]))).toEqual([]);
  });
});

describe('buildSections', () => {
  it('returns every section even when healthy, so an empty one still explains itself', () => {
    const sections = buildSections(
      snapshot([collection({ entries: [entry({ featuredOrder: 1 })] })]),
    );

    expect(sections.map((section) => section.key)).toEqual([
      'featured',
      'homepageCoverage',
      'brokenRelationships',
      'reviewQueue',
      'missingContent',
      'publishing',
      'recentActivity',
    ]);
    expect(sections.every((section) => section.description !== '')).toBe(true);
  });

  it('orders issues most severe first within a section', () => {
    const sections = buildSections(
      snapshot([
        collection({
          entries: [
            entry({ id: 'a', featuredOrder: 1 }),
            entry({ id: 'b', featuredOrder: 1, homepage: { kind: 'notPublished' } }),
          ],
        }),
      ]),
    );

    const featured = sections.find((section) => section.key === 'featured');
    expect(featured?.issues[0]?.severity).toBe('critical');
  });

  it('gives every issue an actionable remedy and destination', () => {
    const sections = buildSections(
      snapshot([
        collection({
          entries: [
            entry({ id: 'a', status: 'inReview' }),
            entry({ id: 'b', homepage: { kind: 'ineligible', reason: 'Needs media.' } }),
          ],
        }),
      ]),
    );

    const issues = sections.flatMap((section) => section.issues);
    expect(issues.length).toBeGreaterThan(0);
    for (const issue of issues) {
      expect(issue.remedy.length).toBeGreaterThan(0);
      expect(issue.href.startsWith('/studio')).toBe(true);
    }
  });

  it('reports a fully healthy site as no critical or warning issues', () => {
    const sections = buildSections(
      snapshot([collection({ entries: [entry({ featuredOrder: 1 })] })]),
    );
    const counts = countBySeverity(sections.flatMap((section) => section.issues));

    expect(counts.critical).toBe(0);
    expect(counts.warning).toBe(0);
  });

  it('reports an entirely empty Studio without inventing problems', () => {
    const sections = buildSections(snapshot([collection({ entries: [] })]));
    const counts = countBySeverity(sections.flatMap((section) => section.issues));

    expect(counts.critical).toBe(0);
    expect(counts.warning).toBe(0);
  });
});

describe('absent featuredOrder', () => {
  it('treats a record written before the field existed as unfeatured, not as corrupt', () => {
    // Regression: `undefined !== null` is true, so a `!== null` filter read every
    // pre-migration record as "featured with an invalid position" and the
    // dashboard reported a wall of false criticals.
    const legacy = { ...entry(), featuredOrder: undefined as unknown as number | null };
    const issues = [
      ...nonCanonicalFeaturedOrder(snapshot([collection({ entries: [legacy] })])),
      ...featuredButInvisible(snapshot([collection({ entries: [legacy] })])),
    ];

    expect(issues).toEqual([]);
  });

  it('still reports an empty homepage section for such records', () => {
    const legacy = { ...entry(), featuredOrder: undefined as unknown as number | null };
    const issues = emptyHomepageSections(snapshot([collection({ entries: [legacy] })]));

    expect(issues).toHaveLength(1);
  });
});
