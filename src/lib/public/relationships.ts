import type {
  PublicEntityLink,
  PublicEntityType,
  PublicRelationship,
  PublicRelationshipKind,
} from './domain';

export interface RelationshipAssertion {
  kind: Exclude<PublicRelationshipKind, 'noteAuthoredBy' | 'teamHasProfile'>;
  fromType: PublicEntityType;
  fromId: string;
  toType: PublicEntityType;
  toId: string;
  /** Blueprint causality remains conservative until Studio stores the intended meaning. */
  blueprintMeaning?: 'builtOn' | 'generalizedAs';
}

export interface NormalizedRelationship extends RelationshipAssertion {
  key: string;
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

/** Deduplicates union-style edges and drops every ambiguous exclusive Lab/Build lineage edge. */
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
    if (lineage.some((other) => other.fromId === edge.fromId && other.toId !== edge.toId)) {
      conflictingLabs.add(edge.fromId);
    }
    if (lineage.some((other) => other.toId === edge.toId && other.fromId !== edge.fromId)) {
      conflictingBuilds.add(edge.toId);
    }
  }

  return values.filter(
    (edge) =>
      edge.kind !== 'labGraduatedToBuild' ||
      (!conflictingLabs.has(edge.fromId) && !conflictingBuilds.has(edge.toId)),
  );
}

export function relationshipLabel(
  edge: RelationshipAssertion,
  sourceType: PublicEntityType,
  sourceId: string,
): string {
  const forward = edge.fromType === sourceType && edge.fromId === sourceId;
  switch (edge.kind) {
    case 'labGraduatedToBuild':
      return forward ? 'Graduated into' : 'Originated in';
    case 'buildAppliedInWork':
      return forward ? 'Applied in client work' : 'Informed by';
    case 'workRelatedLab':
      return forward ? 'Related investigation' : 'Related client work';
    case 'profileContributedToEntry':
      return forward ? 'Engineering contributor' : 'Contributed to';
    case 'artifactUsesBlueprint':
      if (!forward) return 'Proven in';
      if (edge.blueprintMeaning === 'builtOn') return 'Built on';
      if (edge.blueprintMeaning === 'generalizedAs') return 'Generalised as';
      return 'Blueprint';
    case 'labRelatedBuild':
      return forward ? 'Related Build' : 'Related Lab';
    case 'labRelatedBlueprint':
      return forward ? 'Related Blueprint' : 'Explored in';
    case 'noteDiscussesArtifact':
      return forward ? 'Discusses' : 'Engineering notes';
    case 'serviceProvenBy':
      return 'Proven by';
    case 'profileFeaturesEvidence':
      return edge.toType === 'note'
        ? 'Authored notes'
        : edge.toType === 'lab'
          ? 'Current exploration'
          : 'Selected work';
  }
}

export async function resolvePublicRelationships(
  source: { type: PublicEntityType; id: string },
  assertions: readonly RelationshipAssertion[],
  resolveLink: (type: PublicEntityType, id: string) => Promise<PublicEntityLink | null>,
): Promise<PublicRelationship[]> {
  const relevant = normalizeRelationshipAssertions(assertions).filter(
    (edge) =>
      (edge.fromType === source.type && edge.fromId === source.id) ||
      (edge.toType === source.type && edge.toId === source.id),
  );

  const resolved = await Promise.all(
    relevant.map(async (edge): Promise<PublicRelationship | null> => {
      const forward = edge.fromType === source.type && edge.fromId === source.id;
      if (
        !forward &&
        (edge.kind === 'serviceProvenBy' || edge.kind === 'profileFeaturesEvidence')
      ) {
        return null;
      }
      const target = await resolveLink(
        forward ? edge.toType : edge.fromType,
        forward ? edge.toId : edge.fromId,
      );
      if (!target) return null;
      return { kind: edge.kind, label: relationshipLabel(edge, source.type, source.id), target };
    }),
  );

  return resolved.filter(
    (relationship): relationship is PublicRelationship => relationship !== null,
  );
}
