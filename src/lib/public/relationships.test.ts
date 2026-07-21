import { describe, expect, it } from 'vitest';
import type { PublicEntityType } from './domain';
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

  it('omits exclusive lineage when multiple Labs claim the same Build', () => {
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
        fromId: 'lab-2',
        toType: 'build',
        toId: 'build-1',
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
    const contributor: RelationshipAssertion = {
      kind: 'teamContributedToEntry',
      fromType: 'work',
      fromId: 'work-1',
      toType: 'teamMember',
      toId: 'team-1',
    };
    expect(relationshipLabel(contributor, 'work', 'work-1')).toBe('Contributor');
    expect(relationshipLabel(contributor, 'teamMember', 'team-1')).toBe('Contributed to');
  });

  it('omits hidden, archived, missing, or otherwise unresolvable targets without a count', async () => {
    const relations = await resolvePublicRelationships(
      { type: 'work', id: 'work-1' },
      [workBuild],
      async () => null,
    );
    expect(relations).toEqual([]);
  });

  it('resolves one logical edge consistently in both directions', async () => {
    const resolveLink = async (type: PublicEntityType, id: string) => ({
      type,
      title: id,
      url: `/${type}/${id}`,
    });
    const fromBuild = await resolvePublicRelationships(
      { type: 'build', id: 'build-1' },
      [workBuild, workBuild],
      resolveLink,
    );
    const fromWork = await resolvePublicRelationships(
      { type: 'work', id: 'work-1' },
      [workBuild],
      resolveLink,
    );
    expect(fromBuild).toMatchObject([
      { kind: 'buildAppliedInWork', label: 'Applied in client work', target: { type: 'work' } },
    ]);
    expect(fromWork).toMatchObject([
      { kind: 'buildAppliedInWork', label: 'Informed by', target: { type: 'build' } },
    ]);
  });

  it('supports a Note as forward-only Service evidence', async () => {
    const edge: RelationshipAssertion = {
      kind: 'serviceProvenBy',
      fromType: 'service',
      fromId: 'service-1',
      toType: 'note',
      toId: 'note-1',
    };
    const resolveLink = async (type: PublicEntityType, id: string) => ({
      type,
      title: id,
      url: `/${type}/${id}`,
    });
    await expect(
      resolvePublicRelationships({ type: 'service', id: 'service-1' }, [edge], resolveLink),
    ).resolves.toMatchObject([
      { kind: 'serviceProvenBy', label: 'Proven by', target: { type: 'note' } },
    ]);
    await expect(
      resolvePublicRelationships({ type: 'note', id: 'note-1' }, [edge], resolveLink),
    ).resolves.toEqual([]);
  });
});
