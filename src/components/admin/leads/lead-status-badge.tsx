import { Badge } from "@/components/ui/badge";

const toneByStatus: Record<string, "info" | "warning" | "success" | "danger"> = {
  new: "info",
  contacted: "warning",
  closed: "success",
  archived: "danger",
};

const labelByStatus: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
  archived: "Archived",
};

export interface LeadStatusBadgeProps {
  status: string;
}

/**
 * Lead's own triage-status badge — deliberately not `<WorkflowStatusBadge>`:
 * that component's draft/review/published vocabulary and colors describe a
 * publish workflow, not a follow-up triage state
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §12's explicit distinction between
 * the two "status" concepts).
 */
export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  return <Badge tone={toneByStatus[status] ?? "default"}>{labelByStatus[status] ?? status}</Badge>;
}
