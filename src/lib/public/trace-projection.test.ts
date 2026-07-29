import { describe, expect, it } from 'vitest';
import { createGraphQuery } from '@/lib/entity-graph';
import { normalizePublicEntityGraph, type RelationshipAssertion } from './relationships';
import { projectTrace } from './trace-projection';

const nodes = [
  { ref: { type: 'lab' as const, id: 'lab-1' }, label: 'Lab', data: undefined },
  { ref: { type: 'build' as const, id: 'build-1' }, label: 'Build', data: undefined },
  { ref: { type: 'work' as const, id: 'work-1' }, label: 'Work', data: undefined },
  { ref: { type: 'lab' as const, id: 'lab-2' }, label: 'Related Lab', data: undefined },
];

const destinations = new Map([
  ['lab:lab-1', { type: 'lab' as const, title: 'Lab', url: '/labs/lab-1' }],
  ['build:build-1', { type: 'build' as const, title: 'Build', url: '/builds/build-1' }],
  ['work:work-1', { type: 'work' as const, title: 'Work', url: '/work/work-1' }],
  ['lab:lab-2', { type: 'lab' as const, title: 'Related Lab', url: '/labs/lab-2' }],
]);

const graduated: RelationshipAssertion = {
  kind: 'labGraduatedToBuild',
  fromType: 'lab',
  fromId: 'lab-1',
  toType: 'build',
  toId: 'build-1',
};
const applied: RelationshipAssertion = {
  kind: 'buildAppliedInWork',
  fromType: 'build',
  fromId: 'build-1',
  toType: 'work',
  toId: 'work-1',
};
const related: RelationshipAssertion = {
  kind: 'workRelatedLab',
  fromType: 'work',
  fromId: 'work-1',
  toType: 'lab',
  toId: 'lab-2',
};

describe('projectTrace', () => {
  it('walks the full backward chain from Work through Build to Lab by default', () => {
    const query = createGraphQuery(
      normalizePublicEntityGraph(nodes, [graduated, applied, related]),
    );
    const projection = projectTrace(query, destinations, { type: 'work', id: 'work-1' });

    expect(projection).toMatchObject({
      steps: [
        { label: 'Informed by', target: { url: '/builds/build-1' } },
        { label: 'Originated in', target: { url: '/labs/lab-1' } },
      ],
      disclosure: { total: 2, visible: 2, hidden: 0 },
    });
  });

  it('walks the same chain forward from Lab when direction is outbound', () => {
    const query = createGraphQuery(normalizePublicEntityGraph(nodes, [graduated, applied]));
    const projection = projectTrace(
      query,
      destinations,
      { type: 'lab', id: 'lab-1' },
      { direction: 'outbound' },
    );

    expect(projection).toMatchObject({
      steps: [
        { label: 'Graduated into', target: { url: '/builds/build-1' } },
        { label: 'Applied in client work', target: { url: '/work/work-1' } },
      ],
    });
  });

  it('stops when there is no further lineage edge, without treating that as truncation', () => {
    const query = createGraphQuery(normalizePublicEntityGraph(nodes, [graduated]));
    const projection = projectTrace(
      query,
      destinations,
      { type: 'lab', id: 'lab-1' },
      { direction: 'outbound' },
    );

    expect(projection?.steps).toEqual([
      expect.objectContaining({
        target: { type: 'build', title: 'Build', url: '/builds/build-1' },
      }),
    ]);
    expect(projection?.disclosure).toEqual({ total: 1, visible: 1, hidden: 0 });
  });

  it('excludes lateral related_to edges — a chain follows one causal path, not every connection', () => {
    const query = createGraphQuery(normalizePublicEntityGraph(nodes, [related]));
    const projection = projectTrace(query, destinations, { type: 'work', id: 'work-1' });

    expect(projection?.steps).toEqual([]);
  });

  it('truncates the chain and reports it in disclosure when the next hop is not publicly visible', () => {
    const query = createGraphQuery(normalizePublicEntityGraph(nodes, [graduated]));
    const hiddenDestinations = new Map([['lab:lab-1', destinations.get('lab:lab-1')!]]);
    const projection = projectTrace(
      query,
      hiddenDestinations,
      { type: 'lab', id: 'lab-1' },
      { direction: 'outbound' },
    );

    expect(projection?.steps).toEqual([]);
    expect(projection?.disclosure).toEqual({ total: 1, visible: 0, hidden: 1 });
  });

  it('respects an explicit maxHops even when a further valid edge exists', () => {
    const query = createGraphQuery(normalizePublicEntityGraph(nodes, [graduated, applied]));
    const projection = projectTrace(
      query,
      destinations,
      { type: 'lab', id: 'lab-1' },
      { direction: 'outbound', maxHops: 1 },
    );

    expect(projection?.steps).toHaveLength(1);
    expect(projection?.steps[0]?.target.url).toBe('/builds/build-1');
  });

  it('stops on a revisited entity rather than looping forever', () => {
    const cycle: RelationshipAssertion[] = [
      {
        kind: 'labGraduatedToBuild',
        fromType: 'lab',
        fromId: 'lab-1',
        toType: 'build',
        toId: 'build-1',
      },
      {
        kind: 'labRelatedBuild',
        fromType: 'build',
        fromId: 'build-1',
        toType: 'lab',
        toId: 'lab-1',
      },
    ];
    // labRelatedBuild isn't in the default kind set, so widen it to prove the
    // cycle guard itself (not the kind filter) is what stops this.
    const query = createGraphQuery(normalizePublicEntityGraph(nodes, cycle));
    const projection = projectTrace(
      query,
      destinations,
      { type: 'lab', id: 'lab-1' },
      { direction: 'outbound', kinds: ['graduated_into', 'related_to'] },
    );

    expect(projection?.steps).toHaveLength(1);
    expect(projection?.steps[0]?.target.url).toBe('/builds/build-1');
  });

  it('returns null when the subject itself is not publicly resolvable', () => {
    const query = createGraphQuery(normalizePublicEntityGraph(nodes, [graduated]));
    const projection = projectTrace(query, new Map(), { type: 'lab', id: 'lab-1' });

    expect(projection).toBeNull();
  });
});
