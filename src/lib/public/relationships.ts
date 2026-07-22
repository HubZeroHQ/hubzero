import type { EntityGraph, EntitySummary, HubZeroRelationshipKind } from '@/lib/entity-graph';
import type { PublicEntityType, PublicRelationshipKind } from './domain';

export interface RelationshipAssertion {
  kind: Exclude<PublicRelationshipKind, 'noteAuthoredBy' | 'teamHasProfile'>;
  fromType: PublicEntityType;
  fromId: string;
  toType: PublicEntityType;
  toId: string;
  blueprintMeaning?: 'builtOn' | 'generalizedAs';
}

export interface NormalizedRelationship extends RelationshipAssertion {
  key: string;
}

export interface PublicRelationshipData {
  assertionKind: RelationshipAssertion['kind'];
  order: number;
  blueprintMeaning?: 'builtOn' | 'generalizedAs';
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

export function normalizeRelationshipAssertions(
  assertions: readonly RelationshipAssertion[],
): NormalizedRelationship[] {
  const unique = new Map<string, NormalizedRelationship>();
  for (const assertion of assertions) {
    const key = assertionKey(assertion);
    unique.set(key, { ...assertion, key });
  }
  const values = [...unique.values()];
  const lineage = values.filter((edge) => edge.kind === 'labGraduatedToBuild');
  const conflictingLabs = new Set<string>();
  const conflictingBuilds = new Set<string>();
  for (const edge of lineage) {
    if (lineage.some((other) => other.fromId === edge.fromId && other.toId !== edge.toId))
      conflictingLabs.add(edge.fromId);
    if (lineage.some((other) => other.toId === edge.toId && other.fromId !== edge.fromId))
      conflictingBuilds.add(edge.toId);
  }
  return values.filter(
    (edge) =>
      edge.kind !== 'labGraduatedToBuild' ||
      (!conflictingLabs.has(edge.fromId) && !conflictingBuilds.has(edge.toId)),
  );
}

export function normalizePublicEntityGraph<Entity extends EntitySummary<PublicEntityType, unknown>>(
  entities: readonly Entity[],
  assertions: readonly RelationshipAssertion[],
): EntityGraph<Entity, HubZeroRelationshipKind, PublicRelationshipData> {
  return {
    entities,
    relationships: normalizeRelationshipAssertions(assertions).map((assertion, order) => ({
      id: assertion.key,
      from: { type: assertion.fromType, id: assertion.fromId },
      to: { type: assertion.toType, id: assertion.toId },
      kind: graphKind(assertion),
      data: {
        assertionKind: assertion.kind,
        order,
        ...(assertion.blueprintMeaning ? { blueprintMeaning: assertion.blueprintMeaning } : {}),
      },
    })),
  };
}

function graphKind(assertion: RelationshipAssertion): HubZeroRelationshipKind {
  switch (assertion.kind) {
    case 'teamContributedToEntry':
      return 'contributed_to';
    case 'noteDiscussesArtifact':
      return 'documents';
    case 'artifactUsesBlueprint':
      return 'uses';
    case 'labGraduatedToBuild':
      return 'graduated_into';
    case 'buildAppliedInWork':
      return 'applied_in';
    case 'workRelatedLab':
    case 'labRelatedBuild':
    case 'labRelatedBlueprint':
      return 'related_to';
    case 'serviceProvenBy':
      return 'proven_by';
    case 'profileFeaturesEvidence':
      return 'features';
  }
}
