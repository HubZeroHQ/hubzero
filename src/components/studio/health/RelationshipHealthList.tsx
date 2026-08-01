'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/Input';
import {
  filterRelationshipIssues,
  summarizeRelationshipIssues,
  type RelationshipIssue,
} from '@/lib/studio/relationship-health/rules';
import type { HealthSeverity } from '@/lib/studio/health/types';

const SEVERITY_LABEL: Record<HealthSeverity, string> = {
  critical: 'critical',
  warning: 'warning',
  info: 'informational',
};

/**
 * The Relationship Health list (v3.1 Milestone 4).
 *
 * Filtering is client-side over an already-computed set rather than a re-scan:
 * the integrity questions are answered once on the server, and narrowing the
 * view must never be able to produce a different answer than the unfiltered
 * one. It also keeps every facet instant, which matters when the whole point of
 * the screen is triage.
 *
 * Each row is a single link — one tab stop per issue — landing on the editor
 * that owns the broken reference, because the source record is the only place
 * it can be repaired.
 */
export function RelationshipHealthList({ issues }: { issues: RelationshipIssue[] }) {
  const [collection, setCollection] = useState('');
  const [severity, setSeverity] = useState('');
  const [relationship, setRelationship] = useState('');
  const [query, setQuery] = useState('');

  const facets = useMemo(() => summarizeRelationshipIssues(issues), [issues]);
  const filtered = useMemo(
    () =>
      filterRelationshipIssues(issues, {
        ...(collection ? { collection } : {}),
        ...(severity ? { severity: severity as HealthSeverity } : {}),
        ...(relationship ? { relationship } : {}),
        ...(query ? { query } : {}),
      }),
    [issues, collection, severity, relationship, query],
  );

  if (issues.length === 0) {
    return (
      <p className="text-text-secondary text-sm">
        Every relationship resolves to an existing entry of the expected collection. Nothing to
        repair.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title…"
          aria-label="Search relationship issues by title"
          className="max-w-xs"
        />
        <Facet
          label="Collection"
          plural="collections"
          value={collection}
          onChange={setCollection}
          options={facets.collections}
        />
        <Facet
          label="Severity"
          plural="severities"
          value={severity}
          onChange={setSeverity}
          options={['critical', 'warning', 'info']}
        />
        <Facet
          label="Relationship"
          plural="relationships"
          value={relationship}
          onChange={setRelationship}
          options={facets.relationships}
        />
      </div>

      <p role="status" aria-live="polite" className="text-text-muted text-xs">
        Showing {filtered.length} of {issues.length} — {facets.critical} critical, {facets.warning}{' '}
        warning, {facets.info} informational.
      </p>

      {filtered.length === 0 ? (
        <p className="text-text-muted text-sm">No issues match these filters.</p>
      ) : (
        <ul className="divide-border-muted border-border-default divide-y rounded-[4px] border">
          {filtered.map((issue) => (
            <li key={issue.id}>
              <Link
                href={issue.href}
                className="hover:bg-surface-elevated duration-fast ease-standard group flex items-start gap-3 px-3 py-3 transition-colors"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-text-primary text-sm font-medium">
                    {issue.source.label}
                    <span className="text-text-muted font-normal">
                      {' '}
                      &middot; {issue.relationship} &rarr;{' '}
                    </span>
                    {issue.target.label ?? `${issue.target.type} (deleted)`}
                  </span>
                  <span className="sr-only">Severity: {SEVERITY_LABEL[issue.severity]}.</span>
                  <span className="text-text-secondary text-xs">{issue.reason}</span>
                  <span className="text-text-muted text-xs">
                    <span className="sr-only">How to fix: </span>
                    {issue.remedy}
                  </span>
                </span>
                <span
                  className={
                    issue.severity === 'critical'
                      ? 'text-danger shrink-0 text-xs'
                      : 'text-text-muted shrink-0 text-xs'
                  }
                >
                  {SEVERITY_LABEL[issue.severity]}
                </span>
                <ChevronRight
                  className="text-text-muted group-hover:text-text-primary mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Facet({
  label,
  value,
  onChange,
  options,
  plural,
}: {
  label: string;
  /** English plurals are irregular ("severities", not "severitys"), so the caller supplies it. */
  plural: string;
  value: string;
  onChange: (next: string) => void;
  options: readonly string[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={`Filter by ${label.toLowerCase()}`}
      className="bg-surface-default text-text-primary border-border-subtle rounded-[4px] border px-3 py-2 text-sm"
    >
      <option value="">All {plural}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
