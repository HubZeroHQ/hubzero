import { describe, expect, it } from 'vitest';
import type { RelationshipAssertion } from '@/lib/public/relationships';
import {
  filterRelationshipIssues,
  findRelationshipIssues,
  summarizeRelationshipIssues,
  type RelationshipEntitySnapshot,
  type RelationshipSnapshot,
} from './rules';

function entity(
  overrides: Partial<RelationshipEntitySnapshot> & Pick<RelationshipEntitySnapshot, 'type' | 'id'>,
): RelationshipEntitySnapshot {
  return {
    label: `${overrides.type}-${overrides.id}`,
    status: 'published',
    href: `/studio/${overrides.type}/${overrides.id}/edit`,
    ...overrides,
  };
}

function assertion(overrides: Partial<RelationshipAssertion> = {}): RelationshipAssertion {
  return {
    kind: 'artifactUsesBlueprint',
    fromType: 'work',
    fromId: 'w1',
    toType: 'blueprint',
    toId: 'b1',
    ...overrides,
  } as RelationshipAssertion;
}

function snapshot(
  entities: RelationshipEntitySnapshot[],
  assertions: RelationshipAssertion[],
): RelationshipSnapshot {
  return { entities, assertions };
}

describe('findRelationshipIssues', () => {
  it('reports nothing when every reference resolves to a published target', () => {
    const issues = findRelationshipIssues(
      snapshot(
        [entity({ type: 'work', id: 'w1' }), entity({ type: 'blueprint', id: 'b1' })],
        [assertion()],
      ),
    );

    expect(issues).toEqual([]);
  });

  it('reports a reference to a deleted record as critical', () => {
    const issues = findRelationshipIssues(
      snapshot([entity({ type: 'work', id: 'w1' })], [assertion()]),
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.kind).toBe('missingTarget');
    expect(issues[0]?.severity).toBe('critical');
    expect(issues[0]?.source.label).toBe('work-w1');
    expect(issues[0]?.href).toContain('/studio/work/w1/edit');
  });

  it('distinguishes a wrong-collection reference from a missing one', () => {
    // The id exists — but as a Lab, not the Blueprint the relationship claims.
    const issues = findRelationshipIssues(
      snapshot(
        [entity({ type: 'work', id: 'w1' }), entity({ type: 'lab', id: 'b1', label: 'A Lab' })],
        [assertion()],
      ),
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.kind).toBe('wrongType');
    expect(issues[0]?.severity).toBe('critical');
    expect(issues[0]?.reason).toContain('belongs to a lab');
  });

  it('reports an archived target as a warning and a draft target as info', () => {
    const archived = findRelationshipIssues(
      snapshot(
        [
          entity({ type: 'work', id: 'w1' }),
          entity({ type: 'blueprint', id: 'b1', status: 'archived' }),
        ],
        [assertion()],
      ),
    );
    const draft = findRelationshipIssues(
      snapshot(
        [
          entity({ type: 'work', id: 'w1' }),
          entity({ type: 'blueprint', id: 'b1', status: 'draft' }),
        ],
        [assertion()],
      ),
    );

    expect(archived[0]?.kind).toBe('hiddenTarget');
    expect(archived[0]?.severity).toBe('warning');
    expect(draft[0]?.severity).toBe('info');
    expect(draft[0]?.reason).toContain('a draft');
  });

  it('reports a self-reference', () => {
    const issues = findRelationshipIssues(
      snapshot([entity({ type: 'work', id: 'w1' })], [assertion({ toType: 'work', toId: 'w1' })]),
    );

    expect(issues[0]?.kind).toBe('selfReference');
    expect(issues[0]?.severity).toBe('warning');
  });

  it('reports a duplicated relationship once, with its multiplicity', () => {
    const issues = findRelationshipIssues(
      snapshot(
        [entity({ type: 'work', id: 'w1' }), entity({ type: 'blueprint', id: 'b1' })],
        [assertion(), assertion(), assertion()],
      ),
    );

    expect(issues).toHaveLength(1);
    expect(issues[0]?.kind).toBe('duplicate');
    expect(issues[0]?.reason).toContain('3 times');
  });

  it('classifies each broken reference once rather than under every rule it matches', () => {
    // Missing *and* would be hidden *and* wrong type — one actionable row.
    const issues = findRelationshipIssues(
      snapshot([entity({ type: 'work', id: 'w1' })], [assertion()]),
    );

    expect(issues).toHaveLength(1);
  });

  it('treats two opposite-direction relationships as legal, not as a cycle', () => {
    // The graph stores each edge once and derives inverses, so a genuine
    // mutual relationship is two assertions — never a defect.
    const issues = findRelationshipIssues(
      snapshot(
        [entity({ type: 'work', id: 'w1' }), entity({ type: 'lab', id: 'l1' })],
        [
          assertion({ toType: 'lab', toId: 'l1', kind: 'workRelatedLab' }),
          assertion({
            fromType: 'lab',
            fromId: 'l1',
            toType: 'work',
            toId: 'w1',
            kind: 'workRelatedLab',
          }),
        ],
      ),
    );

    expect(issues).toEqual([]);
  });

  it('ignores an assertion whose source record no longer exists', () => {
    const issues = findRelationshipIssues(
      snapshot([entity({ type: 'blueprint', id: 'b1' })], [assertion()]),
    );
    expect(issues).toEqual([]);
  });

  it('scans a large graph in one pass without per-reference lookups', () => {
    const entities = Array.from({ length: 300 }, (_, index) =>
      entity({ type: 'work', id: `w${index}` }),
    );
    const assertions = Array.from({ length: 300 }, (_, index) =>
      assertion({ fromId: `w${index}`, toId: 'missing' }),
    );

    const issues = findRelationshipIssues(snapshot(entities, assertions));

    expect(issues).toHaveLength(300);
    expect(issues.every((issue) => issue.kind === 'missingTarget')).toBe(true);
  });
});

