import { describe, expect, it } from 'vitest';
import { createGraphQuery } from '@/lib/entity-graph';
import { projectEvidence } from './evidence-projection';
import { normalizePublicEntityGraph, type RelationshipAssertion } from './relationships';

const nodes = [
  { ref: { type: 'build' as const, id: 'build-1' }, label: 'Build', data: undefined },
  { ref: { type: 'work' as const, id: 'work-1' }, label: 'Work', data: undefined },
];
const destinations = new Map([
  ['build:build-1', { type: 'build' as const, title: 'Build', url: '/builds/build-1' }],
  ['work:work-1', { type: 'work' as const, title: 'Work', url: '/work/work-1' }],
]);
const assertion: RelationshipAssertion = {
  kind: 'buildAppliedInWork',
  fromType: 'build',
  fromId: 'build-1',
  toType: 'work',
  toId: 'work-1',
};

describe('EvidenceProjection', () => {
  it('prepares canonical destinations, directional labels, groups, and disclosure', () => {
    const query = createGraphQuery(normalizePublicEntityGraph(nodes, [assertion]));
    const projection = projectEvidence(query, destinations, { type: 'work', id: 'work-1' });
    expect(projection).toMatchObject({
      relationships: [{ label: 'Informed by', target: { url: '/builds/build-1' } }],
      groups: [{ type: 'build' }],
      disclosure: { total: 1, visible: 1, hidden: 0 },
    });
  });

  it('keeps unresolved edges internal and omits them publicly', () => {
    const query = createGraphQuery(normalizePublicEntityGraph(nodes.slice(0, 1), [assertion]));
    const projection = projectEvidence(
      query,
      new Map([['build:build-1', destinations.get('build:build-1')!]]),
      { type: 'build', id: 'build-1' },
    );
    expect(projection?.relationships).toEqual([]);
    expect(projection?.disclosure).toEqual({ total: 1, visible: 0, hidden: 1 });
  });
});
