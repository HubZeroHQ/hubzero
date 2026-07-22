import { describe, expect, it } from 'vitest';
import { createGraphQuery, type EntityGraph, HUBZERO_RELATIONSHIP_KINDS } from '@/lib/entity-graph';
import { projectStudioHealth } from './studio-health-projection';

describe('projectStudioHealth', () => {
  it('reports graph health without reading EntityGraph outside GraphQuery', () => {
    const graph: EntityGraph<
      { ref: { type: string; id: string }; label: string; data: undefined },
      string,
      undefined
    > = {
      entities: [
        { ref: { type: 'work', id: 'work-1' }, label: 'Work', data: undefined },
        { ref: { type: 'note', id: 'note-1' }, label: 'Note', data: undefined },
        { ref: { type: 'teamMember', id: 'person-1' }, label: 'Person', data: undefined },
      ],
      relationships: [
        {
          id: 'edge-1',
          from: { type: 'work', id: 'work-1' },
          to: { type: 'note', id: 'note-1' },
          kind: 'documents',
          data: undefined,
        },
        {
          id: 'edge-2',
          from: { type: 'work', id: 'work-1' },
          to: { type: 'note', id: 'note-1' },
          kind: 'documents',
          data: undefined,
        },
        {
          id: 'edge-3',
          from: { type: 'work', id: 'missing' },
          to: { type: 'note', id: 'note-1' },
          kind: 'unknown',
          data: undefined,
        },
      ],
    };

    const result = projectStudioHealth(createGraphQuery(graph), {
      entityTypes: ['work', 'note', 'teamMember'],
      supportedKinds: [...HUBZERO_RELATIONSHIP_KINDS],
      contributorRequiredTypes: ['work'],
      hasPublicDestination: (ref) => ref.id !== 'person-1',
    });

    expect(result.danglingRelationships.map(({ id }) => id)).toEqual(['edge-3']);
    expect(result.duplicateSemanticRelationships.map(({ id }) => id)).toEqual(['edge-2']);
    expect(result.unsupportedRelationshipKinds).toEqual(['unknown']);
    expect(result.orphanedEntities).toEqual([{ type: 'teamMember', id: 'person-1' }]);
    expect(result.missingContributorLinks).toEqual([{ type: 'work', id: 'work-1' }]);
    expect(result.invalidPublicDestinations).toEqual([{ type: 'teamMember', id: 'person-1' }]);
  });
});
