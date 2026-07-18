import type { PublicDiscoveryEntry, PublicEntityType, PublicRelationship } from '../domain';

export interface PublicSearchQuery {
  query: string;
  limit?: number;
}

export interface PublicSearchRelationshipMatch {
  label: string;
  title: string;
  url: string;
}

export interface PublicSearchResult extends PublicDiscoveryEntry {
  matchedTerms: string[];
  matchedRelationships: PublicSearchRelationshipMatch[];
}

export interface PublicSearchProvider {
  search(query: PublicSearchQuery): Promise<PublicSearchResult[]>;
}

export interface PublicSearchEntryPoint {
  search(query: PublicSearchQuery): Promise<PublicSearchResult[]>;
}

const TYPE_LABELS: Record<PublicEntityType, string> = {
  work: 'work case study',
  build: 'build product',
  blueprint: 'blueprint foundation',
  lab: 'lab investigation',
  note: 'engineering note',
  engineeringProfile: 'engineering profile',
  teamMember: 'team member',
  service: 'service',
};

/** Keeps every public search consumer behind one normalized, bounded entry point. */
export function createPublicSearchEntryPoint(
  provider: PublicSearchProvider,
): PublicSearchEntryPoint {
  return {
    search: ({ query, limit = 12 }) => {
      const normalizedQuery = query.trim().slice(0, 120);
      return normalizedQuery
        ? provider.search({ query: normalizedQuery, limit: clampLimit(limit) })
        : Promise.resolve([]);
    },
  };
}

/**
 * Ranks an already-visible discovery projection in memory. The projection is
 * cached at the public repository boundary, so search never reaches Studio or
 * creates a second visibility interpretation.
 */
export function createInMemoryPublicSearchProvider(
  entries: readonly PublicDiscoveryEntry[],
): PublicSearchProvider {
  return {
    async search({ query, limit = 12 }) {
      const normalizedQuery = normalize(query);
      const queryTokens = tokenize(normalizedQuery);
      if (!queryTokens.length) return [];

      return entries
        .map((entry) => scoreEntry(entry, normalizedQuery, queryTokens))
        .filter((candidate): candidate is ScoredSearchResult => candidate !== null)
        .sort(
          (left, right) =>
            right.score - left.score || left.result.title.localeCompare(right.result.title),
        )
        .slice(0, clampLimit(limit))
        .map(({ result }) => result);
    },
  };
}

interface ScoredSearchResult {
  score: number;
  result: PublicSearchResult;
}

function scoreEntry(
  entry: PublicDiscoveryEntry,
  query: string,
  queryTokens: readonly string[],
): ScoredSearchResult | null {
  const title = normalize(entry.title);
  const summary = normalize(entry.summary);
  const reference = normalize(entry.referenceId ?? '');
  const state = normalize(entry.state ?? '');
  const author = normalize(entry.author?.name ?? '');
  const type = TYPE_LABELS[entry.type];
  const taxonomy = entry.taxonomy.map((term) => ({ original: term, normalized: normalize(term) }));
  const relationships = entry.relationships.map((relationship) => ({
    relationship,
    title: normalize(relationship.target.title),
    label: normalize(relationship.label),
  }));
  const searchable = [
    title,
    summary,
    reference,
    state,
    author,
    type,
    ...taxonomy.map((term) => term.normalized),
    ...relationships.flatMap((relationship) => [relationship.title, relationship.label]),
  ];

  if (!queryTokens.every((token) => searchable.some((value) => tokenMatches(token, value)))) {
    return null;
  }

  let score = 0;
  score += phraseScore(query, title, 150, 110, 80);
  score += phraseScore(query, reference, 120, 95, 70);
  score += phraseScore(query, type, 48, 36, 24);
  score += phraseScore(query, author, 64, 48, 32);
  score += phraseScore(query, state, 36, 28, 18);
  score += phraseScore(query, summary, 44, 36, 28);

  for (const token of queryTokens) {
    score += tokenFieldScore(token, title, 34);
    score += tokenFieldScore(token, summary, 10);
    score += tokenFieldScore(token, reference, 28);
    score += tokenFieldScore(token, type, 12);
    score += tokenFieldScore(token, author, 16);
    score += tokenFieldScore(token, state, 8);
  }

  const matchedTerms = taxonomy
    .filter(({ normalized }) => queryTokens.some((token) => tokenMatches(token, normalized)))
    .map(({ original }) => original);
  score += matchedTerms.length * 40;

  const matchedRelationships = relationships
    .filter(({ title: relatedTitle, label }) =>
      queryTokens.some((token) => tokenMatches(token, relatedTitle) || tokenMatches(token, label)),
    )
    .map(({ relationship }) => toRelationshipMatch(relationship));
  score += matchedRelationships.length * 26;

  return {
    score,
    result: {
      ...entry,
      matchedTerms,
      matchedRelationships,
    },
  };
}

function toRelationshipMatch(relationship: PublicRelationship): PublicSearchRelationshipMatch {
  return {
    label: relationship.label,
    title: relationship.target.title,
    url: relationship.target.url,
  };
}

function phraseScore(
  query: string,
  value: string,
  exact: number,
  prefix: number,
  contains: number,
): number {
  if (!value) return 0;
  if (value === query) return exact;
  if (value.startsWith(query)) return prefix;
  if (value.includes(query)) return contains;
  return 0;
}

function tokenFieldScore(token: string, value: string, weight: number): number {
  if (!value) return 0;
  if (value.split(' ').includes(token)) return weight;
  if (value.startsWith(token) || value.includes(` ${token}`)) return Math.round(weight * 0.75);
  if (tokenMatches(token, value)) return Math.round(weight * 0.4);
  return 0;
}

function tokenMatches(token: string, value: string): boolean {
  if (!value) return false;
  if (value.includes(token)) return true;
  if (token.length < 4) return false;
  return value
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .some((word) => word.startsWith(token) || diceCoefficient(token, word) >= 0.62);
}

function diceCoefficient(left: string, right: string): number {
  if (left === right) return 1;
  if (left.length < 2 || right.length < 2) return 0;
  const pairs = new Map<string, number>();
  for (let index = 0; index < left.length - 1; index += 1) {
    const pair = left.slice(index, index + 2);
    pairs.set(pair, (pairs.get(pair) ?? 0) + 1);
  }
  let overlap = 0;
  for (let index = 0; index < right.length - 1; index += 1) {
    const pair = right.slice(index, index + 2);
    const count = pairs.get(pair) ?? 0;
    if (count > 0) {
      overlap += 1;
      pairs.set(pair, count - 1);
    }
  }
  return (2 * overlap) / (left.length + right.length - 2);
}

function tokenize(value: string): string[] {
  return [...new Set(value.split(/[^a-z0-9]+/).filter(Boolean))];
}

function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function clampLimit(limit: number): number {
  return Math.min(Math.max(Math.trunc(limit), 1), 50);
}
