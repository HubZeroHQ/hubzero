import type { Block, BlockType } from './blocks';

/**
 * The Document Engine's full catalog is 21 block types (`blocks.ts`), each
 * with its own schema. Building the complete drag-and-drop authoring
 * surface CMS_PRODUCT_DESIGN.md §5 describes (inspector rail, reusable
 * blocks, AI generation) is explicitly out of Phase 3's scope — the same
 * boundary PR #45 already drew around the editor itself. This is the
 * honest v1 subset: enough real block types to prove the ownership model
 * (a Work case study is a Document, not a bespoke field) and the
 * render/edit pipeline end to end, without gold-plating an editor a later
 * phase is meant to build properly. Adding a 13th editable type later is a
 * new entry here plus a new `BlockRenderer`/`BlockFieldsEditor` case — the
 * same "no storage or editor redesign" extension path §25 already
 * promises for the schema itself.
 */
export const EDITABLE_BLOCK_TYPES: ReadonlyArray<{ type: BlockType; label: string }> = [
  { type: 'heading', label: 'Heading' },
  { type: 'paragraph', label: 'Paragraph' },
  { type: 'markdown', label: 'Markdown' },
  { type: 'quote', label: 'Quote' },
  { type: 'code', label: 'Code' },
  { type: 'callout', label: 'Callout' },
  { type: 'divider', label: 'Divider' },
  { type: 'orderedList', label: 'Ordered list' },
  { type: 'unorderedList', label: 'Unordered list' },
  { type: 'checklist', label: 'Checklist' },
  { type: 'fileAttachment', label: 'File attachment' },
  { type: 'links', label: 'Links' },
];

export function createDefaultBlock(type: BlockType, id: string): Block {
  switch (type) {
    case 'heading':
      return { id, type, data: { level: 2, text: '' } };
    case 'paragraph':
      return { id, type, data: { text: '' } };
    case 'markdown':
      return { id, type, data: { markdown: '' } };
    case 'quote':
      return { id, type, data: { text: '', attribution: '' } };
    case 'code':
      return { id, type, data: { language: 'text', code: '' } };
    case 'callout':
      return { id, type, data: { text: '', tone: 'neutral' } };
    case 'divider':
      return { id, type, data: {} };
    case 'orderedList':
      return { id, type, data: { items: [''] } };
    case 'unorderedList':
      return { id, type, data: { items: [''] } };
    case 'checklist':
      return { id, type, data: { items: [{ text: '', checked: false }] } };
    case 'fileAttachment':
      return { id, type, data: { url: '', fileName: '' } };
    case 'links':
      return { id, type, data: { links: [{ label: '', url: '' }] } };
    default:
      throw new Error(`"${type}" is not an editable block type in this phase.`);
  }
}
