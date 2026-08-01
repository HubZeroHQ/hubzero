/**
 * Entry history (v3.1 Milestone 7) — an editorial activity timeline derived
 * from what Studio actually records.
 *
 * ## What Studio records, and what it does not
 *
 * This module was written after auditing the data model for an event log.
 * There isn't one. What exists is:
 *
 * - `createdAt` + `createdByUserId` on every entry — a real creation event
 *   with a real actor.
 * - `updatedAt` on every entry — the time of the *most recent* save, with no
 *   actor and no history of earlier ones.
 * - `documentVersions` — genuine snapshots taken before each document
 *   overwrite, each with a timestamp and (usually) an actor. This is the only
 *   real *series* of events in the system.
 *
 * Everything else the brief lists — submitted for review, approved, rejected,
 * published, unpublished, archived, restored, featured order changed, media
 * replaced — leaves **no trace**. `status` holds the current state with no
 * transition log; `reviewNote` holds the latest rejection reason with no
 * timestamp or actor. Reconstructing those events would mean inferring them
 * from present-day state and inventing times and people, which is exactly
 * what the brief forbids and what would make this timeline untrustworthy the
 * first time someone relied on it.
 *
 * So this builds the timeline from the three real sources and says plainly,
 * in the UI, that workflow transitions are not yet recorded. The event model
 * and adapter shape below already accommodate them: when Studio starts
 * writing transition records, they become a new adapter, not a redesign.
 */

import { describeEditorialEvent } from '@/lib/events/describe';
import type { EditorialEventPayload } from '@/lib/events/schema';

export type HistoryEventType =
  | 'created'
  | 'metadataSaved'
  | 'documentUpdated'
  | 'documentCreated'
  | 'statusChanged'
  | 'featuredOrderChanged'
  | 'mediaChanged';

export interface HistoryActor {
  id: string;
  name: string;
}

export interface HistoryEvent {
  /** Stable across loads for the same underlying fact. */
  id: string;
  type: HistoryEventType;
  at: Date;
  /** Absent when the record carries no actor — never guessed. */
  actor?: HistoryActor;
  /** One line, past tense, naming what happened. */
  description: string;
  /** Optional destination for the thing the event refers to. */
  href?: string;
}

export const HISTORY_EVENT_LABEL: Record<HistoryEventType, string> = {
  created: 'Created',
  metadataSaved: 'Metadata saved',
  documentCreated: 'Document started',
  documentUpdated: 'Document updated',
  statusChanged: 'Workflow',
  featuredOrderChanged: 'Featured',
  mediaChanged: 'Media',
};

/**
 * Newest first, with a deterministic tiebreak.
 *
 * Identical timestamps are common rather than exotic here: a record's
 * `createdAt` and `updatedAt` are the same instant until the first edit, and
 * throttled version snapshots can land in the same millisecond. Falling back
 * to event id keeps the order stable across reloads instead of leaving it to
 * whichever query resolved first.
 */
export function sortHistory(events: readonly HistoryEvent[]): HistoryEvent[] {
  return [...events].sort((left, right) => {
    const byTime = right.at.getTime() - left.at.getTime();
    return byTime !== 0 ? byTime : left.id.localeCompare(right.id);
  });
}

export type HistoryBucket = 'today' | 'yesterday' | 'lastWeek' | 'earlier';

export const HISTORY_BUCKET_LABEL: Record<HistoryBucket, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  lastWeek: 'Last week',
  earlier: 'Earlier',
};

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Buckets by calendar day rather than by elapsed hours — "yesterday" means the
 * previous date, not 24-to-48 hours ago, which is what an editor means by it.
 */
export function bucketFor(at: Date, now: Date): HistoryBucket {
  const days = Math.round((startOfDay(now) - startOfDay(at)) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days <= 7) return 'lastWeek';
  return 'earlier';
}

export interface HistoryGroup {
  bucket: HistoryBucket;
  events: HistoryEvent[];
}

/** Groups an already-sorted list, preserving order and omitting empty buckets. */
export function groupHistory(events: readonly HistoryEvent[], now: Date): HistoryGroup[] {
  const sorted = sortHistory(events);
  return (['today', 'yesterday', 'lastWeek', 'earlier'] as const)
    .map((bucket) => ({
      bucket,
      events: sorted.filter((event) => bucketFor(event.at, now) === bucket),
    }))
    .filter((group) => group.events.length > 0);
}

