'use client';

import { useId } from 'react';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import type { Block } from '@/lib/documents/blocks';
import type { AdjacentBlockContext, DocumentOutlineHeading } from '@/lib/ai/types';
import { cn } from '@/lib/utils/cn';
import type { BlockEditorAiConfig } from '@/components/documents/ai/types';
import { TextBlockField } from '@/components/documents/ai/TextBlockField';
import { ChecklistFields, OrderedListFields, UnorderedListFields } from './ListFields';
import { ImageFields, ImageGalleryFields } from './ImageFields';
import { LinksFields, ReferencesFields } from './LinkFields';
import { MetricsFields } from './MetricsFields';
import { RichTextFields } from './RichTextFields';
import { selectClass, textareaClass } from './shared';
import { TableFields } from './TableFields';
import { TechnologyStackFields } from './TechnologyStackFields';
import { TimelineFields } from './TimelineFields';

/**
 * The per-block-type field editor dispatch — covers all 21 catalog types
 * (`lib/documents/blocks.ts`). Simple single/few-field types render inline
 * here; anything with repeatable items, a picker, or a non-text editing
 * surface delegates to its own file in this folder. `ai`/`outline`/
 * `adjacent`/`previousBlock`/`onReplaceSelf`/`onReplacePrevious` are only
 * used by the paragraph/markdown cases (`TextBlockField`, Phase 10's
 * selection toolbar + slash commands) and are all optional — every other
 * case, and every caller that doesn't pass `ai`, behaves exactly as before.
 */
export function BlockFields({
  block,
  onChange,
  technologyOptions,
  ai,
  outline,
  adjacent,
  previousBlock,
  onReplaceSelf,
  onReplacePrevious,
}: {
  block: Block;
  onChange: (next: Block) => void;
  technologyOptions: Array<{ id: string; label: string }>;
  ai?: BlockEditorAiConfig;
  outline?: DocumentOutlineHeading[];
  adjacent?: AdjacentBlockContext;
  previousBlock?: Block;
  onReplaceSelf?: (blocks: Block[]) => void;
  onReplacePrevious?: (blocks: Block[]) => void;
}) {
  const id = useId();

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
            aria-label="Heading level"
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
            aria-label="Heading text"
            className="flex-1"
          />
        </div>
      );
    case 'paragraph':
      return (
        <TextBlockField
          value={block.data.text}
          onChange={(text) => onChange({ ...block, data: { text } })}
          rows={3}
          placeholder="Paragraph text"
          ariaLabel="Paragraph text"
          ai={ai}
          outline={outline ?? []}
          adjacent={adjacent}
          previousBlock={previousBlock}
          onReplaceSelf={onReplaceSelf ?? (() => {})}
          onReplacePrevious={onReplacePrevious ?? (() => {})}
        />
      );
    case 'richText':
      return <RichTextFields block={block} onChange={onChange} />;
    case 'markdown':
      return (
        <TextBlockField
          value={block.data.markdown}
          onChange={(markdown) => onChange({ ...block, data: { markdown } })}
          rows={4}
          placeholder="Markdown source"
          ariaLabel="Markdown source"
          monospace
          ai={ai}
          outline={outline ?? []}
          adjacent={adjacent}
          previousBlock={previousBlock}
          onReplaceSelf={onReplaceSelf ?? (() => {})}
          onReplacePrevious={onReplacePrevious ?? (() => {})}
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
            aria-label="Quote text"
            className={textareaClass}
          />
          <Input
            value={block.data.attribution ?? ''}
            onChange={(event) =>
              onChange({ ...block, data: { ...block.data, attribution: event.target.value } })
            }
            placeholder="Attribution (optional)"
            aria-label="Attribution"
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
            aria-label="Code language"
          />
          <textarea
            value={block.data.code}
            onChange={(event) =>
              onChange({ ...block, data: { ...block.data, code: event.target.value } })
            }
            rows={6}
            placeholder="Code"
            aria-label="Code"
            className={cn(textareaClass, 'font-mono')}
          />
        </div>
      );
    case 'image':
      return <ImageFields block={block} onChange={onChange} />;
    case 'imageGallery':
      return <ImageGalleryFields block={block} onChange={onChange} />;
    case 'videoEmbed':
      return (
        <div className="flex flex-col gap-2">
          <Field label="Video URL" name={`${id}-video-url`}>
            <Input
              id={`${id}-video-url`}
              value={block.data.url}
              onChange={(event) =>
                onChange({ ...block, data: { ...block.data, url: event.target.value } })
              }
              placeholder="https://…"
            />
          </Field>
          <Field label="Caption" name={`${id}-video-caption`}>
            <Input
              id={`${id}-video-caption`}
              value={block.data.caption ?? ''}
              onChange={(event) =>
                onChange({ ...block, data: { ...block.data, caption: event.target.value } })
              }
              placeholder="Optional caption"
            />
          </Field>
        </div>
      );
    case 'divider':
      return <p className="text-text-muted text-xs">No fields — renders as a visual divider.</p>;
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
            aria-label="Callout text"
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
            aria-label="Callout tone"
            className={selectClass}
          >
            <option value="neutral">Neutral</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
          </select>
        </div>
      );
    case 'table':
      return <TableFields block={block} onChange={onChange} />;
    case 'orderedList':
      return <OrderedListFields block={block} onChange={onChange} />;
    case 'unorderedList':
      return <UnorderedListFields block={block} onChange={onChange} />;
    case 'checklist':
      return <ChecklistFields block={block} onChange={onChange} />;
    case 'fileAttachment':
      return (
        <div className="flex flex-col gap-2">
          <Field label="File URL" name={`${id}-file-url`}>
            <Input
              id={`${id}-file-url`}
              value={block.data.url}
              onChange={(event) =>
                onChange({ ...block, data: { ...block.data, url: event.target.value } })
              }
              placeholder="https://…"
            />
          </Field>
          <Field label="File name" name={`${id}-file-name`}>
            <Input
              id={`${id}-file-name`}
              value={block.data.fileName}
              onChange={(event) =>
                onChange({ ...block, data: { ...block.data, fileName: event.target.value } })
              }
              placeholder="report.pdf"
            />
          </Field>
        </div>
      );
    case 'metrics':
      return <MetricsFields block={block} onChange={onChange} />;
    case 'timeline':
      return <TimelineFields block={block} onChange={onChange} />;
    case 'technologyStack':
      return (
        <TechnologyStackFields
          block={block}
          onChange={onChange}
          technologyOptions={technologyOptions}
        />
      );
    case 'links':
      return <LinksFields block={block} onChange={onChange} />;
    case 'references':
      return <ReferencesFields block={block} onChange={onChange} />;
    default: {
      const exhaustive: never = block;
      void exhaustive;
      return null;
    }
  }
}
