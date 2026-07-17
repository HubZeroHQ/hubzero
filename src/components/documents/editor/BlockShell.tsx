'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronUp, Copy, CopyPlus, GripVertical, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { getBlockCatalogEntry } from '@/lib/documents/block-catalog';
import type { Block } from '@/lib/documents/blocks';
import { cn } from '@/lib/utils/cn';

/**
 * The per-block wrapper: drag handle (pointer + keyboard, via
 * `@dnd-kit/sortable`'s `useSortable`), selection state (drives the
 * inspector rail), and a toolbar of move/duplicate/copy/delete actions —
 * every one a real button, reachable and operable without a mouse
 * (CMS_PRODUCT_DESIGN.md §5, Accessibility §20 of the Phase 4 brief). Long
 * blocks (a big table, a checklist with many items) collapse in place so a
 * technical document stays scannable while editing.
 */
export function BlockShell({
  block,
  index,
  total,
  selected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onCopy,
  onDelete,
  collapsible,
  collapsed,
  onToggleCollapsed,
  aiMenu,
  aiBadge,
  children,
}: {
  block: Block;
  index: number;
  total: number;
  selected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
  onDelete: () => void;
  collapsible: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** The per-block AI actions trigger (`AiBlockMenu`), slotted in as a plain `ReactNode` so this shell stays feature-agnostic rather than importing AI-specific types directly. Absent entirely when no AI config was supplied or the block type has no applicable instructions. */
  aiMenu?: ReactNode;
  /** The "AI-generated — review" flag (`AiGeneratedBadge`) for a just-inserted/transformed block, rendered above the field editor. */
  aiBadge?: ReactNode;
  children: ReactNode;
}) {
  const catalogEntry = getBlockCatalogEntry(block.type);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  return (
    <div
      ref={setNodeRef}
      id={`document-block-${block.id}`}
      tabIndex={-1}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onFocusCapture={onSelect}
      onClick={onSelect}
      className={cn(
        'rounded-card border-border-default duration-fast ease-standard border bg-transparent transition-colors',
        selected && 'border-accent',
        isDragging && 'opacity-50',
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 pt-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Drag to reorder ${catalogEntry.label} block, position ${index + 1} of ${total}`}
            aria-roledescription="sortable"
            className="text-text-muted hover:text-text-primary hover:bg-surface-elevated duration-fast ease-standard rounded-control flex min-h-11 min-w-11 shrink-0 cursor-grab items-center justify-center transition-colors active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5" aria-hidden />
          </button>
          <span className="text-text-muted truncate font-mono text-[11px] tracking-[0.05em] uppercase">
            {catalogEntry.label} · {index + 1}/{total}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {aiMenu}
          {collapsible ? (
            <Button
              variant="ghost"
              type="button"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? 'Expand block' : 'Collapse block'}
              aria-expanded={!collapsed}
              className="min-w-11 px-2"
            >
              <ChevronDown
                className={cn(
                  'duration-fast ease-standard h-3.5 w-3.5 transition-transform',
                  collapsed && '-rotate-90',
                )}
                aria-hidden
              />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label="Move block up"
            className="min-w-11 px-2"
          >
            <ChevronUp className="h-3.5 w-3.5" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            aria-label="Move block down"
            className="min-w-11 px-2"
          >
            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            type="button"
            onClick={onDuplicate}
            aria-label="Duplicate block"
            title="Duplicate — inserts a copy right after this block"
            className="min-w-11 px-2"
          >
            <CopyPlus className="h-3.5 w-3.5" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            type="button"
            onClick={onCopy}
            aria-label="Copy block"
            title="Copy — paste into this or another document later"
            className="min-w-11 px-2"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            type="button"
            onClick={onDelete}
            aria-label="Delete block"
            className="min-w-11 px-2"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      </div>

      {collapsed ? (
        <p className="text-text-muted px-3 pt-1 pb-3 text-xs">Collapsed — expand to edit.</p>
      ) : (
        <>
          {aiBadge}
          <div className="p-3 pt-2">{children}</div>
        </>
      )}
    </div>
  );
}
