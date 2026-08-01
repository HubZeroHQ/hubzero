import { describe, expect, it } from 'vitest';
import { groupResults, MATCH_TIER, matchTier, rankResults } from './ranking';
import type { SearchResult } from './types';

function result(
  overrides: Partial<SearchResult> & Pick<SearchResult, 'id' | 'title'>,
): SearchResult {
  return {
    type: 'work',
    href: `/studio/content/work/${overrides.id}`,
    ...overrides,
  };
}

describe('matchTier', () => {
  const entry = result({
    id: '1',
    title: 'Bhatkal Time Luxe',
    slug: 'bhatkal-time-luxe',
    referenceId: 'HZ-WK-001',
  });

  it('ranks an exact reference ID highest, punctuation and case aside', () => {
    expect(matchTier('HZ-WK-001', entry)).toBe(MATCH_TIER.exactReferenceId);
    expect(matchTier('hz wk 001', entry)).toBe(MATCH_TIER.exactReferenceId);
    expect(matchTier('hzwk001', entry)).toBe(MATCH_TIER.exactReferenceId);
  });

  it('ranks an exact title or slug next', () => {
    expect(matchTier('Bhatkal Time Luxe', entry)).toBe(MATCH_TIER.exactTitle);
    expect(matchTier('bhatkal-time-luxe', entry)).toBe(MATCH_TIER.exactTitle);
  });

  it('ranks prefixes below exact matches but above word prefixes', () => {
    expect(matchTier('hz-wk', entry)).toBe(MATCH_TIER.referenceIdPrefix);
    expect(matchTier('bhatkal', entry)).toBe(MATCH_TIER.titlePrefix);
    expect(matchTier('luxe', entry)).toBe(MATCH_TIER.wordPrefix);
  });

  it('falls back to substring for a mid-word match', () => {
    expect(matchTier('ux', entry)).toBe(MATCH_TIER.substring);
  });

  it('matches the subtitle only as a substring, never as an identity', () => {
    const tagged = result({ id: '2', title: 'Alpha', subtitle: 'technology' });
    expect(matchTier('technology', tagged)).toBe(MATCH_TIER.substring);
  });

  it('reports no match for an unrelated query or an empty one', () => {
    expect(matchTier('zzz', entry)).toBe(MATCH_TIER.none);
    expect(matchTier('', entry)).toBe(MATCH_TIER.none);
    expect(matchTier('   ', entry)).toBe(MATCH_TIER.none);
  });

  it('does not treat an entry without a reference ID as matching an empty one', () => {
    const noRef = result({ id: '3', title: 'Alpha' });
    expect(matchTier('alpha', noRef)).toBe(MATCH_TIER.exactTitle);
  });
});

describe('rankResults', () => {
  it('puts an exact title above an unrelated entry whose reference ID contains the query', () => {
    // The regression this ordering fixes: the previous rule ranked *any*
    // reference-ID substring above every title match.
    const results = rankResults('atlas', [
      result({ id: 'a', title: 'Something else', referenceId: 'HZ-WK-ATLAS' }),
      result({ id: 'b', title: 'Atlas' }),
    ]);

    expect(results.map((entry) => entry.id)).toEqual(['b', 'a']);
  });

  it('orders exact, prefix, word prefix, then substring', () => {
    const results = rankResults('time', [
      result({ id: 'substring', title: 'Overtimer' }),
      result({ id: 'word', title: 'Bhatkal Time Luxe' }),
      result({ id: 'prefix', title: 'Timeline tool' }),
      result({ id: 'exact', title: 'Time' }),
    ]);

    expect(results.map((entry) => entry.id)).toEqual(['exact', 'prefix', 'word', 'substring']);
  });

  it('drops non-matches entirely', () => {
    const results = rankResults('atlas', [
      result({ id: 'a', title: 'Atlas' }),
      result({ id: 'b', title: 'Unrelated' }),
    ]);

    expect(results).toHaveLength(1);
  });

  it('returns nothing for an empty query rather than the whole index', () => {
    expect(rankResults('', [result({ id: 'a', title: 'Atlas' })])).toEqual([]);
  });

  it('is deterministic for duplicate names, breaking ties on title then id', () => {
    const input = [
      result({ id: 'z', title: 'Atlas' }),
      result({ id: 'a', title: 'Atlas' }),
      result({ id: 'm', title: 'Atlas' }),
    ];

    const forward = rankResults('atlas', input).map((entry) => entry.id);
    const reversed = rankResults('atlas', [...input].reverse()).map((entry) => entry.id);

    expect(forward).toEqual(['a', 'm', 'z']);
    expect(reversed).toEqual(forward);
  });

  it('ranks across collections, not within one', () => {
    const results = rankResults('atlas', [
      result({ id: 'note', type: 'notes', title: 'Atlas retrospective' }),
      result({ id: 'work', type: 'work', title: 'Atlas' }),
    ]);

    expect(results[0]?.id).toBe('work');
  });

  it('keeps hidden-status entries searchable — Studio search is not the public index', () => {
    const results = rankResults('atlas', [
      result({ id: 'draft', title: 'Atlas', status: 'draft' }),
      result({ id: 'archived', title: 'Atlas archive', status: 'archived' }),
    ]);

    expect(results).toHaveLength(2);
    expect(results.map((entry) => entry.status)).toContain('draft');
  });
});

describe('groupResults', () => {
  it('groups by collection while preserving overall rank between groups', () => {
    const ranked = rankResults('atlas', [
      result({ id: 'n1', type: 'notes', title: 'Atlas notes' }),
      result({ id: 'w1', type: 'work', title: 'Atlas' }),
      result({ id: 'n2', type: 'notes', title: 'Atlas addendum' }),
    ]);

    const groups = groupResults(ranked);

    // Work leads because it holds the single best match, not because of a
    // fixed collection order.
    expect(groups.map((group) => group.type)).toEqual(['work', 'notes']);
    expect(groups[1]?.results).toHaveLength(2);
  });

  it('returns no groups for no results', () => {
    expect(groupResults([])).toEqual([]);
  });
});
