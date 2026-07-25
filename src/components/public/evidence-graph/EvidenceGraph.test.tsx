import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PublicRelationship } from '@/lib/public/domain';
import { relationshipKey } from '../EditorialPrimitives';
import { EvidenceGraph } from './EvidenceGraph';

const relationships: PublicRelationship[] = [
  {
    kind: 'buildAppliedInWork',
    label: 'Informed by',
    target: { type: 'build', title: 'Release review', url: '/builds/release-review' },
  },
  {
    kind: 'noteDiscussesArtifact',
    label: 'Discusses',
    target: { type: 'note', title: 'Ownership first', url: '/notes/ownership-first' },
  },
];

describe('EvidenceGraph', () => {
  it('renders nothing for a subject with no relationships, rather than an empty figure', () => {
    const markup = renderToStaticMarkup(
      createElement(EvidenceGraph, {
        subject: { label: 'Ari Rao', meta: 'Engineer' },
        relationships: [],
      }),
    );

    expect(markup).toBe('');
  });

  it('renders a presentation-only figure with an equivalent accessible summary', () => {
    const markup = renderToStaticMarkup(
      createElement(EvidenceGraph, {
        subject: { label: 'Ari Rao', meta: 'Engineer' },
        relationships,
      }),
    );

    expect(markup).toContain('role="img"');
    expect(markup).toContain(
      'aria-label="Relationship graph: Ari Rao connects to Release review, Ownership first."',
    );
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).not.toContain('tabindex');
  });

  it('tags every edge and node with the same data-evidence-node id the relationship list uses', () => {
    const markup = renderToStaticMarkup(
      createElement(EvidenceGraph, {
        subject: { label: 'Ari Rao', meta: 'Engineer' },
        relationships,
      }),
    );

    for (const relationship of relationships) {
      const id = relationshipKey(relationship);
      const occurrences = markup.split(`data-evidence-node="${id}"`).length - 1;
      // one polyline edge + one <g> node, both carrying the same id
      expect(occurrences).toBe(2);
    }
  });

  it('renders the real relationship label and target title read from the same data the list renders', () => {
    const markup = renderToStaticMarkup(
      createElement(EvidenceGraph, {
        subject: { label: 'Ari Rao', meta: 'Engineer' },
        relationships,
      }),
    );

    expect(markup).toContain('Informed by');
    expect(markup).toContain('Release review');
    expect(markup).toContain('Discusses');
    expect(markup).toContain('Ownership first');
  });
});
