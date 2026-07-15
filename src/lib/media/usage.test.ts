import { describe, expect, it } from 'vitest';
import { blocksReferenceMedia } from './usage';

describe('blocksReferenceMedia', () => {
  it('finds a match in an image block', () => {
    const blocks = [{ type: 'image', data: { mediaId: 'media-1' } }];
    expect(blocksReferenceMedia(blocks, 'media-1')).toBe(true);
    expect(blocksReferenceMedia(blocks, 'media-2')).toBe(false);
  });

  it('finds a match nested inside an imageGallery block', () => {
    const blocks = [
      {
        type: 'imageGallery',
        data: { images: [{ mediaId: 'media-1' }, { mediaId: 'media-2' }] },
      },
    ];
    expect(blocksReferenceMedia(blocks, 'media-2')).toBe(true);
    expect(blocksReferenceMedia(blocks, 'media-3')).toBe(false);
  });

  it('ignores unrelated block types', () => {
    const blocks = [{ type: 'paragraph', data: { text: 'media-1' } }];
    expect(blocksReferenceMedia(blocks, 'media-1')).toBe(false);
  });

  it('returns false for an empty block array', () => {
    expect(blocksReferenceMedia([], 'media-1')).toBe(false);
  });
});
