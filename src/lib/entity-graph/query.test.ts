import { describe, expect, it } from 'vitest';
import { createGraphQuery } from './query';
import type { EntityGraph } from './types';

type Node = { ref: { type: 'note' | 'profile'; id: string }; label: string; data: undefined };
type Kind = 'contributed_to' | 'documents';

const graph: EntityGraph<Node, Kind> = {
  entities: [
    { ref: { type: 'note', id: 'n1' }, label: 'Ownership first', data: undefined },
    { ref: { type: 'profile', id: 'p1' }, label: 'Ari Rao', data: undefined },
  ],
  relationships: [
    {
      id: 'r1',
      from: { type: 'profile', id: 'p1' },
      to: { type: 'note', id: 'n1' },
      kind: 'contributed_to',
      data: undefined,
    },
    {
      id: 'r2',
      from: { type: 'note', id: 'n1' },
      to: { type: 'note', id: 'missing' },
      kind: 'documents',
      data: undefined,
    },
  ],
};

describe('GraphQuery', () => {
  it('centralizes directional and type/kind traversal', () => {
    const query = createGraphQuery(graph);
    expect(query.inbound({ type: 'note', id: 'n1' })[0]?.entity?.label).toBe('Ari Rao');
    expect(query.outbound({ type: 'profile', id: 'p1' })[0]?.relationship.kind).toBe(
      'contributed_to',
    );
    expect(query.entitiesOfType('note')).toHaveLength(1);
    expect(query.relationshipsOfKind('contributed_to')).toHaveLength(1);
    expect(query.relationships()).toHaveLength(2);
    expect(Object.isFrozen(query)).toBe(true);
    expect(
      query.hasRelationship(
        { type: 'profile', id: 'p1' },
        { type: 'note', id: 'n1' },
        'contributed_to',
      ),
    ).toBe(true);
  });

  it('retains dangling relationships for diagnostics', () => {
    const query = createGraphQuery(graph);
    expect(query.outbound({ type: 'note', id: 'n1' })[0]?.entity).toBeUndefined();
  });
});
