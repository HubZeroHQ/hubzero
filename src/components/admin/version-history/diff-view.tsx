import { MediaThumbnail } from "@/components/admin/media/media-thumbnail";
import { Badge, Text } from "@/components/ui";
import type { BlockDiffEntry, FieldDiff, FieldDiffStatus, WordDiffPart } from "@/lib/cms/diff";
import type { ClientMedia } from "@/lib/cms/media";
import { cn } from "@/lib/utils";

export interface DiffViewProps {
  diffs: FieldDiff[];
  /** Every `Media` document any diff on this page references, keyed by id — resolved once, upstream, via `collectDiffMediaIds` + one batched `getMediaByIds` call (never per-row). */
  mediaMap: Record<string, ClientMedia>;
}

const badgeToneByStatus: Record<
  FieldDiffStatus,
  "success" | "danger" | "warning" | "default" | "info"
> = {
  added: "success",
  removed: "danger",
  changed: "warning",
  unchanged: "default",
};

const labelByStatus: Record<FieldDiffStatus, string> = {
  added: "Added",
  removed: "Removed",
  changed: "Changed",
  unchanged: "Unchanged",
};

/**
 * Manual-testing note (Phase D): the first collection with a structured
 * nested-object field surviving into a snapshot (`TeamMember.socials`)
 * rendered as `[object Object]` here before this fix — `Array.isArray`'s
 * `join()` only ever handled arrays of primitives (`techTags`, etc.); a
 * plain object, or an array of objects (`skills`/`experience`/`education`
 * once non-empty), fell through to the final `String(value)` branch. Fixed
 * generically rather than special-cased per field, since any future
 * collection's own nested/`json`-type field would hit the identical gap.
 */
