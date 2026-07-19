import type { JSX } from 'react';
import type { FounderMotifId } from '@/config/founder-identity';

/**
 * Founder motifs (Phase 23) — structural diagrams, not decorative artwork.
 * Every node is a real technology the founder's Engineering Profile is
 * tagged with (`profile.technologies`, the same "Technology path" evidence
 * source ENGINEERING_IDENTITY.md already approves elsewhere on the site).
 * Swapping two founders' motifs would visibly misrepresent both people —
 * the arrangement (radial network, layered graph, flowing curve, editorial
 * rule grid, right-angled trace routing) is the point, not a color change.
 *
 * All motifs share one viewBox and one "draw" mechanism (a generous fixed
 * `stroke-dasharray` animated to 0 — safe because every hand-authored path
 * below is well under that length) so the drawing behavior stays consistent
 * while the geometry stays distinct per founder.
 */

const VIEW_WIDTH = 520;
const VIEW_HEIGHT = 200;
const MAX_NODES = 6;

export interface FounderMotifProps {
  motif: FounderMotifId;
  technologies: readonly { label: string }[];
  description: string;
  className?: string;
}

export function FounderMotif({ motif, technologies, description, className }: FounderMotifProps) {
  const labels = technologies.slice(0, MAX_NODES).map((tech) => truncate(tech.label, 16));
  if (!labels.length) return null;

  const Component = MOTIF_COMPONENTS[motif];
  return (
    <svg
      className={`founder-motif founder-motif-${motif} ${className ?? ''}`.trim()}
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={description}
    >
      <Component labels={labels} />
    </svg>
  );
}

function truncate(label: string, max: number): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

const MOTIF_COMPONENTS: Record<FounderMotifId, (props: { labels: string[] }) => JSX.Element> = {
  network: NetworkMotif,
  dependencyGraph: DependencyGraphMotif,
  curve: CurveMotif,
  editorialGrid: EditorialGridMotif,
  pcbTrace: PCBTraceMotif,
};

/** Rifaque — a hub-and-spoke network: one center, technologies radiating outward. */
function NetworkMotif({ labels }: { labels: string[] }) {
  const cx = VIEW_WIDTH / 2;
  const cy = VIEW_HEIGHT / 2;
  const radius = 76;
  const nodes = labels.map((label, index) => {
    const angle = (index / labels.length) * Math.PI * 2 - Math.PI / 2;
    return {
      label,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      labelAbove: Math.sin(angle) < -0.2,
    };
  });

  return (
    <g>
      {nodes.map((node) => (
        <line
          key={`line-${node.label}`}
          className="founder-motif-trace"
          x1={cx}
          y1={cy}
          x2={node.x}
          y2={node.y}
        />
      ))}
      <circle className="founder-motif-hub" cx={cx} cy={cy} r={7} />
      {nodes.map((node) => (
        <g key={node.label}>
          <circle className="founder-motif-node" cx={node.x} cy={node.y} r={4} />
          <text
            className="founder-motif-label"
            x={node.x}
            y={node.labelAbove ? node.y - 12 : node.y + 18}
            textAnchor="middle"
          >
            {node.label}
          </text>
        </g>
      ))}
    </g>
  );
}

/** Raif — a two-tier dependency graph: foundational systems feeding upward, deterministic fan-in. */
function DependencyGraphMotif({ labels }: { labels: string[] }) {
  const bottomCount = Math.ceil(labels.length / 2);
  const bottom = labels.slice(0, bottomCount);
  const top = labels.slice(bottomCount);
  const bottomY = VIEW_HEIGHT - 44;
  const topY = 44;

  const bottomNodes = layout(bottom, bottomY);
  const topNodes = top.length ? layout(top, topY) : [];

  return (
    <g>
      {bottomNodes.map((node, index) => {
        const target = topNodes.length
          ? topNodes[Math.floor((index * topNodes.length) / bottomNodes.length)]
          : null;
        return target ? (
          <path
            key={`edge-${node.label}`}
            className="founder-motif-trace"
            d={`M ${node.x} ${node.y} L ${target.x} ${target.y}`}
          />
        ) : null;
      })}
      {[...bottomNodes, ...topNodes].map((node) => (
        <g key={node.label}>
          <rect
            className="founder-motif-node founder-motif-block"
            x={node.x - 5}
            y={node.y - 5}
            width={10}
            height={10}
          />
          <text className="founder-motif-label" x={node.x} y={node.y + 20} textAnchor="middle">
            {node.label}
          </text>
        </g>
      ))}
    </g>
  );
}

