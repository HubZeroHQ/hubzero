import Link from 'next/link';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import type { EntryInspection } from '@/lib/studio/health/inspector';
import type { HealthIssue, HealthSeverity } from '@/lib/studio/health/types';
import type { RelationshipIssue } from '@/lib/studio/relationship-health/rules';

/**
 * The per-entry Health inspector (v3.1 Milestone 11).
 *
 * A collapsible `<details>` panel, never a modal: it sits beside the editor
 * and stays available while the editor types, which is the whole point —
 * discovering a problem should not mean leaving the entry.
 *
 * It renders findings; it does not judge them. Severity, wording, remedy and
 * destination all arrive already decided by the health engine, so a finding
 * reads identically here and on the global dashboard. That is why there is no
 * severity logic in this file beyond choosing a colour.
 */

const SEVERITY_LABEL: Record<HealthSeverity, string> = {
  critical: 'Critical',
  warning: 'Warning',
  info: 'Info',
};

const SEVERITY_CLASS: Record<HealthSeverity, string> = {
  critical: 'text-danger',
  warning: 'text-status-warning',
  info: 'text-text-muted',
};

export function EntryInspector({ inspection }: { inspection: EntryInspection }) {
  const { entry, featured, counts } = inspection;
  const total = counts.critical + counts.warning + counts.info;

  return (
    <details
      open
      className="border-border-default rounded-card group border"
      // Persisted per collection rather than per entry: an editor who collapses
      // the panel means "I don't want this while I work", not "not on this one
      // record". `name` is omitted deliberately — grouping would make opening
      // one panel close another.
    >
      <summary className="flex cursor-pointer flex-wrap items-center gap-2 px-4 py-3">
        <span className="text-text-primary text-sm font-semibold">Entry health</span>
        {total === 0 ? (
          <span className="text-text-muted text-xs">No issues</span>
        ) : (
          <span className="flex items-center gap-2 text-xs">
            {(['critical', 'warning', 'info'] as const)
              .filter((severity) => counts[severity] > 0)
              .map((severity) => (
                <span key={severity} className={SEVERITY_CLASS[severity]}>
                  {counts[severity]} {SEVERITY_LABEL[severity].toLowerCase()}
                </span>
              ))}
          </span>
        )}
        <span className="text-text-muted ml-auto text-xs group-open:hidden">Show</span>
        <span className="text-text-muted ml-auto hidden text-xs group-open:inline">Hide</span>
      </summary>

      <div className="border-border-muted flex flex-col gap-5 border-t px-4 py-4">
        <Section title="Publishing">
          <Row label="Workflow state">
            <StatusIndicator status={entry.status} />
          </Row>
          <Row label="Public visibility">
            {entry.status === 'published' ? 'Visible to visitors' : 'Not on the public site'}
          </Row>
          <Row label="Homepage eligibility">
            {entry.homepage.kind === 'eligible'
              ? 'Qualifies to appear'
              : entry.homepage.kind === 'notPublished'
                ? 'Not published, so it cannot appear'
                : entry.homepage.reason}
          </Row>
        </Section>

        <Section title="Featured">
          <Row label="Featured">
            {featured.isFeatured ? `Yes — position ${featured.position}` : 'Not featured'}
          </Row>
          {inspection.collection.surface ? (
            <Row label="Homepage section">{inspection.collection.surface}</Row>
          ) : null}
          <Row label="Would actually appear">
            {featured.isFeatured && entry.homepage.kind === 'eligible'
              ? 'Yes'
              : featured.isFeatured
                ? 'No — featured but not eligible'
                : 'Not featured'}
          </Row>
          {inspection.collection.featuredPath ? (
            <InspectorLink href={inspection.collection.featuredPath}>
              Open featured order
            </InspectorLink>
          ) : null}
        </Section>

        <Section title="Relationships">
          {inspection.relationshipIssues.length === 0 ? (
            <p className="text-text-muted text-xs">
              No broken, hidden, duplicate or self references.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {inspection.relationshipIssues.map((issue) => (
                <RelationshipRow key={issue.id} issue={issue} />
              ))}
            </ul>
          )}
          <InspectorLink href="/studio/health/relationships">
            Open relationship health
          </InspectorLink>
        </Section>

        <Section title="Documents">
          {inspection.documents.length === 0 ? (
            <p className="text-text-muted text-xs">
              This collection has no document body of its own.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {inspection.documents.map((document) => (
                <li key={document.role} className="flex flex-wrap items-baseline gap-x-2 text-xs">
                  <span className="text-text-primary">{document.role}</span>
                  <span className={document.exists ? 'text-text-secondary' : 'text-status-warning'}>
                    {document.exists
                      ? `${document.blockCount} block${document.blockCount === 1 ? '' : 's'}`
                      : 'Not written yet'}
                  </span>
                  {document.updatedAt ? (
                    <time
                      dateTime={new Date(document.updatedAt).toISOString()}
                      className="text-text-muted"
                    >
                      edited {formatDate(document.updatedAt)}
                    </time>
                  ) : null}
                  {document.latestVersionAt ? (
                    <span className="text-text-muted">
                      last snapshot {formatDate(document.latestVersionAt)}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Public">
          <Row label="Slug">
            <code className="font-mono text-xs">{inspection.public.slug}</code>
          </Row>
          <Row label="Public route">
            {inspection.public.route ? (
              <a
                href={inspection.public.route}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                {inspection.public.route}
              </a>
            ) : (
              'This collection has no public detail page'
            )}
          </Row>
          {inspection.public.canonical &&
          inspection.public.canonical !== inspection.public.route ? (
            <Row label="Canonical URL">{inspection.public.canonical}</Row>
          ) : null}
        </Section>

        <Section title="Warnings">
          {inspection.issues.length === 0 ? (
            <p className="text-text-muted text-xs">
              Nothing the health dashboard flags about this entry.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {inspection.issues.map((issue) => (
                <IssueRow key={issue.id} issue={issue} />
              ))}
            </ul>
          )}
        </Section>
      </div>
    </details>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="text-text-muted font-mono text-[11px] tracking-[0.08em] uppercase">{title}</h3>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-2 text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-secondary">{children}</span>
    </p>
  );
}

function InspectorLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-text-secondary hover:text-text-primary text-xs underline underline-offset-2"
    >
      {children}
    </Link>
  );
}

/**
 * Every issue carries its own remedy and destination — required fields on
 * `HealthIssue`, so "never a red warning without telling the editor how to
 * resolve it" is guaranteed by the engine rather than by this component
 * remembering to render one.
 */
function IssueRow({ issue }: { issue: HealthIssue }) {
  return (
    <li className="flex flex-col gap-0.5">
      <span className={`text-xs font-medium ${SEVERITY_CLASS[issue.severity]}`}>
        {SEVERITY_LABEL[issue.severity]} · {issue.title}
      </span>
      <span className="text-text-secondary text-xs">{issue.detail}</span>
      <span className="text-text-muted text-xs">{issue.remedy}</span>
      <InspectorLink href={issue.href}>Go to fix</InspectorLink>
    </li>
  );
}

function RelationshipRow({ issue }: { issue: RelationshipIssue }) {
  return (
    <li className="flex flex-col gap-0.5">
      <span className={`text-xs font-medium ${SEVERITY_CLASS[issue.severity]}`}>
        {SEVERITY_LABEL[issue.severity]} · {issue.relationship} — {issue.kind}
      </span>
      <span className="text-text-secondary text-xs">{issue.reason}</span>
      <span className="text-text-muted text-xs">{issue.remedy}</span>
      <InspectorLink href={issue.href}>Go to fix</InspectorLink>
    </li>
  );
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}
