import { describe, expect, it } from 'vitest';
import {
  addFeaturedId,
  isFeatured,
  isValidFeaturedPosition,
  MAX_FEATURED_ENTRIES,
  moveItem,
  orderEditorially,
  moveItemBy,
  parseFeaturedOrderPayload,
  removeFeaturedId,
  selectFeatured,
  toOrderAssignments,
} from './featured-order';

const entry = (id: string, featuredOrder: number | null) => ({ id, featuredOrder });

describe('isValidFeaturedPosition', () => {
  it('accepts positive integers', () => {
    expect(isValidFeaturedPosition(1)).toBe(true);
    expect(isValidFeaturedPosition(42)).toBe(true);
  });

  it('rejects the four invalid shapes the ordering contract names', () => {
    expect(isValidFeaturedPosition(1.5)).toBe(false); // fractional
    expect(isValidFeaturedPosition(-1)).toBe(false); // negative
    expect(isValidFeaturedPosition(Number.NaN)).toBe(false); // NaN
    expect(isValidFeaturedPosition(0)).toBe(false); // positions are 1-based
  });

  it('rejects non-numbers and infinities', () => {
    expect(isValidFeaturedPosition('1')).toBe(false);
    expect(isValidFeaturedPosition(null)).toBe(false);
    expect(isValidFeaturedPosition(undefined)).toBe(false);
    expect(isValidFeaturedPosition(Number.POSITIVE_INFINITY)).toBe(false);
  });
});

describe('isFeatured', () => {
  it('treats null and undefined as not featured, and any valid position as featured', () => {
    expect(isFeatured(null)).toBe(false);
    expect(isFeatured(undefined)).toBe(false);
    expect(isFeatured(1)).toBe(true);
  });
});

