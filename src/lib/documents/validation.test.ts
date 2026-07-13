import { describe, expect, it } from 'vitest';
import { createDefaultBlock } from './block-ops';
import { validateBlock, validateDocument } from './validation';

describe('validateBlock', () => {
  it('flags a required field left empty (heading text)', () => {
    const result = validateBlock(createDefaultBlock('heading', 'h1'));
    expect(result.valid).toBe(false);
    expect(result.fieldErrors['data.text']).toBeDefined();
  });

  it('flags a metrics entry missing its required source (PLANNING.md §2 — never fabricated)', () => {
    const block = createDefaultBlock('metrics', 'm1');
    const filled = {
      ...block,
      data: { metrics: [{ label: 'Conversion', value: '12%', source: '' }] },
    } as typeof block;
    expect(validateBlock(filled).valid).toBe(false);
  });

  it('passes once required fields are filled', () => {
    const block = createDefaultBlock('heading', 'h1');
    const filled = {
      ...block,
      data: { ...block.data, text: 'A real heading' },
    } as typeof block;
    expect(validateBlock(filled).valid).toBe(true);
  });

  it('a divider block (no fields) is always valid', () => {
    expect(validateBlock(createDefaultBlock('divider', 'd1')).valid).toBe(true);
  });
});

describe('validateDocument', () => {
  it('collects every invalid block id, not just the first', () => {
    const blocks = [
      createDefaultBlock('heading', 'h1'), // invalid: empty text
      createDefaultBlock('divider', 'd1'), // valid
      createDefaultBlock('paragraph', 'p1'), // valid: text has no min length
    ];
    const result = validateDocument(blocks);
    expect(result.valid).toBe(false);
    expect(result.invalidBlockIds).toEqual(new Set(['h1']));
  });

  it('an empty document is valid', () => {
    expect(validateDocument([]).valid).toBe(true);
  });
});
