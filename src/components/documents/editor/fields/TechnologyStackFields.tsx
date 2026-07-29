'use client';

import type { Block } from '@/lib/documents/blocks';

/**
 * Same visual language as `RelationMultiSelect` (checkbox list of real
 * labels, never raw ids — CMS_PRODUCT_DESIGN.md §4/§30), but controlled
 * rather than a native `FormData` checkbox group, since this lives inside
 * the block canvas's React state rather than a submitted form.
 * `technologyOptions` is the same array shape `getWorkRelationOptions()`
 * already produces — any owner's edit page passes its own options through
 * `BlockEditor`; an empty array degrades to an honest "none yet" message.
 */
export function TechnologyStackFields({
  block,
  onChange,
  technologyOptions,
}: {
  block: Extract<Block, { type: 'technologyStack' }>;
  onChange: (next: Block) => void;
  technologyOptions: Array<{ id: string; label: string }>;
}) {
  const selected = new Set(block.data.technologyIds);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange({ ...block, data: { technologyIds: Array.from(next) } });
  }

  if (technologyOptions.length === 0) {
    return (
      <p className="text-text-muted text-sm">No technologies exist in the shared taxonomy yet.</p>
    );
  }

  return (
    <div className="border-border-default flex max-h-48 flex-col gap-0.5 overflow-y-auto rounded-[4px] border p-2">
      {technologyOptions.map((option) => (
        <label
          key={option.id}
          className="hover:bg-surface-elevated duration-fast ease-standard rounded-control flex items-center gap-2 px-2 py-1.5 text-sm transition-colors"
        >
          <input
            type="checkbox"
            checked={selected.has(option.id)}
            onChange={() => toggle(option.id)}
            className="accent-accent"
          />
          <span className="text-text-primary flex-1 truncate">{option.label}</span>
        </label>
      ))}
    </div>
  );
}
