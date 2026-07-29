import type { SearchAdapter, SearchContext, SearchResult } from './types';

/**
 * The engine side of the registry pattern — new collections extend search
 * by calling `registerSearchAdapter` (see `search/adapters/*.ts` and
 * `search/register.ts`), never by editing `searchAll` itself.
 */
const adapters: SearchAdapter[] = [];

export function registerSearchAdapter(adapter: SearchAdapter): void {
  adapters.push(adapter);
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * CMS_PRODUCT_DESIGN.md §7 — reference IDs are a priority exact-match lane
 * above fuzzy text (typing `HZ-WK-014` or a loose `wk 14` should jump
 * straight to that entry).
 */
function sortByRelevance(query: string, results: SearchResult[]): SearchResult[] {
  const normalizedQuery = normalize(query);
  return [...results].sort((a, b) => {
    const aRefMatch = a.referenceId ? normalize(a.referenceId).includes(normalizedQuery) : false;
    const bRefMatch = b.referenceId ? normalize(b.referenceId).includes(normalizedQuery) : false;
    if (aRefMatch !== bRefMatch) {
      return aRefMatch ? -1 : 1;
    }
    return a.title.localeCompare(b.title);
  });
}

/**
 * Runs every registered adapter the viewer is permitted to see
 * (CMS_PRODUCT_DESIGN.md §7/§8 — search results respect the viewer's
 * permissions exactly as list views do) and merges the results.
 */
export async function searchAll(query: string, ctx: SearchContext): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const visibleAdapters = adapters.filter((adapter) => adapter.isVisible(ctx));
  const resultsPerAdapter = await Promise.all(
    visibleAdapters.map((adapter) => adapter.search(trimmed, ctx)),
  );

  return sortByRelevance(trimmed, resultsPerAdapter.flat());
}
