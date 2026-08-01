import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HealthIssue } from './types';

/**
 * The inspector's only real logic is *selection*: which of the site-wide
 * findings belong to this entry. These tests exist to prove it selects rather
 * than computes — no verdict here is produced by the inspector, so a rule
 * change must flow through untouched.
 */

const loadHealthReport = vi.fn();
const findByOwner = vi.fn();
const findLatestForDocument = vi.fn();

vi.mock('./service', () => ({ loadHealthReport: () => loadHealthReport() }));
vi.mock('@/lib/db/repositories/document', () => ({
  documentRepository: { findByOwner: (...a: unknown[]) => findByOwner(...a) },
}));
vi.mock('@/lib/db/repositories/document-version', () => ({
  documentVersionRepository: {
    findLatestForDocument: (...a: unknown[]) => findLatestForDocument(...a),
  },
}));

const { loadEntryInspection } = await import('./inspector');

const ENTRY_ID = '6a6e223fb07aa1a78a469d33';
const OTHER_ID = '6a6e223fb07aa1a78a469d34';

function entry(overrides: Record<string, unknown> = {}) {
  return {
    id: ENTRY_ID,
    slug: 'edge-caching',
    referenceId: 'HZ-BP-701',
    label: 'Edge Caching Blueprint',
    status: 'published',
    featuredOrder: 2,
    updatedAt: new Date('2026-08-01T10:00:00Z'),
    homepage: { kind: 'eligible' },
    ...overrides,
  };
}

function issue(overrides: Partial<HealthIssue> = {}): HealthIssue {
  return {
    id: 'featured-invisible:blueprints:x',
    section: 'featured',
    severity: 'warning',
    title: 'Something is wrong',
    detail: 'Because of a reason',
    remedy: 'Do the thing',
    href: '/studio/content/blueprints/featured',
    ...overrides,
  } as HealthIssue;
}

function report(overrides: Record<string, unknown> = {}) {
  return {
    sections: [],
    counts: { critical: 0, warning: 0, info: 0 },
    healthy: true,
    generatedAt: new Date('2026-08-01T12:00:00Z'),
    collections: [
      {
        key: 'blueprints',
        label: 'Blueprints',
        listPath: '/studio/content/blueprints',
        featuredPath: '/studio/content/blueprints/featured',
        entries: [entry()],
      },
    ],
    relationshipIssues: [],
    ...overrides,
  };
}

const INPUT = {
  collectionKey: 'blueprints',
  entryId: ENTRY_ID,
  editHref: `/studio/content/blueprints/${ENTRY_ID}/edit`,
};

beforeEach(() => {
  vi.clearAllMocks();
  findByOwner.mockResolvedValue([]);
  findLatestForDocument.mockResolvedValue(null);
  loadHealthReport.mockResolvedValue(report());
});

