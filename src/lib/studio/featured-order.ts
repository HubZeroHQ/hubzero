/**
 * The Studio's editorial ordering algebra (v3.1 Milestone 2).
 *
 * Featured order is *editorial*: an author decides what leads the public site
 * and in what sequence. It is never derived from publication date, creation
 * date, reference ID, or any other proxy — those are facts about when
 * something happened, not statements about what matters.
 *
 * ## Why an ordered array is the model, not a stored position
 *
 * The obvious design stores a position per record and edits it in place.
 * That design has to *defend* its invariants: every insert, removal, and move
 * needs bespoke arithmetic, and every one of those is an opportunity to leave
 * a duplicate position or a hole behind — the `1, 3, 9, 14` state the brief
 * calls out.
 *
 * This module instead treats the featured set as one ordered list of ids, and
 * derives positions from array index at the moment of persistence. Canonical
 * numbering (`1..N`, dense, unique) is then not a rule that has to be enforced
 * after each mutation — it is the only state that can be expressed. There is
 * no code path that can produce a duplicate or a gap, because position is
 * never stored independently of order.
 *
 * Everything here is pure and DOM-free so the same functions run in the
 * reorder UI (optimistic local state) and in the server action (authoritative
 * write), rather than the two agreeing by convention.
 */

/** Positions are 1-based: the first featured entry reads as "1" to an editor, not "0". */
export const FIRST_FEATURED_POSITION = 1;

/**
 * Upper bound on how many entries one collection may feature at once. Not a
 * storage limit — a guard against a malformed or hostile payload asking the
 * server to renumber an unbounded list in one write.
 */
export const MAX_FEATURED_ENTRIES = 200;

export interface FeaturedOrderAssignment {
  id: string;
  featuredOrder: number;
}

/**
 * A stored position that this system could have written.
 *
 * Rejects the four cases the brief names — fractional, negative, `NaN`, and
 * (implicitly) zero — plus infinities, which `Number.isInteger` already
 * excludes. Used to validate what comes *back* from storage, since a record
 * predating this system, or one edited outside it, can hold anything.
 */
export function isValidFeaturedPosition(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= FIRST_FEATURED_POSITION;
}

/** `null` means "not featured" — the absence of an editorial decision, not position zero. */
export function isFeatured(featuredOrder: number | null | undefined): boolean {
  return featuredOrder !== null && featuredOrder !== undefined;
}

interface OrderableEntry {
  id: string;
  featuredOrder: number | null;
}

/**
 * The featured entries of a collection, in editorial order.
 *
 * This is the one place ordering is applied. Every consumer — Studio screens
 * and public surfaces alike — reads through here rather than sorting for
 * itself, so "lower number first" is stated once.
 *
 * Tolerates non-canonical stored state rather than trusting it: entries with
 * an invalid position are treated as unfeatured, and ties (which canonical
 * numbering makes impossible, but a partial write could still leave behind)
 * break on `id` so the result is deterministic instead of dependent on the
 * order the database happened to return rows in.
 */
export function selectFeatured<T extends OrderableEntry>(entries: readonly T[]): T[] {
  return entries
    .filter((entry) => isValidFeaturedPosition(entry.featuredOrder))
    .sort((left, right) => {
      const delta = (left.featuredOrder as number) - (right.featuredOrder as number);
      return delta !== 0 ? delta : left.id.localeCompare(right.id);
    });
}

/**
 * A collection in canonical editorial order (v3.1 Milestone 12).
 *
 * Featured entries first, in the order an editor chose, followed by everything
 * else in whatever order the caller already had them. This is the *single*
 * editorial ranking: a public collection page renders this list, and the
 * homepage takes the featured prefix of the very same ordering via
 * `selectFeatured`. There is deliberately no second entry point that could
 * rank the two surfaces differently.
 *
 * The remainder is left in its incoming order rather than re-sorted here. Each
 * collection already has a default order that means something — publication
 * date for Notes, reference ID elsewhere — and re-deciding it in this function
 * would be inventing a sorting rule rather than layering editorial intent on
 * top of the existing one. Callers sort first, then order editorially.
 */
export function orderEditorially<T extends OrderableEntry>(entries: readonly T[]): T[] {
  const featured = selectFeatured(entries);
  const featuredIds = new Set(featured.map((entry) => entry.id));
  return [...featured, ...entries.filter((entry) => !featuredIds.has(entry.id))];
}

/** Moves the item at `from` to `to`, shifting everything between. Out-of-range indices are a no-op. */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length ||
    !Number.isInteger(from) ||
    !Number.isInteger(to)
  ) {
    return [...items];
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved as T);
  return next;
}

/**
 * Moves an item by a relative offset — the Move Up / Move Down controls.
 * Clamps at the ends rather than wrapping: an editor pressing "Move Up" on the
 * first item expects nothing to happen, not for it to jump to last.
 */
export function moveItemBy<T>(items: readonly T[], index: number, delta: number): T[] {
  if (index < 0 || index >= items.length) {
    return [...items];
  }
  const target = Math.min(Math.max(index + delta, 0), items.length - 1);
  return moveItem(items, index, target);
}

/** Appends to the end of the featured list — a newly featured entry starts lowest-priority, never silently displacing an editor's existing choices. */
export function addFeaturedId(orderedIds: readonly string[], id: string): string[] {
  return orderedIds.includes(id) ? [...orderedIds] : [...orderedIds, id];
}

/** Removes an entry from the featured list. The remaining entries close ranks on persistence, leaving no hole. */
export function removeFeaturedId(orderedIds: readonly string[], id: string): string[] {
  return orderedIds.filter((entry) => entry !== id);
}

/**
 * Turns an ordered id list into the positions to store — the step that makes
 * canonical numbering structural rather than enforced.
 */
export function toOrderAssignments(orderedIds: readonly string[]): FeaturedOrderAssignment[] {
  return orderedIds.map((id, index) => ({ id, featuredOrder: index + FIRST_FEATURED_POSITION }));
}

export type FeaturedOrderPayloadError =
  'not-an-array' | 'too-many-entries' | 'duplicate-entry' | 'invalid-id';

/**
 * Validates an ordered id list arriving from the browser before anything is
 * written.
 *
 * Duplicates are rejected rather than de-duplicated: a payload containing the
 * same entry twice means the client and server disagree about the list, and
 * silently "fixing" it would persist an order the editor never saw.
 */
export function parseFeaturedOrderPayload(
  value: unknown,
): { ok: true; orderedIds: string[] } | { ok: false; error: FeaturedOrderPayloadError } {
  if (!Array.isArray(value)) {
    return { ok: false, error: 'not-an-array' };
  }
  if (value.length > MAX_FEATURED_ENTRIES) {
    return { ok: false, error: 'too-many-entries' };
  }

  const seen = new Set<string>();
  for (const entry of value) {
    if (typeof entry !== 'string' || entry.trim() === '') {
      return { ok: false, error: 'invalid-id' };
    }
    if (seen.has(entry)) {
      return { ok: false, error: 'duplicate-entry' };
    }
    seen.add(entry);
  }

  return { ok: true, orderedIds: value as string[] };
}

export const FEATURED_ORDER_ERROR_MESSAGE: Record<FeaturedOrderPayloadError, string> = {
  'not-an-array': 'The featured order could not be read. Reload the page and try again.',
  'too-many-entries': `A collection can feature at most ${MAX_FEATURED_ENTRIES} entries.`,
  'duplicate-entry': 'The same entry appeared twice in the featured order.',
  'invalid-id': 'The featured order contained an entry that could not be identified.',
};
