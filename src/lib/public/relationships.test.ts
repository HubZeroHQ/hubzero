import { describe, expect, it } from 'vitest';
import {
  normalizeRelationshipAssertions,
  relationshipLabel,
  resolvePublicRelationships,
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
  it('deduplicates matching dual-stored assertions', () => {
    expect(normalizeRelationshipAssertions([workBuild, workBuild])).toHaveLength(1);
  });

  it('keeps one-sided many-to-many assertions', () => {
    expect(normalizeRelationshipAssertions([workBuild])).toHaveLength(1);
  });

  it('omits conflicting exclusive Lab/Build lineage', () => {
    const edges: RelationshipAssertion[] = [
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
    ];
    expect(normalizeRelationshipAssertions(edges)).toEqual([]);
  });

  it('uses directional and conservative labels', () => {
    expect(relationshipLabel(workBuild, 'build', 'build-1')).toBe('Applied in client work');
    expect(relationshipLabel(workBuild, 'work', 'work-1')).toBe('Informed by');
    const blueprint: RelationshipAssertion = {
      kind: 'artifactUsesBlueprint',
      fromType: 'work',
      fromId: 'work-1',
      toType: 'blueprint',
      toId: 'blueprint-1',
    };
    expect(relationshipLabel(blueprint, 'work', 'work-1')).toBe('Blueprint');
  });

  it('omits hidden, archived, missing, or otherwise unresolvable targets without a count', async () => {
    const relations = await resolvePublicRelationships(
      { type: 'work', id: 'work-1' },
      [workBuild],
      async () => null,
    );
    expect(relations).toEqual([]);
  });
});
