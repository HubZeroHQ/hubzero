import 'server-only';

import { ObjectId } from 'mongodb';
import { collections } from '@/lib/db/collections';

export interface StudioActor {
  id: string;
  name: string;
}

/**
 * Resolves every actor referenced by a set of events in **one** query.
 *
 * Extracted from the entry timeline (v3.1 Milestone 7) when the activity feed
 * needed the same thing (Milestone 9). Both surfaces face the identical N+1:
 * the naive version looks up a user per event, which on a busy feed is one
 * query per row. Callers collect the distinct ids first, fetch once here, and
 * then use a synchronous lookup that cannot issue a query at all.
 *
 * An id that resolves to no user yields nothing rather than a placeholder
 * name — a deleted account must read as "actor unknown", not as a fabricated
 * person. Invalid ids are dropped before the query rather than throwing,
 * because a malformed id in a historical row must not take down the feed.
 */
export async function resolveActors(ids: readonly string[]): Promise<Map<string, StudioActor>> {
  const valid = [...new Set(ids.filter((id) => ObjectId.isValid(id)))];
  if (valid.length === 0) return new Map();

  const users = await (
    await collections.users()
  )
    .find({ _id: { $in: valid.map((id) => new ObjectId(id)) } })
    .toArray();

  return new Map(
    users.map((user) => [user._id.toString(), { id: user._id.toString(), name: user.name }]),
  );
}
