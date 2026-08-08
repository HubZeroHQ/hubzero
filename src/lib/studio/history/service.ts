import 'server-only';

import { ObjectId } from 'mongodb';
import { documentRepository } from '@/lib/db/repositories/document';
import { documentVersionRepository } from '@/lib/db/repositories/document-version';
import type { OwnerType } from '@/lib/documents/schema';
import { editorialEventRepository } from '@/lib/events/repository';
import { OWNER_TO_PUBLIC_TYPE } from '@/lib/public/repository';
import { resolveActors } from '@/lib/studio/actors';
import { eventEntityTypeFor } from '@/lib/events/schema';
import {
  buildEntryHistory,
  fromRecordedEvents,
  sortHistory,
  type HistoryEvent,
  type RecordedEvent,
} from './events';

/**
 * Loads one entry's timeline (v3.1 Milestone 7).
 *
 * ## Query shape — one pass, batched actors
 *
 * Documents for the entry are fetched, their snapshots fetched in parallel,
 * and then **every actor referenced anywhere in the timeline is resolved in a
 * single `$in` query**. The naive version looks up a user per event, which on
 * an actively edited document is one query per snapshot — exactly the N+1 the
 * brief calls out. Actor resolution is therefore a two-step batch: collect
 * every distinct id first, fetch once, then hand the derivation a synchronous
 * lookup that cannot issue a query at all.
 *
 * An id that resolves to no user yields `undefined` rather than a placeholder
 * name: a deleted account should read as "actor unknown" in the UI, not as a
 * fabricated person.
 */
export async function loadEntryHistory(input: {
  ownerType: OwnerType;
  entryId: string;
  entry: { createdAt: Date; updatedAt: Date; createdByUserId?: { toString(): string } };
}): Promise<HistoryEvent[]> {
  const { ownerType, entryId, entry } = input;

  // Recorded events are the authority where they exist (v3.1 Milestone 8).
  // Derived events remain as a fallback for records that predate the log —
  // without it, every entry created before this milestone would show an empty
  // history, which would read as "nothing happened" rather than "not recorded".
  const publicType = OWNER_TO_PUBLIC_TYPE[ownerType];
  const entityType = publicType ? eventEntityTypeFor(publicType) : null;
  const recorded = entityType
    ? await editorialEventRepository.listForEntry(entityType, entryId).catch(() => [])
    : [];

  const documents = await documentRepository.findByOwner(ownerType, entryId).catch(() => []);
  const versionLists = await Promise.all(
    documents.map((document) => documentVersionRepository.listForDocument(document._id.toString())),
  );
  const versions = versionLists.flat();

  const creatorId = entry.createdByUserId?.toString();
  const actorIds = [
    ...new Set(
      [
        creatorId,
        ...versions.map((version) => version.createdByUserId?.toString()),
        ...recorded.map((event) => event.actorUserId?.toString()),
      ].filter((id): id is string => typeof id === 'string' && ObjectId.isValid(id)),
    ),
  ];

  const actors = await resolveActors(actorIds);

  const resolve = (userId: string | undefined) => (userId ? actors.get(userId) : undefined);

  if (recorded.length > 0) {
    // The log covers this entry, so nothing is inferred: creation, saves,
    // transitions, featuring and document edits all come from recorded facts.
    return sortHistory(
      fromRecordedEvents(
        recorded.map((event) => ({
          id: event._id.toString(),
          at: event.createdAt,
          ...(event.actorUserId ? { actorUserId: event.actorUserId.toString() } : {}),
          payload: event.payload as RecordedEvent['payload'],
        })),
        resolve,
      ),
    );
  }

  return buildEntryHistory({
    entry: {
      id: entryId,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      ...(creatorId ? { createdByUserId: creatorId } : {}),
    },
    documentVersions: versions.map((version) => ({
      id: version._id.toString(),
      role: version.role,
      createdAt: version.createdAt,
      ...(version.createdByUserId ? { createdByUserId: version.createdByUserId.toString() } : {}),
    })),
    resolveActor: resolve,
  });
}
