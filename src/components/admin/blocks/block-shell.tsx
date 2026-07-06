"use client";

import { Reorder, useDragControls } from "motion/react";
import { ChevronDown, ChevronUp, Copy, GripVertical, Trash2 } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { IconButton } from "@/components/ui/icon-button";
import { BLOCK_TYPE_META } from "@/lib/cms/blocks/registry";
import { blockPreviewText } from "@/lib/cms/blocks/text";
import type { Block } from "@/lib/cms/blocks/types";
import { cn } from "@/lib/utils";

export interface BlockShellProps {
  block: Block;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  children: ReactNode;
}

/**
 * The chrome every block shares — drag handle, type label, collapse/expand,
 * duplicate, delete — so a per-type editor (`block-data-editor.tsx`) only
 * ever renders its own fields, never reimplements reordering/deletion.
 * Move-up/move-down buttons are the keyboard-friendly path
 * (`ARCHITECTURE/20_CONTENT_BLOCKS.md` §5's requirement); drag (via `motion`'s
 * `Reorder.Item`, already a dependency) is the mouse-friendly enhancement on
 * top, not the only way to reorder.
 */
export function BlockShell({
  block,
  collapsed,
  onToggleCollapsed,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  children,
}: BlockShellProps) {
  const meta = BLOCK_TYPE_META[block.type];
  const Icon = meta.icon;
  const dragControls = useDragControls();
  const preview = collapsed ? blockPreviewText(block) : "";

  /**
   * Duplicate/move/delete shortcuts, scoped to this block's own header bar
   * rather than the whole block — a block's body is full of real text
   * inputs and textareas that need every keystroke for themselves, so
   * binding these to `onKeyDown` here (not on the `Reorder.Item` root) means
   * they only fire when the header itself (or one of its buttons) has
   * focus, never while typing in a field. Mirrors the up/down buttons
   * already required as the keyboard-accessible path for reordering
   * (`ARCHITECTURE/20_CONTENT_BLOCKS.md` §5) — same idea, a few more keys.
   */
  function handleHeaderKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const isModifier = event.metaKey || event.ctrlKey;
    if (!isModifier) return;
    if (event.key === "d" || event.key === "D") {
      event.preventDefault();
      onDuplicate();
    } else if (event.key === "ArrowUp" && onMoveUp) {
      event.preventDefault();
      onMoveUp();
    } else if (event.key === "ArrowDown" && onMoveDown) {
      event.preventDefault();
      onMoveDown();
    }
  }

  return (
    <Reorder.Item
      value={block}
      dragListener={false}
      dragControls={dragControls}
      className="border-border-muted bg-bg group rounded-lg border"
    >
      <div
        className="bg-bg sticky top-2 z-10 flex items-center gap-2 rounded-t-lg px-3 py-2"
        onKeyDown={handleHeaderKeyDown}
      >
        <button
          type="button"
          aria-label="Drag to reorder"
          onPointerDown={(event) => dragControls.start(event)}
          className="text-text-muted hover:text-text cursor-grab touch-none opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="size-4" aria-hidden="true" />
        </button>

        <Icon className="text-text-muted size-4 shrink-0" aria-hidden="true" />
        <span className="text-caption text-text font-medium">{meta.label}</span>
        {preview && <span className="text-caption text-text-muted truncate italic">{preview}</span>}

        <div className="ml-auto flex items-center gap-1">
          <IconButton
            aria-label="Move block up"
            title="Move up (⌘/Ctrl+↑)"
            icon={<ChevronUp className="size-4" />}
            size="sm"
            onClick={onMoveUp}
            disabled={!onMoveUp}
          />
          <IconButton
            aria-label="Move block down"
            title="Move down (⌘/Ctrl+↓)"
            icon={<ChevronDown className="size-4" />}
            size="sm"
            onClick={onMoveDown}
            disabled={!onMoveDown}
          />
          <IconButton
            aria-label="Duplicate block"
            title="Duplicate (⌘/Ctrl+D)"
            icon={<Copy className="size-4" />}
            size="sm"
            onClick={onDuplicate}
          />
          <ConfirmDialog
            trigger={
              <IconButton
                aria-label="Delete block"
                icon={<Trash2 className="size-4" />}
                size="sm"
              />
            }
            title="Delete this block?"
            description={`This removes the "${meta.label}" block from this document. This can't be undone.`}
            confirmLabel="Delete"
            destructive
            onConfirm={onDelete}
          />
          <IconButton
            aria-label={collapsed ? "Expand block" : "Collapse block"}
            icon={
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-150",
                  collapsed && "-rotate-90",
                )}
              />
            }
            size="sm"
            onClick={onToggleCollapsed}
          />
        </div>
      </div>

      {!collapsed && <div className="border-border-muted border-t p-4">{children}</div>}
    </Reorder.Item>
  );
}
