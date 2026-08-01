import { describe, expect, it } from 'vitest';
import { serializeFormEntries } from './form-snapshot';

/**
 * These cover the property the phase brief actually asks for — dirty means
 * "the data differs", not "a field was touched" — rather than the
 * serializer's output format, which is deliberately unspecified.
 */
function snapshot(entries: Array<[string, string]>): string {
  return serializeFormEntries(entries);
}

describe('serializeFormEntries', () => {
  it('treats an edit-then-undo as no change at all', () => {
    const original = snapshot([['title', 'QueryCraft']]);
    const edited = snapshot([['title', 'QueryCraft AI']]);
    const reverted = snapshot([['title', 'QueryCraft']]);

    expect(edited).not.toBe(original);
    expect(reverted).toBe(original);
  });

  it('ignores the order fields appear in, since that is not user data', () => {
    expect(
      snapshot([
        ['slug', 'northwind'],
        ['title', 'Northwind'],
      ]),
    ).toBe(
      snapshot([
        ['title', 'Northwind'],
        ['slug', 'northwind'],
      ]),
    );
  });

  it('preserves order within one multi-value field, where order is user data', () => {
    const galleryA = snapshot([
      ['galleryImageIds', 'a'],
      ['galleryImageIds', 'b'],
    ]);
    const galleryB = snapshot([
      ['galleryImageIds', 'b'],
      ['galleryImageIds', 'a'],
    ]);

    expect(galleryA).not.toBe(galleryB);
  });

  it('distinguishes an absent field from a present-but-empty one', () => {
    // An unchecked checkbox is absent from FormData; an emptied text input
    // is present and empty. Collapsing the two would miss real edits.
    expect(snapshot([])).not.toBe(snapshot([['featured', '']]));
  });

  it('sees a checkbox being toggled on and back off as clean', () => {
    const off = snapshot([['title', 'Lab']]);
    const on = snapshot([
      ['title', 'Lab'],
      ['featured', 'on'],
    ]);

    expect(on).not.toBe(off);
    expect(snapshot([['title', 'Lab']])).toBe(off);
  });

  it('does not report a change when two fields swap identical values', () => {
    // Guards against a naive "concatenate every value" serializer, which
    // would call these two forms equal.
    expect(
      snapshot([
        ['role', 'a'],
        ['group', 'b'],
      ]),
    ).not.toBe(
      snapshot([
        ['role', 'b'],
        ['group', 'a'],
      ]),
    );
  });

  it("skips React's own Server Action fields, which change on every render", () => {
    const withoutActionId = snapshot([['title', 'Note']]);
    const withActionId = serializeFormEntries([
      ['title', 'Note'],
      ['$ACTION_ID_abc123', ''],
    ]);

    expect(withActionId).toBe(withoutActionId);
  });

  it('compares files by identity rather than by contents', () => {
    const file = new File(['x'], 'diagram.png', { type: 'image/png' });
    const same = serializeFormEntries([['upload', file]]);
    const again = serializeFormEntries([['upload', file]]);
    const different = serializeFormEntries([
      ['upload', new File(['xyz'], 'diagram.png', { type: 'image/png' })],
    ]);

    expect(again).toBe(same);
    expect(different).not.toBe(same);
  });
});
