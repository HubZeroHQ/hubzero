import type { Block, BlockType } from './blocks';

/**
 * Pure, collection-agnostic operations over a Document's block array
 * (PLANNING.md §25). Every editor surface — Work's case study today, a
 * Build's technical doc or a Lab's journal later — mutates its blocks
 * through these functions rather than hand-rolling array splicing per
 * component, so reorder/insert/duplicate behavior can never drift between
 * owners. None of this touches React state directly; `use-document-history.ts`
 * and `BlockEditor` are the only callers that know about component state.
 */

export function createBlockId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `block-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * One default-populated block per catalog entry (`block-catalog.ts`). Text
 * fields default empty rather than seeded with placeholder copy — an empty
 * required field is surfaced by `validation.ts` and blocks save, which is
 * the honest signal, not fabricated starter content standing in for it.
 */
export function createDefaultBlock(type: BlockType, id: string = createBlockId()): Block {
  switch (type) {
    case 'heading':
      return { id, type, data: { level: 2, text: '' } };
    case 'paragraph':
      return { id, type, data: { text: '' } };
    case 'markdown':
      return { id, type, data: { markdown: '' } };
    case 'richText':
      return { id, type, data: { html: '' } };
    case 'quote':
      return { id, type, data: { text: '', attribution: '' } };
    case 'code':
      return { id, type, data: { language: 'text', code: '' } };
    case 'image':
      return { id, type, data: { mediaId: '', url: '', altText: '', caption: '' } };
    case 'imageGallery':
      return { id, type, data: { images: [{ mediaId: '', url: '', altText: '' }] } };
    case 'videoEmbed':
      return { id, type, data: { url: '', caption: '' } };
    case 'divider':
      return { id, type, data: {} };
    case 'callout':
      return { id, type, data: { text: '', tone: 'neutral' } };
    case 'table':
      return { id, type, data: { headers: ['', ''], rows: [['', '']] } };
    case 'orderedList':
      return { id, type, data: { items: [''] } };
    case 'unorderedList':
      return { id, type, data: { items: [''] } };
    case 'checklist':
      return { id, type, data: { items: [{ text: '', checked: false }] } };
    case 'fileAttachment':
      return { id, type, data: { url: '', fileName: '' } };
    case 'metrics':
      return { id, type, data: { metrics: [{ label: '', value: '', source: '' }] } };
    case 'timeline':
      return { id, type, data: { events: [{ date: '', title: '', description: '' }] } };
    case 'technologyStack':
      return { id, type, data: { technologyIds: [] } };
    case 'links':
      return { id, type, data: { links: [{ label: '', url: '' }] } };
    case 'references':
      return { id, type, data: { citations: [{ label: '', url: '' }] } };
    default: {
      const exhaustive: never = type;
      throw new Error(`Unknown block type "${exhaustive}".`);
    }
  }
}

export function insertBlockAt(blocks: Block[], index: number, block: Block): Block[] {
  const clamped = Math.max(0, Math.min(index, blocks.length));
  const next = [...blocks];
  next.splice(clamped, 0, block);
  return next;
}

export function removeBlockById(blocks: Block[], id: string): Block[] {
  return blocks.filter((block) => block.id !== id);
}

export function updateBlockById(blocks: Block[], id: string, next: Block): Block[] {
  return blocks.map((block) => (block.id === id ? next : block));
}

/** Clones a block with a fresh id, inserted immediately after the original — the v1 "Duplicate" behavior (CMS_PRODUCT_DESIGN.md §5, Appendix B.5). */
export function duplicateBlockById(blocks: Block[], id: string): Block[] {
  const index = blocks.findIndex((block) => block.id === id);
  if (index === -1) {
    return blocks;
  }
  const original = blocks[index]!;
  const clone = { ...original, id: createBlockId() } as Block;
  return insertBlockAt(blocks, index + 1, clone);
}

/** Reference-based move for the `Alt+↑`/`Alt+↓` shortcut (CMS_PRODUCT_DESIGN.md §2). */
export function moveBlockBy(blocks: Block[], id: string, direction: -1 | 1): Block[] {
  const index = blocks.findIndex((block) => block.id === id);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= blocks.length) {
    return blocks;
  }
  const next = [...blocks];
  const temp = next[index]!;
  next[index] = next[target]!;
  next[target] = temp;
  return next;
}

/** Index-based reorder for drag-and-drop (`@dnd-kit/sortable`'s `arrayMove` shape). */
export function reorderBlocks(blocks: Block[], fromIndex: number, toIndex: number): Block[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= blocks.length ||
    toIndex >= blocks.length
  ) {
    return blocks;
  }
  const next = [...blocks];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved!);
  return next;
}

/** Serialized clipboard payload for cross-document "Copy" (Appendix B.5 — plain duplicate, not a synced block). */
interface CopiedBlockPayload {
  __hubzeroBlock: true;
  block: Block;
}

export function serializeBlockForClipboard(block: Block): string {
  const payload: CopiedBlockPayload = { __hubzeroBlock: true, block };
  return JSON.stringify(payload);
}

export function parseClipboardBlock(text: string): Block | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      '__hubzeroBlock' in parsed &&
      (parsed as { __hubzeroBlock?: unknown }).__hubzeroBlock === true &&
      'block' in parsed
    ) {
      return (parsed as CopiedBlockPayload).block;
    }
    return null;
  } catch {
    return null;
  }
}
