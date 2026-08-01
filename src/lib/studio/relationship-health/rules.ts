import type { RelationshipAssertion } from '@/lib/public/relationships';
import type { PublicEntityType } from '@/lib/public/domain';
import type { HealthSeverity } from '@/lib/studio/health/types';

/**
 * Relationship integrity rules (v3.1 Milestone 4) — pure functions over a
 * snapshot, no database access and no second graph implementation.
 *
 * The assertions handed to these rules come from `assertionsFrom` in the
 * public repository: the same derivation the public site uses to decide what a
 * record is related to. This module never re-describes which fields are
 * relationships, because a second description is exactly how a checker starts
 * disagreeing with the thing it checks.
 *
 * What *is* new here is the question being asked. The public layer resolves
 * relationships among visible records and silently drops the rest — correct
 * for rendering, useless for repair, because the dropped ones are the broken
 * ones. These rules run over every record at every status and report what the
 * public layer would discard.
 */

export interface RelationshipEntitySnapshot {
  type: PublicEntityType;
  id: string;
  label: string;
  /** `published` for types with no workflow of their own (Team, Taxonomy) — see the loader. */
  status: 'draft' | 'inReview' | 'approved' | 'published' | 'archived';
  /** Where an editor goes to fix a relationship pointing at, or from, this entity. */
  href: string;
}

export interface RelationshipSnapshot {
  entities: RelationshipEntitySnapshot[];
  /** Raw, pre-deduplication: duplicates are a finding, so they must survive to here. */
  assertions: RelationshipAssertion[];
}

export type RelationshipIssueKind =
  'missingTarget' | 'wrongType' | 'hiddenTarget' | 'duplicate' | 'selfReference';

export interface RelationshipIssue {
  id: string;
  kind: RelationshipIssueKind;
  severity: HealthSeverity;
  /** The record that holds the reference — the one an editor must open to fix it. */
  source: { type: PublicEntityType; id: string; label: string; href: string };
  /** The relationship kind as the graph names it. */
  relationship: string;
  /** What it points at. `label` is absent when the target no longer exists. */
  target: { type: PublicEntityType; id: string; label?: string };
  reason: string;
  remedy: string;
  href: string;
}

function entityKey(type: string, id: string): string {
  return `${type}:${id}`;
}

function assertionKey(assertion: RelationshipAssertion): string {
  return [
    assertion.kind,
    assertion.fromType,
    assertion.fromId,
    assertion.toType,
    assertion.toId,
    assertion.blueprintMeaning ?? '',
  ].join(':');
}

/**
 * Index the snapshot twice: once by compound identity (the correct lookup) and
 * once by bare id (so a reference to a real record filed under the wrong
 * collection can be told apart from a reference to nothing at all).
 */
function index(snapshot: RelationshipSnapshot) {
  const byKey = new Map<string, RelationshipEntitySnapshot>();
  const byId = new Map<string, RelationshipEntitySnapshot[]>();
  for (const entity of snapshot.entities) {
    byKey.set(entityKey(entity.type, entity.id), entity);
    byId.set(entity.id, [...(byId.get(entity.id) ?? []), entity]);
  }
  return { byKey, byId };
}

/** The source side of an assertion, for issue attribution. */
function sourceOf(
  assertion: RelationshipAssertion,
  byKey: Map<string, RelationshipEntitySnapshot>,
): RelationshipIssue['source'] | null {
  const entity = byKey.get(entityKey(assertion.fromType, assertion.fromId));
  if (!entity) return null;
  return { type: entity.type, id: entity.id, label: entity.label, href: entity.href };
}

/**
 * Every integrity finding, in one traversal of the assertion list.
 *
 * Single pass on purpose: each assertion is classified once and the first
 * matching rule wins, so a reference to a deleted record is reported as
 * *missing* rather than also as *hidden* and *wrong type*. One broken
 * relationship should produce one row an editor can act on, not three rows
 * describing the same mistake from different angles.
 */
