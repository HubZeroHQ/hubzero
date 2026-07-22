/**
 * A stable identity for a node in an entity graph. It deliberately does not
 * carry a slug, URL, visibility, or presentation data: those belong to the
 * adapters and projections that consume the graph.
 */
export interface EntityRef<Type extends string = string> {
  type: Type;
  id: string;
}

/**
 * The smallest useful graph node. `data` is explicitly typed by the owning
 * product rather than accepting an unstructured metadata bag.
 */
export interface EntitySummary<Type extends string = string, Data = undefined> {
  ref: EntityRef<Type>;
  label: string;
  data: Data;
}

/**
 * A directed relationship stored once. Inverse views are derived by
 * GraphQuery; callers must never persist a second reciprocal edge.
 */
export interface Relationship<
  Kind extends string = string,
  Data = undefined,
  Type extends string = string,
> {
  id: string;
  from: EntityRef<Type>;
  to: EntityRef<Type>;
  kind: Kind;
  data: Data;
}

/**
 * Immutable facts only. Traversal, visibility, routes, layout, and rendering
 * belong to subsequent layers.
 */
export interface EntityGraph<
  Entity extends EntitySummary<string, unknown> = EntitySummary<string, unknown>,
  Kind extends string = string,
  RelationshipData = undefined,
> {
  entities: readonly Entity[];
  relationships: readonly Relationship<Kind, RelationshipData, Entity['ref']['type']>[];
}

/** A collision-safe, stable key for maps and sets keyed by entity identity. */
export function entityKey(ref: EntityRef): string {
  return `${encodeURIComponent(ref.type)}:${encodeURIComponent(ref.id)}`;
}

/** Compare references by their canonical compound identity. */
export function sameEntity(left: EntityRef, right: EntityRef): boolean {
  return left.type === right.type && left.id === right.id;
}
