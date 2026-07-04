import { DiffView } from "@/components/admin/version-history/diff-view";
import { RestoreVersionButton } from "@/components/admin/version-history/restore-version-button";
import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { Text } from "@/components/ui";
import { diffObjects } from "@/lib/cms/diff";
import type { ClientVersionEntry } from "@/lib/cms/version-history";
import type { Resource } from "@/types/cms";

export interface VersionEntryCardProps {
  entry: ClientVersionEntry;
  /** The previous version's snapshot (older), or `null` for the oldest entry — what this entry's diff is compared against. */
  previousSnapshot: Record<string, unknown> | null;
  fieldLabels: Record<string, string>;
  resource: Resource;
  documentId: string;
  canRestore: boolean;
  editHref: string;
}

/** One row in a document's version list — metadata, a diff against the version before it, and (permission-gated) a restore action. Purely a Server Component beyond the one client island `RestoreVersionButton` needs. */
export function VersionEntryCard({
  entry,
  previousSnapshot,
  fieldLabels,
  resource,
  documentId,
  canRestore,
  editHref,
}: VersionEntryCardProps) {
  const diffs = diffObjects(previousSnapshot, entry.snapshot, fieldLabels);

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

      <DiffView diffs={diffs} />

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
