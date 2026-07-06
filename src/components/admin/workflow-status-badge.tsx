import { Badge } from "@/components/ui/badge";

const toneByStatus: Record<
  string,
  "default" | "warning" | "success" | "info" | "danger" | "accent"
> = {
  draft: "default",
  review: "warning",
  changes_requested: "danger",
  approved: "accent",
  published: "success",
  scheduled: "info",
  archived: "danger",
};

const labelByStatus: Record<string, string> = {
  draft: "Draft",
  review: "In review",
  changes_requested: "Changes requested",
  approved: "Approved",
  published: "Published",
  scheduled: "Scheduled",
  archived: "Archived",
};

export interface WorkflowStatusBadgeProps {
  status: string;
}

/** The one status indicator every workflow-participating collection's table/edit screen renders — never a per-collection badge (`ARCHITECTURE/19_CMS_FOUNDATION.md` §5). */
export function WorkflowStatusBadge({ status }: WorkflowStatusBadgeProps) {
  return <Badge tone={toneByStatus[status] ?? "default"}>{labelByStatus[status] ?? status}</Badge>;
}
