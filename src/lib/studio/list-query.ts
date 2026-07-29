/**
 * Generic list/filter/search/paginate utility for any Studio collection list
 * view (CMS_PRODUCT_DESIGN.md §4 — "one pattern, applied everywhere").
 *
 * The repository layer's `list(filter)` (`lib/db/repository.ts`) returns a
 * full, unfiltered array — there is no query-level pagination yet (a
 * deliberate scaling deferral per PLANNING.md §21's "server-side once a
 * collection exceeds a comfortable single-page grid" note, not something
 * worth building ahead of real volume). This module is the one place that
 * in-memory filter/search/paginate logic lives, so every collection's list
 * page calls the same function instead of hand-rolling it five times.
 */

export interface ListSearchParams {
  q?: string;
  status?: string;
  page?: string;
  [key: string]: string | undefined;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface FilterAndPaginateOptions<T> {
  entries: T[];
  /** Free-text query matched against each field returned by `searchFields`. */
  query?: string;
  searchFields: (entry: T) => string[];
  /** Additional predicates (status filter, facet filters) — every one must pass. */
  predicates?: Array<(entry: T) => boolean>;
  sort?: (a: T, b: T) => number;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;

export function filterAndPaginate<T>({
  entries,
  query,
  searchFields,
  predicates = [],
  sort,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: FilterAndPaginateOptions<T>): PaginatedResult<T> {
  const normalizedQuery = query?.trim().toLowerCase();

  let filtered = entries.filter((entry) => predicates.every((predicate) => predicate(entry)));

  if (normalizedQuery) {
    filtered = filtered.filter((entry) =>
      searchFields(entry).some((field) => field.toLowerCase().includes(normalizedQuery)),
    );
  }

  if (sort) {
    filtered = [...filtered].sort(sort);
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

/** Parses the shared `?page=` param from a Next.js server-component `searchParams` object. */
export function parsePage(params: ListSearchParams): number {
  const parsed = Number(params.page);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

/**
 * Builds a list-page URL that preserves the current search params except
 * for whatever `overrides` changes — the one function every filter chip
 * and pagination link in a collection list view calls, instead of each
 * collection hand-assembling its own query string.
 */
export function buildListHref(
  basePath: string,
  current: ListSearchParams,
  overrides: Record<string, string | number | undefined>,
): string {
  const query = new URLSearchParams();
  const merged: Record<string, string | number | undefined> = { ...current, ...overrides };

  for (const [key, value] of Object.entries(merged)) {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  }

  const qs = query.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
