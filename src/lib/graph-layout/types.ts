export interface GraphLayoutNodeInput<Entity> {
  id: string;
  entity: Entity;
  width: number;
  height: number;
  order?: number;
}

export interface GraphLayoutEdgeInput<Relationship> {
  id: string;
  source: string;
  target: string;
  relationship: Relationship;
  order?: number;
}

export interface GraphLayoutInput<Entity, Relationship> {
  nodes: readonly GraphLayoutNodeInput<Entity>[];
  edges: readonly GraphLayoutEdgeInput<Relationship>[];
  rootId?: string;
}

export interface LayoutNode<Entity> extends GraphLayoutNodeInput<Entity> {
  x: number;
  y: number;
}

export interface LayoutPoint {
  x: number;
  y: number;
}

export interface LayoutEdge<Relationship> extends GraphLayoutEdgeInput<Relationship> {
  points: readonly LayoutPoint[];
}

export interface LayoutResult<Entity, Relationship> {
  nodes: readonly LayoutNode<Entity>[];
  edges: readonly LayoutEdge<Relationship>[];
  bounds: Readonly<{ x: number; y: number; width: number; height: number }>;
  metadata: Readonly<{ orientation: 'horizontal'; algorithm: 'layered' }>;
}
