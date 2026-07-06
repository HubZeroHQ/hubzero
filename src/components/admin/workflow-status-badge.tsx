import { Badge } from "@/components/ui/badge";

const toneByStatus: Record<string, "default" | "warning" | "success" | "info" | "danger"> = {
  draft: "default",
  review: "warning",
  published: "success",
  scheduled: "info",
  archived: "danger",
};

const labelByStatus: Record<string, string> = {
  draft: "Draft",
  review: "In review",
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
