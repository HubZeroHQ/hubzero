import type { Block } from '@/lib/documents/blocks';
import { cn } from '@/lib/utils/cn';

/**
 * PLANNING.md §25 — "the same `BlockRenderer` renders a Document... one
 * pipeline, so authored content can never visually diverge." This renders
 * the curated subset of block types the v1 editor
 * (`lib/documents/editable-blocks.ts`) can author. A block type outside
 * that subset (any of the full 21-type schema `blocks.ts` defines but this
 * phase's editor doesn't write) renders an honest placeholder rather than
 * crashing — real content that exists but this renderer doesn't yet have a
 * case for, not a fabricated approximation of it.
 */
export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block) => (
        <BlockView key={block.id} block={block} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading': {
      const { level, text } = block.data;
      if (level === 2) {
        return <h2 className="text-text-primary text-xl font-semibold">{text}</h2>;
      }
      if (level === 3) {
        return <h3 className="text-text-primary text-lg font-semibold">{text}</h3>;
      }
      return <h4 className="text-text-primary text-base font-semibold">{text}</h4>;
    }
    case 'paragraph':
      return <p className="text-text-secondary text-sm leading-relaxed">{block.data.text}</p>;
    case 'markdown':
      return (
        <pre className="text-text-secondary bg-surface-default rounded-card border-border-muted border p-3 text-sm whitespace-pre-wrap">
          {block.data.markdown}
        </pre>
      );
    case 'quote':
      return (
        <blockquote className="border-border-strong text-text-secondary border-l-2 pl-4 text-sm italic">
          {block.data.text}
          {block.data.attribution ? (
            <footer className="text-text-muted mt-1 not-italic">— {block.data.attribution}</footer>
          ) : null}
        </blockquote>
      );
    case 'code':
      return (
        <pre className="bg-surface-default rounded-card border-border-muted overflow-x-auto border p-3 text-xs">
          <code>{block.data.code}</code>
        </pre>
      );
    case 'callout': {
      // DESIGN_SYSTEM.md — amber (`accent`) is reserved for live/active/
      // selected state only, never a warning; `danger` is the distinct
      // warm-red token the system reserves for that meaning instead.
      const toneClass = {
        neutral: 'border-border-default',
        warning: 'border-danger',
        success: 'border-success',
      }[block.data.tone];
      return (
        <div className={cn('rounded-card bg-surface-default border-l-2 p-3 text-sm', toneClass)}>
          {block.data.text}
        </div>
      );
    }
    case 'divider':
      return <hr className="border-border-muted" />;
    case 'orderedList':
      return (
        <ol className="text-text-secondary list-decimal pl-5 text-sm">
          {block.data.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
      );
    case 'unorderedList':
      return (
        <ul className="text-text-secondary list-disc pl-5 text-sm">
          {block.data.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    case 'checklist':
      return (
        <ul className="flex flex-col gap-1 text-sm">
          {block.data.items.map((item, index) => (
            <li key={index} className="text-text-secondary flex items-center gap-2">
              <input type="checkbox" checked={item.checked} readOnly disabled />
              <span className={item.checked ? 'line-through opacity-60' : undefined}>
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      );
    case 'fileAttachment':
      return (
        <a
          href={block.data.url}
          target="_blank"
          rel="noreferrer"
          className="border-border-default rounded-card hover:bg-surface-elevated flex items-center gap-2 border p-3 text-sm"
        >
          <span className="text-text-primary">{block.data.fileName}</span>
        </a>
      );
    case 'links':
      return (
        <ul className="flex flex-col gap-1 text-sm">
          {block.data.links.map((link, index) => (
            <li key={index}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      );
    default:
      return (
        <p className="text-text-muted rounded-card border-border-muted border border-dashed p-3 text-xs">
          This document contains a &ldquo;{block.type}&rdquo; block — rendering for this type
          isn&rsquo;t built yet.
        </p>
      );
  }
}
