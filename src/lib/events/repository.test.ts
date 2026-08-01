import { describe, expect, it } from 'vitest';
import { editorialEventSchema } from './schema';
import { editorialEventRepository } from './repository';

const validId = '6a6c9ede16af3400242a48e9';

describe('editorial event log is append-only by construction', () => {
  it('exposes no way to update or delete an event', () => {
    // Append-only is enforced by the absence of an API to violate it, not by a
    // comment. If someone adds `update`/`remove`, this fails.
    //
    // Pinned as an exact list rather than a "does not contain update" check:
    // the ways to mutate a collection are not a closed set someone could
    // enumerate here (`replace`, `upsert`, `bulkWrite`, `redact`…), so the
    // guard is that *any* new method must be justified by editing this line.
    expect(Object.keys(editorialEventRepository).sort()).toEqual([
      'append',
      'distinctActorIds',
      'list',
      'listForCollection',
      'listForEntry',
      'listRecent',
    ]);
  });
});

describe('editorialEventSchema', () => {
  it('accepts a well-formed status transition', () => {
    const parsed = editorialEventSchema.safeParse({
      entityType: 'work',
      entityId: validId,
      actorUserId: validId,
      payload: { type: 'entry.statusChanged', from: 'inReview', to: 'published' },
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects a status transition missing its statuses — metadata is not optional', () => {
    const parsed = editorialEventSchema.safeParse({
      entityType: 'work',
      entityId: validId,
      payload: { type: 'entry.statusChanged' },
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects an unknown event type rather than storing an uninterpretable row', () => {
    const parsed = editorialEventSchema.safeParse({
      entityType: 'work',
      entityId: validId,
      payload: { type: 'entry.exploded' },
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a malformed entity id', () => {
    expect(
      editorialEventSchema.safeParse({
        entityType: 'work',
        entityId: 'not-an-id',
        payload: { type: 'entry.created' },
      }).success,
    ).toBe(false);
  });

  it('rejects an unknown entity type', () => {
    expect(
      editorialEventSchema.safeParse({
        entityType: 'sandwich',
        entityId: validId,
        payload: { type: 'entry.created' },
      }).success,
    ).toBe(false);
  });

  it('allows a featured-order event to move to or from null, but not to a fractional position', () => {
    const base = { entityType: 'note' as const, entityId: validId };
    expect(
      editorialEventSchema.safeParse({
        ...base,
        payload: { type: 'entry.featuredOrderChanged', from: null, to: 2 },
      }).success,
    ).toBe(true);
    expect(
      editorialEventSchema.safeParse({
        ...base,
        payload: { type: 'entry.featuredOrderChanged', from: 1, to: 2.5 },
      }).success,
    ).toBe(false);
  });

  it('treats the actor as optional — a system write has none, and none is invented', () => {
    const parsed = editorialEventSchema.safeParse({
      entityType: 'work',
      entityId: validId,
      payload: { type: 'entry.created' },
    });
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.actorUserId).toBeUndefined();
  });

  it('requires a role on a document event so the timeline can name which document', () => {
    expect(
      editorialEventSchema.safeParse({
        entityType: 'work',
        entityId: validId,
        payload: { type: 'document.updated' },
      }).success,
    ).toBe(false);
  });
});
