import { DiffView } from "@/components/admin/version-history/diff-view";
import { RestoreVersionButton } from "@/components/admin/version-history/restore-version-button";
import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { Text } from "@/components/ui";
import type { FieldDiff } from "@/lib/cms/diff";
import type { ClientMedia } from "@/lib/cms/media";
import type { ClientVersionEntry } from "@/lib/cms/version-history";
import type { Resource } from "@/types/cms";

export interface VersionEntryCardProps {
  entry: ClientVersionEntry;
  /** Precomputed by the page (`diffObjects(previousSnapshot, entry.snapshot, ...)`) rather than recomputed here — the page also needs every version's diffs up front to batch-resolve `mediaMap` in one `getMediaByIds` call. */
  diffs: FieldDiff[];
  mediaMap: Record<string, ClientMedia>;
  resource: Resource;
  documentId: string;
  canRestore: boolean;
  editHref: string;
}

/** One row in a document's version list — metadata, a diff against the version before it, and (permission-gated) a restore action. Purely a Server Component beyond the one client island `RestoreVersionButton` needs. */
export function VersionEntryCard({
  entry,
  diffs,
  mediaMap,
  resource,
  documentId,
  canRestore,
  editHref,
}: VersionEntryCardProps) {
  return (
    <li className="border-border-muted rounded-lg border p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Text weight="medium">
            {entry.version !== null ? `Version ${entry.version}` : "Version"}
          </Text>
          {entry.status && <WorkflowStatusBadge status={entry.status} />}
        </div>
        <Text size="caption" tone="muted">
          {entry.editedBy?.name ?? "Unknown editor"} ·{" "}
          {new Date(entry.editedAt).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </Text>
      </div>

      <DiffView diffs={diffs} mediaMap={mediaMap} />

      {canRestore && (
        <div className="mt-3">
          <RestoreVersionButton
            resource={resource}
            documentId={documentId}
            versionId={entry.id}
            redirectTo={editHref}
          />
        </div>
      )}
    </li>
  );
}
