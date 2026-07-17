import { describe, expect, it } from 'vitest';
import {
  generateDocumentInputSchema,
  transformBlockInputSchema,
  transformSelectionInputSchema,
} from './validation';

describe('AI request validation', () => {
  it('rejects unknown client-supplied fields and oversized author text', () => {
    expect(
      generateDocumentInputSchema.safeParse({
        contentType: 'note',
        images: [],
        injected: true,
      }).success,
    ).toBe(false);
    expect(
      generateDocumentInputSchema.safeParse({
        contentType: 'note',
        images: [],
        freeformText: 'x'.repeat(10_001),
      }).success,
    ).toBe(false);
  });

  it('rejects an oversized block even when its basic block shape is valid', () => {
    expect(
      transformBlockInputSchema.safeParse({
        block: { id: 'b1', type: 'paragraph', data: { text: 'x'.repeat(30_000) } },
        instruction: 'rewrite',
      }).success,
    ).toBe(false);
  });

  it('requires a bounded target language for translation', () => {
    expect(
      transformSelectionInputSchema.safeParse({
        selectedText: 'Hello',
        instruction: 'translate',
      }).success,
    ).toBe(false);
    expect(
      transformSelectionInputSchema.safeParse({
        selectedText: 'Hello',
        instruction: 'translate',
        targetLanguage: 'French',
      }).success,
    ).toBe(true);
  });
});
