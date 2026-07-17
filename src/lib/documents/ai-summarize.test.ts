import { describe, expect, it } from 'vitest';
import type { Block } from './blocks';
import { deriveDocumentOutline, summarizeBlockForContext } from './ai-summarize';

describe('deriveDocumentOutline', () => {
  it('extracts only heading blocks, preserving level and text', () => {
    const blocks: Block[] = [
      { id: '1', type: 'paragraph', data: { text: 'intro' } },
      { id: '2', type: 'heading', data: { level: 2, text: 'Background' } },
      { id: '3', type: 'paragraph', data: { text: 'body' } },
      { id: '4', type: 'heading', data: { level: 3, text: 'Details' } },
    ];
    expect(deriveDocumentOutline(blocks)).toEqual([
      { level: 2, text: 'Background' },
      { level: 3, text: 'Details' },
    ]);
  });

  it('returns an empty array for a document with no headings', () => {
    const blocks: Block[] = [{ id: '1', type: 'paragraph', data: { text: 'just prose' } }];
    expect(deriveDocumentOutline(blocks)).toEqual([]);
  });
});

describe('summarizeBlockForContext', () => {
  it('strips HTML tags from richText blocks down to plain text', () => {
    const block: Block = { id: '1', type: 'richText', data: { html: '<p>Hello <b>world</b></p>' } };
    expect(summarizeBlockForContext(block).text).toBe('Hello world');
  });

  it('summarizes an image block using its caption when present, falling back to alt text', () => {
    const withCaption: Block = {
      id: '1',
      type: 'image',
      data: {
        mediaId: 'm1',
        url: 'https://example.com/a.png',
        altText: 'A dashboard',
        caption: 'The dashboard after the fix',
      },
    };
    const withoutCaption: Block = {
      id: '2',
      type: 'image',
      data: { mediaId: 'm2', url: 'https://example.com/b.png', altText: 'A dashboard' },
    };
    expect(summarizeBlockForContext(withCaption).text).toBe('The dashboard after the fix');
    expect(summarizeBlockForContext(withoutCaption).text).toBe('A dashboard');
  });

  it('never fabricates content for blocks with no text — a divider summarizes to empty', () => {
    const block: Block = { id: '1', type: 'divider', data: {} };
    expect(summarizeBlockForContext(block)).toEqual({ type: 'divider', text: '' });
  });

  it('truncates long text rather than sending an unbounded amount of context', () => {
    const longText = 'x'.repeat(1000);
    const block: Block = { id: '1', type: 'paragraph', data: { text: longText } };
    const result = summarizeBlockForContext(block);
    expect(result.text.length).toBeLessThan(1000);
    expect(result.text.endsWith('…')).toBe(true);
  });
});
