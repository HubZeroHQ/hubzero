import {
  entityKey,
  sameEntity,
  type EntityGraph,
  type EntityRef,
  type EntitySummary,
  type Relationship,
} from './types';

export interface Connection<Entity extends EntitySummary, Kind extends string, Data> {
  entity: Entity | undefined;
  relationship: Relationship<Kind, Data, Entity['ref']['type']>;
  direction: 'inbound' | 'outbound';
}

export interface GraphQuery<Entity extends EntitySummary, Kind extends string, Data> {
  get(ref: EntityRef): Entity | undefined;
  outbound(ref: EntityRef): readonly Connection<Entity, Kind, Data>[];
  inbound(ref: EntityRef): readonly Connection<Entity, Kind, Data>[];
  connected(ref: EntityRef): readonly Connection<Entity, Kind, Data>[];
  entitiesOfType(type: Entity['ref']['type']): readonly Entity[];
  relationshipsOfKind(kind: Kind): readonly Relationship<Kind, Data, Entity['ref']['type']>[];
  relationships(): readonly Relationship<Kind, Data, Entity['ref']['type']>[];
  hasRelationship(from: EntityRef, to: EntityRef, kind: Kind): boolean;
}

/**
 * The graph's only traversal boundary. It builds immutable indexes once and
 * preserves dangling edges so diagnostics can report them rather than losing
 * facts during traversal.
 */
export function createGraphQuery<Entity extends EntitySummary, Kind extends string, Data>(
  graph: EntityGraph<Entity, Kind, Data>,
): GraphQuery<Entity, Kind, Data> {
  const entities = new Map(graph.entities.map((entity) => [entityKey(entity.ref), entity]));
  const byType = new Map<string, Entity[]>();
  const outbound = new Map<string, Relationship<Kind, Data, Entity['ref']['type']>[]>();
  const inbound = new Map<string, Relationship<Kind, Data, Entity['ref']['type']>[]>();
  const byKind = new Map<Kind, Relationship<Kind, Data, Entity['ref']['type']>[]>();
  const allRelationships = Object.freeze([...graph.relationships]);

  for (const entity of graph.entities) {
    const list = byType.get(entity.ref.type) ?? [];
    list.push(entity);
    byType.set(entity.ref.type, list);
  }
  for (const relationship of allRelationships) {
    add(outbound, entityKey(relationship.from), relationship);
    add(inbound, entityKey(relationship.to), relationship);
    add(byKind, relationship.kind, relationship);
  }

  const connections = (
    ref: EntityRef,
    direction: 'inbound' | 'outbound',
  ): readonly Connection<Entity, Kind, Data>[] => {
    const relationships = (direction === 'outbound' ? outbound : inbound).get(entityKey(ref)) ?? [];
    return relationships.map((relationship) => {
      const adjacent = direction === 'outbound' ? relationship.to : relationship.from;
      return { entity: entities.get(entityKey(adjacent)), relationship, direction };
    });
  };

  const query: GraphQuery<Entity, Kind, Data> = {
    get: (ref) => entities.get(entityKey(ref)),
    outbound: (ref) => connections(ref, 'outbound'),
    inbound: (ref) => connections(ref, 'inbound'),
    connected: (ref) => [...connections(ref, 'outbound'), ...connections(ref, 'inbound')],
    entitiesOfType: (type) => byType.get(type) ?? [],
    relationshipsOfKind: (kind) => byKind.get(kind) ?? [],
    relationships: () => allRelationships,
    hasRelationship: (from, to, kind) =>
      (outbound.get(entityKey(from)) ?? []).some(
        (relationship) => relationship.kind === kind && sameEntity(relationship.to, to),
      ),
  };
  return Object.freeze(query);
}

function add<Key, Value>(map: Map<Key, Value[]>, key: Key, value: Value): void {
  const values = map.get(key) ?? [];
  values.push(value);
  map.set(key, values);
}
