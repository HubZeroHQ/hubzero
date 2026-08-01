import { ObjectId } from 'mongodb';
import type { Filter, OptionalUnlessRequiredId } from 'mongodb';
import { collections } from '@/lib/db/collections';
import {
  editorialEventSchema,
  EDITORIAL_EVENT_INDEXES,
  type EditorialEventInput,
  type EditorialEventRecord,
  type EditorialEventType,
  type EventEntityType,
} from './schema';

/**
 * The editorial event log's only API.
 *
 * There is deliberately **no `update` and no `remove`**. Append-only is
 * enforced by the absence of a way to violate it rather than by a comment
 * asking callers not to — a log whose entries can be edited is not evidence.
 *
 * Writes are best-effort and never throw into the caller: a failed event write
 * must not roll back or fail the editorial action that produced it. Losing an
 * audit row is bad; losing an editor's save because the audit row failed is
 * worse, and the action has already succeeded by the time we get here.
 */
export const editorialEventRepository = {
  /**
   * Appends one event. Validated through Zod first, so a malformed payload is
   * rejected at the boundary rather than stored and discovered later by a
   * reader that cannot interpret it.
   */
  async append(input: EditorialEventInput): Promise<EditorialEventRecord | null> {
    let parsed: EditorialEventInput;
    try {
      parsed = editorialEventSchema.parse(input);
    } catch {
      return null;
    }

    const doc = {
      entityType: parsed.entityType,
      entityId: new ObjectId(parsed.entityId),
      type: parsed.payload.type,
      payload: parsed.payload,
      ...(parsed.actorUserId ? { actorUserId: new ObjectId(parsed.actorUserId) } : {}),
      createdAt: new Date(),
    };

    try {
      const collection = await collections.editorialEvents();
      const { insertedId } = await collection.insertOne(
        doc as unknown as OptionalUnlessRequiredId<EditorialEventRecord>,
      );
      return { ...doc, _id: insertedId } as EditorialEventRecord;
    } catch {
      return null;
    }
  },

  /** One entry's history, newest first. */
  async listForEntry(
    entityType: EventEntityType,
    entityId: string,
    limit = 200,
  ): Promise<EditorialEventRecord[]> {
    if (!ObjectId.isValid(entityId)) return [];
    const collection = await collections.editorialEvents();
    return collection
      .find({ entityType, entityId: new ObjectId(entityId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  },

  /** One collection's activity, newest first. */
  async listForCollection(
    entityType: EventEntityType,
    limit = 100,
  ): Promise<EditorialEventRecord[]> {
    const collection = await collections.editorialEvents();
    return collection.find({ entityType }).sort({ createdAt: -1 }).limit(limit).toArray();
  },

  /** Studio-wide recent activity, newest first. */
  async listRecent(limit = 50): Promise<EditorialEventRecord[]> {
    const collection = await collections.editorialEvents();
    return collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
  },

  /**
   * The distinct actors who appear anywhere in the log — the options for the
   * feed's actor filter.
   *
   * Read from the log rather than from the user list on purpose: offering
   * every user would fill the filter with people who have never edited
   * anything, and every one of those options would return an empty feed.
   */
  async distinctActorIds(): Promise<string[]> {
    const collection = await collections.editorialEvents();
    // `$exists` rather than `$ne: null`: the field is omitted entirely on a
    // system-originated write, never stored as an explicit null.
    const ids = await collection.distinct('actorUserId', { actorUserId: { $exists: true } });
    return ids.filter((id): id is ObjectId => id instanceof ObjectId).map((id) => id.toString());
  },

  /**
   * The filtered, paginated feed behind `/studio/activity` (v3.1 Milestone 9).
   *
   * Every filter is applied **in the query**, not after the fact: the brief
   * requires server-side filtering, and paging a filter applied in memory
   * would silently return short pages (or empty ones) as soon as the filtered
   * set was sparser than the page size.
   */
  async list(
    query: EditorialEventQuery = {},
    options: { limit?: number; cursor?: EditorialEventCursor | null } = {},
  ): Promise<EditorialEventPage> {
    const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
    const collection = await collections.editorialEvents();

    const filter = buildEventFilter(query, options.cursor ?? null);
    if (filter === null) {
      // An impossible filter — see `buildEventFilter`. Returning early avoids
      // issuing a query guaranteed to match nothing.
      return { events: [], nextCursor: null };
    }

    // One extra row is fetched purely to learn whether another page exists,
    // which is cheaper and more accurate than a separate `countDocuments`
    // over the same filter.
    const rows = await collection
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .toArray();

    const events = rows.slice(0, limit);
    const last = events[events.length - 1];

    return {
      events,
      nextCursor:
        rows.length > limit && last
          ? { at: last.createdAt.toISOString(), id: last._id.toString() }
          : null,
    };
  },
};

export interface EditorialEventQuery {
  /** Collections to include. Omitted means every collection. */
  entityTypes?: readonly EventEntityType[];
  /** Event types to include. Omitted means every type. */
  types?: readonly EditorialEventType[];
  actorUserId?: string;
  /** Inclusive lower bound on `createdAt`. */
  from?: Date;
  /** Inclusive upper bound on `createdAt`. */
  to?: Date;
  /**
   * Restricts the feed to specific entries — how a free-text search is
   * applied, by resolving matching entries through the existing search index
   * and passing their ids here rather than by indexing event text.
   *
   * An **empty array means "match nothing"**, not "no filter". A search that
   * found no entries must return no activity; treating it as absent would
   * quietly show the entire unfiltered feed as if the search had succeeded.
   */
  entityIds?: readonly string[];
}

/**
 * Position in the feed. Carries `_id` alongside the timestamp because
 * `createdAt` is not unique — several events are written within the same
 * millisecond by a single save — and a timestamp-only cursor would either skip
 * or repeat the events sharing a boundary millisecond.
 */
export interface EditorialEventCursor {
  at: string;
  id: string;
}

export interface EditorialEventPage {
  events: EditorialEventRecord[];
  /** Absent when this is the last page. */
  nextCursor: EditorialEventCursor | null;
}

/** Returns `null` when the filter cannot match anything. */
function buildEventFilter(
  query: EditorialEventQuery,
  cursor: EditorialEventCursor | null,
): Filter<EditorialEventRecord> | null {
  const filter: Record<string, unknown> = {};

  if (query.entityTypes && query.entityTypes.length > 0) {
    filter.entityType = { $in: [...query.entityTypes] };
  }

  if (query.types && query.types.length > 0) {
    filter.type = { $in: [...query.types] };
  }

  if (query.actorUserId) {
    if (!ObjectId.isValid(query.actorUserId)) return null;
    filter.actorUserId = new ObjectId(query.actorUserId);
  }

  if (query.entityIds) {
    const ids = query.entityIds.filter((id) => ObjectId.isValid(id));
    if (ids.length === 0) return null;
    filter.entityId = { $in: ids.map((id) => new ObjectId(id)) };
  }

  const createdAt: Record<string, Date> = {};
  if (query.from) createdAt.$gte = query.from;
  if (query.to) createdAt.$lte = query.to;

  if (cursor) {
    const at = new Date(cursor.at);
    if (Number.isNaN(at.getTime()) || !ObjectId.isValid(cursor.id)) return null;
    // Strictly after the cursor in the sort order `(createdAt desc, _id desc)`.
    const bound = [
      { createdAt: { ...createdAt, $lt: at } },
      { createdAt: { ...createdAt, $eq: at }, _id: { $lt: new ObjectId(cursor.id) } },
    ];
    return { ...filter, $or: bound } as Filter<EditorialEventRecord>;
  }

  if (Object.keys(createdAt).length > 0) filter.createdAt = createdAt;

  return filter as Filter<EditorialEventRecord>;
}

/**
 * Creates the collection's indexes if they are missing.
 *
 * `createIndexes` is idempotent, so this is safe to call repeatedly, and it is
 * invoked lazily from the first write rather than at import time — this
 * repository has no migration runner, and opening a connection just because a
 * module was imported would break the lazy-connection contract in
 * `lib/db/mongodb.ts`.
 */
let indexesEnsured = false;
export async function ensureEditorialEventIndexes(): Promise<void> {
  if (indexesEnsured) return;
  indexesEnsured = true;
  try {
    const collection = await collections.editorialEvents();
    await collection.createIndexes([...EDITORIAL_EVENT_INDEXES]);
  } catch {
    // A missing index degrades performance, never correctness — and must not
    // take down the action that triggered the write.
    indexesEnsured = false;
  }
}
