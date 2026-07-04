import { Badge, Text } from "@/components/ui";
import type { FieldDiff, FieldDiffStatus } from "@/lib/cms/diff";

export interface DiffViewProps {
  diffs: FieldDiff[];
}

const badgeToneByStatus: Record<FieldDiffStatus, "success" | "danger" | "warning" | "default"> = {
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

function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

/**
 * The one reusable diff renderer every collection's version-history screen
 * uses (`ARCHITECTURE/19_CMS_FOUNDATION.md` §9: "a generic JSON-diff
 * renderer, no collection-specific diff logic needed"). Collection-agnostic
 * by construction — it only ever sees `FieldDiff[]` (`lib/cms/diff.ts`), never
 * a document shape. Unchanged fields are real, useful context (confirming
 * "yes, everything else stayed the same") but are the least interesting part
 * of a diff, so they're collapsed by default via a native `<details>` — no
 * client-side state needed for something this simple.
 */
export function DiffView({ diffs }: DiffViewProps) {
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
        changed.map((diff) => <DiffRow key={diff.key} diff={diff} />)
      )}

      {unchanged.length > 0 && (
        <details className="mt-1">
          <summary className="text-caption text-text-muted cursor-pointer select-none">
            Show {unchanged.length} unchanged field{unchanged.length === 1 ? "" : "s"}
          </summary>
          <div className="mt-2 flex flex-col gap-2">
            {unchanged.map((diff) => (
              <DiffRow key={diff.key} diff={diff} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function DiffRow({ diff }: { diff: FieldDiff }) {
  return (
    <div className="border-border-muted bg-bg-light rounded-md border p-3">
      <div className="mb-1.5 flex items-center gap-2">
        <Text size="caption" weight="medium">
          {diff.label}
        </Text>
        <Badge tone={badgeToneByStatus[diff.status]}>{labelByStatus[diff.status]}</Badge>
      </div>

      {diff.status === "unchanged" && (
        <Text size="caption" tone="muted">
          {formatValue(diff.after)}
        </Text>
      )}
      {diff.status === "added" && (
        <Text size="caption" className="text-success">
          {formatValue(diff.after)}
        </Text>
      )}
      {diff.status === "removed" && (
        <Text size="caption" className="text-danger line-through">
          {formatValue(diff.before)}
        </Text>
      )}
      {diff.status === "changed" && (
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          <Text size="caption" className="text-danger line-through">
            {formatValue(diff.before)}
          </Text>
          <Text size="caption" className="text-success">
            {formatValue(diff.after)}
          </Text>
        </div>
      )}
    </div>
  );
}
