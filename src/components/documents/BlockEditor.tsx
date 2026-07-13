'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Block, BlockType } from '@/lib/documents/blocks';
import { createDefaultBlock, EDITABLE_BLOCK_TYPES } from '@/lib/documents/editable-blocks';
import { cn } from '@/lib/utils/cn';

const textareaClass =
  'bg-surface-default text-text-primary rounded-[4px] border border-[#2a2a2a] px-3 py-2 text-sm placeholder:text-text-muted focus-visible:border-accent focus-visible:bg-[#171717] focus-visible:outline-none w-full';

const selectClass =
  'bg-surface-default text-text-primary rounded-[4px] border border-[#2a2a2a] px-2 py-2 text-sm';

/**
 * The v1 block editor (`lib/documents/editable-blocks.ts` explains the
 * scope boundary) — add/reorder/remove/edit for the curated block subset,
 * shared by every collection that owns a Document (Work's case study
 * today; a Build's technical doc or a Lab's journal later use this same
 * component against a different `role`/owner). Multi-item fields (list
 * items, links) edit as one line per item rather than a nested per-item
 * add/remove UI — a deliberate v1 simplification, not the final authoring
 * experience CMS_PRODUCT_DESIGN.md §5 describes.
 */
export function BlockEditor({
  initialBlocks,
  onSave,
}: {
  initialBlocks: Block[];
  onSave: (blocks: Block[]) => Promise<{ error?: string; fieldErrors?: Record<string, string> }>;
}) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [addType, setAddType] = useState<BlockType>('paragraph');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);

  function updateBlock(id: string, next: Block) {
    setSaved(false);
    setBlocks((prev) => prev.map((block) => (block.id === id ? next : block)));
  }

  function addBlock() {
    setSaved(false);
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `block-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setBlocks((prev) => [...prev, createDefaultBlock(addType, id)]);
  }

  function removeBlock(id: string) {
    setSaved(false);
    setBlocks((prev) => prev.filter((block) => block.id !== id));
  }

  function moveBlock(id: string, direction: -1 | 1) {
    setSaved(false);
    setBlocks((prev) => {
      const index = prev.findIndex((block) => block.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const temp = next[index]!;
      next[index] = next[target]!;
      next[target] = temp;
      return next;
    });
  }

  function handleSave() {
    setError(undefined);
    startTransition(async () => {
      const result = await onSave(blocks);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {blocks.length === 0 ? (
        <p className="text-text-muted text-sm">No blocks yet — add one below.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {blocks.map((block, index) => (
            <div key={block.id} className="border-border-default rounded-card border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-text-muted font-mono text-[11px] tracking-[0.05em] uppercase">
                  {block.type}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveBlock(block.id, -1)}
                    aria-label="Move block up"
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    disabled={index === blocks.length - 1}
                    onClick={() => moveBlock(block.id, 1)}
                    aria-label="Move block down"
                  >
                    ↓
                  </Button>
                  <Button variant="ghost" type="button" onClick={() => removeBlock(block.id)}>
                    Remove
                  </Button>
                </div>
              </div>
              <BlockFieldsEditor block={block} onChange={(next) => updateBlock(block.id, next)} />
            </div>
          ))}
        </div>
      )}

      <div className="border-border-muted flex items-center gap-2 border-t pt-4">
        <select
          value={addType}
          onChange={(event) => setAddType(event.target.value as BlockType)}
          className={selectClass}
        >
          {EDITABLE_BLOCK_TYPES.map((entry) => (
            <option key={entry.type} value={entry.type}>
              {entry.label}
            </option>
          ))}
        </select>
        <Button type="button" variant="secondary" onClick={addBlock}>
          Add block
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}
      {saved ? <p className="text-success text-sm">Saved.</p> : null}

      <Button type="button" disabled={isPending} onClick={handleSave} className="self-start">
        {isPending ? 'Saving…' : 'Save document'}
      </Button>
    </div>
  );
}

function BlockFieldsEditor({ block, onChange }: { block: Block; onChange: (next: Block) => void }) {
  switch (block.type) {
    case 'heading':
      return (
        <div className="flex gap-2">
          <select
            value={block.data.level}
            onChange={(event) =>
              onChange({
                ...block,
                data: { ...block.data, level: Number(event.target.value) as 2 | 3 | 4 },
              })
            }
            className={selectClass}
          >
            <option value={2}>H2</option>
            <option value={3}>H3</option>
            <option value={4}>H4</option>
          </select>
          <Input
            value={block.data.text}
            onChange={(event) =>
              onChange({ ...block, data: { ...block.data, text: event.target.value } })
            }
            placeholder="Heading text"
            className="flex-1"
          />
        </div>
      );
    case 'paragraph':
      return (
        <textarea
          value={block.data.text}
          onChange={(event) => onChange({ ...block, data: { text: event.target.value } })}
          rows={3}
          placeholder="Paragraph text"
          className={textareaClass}
        />
      );
    case 'markdown':
      return (
        <textarea
          value={block.data.markdown}
          onChange={(event) => onChange({ ...block, data: { markdown: event.target.value } })}
          rows={4}
          placeholder="Markdown source"
          className={cn(textareaClass, 'font-mono')}
        />
      );
    case 'quote':
      return (
        <div className="flex flex-col gap-2">
          <textarea
            value={block.data.text}
            onChange={(event) =>
              onChange({ ...block, data: { ...block.data, text: event.target.value } })
            }
            rows={2}
            placeholder="Quote text"
            className={textareaClass}
          />
          <Input
            value={block.data.attribution ?? ''}
            onChange={(event) =>
              onChange({ ...block, data: { ...block.data, attribution: event.target.value } })
            }
            placeholder="Attribution (optional)"
          />
        </div>
      );
    case 'code':
      return (
        <div className="flex flex-col gap-2">
          <Input
            value={block.data.language}
            onChange={(event) =>
              onChange({ ...block, data: { ...block.data, language: event.target.value } })
            }
            placeholder="Language (e.g. ts, bash)"
          />
          <textarea
            value={block.data.code}
            onChange={(event) =>
              onChange({ ...block, data: { ...block.data, code: event.target.value } })
            }
            rows={5}
            placeholder="Code"
            className={cn(textareaClass, 'font-mono')}
          />
        </div>
      );
    case 'callout':
      return (
        <div className="flex flex-col gap-2">
          <textarea
            value={block.data.text}
            onChange={(event) =>
              onChange({ ...block, data: { ...block.data, text: event.target.value } })
            }
            rows={2}
            placeholder="Callout text"
            className={textareaClass}
          />
          <select
            value={block.data.tone}
            onChange={(event) =>
              onChange({
                ...block,
                data: {
                  ...block.data,
                  tone: event.target.value as 'neutral' | 'warning' | 'success',
                },
              })
            }
            className={selectClass}
          >
            <option value="neutral">Neutral</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
          </select>
        </div>
      );
    case 'divider':
      return <p className="text-text-muted text-xs">No fields — renders as a visual divider.</p>;
    case 'orderedList':
    case 'unorderedList':
      return (
        <textarea
          value={block.data.items.join('\n')}
          onChange={(event) =>
            onChange({ ...block, data: { items: event.target.value.split('\n') } })
          }
          rows={4}
          placeholder="One item per line"
          className={textareaClass}
        />
      );
    case 'checklist': {
      const existingItems = block.data.items;
      return (
        <textarea
          value={existingItems.map((item) => item.text).join('\n')}
          onChange={(event) =>
            onChange({
              ...block,
              data: {
                // Preserve each existing item's `checked` state by line
                // position — editing the text shouldn't silently
                // uncheck every item the author had already ticked off.
                items: event.target.value
                  .split('\n')
                  .map((text, index) => ({
                    text,
                    checked: existingItems[index]?.checked ?? false,
                  })),
              },
            })
          }
          rows={4}
          placeholder="One checklist item per line"
          className={textareaClass}
        />
      );
    }
    case 'fileAttachment':
      return (
        <div className="flex flex-col gap-2">
          <Input
            value={block.data.url}
            onChange={(event) =>
              onChange({ ...block, data: { ...block.data, url: event.target.value } })
            }
            placeholder="File URL"
          />
          <Input
            value={block.data.fileName}
            onChange={(event) =>
              onChange({ ...block, data: { ...block.data, fileName: event.target.value } })
            }
            placeholder="File name"
          />
        </div>
      );
    case 'links':
      return (
        <textarea
          value={block.data.links.map((link) => `${link.label} | ${link.url}`).join('\n')}
          onChange={(event) => {
            const links = event.target.value.split('\n').map((line) => {
              const [label, url] = line.split('|').map((part) => part.trim());
              return { label: label ?? '', url: url ?? '' };
            });
            onChange({ ...block, data: { links } });
          }}
          rows={4}
          placeholder="Label | https://example.com — one per line"
          className={textareaClass}
        />
      );
    default:
      return (
        <p className="text-text-muted text-xs">
          This block type isn&rsquo;t editable in this phase.
        </p>
      );
  }
}
