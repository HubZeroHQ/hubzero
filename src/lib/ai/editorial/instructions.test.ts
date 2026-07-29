import { describe, expect, it } from 'vitest';
import { BLOCK_CATALOG_FLAT } from '@/lib/documents/block-catalog';
import {
  getBlockInstructions,
  getInstructionGuidance,
  SELECTION_INSTRUCTIONS,
} from './instructions';

describe('getBlockInstructions', () => {
  it('returns a rich instruction set for free-prose block types', () => {
    expect(getBlockInstructions('paragraph').length).toBeGreaterThan(5);
    expect(getBlockInstructions('richText').length).toBeGreaterThan(5);
    expect(getBlockInstructions('markdown').length).toBeGreaterThan(5);
  });

  it('returns code-appropriate instructions for the code block, not generic prose ones', () => {
    const instructions = getBlockInstructions('code');
    expect(instructions).toContain('explainCode');
    expect(instructions).toContain('documentApi');
    expect(instructions).not.toContain('simplify');
  });

  it('returns an empty list for block types with no text to transform', () => {
    for (const type of [
      'divider',
      'technologyStack',
      'metrics',
      'timeline',
      'links',
      'references',
      'fileAttachment',
    ] as const) {
      expect(getBlockInstructions(type)).toEqual([]);
    }
  });

  it('has at least one applicable instruction, or none, for every catalog entry — no type is left unhandled', () => {
    for (const entry of BLOCK_CATALOG_FLAT) {
      expect(() => getBlockInstructions(entry.type)).not.toThrow();
    }
  });
});

describe('getInstructionGuidance', () => {
  it('provides a human label and description for every block instruction currently offered', () => {
    const allOffered = new Set(
      BLOCK_CATALOG_FLAT.flatMap((entry) => getBlockInstructions(entry.type)),
    );
    for (const instruction of allOffered) {
      const guidance = getInstructionGuidance(instruction);
      expect(guidance.label.length).toBeGreaterThan(0);
      expect(guidance.description.length).toBeGreaterThan(0);
    }
  });
});

describe('SELECTION_INSTRUCTIONS', () => {
  it('reuses the same instruction vocabulary as the block menu, just with selection-appropriate labels', () => {
    const lengthen = SELECTION_INSTRUCTIONS.find((entry) => entry.instruction === 'expand');
    const shorten = SELECTION_INSTRUCTIONS.find((entry) => entry.instruction === 'condense');
    expect(lengthen?.label).toBe('Lengthen');
    expect(shorten?.label).toBe('Shorten');
  });

  it('includes translate, which block-level transforms deliberately omit', () => {
    expect(SELECTION_INSTRUCTIONS.some((entry) => entry.instruction === 'translate')).toBe(true);
  });
});
