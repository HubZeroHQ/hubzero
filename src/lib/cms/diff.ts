import { collectBlockMediaIds } from "@/lib/cms/blocks/guard";
import { BLOCK_TYPE_META } from "@/lib/cms/blocks/registry";
import type { Block } from "@/lib/cms/blocks/types";
import type { FieldConfig } from "@/types/cms";

/**
 * The generic, collection-agnostic diff renderer's data half
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §9's "no collection-specific diff
 * logic needed, since every snapshot is already a plain object matching the
 * collection's schema shape"). No diffing library dependency — every value
 * here is already JSON-plain (see `serializeDocument`), so a field-by-field
 * shallow comparison, plus a small hand-rolled LCS for the two cases that
 * actually benefit from one (block order and prose wording), is the entire
 * mechanism a fixed, known field vocabulary (`types/cms.ts`'s `FieldConfig`)
 * ever needs. Which of those two extra passes applies to a field is read
 * directly off that field's own `FieldConfig.type` (`"blocks"` / `"richtext"`
 * / `"image"` / `"imageArray"`) — never a per-collection field-name list, so
 * a new collection's fields get the right diff treatment automatically the
 * moment its `formFields` declares the type.
 */

export type FieldDiffStatus = "added" | "removed" | "changed" | "unchanged";

export type FieldDiffKind = "simple" | "richtext" | "image" | "imageArray" | "blocks";

export interface FieldDiff {
  key: string;
  label: string;
  status: FieldDiffStatus;
  before: unknown;
  after: unknown;
  kind: FieldDiffKind;
  /** Present when `kind === "richtext"` and both sides tokenized within `WORD_DIFF_MAX_TOKENS` — `null` means "too large to word-diff, fall back to a plain before/after swap." */
  wordDiff?: WordDiffPart[] | null;
  /** Present when `kind === "blocks"`. */
  blocks?: BlockDiffEntry[];
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

function fieldKind(type: FieldConfig["type"]): FieldDiffKind {
  if (type === "blocks") return "blocks";
  if (type === "richtext") return "richtext";
  if (type === "image") return "image";
  if (type === "imageArray") return "imageArray";
  return "simple";
}

// ---------------------------------------------------------------------------
// Word-level diff — used for `richtext` fields and for a block's own primary
// text field, so a one-sentence edit reads as "this phrase changed," not
// "this entire paragraph was replaced."
// ---------------------------------------------------------------------------

export type WordDiffOp = "equal" | "insert" | "delete";

export interface WordDiffPart {
  op: WordDiffOp;
  text: string;
}

/** DP table is `tokens(before) x tokens(after)` cells — capped so a pasted-in
 * multi-thousand-word document can't blow up memory/time; that document still
 * gets a correct (just less granular) whole-field before/after diff. */
const WORD_DIFF_MAX_TOKENS = 800;

/** Splits on whitespace *runs*, keeping them as their own tokens, so re-joining every part's `text` reproduces the original spacing exactly. */
function tokenize(text: string): string[] {
  return text.split(/(\s+)/).filter((token) => token.length > 0);
}

export function diffWords(before: string, after: string): WordDiffPart[] | null {
  if (before === after) return [{ op: "equal", text: before }];

  const a = tokenize(before);
  const b = tokenize(after);
  if (a.length > WORD_DIFF_MAX_TOKENS || b.length > WORD_DIFF_MAX_TOKENS) return null;

  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] = a[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }

  const parts: WordDiffPart[] = [];
  const push = (op: WordDiffOp, text: string) => {
    const last = parts[parts.length - 1];
    if (last && last.op === op) last.text += text;
    else parts.push({ op, text });
  };

  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      push("equal", a[i]!);
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      push("delete", a[i]!);
      i++;
    } else {
      push("insert", b[j]!);
      j++;
    }
  }
  while (i < n) push("delete", a[i++]!);
  while (j < m) push("insert", b[j++]!);

  return parts;
}

// ---------------------------------------------------------------------------
// Block-array diff — matches by each block's own `id` (never by array index
// or by content equality), so reordering a block reads as "moved," not as
// "removed, then a different-but-coincidentally-similar block added."
// ---------------------------------------------------------------------------

