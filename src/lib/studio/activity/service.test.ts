import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SearchResult } from '@/lib/search/types';

const listMock = vi.fn();
const resolveActorsMock = vi.fn();
const listSearchIndexMock = vi.fn();

vi.mock('@/lib/events/repository', () => ({
  editorialEventRepository: { list: (...args: unknown[]) => listMock(...args) },
}));
vi.mock('@/lib/studio/actors', () => ({
  resolveActors: (...args: unknown[]) => resolveActorsMock(...args),
}));
vi.mock('@/lib/search/register', () => ({ ensureSearchAdaptersRegistered: () => {} }));
vi.mock('@/lib/search/registry', () => ({
  listSearchIndex: (...args: unknown[]) => listSearchIndexMock(...args),
}));

const { loadActivity } = await import('./service');

const CTX = { role: 'headAdmin' as const, userId: 'u1' };
const ACTOR_ID = new ObjectId();
const BLUEPRINT_ID = new ObjectId();
const DELETED_ID = new ObjectId();

function event(overrides: Record<string, unknown> = {}) {
  return {
    _id: new ObjectId(),
    entityType: 'blueprint',
    entityId: BLUEPRINT_ID,
    type: 'entry.created',
    payload: { type: 'entry.created' },
    actorUserId: ACTOR_ID,
    createdAt: new Date('2026-08-01T10:00:00Z'),
    ...overrides,
  };
}

const INDEX: SearchResult[] = [
  {
    id: BLUEPRINT_ID.toString(),
    type: 'blueprints',
    title: 'Edge Caching Blueprint',
    slug: 'edge-caching',
    referenceId: 'HZ-BP-701',
    href: `/studio/content/blueprints/${BLUEPRINT_ID.toString()}`,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  listSearchIndexMock.mockResolvedValue(INDEX);
  resolveActorsMock.mockResolvedValue(
    new Map([[ACTOR_ID.toString(), { id: ACTOR_ID.toString(), name: 'Scratch Admin' }]]),
  );
  listMock.mockResolvedValue({ events: [], nextCursor: null });
});