export function findRelationshipIssues(snapshot: RelationshipSnapshot): RelationshipIssue[] {
  const { byKey, byId } = index(snapshot);
  const issues: RelationshipIssue[] = [];
  const seen = new Map<string, number>();

  for (const assertion of snapshot.assertions) {
    const key = assertionKey(assertion);
    seen.set(key, (seen.get(key) ?? 0) + 1);

    const source = sourceOf(assertion, byKey);
    // An assertion whose *source* is unknown cannot be attributed to an editor,
    // so there is nothing actionable to report — it can only arise from a
    // record deleted mid-scan.
    if (!source) continue;

    const issueBase = {
      source,
      relationship: assertion.kind,
      href: source.href,
    };

    if (assertion.fromType === assertion.toType && assertion.fromId === assertion.toId) {
      issues.push({
        ...issueBase,
        id: `self:${key}`,
        kind: 'selfReference',
        severity: 'warning',
        target: { type: assertion.toType, id: assertion.toId, label: source.label },
        reason: 'The entry is related to itself.',
        remedy: 'Remove the self-reference from this entry’s relationships.',
      });
      continue;
    }

    const target = byKey.get(entityKey(assertion.toType, assertion.toId));

    if (!target) {
      const elsewhere = byId.get(assertion.toId) ?? [];
      if (elsewhere.length > 0) {
        const actual = elsewhere[0] as RelationshipEntitySnapshot;
        issues.push({
          ...issueBase,
          id: `wrong-type:${key}`,
          kind: 'wrongType',
          severity: 'critical',
          target: { type: assertion.toType, id: assertion.toId, label: actual.label },
          reason: `Expected a ${assertion.toType}, but that id belongs to a ${actual.type} (${actual.label}).`,
          remedy: 'Re-pick the relationship from the correct collection.',
        });
        continue;
      }

      issues.push({
        ...issueBase,
        id: `missing:${key}`,
        kind: 'missingTarget',
        severity: 'critical',
        target: { type: assertion.toType, id: assertion.toId },
        reason: `Points at a ${assertion.toType} that no longer exists.`,
        remedy: 'Open the entry and remove or re-pick this relationship.',
      });
      continue;
    }

    if (target.status !== 'published') {
      issues.push({
        ...issueBase,
        id: `hidden:${key}`,
        kind: 'hiddenTarget',
        severity: target.status === 'archived' ? 'warning' : 'info',
        target: { type: target.type, id: target.id, label: target.label },
        reason: `Points at ${target.label}, which is ${STATUS_LABEL[target.status]} and so never renders publicly.`,
        remedy:
          target.status === 'archived'
            ? 'Remove the relationship, or restore the archived entry if it should still be linked.'
            : 'Publish the target when it is ready, or drop the relationship.',
      });
    }
  }

  for (const [key, count] of seen) {
    if (count < 2) continue;
    const assertion = snapshot.assertions.find((entry) => assertionKey(entry) === key);
    if (!assertion) continue;
    const source = sourceOf(assertion, byKey);
    if (!source) continue;

    issues.push({
      id: `duplicate:${key}`,
      kind: 'duplicate',
      severity: 'warning',
      source,
      relationship: assertion.kind,
      target: {
        type: assertion.toType,
        id: assertion.toId,
        label: byKey.get(entityKey(assertion.toType, assertion.toId))?.label,
      },
      reason: `The same relationship is stored ${count} times.`,
      // Uniqueness is not asserted by the schema — these are plain arrays — so
      // this is reported as an editorial tidy-up, not a corrupted invariant.
      // The public site already de-duplicates on read, so nothing is visibly
      // wrong today.
      remedy: 'Open the entry and remove the repeated selection.',
      href: source.href,
    });
  }

  return issues;
}

const STATUS_LABEL: Record<RelationshipEntitySnapshot['status'], string> = {
  draft: 'a draft',
  inReview: 'in review',
  approved: 'approved but unpublished',
  published: 'published',
  archived: 'archived',
};

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

export interface RelationshipIssueFilter {
  collection?: string;
  severity?: HealthSeverity;
  relationship?: string;
  query?: string;
}

/**
 * Filtering is pure and applied after detection, so a filtered view is always
 * a subset of the same findings rather than a different scan with different
 * rules.
 */
export function filterRelationshipIssues(
  issues: readonly RelationshipIssue[],
  filter: RelationshipIssueFilter,
): RelationshipIssue[] {
  const query = filter.query?.trim().toLowerCase();

  return issues.filter((issue) => {
    if (filter.collection && issue.source.type !== filter.collection) return false;
    if (filter.severity && issue.severity !== filter.severity) return false;
    if (filter.relationship && issue.relationship !== filter.relationship) return false;
    if (query) {
      const haystack = [issue.source.label, issue.target.label ?? '', issue.relationship]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function summarizeRelationshipIssues(issues: readonly RelationshipIssue[]) {
  return {
    total: issues.length,
    critical: issues.filter((issue) => issue.severity === 'critical').length,
    warning: issues.filter((issue) => issue.severity === 'warning').length,
    info: issues.filter((issue) => issue.severity === 'info').length,
    collections: [...new Set(issues.map((issue) => issue.source.type))].sort(),
    relationships: [...new Set(issues.map((issue) => issue.relationship))].sort(),
  };
}
