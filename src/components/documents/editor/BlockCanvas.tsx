'use client';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { getBlockCatalogEntry } from '@/lib/documents/block-catalog';
import type { Block } from '@/lib/documents/blocks';
import { BlockShell } from './BlockShell';
import { BlockFields } from './fields/BlockFields';

/**
 * The sortable block list. Reordering ships two fully-equivalent paths —
 * pointer drag (`PointerSensor`) and keyboard drag (`KeyboardSensor`, dnd-kit's
 * built-in Tab → Space-to-lift → arrow-keys → Space-to-drop flow) — plus the
 * `Alt+↑/↓` shortcut wired at the editor level for a third, even lower-friction
 * option. No `DragOverlay` — blocks transform in place via `useSortable`
 * (`BlockShell`), which keeps the interaction simple and means the existing
 * global reduced-motion CSS rule already covers the transition with no
 * additional JS-level animation to gate.
 */
export function BlockCanvas({
  blocks,
  selectedBlockId,
  collapsedBlockIds,
  technologyOptions,
  onSelect,
  onChangeBlock,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onCopy,
  onDelete,
  onToggleCollapsed,
  onReorder,
  onInsertAt,
}: {
  blocks: Block[];
  selectedBlockId: string | null;
  collapsedBlockIds: Set<string>;
  technologyOptions: Array<{ id: string; label: string }>;
  onSelect: (id: string) => void;
  onChangeBlock: (next: Block) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleCollapsed: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onInsertAt: (index: number) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const fromIndex = blocks.findIndex((block) => block.id === active.id);
    const toIndex = blocks.findIndex((block) => block.id === over.id);
    if (fromIndex === -1 || toIndex === -1) {
      return;
    }
    onReorder(fromIndex, toIndex);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements: {
          onDragStart({ active }) {
            const block = blocks.find((entry) => entry.id === active.id);
            return block
              ? `Picked up ${getBlockCatalogEntry(block.type).label} block.`
              : 'Picked up block.';
          },
          onDragOver({ over }) {
            if (!over) {
              return undefined;
            }
            const toIndex = blocks.findIndex((entry) => entry.id === over.id);
            return `Block moved to position ${toIndex + 1} of ${blocks.length}.`;
          },
          onDragEnd({ over }) {
            return over ? 'Block dropped.' : 'Reorder cancelled.';
          },
          onDragCancel() {
            return 'Reorder cancelled.';
          },
        },
      }}
    >
      <SortableContext
        items={blocks.map((block) => block.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col">
          <InsertDivider index={0} onInsert={onInsertAt} />
          {blocks.map((block, index) => (
            <div key={block.id}>
              <BlockShell
                block={block}
                index={index}
                total={blocks.length}
                selected={block.id === selectedBlockId}
                onSelect={() => onSelect(block.id)}
                onMoveUp={() => onMoveUp(block.id)}
                onMoveDown={() => onMoveDown(block.id)}
                onDuplicate={() => onDuplicate(block.id)}
                onCopy={() => onCopy(block.id)}
                onDelete={() => onDelete(block.id)}
                collapsible={isCollapsibleBlock(block)}
                collapsed={collapsedBlockIds.has(block.id)}
                onToggleCollapsed={() => onToggleCollapsed(block.id)}
              >
                <BlockFields
                  block={block}
                  onChange={onChangeBlock}
                  technologyOptions={technologyOptions}
                />
              </BlockShell>
              <InsertDivider index={index + 1} onInsert={onInsertAt} />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/** Always in the tab order (not hover-only) so a keyboard user can reach every insertion point; visually subtle until hover/focus. */
function InsertDivider({ index, onInsert }: { index: number; onInsert: (index: number) => void }) {
  return (
    <div className="group relative flex h-4 items-center justify-center">
      <div
        aria-hidden
        className="bg-border-muted duration-fast ease-standard absolute inset-x-0 h-px opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
      />
      <button
        type="button"
        onClick={() => onInsert(index)}
        aria-label="Insert block here"
        className="border-border-default bg-surface-default text-text-muted hover:text-text-primary hover:border-accent duration-fast ease-standard z-10 flex h-6 w-6 items-center justify-center rounded-full border opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

function isCollapsibleBlock(block: Block): boolean {
  switch (block.type) {
    case 'table':
      return block.data.rows.length > 5;
    case 'checklist':
      return block.data.items.length > 6;
    case 'imageGallery':
      return block.data.images.length > 4;
    case 'orderedList':
    case 'unorderedList':
      return block.data.items.length > 8;
    default:
      return false;
  }
}
