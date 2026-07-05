"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";

import type { TableSearchParams } from "@/types/cms";

const RESERVED_KEYS = ["sort", "dir", "cursor", "q"];

/**
 * URL-search-param-driven table state (`ARCHITECTURE/19_CMS_FOUNDATION.md`
 * §7) — sort, filters, search, and pagination cursor all live in the URL, not
 * component state, so a bookmarked/shared list-view URL reproduces the exact
 * same view and the back button works correctly.
 */
export function useCmsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const state: TableSearchParams = useMemo(() => {
    const filters: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      if (!RESERVED_KEYS.includes(key)) filters[key] = value;
    }
    const dir = searchParams.get("dir");
    return {
      sort: searchParams.get("sort") ?? undefined,
      dir: dir === "asc" || dir === "desc" ? dir : undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      q: searchParams.get("q") ?? undefined,
      filters,
    };
  }, [searchParams]);

  /** Changing sort/filter/search restarts pagination from page 1 unless `resetCursor: false` (used by Next/Previous links, which set the cursor themselves). */
  const setParams = useCallback(
    (patch: Record<string, string | undefined>, opts: { resetCursor?: boolean } = {}) => {
      const { resetCursor = true } = opts;
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === "") next.delete(key);
        else next.set(key, value);
      }
      if (resetCursor && !("cursor" in patch)) next.delete("cursor");
      startTransition(() => {
        router.push(`${pathname}?${next.toString()}`);
      });
    },
    [pathname, router, searchParams],
  );

  const toggleSort = useCallback(
    (key: string) => {
      const nextDir = state.sort === key && state.dir === "asc" ? "desc" : "asc";
      setParams({ sort: key, dir: nextDir });
    },
    [setParams, state.dir, state.sort],
  );

  /** Every "Next" navigation is a `router.push` (a new history entry) — going back is exactly "the previous page," so Previous is just history, not a second cursor stack. */
  const goToPreviousPage = useCallback(() => {
    startTransition(() => {
      router.back();
    });
  }, [router]);

  return { state, setParams, toggleSort, goToPreviousPage, isPending };
}
