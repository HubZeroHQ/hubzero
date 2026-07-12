"use client";

import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { BLOCK_TYPE_META, BLOCK_TYPES } from "@/lib/cms/blocks/registry";
import type { Block, BlockType } from "@/lib/cms/blocks/types";
import { cn } from "@/lib/utils";

export interface InsertBlockPointProps {
  /** Column contents can't hold another two-column layout (`types.ts`). */
  restrictToSimple?: boolean;
  onInsert: (block: Block) => void;
}

/**
 * The hover-revealed "+" between two blocks (and above the first one) — the
 * quick, inline counterpart to `AddBlockDialog`'s full modal picker, for the
 * common case of "insert right here" rather than "browse everything."
 * Clicking it opens a small filter input: typing narrows the block-type
 * list by label (a leading "/" is stripped, so typing "/heading" behaves
 * exactly like typing "heading" — the familiar slash-command shorthand
 * without inventing a text-command parser this codebase's structured,
 * per-type block forms have no host for). Arrow keys navigate the filtered
 * list, Enter inserts the highlighted type, Escape closes.
 */
export function InsertBlockPoint({ restrictToSimple = false, onInsert }: InsertBlockPointProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableTypes = useMemo(
    () =>
      BLOCK_TYPES.filter((type) => !restrictToSimple || BLOCK_TYPE_META[type].availableInColumn),
    [restrictToSimple],
  );

  const filtered = useMemo(() => {
    const term = query.replace(/^\//, "").trim().toLowerCase();
    if (!term) return availableTypes;
    return availableTypes.filter((type) =>
      BLOCK_TYPE_META[type].label.toLowerCase().includes(term),
    );
  }, [availableTypes, query]);

  function close() {
    setOpen(false);
    setQuery("");
    setHighlighted(0);
  }

  function pick(type: BlockType) {
    onInsert(BLOCK_TYPE_META[type].createDefault());
    close();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const type = filtered[highlighted];
      if (type) pick(type);
    }
  }

  if (!open) {
    return (
      <div className="group/insert relative -my-2.5 flex h-5 items-center justify-center">
        <div className="border-border-muted absolute inset-x-0 top-1/2 border-t opacity-0 transition-opacity duration-150 group-hover/insert:opacity-100" />
        <button
          type="button"
          aria-label="Insert block here"
          onClick={() => {
            setOpen(true);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          className="border-border-muted text-text-muted hover:border-accent hover:text-accent-text bg-bg relative z-10 flex size-5 scale-90 items-center justify-center rounded-full border opacity-0 transition-all duration-150 group-hover/insert:scale-100 group-hover/insert:opacity-100 focus-visible:scale-100 focus-visible:opacity-100"
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="border-border-muted bg-bg-light relative z-20 my-1 rounded-lg border p-2 shadow-md">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setHighlighted(0);
        }}
        onKeyDown={handleKeyDown}
        onBlur={close}
        placeholder="Type a block name, e.g. /heading"
        className="text-body text-text placeholder:text-text-muted w-full bg-transparent px-1 py-1 focus:outline-none"
      />
      {filtered.length > 0 ? (
        <div className="mt-1 flex max-h-56 flex-col gap-0.5 overflow-y-auto">
          {filtered.map((type, index) => {
            const meta = BLOCK_TYPE_META[type];
            const Icon = meta.icon;
            return (
              <button
                key={type}
                type="button"
                // `onMouseDown` (not `onClick`) fires before the input's
                // `onBlur` closes the menu — `onClick` would never run.
                onMouseDown={(event) => {
                  event.preventDefault();
                  pick(type);
                }}
                onMouseEnter={() => setHighlighted(index)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-100",
                  index === highlighted ? "bg-accent/10 text-accent-text" : "text-text hover:bg-bg",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="text-caption font-medium">{meta.label}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-caption text-text-muted px-1 py-2">No matching block type.</p>
      )}
    </div>
  );
}
