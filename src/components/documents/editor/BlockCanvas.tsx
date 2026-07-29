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
import { memo } from 'react';
import { getBlockCatalogEntry } from '@/lib/documents/block-catalog';
import type { Block } from '@/lib/documents/blocks';
import type { DocumentOutlineHeading } from '@/lib/ai/types';
import { summarizeBlockForContext } from '@/lib/documents/ai-summarize';
import { AiBlockMenu } from '@/components/documents/ai/AiBlockMenu';
import { AiGeneratedBadge } from '@/components/documents/ai/AiGeneratedBadge';
import type { BlockEditorAiConfig } from '@/components/documents/ai/types';
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
  ai,
  outline,
  aiGeneratedBlockIds,
  onDismissAiFlag,
  onReplaceBlock,
  onInsertAfterBlock,
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
  ai?: BlockEditorAiConfig;
  outline: DocumentOutlineHeading[];
  aiGeneratedBlockIds: Set<string>;
  onDismissAiFlag: (id: string) => void;
  onReplaceBlock: (targetId: string, blocks: Block[]) => void;
  onInsertAfterBlock: (targetId: string, blocks: Block[]) => void;
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
      id="document-block-canvas"
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
            <BlockRow
              key={block.id}
              block={block}
              index={index}
              total={blocks.length}
              selected={block.id === selectedBlockId}
              collapsed={collapsedBlockIds.has(block.id)}
              collapsible={isCollapsibleBlock(block)}
              technologyOptions={technologyOptions}
              onSelect={onSelect}
              onChangeBlock={onChangeBlock}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onDuplicate={onDuplicate}
              onCopy={onCopy}
              onDelete={onDelete}
              onToggleCollapsed={onToggleCollapsed}
              onInsertAt={onInsertAt}
              ai={ai}
              outline={outline}
              previousBlock={blocks[index - 1]}
              adjacent={{
                previous: blocks[index - 1]
                  ? summarizeBlockForContext(blocks[index - 1]!)
                  : undefined,
                next: blocks[index + 1] ? summarizeBlockForContext(blocks[index + 1]!) : undefined,
              }}
              isAiGenerated={aiGeneratedBlockIds.has(block.id)}
              onDismissAiFlag={onDismissAiFlag}
              onReplaceBlock={onReplaceBlock}
              onInsertAfterBlock={onInsertAfterBlock}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/**
 * One block's row, memoized so editing one block doesn't re-render every other
 * block on the canvas. `block-ops.ts`'s update functions leave untouched block
 * objects referentially unchanged, so `React.memo`'s default shallow comparison
 * already skips rows whose block didn't change — as long as the callback props
 * below stay stable too, which is why `BlockEditor` wraps them in `useCallback`.
 * The `() => onX(block.id)` closures live in here rather than in the `.map` above
 * so they're only recreated when this row itself re-renders.
 */
const BlockRow = memo(function BlockRow({
  block,
  index,
  total,
  selected,
  collapsed,
  collapsible,
  technologyOptions,
  onSelect,
  onChangeBlock,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onCopy,
  onDelete,
  onToggleCollapsed,
  onInsertAt,
  ai,
  outline,
  adjacent,
  previousBlock,
  isAiGenerated,
  onDismissAiFlag,
  onReplaceBlock,
  onInsertAfterBlock,
}: {
  block: Block;
  index: number;
  total: number;
  selected: boolean;
  collapsed: boolean;
  collapsible: boolean;
  technologyOptions: Array<{ id: string; label: string }>;
  onSelect: (id: string) => void;
  onChangeBlock: (next: Block) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleCollapsed: (id: string) => void;
  onInsertAt: (index: number) => void;
  ai?: BlockEditorAiConfig;
  outline: DocumentOutlineHeading[];
  adjacent: {
    previous?: ReturnType<typeof summarizeBlockForContext>;
    next?: ReturnType<typeof summarizeBlockForContext>;
  };
  previousBlock?: Block;
  isAiGenerated: boolean;
  onDismissAiFlag: (id: string) => void;
  onReplaceBlock: (targetId: string, blocks: Block[]) => void;
  onInsertAfterBlock: (targetId: string, blocks: Block[]) => void;
}) {
  return (
    <div>
      <BlockShell
        block={block}
        index={index}
        total={total}
        selected={selected}
        onSelect={() => onSelect(block.id)}
        onMoveUp={() => onMoveUp(block.id)}
        onMoveDown={() => onMoveDown(block.id)}
        onDuplicate={() => onDuplicate(block.id)}
        onCopy={() => onCopy(block.id)}
        onDelete={() => onDelete(block.id)}
        collapsible={collapsible}
        collapsed={collapsed}
        onToggleCollapsed={() => onToggleCollapsed(block.id)}
        aiMenu={
          ai ? (
            <AiBlockMenu
              block={block}
              ai={ai}
              outline={outline}
              adjacent={adjacent}
              onReplace={(blocks) => onReplaceBlock(block.id, blocks)}
              onInsertAlternatives={(blocks) => onInsertAfterBlock(block.id, blocks)}
            />
          ) : undefined
        }
        aiBadge={
          isAiGenerated ? (
            <AiGeneratedBadge onDismiss={() => onDismissAiFlag(block.id)} />
          ) : undefined
        }
      >
        <BlockFields
          block={block}
          onChange={onChangeBlock}
          technologyOptions={technologyOptions}
          ai={ai}
          outline={outline}
          adjacent={adjacent}
          previousBlock={previousBlock}
          onReplaceSelf={(blocks) => onReplaceBlock(block.id, blocks)}
          onReplacePrevious={(blocks) => previousBlock && onReplaceBlock(previousBlock.id, blocks)}
        />
      </BlockShell>
      <InsertDivider index={index + 1} onInsert={onInsertAt} />
    </div>
  );
});

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
