import type { SearchResult } from './types';

/**
 * Studio search ranking (v3.1 Milestone 5).
 *
 * Search here is *navigation*, not retrieval: an editor almost always has a
 * specific entry in mind and is typing the shortest thing that identifies it.
 * Ranking is therefore about how confidently a match identifies one record,
 * not about term frequency or relevance scoring.
 *
 * The previous rule — "anything whose reference ID contains the query, then
 * alphabetical" — put an exact title match below an unrelated entry whose
 * reference ID happened to contain the same digits. These tiers fix the
 * ordering without introducing a scoring model nobody can predict.
 */

/** Lower is better. Ties are broken deterministically, never by input order. */
export const MATCH_TIER = {
  exactReferenceId: 0,
  exactTitle: 1,
  referenceIdPrefix: 2,
  titlePrefix: 3,
  slugPrefix: 4,
  wordPrefix: 5,
  substring: 6,
  none: 99,
} as const;

export type MatchTier = (typeof MATCH_TIER)[keyof typeof MATCH_TIER];

/** Reference IDs are typed with punctuation an editor may or may not include (`HZ-WK-014`, `hz wk 014`, `wk014`). */
function loose(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function plain(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * How strongly `query` identifies this result.
 *
 * Reference IDs occupy the top tier because they are unique by construction —
 * an editor who types one has named exactly one record and should never have
 * to scan a list. Title matches follow, then prefixes, then word prefixes
 * ("time luxe" finding "Bhatkal Time Luxe"), then plain substrings.
 */
export function matchTier(query: string, result: SearchResult): MatchTier {
  const q = plain(query);
  if (q === '') return MATCH_TIER.none;

  const looseQuery = loose(query);
  const title = plain(result.title);
  const slug = plain(result.slug ?? '');
  const referenceId = result.referenceId ? loose(result.referenceId) : '';
  const subtitle = plain(result.subtitle ?? '');

  if (referenceId !== '' && looseQuery !== '' && referenceId === looseQuery) {
    return MATCH_TIER.exactReferenceId;
  }
  if (title === q || slug === q) return MATCH_TIER.exactTitle;
  if (referenceId !== '' && looseQuery !== '' && referenceId.startsWith(looseQuery)) {
    return MATCH_TIER.referenceIdPrefix;
  }
  if (title.startsWith(q)) return MATCH_TIER.titlePrefix;
  if (slug.startsWith(q)) return MATCH_TIER.slugPrefix;

  // Word prefix: the query begins one of the words in the title or slug, so
  // "luxe" finds "Bhatkal Time Luxe" above an entry that merely contains
  // "luxe" mid-word.
  const words = [...title.split(/\s+/), ...slug.split(/-/)];
  if (words.some((word) => word.startsWith(q))) return MATCH_TIER.wordPrefix;

  if (
    title.includes(q) ||
    slug.includes(q) ||
    subtitle.includes(q) ||
    (referenceId !== '' && looseQuery !== '' && referenceId.includes(looseQuery))
  ) {
    return MATCH_TIER.substring;
  }

  return MATCH_TIER.none;
}

export interface RankedSearchResult extends SearchResult {
  tier: MatchTier;
}

/**
 * Filters to matches and orders them.
 *
 * Determinism matters more than cleverness: the same query must always
 * produce the same order, so ties fall back to title and then to id rather
 * than to whichever adapter resolved first.
 */
export function rankResults(query: string, results: readonly SearchResult[]): RankedSearchResult[] {
  return results
    .map((result) => ({ ...result, tier: matchTier(query, result) }))
    .filter((result) => result.tier !== MATCH_TIER.none)
    .sort((left, right) => {
      if (left.tier !== right.tier) return left.tier - right.tier;
      const byTitle = left.title.localeCompare(right.title);
      if (byTitle !== 0) return byTitle;
      return left.id.localeCompare(right.id);
    });
}

export interface SearchResultGroup {
  type: SearchResult['type'];
  results: RankedSearchResult[];
}

/**
 * Groups by collection while preserving rank *between* groups: a collection
 * containing the single best match leads, rather than groups appearing in a
 * fixed order that buries the obvious answer.
 */
export function groupResults(results: readonly RankedSearchResult[]): SearchResultGroup[] {
  const groups = new Map<SearchResult['type'], RankedSearchResult[]>();
  for (const result of results) {
    groups.set(result.type, [...(groups.get(result.type) ?? []), result]);
  }
  return [...groups.entries()].map(([type, groupResultsForType]) => ({
    type,
    results: groupResultsForType,
  }));
}
