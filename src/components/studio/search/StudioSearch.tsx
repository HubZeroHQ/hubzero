'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { ReferenceIdBadge } from '@/components/ui/ReferenceIdBadge';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { groupResults, rankResults } from '@/lib/search/ranking';
import { SEARCH_TYPE_META } from '@/lib/search/type-icons';
import type { SearchResult } from '@/lib/search/types';
import { formatRelativeTime } from '@/lib/utils/relative-time';
import type { PublishStatus, ReferenceId, ReferenceIdPrefix } from '@/types/studio';
import { cn } from '@/lib/utils/cn';

/**
 * Global Studio search (v3.1 Milestone 5) — navigation, not retrieval.
 *
 * The entire index the viewer is permitted to see is loaded once on the
 * server and filtered here as they type. That is a deliberate inversion of
 * the command palette's approach, which debounces a request per keystroke:
 * this screen is meant to be *held open* while an editor narrows a query, and
 * at that cadence a network round trip per character is both slower and less
 * predictable than the filtering itself. Permission scoping still happens
 * server-side, before anything reaches the browser — the snapshot contains
 * only what this viewer could already have listed.
 *
 * Ranking and grouping are the shared pure functions, so this screen and the
 * palette order identical queries identically.
 */
export function StudioSearch({ index }: { index: SearchResult[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const ranked = useMemo(() => rankResults(query, index), [query, index]);
  const groups = useMemo(() => groupResults(ranked), [ranked]);

  const active = ranked[activeIndex];

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      setQuery('');
      setActiveIndex(0);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, Math.max(ranked.length - 1, 0)));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === 'Enter' && active) {
      event.preventDefault();
      router.push(active.href);
    }
  }

  return (
    <div className="flex flex-col gap-6" onKeyDown={handleKeyDown}>
      <div className="flex flex-col gap-2">
        <Input
          ref={inputRef}
          type="search"
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          placeholder="Search every collection by title, slug, or reference ID…"
          aria-label="Search all Studio content"
          aria-describedby="studio-search-hint"
          className="max-w-xl"
        />
        <p id="studio-search-hint" className="text-text-muted text-xs">
          {index.length} entries indexed. Arrow keys move, Enter opens, Escape clears.
        </p>
      </div>

      <p role="status" aria-live="polite" className="text-text-secondary text-sm">
        {query.trim() === ''
          ? 'Start typing to search.'
          : ranked.length === 0
            ? 'No matching content.'
            : `${ranked.length} ${ranked.length === 1 ? 'result' : 'results'} across ${groups.length} ${groups.length === 1 ? 'collection' : 'collections'}.`}
      </p>

      {groups.map((group) => {
        const meta = SEARCH_TYPE_META[group.type];
        const Icon = meta.icon;
        const headingId = `search-group-${group.type}`;

        return (
          <section key={group.type} aria-labelledby={headingId} className="flex flex-col gap-2">
            <h2
              id={headingId}
              className="text-text-muted flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] uppercase"
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {meta.label}
              <span className="normal-case">({group.results.length})</span>
            </h2>

            <ul className="border-border-default divide-border-muted divide-y rounded-[4px] border">
              {group.results.map((result) => (
                <li key={`${result.type}:${result.id}`}>
                  <a
                    href={result.href}
                    aria-current={active?.id === result.id ? 'true' : undefined}
                    className={cn(
                      'hover:bg-surface-elevated duration-fast ease-standard flex items-center gap-3 px-3 py-2 transition-colors',
                      active?.id === result.id && 'bg-surface-elevated',
                    )}
                  >
                    <span className="text-text-primary min-w-0 flex-1 truncate text-sm">
                      {result.title}
                      {result.subtitle ? (
                        <span className="text-text-muted"> · {result.subtitle}</span>
                      ) : null}
                    </span>
                    {result.referenceId ? (
                      <ReferenceIdBadge
                        referenceId={result.referenceId as ReferenceId<ReferenceIdPrefix>}
                      />
                    ) : null}
                    {result.status ? (
                      <StatusIndicator status={result.status as PublishStatus} />
                    ) : null}
                    {result.updatedAt ? (
                      <span className="text-text-muted shrink-0 text-xs">
                        {formatRelativeTime(new Date(result.updatedAt))}
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
