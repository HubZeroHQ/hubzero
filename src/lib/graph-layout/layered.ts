import type {
  GraphLayoutEdgeInput,
  GraphLayoutInput,
  GraphLayoutNodeInput,
  LayoutEdge,
  LayoutNode,
  LayoutPoint,
  LayoutResult,
} from './types';

export interface LayeredLayoutOptions {
  columnGap?: number;
  rowGap?: number;
  componentGap?: number;
  paddingX?: number;
  paddingY?: number;
  minimumWidth?: number;
  targetExtension?: number;
}

const DEFAULTS: Required<LayeredLayoutOptions> = {
  columnGap: 32,
  rowGap: 16,
  componentGap: 48,
  paddingX: 0,
  paddingY: 0,
  minimumWidth: 0,
  targetExtension: 0,
};

/** Deterministic, non-simulated layout for small prepared relationship graphs. */
export function layoutGraph<Entity, Relationship>(
  input: GraphLayoutInput<Entity, Relationship>,
  options: LayeredLayoutOptions = {},
): LayoutResult<Entity, Relationship> {
  const settings = { ...DEFAULTS, ...options };
  const nodes = [...input.nodes].sort(compareOrdered);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const edges = [...input.edges]
    .filter((edge) => nodeById.has(edge.source) && nodeById.has(edge.target))
    .sort(compareOrdered);

  if (!nodes.length) return freezeResult([], [], 0, 0);

  const adjacency = new Map<string, string[]>();
  for (const node of nodes) adjacency.set(node.id, []);
  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    adjacency.get(edge.target)?.push(edge.source);
  }
  for (const adjacent of adjacency.values()) adjacent.sort((a, b) => compareNodes(a, b, nodeById));

  const components = findComponents(nodes, adjacency);
  const positioned: LayoutNode<Entity>[] = [];
  let componentY = settings.paddingY;
  let contentWidth = 0;

  for (const component of components) {
    const root = component.includes(input.rootId ?? '') ? input.rootId! : component[0]!;
    const layers = buildLayers(component, root, adjacency, nodeById);
    const layerWidths = layers.map((layer) =>
      Math.max(...layer.map((id) => nodeById.get(id)!.width)),
    );
    const layerHeights = layers.map(
      (layer) =>
        layer.reduce((sum, id) => sum + nodeById.get(id)!.height, 0) +
        Math.max(0, layer.length - 1) * settings.rowGap,
    );
    const componentHeight = Math.max(...layerHeights);
    let layerX = settings.paddingX;

    layers.forEach((layer, layerIndex) => {
      let nodeY = componentY + (componentHeight - layerHeights[layerIndex]!) / 2;
      for (const id of layer) {
        const node = nodeById.get(id)!;
        positioned.push(Object.freeze({ ...node, x: layerX, y: nodeY }));
        nodeY += node.height + settings.rowGap;
      }
      layerX += layerWidths[layerIndex]! + settings.columnGap;
    });

    contentWidth = Math.max(contentWidth, layerX - settings.columnGap + settings.paddingX);
    componentY += componentHeight + settings.componentGap;
  }

  const positionedById = new Map(positioned.map((node) => [node.id, node]));
  const routed = edges.map((edge) => routeEdge(edge, positionedById, settings.targetExtension));
  const height = componentY - settings.componentGap + settings.paddingY;
  return freezeResult(positioned, routed, Math.max(contentWidth, settings.minimumWidth), height);
}

function findComponents<Entity>(
  nodes: readonly GraphLayoutNodeInput<Entity>[],
  adjacency: ReadonlyMap<string, readonly string[]>,
): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];
  for (const node of nodes) {
    if (visited.has(node.id)) continue;
    const component: string[] = [];
    const queue = [node.id];
    visited.add(node.id);
    while (queue.length) {
      const id = queue.shift()!;
      component.push(id);
      for (const adjacent of adjacency.get(id) ?? []) {
        if (visited.has(adjacent)) continue;
        visited.add(adjacent);
        queue.push(adjacent);
      }
    }
    components.push(component);
  }
  return components;
}

function buildLayers<Entity>(
  component: readonly string[],
  root: string,
  adjacency: ReadonlyMap<string, readonly string[]>,
  nodes: ReadonlyMap<string, GraphLayoutNodeInput<Entity>>,
): string[][] {
  const depth = new Map([[root, 0]]);
  const queue = [root];
  while (queue.length) {
    const id = queue.shift()!;
    for (const adjacent of adjacency.get(id) ?? []) {
      if (depth.has(adjacent)) continue;
      depth.set(adjacent, depth.get(id)! + 1);
      queue.push(adjacent);
    }
  }
  return [...new Set(component.map((id) => depth.get(id) ?? 0))]
    .sort((a, b) => a - b)
    .map((level) =>
      component.filter((id) => depth.get(id) === level).sort((a, b) => compareNodes(a, b, nodes)),
    );
}

function routeEdge<Relationship, Entity>(
  edge: GraphLayoutEdgeInput<Relationship>,
  nodes: ReadonlyMap<string, LayoutNode<Entity>>,
  targetExtension: number,
): LayoutEdge<Relationship> {
  const source = nodes.get(edge.source)!;
  const target = nodes.get(edge.target)!;
  const sourcePoint = { x: source.x, y: source.y + source.height / 2 };
  const targetPoint = { x: target.x + targetExtension, y: target.y + target.height / 2 };
  const elbowX = target.x;
  const points: LayoutPoint[] = [
    sourcePoint,
    { x: elbowX, y: sourcePoint.y },
    { x: elbowX, y: targetPoint.y },
    targetPoint,
  ];
  return Object.freeze({
    ...edge,
    points: Object.freeze(points.map((point) => Object.freeze(point))),
  });
}

function compareOrdered<T extends { id: string; order?: number }>(left: T, right: T): number {
  return (left.order ?? 0) - (right.order ?? 0) || left.id.localeCompare(right.id);
}

function compareNodes<Entity>(
  left: string,
  right: string,
  nodes: ReadonlyMap<string, GraphLayoutNodeInput<Entity>>,
): number {
  return compareOrdered(nodes.get(left)!, nodes.get(right)!);
}

function freezeResult<Entity, Relationship>(
  nodes: readonly LayoutNode<Entity>[],
  edges: readonly LayoutEdge<Relationship>[],
  width: number,
  height: number,
): LayoutResult<Entity, Relationship> {
  return Object.freeze({
    nodes: Object.freeze([...nodes]),
    edges: Object.freeze([...edges]),
    bounds: Object.freeze({ x: 0, y: 0, width, height }),
    metadata: Object.freeze({ orientation: 'horizontal' as const, algorithm: 'layered' as const }),
  });
}
