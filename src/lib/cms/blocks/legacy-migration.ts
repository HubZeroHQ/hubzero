import { newBlockId } from "@/lib/cms/blocks/registry";
import type { Block } from "@/lib/cms/blocks/types";

/**
 * Pure transforms from the old fixed-field content model
 * (`problem`/`approach`/`result`, `description`, `body`, …) into the new
 * `Block[]` model — kept side-effect-free and DB-free so
 * `tests/blocks.test.ts` can exercise them directly, and so
 * `scripts/migrate-content-blocks.ts` is a thin runner around logic that's
 * actually tested, not a script that's only ever "tested" by running it
 * against production data.
 *
 * None of these invent content: every legacy field becomes exactly one
 * Markdown block (the closest block type to "an existing markdown string"),
 * optionally preceded by a Heading block when a collection's legacy shape
 * had more than one named field (Case Study's problem/approach/result,
 * Blueprint's description + customization notes) — purely so a reader of
 * the migrated document can still tell the sections apart, never a
 * restriction on how the author edits it going forward.
 */

function markdownBlock(markdown: string): Block {
  return { id: newBlockId(), type: "markdown", data: { markdown } };
}

function headingBlock(text: string): Block {
  return { id: newBlockId(), type: "heading", data: { level: 2, text } };
}

function markdownSection(heading: string, markdown: string | undefined | null): Block[] {
  if (!markdown || !markdown.trim()) return [];
  return [headingBlock(heading), markdownBlock(markdown)];
}

export function migrateCaseStudyContent(fields: {
  problem?: string | null;
  approach?: string | null;
  result?: string | null;
}): Block[] {
  return [
    ...markdownSection("The Brief", fields.problem),
    ...markdownSection("Approach", fields.approach),
    ...markdownSection("Result", fields.result),
  ];
}

export function migrateSingleFieldContent(text: string | undefined | null): Block[] {
  return text && text.trim() ? [markdownBlock(text)] : [];
}

export function migrateBlueprintContent(fields: {
  description?: string | null;
  customizationNotes?: string | null;
}): Block[] {
  return [
    ...migrateSingleFieldContent(fields.description),
    ...markdownSection("Customization Notes", fields.customizationNotes),
  ];
}

/**
 * Every migrated document also needs the new required `summary` card field
 * (Case Study, Labs Project, Blueprint — Build/Note already had an
 * equivalent field, see `ARCHITECTURE/20_CONTENT_BLOCKS.md` §3). Derives a
 * safe, non-empty default from the first non-empty line of the primary
 * legacy field rather than leaving it blank (blank would fail the new
 * required-field validation) — flagged in the migration script's own output
 * as auto-derived, since a human-written summary is always better than a
 * truncated first line.
 */
export function deriveSummary(sourceText: string | undefined | null, maxLength = 300): string {
  const firstLine = (sourceText ?? "")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  if (!firstLine) return "Summary needed — please edit.";
  return firstLine.length > maxLength
    ? `${firstLine.slice(0, maxLength - 1).trimEnd()}…`
    : firstLine;
}

/** A document only needs migrating once — re-running the script is always safe. */
export function needsContentMigration(doc: { content?: unknown }): boolean {
  return !Array.isArray(doc.content) || doc.content.length === 0;
}

/**
 * Backfills `contributors`/`featured` to their schema defaults (`[]`/`false`)
 * for a document written before either field existed. Mongoose schema
 * defaults only apply to documents created *after* a schema change — a
 * pre-existing document has neither key stored in MongoDB at all, and every
 * `.lean()` read (used by every public/studio read path in this codebase)
 * returns exactly what's stored, not a schema-defaulted value. Without this
 * backfill, `doc.contributors.map(...)` on a pre-existing document throws
 * rather than rendering emptily — this is why the migration script applies
 * it to *every* document in a collection, not just ones needing a content
 * migration.
 */
export function backfillCardFields(doc: { contributors?: unknown; featured?: unknown }): {
  contributors: unknown[];
  featured: boolean;
} {
  return {
    contributors: Array.isArray(doc.contributors) ? doc.contributors : [],
    featured: typeof doc.featured === "boolean" ? doc.featured : false,
  };
}
