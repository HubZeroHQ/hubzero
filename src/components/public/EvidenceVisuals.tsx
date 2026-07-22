import type { ImmutablePublic, PublicRelationship } from '@/lib/public/domain';
import { layoutGraph, type GraphLayoutInput } from '@/lib/graph-layout';
import { formatMetadata, relationshipKey } from './EditorialPrimitives';

const GRAPH_ROW_HEIGHT = 46;

/**
 * A monochrome SVG node graph — the subject on the left, its real
 * `relationships` branching off a trunk line on the right. This is not
 * illustration: every node and edge label is read directly off the same
 * `PublicRelationship[]` the adjacent `RelationshipCard` list already
 * renders, so the two are always in sync (that list stays the accessible,
 * keyboard-operable path — this SVG is a supplementary visual index, marked
 * `aria-hidden` with the equivalent summary on the wrapping `<figure>`).
 */
export function RelationshipGraph({
  subject,
  relationships,
}: {
  subject: { label: string; meta: string };
  relationships: readonly ImmutablePublic<PublicRelationship>[];
}) {
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
            fill="none"
          />
        ))}
        {layout.nodes.flatMap((node) => {
          if (node.entity.kind !== 'relationship') return [];
          const relationship = node.entity.value;
          const y = node.y + node.height / 2;
          return (
            <g key={node.id}>
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

const AXIS_SEGMENT = 132;
const AXIS_Y = 40;

/**
 * A monochrome horizontal axis — evenly spaced nodes, each labelled above
 * (eyebrow) and below (value), with an optional third caption line. Shared
 * by every "stage" or "dated record" visual on the site: a Blueprint's
 * architecture/design-language/version register, the four-division
 * operating model, and the Labs/Notes ledger's publication timeline. Same
 * visual grammar throughout — only the data changes.
 */
export function AxisDiagram({
  items,
  label,
}: {
  items: readonly { label: string; value: string; caption?: string }[];
  label: string;
}) {
  if (!items.length) return null;

  const width = Math.max(items.length * AXIS_SEGMENT, AXIS_SEGMENT);
  const hasCaption = items.some((item) => item.caption);
  const height = hasCaption ? 96 : 76;
  const summary = `${label}: ${items.map((item) => `${item.label} — ${item.value}`).join('; ')}.`;

  return (
    <figure className="axis-diagram" role="img" aria-label={summary}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMinYMid meet"
        aria-hidden="true"
      >
        <line
          x1={AXIS_SEGMENT / 2}
          y1={AXIS_Y}
          x2={width - AXIS_SEGMENT / 2}
          y2={AXIS_Y}
          className="axis-diagram-line"
        />
        {items.map((item, index) => {
          const cx = AXIS_SEGMENT * index + AXIS_SEGMENT / 2;
          return (
            <g key={`${item.label}-${index}`}>
              <circle cx={cx} cy={AXIS_Y} r="3" className="axis-diagram-node" />
              <text x={cx} y={AXIS_Y - 14} textAnchor="middle" className="axis-diagram-label">
                {formatMetadata(item.label)}
              </text>
              <text x={cx} y={AXIS_Y + 22} textAnchor="middle" className="axis-diagram-value">
                {item.value}
              </text>
              {item.caption ? (
                <text x={cx} y={AXIS_Y + 38} textAnchor="middle" className="axis-diagram-caption">
                  {item.caption}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
