import { EDITORIAL_EVENT_TYPES, eventEntityTypeFor } from '@/lib/events/schema';
import type { EditorialEventType, EventEntityType } from '@/lib/events/schema';
import type { ActivityFilters } from './types';

/**
 * URL ⇄ filter translation for `/studio/activity` (v3.1 Milestone 9).
 *
 * Filters live in the query string rather than in component state so a filtered
 * feed is linkable and survives a reload — and so the server, which is where
 * filtering happens, can read them without a round trip through the client.
 *
 * Pure and dependency-free on purpose: this is the part with the sharp edges
 * (unknown values, malformed dates, a `to` that must be inclusive), and it is
 * cheap to test exhaustively when it touches neither the database nor React.
 */

export type ActivitySearchParams = Record<string, string | string[] | undefined>;

const EVENT_TYPES: readonly string[] = EDITORIAL_EVENT_TYPES;

function values(raw: string | string[] | undefined): string[] {
  if (raw === undefined) return [];
  // Repeated params (`?collection=work&collection=note`) and the comma form
  // are both accepted — checkbox groups produce the first, hand-written and
  // shared links often the second.
  return (Array.isArray(raw) ? raw : [raw])
    .flatMap((value) => value.split(','))
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * Parses the query string into filters, **dropping anything unrecognised**.
 *
 * An unknown collection or event type is discarded rather than passed through:
 * a typo in a URL should show the unfiltered feed, not an empty one that looks
 * like "nothing has happened".
 */
export function parseActivityFilters(params: ActivitySearchParams): ActivityFilters {
  const entityTypes = values(params.collection)
    .map((value) => eventEntityTypeFor(value))
    .filter((value): value is EventEntityType => value !== null);

  const types = values(params.type).filter((value): value is EditorialEventType =>
    EVENT_TYPES.includes(value),
  );

  const actorUserId = typeof params.actor === 'string' ? params.actor.trim() : '';
  const q = typeof params.q === 'string' ? params.q.trim() : '';

  const from = parseDay(params.from, 'start');
  const to = parseDay(params.to, 'end');

  return {
    ...(entityTypes.length ? { entityTypes } : {}),
    ...(types.length ? { types } : {}),
    ...(actorUserId ? { actorUserId } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    ...(q ? { q } : {}),
  };
}

/**
 * `YYYY-MM-DD` to an instant.
 *
 * `to` resolves to the **end** of that day. An editor who asks for activity up
 * to the 3rd means through the 3rd; parsing it as midnight would silently
 * exclude everything that happened that day, which reads as data loss rather
 * than as a filter boundary.
 */
function parseDay(raw: string | string[] | undefined, edge: 'start' | 'end'): Date | undefined {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T${edge === 'start' ? '00:00:00.000' : '23:59:59.999'}`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Rebuilds a query string, omitting empty values so URLs stay readable. */
export function activityQueryString(params: ActivitySearchParams): string {
  const search = new URLSearchParams();
  for (const [key, raw] of Object.entries(params)) {
    for (const value of values(raw)) search.append(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

/** True when any filter is active — the UI uses this to offer "Clear filters". */
export function hasActiveFilters(filters: ActivityFilters): boolean {
  return Boolean(
    filters.entityTypes?.length ||
    filters.types?.length ||
    filters.actorUserId ||
    filters.from ||
    filters.to ||
    filters.q,
  );
}
