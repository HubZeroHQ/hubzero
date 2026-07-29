import type { AdjacentBlockSummary, DocumentOutlineHeading } from '@/lib/ai/types';
import type { Block } from './blocks';

/**
 * Pure, client-safe helpers that turn the editor's live `Block[]` into the
 * lightweight context a generation request actually needs (Context
 * Awareness in the Phase 10 brief: "existing headings, adjacent blocks,
 * document outline"). Neither function touches the database — the
 * server-side entry metadata (title, summary, technologies, relationships)
 * comes from `lib/studio/ai-context.ts` instead; this file only ever sees
 * blocks already present in the browser.
 */

const MAX_SUMMARY_CHARS = 400;

function truncate(text: string): string {
  return text.length > MAX_SUMMARY_CHARS ? `${text.slice(0, MAX_SUMMARY_CHARS)}…` : text;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Reduces a block to the plain text a prompt can read as surrounding context — never its full structured data, just what a human would notice reading past it. */
export function summarizeBlockForContext(block: Block): AdjacentBlockSummary {
  switch (block.type) {
    case 'heading':
      return { type: block.type, text: block.data.text };
    case 'paragraph':
      return { type: block.type, text: truncate(block.data.text) };
    case 'markdown':
      return { type: block.type, text: truncate(block.data.markdown) };
    case 'richText':
      return { type: block.type, text: truncate(stripHtml(block.data.html)) };
    case 'quote':
      return { type: block.type, text: truncate(block.data.text) };
    case 'callout':
      return { type: block.type, text: truncate(block.data.text) };
    case 'code':
      return { type: block.type, text: truncate(block.data.code) };
    case 'image':
      return { type: block.type, text: block.data.caption ?? block.data.altText };
    case 'imageGallery':
      return { type: block.type, text: `${block.data.images.length} images` };
    case 'videoEmbed':
      return { type: block.type, text: block.data.caption ?? block.data.url };
    case 'divider':
      return { type: block.type, text: '' };
    case 'table':
      return { type: block.type, text: block.data.headers.join(', ') };
    case 'orderedList':
    case 'unorderedList':
      return { type: block.type, text: truncate(block.data.items.join('; ')) };
    case 'checklist':
      return {
        type: block.type,
        text: truncate(block.data.items.map((item) => item.text).join('; ')),
      };
    case 'fileAttachment':
      return { type: block.type, text: block.data.fileName };
    case 'metrics':
      return {
        type: block.type,
        text: truncate(
          block.data.metrics.map((metric) => `${metric.label}: ${metric.value}`).join('; '),
        ),
      };
    case 'timeline':
      return {
        type: block.type,
        text: truncate(block.data.events.map((event) => event.title).join('; ')),
      };
    case 'technologyStack':
      return { type: block.type, text: `${block.data.technologyIds.length} technologies` };
    case 'links':
      return {
        type: block.type,
        text: truncate(block.data.links.map((link) => link.label).join('; ')),
      };
    case 'references':
      return {
        type: block.type,
        text: truncate(block.data.citations.map((citation) => citation.label).join('; ')),
      };
    default: {
      const exhaustive: never = block;
      return { type: (exhaustive as Block).type, text: '' };
    }
  }
}

export function deriveDocumentOutline(blocks: Block[]): DocumentOutlineHeading[] {
  return blocks
    .filter((block): block is Extract<Block, { type: 'heading' }> => block.type === 'heading')
    .map((block) => ({ level: block.data.level, text: block.data.text }));
}
