import { describe, expect, it } from 'vitest';
import { describeEditorialEvent } from './describe';
import { EDITORIAL_EVENT_TYPES, type EditorialEventPayload } from './schema';

/**
 * The describer is the single mapping both the entry timeline and the activity
 * feed render through, so these tests are what stop a new event type from
 * reaching either surface unlabelled.
 */
describe('describeEditorialEvent', () => {
  it('describes a creation and a save with no invented metadata', () => {
    const created = describeEditorialEvent({ type: 'entry.created' });
    expect(created.action).toBe('Entry created');
    expect(created.detail).toBeUndefined();

    const updated = describeEditorialEvent({ type: 'entry.updated' });
    expect(updated.action).toBe('Metadata saved');
    expect(updated.detail).toBeUndefined();
  });

  it('reports the transition a status change actually recorded', () => {
    expect(
      describeEditorialEvent({ type: 'entry.statusChanged', from: 'inReview', to: 'published' })
        .detail,
    ).toBe('In review → Published');
  });

  it('includes the reviewer note on a rejection', () => {
    expect(
      describeEditorialEvent({
        type: 'entry.statusChanged',
        from: 'inReview',
        to: 'draft',
        reviewNote: 'Needs a diagram.',
      }).detail,
    ).toBe('In review → Draft — “Needs a diagram.”');
  });

  it('distinguishes featuring, moving and unfeaturing', () => {
    expect(
      describeEditorialEvent({ type: 'entry.featuredOrderChanged', from: null, to: 1 }).detail,
    ).toBe('Featured at position 1');
    expect(
      describeEditorialEvent({ type: 'entry.featuredOrderChanged', from: 1, to: 3 }).detail,
    ).toBe('Featured position 1 → 3');
    expect(
      describeEditorialEvent({ type: 'entry.featuredOrderChanged', from: 2, to: null }).detail,
    ).toBe('Removed from featured');
  });

  it('distinguishes a replaced media field from a cleared one', () => {
    expect(
      describeEditorialEvent({
        type: 'entry.mediaChanged',
        field: 'heroImageId',
        from: null,
        to: '6a6e0081db3117f6672d3501',
      }).detail,
    ).toBe('heroImageId changed');
    expect(
      describeEditorialEvent({
        type: 'entry.mediaChanged',
        field: 'heroImageId',
        from: '6a6e0081db3117f6672d3501',
        to: null,
      }).detail,
    ).toBe('heroImageId cleared');
  });

  it('names the document role that was updated', () => {
    expect(describeEditorialEvent({ type: 'document.updated', role: 'overview' })).toMatchObject({
      action: 'Document updated',
      detail: 'overview document updated',
    });
  });

  /**
   * The guard that matters: a type added to the schema but forgotten here would
   * otherwise reach the feed as an unlabelled row.
   */
  it('describes every event type the schema declares', () => {
    const samples: Record<string, EditorialEventPayload> = {
      'entry.created': { type: 'entry.created' },
      'entry.updated': { type: 'entry.updated' },
      'entry.statusChanged': { type: 'entry.statusChanged', from: 'draft', to: 'inReview' },
      'entry.featuredOrderChanged': { type: 'entry.featuredOrderChanged', from: null, to: 1 },
      'entry.mediaChanged': { type: 'entry.mediaChanged', field: 'cover', from: null, to: null },
      'document.updated': { type: 'document.updated', role: 'body' },
    };

    for (const type of EDITORIAL_EVENT_TYPES) {
      const payload = samples[type];
      expect(payload, `no sample payload for ${type}`).toBeDefined();
      const described = describeEditorialEvent(payload!);
      expect(described.type).toBe(type);
      expect(described.action.length).toBeGreaterThan(0);
    }
  });
});
