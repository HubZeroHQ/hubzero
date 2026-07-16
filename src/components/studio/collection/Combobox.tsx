'use client';

import * as Popover from '@radix-ui/react-popover';
import { Command } from 'cmdk';
import { Check, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ComboboxOption {
  id: string;
  label: string;
  referenceId?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** Toggle-and-keep-open vs. select-and-close. Defaults to multi-select — the more general case. */
  multiple?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  /** Shown when `options` itself is empty — distinct from "no matches" for a search that found nothing. */
  emptyMessage?: string;
  ariaLabel: string;
  className?: string;
}

/**
 * Generic searchable combobox / multi-select. Built to replace chip-row
 * selectors (a `FilterChip` per option, or `RelationMultiSelect`'s checkbox
 * list) once a facet's option count grows past a comfortable single glance
 * — CMS_PRODUCT_DESIGN.md §4's "relationships are pickers, not IDs" still
 * applies, but a picker shouldn't have to render every option at once to
 * be one.
 *
 * Composed from two primitives already proven in this codebase rather than
 * hand-rolled listbox/positioning logic: `cmdk`'s `Command` supplies the
 * searchable, keyboard-navigable list — the exact same primitive
 * `CommandPalette` already uses for arrow-key nav, type-ahead filtering,
 * and Enter-to-select — and Radix's `Popover` supplies trigger
 * positioning, outside-click dismissal, and Escape-to-close (the same
 * `UserMenu`/`CommandPalette` family of Radix primitives, just the
 * non-modal member of it).
 *
 * Selected options render as removable token pills in the trigger itself
 * — real sibling `<button>`s, not nested inside the popover-opening
 * trigger button, so every token stays independently focusable and the
 * trigger never becomes an invalid nested-interactive-element structure.
 * The trigger's footprint stays fixed regardless of how many total
 * `options` exist; only the *selected* count affects its size.
 *
 * Generic enough to back any collection's facet filter or relation picker
 * (Work, Builds, Labs, Notes, Taxonomy, Media, future collections) — a new
 * consumer supplies `options` + `onChange`, not a new component.
 */
export function Combobox({
  options,
  selectedIds,
  onChange,
  multiple = true,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyMessage = 'No options available.',
  ariaLabel,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.filter((option) => selectedIds.includes(option.id));

  function toggle(id: string) {
    if (multiple) {
      onChange(
        selectedIds.includes(id)
          ? selectedIds.filter((existing) => existing !== id)
          : [...selectedIds, id],
      );
    } else {
      onChange(selectedIds.includes(id) ? [] : [id]);
      setOpen(false);
    }
  }

  function remove(id: string) {
    onChange(selectedIds.filter((existing) => existing !== id));
  }

  return (
    <div
      className={cn(
        'border-border-default rounded-control bg-surface-default duration-fast ease-standard focus-within:border-accent flex min-h-9 max-w-full flex-wrap items-center gap-1.5 border px-2 py-1.5 transition-colors',
        className,
      )}
    >
      {selected.map((option) => (
        <span
          key={option.id}
          className="bg-surface-elevated text-text-secondary inline-flex items-center gap-1 rounded-full border border-[#2a2a2a] py-0.5 pr-1 pl-2 font-mono text-[11px] tracking-[0.05em] uppercase"
        >
          {option.label}
          <button
            type="button"
            onClick={() => remove(option.id)}
            aria-label={`Remove ${option.label}`}
            className="hover:text-text-primary hover:bg-surface-default duration-fast ease-standard rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        </span>
      ))}

      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            aria-label={ariaLabel}
            className="text-text-muted hover:text-text-secondary duration-fast ease-standard flex min-w-[72px] flex-1 items-center gap-1 text-left text-sm transition-colors outline-none"
          >
            <span className="flex-1 truncate">
              {selected.length === 0 ? placeholder : multiple ? 'Add…' : 'Change'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className="overlay-panel rounded-card border-border-default bg-surface-overlay z-50 w-[280px] overflow-hidden border p-0 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.7)] outline-none"
          >
            <Command loop>
              <div className="border-border-muted flex items-center border-b px-3 py-2">
                <Command.Input
                  autoFocus
                  placeholder={searchPlaceholder}
                  className="text-text-primary placeholder:text-text-muted flex-1 bg-transparent text-sm outline-none"
                />
              </div>
              <Command.List className="max-h-64 overflow-y-auto p-1.5">
                <Command.Empty className="text-text-muted px-2.5 py-4 text-center text-sm">
                  {options.length === 0 ? emptyMessage : 'No matches.'}
                </Command.Empty>
                {options.map((option) => {
                  const isSelected = selectedIds.includes(option.id);
                  return (
                    <Command.Item
                      key={option.id}
                      value={`${option.label} ${option.referenceId ?? ''}`}
                      onSelect={() => toggle(option.id)}
                      className="text-text-secondary data-[selected=true]:bg-surface-elevated data-[selected=true]:text-text-primary rounded-control flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-sm"
                    >
                      <span
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border',
                          isSelected ? 'border-accent bg-accent' : 'border-border-strong',
                        )}
                      >
                        {isSelected ? <Check className="h-3 w-3 text-black" aria-hidden /> : null}
                      </span>
                      <span className="flex-1 truncate">{option.label}</span>
                      {option.referenceId ? (
                        <span className="text-text-muted shrink-0 font-mono text-[11px]">
                          {option.referenceId}
                        </span>
                      ) : null}
                    </Command.Item>
                  );
                })}
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