function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    const isPrimitiveArray = value.every((item) => item === null || typeof item !== "object");
    return isPrimitiveArray ? value.join(", ") : JSON.stringify(value);
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * The one reusable diff renderer every collection's version-history screen
 * uses (`ARCHITECTURE/19_CMS_FOUNDATION.md` §9: "a generic diff renderer, no
 * collection-specific diff logic needed"). Collection-agnostic by
 * construction — it only ever sees `FieldDiff[]` (`lib/cms/diff.ts`), never a
 * document shape; which of the five rendering styles a field gets
 * (`kind: "simple" | "richtext" | "image" | "imageArray" | "blocks"`) comes
 * from that field's own `FieldConfig.type`, resolved once in `diffObjects`.
 * Unchanged fields are real, useful context (confirming "yes, everything else
 * stayed the same") but are the least interesting part of a diff, so they're
 * collapsed by default via a native `<details>` — no client-side state needed
 * for something this simple.
 */
export function DiffView({ diffs, mediaMap }: DiffViewProps) {
  const changed = diffs.filter((diff) => diff.status !== "unchanged");
  const unchanged = diffs.filter((diff) => diff.status === "unchanged");

  if (diffs.length === 0) {
    return (
      <Text tone="muted" size="caption">
        No fields to compare.
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {changed.length === 0 ? (
        <Text tone="muted" size="caption">
          No changes.
        </Text>
      ) : (
        changed.map((diff) => <DiffRow key={diff.key} diff={diff} mediaMap={mediaMap} />)
      )}

      {unchanged.length > 0 && (
        <details className="mt-1">
          <summary className="text-caption text-text-muted cursor-pointer select-none">
            Show {unchanged.length} unchanged field{unchanged.length === 1 ? "" : "s"}
          </summary>
          <div className="mt-2 flex flex-col gap-2">
            {unchanged.map((diff) => (
              <DiffRow key={diff.key} diff={diff} mediaMap={mediaMap} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function DiffRow({ diff, mediaMap }: { diff: FieldDiff; mediaMap: Record<string, ClientMedia> }) {
  return (
    <div className="border-border-muted bg-bg-light rounded-md border p-3">
      <div className="mb-1.5 flex items-center gap-2">
        <Text size="caption" weight="medium">
          {diff.label}
        </Text>
        <Badge tone={badgeToneByStatus[diff.status]}>{labelByStatus[diff.status]}</Badge>
      </div>

      {diff.kind === "blocks" ? (
        <BlockListDiff diff={diff} mediaMap={mediaMap} />
      ) : diff.kind === "image" ? (
        <ImageFieldDiff diff={diff} mediaMap={mediaMap} />
      ) : diff.kind === "imageArray" ? (
        <ImageArrayFieldDiff diff={diff} mediaMap={mediaMap} />
      ) : diff.kind === "richtext" && diff.status === "changed" ? (
        <RichTextFieldDiff diff={diff} />
      ) : (
        <SimpleFieldDiff diff={diff} />
      )}
    </div>
  );
}

function SimpleFieldDiff({ diff }: { diff: FieldDiff }) {
  if (diff.status === "unchanged") {
    return (
      <Text size="caption" tone="muted">
        {formatValue(diff.after)}
      </Text>
    );
  }
  if (diff.status === "added") {
    return (
      <Text size="caption" className="text-success">
        {formatValue(diff.after)}
      </Text>
    );
  }
  if (diff.status === "removed") {
    return (
      <Text size="caption" className="text-danger line-through">
        {formatValue(diff.before)}
      </Text>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
      <Text size="caption" className="text-danger line-through">
        {formatValue(diff.before)}
      </Text>
      <Text size="caption" className="text-success">
        {formatValue(diff.after)}
      </Text>
    </div>
  );
}

function RichTextFieldDiff({ diff }: { diff: FieldDiff }) {
  if (!diff.wordDiff) {
    // Too large to word-diff (`WORD_DIFF_MAX_TOKENS`) — same before/after
    // swap a plain field gets, rather than pretending there's no detail.
    return <SimpleFieldDiff diff={diff} />;
  }
  return <WordDiffText parts={diff.wordDiff} />;
}

function WordDiffText({ parts }: { parts: WordDiffPart[] }) {
  return (
    <p className="text-caption whitespace-pre-wrap">
      {parts.map((part, index) => (
        <span
          key={index}
          className={cn(
            part.op === "insert" && "text-success bg-success/10",
            part.op === "delete" && "text-danger bg-danger/10 line-through",
          )}
        >
          {part.text}
        </span>
      ))}
    </p>
  );
}

function ImageFieldDiff({
  diff,
  mediaMap,
}: {
  diff: FieldDiff;
  mediaMap: Record<string, ClientMedia>;
}) {
  const beforeId = typeof diff.before === "string" ? diff.before : undefined;
  const afterId = typeof diff.after === "string" ? diff.after : undefined;

  if (diff.status === "unchanged") {
    return afterId ? (
      <MediaThumbnail media={mediaMap[afterId] ?? null} className="h-20 w-20" />
    ) : (
      <Text size="caption" tone="muted">
        —
      </Text>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {beforeId && (
        <div className="flex flex-col items-start gap-1">
          <Text size="caption" className="text-danger">
            Before
          </Text>
          <MediaThumbnail media={mediaMap[beforeId] ?? null} className="h-20 w-20" />
        </div>
      )}
      {afterId && (
        <div className="flex flex-col items-start gap-1">
          <Text size="caption" className="text-success">
            After
          </Text>
          <MediaThumbnail media={mediaMap[afterId] ?? null} className="h-20 w-20" />
        </div>
      )}
      {!beforeId && !afterId && (
        <Text size="caption" tone="muted">
          —
        </Text>
      )}
    </div>
  );
}

function ImageArrayFieldDiff({
  diff,
  mediaMap,
}: {
  diff: FieldDiff;
  mediaMap: Record<string, ClientMedia>;
}) {
  const beforeIds = Array.isArray(diff.before)
    ? diff.before.filter((v) => typeof v === "string")
    : [];
  const afterIds = Array.isArray(diff.after) ? diff.after.filter((v) => typeof v === "string") : [];

  if (diff.status === "unchanged") {
    if (afterIds.length === 0) {
      return (
        <Text size="caption" tone="muted">
          —
        </Text>
      );
    }
    return (
      <div className="flex flex-wrap gap-2">
        {afterIds.map((id) => (
          <MediaThumbnail key={id} media={mediaMap[id] ?? null} className="h-16 w-16" />
        ))}
      </div>
    );
  }

  const beforeOnly = beforeIds.filter((id) => !afterIds.includes(id));
  const afterOnly = afterIds.filter((id) => !beforeIds.includes(id));
  const common = afterIds.filter((id) => beforeIds.includes(id));

  return (
    <div className="flex flex-col gap-2">
      {common.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {common.map((id) => (
            <MediaThumbnail key={id} media={mediaMap[id] ?? null} className="h-16 w-16" />
          ))}
        </div>
      )}
      {beforeOnly.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Text size="caption" className="text-danger">
            Removed:
          </Text>
          {beforeOnly.map((id) => (
            <MediaThumbnail
              key={id}
              media={mediaMap[id] ?? null}
              className="border-danger/40 h-16 w-16 opacity-60"
            />
          ))}
        </div>
      )}
      {afterOnly.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Text size="caption" className="text-success">
            Added:
          </Text>
          {afterOnly.map((id) => (
            <MediaThumbnail
              key={id}
              media={mediaMap[id] ?? null}
              className="border-success/40 h-16 w-16"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BlockListDiff({
  diff,
  mediaMap,
}: {
  diff: FieldDiff;
  mediaMap: Record<string, ClientMedia>;
}) {
  if (!diff.blocks || diff.blocks.length === 0) {
    return (
      <Text size="caption" tone="muted">
        No block-level changes.
      </Text>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {diff.blocks.map((block, index) => (
        <li key={block.id}>
          <BlockDiffRow block={block} position={index + 1} mediaMap={mediaMap} />
        </li>
      ))}
    </ol>
  );
}

function BlockDiffRow({
  block,
  position,
  mediaMap,
}: {
  block: BlockDiffEntry;
  position: number;
  mediaMap: Record<string, ClientMedia>;
}) {
  const mediaIds = (block: Record<string, unknown> | null): string[] => {
    const data = block?.data as Record<string, unknown> | undefined;
    if (!data) return [];
    if (typeof data.media === "string") return [data.media];
    if (Array.isArray(data.media))
      return data.media.filter((v): v is string => typeof v === "string");
    return [];
  };

  return (
    <div className="border-border-muted/60 bg-bg rounded border p-2">
      <div className="mb-1 flex flex-wrap items-center gap-1.5">
        <Text size="caption" tone="muted" className="font-mono">
          #{position}
        </Text>
        <Text size="caption" weight="medium">
          {block.typeLabel}
        </Text>
        <Badge tone={badgeToneByStatus[block.status]}>{labelByStatus[block.status]}</Badge>
        {block.moved && <Badge tone="info">Moved</Badge>}
      </div>

      {block.textDiff ? (
        // `textDiff` is computed for any status a block's primary text field
        // is present on — an "added"/"removed" block collapses to a single
        // insert/delete part, a "changed" one to a real word-level diff, so
        // one renderer covers all of them without an extra JSON dump.
        <WordDiffText parts={block.textDiff} />
      ) : block.type === "image" || block.type === "gallery" ? (
        <div className="flex flex-wrap items-center gap-3">
          {block.status !== "added" &&
            mediaIds(block.before).map((id) => (
              <MediaThumbnail
                key={`before-${id}`}
                media={mediaMap[id] ?? null}
                className="h-16 w-16"
              />
            ))}
          {block.status !== "removed" &&
            mediaIds(block.after).map((id) => (
              <MediaThumbnail
                key={`after-${id}`}
                media={mediaMap[id] ?? null}
                className="h-16 w-16"
              />
            ))}
        </div>
      ) : block.status === "removed" ? (
        <Text size="caption" className="text-danger line-through">
          {formatValue(block.before?.data)}
        </Text>
      ) : block.status === "added" ? (
        <Text size="caption" className="text-success">
          {formatValue(block.after?.data)}
        </Text>
      ) : block.status === "changed" ? (
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          <Text size="caption" className="text-danger line-through">
            {formatValue(block.before?.data)}
          </Text>
          <Text size="caption" className="text-success">
            {formatValue(block.after?.data)}
          </Text>
        </div>
      ) : (
        <Text size="caption" tone="muted">
          {formatValue(block.after?.data ?? block.before?.data)}
        </Text>
      )}
    </div>
  );
}
