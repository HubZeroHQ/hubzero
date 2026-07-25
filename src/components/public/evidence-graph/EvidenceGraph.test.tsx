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

  it('defaults to fan layout when `layout` is omitted, byte-for-byte identical to explicit "fan"', () => {
    const implicit = renderToStaticMarkup(
      createElement(EvidenceGraph, {
        subject: { label: 'Ari Rao', meta: 'Engineer' },
        relationships,
      }),
    );
    const explicit = renderToStaticMarkup(
      createElement(EvidenceGraph, {
        subject: { label: 'Ari Rao', meta: 'Engineer' },
        relationships,
        layout: 'fan',
      }),
    );

    expect(implicit).toBe(explicit);
  });
});

describe('EvidenceGraph chain layout (Trace)', () => {
  const chain: PublicRelationship[] = [
    {
      kind: 'buildAppliedInWork',
      label: 'Informed by',
      target: { type: 'build', title: 'Release review', url: '/builds/release-review' },
    },
    {
      kind: 'labGraduatedToBuild',
      label: 'Originated in',
      target: { type: 'lab', title: 'Ownership research', url: '/labs/ownership-research' },
    },
  ];

  function firstPointX(markup: string, edgeId: string): number {
    const match = markup.match(
      new RegExp(
        `<polyline points="([\\d.,\\s-]+)" class="evidence-graph-line" data-evidence-node="${edgeId}"`,
      ),
    );
    const points = match?.[1]?.trim().split(/\s+/)[0];
    return Number(points?.split(',')[0]);
  }

  it('wires each hop from the previous node instead of fanning every hop from the subject', () => {
    const markup = renderToStaticMarkup(
      createElement(EvidenceGraph, {
        subject: { label: 'Work item', meta: 'Work' },
        relationships: chain,
        layout: 'chain',
      }),
    );
    const firstEdgeId = relationshipKey(chain[0]!);
    const secondEdgeId = relationshipKey(chain[1]!);

    // In fan mode every edge starts at the subject's own x (0). In chain
    // mode, the second hop starts at the first hop's node x instead —
    // proving it connects from the previous node, not the subject.
    expect(firstPointX(markup, firstEdgeId)).toBe(0);
    expect(firstPointX(markup, secondEdgeId)).toBeGreaterThan(0);
  });

  it('renders a Trace-labeled summary describing the ordered path, not a fan "connects to" list', () => {
    const markup = renderToStaticMarkup(
      createElement(EvidenceGraph, {
        subject: { label: 'Work item', meta: 'Work' },
        relationships: chain,
        layout: 'chain',
      }),
    );

    expect(markup).toContain(
      'aria-label="Trace: Work item → Release review → Ownership research."',
    );
  });

  it('still tags every hop with the same data-evidence-node id an accessible list would use', () => {
    const markup = renderToStaticMarkup(
      createElement(EvidenceGraph, {
        subject: { label: 'Work item', meta: 'Work' },
        relationships: chain,
        layout: 'chain',
      }),
    );

    for (const hop of chain) {
      const id = relationshipKey(hop);
      const occurrences = markup.split(`data-evidence-node="${id}"`).length - 1;
      expect(occurrences).toBe(2);
    }
  });

  it('renders nothing for an empty chain, same as an empty fan', () => {
    const markup = renderToStaticMarkup(
      createElement(EvidenceGraph, {
        subject: { label: 'Work item', meta: 'Work' },
        relationships: [],
        layout: 'chain',
      }),
    );

    expect(markup).toBe('');
  });
});
