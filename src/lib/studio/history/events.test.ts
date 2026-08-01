import { describe, expect, it } from 'vitest';
import {
  bucketFor,
  buildEntryHistory,
  fromRecordedEvents,
  groupHistory,
  sortHistory,
  type HistoryActor,
  type HistoryEvent,
} from './events';

const now = new Date('2026-08-01T12:00:00.000Z');
const alice: HistoryActor = { id: 'u1', name: 'Alice' };

function event(overrides: Partial<HistoryEvent> & Pick<HistoryEvent, 'id' | 'at'>): HistoryEvent {
  return { type: 'created', description: 'Entry created', ...overrides };
}

const actors = new Map<string, HistoryActor>([['u1', alice]]);
const resolveActor = (id: string | undefined) => (id ? actors.get(id) : undefined);

describe('sortHistory', () => {
  it('orders newest first', () => {
    const sorted = sortHistory([
      event({ id: 'old', at: new Date('2026-07-01T00:00:00Z') }),
      event({ id: 'new', at: new Date('2026-07-31T00:00:00Z') }),
    ]);

    expect(sorted.map((entry) => entry.id)).toEqual(['new', 'old']);
  });

  it('breaks identical timestamps deterministically rather than by input order', () => {
    const at = new Date('2026-07-31T00:00:00Z');
    const forward = sortHistory([event({ id: 'b', at }), event({ id: 'a', at })]);
    const reversed = sortHistory([event({ id: 'a', at }), event({ id: 'b', at })]);

    expect(forward.map((entry) => entry.id)).toEqual(['a', 'b']);
    expect(reversed.map((entry) => entry.id)).toEqual(forward.map((entry) => entry.id));
  });

  it('does not mutate its input', () => {
    const input = [event({ id: 'a', at: new Date('2026-07-01Z') })];
    sortHistory(input);
    expect(input).toHaveLength(1);
  });
});

describe('bucketFor', () => {
  it('buckets by calendar day, not elapsed hours', () => {
    // 23 hours earlier but the previous date — an editor calls this yesterday.
    expect(bucketFor(new Date('2026-07-31T13:00:00.000Z'), now)).toBe('yesterday');
    expect(bucketFor(new Date('2026-08-01T00:01:00.000Z'), now)).toBe('today');
  });

  it('covers last week and earlier', () => {
    expect(bucketFor(new Date('2026-07-27T12:00:00.000Z'), now)).toBe('lastWeek');
    expect(bucketFor(new Date('2026-06-01T12:00:00.000Z'), now)).toBe('earlier');
  });

  it('treats a future timestamp as today rather than crashing the grouping', () => {
    expect(bucketFor(new Date('2026-08-02T12:00:00.000Z'), now)).toBe('today');
  });
});

describe('groupHistory', () => {
  it('groups in fixed bucket order and omits empty buckets', () => {
    const groups = groupHistory(
      [
        event({ id: 'a', at: new Date('2026-08-01T09:00:00Z') }),
        event({ id: 'b', at: new Date('2026-06-01T09:00:00Z') }),
      ],
      now,
    );

    expect(groups.map((group) => group.bucket)).toEqual(['today', 'earlier']);
  });

  it('keeps newest-first ordering inside each group', () => {
    const groups = groupHistory(
      [
        event({ id: 'early', at: new Date('2026-08-01T08:00:00Z') }),
        event({ id: 'late', at: new Date('2026-08-01T11:00:00Z') }),
      ],
      now,
    );

    expect(groups[0]?.events.map((entry) => entry.id)).toEqual(['late', 'early']);
  });

  it('returns no groups for an empty history', () => {
    expect(groupHistory([], now)).toEqual([]);
  });
});

