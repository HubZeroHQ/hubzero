import type { ImmutablePublic, PublicEntitySummary } from './domain';

export interface LedgerEntry {
  entity: ImmutablePublic<PublicEntitySummary>;
  /** ISO date string used only for sorting/grouping — display reuses each entity's own fields via `PublicationMetadata`, never this value directly. */
  date: string;
}

export interface LedgerYear {
  year: string;
  entries: readonly LedgerEntry[];
}

/**
 * The one place that decides which entity types have a trustworthy,
 * deliberately-curated editorial date and which don't. Only Note
 * (`publicationDate`, always present — an explicit publish date) and Lab
 * (`lastMajorUpdate` when a human has curated one, falling back to
 * `startDate` — the same preference Homepage's own timeline already uses)
 * qualify.
 *
 * Work, Build, Blueprint, and Engineering Profile are excluded — not
 * because they're unpublished, but because none of them has an editorial
 * date field at all today, only the inherited Studio `createdAt`/
 * `updatedAt` workflow timestamps. Those aren't exposed on the public DTOs
 * and are deliberately not reached for here even though the raw values
 * exist: `updatedAt` bumps on any edit (a typo fix would misrepresent
 * itself as "activity"), and `createdAt` records when a Studio record was
 * entered, not when the underlying work happened — using either would be
 * exactly the invented/non-truthful chronology this phase was told to
 * avoid. See `ADR_PHASE_7_LEDGER.md` for the full reasoning and the
 * correction this implies for entities that want to join Ledger later.
 *
 * A future entity becomes eligible by adding one case here once it has a
 * real editorial date field on its public DTO — no other change required.
 */
function resolveLedgerDate(entity: ImmutablePublic<PublicEntitySummary>): string | undefined {
  switch (entity.type) {
    case 'note':
      return entity.publicationDate;
    case 'lab':
      return entity.lastMajorUpdate ?? entity.startDate;
    default:
      return undefined;
  }
}

/**
 * Builds the reverse-chronological Ledger from whatever public entity
 * summaries a caller has on hand — ineligible types (see
 * `resolveLedgerDate`) are silently excluded, not errored on, so a caller
 * can pass a mixed list without pre-filtering by type. No traversal, no
 * visibility resolution: `listSummaries` has already done that; this is
 * pure date derivation and sorting over data that's already public.
 */
export function buildLedger(
  entities: readonly ImmutablePublic<PublicEntitySummary>[],
): readonly LedgerEntry[] {
  return entities
    .flatMap((entity) => {
      const date = resolveLedgerDate(entity);
      return date ? [{ entity, date }] : [];
    })
    .sort((left, right) => {
      const byDate = new Date(right.date).getTime() - new Date(left.date).getTime();
      return byDate !== 0 ? byDate : left.entity.title.localeCompare(right.entity.title);
    });
}

/**
 * Groups an already-sorted Ledger into descending year sections — a pure
 * presentation grouping, not a second sort. Relies on `entries` already
 * being date-descending (as `buildLedger` returns), so entries for the
 * same year are always contiguous and years never need merging after the
 * fact.
 */
export function groupLedgerByYear(entries: readonly LedgerEntry[]): readonly LedgerYear[] {
  const grouped: { year: string; entries: LedgerEntry[] }[] = [];
  for (const entry of entries) {
    const year = String(new Date(entry.date).getFullYear());
    const current = grouped.at(-1);
    if (current?.year === year) {
      current.entries.push(entry);
    } else {
      grouped.push({ year, entries: [entry] });
    }
  }
  return grouped;
}