describe('filterRelationshipIssues', () => {
  const issues = findRelationshipIssues(
    snapshot(
      [
        entity({ type: 'work', id: 'w1', label: 'Northwind' }),
        entity({ type: 'note', id: 'n1', label: 'Cache postmortem' }),
        entity({ type: 'blueprint', id: 'b2', status: 'archived' }),
      ],
      [
        assertion({ fromId: 'w1', toId: 'gone' }),
        assertion({ fromType: 'note', fromId: 'n1', toId: 'b2' }),
      ],
    ),
  );

  it('filters by collection', () => {
    expect(filterRelationshipIssues(issues, { collection: 'note' })).toHaveLength(1);
    expect(filterRelationshipIssues(issues, { collection: 'work' })).toHaveLength(1);
  });

  it('filters by severity', () => {
    expect(filterRelationshipIssues(issues, { severity: 'critical' })).toHaveLength(1);
    expect(filterRelationshipIssues(issues, { severity: 'warning' })).toHaveLength(1);
  });

  it('filters by relationship kind', () => {
    expect(
      filterRelationshipIssues(issues, { relationship: 'artifactUsesBlueprint' }),
    ).toHaveLength(2);
    expect(filterRelationshipIssues(issues, { relationship: 'nope' })).toHaveLength(0);
  });

  it('searches source and target titles', () => {
    expect(filterRelationshipIssues(issues, { query: 'northwind' })).toHaveLength(1);
    expect(filterRelationshipIssues(issues, { query: 'postmortem' })).toHaveLength(1);
    expect(filterRelationshipIssues(issues, { query: 'nothing' })).toHaveLength(0);
  });

  it('combines filters', () => {
    expect(
      filterRelationshipIssues(issues, { collection: 'work', severity: 'warning' }),
    ).toHaveLength(0);
  });
});

describe('summarizeRelationshipIssues', () => {
  it('aggregates counts and the facets available to filter by', () => {
    const issues = findRelationshipIssues(
      snapshot(
        [
          entity({ type: 'work', id: 'w1' }),
          entity({ type: 'blueprint', id: 'b1', status: 'draft' }),
        ],
        [assertion({ toId: 'gone' }), assertion()],
      ),
    );

    const summary = summarizeRelationshipIssues(issues);

    expect(summary.total).toBe(2);
    expect(summary.critical).toBe(1);
    expect(summary.info).toBe(1);
    expect(summary.collections).toEqual(['work']);
    expect(summary.relationships).toEqual(['artifactUsesBlueprint']);
  });

  it('reports an entirely healthy graph as zero without inventing facets', () => {
    const summary = summarizeRelationshipIssues([]);
    expect(summary).toEqual({
      total: 0,
      critical: 0,
      warning: 0,
      info: 0,
      collections: [],
      relationships: [],
    });
  });
});
