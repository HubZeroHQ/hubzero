import { describe, expect, it } from 'vitest';
import {
  createDefaultBlock,
  duplicateBlockById,
  insertBlockAt,
  moveBlockBy,
  parseClipboardBlock,
  reorderBlocks,
  removeBlockById,
  serializeBlockForClipboard,
  updateBlockById,
} from './block-ops';

describe('createDefaultBlock', () => {
  it('produces a shape matching the discriminated union for every catalog type', () => {
    const types = [
      'heading',
      'paragraph',
      'markdown',
      'richText',
      'quote',
      'code',
      'image',
      'imageGallery',
      'videoEmbed',
      'divider',
      'callout',
      'table',
      'orderedList',
      'unorderedList',
      'checklist',
      'fileAttachment',
      'metrics',
      'timeline',
      'technologyStack',
      'links',
      'references',
    ] as const;

    for (const type of types) {
      const block = createDefaultBlock(type, 'test-id');
      expect(block.type).toBe(type);
      expect(block.id).toBe('test-id');
      expect(block.data).toBeTypeOf('object');
    }
  });
});

describe('insertBlockAt / removeBlockById / updateBlockById', () => {
  const a = createDefaultBlock('divider', 'a');
  const b = createDefaultBlock('divider', 'b');

  it('inserts at a clamped index', () => {
    expect(insertBlockAt([a, b], 1, createDefaultBlock('divider', 'c')).map((x) => x.id)).toEqual([
      'a',
      'c',
      'b',
    ]);
    expect(insertBlockAt([a, b], 99, createDefaultBlock('divider', 'c')).map((x) => x.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('removes by id', () => {
    expect(removeBlockById([a, b], 'a').map((x) => x.id)).toEqual(['b']);
  });

  it('updates by id, leaving other blocks untouched', () => {
    const next = updateBlockById([a, b], 'a', { ...a, id: 'a' });
    expect(next[0]).not.toBe(a); // new reference even if content unchanged, per the immutable-array contract autosave/history rely on
    expect(next[1]).toBe(b);
  });
});

describe('duplicateBlockById', () => {
  it('inserts a clone with a new id immediately after the original', () => {
    const original = createDefaultBlock('paragraph', 'orig');
    const next = duplicateBlockById([original], 'orig');
    expect(next).toHaveLength(2);
    expect(next[0]!.id).toBe('orig');
    expect(next[1]!.id).not.toBe('orig');
    expect(next[1]!.type).toBe('paragraph');
  });

  it('is a no-op for an unknown id', () => {
    const blocks = [createDefaultBlock('divider', 'a')];
    expect(duplicateBlockById(blocks, 'missing')).toBe(blocks);
  });
});

describe('moveBlockBy', () => {
  const blocks = [
    createDefaultBlock('divider', 'a'),
    createDefaultBlock('divider', 'b'),
    createDefaultBlock('divider', 'c'),
  ];

  it('swaps adjacent blocks', () => {
    expect(moveBlockBy(blocks, 'b', -1).map((x) => x.id)).toEqual(['b', 'a', 'c']);
    expect(moveBlockBy(blocks, 'b', 1).map((x) => x.id)).toEqual(['a', 'c', 'b']);
  });

  it('is a no-op at the boundaries', () => {
    expect(moveBlockBy(blocks, 'a', -1)).toBe(blocks);
    expect(moveBlockBy(blocks, 'c', 1)).toBe(blocks);
  });
});

describe('reorderBlocks', () => {
  it('moves a block from one index to another', () => {
    const blocks = [
      createDefaultBlock('divider', 'a'),
      createDefaultBlock('divider', 'b'),
      createDefaultBlock('divider', 'c'),
    ];
    expect(reorderBlocks(blocks, 0, 2).map((x) => x.id)).toEqual(['b', 'c', 'a']);
  });
});

describe('clipboard round trip', () => {
  it('serializes and parses a block back to an equivalent shape', () => {
    const block = createDefaultBlock('quote', 'q1');
    const parsed = parseClipboardBlock(serializeBlockForClipboard(block));
    expect(parsed).toEqual(block);
  });

  it('rejects clipboard text that is not a copied block', () => {
    expect(parseClipboardBlock('not json')).toBeNull();
    expect(parseClipboardBlock(JSON.stringify({ hello: 'world' }))).toBeNull();
  });
});
