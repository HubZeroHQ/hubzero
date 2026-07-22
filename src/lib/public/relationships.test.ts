import { describe, expect, it } from 'vitest';
import {
  normalizePublicEntityGraph,
  normalizeRelationshipAssertions,
  type RelationshipAssertion,
} from './relationships';

const workBuild: RelationshipAssertion = {
  kind: 'buildAppliedInWork',
  fromType: 'build',
  fromId: 'build-1',
  toType: 'work',
  toId: 'work-1',
};

describe('public relationship normalization', () => {
  it('normalizes persisted semantics and typed domain data', () => {
    const graph = normalizePublicEntityGraph(
      [
        { ref: { type: 'work' as const, id: 'work-1' }, label: 'Work', data: undefined },
        {
          ref: { type: 'blueprint' as const, id: 'blueprint-1' },
          label: 'Blueprint',
          data: undefined,
        },
      ],
      [
        {
          kind: 'artifactUsesBlueprint',
          fromType: 'work',
          fromId: 'work-1',
          toType: 'blueprint',
          toId: 'blueprint-1',
          blueprintMeaning: 'generalizedAs',
        },
      ],
    );
    expect(graph.relationships).toEqual([
      expect.objectContaining({
        kind: 'uses',
        data: {
          assertionKind: 'artifactUsesBlueprint',
          order: 0,
          blueprintMeaning: 'generalizedAs',
        },
      }),
    ]);
  });

  it('deduplicates dual-stored assertions and keeps one-sided assertions', () => {
    expect(normalizeRelationshipAssertions([workBuild, workBuild])).toHaveLength(1);
    expect(normalizeRelationshipAssertions([workBuild])).toHaveLength(1);
  });

  it('omits conflicting exclusive Lab/Build lineage in either direction', () => {
    expect(
      normalizeRelationshipAssertions([
        {
          kind: 'labGraduatedToBuild',
          fromType: 'lab',
          fromId: 'lab-1',
          toType: 'build',
          toId: 'build-1',
        },
        {
          kind: 'labGraduatedToBuild',
          fromType: 'lab',
          fromId: 'lab-1',
          toType: 'build',
          toId: 'build-2',
        },
      ]),
    ).toEqual([]);
    expect(
      normalizeRelationshipAssertions([
        {
          kind: 'labGraduatedToBuild',
          fromType: 'lab',
          fromId: 'lab-1',
          toType: 'build',
          toId: 'build-1',
        },
        {
          kind: 'labGraduatedToBuild',
          fromType: 'lab',
          fromId: 'lab-2',
          toType: 'build',
          toId: 'build-1',
        },
      ]),
    ).toEqual([]);
  });
});
