/**
 * The Studio's editorial health model (v3.1 Milestone 3).
 *
 * This dashboard reports; it never decides. Every rule it surfaces already
 * exists somewhere authoritative — Zod schemas, `lib/public/eligibility.ts`,
 * `homepageIneligibilityReason`, `featured-order.ts`, the relationship graph —
 * and the health engine's only job is to run those and phrase the result for
 * an editor. A rule implemented here for the first time would be a second
 * source of truth, and the moment the two disagreed the dashboard would be
 * lying about the site rather than describing it.
 *
 * That constraint is why `HealthIssue` carries `remedy` and `href` as required
 * fields rather than optional extras: a finding an editor cannot act on is
 * noise, and the brief's rule — never a red warning without telling them how
 * to resolve it — is enforced by the type, not by review.
 */

export type HealthSeverity = 'critical' | 'warning' | 'info';

/**
 * Severity is about *public consequence*, not about how unusual the state is.
 *
 * - `critical` — something is wrong on the live public site right now, or a
 *   supposedly impossible invariant has broken. Someone should act today.
 * - `warning` — the public site is intact, but an editorial gap means content
 *   is not doing the job it was written for (published but invisible,
 *   unfeatured but eligible).
 * - `info` — a standing fact worth seeing on a dashboard (queue depth, recent
 *   activity). Never a defect.
 */
export const HEALTH_SEVERITY_ORDER: readonly HealthSeverity[] = ['critical', 'warning', 'info'];

export type HealthSectionKey =
  | 'featured'
  | 'homepageCoverage'
  | 'publishing'
  | 'reviewQueue'
  | 'missingContent'
  | 'brokenRelationships'
  | 'recentActivity';

export interface HealthIssue {
  /** Stable across runs for the same underlying problem, so React keys and future dismissal state have something to hold onto. */
  id: string;
  section: HealthSectionKey;
  severity: HealthSeverity;
  /** What is wrong, in one line. */
  title: string;
  /** Why it matters — the public consequence, not a restatement of the title. */
  detail: string;
  /** How to resolve it. Required: see the note on this module. */
  remedy: string;
  /** Where to go to resolve it. */
  href: string;
  /**
   * The specific entry at fault, when there is one.
   *
   * `id` is what lets the per-entry inspector (v3.1 Milestone 11) select this
   * entry's findings out of the site-wide report exactly, rather than by
   * parsing `id` or matching on `label`. Aggregate findings — a collection with
   * no featured entries, a review queue that is backing up — have no entity at
   * all, and so correctly never appear in an entry's panel.
   */
  entity?: { id?: string; label: string; referenceId?: string };
}

export interface HealthSection {
  key: HealthSectionKey;
  label: string;
  /** What this section is checking, so an empty one still explains itself. */
  description: string;
  issues: HealthIssue[];
}

export interface HealthReport {
  sections: HealthSection[];
  counts: Record<HealthSeverity, number>;
  /** True when nothing above `info` was found — the "site is healthy" state, which deserves to be stated rather than implied by absence. */
  healthy: boolean;
  generatedAt: Date;
}

/**
 * The report plus the raw material it was computed from (v3.1 Milestone 11).
 *
 * The per-entry inspector needs an entry's own facts — status, featured
 * position, homepage verdict — and the relationship defects it holds, all of
 * which `loadHealthReport` already reads and then discards. Returning them
 * costs nothing and is what lets the inspector run the whole health engine
 * without a single duplicated repository read. Anything derived from this is
 * derived from the same bytes the dashboard used, so the two can never
 * disagree about an entry.
 */
export interface HealthReportWithSnapshot<TCollection, TRelationshipIssue> extends HealthReport {
  collections: TCollection[];
  relationshipIssues: TRelationshipIssue[];
}

export function countBySeverity(issues: readonly HealthIssue[]): Record<HealthSeverity, number> {
  return {
    critical: issues.filter((issue) => issue.severity === 'critical').length,
    warning: issues.filter((issue) => issue.severity === 'warning').length,
    info: issues.filter((issue) => issue.severity === 'info').length,
  };
}

/** Most severe first, so the top of every section is the thing to do next. */
export function bySeverity(left: HealthIssue, right: HealthIssue): number {
  return (
    HEALTH_SEVERITY_ORDER.indexOf(left.severity) - HEALTH_SEVERITY_ORDER.indexOf(right.severity)
  );
}
