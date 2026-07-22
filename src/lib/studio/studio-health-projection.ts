import type { EntityRef, EntitySummary, GraphQuery, Relationship } from '@/lib/entity-graph';

export interface StudioHealthProjection<Kind extends string, Data> {
  danglingRelationships: readonly Relationship<Kind, Data>[];
  orphanedEntities: readonly EntityRef[];
  missingContributorLinks: readonly EntityRef[];
  unsupportedRelationshipKinds: readonly string[];
  duplicateSemanticRelationships: readonly Relationship<Kind, Data>[];
  invalidPublicDestinations: readonly EntityRef[];
}

export function projectStudioHealth<Entity extends EntitySummary, Kind extends string, Data>(
  query: GraphQuery<Entity, Kind, Data>,
  options: {
    entityTypes: readonly Entity['ref']['type'][];
    supportedKinds: readonly Kind[];
    contributorRequiredTypes: readonly Entity['ref']['type'][];
    hasPublicDestination: (ref: EntityRef) => boolean;
  },
): StudioHealthProjection<Kind, Data> {
  const relationships = query.relationships();
  const supported = new Set<string>(options.supportedKinds);
  const seen = new Set<string>();
  const duplicateIds = new Set<string>();
  for (const relationship of relationships) {
    const key = `${relationship.from.type}:${relationship.from.id}|${relationship.kind}|${relationship.to.type}:${relationship.to.id}`;
    if (seen.has(key)) duplicateIds.add(relationship.id);
    seen.add(key);
  }
  const entities = options.entityTypes.flatMap((type) => query.entitiesOfType(type));
  return {
    danglingRelationships: relationships.filter(
      ({ from, to }) => !query.get(from) || !query.get(to),
    ),
    orphanedEntities: entities
      .filter((entity) => query.connected(entity.ref).length === 0)
      .map((entity) => entity.ref),
    missingContributorLinks: entities
      .filter((entity) => options.contributorRequiredTypes.includes(entity.ref.type))
      .filter(
        (entity) =>
          !query
            .outbound(entity.ref)
            .some(({ relationship }) => relationship.kind === 'contributed_to'),
      )
      .map((entity) => entity.ref),
    unsupportedRelationshipKinds: [
      ...new Set(relationships.map(({ kind }) => kind).filter((kind) => !supported.has(kind))),
    ],
    duplicateSemanticRelationships: relationships.filter(({ id }) => duplicateIds.has(id)),
    invalidPublicDestinations: entities
      .filter((entity) => !options.hasPublicDestination(entity.ref))
      .map((entity) => entity.ref),
  };
}
