/**
 * The entry→option mapper every collection's relation-picker loader needs
 * (`getWorkRelationOptions`, `getBuildRelationOptions`, etc.) — previously
 * re-copied by hand into 7 separate `*-relations.ts` files, with only
 * `engineering-profile-relations.ts` bothering to extract it locally.
 */
export function toRelationOptions<T extends { _id: { toString(): string }; referenceId: string }>(
  entries: T[],
  label: (entry: T) => string,
): { id: string; label: string; referenceId: string }[] {
  return entries.map((entry) => ({
    id: entry._id.toString(),
    label: label(entry),
    referenceId: entry.referenceId,
  }));
}

/** Same shape, for taxonomy-style entries (technologies, categories) that carry no `referenceId`. */
export function toPlainOptions<T extends { _id: { toString(): string }; label: string }>(
  entries: T[],
): { id: string; label: string }[] {
  return entries.map((entry) => ({ id: entry._id.toString(), label: entry.label }));
}
