import { describe, expect, it } from 'vitest';
import {
  HUBZERO_RELATIONSHIP_KINDS,
  entityKey,
  sameEntity,
  type EntityGraph,
  type HubZeroRelationshipKind,
} from './index';

describe('entity graph contracts', () => {
  it('keys a compound entity identity without delimiter collisions', () => {
    expect(entityKey({ type: 'note:archive', id: 'one/two' })).not.toBe(
      entityKey({ type: 'note', id: 'archive:one/two' }),
    );
  });

  it('compares entities only by type and id', () => {
    expect(sameEntity({ type: 'note', id: 'n1' }, { type: 'note', id: 'n1' })).toBe(true);
    expect(sameEntity({ type: 'note', id: 'n1' }, { type: 'build', id: 'n1' })).toBe(false);
  });

  it('keeps HubZero relationship kinds finite at the application boundary', () => {
    const kind: HubZeroRelationshipKind = 'contributed_to';
    expect(HUBZERO_RELATIONSHIP_KINDS).toContain(kind);
    expect(HUBZERO_RELATIONSHIP_KINDS).toEqual([
      'contributed_to',
      'documents',
      'uses',
      'graduated_into',
      'applied_in',
      'related_to',
      'proven_by',
      'features',
    ]);
  });

  it('keeps graph payloads typed rather than relying on a metadata bag', () => {
    type Node = {
      ref: { type: 'note'; id: string };
      label: string;
      data: { publicationDate: string };
    };
    const graph: EntityGraph<Node, 'authored', { credited: boolean }> = {
      entities: [
        {
          ref: { type: 'note', id: 'n1' },
          label: 'Ownership first',
          data: { publicationDate: '2026-01-01' },
        },
      ],
      relationships: [],
    };

    expect(graph.entities[0]?.data.publicationDate).toBe('2026-01-01');
  });
});
