import type { ImmutablePublic, PublicRelationship } from '@/lib/public/domain';
import { layoutGraph, type GraphLayoutInput } from '@/lib/graph-layout';
import { relationshipKey } from '../EditorialPrimitives';

const GRAPH_ROW_HEIGHT = 46;

/** The single, generic entry point for the public Evidence Graph platform primitive. */
export interface EvidenceGraphProps {
  subject: { label: string; meta: string };
  relationships: readonly ImmutablePublic<PublicRelationship>[];
}

/**
 * The one public Evidence Graph component: a monochrome SVG fan diagram —
 * the subject on the left, its real `relationships` branching off a trunk
 * line on the right. It is a rendering primitive only: it does not fetch
 * data, does not know about routing, and does not know about repositories.
 * Every node/edge is read directly off the `PublicRelationship[]` a caller
 * already has (typically the same array an adjacent accessible list
 * renders), so the two can never drift out of sync.
 *
 * This is not illustration, and it is not owned by Engineering Profiles —
 * Engineering Profiles is its first consumer, not its home. Any future
 * subject with a `relationships` array (a Build, a Blueprint, a search
 * result) can render the same fan projection through this same component;
 * only the projection handed to it differs, never a second implementation.
 *
 * Accessibility: this SVG is `aria-hidden` and carries no interactive
 * semantics of its own (`role="img"` sits on the wrapping `<figure>`, with
 * an equivalent text summary). The accessible, keyboard-operable path is
 * the plain `<a>` links in the adjacent relationship list — this component
 * never adds `tabIndex` or a second keyboard model. Each node/edge carries
 * `data-evidence-node`, the same stable id (`relationshipKey`) the list
 * items carry, so `EvidenceGraphFocusSync` can mirror hover/focus onto the
 * matching node without either side owning the other's interaction model.
 */
export function EvidenceGraph({ subject, relationships }: EvidenceGraphProps) {
  const items = relationships;
  if (!items.length) return null;

  type GraphEntity =
    | { kind: 'subject'; value: typeof subject }
    | { kind: 'relationship'; value: ImmutablePublic<PublicRelationship> };
  const input: GraphLayoutInput<GraphEntity, ImmutablePublic<PublicRelationship>> = {
    rootId: 'subject',
    nodes: [
      {
        id: 'subject',
        entity: { kind: 'subject' as const, value: subject },
        width: 168,
        height: GRAPH_ROW_HEIGHT,
        order: -1,
      },
      ...items.map((relationship, order) => ({
        id: relationshipKey(relationship),
        entity: { kind: 'relationship' as const, value: relationship },
        width: 272,
        height: GRAPH_ROW_HEIGHT,
        order,
      })),
    ],
    edges: items.map((relationship, order) => ({
      id: relationshipKey(relationship),
      source: 'subject',
      target: relationshipKey(relationship),
      relationship,
      order,
    })),
  };
  const layout = layoutGraph(input, {
    columnGap: 0,
    rowGap: 0,
    paddingY: 16,
    minimumWidth: 440,
    targetExtension: 20,
  });
  const subjectNode = layout.nodes.find((node) => node.id === 'subject')!;
  const subjectCenterY = subjectNode.y + subjectNode.height / 2;
  const summary = `Relationship graph: ${subject.label} connects to ${items
    .map((relationship) => relationship.target.title)
    .join(', ')}.`;

  return (
    <figure className="evidence-graph" role="img" aria-label={summary}>
      <svg
        viewBox={`0 0 ${layout.bounds.width} ${layout.bounds.height}`}
        preserveAspectRatio="xMinYMid meet"
        aria-hidden="true"
      >
        <text x={subjectNode.x} y={subjectCenterY - 8} className="evidence-graph-subject-meta">
          {subject.meta}
        </text>
        <text x={subjectNode.x} y={subjectCenterY + 14} className="evidence-graph-subject-label">
          {subject.label}
        </text>
        {layout.edges.map((edge) => (
          <polyline
            key={`edge-${edge.id}`}
            points={edge.points.map(({ x, y }) => `${x},${y}`).join(' ')}
            className="evidence-graph-line"
            data-evidence-node={edge.id}
            fill="none"
          />
        ))}
        {layout.nodes.flatMap((node) => {
          if (node.entity.kind !== 'relationship') return [];
          const relationship = node.entity.value;
          const y = node.y + node.height / 2;
          return (
            <g key={node.id} data-evidence-node={node.id}>
              <circle cx={node.x} cy={y} r="3" className="evidence-graph-node" />
              <text x={node.x + 30} y={y - 8} className="evidence-graph-edge-label">
                {relationship.label}
              </text>
              <text x={node.x + 30} y={y + 12} className="evidence-graph-node-label">
                {relationship.target.title}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
