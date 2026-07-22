import type { GraphQuery, HubZeroRelationshipKind, EntitySummary } from '@/lib/entity-graph';
import type {
  PublicEntityLink,
  PublicEntityType,
  PublicRelationship,
  PublicRelationshipKind,
} from './domain';
import type { PublicRelationshipData } from './relationships';

export type PublicEvidenceNode = EntitySummary<PublicEntityType>;

export interface EvidenceProjection {
  subject: PublicEntityLink;
  relationships: readonly PublicRelationship[];
  groups: readonly {
    type: PublicEntityType;
    relationships: readonly PublicRelationship[];
  }[];
  disclosure: { total: number; visible: number; hidden: number };
}

type PublicGraphQuery = GraphQuery<
  PublicEvidenceNode,
  HubZeroRelationshipKind,
  PublicRelationshipData
>;

export function projectEvidence(
  query: PublicGraphQuery,
  destinations: ReadonlyMap<string, PublicEntityLink>,
  subjectRef: { type: PublicEntityType; id: string },
  aliases: readonly { type: PublicEntityType; id: string }[] = [],
): EvidenceProjection | null {
  const subject = query.get(subjectRef);
  const subjectDestination = destinations.get(refKey(subjectRef));
  if (!subject || !subjectDestination) return null;
  const refs = [subjectRef, ...aliases];
  const subjectKeys = new Set(refs.map(refKey));
  const seen = new Set<string>();
  const prepared = refs
    .flatMap((ref) => query.connected(ref))
    .filter(({ relationship }) => {
      if (seen.has(relationship.id)) return false;
      seen.add(relationship.id);
      return true;
    })
    .flatMap(({ relationship }) => {
      const forward = subjectKeys.has(refKey(relationship.from));
      if (!forward && ['proven_by', 'features'].includes(relationship.kind)) return [];
      const target = query.get(forward ? relationship.to : relationship.from);
      if (!target) return [];
      const destination = destinations.get(refKey(target.ref));
      if (!destination) return [];
      return [
        {
          relationship: {
            kind: relationship.data.assertionKind as PublicRelationshipKind,
            label: labelFor(relationship.data, forward, relationship.to.type),
            target: destination,
          },
          directionOrder: forward ? 0 : 1,
          order: relationship.data.order,
        },
      ];
    })
    .sort((left, right) => left.directionOrder - right.directionOrder || left.order - right.order);
  const relationships = prepared.map(({ relationship }) => relationship);
  const groups = [...new Set(relationships.map(({ target }) => target.type))].map((type) => ({
    type,
    relationships: relationships.filter(({ target }) => target.type === type),
  }));
  return {
    subject: subjectDestination,
    relationships,
    groups,
    disclosure: {
      total: seen.size,
      visible: relationships.length,
      hidden: seen.size - relationships.length,
    },
  };
}

function refKey(ref: { type: string; id: string }): string {
  return `${ref.type}:${ref.id}`;
}

function labelFor(
  data: PublicRelationshipData,
  forward: boolean,
  targetType: PublicEntityType,
): string {
  switch (data.assertionKind) {
    case 'labGraduatedToBuild':
      return forward ? 'Graduated into' : 'Originated in';
    case 'buildAppliedInWork':
      return forward ? 'Applied in client work' : 'Informed by';
    case 'workRelatedLab':
      return forward ? 'Related investigation' : 'Related client work';
    case 'teamContributedToEntry':
      return forward ? 'Contributor' : 'Contributed to';
    case 'artifactUsesBlueprint':
      if (!forward) return 'Proven in';
      if (data.blueprintMeaning === 'builtOn') return 'Built on';
      if (data.blueprintMeaning === 'generalizedAs') return 'Generalised as';
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
      return targetType === 'note'
        ? 'Authored notes'
        : targetType === 'lab'
          ? 'Current exploration'
          : 'Selected work';
  }
}
