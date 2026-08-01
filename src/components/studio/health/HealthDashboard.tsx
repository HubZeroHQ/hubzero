import { AlertTriangle, CheckCircle2, ChevronRight, Info, OctagonAlert } from 'lucide-react';
import Link from 'next/link';
import { ReferenceIdBadge } from '@/components/ui/ReferenceIdBadge';
import type {
  HealthIssue,
  HealthReport,
  HealthSection,
  HealthSeverity,
} from '@/lib/studio/health/types';
import type { ReferenceId, ReferenceIdPrefix } from '@/types/studio';
import { cn } from '@/lib/utils/cn';

/**
 * The editorial health dashboard (v3.1 Milestone 3) — a CI-style list of
 * findings, not analytics.
 *
 * Every row answers the same four questions in the same order: what is wrong,
 * why it matters, how to fix it, and where to go. That shape is load-bearing
 * rather than stylistic — a health dashboard whose rows an editor cannot act
 * on becomes something people learn to scroll past, and once that happens the
 * critical rows are invisible too.
 *
 * No charts, no percentages, no trends: a count of "83% healthy" tells an
 * editor nothing they can do today.
 */
export function HealthDashboard({ report }: { report: HealthReport }) {
  return (
    <div className="flex flex-col gap-6">
      <HealthSummary report={report} />
      {report.sections.map((section) => (
        <HealthSectionCard key={section.key} section={section} />
      ))}
    </div>
  );
}

function HealthSummary({ report }: { report: HealthReport }) {
  if (report.healthy) {
    return (
      <section
        aria-labelledby="health-summary-title"
        className="border-border-default bg-surface-default rounded-card flex items-start gap-3 border p-4"
      >
        <CheckCircle2 className="text-success mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div className="flex flex-col gap-1">
          <h2 id="health-summary-title" className="text-text-primary text-sm font-semibold">
            The public site is healthy
          </h2>
          <p className="text-text-secondary text-xs">
            Nothing needs an editor right now. The sections below still list what is being checked,
            so a clean result is visible rather than merely implied.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="health-summary-title"
      className="border-border-default bg-surface-default rounded-card flex flex-wrap items-center gap-4 border p-4"
    >
      <h2 id="health-summary-title" className="text-text-primary text-sm font-semibold">
        Needs attention
      </h2>
      <ul className="flex flex-wrap items-center gap-3">
        {(['critical', 'warning', 'info'] as const)
          .filter((severity) => report.counts[severity] > 0)
          .map((severity) => (
            <li key={severity} className="flex items-center gap-1.5">
              <SeverityIcon severity={severity} />
              <span className="text-text-secondary text-xs">
                {report.counts[severity]} {SEVERITY_LABEL[severity]}
              </span>
            </li>
          ))}
      </ul>
    </section>
  );
}

const SEVERITY_LABEL: Record<HealthSeverity, string> = {
  critical: 'critical',
  warning: 'warning',
  info: 'informational',
};

/**
 * Severity is announced as text beside the icon, never by colour alone — the
 * icon carries `aria-hidden` precisely so the word is the accessible name.
 */
export function SeverityIcon({ severity }: { severity: HealthSeverity }) {
  const className = cn(
    'h-3.5 w-3.5 shrink-0',
    severity === 'critical' && 'text-danger',
    severity === 'warning' && 'text-text-secondary',
    severity === 'info' && 'text-text-muted',
  );

  if (severity === 'critical') return <OctagonAlert className={className} aria-hidden />;
  if (severity === 'warning') return <AlertTriangle className={className} aria-hidden />;
  return <Info className={className} aria-hidden />;
}

function HealthSectionCard({ section }: { section: HealthSection }) {
  const headingId = `health-section-${section.key}`;

  return (
    <section
      aria-labelledby={headingId}
      className="border-border-default bg-surface-default rounded-card flex flex-col gap-3 border p-4"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 id={headingId} className="text-text-primary text-sm font-semibold">
            {section.label}
          </h2>
          <span className="text-text-muted font-mono text-[11px]">
            {section.issues.length === 0 ? 'clear' : section.issues.length}
          </span>
        </div>
        <p className="text-text-secondary text-xs">{section.description}</p>
      </div>

      {section.issues.length === 0 ? (
        <p className="text-text-muted text-sm">Nothing to resolve here.</p>
      ) : (
        <ul className="divide-border-muted divide-y">
          {section.issues.map((issue) => (
            <HealthIssueRow key={issue.id} issue={issue} />
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * One finding. The whole row is a link, so reaching the fix is one action from
 * anywhere in the row — including for a keyboard user, who gets a single tab
 * stop per issue rather than one per decorative element.
 */
export function HealthIssueRow({
  issue,
  compact = false,
}: {
  issue: HealthIssue;
  /**
   * Drops `detail` — the "why this matters" prose. The dashboard shows what is
   * wrong and what to do about it; the reasoning is a paragraph an editor reads
   * once, and it is still on the full report one click away. Keeping it here
   * cost two wrapped lines per finding on the screen with the least room.
   */
  compact?: boolean;
}) {
  return (
    <li>
      <Link
        href={issue.href}
        className="hover:bg-surface-elevated duration-fast ease-standard rounded-control group flex items-start gap-3 px-1 py-3 transition-colors"
      >
        <span className="mt-0.5">
          <SeverityIcon severity={issue.severity} />
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-text-primary text-sm font-medium">{issue.title}</span>
            <span className="sr-only">Severity: {SEVERITY_LABEL[issue.severity]}.</span>
            {issue.entity?.referenceId ? (
              <ReferenceIdBadge
                referenceId={issue.entity.referenceId as ReferenceId<ReferenceIdPrefix>}
              />
            ) : null}
          </span>
          {compact ? null : <span className="text-text-secondary text-xs">{issue.detail}</span>}
          <span className="text-text-muted text-xs">
            <span className="sr-only">How to fix: </span>
            {issue.remedy}
          </span>
        </span>

        <ChevronRight
          className="text-text-muted group-hover:text-text-primary mt-0.5 h-4 w-4 shrink-0"
          aria-hidden
        />
      </Link>
    </li>
  );
}
