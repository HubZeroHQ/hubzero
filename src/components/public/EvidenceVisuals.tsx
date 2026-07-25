import { formatMetadata } from './EditorialPrimitives';

/**
 * `RelationshipGraph` used to live here. It's now `EvidenceGraph` in
 * `./evidence-graph/EvidenceGraph.tsx` — the public Evidence Graph platform
 * primitive, no longer colocated with the unrelated `AxisDiagram` below.
 * See `docs/architecture/ADR_PHASE_3_EVIDENCE_GRAPH.md`.
 */

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
