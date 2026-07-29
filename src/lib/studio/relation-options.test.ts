import { describe, expect, it } from 'vitest';
import { toPlainOptions, toRelationOptions } from './relation-options';

describe('toRelationOptions', () => {
  it('maps entries to id/label/referenceId options using the given label extractor', () => {
    const entries = [
      { _id: { toString: () => 'a1' }, referenceId: 'HZ-WK-001', title: 'Alpha' },
      { _id: { toString: () => 'a2' }, referenceId: 'HZ-WK-002', title: 'Beta' },
    ];

    expect(toRelationOptions(entries, (entry) => entry.title)).toEqual([
      { id: 'a1', label: 'Alpha', referenceId: 'HZ-WK-001' },
      { id: 'a2', label: 'Beta', referenceId: 'HZ-WK-002' },
    ]);
  });

  it('returns an empty array for no entries', () => {
    expect(toRelationOptions([], (entry: never) => entry)).toEqual([]);
  });
});

describe('toPlainOptions', () => {
  it('maps taxonomy-style entries with no referenceId to id/label options', () => {
    const entries = [
      { _id: { toString: () => 't1' }, label: 'TypeScript' },
      { _id: { toString: () => 't2' }, label: 'MongoDB' },
    ];

    expect(toPlainOptions(entries)).toEqual([
      { id: 't1', label: 'TypeScript' },
      { id: 't2', label: 'MongoDB' },
    ]);
  });
});
