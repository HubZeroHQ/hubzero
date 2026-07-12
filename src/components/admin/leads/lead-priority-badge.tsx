import { Badge } from "@/components/ui/badge";

const toneByPriority: Record<string, "default" | "warning" | "danger"> = {
  low: "default",
  medium: "warning",
  high: "danger",
};

const labelByPriority: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export interface LeadPriorityBadgeProps {
  priority?: string;
}

export function LeadPriorityBadge({ priority }: LeadPriorityBadgeProps) {
  const value = priority ?? "medium";
  return <Badge tone={toneByPriority[value] ?? "default"}>{labelByPriority[value] ?? value}</Badge>;
}
