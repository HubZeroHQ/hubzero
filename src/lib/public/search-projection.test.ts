import { describe, expect, it } from 'vitest';
import { createGraphQuery } from '@/lib/entity-graph';
import type { PublicEntityLink, PublicWorkSummary } from './domain';
import { normalizePublicEntityGraph, type RelationshipAssertion } from './relationships';
import { projectSearchEntry } from './search-projection';

describe('projectSearchEntry', () => {
  it('enriches an entity with its canonical destination and direct relationships', () => {
    const summary: PublicWorkSummary = {
      type: 'work',
      title: 'Atlas',
      slug: 'atlas',
      url: '/work/atlas',
      referenceId: 'WRK-001',
      summary: 'A delivery system.',
      clientType: 'Product company',
      timeline: 'Six weeks',
      hubZeroRole: 'Engineering',
      categories: [],
      technologies: [{ kind: 'technology', label: 'TypeScript', slug: 'typescript' }],
    };
    const nodes = [
      { ref: { type: 'work' as const, id: 'work-1' }, label: 'Atlas', data: undefined },
      { ref: { type: 'teamMember' as const, id: 'person-1' }, label: 'Ada', data: undefined },
    ];
    const assertion: RelationshipAssertion = {
      kind: 'teamContributedToEntry',
      fromType: 'work',
      fromId: 'work-1',
      toType: 'teamMember',
      toId: 'person-1',
    };
    const query = createGraphQuery(normalizePublicEntityGraph(nodes, [assertion]));
    const destinations = new Map<string, PublicEntityLink>([
      ['work:work-1', summary],
      [
        'teamMember:person-1',
        { type: 'teamMember', title: 'Ada', url: '/about', role: 'Engineer' },
      ],
    ]);

    const result = projectSearchEntry(query, destinations, { type: 'work', id: 'work-1' }, summary);

    expect(result.url).toBe('/work/atlas');
    expect(result.taxonomy).toEqual(['TypeScript']);
    expect(result.relationships).toEqual([
      expect.objectContaining({
        label: 'Contributor',
        target: expect.objectContaining({ title: 'Ada' }),
      }),
    ]);
  });
});
