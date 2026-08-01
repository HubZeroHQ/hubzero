import { rankResults } from './ranking';
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

  return rankResults(trimmed, resultsPerAdapter.flat());
}

/**
 * The whole index the viewer is allowed to see, in one pass (v3.1 Milestone 5).
 *
 * Every adapter already filters with `String.includes`, so an empty query
 * matches everything — the snapshot needs no new adapter method and no
 * collection-specific code. This is what lets `/studio/search` filter in
 * memory as the editor types instead of issuing a database round trip per
 * keystroke.
 */
export async function listSearchIndex(ctx: SearchContext): Promise<SearchResult[]> {
  const visibleAdapters = adapters.filter((adapter) => adapter.isVisible(ctx));
  const resultsPerAdapter = await Promise.all(
    visibleAdapters.map((adapter) => adapter.search('', ctx)),
  );
  return resultsPerAdapter.flat();
}
