import type { ProgressMilestone } from '@/types/studio';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

/**
 * Read-only render of a collection entry's Progress Timeline (Phase 10) — the
 * display-side counterpart to `ProgressTimelineField`. Generic over any
 * `ProgressMilestone[]` (`types/studio.ts`), so a future collection reusing
 * the same field reuses this exact component too. Milestones render oldest
 * to newest, matching how a timeline is actually read.
 */
export function ProgressTimeline({
  milestones,
  documentRoleLabels,
}: {
  milestones: ProgressMilestone[];
  /** Human-readable labels for whatever Document roles this owner defines (e.g. `{ findings: 'Findings' }`). */
  documentRoleLabels?: Partial<Record<string, string>>;
}) {
  if (milestones.length === 0) {
    return <p className="text-text-muted text-sm">No milestones recorded yet.</p>;
  }

  const sorted = [...milestones].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <ol className="border-border-muted flex flex-col gap-4 border-l pl-4">
      {sorted.map((milestone, index) => (
        <li key={index} className="flex flex-col gap-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
              {DATE_FORMATTER.format(milestone.date)}
            </span>
            <span className="text-text-primary text-sm font-medium">{milestone.title}</span>
          </div>
          <p className="text-text-secondary text-sm">{milestone.summary}</p>
          {milestone.relatedDocumentRole ? (
            <span className="text-text-muted text-xs">
              Related:{' '}
              {documentRoleLabels?.[milestone.relatedDocumentRole] ?? milestone.relatedDocumentRole}
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
