"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useId, useState, useTransition } from "react";
import type { KeyboardEvent, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { searchReferenceOptionsAction } from "@/actions/studio/references";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { cn } from "@/lib/utils";
import type { FieldOption, Resource } from "@/types/cms";

export interface ReferencePickerModalProps {
  trigger: ReactNode;
  resource: Resource;
  labelField: string;
  /** Already-selected ids, hidden from the result list — a multi-reference field shouldn't offer to re-add what's already chosen. */
  excludeIds?: string[];
  onSelect: (option: FieldOption) => void;
}

/**
 * The shared "search and pick a record" modal every `reference`/
 * `referenceArray` field opens (`ARCHITECTURE/19_CMS_FOUNDATION.md` §6) — one
 * implementation, reused by `<ReferencePicker>` (single) and
 * `<ReferencePickerList>` (multi), the same "one modal, parameterized"
 * precedent `<MediaPickerModal>` already establishes for `image`/
 * `imageArray`. Nothing here names a collection: `resource` and `labelField`
 * come from the field config, so a new collection with a `reference` field
 * works the moment it's registered.
 */
export function ReferencePickerModal({
  trigger,
  resource,
  labelField,
  excludeIds,
  onSelect,
}: ReferencePickerModalProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<FieldOption[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debouncedQuery = useDebouncedValue(query);
  const listboxId = useId();

  const visible = options.filter((option) => !excludeIds?.includes(option.value));

  useEffect(() => {
    if (!open) return;
    startTransition(async () => {
      const result = await searchReferenceOptionsAction(
        resource,
        labelField,
        debouncedQuery || undefined,
      );
      setOptions(result);
      setActiveIndex(0);
      setHasLoadedOnce(true);
    });
  }, [open, debouncedQuery, resource, labelField]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setQuery("");
      setOptions([]);
      setHasLoadedOnce(false);
    }
  }

  function select(option: FieldOption) {
    onSelect(option);
    handleOpenChange(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, visible.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const picked = visible[activeIndex];
      if (picked) select(picked);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="z-overlay bg-bg-dark/60 fixed inset-0 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "z-modal bg-bg-light border-border-muted fixed top-1/2 left-1/2 flex max-h-[70vh] w-[min(28rem,90vw)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border p-6 shadow-xl focus:outline-none",
          )}
        >
          <Dialog.Title className="text-h3 text-text font-medium">Choose a record</Dialog.Title>
          <Dialog.Description className="text-body text-text-muted mt-1">
            Search by name — selecting a result links it.
          </Dialog.Description>

          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type to search…"
            className="mt-4"
            role="combobox"
            aria-expanded={visible.length > 0}
            aria-controls={listboxId}
            aria-activedescendant={
              visible[activeIndex] ? `${listboxId}-${visible[activeIndex].value}` : undefined
            }
          />

          <div className="mt-3 overflow-y-auto">
            {isPending && !hasLoadedOnce ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : visible.length === 0 ? (
              <EmptyState
                title="No matches"
                description={query ? "No records match that search." : "No records exist yet."}
              />
            ) : (
              <ul id={listboxId} role="listbox" className="flex flex-col gap-0.5">
                {visible.map((option, index) => (
                  <li key={option.value} role="presentation">
                    <button
                      type="button"
                      id={`${listboxId}-${option.value}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => select(option)}
                      className={cn(
                        "text-body w-full rounded-md px-3 py-2 text-left transition-colors",
                        index === activeIndex
                          ? "bg-accent text-accent-foreground"
                          : "text-text hover:bg-bg",
                      )}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Dialog.Close asChild>
            <Button variant="ghost" type="button" className="mt-4 self-end">
              Cancel
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
