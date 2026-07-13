'use client';

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

/**
 * The shared "add / remove / reorder" shell behind every multi-item block
 * field editor — lists, checklist items, links, references, metrics,
 * timeline events, and gallery images all compose this instead of each
 * re-implementing the same add/remove/move affordances (CMS_PRODUCT_DESIGN.md
 * §5's "proper list editing"). Reordering here is up/down buttons rather
 * than drag — sub-item drag-and-drop inside a block wasn't part of the
 * approved v1 scope, only top-level block reordering was (§5's nested-block
 * note); buttons are still fully keyboard and screen-reader operable.
 */
export function RepeatableFieldList<T>({
  items,
  onChange,
  renderItem,
  createItem,
  addLabel,
  itemLabel,
  minItems = 0,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, update: (next: T) => void) => ReactNode;
  createItem: () => T;
  addLabel: string;
  /** Singular noun used in per-row `aria-label`s, e.g. "link" → "Remove link 2". */
  itemLabel: string;
  minItems?: number;
}) {
  function updateAt(index: number, next: T) {
    onChange(items.map((item, i) => (i === index ? next : item)));
  }

  function removeAt(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function moveBy(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) {
      return;
    }
    const next = [...items];
    const temp = next[index]!;
    next[index] = next[target]!;
    next[target] = temp;
    onChange(next);
  }

  function add() {
    onChange([...items, createItem()]);
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div
          // Items have no stable id in the schema; index is safe here since
          // rows are only ever appended/removed/swapped, never re-keyed
          // independently.
          key={index}
          className="border-border-muted rounded-[4px] border p-2"
        >
          <div className="min-w-0">{renderItem(item, index, (next) => updateAt(index, next))}</div>
          {/* A horizontal row, not a vertical stack — three 44px-tall buttons stacked beside a single input would tower over it; laid out in a row underneath, each control still meets the §12 touch-target minimum without dwarfing the row it belongs to. */}
          <div className="mt-1.5 flex flex-wrap justify-end gap-1">
            <Button
              variant="ghost"
              type="button"
              onClick={() => moveBy(index, -1)}
              disabled={index === 0}
              aria-label={`Move ${itemLabel} ${index + 1} up`}
              className="min-w-11 px-2"
            >
              <ChevronUp className="h-3.5 w-3.5" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={() => moveBy(index, 1)}
              disabled={index === items.length - 1}
              aria-label={`Move ${itemLabel} ${index + 1} down`}
              className="min-w-11 px-2"
            >
              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={() => removeAt(index)}
              disabled={items.length <= minItems}
              aria-label={`Remove ${itemLabel} ${index + 1}`}
              className="min-w-11 px-2"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={add} className="self-start">
        <Plus className="h-3.5 w-3.5" aria-hidden />
        {addLabel}
      </Button>
    </div>
  );
}