function layout(labels: string[], y: number) {
  const gap = VIEW_WIDTH / (labels.length + 1);
  return labels.map((label, index) => ({ label, x: gap * (index + 1), y }));
}

/** Iyad — one continuous curve moving through each stage of the product lifecycle. */
function CurveMotif({ labels }: { labels: string[] }) {
  const gap = VIEW_WIDTH / (labels.length + 1);
  const nodes = labels.map((label, index) => ({
    label,
    x: gap * (index + 1),
    y: index % 2 === 0 ? 76 : 128,
  }));

  const path = nodes
    .map((node, index) => {
      const prev = nodes[index - 1];
      if (!prev) return `M ${node.x} ${node.y}`;
      const midX = (prev.x + node.x) / 2;
      return `C ${midX} ${prev.y}, ${midX} ${node.y}, ${node.x} ${node.y}`;
    })
    .join(' ');

  return (
    <g>
      <path className="founder-motif-trace" d={path} fill="none" />
      {nodes.map((node) => (
        <g key={node.label}>
          <circle className="founder-motif-node" cx={node.x} cy={node.y} r={4} />
          <text
            className="founder-motif-label"
            x={node.x}
            y={node.y < 100 ? node.y - 12 : node.y + 18}
            textAnchor="middle"
          >
            {node.label}
          </text>
        </g>
      ))}
    </g>
  );
}

/** Sultan — an editorial rule grid: numbered horizontal rules, reading as a document outline. */
function EditorialGridMotif({ labels }: { labels: string[] }) {
  const rowHeight = VIEW_HEIGHT / (labels.length + 1);

  return (
    <g>
      {labels.map((label, index) => {
        const y = rowHeight * (index + 1);
        return (
          <g key={label}>
            <text className="founder-motif-index" x={0} y={y - 8}>
              {String(index + 1).padStart(2, '0')}
            </text>
            <line className="founder-motif-trace" x1={28} y1={y} x2={VIEW_WIDTH} y2={y} />
            <text className="founder-motif-label" x={28} y={y - 8}>
              {label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Salsabeel — right-angled PCB traces routing between component pads, no curves. */
function PCBTraceMotif({ labels }: { labels: string[] }) {
  const gap = VIEW_WIDTH / (labels.length + 1);
  const nodes = labels.map((label, index) => ({
    label,
    x: gap * (index + 1),
    y: index % 2 === 0 ? 60 : 140,
  }));

  return (
    <g>
      {nodes.slice(1).map((node, index) => {
        const prev = nodes[index];
        if (!prev) return null;
        const midX = (prev.x + node.x) / 2;
        return (
          <path
            key={`trace-${node.label}`}
            className="founder-motif-trace"
            d={`M ${prev.x} ${prev.y} H ${midX} V ${node.y} H ${node.x}`}
            fill="none"
          />
        );
      })}
      {nodes.map((node) => (
        <g key={node.label}>
          <rect
            className="founder-motif-node founder-motif-pad"
            x={node.x - 6}
            y={node.y - 6}
            width={12}
            height={12}
          />
          <text
            className="founder-motif-label"
            x={node.x}
            y={node.y < 100 ? node.y - 14 : node.y + 22}
            textAnchor="middle"
          >
            {node.label}
          </text>
        </g>
      ))}
    </g>
  );
}
