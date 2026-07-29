'use client';

import { Input } from '@/components/ui/Input';
import type { Block } from '@/lib/documents/blocks';
import { RepeatableFieldList } from './RepeatableFieldList';
import { textareaClass } from './shared';

export function TimelineFields({
  block,
  onChange,
}: {
  block: Extract<Block, { type: 'timeline' }>;
  onChange: (next: Block) => void;
}) {
  return (
    <RepeatableFieldList<{ date: string; title: string; description?: string }>
      items={block.data.events}
      onChange={(events) => onChange({ ...block, data: { events } })}
      createItem={() => ({ date: '', title: '', description: '' })}
      addLabel="Add event"
      itemLabel="event"
      minItems={1}
      renderItem={(item, index, update) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-col gap-1.5 sm:flex-row">
            <Input
              value={item.date}
              onChange={(event) => update({ ...item, date: event.target.value })}
              placeholder="Date (e.g. 2026 Q1)"
              aria-label={`Event ${index + 1} date`}
              className="sm:w-40"
            />
            <Input
              value={item.title}
              onChange={(event) => update({ ...item, title: event.target.value })}
              placeholder="Title"
              aria-label={`Event ${index + 1} title`}
              className="flex-1"
            />
          </div>
          <textarea
            value={item.description ?? ''}
            onChange={(event) => update({ ...item, description: event.target.value })}
            placeholder="Description (optional)"
            rows={2}
            aria-label={`Event ${index + 1} description`}
            className={textareaClass}
          />
        </div>
      )}
    />
  );
}
