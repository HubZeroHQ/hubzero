import { z } from 'zod';
import { objectIdString } from '@/lib/validation/shared';

/**
 * The editorial event log (v3.1 Milestone 8) — append-only infrastructure.
 *
 * Milestone 7 built a history timeline and found there was nothing to build it
 * from: `status` records the present, not how it was reached, so nine of the
 * twelve events an editor cares about left no trace. This is that missing
 * foundation. Every future timeline, activity feed and audit view reads from
 * here.
 *
 * ## Events are facts
 *
 * Written once, never updated, never deleted. The repository deliberately
 * exposes no `update` or `remove` — append-only is enforced by the absence of
 * an API to violate it, not by convention. An event that could be rewritten is
 * not a record of what happened; it is a record of what someone last claimed
 * happened.
 *
 * ## Each event type owns its metadata
 *
 * A discriminated union rather than a shared `metadata: Record<string,
 * unknown>` bag. A publish event *must* carry the statuses it moved between; a
 * featured-order event *must* carry the positions. With a generic blob those
 * are conventions that decay silently — a writer forgets a field and nothing
 * complains until a reader needs it, by which point the events are already
 * written and the history is permanently incomplete. Here the type system and
 * the Zod parse both refuse.
 */

export const EDITORIAL_EVENT_TYPES = [
  'entry.created',
  'entry.updated',
  'entry.statusChanged',
  'entry.featuredOrderChanged',
  'entry.mediaChanged',
  'document.updated',
] as const;

export type EditorialEventType = (typeof EDITORIAL_EVENT_TYPES)[number];

/** Mirrors `OwnerType`/collection keys — the entity the event is *about*. */
export const eventEntityTypeSchema = z.enum([
  'work',
  'build',
  'blueprint',
  'lab',
  'note',
  'career',
  'service',
  'teamMember',
  'engineeringProfile',
]);

export type EventEntityType = z.infer<typeof eventEntityTypeSchema>;

/**
 * Maps a public entity type to the event log's vocabulary. They agree today;
 * this exists so a future divergence is one function rather than scattered
 * casts.
 *
 * Lives here, beside the enum it validates against, rather than next to the
 * writer: readers need it too, and importing it from `record.ts` would pull
 * that module's `auth()` dependency — and so all of `next-auth` — into every
 * consumer that only wanted to name an entity type.
 */
export function eventEntityTypeFor(value: string): EventEntityType | null {
  return eventEntityTypeSchema.safeParse(value).success ? (value as EventEntityType) : null;
}

const publishStatusLike = z.enum(['draft', 'inReview', 'approved', 'published', 'archived']);

/**
 * Per-type payloads. `entry.created` and `entry.updated` carry no payload of
 * their own — the fact and its timestamp are the whole content, and inventing
 * a diff we do not actually compute would be the same mistake Milestone 7
 * refused to make.
 */
const payloadSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('entry.created') }),
  z.object({ type: z.literal('entry.updated') }),
  z.object({
    type: z.literal('entry.statusChanged'),
    from: publishStatusLike,
    to: publishStatusLike,
    /** Present only on a rejection, where the workflow requires a reason. */
    reviewNote: z.string().min(1).optional(),
  }),
  z.object({
    type: z.literal('entry.featuredOrderChanged'),
    from: z.number().int().min(1).nullable(),
    to: z.number().int().min(1).nullable(),
  }),
  z.object({
    type: z.literal('entry.mediaChanged'),
    field: z.string().min(1),
    from: objectIdString.nullable(),
    to: objectIdString.nullable(),
  }),
  z.object({
    type: z.literal('document.updated'),
    role: z.string().min(1),
    /** The snapshot taken before this update — the timeline's link into version history. */
    versionId: objectIdString.optional(),
  }),
]);

export type EditorialEventPayload = z.infer<typeof payloadSchema>;

export const editorialEventSchema = z.object({
  entityType: eventEntityTypeSchema,
  entityId: objectIdString,
  /** Absent for a system-originated write; never guessed when unknown. */
  actorUserId: objectIdString.optional(),
  payload: payloadSchema,
});

export type EditorialEventInput = z.infer<typeof editorialEventSchema>;

export interface EditorialEventRecord {
  _id: import('mongodb').ObjectId;
  entityType: EventEntityType;
  entityId: import('mongodb').ObjectId;
  type: EditorialEventType;
  payload: EditorialEventPayload;
  actorUserId?: import('mongodb').ObjectId;
  createdAt: Date;
}

/**
 * Indexes this collection needs. Declared here rather than in a migration
 * because there is no migration runner in this repository yet — see
 * `ensureEditorialEventIndexes`.
 *
 * `(entityType, entityId, createdAt)` serves the entry timeline, `(createdAt)`
 * the recent-activity feed, and `(actorUserId, createdAt)` per-person audit.
 */
export const EDITORIAL_EVENT_INDEXES = [
  { key: { entityType: 1, entityId: 1, createdAt: -1 }, name: 'entity_createdAt' },
  { key: { createdAt: -1 }, name: 'createdAt' },
  { key: { actorUserId: 1, createdAt: -1 }, name: 'actor_createdAt' },
] as const;
