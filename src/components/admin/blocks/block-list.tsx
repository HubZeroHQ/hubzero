"use client";

import { Reorder } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";

import { AddBlockDialog } from "@/components/admin/blocks/add-block-dialog";
import { BlockDataEditor } from "@/components/admin/blocks/block-data-editor";
import { BlockShell } from "@/components/admin/blocks/block-shell";
import { Button } from "@/components/ui/button";
import { newBlockId } from "@/lib/cms/blocks/registry";
import type { Block } from "@/lib/cms/blocks/types";

export interface BlockListProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  /** Two-column layout's own columns can't hold another two-column layout (`types.ts`). */
  restrictToSimple?: boolean;
  emptyLabel?: string;
}

/**
 * The reorderable, collapsible list of blocks — the shared implementation
 * behind both the top-level `<BlockEditor>` field and each column of a
 * `twoColumn` block's editor (`block-data-editor.tsx`), so a two-column
 * layout's columns get the exact same authoring experience (reorder,
 * collapse, duplicate, delete, add) as the top-level document, not a
 * second, simpler implementation.
 */
export function BlockList({
  blocks,
  onChange,
  restrictToSimple = false,
  emptyLabel,
}: BlockListProps) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  function toggleCollapsed(id: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateBlockData(index: number, data: Block["data"]) {
    const next = [...blocks];
    const current = next[index];
    if (!current) return;
    next[index] = { ...current, data } as Block;
    onChange(next);
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(target, 0, moved);
    onChange(next);
  }

  function duplicateBlock(index: number) {
    const source = blocks[index];
    if (!source) return;
    const copy: Block = { ...source, id: newBlockId() };
    const next = [...blocks];
    next.splice(index + 1, 0, copy);
    onChange(next);
  }

  function deleteBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function insertBlock(block: Block) {
    onChange([...blocks, block]);
  }

  return (
    <div className="flex flex-col gap-3">
      {blocks.length === 0 && (
        <p className="text-caption text-text-muted italic">
          {emptyLabel ?? "No blocks yet — add the first one below."}
        </p>
      )}

      <Reorder.Group axis="y" values={blocks} onReorder={onChange} className="flex flex-col gap-3">
        {blocks.map((block, index) => (
          <BlockShell
            key={block.id}
            block={block}
            collapsed={collapsedIds.has(block.id)}
            onToggleCollapsed={() => toggleCollapsed(block.id)}
            onMoveUp={index > 0 ? () => moveBlock(index, -1) : undefined}
            onMoveDown={index < blocks.length - 1 ? () => moveBlock(index, 1) : undefined}
            onDuplicate={() => duplicateBlock(index)}
            onDelete={() => deleteBlock(index)}
          >
            <BlockDataEditor block={block} onChange={(data) => updateBlockData(index, data)} />
          </BlockShell>
        ))}
      </Reorder.Group>

      <AddBlockDialog
        restrictToSimple={restrictToSimple}
        onInsert={insertBlock}
        trigger={
          <Button type="button" variant="secondary" size="sm" className="self-start">
            <Plus className="mr-1.5 size-4" aria-hidden="true" />
            Add block
          </Button>
        }
      />
    </div>
  );
}