describe('selectFeatured', () => {
  it('keeps only featured entries, ordered lowest position first', () => {
    const result = selectFeatured([
      entry('c', 3),
      entry('a', 1),
      entry('unfeatured', null),
      entry('b', 2),
    ]);

    expect(result.map((row) => row.id)).toEqual(['a', 'b', 'c']);
  });

  it('reads a non-canonical stored order without repairing it silently', () => {
    // `1, 3, 9, 14` — the shape this system never writes, but which a record
    // predating it (or edited outside it) can still hold.
    const result = selectFeatured([entry('d', 14), entry('a', 1), entry('c', 9), entry('b', 3)]);

    expect(result.map((row) => row.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('treats an invalid stored position as not featured rather than as position zero', () => {
    const result = selectFeatured([
      entry('valid', 1),
      entry('fractional', 2.5),
      entry('negative', -4),
      entry('nan', Number.NaN),
    ]);

    expect(result.map((row) => row.id)).toEqual(['valid']);
  });

  it('breaks duplicate positions deterministically instead of by input order', () => {
    const forward = selectFeatured([entry('b', 1), entry('a', 1)]);
    const reversed = selectFeatured([entry('a', 1), entry('b', 1)]);

    expect(forward.map((row) => row.id)).toEqual(['a', 'b']);
    expect(reversed.map((row) => row.id)).toEqual(forward.map((row) => row.id));
  });
});

describe('moveItem', () => {
  it('moves an item later, shifting the items it passes', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('moves an item earlier — the brief\'s "4 becomes 2" case', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('does not mutate the input', () => {
    const original = ['a', 'b', 'c'];
    moveItem(original, 0, 2);
    expect(original).toEqual(['a', 'b', 'c']);
  });

  it('is a no-op for out-of-range or non-integer indices', () => {
    expect(moveItem(['a', 'b'], -1, 0)).toEqual(['a', 'b']);
    expect(moveItem(['a', 'b'], 0, 5)).toEqual(['a', 'b']);
    expect(moveItem(['a', 'b'], 0.5, 1)).toEqual(['a', 'b']);
    expect(moveItem(['a', 'b'], 1, 1)).toEqual(['a', 'b']);
  });
});

describe('moveItemBy', () => {
  it('moves up and down by one', () => {
    expect(moveItemBy(['a', 'b', 'c'], 2, -1)).toEqual(['a', 'c', 'b']);
    expect(moveItemBy(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
  });

  it('clamps at the ends rather than wrapping', () => {
    expect(moveItemBy(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c']);
    expect(moveItemBy(['a', 'b', 'c'], 2, 1)).toEqual(['a', 'b', 'c']);
  });
});

describe('addFeaturedId / removeFeaturedId', () => {
  it('appends rather than displacing existing editorial choices', () => {
    expect(addFeaturedId(['a', 'b'], 'c')).toEqual(['a', 'b', 'c']);
  });

  it('never adds the same entry twice', () => {
    expect(addFeaturedId(['a', 'b'], 'a')).toEqual(['a', 'b']);
  });

  it('closes ranks on removal, leaving no hole once persisted', () => {
    const remaining = removeFeaturedId(['a', 'b', 'c'], 'b');
    expect(remaining).toEqual(['a', 'c']);
    expect(toOrderAssignments(remaining)).toEqual([
      { id: 'a', featuredOrder: 1 },
      { id: 'c', featuredOrder: 2 },
    ]);
  });
});

describe('toOrderAssignments', () => {
  it('numbers from 1 with no gaps and no duplicates', () => {
    expect(toOrderAssignments(['x', 'y', 'z'])).toEqual([
      { id: 'x', featuredOrder: 1 },
      { id: 'y', featuredOrder: 2 },
      { id: 'z', featuredOrder: 3 },
    ]);
  });

  it('produces canonical numbering after an arbitrary reorder', () => {
    // The property that matters: whatever the editor does to the array, the
    // stored result is always 1..N dense. Positions are derived, never edited.
    const reordered = moveItem(moveItem(['a', 'b', 'c', 'd', 'e'], 4, 0), 2, 3);
    const positions = toOrderAssignments(reordered).map((row) => row.featuredOrder);

    expect(positions).toEqual([1, 2, 3, 4, 5]);
    expect(new Set(positions).size).toBe(positions.length);
  });

  it('is empty for an empty list', () => {
    expect(toOrderAssignments([])).toEqual([]);
  });
});

describe('parseFeaturedOrderPayload', () => {
  it('accepts a well-formed ordered id list', () => {
    expect(parseFeaturedOrderPayload(['a', 'b'])).toEqual({ ok: true, orderedIds: ['a', 'b'] });
  });

  it('accepts an empty list — unfeaturing everything is a legitimate decision', () => {
    expect(parseFeaturedOrderPayload([])).toEqual({ ok: true, orderedIds: [] });
  });

  it('rejects duplicates rather than silently de-duplicating them', () => {
    expect(parseFeaturedOrderPayload(['a', 'a'])).toEqual({ ok: false, error: 'duplicate-entry' });
  });

  it('rejects non-arrays and non-string entries', () => {
    expect(parseFeaturedOrderPayload('a')).toEqual({ ok: false, error: 'not-an-array' });
    expect(parseFeaturedOrderPayload([1])).toEqual({ ok: false, error: 'invalid-id' });
    expect(parseFeaturedOrderPayload([''])).toEqual({ ok: false, error: 'invalid-id' });
    expect(parseFeaturedOrderPayload(['  '])).toEqual({ ok: false, error: 'invalid-id' });
  });

  it('bounds how much one write may renumber', () => {
    const tooMany = Array.from({ length: MAX_FEATURED_ENTRIES + 1 }, (_, i) => `id-${i}`);
    expect(parseFeaturedOrderPayload(tooMany)).toEqual({ ok: false, error: 'too-many-entries' });
  });
});

describe('orderEditorially', () => {
  const entry = (id: string, featuredOrder: number | null) => ({ id, featuredOrder });

  it('puts featured entries first, in editorial order', () => {
    const result = orderEditorially([
      entry('a', null),
      entry('b', 2),
      entry('c', null),
      entry('d', 1),
    ]);
    expect(result.map((e) => e.id)).toEqual(['d', 'b', 'a', 'c']);
  });

  /**
   * The remainder keeps whatever order the caller established — each
   * collection's existing default means something, and re-sorting it here
   * would be inventing a rule.
   */
  it('preserves the incoming order of unfeatured entries', () => {
    const result = orderEditorially([entry('z', null), entry('y', null), entry('x', null)]);
    expect(result.map((e) => e.id)).toEqual(['z', 'y', 'x']);
  });

  it('is the identity when nothing is featured', () => {
    const input = [entry('a', null), entry('b', null)];
    expect(orderEditorially(input).map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('treats an invalid stored position as unfeatured, matching selectFeatured', () => {
    const result = orderEditorially([entry('a', null), entry('bad', 0), entry('good', 1)]);
    expect(result[0]?.id).toBe('good');
    // `bad` falls to the remainder rather than leading the collection.
    expect(result.map((e) => e.id).indexOf('bad')).toBeGreaterThan(0);
  });

  /**
   * The homepage takes the featured prefix of this same list. If these two ever
   * disagreed, the two surfaces would rank differently.
   */
  it('begins with exactly what selectFeatured returns', () => {
    const input = [entry('a', null), entry('b', 2), entry('c', 1)];
    const featured = selectFeatured(input);
    expect(orderEditorially(input).slice(0, featured.length)).toEqual(featured);
  });

  it('loses no entries', () => {
    const input = [entry('a', 1), entry('b', null), entry('c', 2)];
    expect(orderEditorially(input)).toHaveLength(3);
  });
});
