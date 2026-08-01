import { Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { HealthReport, HealthSection } from '@/lib/studio/health/types';
import { HealthIssueRow } from './HealthDashboard';

/**
 * The dashboard's view of editorial health (v3.1 Milestone 16).
 *
 * The same report the full Content Health page renders, presented by a
 * different rule: **sections with findings become cards; sections that are
 * clear become a checkmark.**
 *
 * The old dashboard gave every section a full card whether or not it had
 * anything to say, so on a healthy site an editor scrolled through five cards
 * to be told five times that nothing was wrong. Space on this screen should be
 * proportional to how much action something needs, and a passing check needs
 * none — but it still deserves to be *visible*, because silence about a check
 * is indistinguishable from that check not existing. A row of ticks says "these
 * were looked at and they are fine" in one line.
 *
 * No rule, severity, wording or destination is decided here. Findings render
 * through `HealthIssueRow`, exactly as they do on the full report.
 */
export function HealthOverview({ report }: { report: HealthReport }) {
  /**
   * Only `critical` and `warning` reach "Needs attention".
   *
   * `info` is defined in `health/types.ts` as "a standing fact worth seeing on
   * a dashboard… **never a defect**" — a queue depth, a recent-activity note,
   * an empty collection. Those are not things an editor must act on, and
   * letting them open cards here reproduces exactly the noise this redesign
   * removes: on a site with empty collections the section fills with nine rows
   * saying "no entries yet", burying any real finding underneath.
   *
   * They are not hidden — the count is shown beside the section in the compact
   * row, and the full report at `/studio/health` lists every one.
   */
  const actionable = report.sections
    .map((section) => ({
      ...section,
      issues: section.issues.filter((issue) => issue.severity !== 'info'),
    }))
    // The review queue is excluded here because the dashboard renders the queue
    // itself, with the actual entries, a few rows below. Surfacing a finding
    // that says "2 entries are awaiting review" directly above the list of
    // those 2 entries is the duplication this pass exists to remove — and the
    // list is the more useful of the two, since it can be acted on.
    .filter((section) => section.issues.length > 0 && section.key !== 'reviewQueue');

  const actionableKeys = new Set(actionable.map((section) => section.key));
  const rest = report.sections.filter((section) => !actionableKeys.has(section.key));

  return (
    <div className="flex flex-col gap-4">
      {actionable.length > 0 ? (
        <section aria-labelledby="needs-attention-title" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="needs-attention-title" className="text-text-primary text-sm font-semibold">
              Needs attention
            </h2>
            <SeverityCounts report={report} />
          </div>

          {actionable.map((section) => (
            <AttentionCard key={section.key} section={section} />
          ))}
        </section>
      ) : null}

      <SystemHealthCard sections={rest} allClear={actionable.length === 0} />
    </div>
  );
}

function SeverityCounts({ report }: { report: HealthReport }) {
  // Mirrors the filter above: `info` is not counted as something needing action.
  const parts = (['critical', 'warning'] as const).filter(
    (severity) => report.counts[severity] > 0,
  );
  if (parts.length === 0) return null;

  return (
    <p className="text-text-secondary text-xs">
      {parts.map((severity) => `${report.counts[severity]} ${severity}`).join(' · ')}
    </p>
  );
}

/** A section that actually has something to resolve, at full weight. */
function AttentionCard({ section }: { section: HealthSection }) {
  const headingId = `attention-${section.key}`;

  return (
    <section
      aria-labelledby={headingId}
      className="border-border-default bg-surface-default rounded-card flex flex-col gap-2 border p-4"
    >
      <div className="flex items-center gap-2">
        <h3 id={headingId} className="text-text-primary text-sm font-semibold">
          {section.label}
        </h3>
        <span className="text-text-muted font-mono text-[11px]">{section.issues.length}</span>
      </div>
      {/*
        The section's own description is deliberately omitted here. It explains
        what the check *is*, which matters on the full report and is noise
        beside a concrete finding that already states what is wrong and how to
        fix it.
      */}
      <ul className="divide-border-muted divide-y">
        {section.issues.map((issue) => (
          <HealthIssueRow key={issue.id} issue={issue} compact />
        ))}
      </ul>
    </section>
  );
}

/**
 * Every passing check, in one line each. This is the whole of what used to be
 * five cards.
 */
function SystemHealthCard({
  sections,
  allClear,
}: {
  sections: HealthSection[];
  allClear: boolean;
}) {
  return (
    <section
      aria-labelledby="system-health-title"
      className="border-border-default bg-surface-default rounded-card flex flex-col gap-3 border p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="system-health-title" className="text-text-primary text-sm font-semibold">
          System health
        </h2>
        <Link
          href="/studio/health"
          className="text-text-secondary hover:text-text-primary group inline-flex items-center gap-1 text-xs"
        >
          Full report
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      {allClear ? (
        <p className="text-text-secondary text-xs">Nothing needs an editor right now.</p>
      ) : null}

      {sections.length > 0 ? (
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {sections.map((section) => {
            // A section carrying only informational findings is not "clear",
            // and saying so would be a small lie. It gets its count instead of
            // a tick, and the full report explains it.
            const infoCount = section.issues.length;
            return (
              <li key={section.key} className="flex items-center gap-1.5">
                {infoCount === 0 ? (
                  <Check className="text-success h-3.5 w-3.5 shrink-0" aria-hidden />
                ) : null}
                <span className="text-text-secondary text-xs">{section.label}</span>
                <span className="sr-only">
                  : {infoCount === 0 ? 'clear' : 'informational only'}.
                </span>
                {infoCount > 0 ? (
                  <span className="text-text-muted font-mono text-[11px]">{infoCount} info</span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
