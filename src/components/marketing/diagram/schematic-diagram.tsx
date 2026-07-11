import { cn } from "@/lib/utils";

export interface DiagramNode {
  id: string;
  label: string;
  /** Center position in the diagram's own coordinate space. */
  x: number;
  y: number;
  /** @default 128 */
  width?: number;
  /** @default 48 */
  height?: number;
  /** Flat right-angle/45° primitives only — no circles (DESIGN/V3/14_VISUAL_TOKENS.md §6). @default "box" */
  shape?: "box" | "diamond";
  /** Build-order tier (0 = input, increasing toward output) — consumed by SequencedDiagram, ignored here. */
  tier?: number;
}

export interface DiagramConnection {
  from: string;
  to: string;
  label?: string;
}

export interface DiagramAnnotation {
  x: number;
  y: number;
  text: string;
}

export interface SchematicDiagramProps {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  /** The diagram's own coordinate space. */
  viewBox: { width: number; height: number };
  annotations?: DiagramAnnotation[];
  className?: string;
  /**
   * Per-connection draw progress, keyed by `"${from}->${to}"`, 0-1. Omit for
   * the fully-drawn static state — the default, and the only state this
   * component ever renders on its own; `SequencedDiagram` is what drives
   * this prop from a GSAP ScrollTrigger.
   */
  progress?: Record<string, number>;
}

function connectionKey(connection: DiagramConnection) {
  return `${connection.from}->${connection.to}`;
}

/** Right-angle elbow path between two node edges — the trace convention (02_VISUAL_LANGUAGE.md §9), never a diagonal straight line or a curved connector. */
function elbowPath(from: DiagramNode, to: DiagramNode) {
  const fromWidth = from.width ?? 128;
  const toWidth = to.width ?? 128;
  const startX = from.x + fromWidth / 2;
  const startY = from.y;
  const endX = to.x - toWidth / 2;
  const endY = to.y;
  const midX = startX + (endX - startX) / 2;
  return `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`;
}

/**
 * The engineering-diagram tier (DESIGN/V3/15_DIAGRAM_SYSTEM.md §2, hand-built
 * React/SVG, arbitrary complexity) — built entirely from the site's own type
 * and line tokens, never an embedded image from an external diagramming
 * tool (06_COMPONENT_LANGUAGE.md §15, "the single most important component
 * in this entire language"). Ice Blue linework, 1.5px stroke — the
 * technical-drawing register, never an interactive affordance
 * (11_COLOR_PHILOSOPHY_AMENDMENT.md §6). Flat right-angle box/diamond nodes
 * and orthogonal elbow connectors only, matching the icon system's own
 * right-angle/45°-only construction rule.
 *
 * Purely presentational and server-renderable — reduced-motion-safe by
 * construction, since it has no animation of its own. `SequencedDiagram`
 * wraps this with the Build Sequence signature moment's GSAP scroll-scrub;
 * used bare, it's always the fully legible, fully connected static diagram
 * (12_ACCESSIBILITY.md §3's required "GSAP sequencing must have a fully
 * legible static end-state").
 */
export function SchematicDiagram({
  nodes,
  connections,
  viewBox,
  annotations,
  className,
  progress,
}: SchematicDiagramProps) {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const nodeLabel = (id: string) => nodesById.get(id)?.label ?? id;

  return (
    <>
      {/* The SVG is presentational — `role="img"` would flatten every
          descendant `<text>` (connection labels, annotations) into one
          opaque picture, and a single computed `aria-label` has no room for
          annotation text at all. The `sr-only` paragraph below is the real
          text alternative instead: always in the DOM, never gated behind
          hover, and it's the one place every connection label and
          annotation actually gets read (12_ACCESSIBILITY.md §3). */}
      <svg
        viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
        className={cn("h-auto w-full", className)}
        aria-hidden="true"
      >
        <defs>
          <marker
            id="schematic-arrow"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L8 4 L0 8 Z" fill="var(--color-ice-blue)" />
          </marker>
        </defs>

        <g fill="none" stroke="var(--color-ice-blue)" strokeWidth="var(--stroke-diagram)">
          {connections.map((connection) => {
            const from = nodesById.get(connection.from);
            const to = nodesById.get(connection.to);
            if (!from || !to) return null;
            const key = connectionKey(connection);
            const drawn = progress?.[key] ?? 1;
            const path = elbowPath(from, to);
            return (
              <g key={key} data-connection={key}>
                <path
                  d={path}
                  markerEnd="url(#schematic-arrow)"
                  pathLength={1}
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1 - drawn,
                    opacity: drawn > 0 ? 1 : 0,
                  }}
                />
                {connection.label && drawn > 0.5 && (
                  <text
                    x={(from.x + to.x) / 2}
                    y={(from.y + to.y) / 2 - 6}
                    textAnchor="middle"
                    className="fill-text-muted font-mono text-[9px] uppercase"
                    stroke="none"
                  >
                    {connection.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {nodes.map((node) => {
          const width = node.width ?? 128;
          const height = node.height ?? 48;
          const shape = node.shape ?? "box";
          return (
            <g key={node.id} data-node={node.id}>
              {shape === "diamond" ? (
                <polygon
                  points={`${node.x},${node.y - height / 2} ${node.x + width / 2},${node.y} ${node.x},${node.y + height / 2} ${node.x - width / 2},${node.y}`}
                  fill="var(--color-bg-light)"
                  stroke="var(--color-ice-blue)"
                  strokeWidth="var(--stroke-diagram)"
                />
              ) : (
                <rect
                  x={node.x - width / 2}
                  y={node.y - height / 2}
                  width={width}
                  height={height}
                  fill="var(--color-bg-light)"
                  stroke="var(--color-ice-blue)"
                  strokeWidth="var(--stroke-diagram)"
                />
              )}
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-text font-mono text-[10px] tracking-wide uppercase"
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {annotations?.map((annotation, index) => (
          <g key={index}>
            <line
              x1={annotation.x}
              y1={annotation.y}
              x2={annotation.x + 16}
              y2={annotation.y - 16}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
            <text
              x={annotation.x + 20}
              y={annotation.y - 18}
              className="fill-text-muted font-mono text-[9px]"
            >
              {annotation.text}
            </text>
          </g>
        ))}
      </svg>
      <p className="sr-only">
        {`Schematic diagram. Components: ${nodes.map((node) => node.label).join(", ")}. `}
        {`Connections: ${connections
          .map((connection) => {
            const from = nodeLabel(connection.from);
            const to = nodeLabel(connection.to);
            return connection.label ? `${from} to ${to} (${connection.label})` : `${from} to ${to}`;
          })
          .join("; ")}.`}
        {annotations && annotations.length > 0
          ? ` Notes: ${annotations.map((annotation) => annotation.text).join("; ")}.`
          : ""}
      </p>
    </>
  );
}
