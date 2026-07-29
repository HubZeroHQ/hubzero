import { describe, expect, it } from 'vitest';
import { readEntriesFromFormData, splitEntriesByOwnerType } from './relation-fields';

const FIELDS = [
  { key: 'Work', field: 'relatedWorkIds' },
  { key: 'Build', field: 'relatedBuildIds' },
] as const;

describe('readEntriesFromFormData', () => {
  it('reads every owner-type field into one flat reference array', () => {
    const formData = new FormData();
    formData.append('relatedWorkIds', 'w1');
    formData.append('relatedWorkIds', 'w2');
    formData.append('relatedBuildIds', 'b1');

    expect(readEntriesFromFormData(formData, FIELDS)).toEqual([
      { ownerType: 'Work', ownerId: 'w1' },
      { ownerType: 'Work', ownerId: 'w2' },
      { ownerType: 'Build', ownerId: 'b1' },
    ]);
  });

  it('returns an empty array when no relation fields are present', () => {
    expect(readEntriesFromFormData(new FormData(), FIELDS)).toEqual([]);
  });
});

describe('splitEntriesByOwnerType', () => {
  it('buckets a polymorphic reference array back into per-owner-type id arrays', () => {
    const entries = [
      { ownerType: 'Work' as const, ownerId: { toString: () => 'w1' } },
      { ownerType: 'Build' as const, ownerId: { toString: () => 'b1' } },
      { ownerType: 'Work' as const, ownerId: { toString: () => 'w2' } },
    ];

    expect(splitEntriesByOwnerType(entries, FIELDS)).toEqual({
      relatedWorkIds: ['w1', 'w2'],
      relatedBuildIds: ['b1'],
    });
  });

  it('includes every field as an empty array when no entries match it', () => {
    expect(splitEntriesByOwnerType([], FIELDS)).toEqual({
      relatedWorkIds: [],
      relatedBuildIds: [],
    });
  });

  it('round-trips through readEntriesFromFormData without losing or reordering entries', () => {
    const formData = new FormData();
    formData.append('relatedWorkIds', 'w1');
    formData.append('relatedBuildIds', 'b1');
    formData.append('relatedBuildIds', 'b2');

    const entries = readEntriesFromFormData(formData, FIELDS).map((entry) => ({
      ...entry,
      ownerId: { toString: () => entry.ownerId },
    }));

    expect(splitEntriesByOwnerType(entries, FIELDS)).toEqual({
      relatedWorkIds: ['w1'],
      relatedBuildIds: ['b1', 'b2'],
    });
  });
});
