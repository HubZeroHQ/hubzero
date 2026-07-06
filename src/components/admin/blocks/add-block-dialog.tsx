"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { BLOCK_TYPE_META, BLOCK_TYPES } from "@/lib/cms/blocks/registry";
import type { Block, BlockType } from "@/lib/cms/blocks/types";
import { cn } from "@/lib/utils";

export interface AddBlockDialogProps {
  trigger: ReactNode;
  /** Column contents can't hold another two-column layout (`types.ts`). */
  restrictToSimple?: boolean;
  onInsert: (block: Block) => void;
}

const GROUP_ORDER = ["Text", "Media", "Data", "Layout", "Advanced"] as const;

/**
 * The one place an author picks a new block type — grouped, with a
 * one-line purpose for each, so the vocabulary reads as "building blocks,"
 * not a cryptic menu (`ARCHITECTURE/20_CONTENT_BLOCKS.md` §5). Modal, not a
 * popover: this codebase has no popover/dropdown-menu dependency yet, and a
 * modal search/list is already the established pattern for "pick one of N
 * things" (`ReferencePickerModal`, `MediaPickerModal`) — reused here rather
 * than introducing a second interaction paradigm.
 */
export function AddBlockDialog({
  trigger,
  restrictToSimple = false,
  onInsert,
}: AddBlockDialogProps) {
  const [open, setOpen] = useState(false);

  const availableTypes = BLOCK_TYPES.filter(
    (type) => !restrictToSimple || BLOCK_TYPE_META[type].availableInColumn,
  );

  function handlePick(type: BlockType) {
    onInsert(BLOCK_TYPE_META[type].createDefault());
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="z-overlay bg-bg-dark/60 fixed inset-0 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "z-modal bg-bg-light border-border-muted fixed top-1/2 left-1/2 max-h-[80vh] w-[min(32rem,90vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border p-6 shadow-xl focus:outline-none",
          )}
        >
          <Dialog.Title className="text-h3 text-text font-medium">Add a block</Dialog.Title>
          <Dialog.Description className="text-body text-text-muted mt-2">
            Pick a building block — arrange them in whatever order tells this story best.
          </Dialog.Description>

          <div className="mt-4 flex flex-col gap-5">
            {GROUP_ORDER.map((group) => {
              const typesInGroup = availableTypes.filter(
                (type) => BLOCK_TYPE_META[type].group === group,
              );
              if (typesInGroup.length === 0) return null;
              return (
                <div key={group}>
                  <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
                    {group}
                  </p>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {typesInGroup.map((type) => {
                      const meta = BLOCK_TYPE_META[type];
                      const Icon = meta.icon;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handlePick(type)}
                          className="border-border-muted hover:border-accent hover:bg-accent/5 flex items-start gap-3 rounded-md border p-3 text-left transition-colors duration-150"
                        >
                          <Icon
                            className="text-text-muted mt-0.5 size-4 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="flex flex-col">
                            <span className="text-body text-text font-medium">{meta.label}</span>
                            <span className="text-caption text-text-muted">{meta.description}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <Dialog.Close asChild>
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