describe('buildEntryHistory', () => {
  const createdAt = new Date('2026-07-01T10:00:00.000Z');

  it('always reports creation, with the resolved actor', () => {
    const events = buildEntryHistory({
      entry: { id: 'e1', createdAt, updatedAt: createdAt, createdByUserId: 'u1' },
      resolveActor,
    });

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe('created');
    expect(events[0]?.actor).toEqual(alice);
  });

  it('does not report a save on a record that has never been edited', () => {
    // `createdAt` and `updatedAt` are the same instant until the first edit;
    // emitting a save there would describe creation twice.
    const events = buildEntryHistory({
      entry: { id: 'e1', createdAt, updatedAt: new Date(createdAt.getTime() + 400) },
      resolveActor,
    });

    expect(events.map((entry) => entry.type)).toEqual(['created']);
  });

  it('reports a save once the record has genuinely been edited, with no invented actor', () => {
    const events = buildEntryHistory({
      entry: {
        id: 'e1',
        createdAt,
        updatedAt: new Date('2026-07-20T10:00:00.000Z'),
        createdByUserId: 'u1',
      },
      resolveActor,
    });

    const saved = events.find((entry) => entry.type === 'metadataSaved');
    expect(saved).toBeDefined();
    // No actor is stored for updates — showing the creator would be a guess.
    expect(saved?.actor).toBeUndefined();
  });

  it('turns document snapshots into a series, oldest marking the document start', () => {
    const events = buildEntryHistory({
      entry: { id: 'e1', createdAt, updatedAt: createdAt },
      documentVersions: [
        {
          id: 'v2',
          role: 'caseStudy',
          createdAt: new Date('2026-07-10T10:00:00Z'),
          createdByUserId: 'u1',
        },
        {
          id: 'v1',
          role: 'caseStudy',
          createdAt: new Date('2026-07-05T10:00:00Z'),
          createdByUserId: 'u1',
        },
      ],
      resolveActor,
    });

    const documentEvents = events.filter((entry) => entry.type.startsWith('document'));
    // Newest first overall, but the *oldest* snapshot is the one marked "started".
    expect(documentEvents.map((entry) => entry.type)).toEqual([
      'documentUpdated',
      'documentCreated',
    ]);
    expect(documentEvents.every((entry) => entry.actor?.name === 'Alice')).toBe(true);
  });

  it('leaves the actor absent for an unknown or deleted user', () => {
    const events = buildEntryHistory({
      entry: { id: 'e1', createdAt, updatedAt: createdAt, createdByUserId: 'deleted-user' },
      resolveActor,
    });

    expect(events[0]?.actor).toBeUndefined();
  });

  it('returns the timeline newest first', () => {
    const events = buildEntryHistory({
      entry: { id: 'e1', createdAt, updatedAt: new Date('2026-07-25T10:00:00Z') },
      documentVersions: [
        { id: 'v1', role: 'caseStudy', createdAt: new Date('2026-07-10T10:00:00Z') },
      ],
      resolveActor,
    });

    const times = events.map((entry) => entry.at.getTime());
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });

  it('invents no workflow events — only what Studio records appears', () => {
    const events = buildEntryHistory({
      entry: { id: 'e1', createdAt, updatedAt: new Date('2026-07-25T10:00:00Z') },
      resolveActor,
    });

    const types = new Set(events.map((entry) => entry.type));
    for (const fabricated of ['published', 'approved', 'archived', 'submitted']) {
      expect(types.has(fabricated as never)).toBe(false);
    }
  });
});

describe('fromRecordedEvents', () => {
  const at = new Date('2026-07-15T10:00:00.000Z');

  it('reports a status transition as recorded, not as inferred from current state', () => {
    const [event] = fromRecordedEvents(
      [
        {
          id: 'e1',
          at,
          actorUserId: 'u1',
          payload: { type: 'entry.statusChanged', from: 'inReview', to: 'published' },
        },
      ],
      resolveActor,
    );

    expect(event?.type).toBe('statusChanged');
    expect(event?.description).toBe('In review → Published');
    expect(event?.actor).toEqual(alice);
  });

  it('includes the reviewer note on a rejection', () => {
    const [event] = fromRecordedEvents(
      [
        {
          id: 'e1',
          at,
          payload: {
            type: 'entry.statusChanged',
            from: 'inReview',
            to: 'draft',
            reviewNote: 'Needs a hero image',
          },
        },
      ],
      resolveActor,
    );

    expect(event?.description).toContain('Needs a hero image');
  });

  it('describes featuring, refeaturing and unfeaturing distinctly', () => {
    const events = fromRecordedEvents(
      [
        { id: 'a', at, payload: { type: 'entry.featuredOrderChanged', from: null, to: 1 } },
        { id: 'b', at, payload: { type: 'entry.featuredOrderChanged', from: 1, to: 3 } },
        { id: 'c', at, payload: { type: 'entry.featuredOrderChanged', from: 2, to: null } },
      ],
      resolveActor,
    );

    expect(events.map((event) => event.description)).toEqual([
      'Featured at position 1',
      'Featured position 1 → 3',
      'Removed from featured',
    ]);
  });

  it('describes media changes and clears', () => {
    const events = fromRecordedEvents(
      [
        {
          id: 'a',
          at,
          payload: {
            type: 'entry.mediaChanged',
            field: 'heroImageId',
            from: null,
            to: '6a6c9ede16af3400242a48e9',
          },
        },
        {
          id: 'b',
          at,
          payload: {
            type: 'entry.mediaChanged',
            field: 'heroImageId',
            from: '6a6c9ede16af3400242a48e9',
            to: null,
          },
        },
      ],
      resolveActor,
    );

    expect(events[0]?.description).toBe('heroImageId changed');
    expect(events[1]?.description).toBe('heroImageId cleared');
  });

  it('leaves the actor absent for a system write or a deleted user', () => {
    const [event] = fromRecordedEvents(
      [{ id: 'e1', at, payload: { type: 'entry.created' } }],
      resolveActor,
    );
    expect(event?.actor).toBeUndefined();
  });

  it('maps every recorded payload type without falling through', () => {
    const events = fromRecordedEvents(
      [
        { id: 'a', at, payload: { type: 'entry.created' } },
        { id: 'b', at, payload: { type: 'entry.updated' } },
        { id: 'c', at, payload: { type: 'entry.statusChanged', from: 'draft', to: 'inReview' } },
        { id: 'd', at, payload: { type: 'entry.featuredOrderChanged', from: null, to: 2 } },
        {
          id: 'e',
          at,
          payload: { type: 'entry.mediaChanged', field: 'hero', from: null, to: null },
        },
        { id: 'f', at, payload: { type: 'document.updated', role: 'caseStudy' } },
      ],
      resolveActor,
    );

    expect(events).toHaveLength(6);
    expect(events.every((event) => event.description.length > 0)).toBe(true);
  });
});