describe('loadActivity', () => {
  it('preserves the newest-first order the repository returned', async () => {
    listMock.mockResolvedValue({
      events: [
        event({ createdAt: new Date('2026-08-01T12:00:00Z') }),
        event({ createdAt: new Date('2026-08-01T11:00:00Z') }),
        event({ createdAt: new Date('2026-08-01T10:00:00Z') }),
      ],
      nextCursor: null,
    });

    const { items } = await loadActivity({}, CTX);

    expect(items.map((item) => item.at.toISOString())).toEqual([
      '2026-08-01T12:00:00.000Z',
      '2026-08-01T11:00:00.000Z',
      '2026-08-01T10:00:00.000Z',
    ]);
  });

  it('resolves the entry a recorded event named, with a link to its editor', async () => {
    listMock.mockResolvedValue({ events: [event()], nextCursor: null });

    const [item] = (await loadActivity({}, CTX)).items;

    expect(item?.entry).toMatchObject({
      exists: true,
      title: 'Edge Caching Blueprint',
      href: `/studio/content/blueprints/${BLUEPRINT_ID.toString()}`,
      collectionLabel: 'Blueprints',
    });
  });

  /**
   * Deleting an entry does not un-happen its history. The event stays, and the
   * row says the entry is gone rather than linking nowhere.
   */
  it('keeps events whose entry has been deleted, and marks them', async () => {
    listMock.mockResolvedValue({ events: [event({ entityId: DELETED_ID })], nextCursor: null });

    const [item] = (await loadActivity({}, CTX)).items;

    expect(item?.entry.exists).toBe(false);
    expect(item?.entry.collectionLabel).toBe('Blueprints');
  });

  it('leaves the actor absent rather than inventing one', async () => {
    resolveActorsMock.mockResolvedValue(new Map());
    listMock.mockResolvedValue({ events: [event()], nextCursor: null });

    expect((await loadActivity({}, CTX)).items[0]?.actor).toBeUndefined();
  });

  it('handles a system write with no actor recorded', async () => {
    listMock.mockResolvedValue({ events: [event({ actorUserId: undefined })], nextCursor: null });

    const { items } = await loadActivity({}, CTX);

    expect(items[0]?.actor).toBeUndefined();
    expect(resolveActorsMock).toHaveBeenCalledWith([]);
  });

  it('renders each event through the shared describer', async () => {
    listMock.mockResolvedValue({
      events: [
        event({
          type: 'entry.statusChanged',
          payload: { type: 'entry.statusChanged', from: 'draft', to: 'inReview' },
        }),
      ],
      nextCursor: null,
    });

    expect((await loadActivity({}, CTX)).items[0]).toMatchObject({
      action: 'Status changed',
      detail: 'Draft → In review',
      historyType: 'statusChanged',
    });
  });

  it('batches actor resolution into a single call for the whole page', async () => {
    listMock.mockResolvedValue({
      events: [event(), event(), event()],
      nextCursor: null,
    });

    await loadActivity({}, CTX);

    expect(resolveActorsMock).toHaveBeenCalledTimes(1);
  });

  describe('search integration', () => {
    it('translates a query into the ids of matching entries', async () => {
      await loadActivity({ q: 'HZ-BP-701' }, CTX);

      expect(listMock).toHaveBeenCalledWith(
        expect.objectContaining({ entityIds: [BLUEPRINT_ID.toString()] }),
        expect.anything(),
      );
    });

    it('matches on title and slug as well as reference ID', async () => {
      await loadActivity({ q: 'edge-caching' }, CTX);
      expect(listMock.mock.calls[0]?.[0]).toMatchObject({ entityIds: [BLUEPRINT_ID.toString()] });

      listMock.mockClear();
      await loadActivity({ q: 'Edge Caching' }, CTX);
      expect(listMock.mock.calls[0]?.[0]).toMatchObject({ entityIds: [BLUEPRINT_ID.toString()] });
    });

    /**
     * An empty id list must mean "match nothing". Passing no filter instead
     * would show the whole feed as though the search had succeeded.
     */
    it('passes an empty id list when nothing matches', async () => {
      await loadActivity({ q: 'no-such-entry' }, CTX);

      expect(listMock.mock.calls[0]?.[0]).toMatchObject({ entityIds: [] });
    });

    it('applies no entry filter when there is no query', async () => {
      await loadActivity({}, CTX);

      expect(listMock.mock.calls[0]?.[0]).not.toHaveProperty('entityIds');
    });
  });

  describe('filters and pagination', () => {
    it('forwards every filter to the repository rather than filtering in memory', async () => {
      const from = new Date('2026-07-01T00:00:00Z');
      const to = new Date('2026-08-01T23:59:59Z');

      await loadActivity(
        {
          entityTypes: ['blueprint'],
          types: ['entry.created'],
          actorUserId: ACTOR_ID.toString(),
          from,
          to,
        },
        CTX,
      );

      expect(listMock.mock.calls[0]?.[0]).toEqual({
        entityTypes: ['blueprint'],
        types: ['entry.created'],
        actorUserId: ACTOR_ID.toString(),
        from,
        to,
      });
    });

    it('passes the cursor and page size through, and returns the next cursor', async () => {
      const cursor = { at: '2026-08-01T10:00:00.000Z', id: new ObjectId().toString() };
      const nextCursor = { at: '2026-08-01T09:00:00.000Z', id: new ObjectId().toString() };
      listMock.mockResolvedValue({ events: [event()], nextCursor });

      const page = await loadActivity({}, CTX, { limit: 25, cursor });

      expect(listMock).toHaveBeenCalledWith(expect.anything(), { limit: 25, cursor });
      expect(page.nextCursor).toEqual(nextCursor);
    });

    it('reports no next cursor on the last page', async () => {
      listMock.mockResolvedValue({ events: [event()], nextCursor: null });

      expect((await loadActivity({}, CTX)).nextCursor).toBeNull();
    });
  });
});
