'use client';

import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { BLOCK_CATALOG } from '@/lib/documents/block-catalog';
import type { BlockType } from '@/lib/documents/blocks';

/**
 * The block insertion menu — searchable, grouped, keyboard accessible
 * (CMS_PRODUCT_DESIGN.md §5). Built on the exact same `cmdk` + Radix Dialog
 * pattern already proven by `CommandPalette` (focus trap, arrow-key
 * navigation, Escape-to-close all come for free) rather than a second,
 * slightly-different overlay/list implementation — one interaction pattern
 * for "search and pick one thing" across the whole Studio.
 */
export function BlockInsertMenu({
  open,
  onOpenChange,
  onSelect,
  label = 'Insert block',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: BlockType) => void;
  label?: string;
}) {
  function handleSelect(type: BlockType) {
    onOpenChange(false);
    onSelect(type);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label={label}
      overlayClassName="overlay-scrim fixed inset-0 z-50 bg-black/60"
      contentClassName="overlay-panel fixed top-[15%] inset-x-0 z-50 mx-auto w-[calc(100%-32px)] max-w-[520px] overflow-hidden rounded-overlay border border-border-default bg-surface-overlay shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)]"
    >
      <div className="border-border-muted focus-within:border-accent duration-fast ease-standard flex items-center gap-2.5 border-b px-4 py-3 transition-colors">
        <Search className="text-text-muted h-3.5 w-3.5 shrink-0" aria-hidden />
        <Command.Input
          autoFocus
          placeholder="Search block types…"
          className="text-text-primary placeholder:text-text-muted flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <Command.List className="max-h-[420px] overflow-y-auto p-2">
        <Command.Empty className="text-text-muted px-2.5 py-6 text-center text-sm">
          No block types match.
        </Command.Empty>

        {BLOCK_CATALOG.map(({ category, entries }) => (
          <Command.Group
            key={category}
            heading={category}
            className="[&_[cmdk-group-heading]]:text-text-muted [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:uppercase"
          >
            {entries.map((entry) => {
              const Icon = entry.icon;
              return (
                <Command.Item
                  key={entry.type}
                  value={`${entry.label} ${entry.keywords.join(' ')}`}
                  onSelect={() => handleSelect(entry.type)}
                  className="text-text-secondary data-[selected=true]:bg-surface-elevated data-[selected=true]:text-text-primary rounded-control flex cursor-pointer items-start gap-2.5 px-2.5 py-2 text-sm"
                >
                  <Icon className="text-text-muted mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span className="flex flex-col">
                    <span className="text-text-primary">{entry.label}</span>
                    <span className="text-text-muted text-xs">{entry.description}</span>
                  </span>
                </Command.Item>
              );
            })}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}
