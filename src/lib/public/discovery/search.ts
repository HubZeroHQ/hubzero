import type { PublicDiscoveryEntry } from '../domain';

export interface PublicSearchQuery {
  query: string;
  limit?: number;
}

export interface PublicSearchResult extends PublicDiscoveryEntry {
  matchedTerms: string[];
}

export interface PublicSearchProvider {
  search(query: PublicSearchQuery): Promise<PublicSearchResult[]>;
}

export interface PublicSearchEntryPoint {
  search(query: PublicSearchQuery): Promise<PublicSearchResult[]>;
}

/** Infrastructure only: Phase 22 can swap providers without changing palette consumers. */
export function createPublicSearchEntryPoint(
  provider: PublicSearchProvider,
): PublicSearchEntryPoint {
  return {
    search: ({ query, limit = 12 }) =>
      query.trim() ? provider.search({ query: query.trim(), limit }) : Promise.resolve([]),
  };
}
