'use client';

import { Input } from '@/components/ui/Input';
import type { Block } from '@/lib/documents/blocks';
import { RepeatableFieldList } from './RepeatableFieldList';

/** Proper list editing (CMS_PRODUCT_DESIGN.md §5) — add/remove/reorder for ordered, unordered, and checklist blocks, each a thin `RepeatableFieldList` composition over its own item shape. */
export function OrderedListFields({
  block,
  onChange,
}: {
  block: Extract<Block, { type: 'orderedList' }>;
  onChange: (next: Block) => void;
}) {
  return (
    <RepeatableFieldList<string>
      items={block.data.items}
      onChange={(items) => onChange({ ...block, data: { items } })}
      createItem={() => ''}
      addLabel="Add item"
      itemLabel="item"
      minItems={1}
      renderItem={(item, index, update) => (
        <Input
          value={item}
          onChange={(event) => update(event.target.value)}
          placeholder={`Item ${index + 1}`}
          aria-label={`Item ${index + 1}`}
        />
      )}
    />
  );
}

export function UnorderedListFields({
  block,
  onChange,
}: {
  block: Extract<Block, { type: 'unorderedList' }>;
  onChange: (next: Block) => void;
}) {
  return (
    <RepeatableFieldList<string>
      items={block.data.items}
      onChange={(items) => onChange({ ...block, data: { items } })}
      createItem={() => ''}
      addLabel="Add item"
      itemLabel="item"
      minItems={1}
      renderItem={(item, index, update) => (
        <Input
          value={item}
          onChange={(event) => update(event.target.value)}
          placeholder={`Item ${index + 1}`}
          aria-label={`Item ${index + 1}`}
        />
      )}
    />
  );
}

export function ChecklistFields({
  block,
  onChange,
}: {
  block: Extract<Block, { type: 'checklist' }>;
  onChange: (next: Block) => void;
}) {
  return (
    <RepeatableFieldList<{ text: string; checked: boolean }>
      items={block.data.items}
      onChange={(items) => onChange({ ...block, data: { items } })}
      createItem={() => ({ text: '', checked: false })}
      addLabel="Add checklist item"
      itemLabel="checklist item"
      minItems={1}
      renderItem={(item, index, update) => (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={(event) => update({ ...item, checked: event.target.checked })}
            aria-label={`Mark "${item.text || `checklist item ${index + 1}`}" complete`}
            className="accent-accent h-4 w-4 shrink-0"
          />
          <Input
            value={item.text}
            onChange={(event) => update({ ...item, text: event.target.value })}
            placeholder={`Checklist item ${index + 1}`}
            aria-label={`Checklist item ${index + 1} text`}
            className="flex-1"
          />
        </div>
      )}
    />
  );
}
