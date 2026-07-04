/**
 * The generic, collection-agnostic diff renderer's data half
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §9's "no collection-specific diff
 * logic needed, since every snapshot is already a plain object matching the
 * collection's schema shape"). No diffing library dependency — every value
 * here is already JSON-plain (see `serializeDocument`), so a field-by-field
 * shallow comparison plus a stable-stringify fallback for nested
 * arrays/objects is the entire mechanism a fixed, known field vocabulary
 * (`types/cms.ts`'s `FieldConfig`) ever needs. Deliberately not a generic
 * deep-diff (line-level text diff, LCS array diff, etc.) — "simple, readable,
 * do not overengineer it" (§9) — a field either changed or it didn't; how it
 * changed is for the reader to see in the before/after values themselves.
 */

export type FieldDiffStatus = "added" | "removed" | "changed" | "unchanged";

export interface FieldDiff {
  key: string;
  label: string;
  status: FieldDiffStatus;
  before: unknown;
  after: unknown;
}

/** Present on every snapshot/live document but not meaningful to show as an "edited field." */
const MANAGED_FIELDS = new Set([
  "_id",
  "__v",
  "status",
  "version",
  "publishedAt",
  "createdAt",
  "updatedAt",
  "createdBy",
]);

/** Deterministic regardless of key insertion order, so two objects with the same content always stringify identically. */
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a < b ? -1 : a > b ? 1 : 0,
    );
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function valuesEqual(a: unknown, b: unknown): boolean {
  return stableStringify(a) === stableStringify(b);
}

/**
 * Diffs one document's "before" state (an older snapshot, or `null` for "this
 * field didn't exist yet") against an "after" state (a newer snapshot, or the
 * live document) — used both for "this version vs. the previous one" and
 * "the live document vs. its last published version" (§9's "a diff view
 * comparing two snapshots, or a snapshot against the current live document").
 * `fieldLabels` is the collection's own `formFields` labels
 * (`ClientDocument`-shaped keys → human copy) so the diff reads with the same
 * field names an editor already knows from the edit form, not raw schema
 * keys — passed in rather than looked up, keeping this module collection-
 * agnostic.
 */
export function diffObjects(
  before: Record<string, unknown> | null,
  after: Record<string, unknown>,
  fieldLabels: Record<string, string> = {},
): FieldDiff[] {
  const keys = new Set<string>([...(before ? Object.keys(before) : []), ...Object.keys(after)]);

  const diffs: FieldDiff[] = [];
  for (const key of keys) {
    if (MANAGED_FIELDS.has(key)) continue;

    const beforeValue = before ? before[key] : undefined;
    const afterValue = after[key];
    const hadBefore = before !== null && key in before;
    const hasAfter = key in after && afterValue !== undefined;

    let status: FieldDiffStatus;
    if (!hadBefore && hasAfter) status = "added";
    else if (hadBefore && !hasAfter) status = "removed";
    else if (valuesEqual(beforeValue, afterValue)) status = "unchanged";
    else status = "changed";

    diffs.push({
      key,
      label: fieldLabels[key] ?? key,
      status,
      before: beforeValue,
      after: afterValue,
    });
  }

  return diffs.sort((a, b) => a.label.localeCompare(b.label));
}
