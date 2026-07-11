"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CornerDownLeft, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { getCommandActions, searchStudio } from "@/actions/studio/search";
import { Text } from "@/components/ui/text";
import { studioNavItems } from "@/config/studio-nav";
import { fuzzyRank } from "@/lib/cms/fuzzy";
import type { QuickCreateAction, SearchResultGroup } from "@/lib/cms/search";
import { roleMeetsMinimum } from "@/lib/cms/roles";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { SessionUser } from "@/types/cms";

export interface CommandPaletteProps {
  user: SessionUser;
}

interface FlatItem {
  key: string;
  label: string;
  sublabel?: string;
  href: string;
}

interface DisplayGroup {
  label: string;
  items: FlatItem[];
}

const RECENT_SEARCHES_KEY = "studio:command-palette:recent-searches";
const RECENTLY_VIEWED_KEY = "studio:command-palette:recently-viewed";
const MAX_RECENT_SEARCHES = 6;
const MAX_RECENTLY_VIEWED = 8;

/**
 * The global Cmd/Ctrl+K command palette (Phase F,
 * `ARCHITECTURE/19_CMS_FOUNDATION.md`'s "one generic engine" discipline
 * applied to a cross-cutting UI feature rather than a collection). Every
 * result group is registry-driven:
 *
 * - "Go to" reuses `config/studio-nav.ts` (already the single source for the
 *   sidebar/mobile nav) — no second nav list.
 * - "Create" reuses `listCollections()`'s `quickCreateLabel` field via
 *   `getCommandActions()` — no hardcoded action list.
 * - Document results reuse the collection registry via `searchStudio()`
 *   (`lib/cms/search.ts`), the same engine Phase G's public search reuses.
 *
 * Fuzzy matching (`lib/cms/fuzzy.ts`) is applied client-side to the static
 * "Go to"/"Create" lists (instant, no round trip) and server-side (regex) for
 * documents, since those live in the database.
 */