export interface BlockDiffEntry {
  id: string;
  status: FieldDiffStatus;
  /** Independent of `status` — a block can be both `moved` and `changed` at once. */
  moved: boolean;
  type: string;
  typeLabel: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  /** The block's own primary text field (`text`/`markdown`/`html`/`code`), word-diffed the same way a `richtext` field is — `undefined` when this block type carries no single text field (`image`, `metrics`, …). */
  textDiff?: WordDiffPart[] | null;
  /** Media ids this block references, on either side — for the caller to resolve into thumbnails via one batched `getMediaByIds` call rather than per-block lookups. */
  mediaIds: string[];
}

function isBlockArray(value: unknown): value is Record<string, unknown>[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        typeof (item as Record<string, unknown>).id === "string" &&
        typeof (item as Record<string, unknown>).type === "string",
    )
  );
}

function blockText(data: unknown): string | undefined {
  if (data === null || typeof data !== "object") return undefined;
  const v = data as Record<string, unknown>;
  if (typeof v.text === "string") return v.text;
  if (typeof v.markdown === "string") return v.markdown;
  if (typeof v.html === "string") return v.html;
  if (typeof v.code === "string") return v.code;
  return undefined;
}

function blockMediaIds(block: Record<string, unknown>): string[] {
  return collectBlockMediaIds([block as unknown as Block]);
}

type IdOp =
  | { op: "keep"; id: string; beforeIndex: number; afterIndex: number }
  | { op: "delete"; id: string; beforeIndex: number }
  | { op: "insert"; id: string; afterIndex: number };

/** Standard LCS-backed sequence diff, applied to the blocks' `id`s rather than to lines of text — the same algorithm a text differ uses, one level up. */
function diffIdSequence(before: string[], after: string[]): IdOp[] {
  const n = before.length;
  const m = after.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] =
        before[i] === after[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }

  const ops: IdOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (before[i] === after[j]) {
      ops.push({ op: "keep", id: before[i]!, beforeIndex: i, afterIndex: j });
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      ops.push({ op: "delete", id: before[i]!, beforeIndex: i });
      i++;
    } else {
      ops.push({ op: "insert", id: after[j]!, afterIndex: j });
      j++;
    }
  }
  while (i < n) ops.push({ op: "delete", id: before[i]!, beforeIndex: i++ });
  while (j < m) ops.push({ op: "insert", id: after[j]!, afterIndex: j++ });

  return ops;
}

function diffBlocks(
  before: Record<string, unknown>[] | null,
  after: Record<string, unknown>[],
): BlockDiffEntry[] {
  const beforeBlocks = before ?? [];
  const beforeById = new Map(beforeBlocks.map((block) => [block.id as string, block]));
  const afterById = new Map(after.map((block) => [block.id as string, block]));

  const ops = diffIdSequence(
    beforeBlocks.map((block) => block.id as string),
    after.map((block) => block.id as string),
  );

  // An id that appears as both a `delete` and an `insert` didn't disappear —
  // the array's own LCS-based ordering just couldn't keep it in place, which
  // is exactly what "this block moved" means. Reattaching that pair into one
  // entry is what turns "removed + added" into "moved."
  const deletedIds = new Set(ops.filter((op) => op.op === "delete").map((op) => op.id));
  const insertedIds = new Set(ops.filter((op) => op.op === "insert").map((op) => op.id));
  const movedIds = new Set([...deletedIds].filter((id) => insertedIds.has(id)));

  const entries: BlockDiffEntry[] = [];
  const seenMoved = new Set<string>();

  for (const op of ops) {
    if (op.op === "delete" && movedIds.has(op.id)) continue; // emitted at its `insert` position instead
    if (op.op === "insert" && movedIds.has(op.id)) {
      if (seenMoved.has(op.id)) continue;
      seenMoved.add(op.id);
    }

    const block = op.op === "delete" ? beforeById.get(op.id)! : afterById.get(op.id)!;
    const beforeBlock = beforeById.get(op.id) ?? null;
    const afterBlock = afterById.get(op.id) ?? null;
    const moved = movedIds.has(op.id);

    let status: FieldDiffStatus;
    if (op.op === "delete") status = "removed";
    else if (op.op === "insert" && !moved) status = "added";
    else if (moved && !beforeBlock)
      status = "added"; // defensive — shouldn't happen given movedIds construction
    else if (beforeBlock && afterBlock && !valuesEqual(beforeBlock.data, afterBlock.data)) {
      status = "changed";
    } else {
      status = "unchanged";
    }

    const type = (block.type as string) ?? "unknown";
    const beforeText = beforeBlock ? blockText(beforeBlock.data) : undefined;
    const afterText = afterBlock ? blockText(afterBlock.data) : undefined;
    const textDiff =
      beforeText !== undefined || afterText !== undefined
        ? diffWords(beforeText ?? "", afterText ?? "")
        : undefined;

    entries.push({
      id: op.id,
      status,
      moved,
      type,
      typeLabel: BLOCK_TYPE_META[type as keyof typeof BLOCK_TYPE_META]?.label ?? type,
      before: beforeBlock,
      after: afterBlock,
      textDiff,
      mediaIds: [
        ...(beforeBlock ? blockMediaIds(beforeBlock) : []),
        ...(afterBlock ? blockMediaIds(afterBlock) : []),
      ],
    });
  }

  return entries;
}

