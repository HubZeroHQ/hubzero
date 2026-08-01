import type { EditorialEventPayload, EditorialEventType } from './schema';

/**
 * The one place a recorded event becomes human-readable (v3.1 Milestone 9).
 *
 * Both surfaces that render events — the per-entry history timeline and the
 * Studio-wide activity feed — read from here. The brief for the feed asks for
 * "no switch statements scattered through the UI", and this is how that is
 * kept true: there is exactly one switch over the payload union in the
 * codebase, and it is this function. A new event type is added to the schema
 * and to this mapping, and every surface renders it without being touched.
 *
 * Nothing here inspects entity state. A description is built only from what
 * the event itself recorded, which is the whole point of the log.
 */

/** Stable per-type identity, used for icons and grouping without re-switching. */
export type EventHistoryType =
  | 'created'
  | 'metadataSaved'
  | 'statusChanged'
  | 'featuredOrderChanged'
  | 'mediaChanged'
  | 'documentUpdated';

export interface EditorialEventDescription {
  type: EditorialEventType;
  historyType: EventHistoryType;
  /**
   * The generic verb phrase — what kind of thing happened. Shown by the
   * activity feed, which needs a stable label per row.
   */
  action: string;
  /**
   * The event's own metadata, already formatted ("Draft → In review"). Absent
   * for the two types that genuinely carry none: a creation and a metadata
   * save are fully described by the fact and its timestamp.
   *
   * The timeline renders `detail ?? action`, which is why each detail below
   * reads as a complete phrase on its own rather than as a fragment that only
   * makes sense beside the action.
   */
  detail?: string;
}

const STATUS_PHRASE: Record<string, string> = {
  draft: 'Draft',
  inReview: 'In review',
  approved: 'Approved',
  published: 'Published',
  archived: 'Archived',
};

function statusLabel(value: string): string {
  return STATUS_PHRASE[value] ?? value;
}

export function describeEditorialEvent(payload: EditorialEventPayload): EditorialEventDescription {
  switch (payload.type) {
    case 'entry.created':
      return { type: payload.type, historyType: 'created', action: 'Entry created' };

    case 'entry.updated':
      return { type: payload.type, historyType: 'metadataSaved', action: 'Metadata saved' };

    case 'entry.statusChanged': {
      const { from, to, reviewNote } = payload;
      const transition = `${statusLabel(from)} → ${statusLabel(to)}`;
      return {
        type: payload.type,
        historyType: 'statusChanged',
        action: 'Status changed',
        detail: reviewNote ? `${transition} — “${reviewNote}”` : transition,
      };
    }

    case 'entry.featuredOrderChanged': {
      const { from, to } = payload;
      return {
        type: payload.type,
        historyType: 'featuredOrderChanged',
        action: 'Featured order changed',
        detail:
          to === null
            ? 'Removed from featured'
            : from === null
              ? `Featured at position ${to}`
              : `Featured position ${from} → ${to}`,
      };
    }

    case 'entry.mediaChanged': {
      const { field, to } = payload;
      return {
        type: payload.type,
        historyType: 'mediaChanged',
        action: 'Media replaced',
        detail: to === null ? `${field} cleared` : `${field} changed`,
      };
    }

    case 'document.updated':
      return {
        type: payload.type,
        historyType: 'documentUpdated',
        action: 'Document updated',
        detail: `${payload.role} document updated`,
      };
  }
}
