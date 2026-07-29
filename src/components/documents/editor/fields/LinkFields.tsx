'use client';

import { Input } from '@/components/ui/Input';
import type { Block } from '@/lib/documents/blocks';
import { RepeatableFieldList } from './RepeatableFieldList';

export function LinksFields({
  block,
  onChange,
}: {
  block: Extract<Block, { type: 'links' }>;
  onChange: (next: Block) => void;
}) {
  return (
    <RepeatableFieldList<{ label: string; url: string }>
      items={block.data.links}
      onChange={(links) => onChange({ ...block, data: { links } })}
      createItem={() => ({ label: '', url: '' })}
      addLabel="Add link"
      itemLabel="link"
      minItems={1}
      renderItem={(item, index, update) => (
        <div className="flex flex-col gap-1.5 sm:flex-row">
          <Input
            value={item.label}
            onChange={(event) => update({ ...item, label: event.target.value })}
            placeholder="Label"
            aria-label={`Link ${index + 1} label`}
            className="flex-1"
          />
          <Input
            value={item.url}
            onChange={(event) => update({ ...item, url: event.target.value })}
            placeholder="https://example.com"
            aria-label={`Link ${index + 1} URL`}
            className="flex-1"
          />
        </div>
      )}
    />
  );
}

/** Distinct from `LinksFields` in intent, not just shape (CMS_PRODUCT_DESIGN.md §5) — citations back a specific claim in the prose, not a general related-resource list; the field shape happens to overlap (label + optional url). */
export function ReferencesFields({
  block,
  onChange,
}: {
  block: Extract<Block, { type: 'references' }>;
  onChange: (next: Block) => void;
}) {
  return (
    <RepeatableFieldList<{ label: string; url?: string }>
      items={block.data.citations}
      onChange={(citations) => onChange({ ...block, data: { citations } })}
      createItem={() => ({ label: '', url: '' })}
      addLabel="Add citation"
      itemLabel="citation"
      minItems={1}
      renderItem={(item, index, update) => (
        <div className="flex flex-col gap-1.5 sm:flex-row">
          <Input
            value={item.label}
            onChange={(event) => update({ ...item, label: event.target.value })}
            placeholder="Citation label"
            aria-label={`Citation ${index + 1} label`}
            className="flex-1"
          />
          <Input
            value={item.url ?? ''}
            onChange={(event) => update({ ...item, url: event.target.value || undefined })}
            placeholder="https://example.com (optional)"
            aria-label={`Citation ${index + 1} URL`}
            className="flex-1"
          />
        </div>
      )}
    />
  );
}
