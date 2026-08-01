import type { EventHistoryType } from '@/lib/events/describe';
import type { EditorialEventCursor } from '@/lib/events/repository';
import type { EditorialEventType, EventEntityType } from '@/lib/events/schema';
import type { SearchEntityType } from '@/lib/search/types';
import type { StudioActor } from '@/lib/studio/actors';

/**
 * The Studio-wide activity feed (v3.1 Milestone 9).
 *
 * Every field below comes from a recorded editorial event or from resolving
 * the entry that event named. Nothing is derived from current entity state:
 * if the log does not record it, the feed does not claim it.
 */

/**
 * The collections an event can be about, with the label the UI shows and the
 * search type they are resolved through.
 *
 * Typed as a total `Record<EventEntityType, …>`, so adding an entity type to
 * the event schema fails to compile until it is given a label here — the feed
 * cannot silently render a new collection as "unknown".
 */
export const ACTIVITY_COLLECTIONS: Record<
  EventEntityType,
  { label: string; searchType: SearchEntityType }
> = {
  work: { label: 'Work', searchType: 'work' },
  build: { label: 'Builds', searchType: 'builds' },
  blueprint: { label: 'Blueprints', searchType: 'blueprints' },
  lab: { label: 'Labs', searchType: 'labs' },
  note: { label: 'Notes', searchType: 'notes' },
  career: { label: 'Careers', searchType: 'careers' },
  service: { label: 'Services', searchType: 'services' },
  teamMember: { label: 'Team', searchType: 'team' },
  engineeringProfile: { label: 'Engineering profiles', searchType: 'engineeringProfiles' },
};

/** The entry an event was about, as far as it can still be resolved. */
export type ActivityEntry =
  | { exists: true; id: string; title: string; href: string; collectionLabel: string }
  /**
   * The entry has been deleted since the event was recorded. The event is
   * still a fact and still shown — deleting an entry does not un-happen its
   * history — but the row says so instead of linking nowhere.
   */
  | { exists: false; id: string; collectionLabel: string };

export interface ActivityItem {
  id: string;
  at: Date;
  /** Absent for a system write or a deleted account — never a placeholder name. */
  actor?: StudioActor;
  eventType: EditorialEventType;
  historyType: EventHistoryType;
  /** Generic verb phrase: "Status changed". */
  action: string;
  /** The event's own metadata: "Draft → In review". Absent where it has none. */
  detail?: string;
  entityType: EventEntityType;
  entry: ActivityEntry;
}

export interface ActivityFilters {
  entityTypes?: readonly EventEntityType[];
  types?: readonly EditorialEventType[];
  actorUserId?: string;
  from?: Date;
  to?: Date;
  /** Free text, matched against entry title / slug / reference ID. */
  q?: string;
}

export interface ActivityPage {
  items: ActivityItem[];
  nextCursor: EditorialEventCursor | null;
}
