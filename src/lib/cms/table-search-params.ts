import type { TableSearchParams } from "@/types/cms";

/**
 * The server-side counterpart to `useCmsTable`'s client-side URL parsing
 * (`hooks/use-cms-table.ts`). A Server Component list page receives Next.js's
 * `searchParams` prop as a plain `Record<string, string | string[] |
 * undefined>`, not a `URLSearchParams`, so it can't reuse that client hook —
 * every list page needs this exact parsing before its first server-side
 * `list()` call. `filterKeys` (`config.filters.map(f => f.name)`) is the one
 * thing that legitimately differs per collection; previously each list page
 * duplicated this whole function (`case-studies/page.tsx`'s
 * `toTableSearchParams`) with only that array's contents changing.
 */
export function parseTableSearchParams(
  raw: Record<string, string | string[] | undefined>,
  filterKeys: string[],
): TableSearchParams {
  const get = (key: string): string | undefined => {
    const value = raw[key];
    return typeof value === "string" ? value : undefined;
  };

  const filters: Record<string, string> = {};
  for (const key of filterKeys) {
    const value = get(key);
    if (value) filters[key] = value;
  }

  const dir = get("dir");
  return {
    sort: get("sort"),
    dir: dir === "asc" || dir === "desc" ? dir : undefined,
    cursor: get("cursor"),
    q: get("q"),
    filters,
  };
}
