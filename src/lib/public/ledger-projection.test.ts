import { describe, expect, it } from 'vitest';
import type {
  PublicBuildSummary,
  PublicEntitySummary,
  PublicLabSummary,
  PublicNoteSummary,
  PublicWorkSummary,
} from './domain';
import { buildLedger, groupLedgerByYear } from './ledger-projection';

function note(title: string, publicationDate: string): PublicNoteSummary {
  return {
    type: 'note',
    title,
    slug: title,
    url: `/notes/${title}`,
    summary: 'A note.',
    referenceId: `NT-${title}`,
    publicationDate,
    author: { kind: 'organization', name: 'HubZero', url: '/about' },
    technologies: [],
  };
}

function lab(title: string, startDate: string, lastMajorUpdate?: string): PublicLabSummary {
  return {
    type: 'lab',
    title,
    slug: title,
    url: `/labs/${title}`,
    summary: 'A lab.',
    referenceId: `LB-${title}`,
    stage: 'exploring',
    researchDirection: 'Direction.',
    currentMilestone: 'Milestone.',
    startDate,
    ...(lastMajorUpdate ? { lastMajorUpdate } : {}),
    links: [],
    technologies: [],
  };
}

function work(title: string): PublicWorkSummary {
  return {
    type: 'work',
    title,
    slug: title,
    url: `/work/${title}`,
    summary: 'A work item.',
    referenceId: `WK-${title}`,
    clientType: 'Product',
    timeline: '12 weeks',
    hubZeroRole: 'Engineering',
    categories: [],
    technologies: [],
  };
}

function build(title: string): PublicBuildSummary {
  return {
    type: 'build',
    title,
    slug: title,
    url: `/builds/${title}`,
    summary: 'A build.',
    referenceId: `BL-${title}`,
    deploymentState: 'live',
    links: [],
    technologies: [],
  };
}

describe('buildLedger', () => {
  it('orders entries newest first across mixed entity types', () => {
    const entries = buildLedger([
      note('Older note', '2026-01-01T00:00:00.000Z'),
      lab('Newer lab', '2026-02-01T00:00:00.000Z', '2026-06-01T00:00:00.000Z'),
      note('Newest note', '2026-07-01T00:00:00.000Z'),
    ]);

    expect(entries.map((entry) => entry.entity.title)).toEqual([
      'Newest note',
      'Newer lab',
      'Older note',
    ]);
  });

  it('prefers a Lab’s curated lastMajorUpdate over its startDate when both exist', () => {
    const entries = buildLedger([
      lab('Ongoing lab', '2020-01-01T00:00:00.000Z', '2026-06-01T00:00:00.000Z'),
    ]);

    expect(entries).toEqual([expect.objectContaining({ date: '2026-06-01T00:00:00.000Z' })]);
  });

  it('falls back to startDate when a Lab has no curated lastMajorUpdate', () => {
    const entries = buildLedger([lab('New lab', '2026-05-01T00:00:00.000Z')]);

    expect(entries).toEqual([expect.objectContaining({ date: '2026-05-01T00:00:00.000Z' })]);
  });

  it('excludes Work, Build, and every other entity type with no trustworthy editorial date', () => {
    const entries = buildLedger([
      work('A work item'),
      build('A build'),
      note('A note', '2026-01-01T00:00:00.000Z'),
    ]);

    expect(entries.map((entry) => entry.entity.title)).toEqual(['A note']);
  });

  it('breaks same-date ties deterministically by title', () => {
    const entries = buildLedger([
      note('Zed', '2026-01-01T00:00:00.000Z'),
      note('Ada', '2026-01-01T00:00:00.000Z'),
    ]);

    expect(entries.map((entry) => entry.entity.title)).toEqual(['Ada', 'Zed']);
  });

  it('returns an empty ledger for an empty or fully-ineligible input, not an error', () => {
    expect(buildLedger([])).toEqual([]);
    expect(buildLedger([work('A work item'), build('A build')])).toEqual([]);
  });

  it('produces the same ordering across repeated calls (deterministic)', () => {
    const entities: PublicEntitySummary[] = [
      note('First', '2026-03-01T00:00:00.000Z'),
      lab('Second', '2026-02-01T00:00:00.000Z'),
    ];

    expect(buildLedger(entities)).toEqual(buildLedger(entities));
  });
});

describe('groupLedgerByYear', () => {
  it('groups contiguous same-year entries without re-sorting', () => {
    const entries = buildLedger([
      note('2026 A', '2026-05-01T00:00:00.000Z'),
      note('2026 B', '2026-01-01T00:00:00.000Z'),
      note('2025 A', '2025-11-01T00:00:00.000Z'),
    ]);

    expect(groupLedgerByYear(entries)).toEqual([
      { year: '2026', entries: [entries[0], entries[1]] },
      { year: '2025', entries: [entries[2]] },
    ]);
  });

  it('returns an empty list for an empty ledger', () => {
    expect(groupLedgerByYear([])).toEqual([]);
  });
});
