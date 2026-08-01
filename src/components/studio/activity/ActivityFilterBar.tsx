import { EDITORIAL_EVENT_TYPES } from '@/lib/events/schema';
import { describeEditorialEvent } from '@/lib/events/describe';
import type { StudioActor } from '@/lib/studio/actors';
import { ACTIVITY_COLLECTIONS, type ActivityFilters } from '@/lib/studio/activity/types';
import { hasActiveFilters } from '@/lib/studio/activity/filters';
import type { EditorialEventPayload, EditorialEventType } from '@/lib/events/schema';

/**
 * The activity feed's filters (v3.1 Milestone 9).
 *
 * A plain `<form method="get">`, which is why this is a Server Component with
 * no client state at all. Submitting navigates, the server reads the query
 * string and filters in the database — so "filtering happens server-side" is
 * structural here rather than a rule someone has to remember. It also means
 * the filters work with JavaScript unavailable, and that any filtered view is
 * a shareable URL.
 *
 * Each control group is a `<fieldset>` with a `<legend>`, so a screen reader
 * announces "Collections" before the checkboxes rather than reading twelve
 * unrelated labels in a row.
 */
export function ActivityFilterBar({
  filters,
  actors,
}: {
  filters: ActivityFilters;
  /** Only people who actually appear in the log — see `distinctActorIds`. */
  actors: StudioActor[];
}) {
  const selectedCollections = new Set(filters.entityTypes ?? []);
  const selectedTypes = new Set<EditorialEventType>(filters.types ?? []);

  return (
    <form
      method="get"
      action="/studio/activity"
      className="border-border-default flex flex-col gap-4 rounded-[4px] border p-4"
    >
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex min-w-[16rem] flex-1 flex-col gap-1">
          <span className="text-text-secondary text-xs font-medium">
            Search by title, slug or reference ID
          </span>
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ''}
            placeholder="e.g. HZ-BP-701"
            className="border-border-default bg-surface-raised text-text-primary rounded-[3px] border px-2 py-1.5 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-text-secondary text-xs font-medium">From</span>
          <input
            type="date"
            name="from"
            defaultValue={toDayValue(filters.from)}
            className="border-border-default bg-surface-raised text-text-primary rounded-[3px] border px-2 py-1.5 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-text-secondary text-xs font-medium">To</span>
          <input
            type="date"
            name="to"
            defaultValue={toDayValue(filters.to)}
            className="border-border-default bg-surface-raised text-text-primary rounded-[3px] border px-2 py-1.5 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-text-secondary text-xs font-medium">Actor</span>
          <select
            name="actor"
            defaultValue={filters.actorUserId ?? ''}
            className="border-border-default bg-surface-raised text-text-primary rounded-[3px] border px-2 py-1.5 text-sm"
          >
            <option value="">Anyone</option>
            {actors.map((actor) => (
              <option key={actor.id} value={actor.id}>
                {actor.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-text-secondary text-xs font-medium">Collections</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {Object.entries(ACTIVITY_COLLECTIONS).map(([key, collection]) => (
            <label key={key} className="text-text-primary flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                name="collection"
                value={key}
                defaultChecked={selectedCollections.has(key as keyof typeof ACTIVITY_COLLECTIONS)}
              />
              {collection.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-text-secondary text-xs font-medium">Event types</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {EDITORIAL_EVENT_TYPES.map((type) => (
            <label key={type} className="text-text-primary flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                name="type"
                value={type}
                defaultChecked={selectedTypes.has(type)}
              />
              {eventTypeLabel(type)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="bg-accent-primary text-text-inverse rounded-[3px] px-3 py-1.5 text-sm font-medium"
        >
          Apply filters
        </button>
        {hasActiveFilters(filters) ? (
          <a href="/studio/activity" className="text-text-secondary text-sm underline">
            Clear filters
          </a>
        ) : null}
      </div>
    </form>
  );
}

/**
 * The label for an event type, taken from the same describer the rows use, so
 * a new event type gets a filter option and a row label from one edit.
 *
 * The describer works on payloads, and only the discriminant matters for the
 * generic action phrase — the placeholder fields below are never read.
 */
function eventTypeLabel(type: EditorialEventType): string {
  const placeholder = {
    'entry.created': { type },
    'entry.updated': { type },
    'entry.statusChanged': { type, from: 'draft', to: 'draft' },
    'entry.featuredOrderChanged': { type, from: null, to: null },
    'entry.mediaChanged': { type, field: '', from: null, to: null },
    'document.updated': { type, role: '' },
  }[type] as EditorialEventPayload;

  return describeEditorialEvent(placeholder).action;
}

function toDayValue(date: Date | undefined): string {
  if (!date) return '';
  const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString();
  return iso.slice(0, 10);
}
