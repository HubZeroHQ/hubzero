'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { flattenNav, type StudioNavEntry } from '@/lib/studio/navigation';
import { SEARCH_TYPE_META } from '@/lib/search/type-icons';
import type { SearchResult } from '@/lib/search/types';

interface CommandPaletteProps {
  nav: StudioNavEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * CMS_PRODUCT_DESIGN.md §2/§7 — one palette, two entry points (⌘K and the
 * top-bar search button both open this same component). Search-as-you-type
 * is the primary mode; there's no separate search page. Built on `cmdk`
 * (which itself wraps Radix Dialog) for correct focus-trap, arrow-key
 * navigation, and Escape-to-close, rather than hand-rolled overlay/list
 * logic.
 */
export function CommandPalette({ nav, open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      fetch(`/api/studio/search?q=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((data: { results?: SearchResult[] }) => setResults(data.results ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  const groupedResults = useMemo(() => {
    const groups = new Map<string, SearchResult[]>();
    for (const result of results) {
      const list = groups.get(result.type) ?? [];
      list.push(result);
      groups.set(result.type, list);
    }
    return groups;
  }, [results]);

  const quickNavItems = useMemo(() => flattenNav(nav), [nav]);

  function navigateTo(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command palette"
      shouldFilter={false}
      overlayClassName="overlay-scrim fixed inset-0 z-50 bg-black/60"
      contentClassName="overlay-panel fixed top-[15%] inset-x-0 z-50 mx-auto w-[calc(100%-32px)] max-w-[560px] overflow-hidden rounded-overlay border border-border-default bg-surface-overlay shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)]"
    >
      <div className="border-border-muted focus-within:border-accent duration-fast ease-standard flex items-center gap-2.5 border-b px-4 py-3 transition-colors">
        <Search className="text-text-muted h-3.5 w-3.5 shrink-0" aria-hidden />
        <Command.Input
          autoFocus
          value={query}
          onValueChange={setQuery}
          placeholder="Search work, builds, team, leads…"
          className="text-text-primary placeholder:text-text-muted flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <Command.List className="max-h-[360px] overflow-y-auto p-2">
        {query.trim() === '' ? (
          <Command.Group
            heading="Go to"
            className="[&_[cmdk-group-heading]]:text-text-muted [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:uppercase"
          >
            {quickNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Command.Item
                  key={item.href}
                  value={`nav-${item.href}`}
                  onSelect={() => navigateTo(item.href)}
                  className="text-text-secondary data-[selected=true]:bg-surface-elevated data-[selected=true]:text-text-primary rounded-control flex cursor-pointer items-center gap-2.5 px-2.5 py-2 text-sm"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {item.label}
                </Command.Item>
              );
            })}
          </Command.Group>
        ) : loading ? (
          <Command.Loading className="text-text-muted px-2.5 py-6 text-center text-sm">
            Searching…
          </Command.Loading>
        ) : results.length === 0 ? (
          <Command.Empty className="text-text-muted px-2.5 py-6 text-center text-sm">
            No results for &ldquo;{query}&rdquo;.
          </Command.Empty>
        ) : (
          [...groupedResults.entries()].map(([type, items]) => (
            <Command.Group
              key={type}
              heading={SEARCH_TYPE_META[type as keyof typeof SEARCH_TYPE_META].label}
              className="[&_[cmdk-group-heading]]:text-text-muted [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:uppercase"
            >
              {items.map((result) => {
                const Icon = SEARCH_TYPE_META[result.type].icon;
                return (
                  <Command.Item
                    key={result.id}
                    value={result.id}
                    onSelect={() => navigateTo(result.href)}
                    className="text-text-secondary data-[selected=true]:bg-surface-elevated data-[selected=true]:text-text-primary rounded-control flex cursor-pointer items-center gap-2.5 px-2.5 py-2 text-sm"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="flex-1 truncate">{result.title}</span>
                    {result.referenceId ? (
                      <span className="text-text-muted shrink-0 font-mono text-[11px]">
                        {result.referenceId}
                      </span>
                    ) : null}
                    {result.status ? (
                      <span className="text-text-muted shrink-0 font-mono text-[10px] uppercase">
                        {result.status}
                      </span>
                    ) : null}
                  </Command.Item>
                );
              })}
            </Command.Group>
          ))
        )}
      </Command.List>
    </Command.Dialog>
  );
}