// ---------------------------------------------------------------------------
// Derivation
// ---------------------------------------------------------------------------

export interface HistorySourceEntry {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdByUserId?: string;
}

export interface HistorySourceDocumentVersion {
  id: string;
  role: string;
  createdAt: Date;
  createdByUserId?: string;
}

/**
 * Builds the timeline from an entry and its document snapshots.
 *
 * `metadataSaved` is emitted only when `updatedAt` is meaningfully later than
 * `createdAt`: on a record that has never been edited the two are the same
 * instant, and reporting a "saved" event there would describe the creation
 * twice. It carries no actor because none is stored — showing the creator
 * would be a guess, and a wrong name is worse than an absent one.
 *
 * Each version snapshot captures the state *before* an overwrite, so the
 * oldest snapshot marks when the document first had content and the rest mark
 * subsequent edits.
 */
export function buildEntryHistory(input: {
  entry: HistorySourceEntry;
  documentVersions?: readonly HistorySourceDocumentVersion[];
  resolveActor: (userId: string | undefined) => HistoryActor | undefined;
}): HistoryEvent[] {
  const { entry, documentVersions = [], resolveActor } = input;
  const events: HistoryEvent[] = [];

  const creator = resolveActor(entry.createdByUserId);
  events.push({
    id: `created:${entry.id}`,
    type: 'created',
    at: entry.createdAt,
    ...(creator ? { actor: creator } : {}),
    description: 'Entry created',
  });

  // One second of tolerance: creation writes `createdAt` and `updatedAt` in
  // the same operation but not always the same millisecond.
  if (entry.updatedAt.getTime() - entry.createdAt.getTime() > 1000) {
    events.push({
      id: `saved:${entry.id}`,
      type: 'metadataSaved',
      at: entry.updatedAt,
      description: 'Metadata last saved',
    });
  }

  const ordered = [...documentVersions].sort(
    (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
  );
  ordered.forEach((version, index) => {
    const actor = resolveActor(version.createdByUserId);
    events.push({
      id: `document:${version.id}`,
      type: index === 0 ? 'documentCreated' : 'documentUpdated',
      at: version.createdAt,
      ...(actor ? { actor } : {}),
      description:
        index === 0 ? `${version.role} document started` : `${version.role} document updated`,
    });
  });

  return sortHistory(events);
}

// ---------------------------------------------------------------------------
// Recorded events (v3.1 Milestone 8)
// ---------------------------------------------------------------------------

export interface RecordedEvent {
  id: string;
  at: Date;
  actorUserId?: string;
  payload:
    | { type: 'entry.created' }
    | { type: 'entry.updated' }
    | { type: 'entry.statusChanged'; from: string; to: string; reviewNote?: string }
    | { type: 'entry.featuredOrderChanged'; from: number | null; to: number | null }
    | { type: 'entry.mediaChanged'; field: string; from: string | null; to: string | null }
    | { type: 'document.updated'; role: string; versionId?: string };
}

/**
 * Turns recorded events into timeline events.
 *
 * These are read straight from the log rather than derived from present-day
 * state — the distinction Milestone 7 could not make. A status change reports
 * the transition it actually recorded, including the reviewer's note, instead
 * of being reconstructed from whatever `status` happens to say now.
 *
 * The payload-to-prose mapping itself lives in `lib/events/describe.ts`, which
 * the Studio-wide activity feed also reads (v3.1 Milestone 9). A new event type
 * therefore appears in both surfaces by extending that one function.
 */
export function fromRecordedEvents(
  events: readonly RecordedEvent[],
  resolveActor: (userId: string | undefined) => HistoryActor | undefined,
): HistoryEvent[] {
  return events.map((event) => {
    const actor = resolveActor(event.actorUserId);
    const described = describeEditorialEvent(event.payload as EditorialEventPayload);

    return {
      id: `event:${event.id}`,
      at: event.at,
      ...(actor ? { actor } : {}),
      type: described.historyType,
      // The timeline shows the event's own metadata where it has any, and the
      // generic phrase only where it genuinely has none.
      description: described.detail ?? described.action,
    };
  });
}
