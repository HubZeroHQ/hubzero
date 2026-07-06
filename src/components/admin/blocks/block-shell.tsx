"use client";

import { Reorder, useDragControls } from "motion/react";
import { ChevronDown, ChevronUp, Copy, GripVertical, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { IconButton } from "@/components/ui/icon-button";
import { BLOCK_TYPE_META } from "@/lib/cms/blocks/registry";
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

  return (
    <Reorder.Item
      value={block}
      dragListener={false}
      dragControls={dragControls}
      className="border-border-muted bg-bg rounded-lg border"
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          aria-label="Drag to reorder"
          onPointerDown={(event) => dragControls.start(event)}
          className="text-text-muted hover:text-text cursor-grab touch-none active:cursor-grabbing"
        >
          <GripVertical className="size-4" aria-hidden="true" />
        </button>

        <Icon className="text-text-muted size-4 shrink-0" aria-hidden="true" />
        <span className="text-caption text-text font-medium">{meta.label}</span>

        <div className="ml-auto flex items-center gap-1">
          <IconButton
            aria-label="Move block up"
            icon={<ChevronUp className="size-4" />}
            size="sm"
            onClick={onMoveUp}
            disabled={!onMoveUp}
          />
          <IconButton
            aria-label="Move block down"
            icon={<ChevronDown className="size-4" />}
            size="sm"
            onClick={onMoveDown}
            disabled={!onMoveDown}
          />
          <IconButton
            aria-label="Duplicate block"
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