/**
 * Diffs one document's "before" state (an older snapshot, or `null` for "this
 * field didn't exist yet") against an "after" state (a newer snapshot, or the
 * live document) — used both for "this version vs. the previous one" and
 * "the live document vs. its last published version" (§9's "a diff view
 * comparing two snapshots, or a snapshot against the current live document").
 * `formFields` is the collection's own `formFields` (`ClientDocument`-shaped
 * keys → label + field type) so the diff both reads with the same field names
 * an editor already knows from the edit form, and renders each field with the
 * comparison that type actually needs — passed in rather than looked up,
 * keeping this module collection-agnostic.
 */
export function diffObjects(
  before: Record<string, unknown> | null,
  after: Record<string, unknown>,
  formFields: FieldConfig[] = [],
): FieldDiff[] {
  const keys = new Set<string>([...(before ? Object.keys(before) : []), ...Object.keys(after)]);
  const fieldConfigByName = new Map(formFields.map((field) => [field.name, field]));

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

    const fieldConfig = fieldConfigByName.get(key);
    const kind = fieldConfig ? fieldKind(fieldConfig.type) : "simple";

    const diff: FieldDiff = {
      key,
      label: fieldConfig?.label ?? key,
      status,
      before: beforeValue,
      after: afterValue,
      kind,
    };

    if (kind === "richtext" && status === "changed") {
      diff.wordDiff = diffWords(
        typeof beforeValue === "string" ? beforeValue : "",
        typeof afterValue === "string" ? afterValue : "",
      );
    }

    if (kind === "blocks" && status !== "unchanged") {
      const beforeBlocks = isBlockArray(beforeValue) ? beforeValue : before ? [] : null;
      const afterBlocks = isBlockArray(afterValue) ? afterValue : [];
      diff.blocks = diffBlocks(beforeBlocks, afterBlocks);
    }

    diffs.push(diff);
  }

  return diffs.sort((a, b) => a.label.localeCompare(b.label));
}

/** Every media id a set of diffs references, on either side — for one batched `getMediaByIds` call instead of a resolve-per-row waterfall. */
export function collectDiffMediaIds(diffs: FieldDiff[]): string[] {
  const ids: string[] = [];
  for (const diff of diffs) {
    if (diff.kind === "image") {
      if (typeof diff.before === "string") ids.push(diff.before);
      if (typeof diff.after === "string") ids.push(diff.after);
    } else if (diff.kind === "imageArray") {
      if (Array.isArray(diff.before)) ids.push(...diff.before.filter((v) => typeof v === "string"));
      if (Array.isArray(diff.after)) ids.push(...diff.after.filter((v) => typeof v === "string"));
    } else if (diff.blocks) {
      for (const block of diff.blocks) ids.push(...block.mediaIds);
    }
  }
  return [...new Set(ids)];
}
