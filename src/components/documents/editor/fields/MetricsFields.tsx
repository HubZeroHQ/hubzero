'use client';

import { Input } from '@/components/ui/Input';
import type { Block } from '@/lib/documents/blocks';
import { RepeatableFieldList } from './RepeatableFieldList';

/** `source` is required in the schema deliberately (`blocks.ts`) — PLANNING.md §2/§25: metrics must be real and sourced, never fabricated. The field carries no special "required" styling beyond the standard validation surfaced by the inspector; leaving it empty simply blocks save like any other required field. */
export function MetricsFields({
  block,
  onChange,
}: {
  block: Extract<Block, { type: 'metrics' }>;
  onChange: (next: Block) => void;
}) {
  return (
    <RepeatableFieldList<{ label: string; value: string; source: string }>
      items={block.data.metrics}
      onChange={(metrics) => onChange({ ...block, data: { metrics } })}
      createItem={() => ({ label: '', value: '', source: '' })}
      addLabel="Add metric"
      itemLabel="metric"
      minItems={1}
      renderItem={(item, index, update) => (
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
          <Input
            value={item.value}
            onChange={(event) => update({ ...item, value: event.target.value })}
            placeholder="Value (e.g. 40%)"
            aria-label={`Metric ${index + 1} value`}
          />
          <Input
            value={item.label}
            onChange={(event) => update({ ...item, label: event.target.value })}
            placeholder="Label"
            aria-label={`Metric ${index + 1} label`}
          />
          <Input
            value={item.source}
            onChange={(event) => update({ ...item, source: event.target.value })}
            placeholder="Source (required)"
            aria-label={`Metric ${index + 1} source`}
          />
        </div>
      )}
    />
  );
}