export function CommandPalette({ user }: CommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<SearchResultGroup[]>([]);
  const [quickActions, setQuickActions] = useState<QuickCreateAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(RECENT_SEARCHES_KEY, []);
  const [recentlyViewed, setRecentlyViewed] = useLocalStorage<FlatItem[]>(RECENTLY_VIEWED_KEY, []);

  const navItems: FlatItem[] = useMemo(
    () =>
      studioNavItems
        .filter((item) => !item.minimumRole || roleMeetsMinimum(user.role, item.minimumRole))
        .map((item) => ({ key: `nav:${item.href}`, label: item.label, href: item.href })),
    [user.role],
  );

  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  /** The single place `open` ever transitions to `true` — resets per-session query/result state as part of that same event rather than a separate effect reacting to it afterward. */
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setQuery("");
      setGroups([]);
      setActiveIndex(0);
      getCommandActions().then(setQuickActions);
    }
  }

  // Global Cmd/Ctrl+K listener — opens the palette from anywhere in Studio.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        handleOpenChange(!openRef.current);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced server search — only fires for a real (non-empty) query.
  useEffect(() => {
    if (!open || !query.trim()) return;
    const handle = setTimeout(() => {
      setLoading(true);
      searchStudio(query)
        .then((results) => {
          setGroups(results);
          setActiveIndex(0);
        })
        .finally(() => setLoading(false));
    }, 150);
    return () => clearTimeout(handle);
  }, [query, open]);

  const filteredNavItems = fuzzyRank(navItems, query);
  const filteredQuickActions = fuzzyRank(quickActions, query);

  const displayGroups: DisplayGroup[] = useMemo(() => {
    if (!query.trim()) {
      const result: DisplayGroup[] = [];
      if (recentlyViewed.length > 0)
        result.push({ label: "Recently viewed", items: recentlyViewed });
      result.push({
        label: "Create",
        items: quickActions.map((action) => ({
          key: `create:${action.resource}`,
          label: action.label,
          href: action.href,
        })),
      });
      result.push({ label: "Go to", items: navItems });
      return result;
    }

    const result: DisplayGroup[] = [];
    if (filteredNavItems.length > 0) result.push({ label: "Go to", items: filteredNavItems });
    if (filteredQuickActions.length > 0) {
      result.push({
        label: "Create",
        items: filteredQuickActions.map((action) => ({
          key: `create:${action.resource}`,
          label: action.label,
          href: action.href,
        })),
      });
    }
    for (const group of groups) {
      result.push({
        label: group.label,
        items: group.items.map((item) => ({
          key: `${group.resource}:${item.id}`,
          label: item.label,
          sublabel: item.sublabel,
          href: item.href,
        })),
      });
    }
    return result;
  }, [
    query,
    recentlyViewed,
    quickActions,
    navItems,
    filteredNavItems,
    filteredQuickActions,
    groups,
  ]);

  const flatItems = useMemo(() => displayGroups.flatMap((group) => group.items), [displayGroups]);

  function navigateTo(item: FlatItem) {
    if (query.trim()) {
      setRecentSearches((prev) =>
        [query.trim(), ...prev.filter((entry) => entry !== query.trim())].slice(
          0,
          MAX_RECENT_SEARCHES,
        ),
      );
    }
    setRecentlyViewed((prev) =>
      [item, ...prev.filter((entry) => entry.key !== item.key)].slice(0, MAX_RECENTLY_VIEWED),
    );
    setOpen(false);
    router.push(item.href);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = flatItems[activeIndex];
      if (item) navigateTo(item);
    }
  }

  let runningIndex = -1;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="border-border-muted text-text-muted hover:text-text hover:border-border text-caption flex items-center gap-2 rounded-md border px-3 py-1.5"
        >
          <Search className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Search…</span>
          <kbd className="border-border-muted bg-bg text-text-muted hidden rounded border px-1.5 py-0.5 text-[10px] sm:inline">
            ⌘K
          </kbd>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="z-overlay bg-bg-dark/60 fixed inset-0 backdrop-blur-sm" />
        <Dialog.Content
          className="z-modal bg-bg-light border-border-muted fixed top-[15%] left-1/2 flex max-h-[70vh] w-[min(36rem,92vw)] -translate-x-1/2 flex-col overflow-hidden rounded-lg border shadow-xl focus:outline-none"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <Dialog.Title className="sr-only">Search Studio</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search across Studio content and jump to any screen.
          </Dialog.Description>

          <div className="border-border-muted flex items-center gap-3 border-b px-4 py-3">
            <Search className="text-text-muted size-4 shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search case studies, builds, media, people…"
              className="text-text placeholder:text-text-muted text-body flex-1 bg-transparent outline-none"
              aria-label="Search Studio"
              autoComplete="off"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {query.trim() && recentSearches.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-2 pt-1 pb-2">
                {recentSearches.map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => {
                      setQuery(entry);
                      setActiveIndex(0);
                    }}
                    className="border-border-muted text-text-muted hover:text-text rounded-full border px-2 py-0.5 text-[11px]"
                  >
                    {entry}
                  </button>
                ))}
              </div>
            )}

            {displayGroups.length === 0 && !loading && (
              <Text size="caption" tone="muted" className="px-3 py-6 text-center">
                {query.trim() ? `No results for "${query}".` : "Start typing to search Studio."}
              </Text>
            )}

            {displayGroups.map((group) => (
              <div key={group.label} className="py-1">
                <Text
                  size="caption"
                  tone="muted"
                  weight="medium"
                  className="px-3 py-1 tracking-wide uppercase"
                >
                  {group.label}
                </Text>
                <ul>
                  {group.items.map((item) => {
                    runningIndex += 1;
                    const isActive = runningIndex === activeIndex;
                    const currentIndex = runningIndex;
                    return (
                      <li key={item.key}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveIndex(currentIndex)}
                          onClick={() => navigateTo(item)}
                          className={cn(
                            "text-body flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left",
                            isActive
                              ? "bg-bg text-text"
                              : "text-text-muted hover:bg-bg hover:text-text",
                          )}
                        >
                          <span className="flex items-center gap-2 truncate">
                            {group.label === "Create" && (
                              <Plus className="size-3.5 shrink-0" aria-hidden="true" />
                            )}
                            <span className="truncate">{item.label}</span>
                          </span>
                          {item.sublabel && group.label !== "Create" && (
                            <span className="text-text-muted text-caption shrink-0">
                              {item.sublabel}
                            </span>
                          )}
                          {isActive && (
                            <CornerDownLeft className="size-3.5 shrink-0" aria-hidden="true" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {loading && (
              <Text size="caption" tone="muted" className="px-3 py-2">
                Searching…
              </Text>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
