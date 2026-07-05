import { EmptyState } from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";

interface TimelineEntry {
  type: string;
  message: string;
  actorId: string;
  at: string;
}

export interface LeadTimelineProps {
  entries: TimelineEntry[];
  /** `actorId` → display name, resolved server-side (one batched `User.find`, not one query per entry). */
  actorNames: Record<string, string>;
}

const labelByType: Record<string, string> = {
  note: "Note",
  status_change: "Status change",
  assignment: "Assignment",
};

/** Newest-first read of a Lead's `timeline` — the one place "notes" and "status/assignment history" both render, since a note is just one more entry type (`models/lead.ts`). */
export function LeadTimeline({ entries, actorNames }: LeadTimelineProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="Status changes, assignments, and notes will show up here."
      />
    );
  }

  const sorted = [...entries].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <ul className="flex flex-col gap-4">
      {sorted.map((entry, index) => (
        <li key={index} className="border-border-muted border-l-2 py-1 pl-4">
          <div className="flex items-center justify-between gap-4">
            <Text weight="medium">{labelByType[entry.type] ?? entry.type}</Text>
            <Text size="caption" tone="muted">
              {new Date(entry.at).toLocaleString("en-US")}
            </Text>
          </div>
          <Text className="mt-1 whitespace-pre-wrap">{entry.message}</Text>
          <Text size="caption" tone="muted" className="mt-1">
            {actorNames[entry.actorId] ?? "Unknown user"}
          </Text>
        </li>
      ))}
    </ul>
  );
}
