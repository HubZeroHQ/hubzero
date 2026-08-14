'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { useGuardedRouter } from '@/lib/studio/editor-state/use-guarded-router';
import {
  COMMAND_SECTION_LABEL,
  commandsForRole,
  filterCommands,
  groupCommands,
} from '@/lib/studio/commands';
import { groupResults, rankResults } from '@/lib/search/ranking';
import { SEARCH_TYPE_META } from '@/lib/search/type-icons';
import type { SearchResult } from '@/lib/search/types';
import type { StudioNavEntry } from '@/lib/studio/navigation';
import type { UserRole } from '@/types/studio';

interface CommandPaletteProps {
  role: UserRole;
  /** The same tree the sidebar renders — the palette derives "Go to" from it rather than keeping its own list. */
  nav: StudioNavEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GROUP_HEADING_CLASS =
  '[&_[cmdk-group-heading]]:text-text-muted [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:uppercase';

const ITEM_CLASS =
  'text-text-secondary data-[selected=true]:bg-surface-elevated data-[selected=true]:text-text-primary rounded-control flex cursor-pointer items-center gap-2.5 px-2.5 py-2 text-sm';

/**
 * The Studio command palette (v3.1 Milestone 6) — a keyboard-first client of
 * systems that already exist, not a system of its own.
 *
 * It owns no index, no ranking, no permission model and no navigation layer:
 * content comes from the search adapters, ordering from `rankResults`,
 * commands from `commandsForRole` (which reads the one capability table), and
 * every destination goes through `useGuardedRouter` so unsaved work is
 * protected by the same dialog as a sidebar click. There is deliberately no
 * palette-specific unsaved-changes handling — a second guard is exactly how
 * one of them ends up wrong.
 *
 * ## Why the index is fetched once, not per keystroke
 *
 * The palette previously issued a debounced request per keystroke. It now
 * loads the whole viewer-scoped index on first open and filters in memory,
 * which is what makes typing feel instant and, more importantly, makes the
 * palette rank identically to `/studio/search` — both now run the same pure
 * functions over the same data rather than one calling an endpoint that sorts
 * server-side.
 *
 * The snapshot is kept for the lifetime of the session. It can therefore go
 * stale against an edit made in another tab; that is an accepted trade for a
 * navigation surface, and a reload refreshes it.
 */
export function CommandPalette({ role, nav, open, onOpenChange }: CommandPaletteProps) {
  const router = useGuardedRouter();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<SearchResult[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const loadStarted = useRef(false);

  const commands = useMemo(() => commandsForRole(role, nav), [role, nav]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    if (loadStarted.current) return;
    loadStarted.current = true;

    fetch('/api/studio/search?all=1')
      .then((response) => {
        if (!response.ok) throw new Error(`Studio search returned ${response.status}`);
        return response.json();
      })
      .then((data: { results?: SearchResult[] }) => setIndex(data.results ?? []))
      .catch(() => {
        // Commands still work without the content index — the palette degrades
        // to navigation rather than failing shut.
        setLoadFailed(true);
        setIndex([]);
      });
  }, [open]);

  const commandGroups = useMemo(
    () => groupCommands(filterCommands(commands, query)),
    [commands, query],
  );

  const contentGroups = useMemo(() => {
    if (!index || query.trim() === '') return [];
    return groupResults(rankResults(query, index));
  }, [index, query]);

  const hasResults = commandGroups.length > 0 || contentGroups.length > 0;

  function run(href: string) {
    onOpenChange(false);
    // Deferred one task: a guarded push can open the unsaved-changes dialog
    // synchronously, and Radix would otherwise still consider this palette the
    // topmost modal and render that dialog inert behind it.
    setTimeout(() => router.push(href), 0);
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
          placeholder="Search, navigate, or create…"
          className="text-text-primary placeholder:text-text-muted flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <Command.List className="max-h-[360px] overflow-y-auto p-2">
        {!hasResults ? (
          <Command.Empty className="text-text-muted px-2.5 py-6 text-center text-sm">
            No matching content.
          </Command.Empty>
        ) : null}

        {commandGroups.map((group) => (
          <Command.Group
            key={group.section}
            heading={COMMAND_SECTION_LABEL[group.section]}
            className={GROUP_HEADING_CLASS}
          >
            {group.commands.map((command) => (
              <Command.Item
                key={command.id}
                value={command.id}
                onSelect={() => run(command.href)}
                className={ITEM_CLASS}
              >
                <span className="flex-1 truncate">{command.label}</span>
                {command.hint ? (
                  <span className="text-text-muted shrink-0 text-[11px]">{command.hint}</span>
                ) : null}
              </Command.Item>
            ))}
          </Command.Group>
        ))}

        {contentGroups.map((group) => {
          const meta = SEARCH_TYPE_META[group.type];
          const Icon = meta.icon;
          return (
            <Command.Group key={group.type} heading={meta.label} className={GROUP_HEADING_CLASS}>
              {group.results.map((result) => (
                <Command.Item
                  key={`${result.type}:${result.id}`}
                  value={`${result.type}:${result.id}`}
                  onSelect={() => run(result.href)}
                  className={ITEM_CLASS}
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
              ))}
            </Command.Group>
          );
        })}

        {loadFailed ? (
          <p className="text-text-muted px-2.5 py-2 text-xs">
            Content search is unavailable right now — navigation and create commands still work.
          </p>
        ) : null}
      </Command.List>
    </Command.Dialog>
  );
}