describe('loadEntryInspection', () => {
  it('returns null when the entry is not in the health snapshot', async () => {
    expect(await loadEntryInspection({ ...INPUT, entryId: OTHER_ID })).toBeNull();
  });

  it('reads the entry facts from the report rather than re-fetching the record', async () => {
    const inspection = await loadEntryInspection(INPUT);

    expect(inspection?.entry.status).toBe('published');
    expect(inspection?.featured).toEqual({ isFeatured: true, position: 2 });
    expect(inspection?.entry.homepage).toEqual({ kind: 'eligible' });
    // One health load, and no second read of the entry itself.
    expect(loadHealthReport).toHaveBeenCalledTimes(1);
  });

  describe('issue selection', () => {
    it('selects only findings naming this entry', async () => {
      loadHealthReport.mockResolvedValue(
        report({
          sections: [
            {
              key: 'featured',
              label: 'Featured',
              description: '',
              issues: [
                issue({ id: 'mine', entity: { id: ENTRY_ID, label: 'Edge Caching Blueprint' } }),
                issue({ id: 'theirs', entity: { id: OTHER_ID, label: 'Another' } }),
              ],
            },
          ],
        }),
      );

      const inspection = await loadEntryInspection(INPUT);

      expect(inspection?.issues.map((i) => i.id)).toEqual(['mine']);
    });

    /**
     * "No Blueprints are featured" is true of a collection, not of an entry.
     * Showing it in one entry's panel would invite an editor to fix it from a
     * screen that cannot.
     */
    it('excludes aggregate findings that name no entry', async () => {
      loadHealthReport.mockResolvedValue(
        report({
          sections: [
            {
              key: 'homepageCoverage',
              label: 'Homepage',
              description: '',
              issues: [issue({ id: 'homepage-empty:blueprints' })],
            },
          ],
        }),
      );

      expect((await loadEntryInspection(INPUT))?.issues).toEqual([]);
    });

    it('passes severity, wording, remedy and destination through untouched', async () => {
      const original = issue({
        id: 'mine',
        severity: 'critical',
        title: 'Exact title',
        detail: 'Exact detail',
        remedy: 'Exact remedy',
        href: '/exact/href',
        entity: { id: ENTRY_ID, label: 'Edge Caching Blueprint' },
      });
      loadHealthReport.mockResolvedValue(
        report({ sections: [{ key: 'featured', label: '', description: '', issues: [original] }] }),
      );

      const inspection = await loadEntryInspection(INPUT);

      // Identical object, not a re-phrased copy: the panel and the dashboard
      // must read the same for the same problem.
      expect(inspection?.issues[0]).toBe(original);
      expect(inspection?.counts).toEqual({ critical: 1, warning: 0, info: 0 });
    });

    it('selects relationship defects the entry holds, not ones pointing at it', async () => {
      loadHealthReport.mockResolvedValue(
        report({
          relationshipIssues: [
            { id: 'held', severity: 'critical', source: { id: ENTRY_ID }, kind: 'missingTarget' },
            { id: 'inbound', severity: 'warning', source: { id: OTHER_ID }, kind: 'hiddenTarget' },
          ],
        }),
      );

      const inspection = await loadEntryInspection(INPUT);

      expect(inspection?.relationshipIssues.map((i) => i.id)).toEqual(['held']);
    });
  });

  describe('documents', () => {
    it('reports a missing document rather than omitting the row', async () => {
      const inspection = await loadEntryInspection(INPUT);

      expect(inspection?.documents).toEqual([
        expect.objectContaining({ role: 'caseStudy', exists: false, blockCount: 0 }),
      ]);
      // Nothing exists, so no version lookup is issued at all.
      expect(findLatestForDocument).not.toHaveBeenCalled();
    });

    it('reports block count, last edit and latest snapshot for a document that exists', async () => {
      findByOwner.mockResolvedValue([
        {
          _id: { toString: () => 'doc1' },
          role: 'caseStudy',
          blocks: [{}, {}, {}],
          updatedAt: new Date('2026-08-01T09:00:00Z'),
        },
      ]);
      findLatestForDocument.mockResolvedValue({ createdAt: new Date('2026-08-01T08:00:00Z') });

      const inspection = await loadEntryInspection(INPUT);

      expect(inspection?.documents[0]).toMatchObject({
        role: 'caseStudy',
        exists: true,
        blockCount: 3,
      });
      expect(inspection?.documents[0]?.latestVersionAt?.toISOString()).toBe(
        '2026-08-01T08:00:00.000Z',
      );
    });
  });

  describe('public routes', () => {
    it('builds the public route through the shared adapter', async () => {
      const inspection = await loadEntryInspection(INPUT);

      expect(inspection?.public.slug).toBe('edge-caching');
      expect(inspection?.public.route).toBe('/blueprints/edge-caching');
    });

    it('reports no public route for a collection without a detail page', async () => {
      loadHealthReport.mockResolvedValue(
        report({
          collections: [
            {
              key: 'team',
              label: 'Team',
              listPath: '/studio/team',
              entries: [entry()],
            },
          ],
        }),
      );

      const inspection = await loadEntryInspection({ ...INPUT, collectionKey: 'team' });

      expect(inspection?.public.route).toBeNull();
    });
  });

  it('reports an unfeatured entry as having no position', async () => {
    loadHealthReport.mockResolvedValue(
      report({
        collections: [
          {
            key: 'blueprints',
            label: 'Blueprints',
            listPath: '/studio/content/blueprints',
            featuredPath: '/studio/content/blueprints/featured',
            entries: [entry({ featuredOrder: null })],
          },
        ],
      }),
    );

    expect((await loadEntryInspection(INPUT))?.featured).toEqual({
      isFeatured: false,
      position: null,
    });
  });
});
