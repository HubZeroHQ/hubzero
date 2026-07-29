import { describe, expect, it } from 'vitest';
import { layoutGraph } from './layered';

const nodes = [
  { id: 'root', entity: 'Root', width: 100, height: 40, order: 0 },
  { id: 'alpha', entity: 'Alpha', width: 80, height: 30, order: 1 },
  { id: 'beta', entity: 'Beta', width: 80, height: 30, order: 2 },
];
const edges = [
  { id: 'root-alpha', source: 'root', target: 'alpha', relationship: 'A', order: 0 },
  { id: 'root-beta', source: 'root', target: 'beta', relationship: 'B', order: 1 },
];

describe('layoutGraph', () => {
  it('returns identical immutable output for identical input', () => {
    const first = layoutGraph({ nodes, edges, rootId: 'root' });
    const second = layoutGraph({ nodes, edges, rootId: 'root' });

    expect(first).toEqual(second);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.nodes)).toBe(true);
    expect(Object.isFrozen(first.edges[0]?.points)).toBe(true);
  });

  it('uses explicit order rather than input array order', () => {
    const forward = layoutGraph({ nodes, edges, rootId: 'root' });
    const reversed = layoutGraph({
      nodes: [...nodes].reverse(),
      edges: [...edges].reverse(),
      rootId: 'root',
    });

    expect(reversed).toEqual(forward);
    expect(forward.nodes.map(({ id }) => id)).toEqual(['root', 'alpha', 'beta']);
    expect(forward.nodes.find(({ id }) => id === 'alpha')?.y).toBeLessThan(
      forward.nodes.find(({ id }) => id === 'beta')?.y ?? 0,
    );
  });

  it('places disconnected subgraphs without collisions', () => {
    const result = layoutGraph({
      nodes: [
        ...nodes,
        { id: 'standalone', entity: 'Standalone', width: 120, height: 50, order: 3 },
      ],
      edges,
      rootId: 'root',
    });
    const connectedBottom = Math.max(
      ...result.nodes.filter(({ id }) => id !== 'standalone').map((node) => node.y + node.height),
    );
    const standalone = result.nodes.find(({ id }) => id === 'standalone')!;

    expect(standalone.y).toBeGreaterThan(connectedBottom);
    expect(result.bounds.height).toBeGreaterThanOrEqual(standalone.y + standalone.height);
  });

  it('lays out a single node', () => {
    const result = layoutGraph({ nodes: [nodes[0]!], edges: [], rootId: 'root' });

    expect(result.nodes).toEqual([
      expect.objectContaining({ id: 'root', x: 0, y: 0, width: 100, height: 40 }),
    ]);
    expect(result.edges).toEqual([]);
    expect(result.bounds).toEqual({ x: 0, y: 0, width: 100, height: 40 });
  });

  it('returns zero bounds for an empty graph', () => {
    expect(layoutGraph({ nodes: [], edges: [] }, { minimumWidth: 440 })).toEqual({
      nodes: [],
      edges: [],
      bounds: { x: 0, y: 0, width: 0, height: 0 },
      metadata: { orientation: 'horizontal', algorithm: 'layered' },
    });
  });
});
