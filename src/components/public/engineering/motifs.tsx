import type { CSSProperties, JSX } from 'react';
import type { FounderMotifId } from '@/config/founder-identity';

/**
 * Founder motifs (Phase 23) — engineering infrastructure, not illustration.
 * Every motif is hand-authored, fixed geometry — no procedural randomness,
 * no repeated primitive tiled across the card. Each founder gets ONE
 * engineering language, sparse enough that every line and every junction
 * is deliberate:
 *
 * - Rifaque's orchestration reuses Raif's exact grammar (orthogonal docks
 *   into a shared bus), asymmetric the way a real build/orchestration DAG
 *   is: uneven dock spacing, a subsystem starting lower than the entry
 *   column, a lane that skips the system tier, a fork where only one
 *   branch reaches anything, a bypass that crosses the platform without
 *   docking, a job that terminates — never a neat, evenly-stacked ladder.
 * - Raif's software architecture reads as modules docking into one shared,
 *   precisely gridded bus — deterministic, orthogonal, nothing left to
 *   chance. The benchmark for the rest of this file.
 * - Iyad's product operations read as a manufacturing traveler's own
 *   ruling: a field of short, independent, unremarkable rows (plain
 *   records, going nowhere in particular) with one line drawn heavier
 *   and longer than the rest — the one that keeps turning through
 *   several operations without ever lifting, while everything around
 *   it stays flat and quiet. The quietest motif in the set, by design.
 * - Sultan's editorial system reads as reading rules and registration
 *   marks from a publication grid.
 * - Salsabeel's PCB has real hierarchy: the differential pair is the area
 *   of interest (heavier stroke, its own via cluster); a plain bus, a
 *   clock serpentine, a fine-pitch escape, and a pad with its teardrop
 *   stay quiet background traffic around it.
 *
 * Every stroke starts at the shared viewBox's right edge and is revealed
 * by animating its own stroke-dashoffset from its exact path length to 0
 * (via PathBuilder, which tracks length as it builds the `d` string), so
 * the draw is proportional to each stroke's own length. Delay and
 * duration are staggered per stroke (asyncDraw) so the system reveals
 * asynchronously — some routes first, others later — rather than as one
 * synchronized flourish.
 */

const VIEW_WIDTH = 520;
const VIEW_HEIGHT = 200;
const MAX_NODES = 6;
const LANE_TOP = 26;
const LANE_BOTTOM = 174;

export interface FounderMotifProps {
  motif: FounderMotifId;
  technologies: readonly { label: string }[];
  description: string;
  className?: string;
  /**
   * Card usage: anchors the viewBox's right edge to the frame's right edge
   * and crops the rest, so the system reads as continuing off-frame rather
   * than as a self-contained diagram centered in its box.
   */
  edgeAnchored?: boolean;
}

export function FounderMotif({
  motif,
  technologies,
  description,
  className,
  edgeAnchored,
}: FounderMotifProps) {
  const count = Math.min(technologies.length, MAX_NODES);
  if (!count) return null;

  const Component = MOTIF_COMPONENTS[motif];
  return (
    <svg
      className={`founder-motif founder-motif-${motif} ${className ?? ''}`.trim()}
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio={edgeAnchored ? 'xMaxYMid slice' : 'xMidYMid meet'}
      role="img"
      aria-label={description}
    >
      <Component count={count} />
    </svg>
  );
}

const MOTIF_COMPONENTS: Record<FounderMotifId, (props: { count: number }) => JSX.Element> = {
  network: NetworkMotif,
  dependencyGraph: DependencyGraphMotif,
  traveler: TravelerMotif,
  editorialGrid: EditorialGridMotif,
  pcbTrace: PCBTraceMotif,
};

/** Deterministic pseudo-random float in [0, 1) — used only for the per-stroke motion stagger, never for geometry. */
function hash(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Evenly spaced horizontal lanes across the motif's vertical range. */
function laneYs(count: number): number[] {
  if (count <= 1) return [(LANE_TOP + LANE_BOTTOM) / 2];
  const step = (LANE_BOTTOM - LANE_TOP) / (count - 1);
  return Array.from({ length: count }, (_, index) => LANE_TOP + step * index);
}

/**
 * Builds an SVG path `d` string while tracking its true drawn length, so
 * every stroke can use its OWN stroke-dasharray/dashoffset — a reveal
 * proportional to that stroke's actual length, not one shared oversized
 * constant.
 */
class PathBuilder {
  d = '';
  length = 0;
  private x = 0;
  private y = 0;

  moveTo(x: number, y: number): this {
    this.d += `M ${x} ${y} `;
    this.x = x;
    this.y = y;
    return this;
  }

  h(x: number): this {
    this.length += Math.abs(x - this.x);
    this.d += `H ${x} `;
    this.x = x;
    return this;
  }

  v(y: number): this {
    this.length += Math.abs(y - this.y);
    this.d += `V ${y} `;
    this.y = y;
    return this;
  }

  lineTo(x: number, y: number): this {
    this.length += Math.hypot(x - this.x, y - this.y);
    this.d += `L ${x} ${y} `;
    this.x = x;
    this.y = y;
    return this;
  }

  curveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): this {
    this.length +=
      Math.hypot(c1x - this.x, c1y - this.y) +
      Math.hypot(c2x - c1x, c2y - c1y) +
      Math.hypot(x - c2x, y - c2y);
    this.d += `C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x} ${y} `;
    this.x = x;
    this.y = y;
    return this;
  }

  /** Horizontal-then-vertical move with a short 45° chamfer at the corner — a real PCB miter, not a sharp staircase turn. */
  hv(toX: number, toY: number, chamfer = 6): this {
    const dx = Math.sign(toX - this.x) || 1;
    const dy = Math.sign(toY - this.y) || 1;
    const c = Math.min(chamfer, Math.abs(toX - this.x) / 2, Math.abs(toY - this.y) / 2);
    if (c <= 0.01) {
      this.h(toX);
      this.v(toY);
      return this;
    }
    const cornerY = this.y;
    this.h(toX - dx * c);
    this.lineTo(toX, cornerY + dy * c);
    this.v(toY);
    return this;
  }
}

/** Per-stroke stagger: distinct delay and duration so the reveal feels like asynchronous signal propagation, not one synchronized flourish. */
function asyncDraw(seed: number): CSSProperties {
  const delay = Math.round(hash(seed, 91) * 460);
  const duration = Math.round(620 + hash(seed, 97) * 420);
  return {
    transitionDelay: `${delay}ms`,
    transitionDuration: `${duration}ms`,
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`,
  };
}

function Trace({
  builder,
  seed,
  extraClassName,
}: {
  builder: PathBuilder;
  seed: number;
  extraClassName?: string;
}) {
  const dash = Math.max(builder.length, 1) + 2;
  return (
    <path
      className={`founder-motif-trace ${extraClassName ?? ''}`.trim()}
      d={builder.d}
      strokeDasharray={dash}
      strokeDashoffset={dash}
      style={asyncDraw(seed)}
    />
  );
}

/**
 * Rifaque — platform orchestration, drawn in Raif's own grammar (strictly
 * orthogonal docks into a shared bus) but deliberately asymmetric, the way
 * a real build/orchestration graph is: one system bus gathers its modules
 * and drops into the platform normally; one lane skips that tier entirely
 * and docks straight into the platform; one job forks, and only one of
 * its two branches ever reaches anything — the other just runs off on its
 * own; one lane bypasses the platform outright, crossing its row without
 * docking; one job simply terminates. Different stage widths, uneven dock
 * spacing, nothing stacked evenly. Never diagonal, never curved — the
 * language is Raif's, the shape is a real orchestration DAG's.
 */
function NetworkMotif({ count }: { count: number }) {
  const elements: JSX.Element[] = [];
  const nodes: JSX.Element[] = [];
  let seed = 0;

  // The critical path reaches further than any other line here — orchestration owns more ground than any one system.
  const platformY = 166;
  const platform = new PathBuilder().moveTo(470, platformY).h(60);
  elements.push(
    <Trace key="ri-platform" seed={seed++} builder={platform} extraClassName="founder-motif-bus" />,
  );

  // A system bus starting slightly lower than the entry column, its two modules unevenly spaced and unevenly reached.
  const systemAY = 44;
  const systemAEndX = 426;
  const systemA = new PathBuilder().moveTo(500, systemAY).h(systemAEndX);
  elements.push(<Trace key={`ri-sysA-${seed}`} seed={seed++} builder={systemA} />);
  [
    { y: 12, dockX: 497 },
    { y: 60, dockX: 465 },
  ].forEach(({ y, dockX }, i) => {
    const p = new PathBuilder().moveTo(VIEW_WIDTH, y).h(dockX).v(systemAY);
    elements.push(<Trace key={`ri-a-mod-${i}-${seed}`} seed={seed++} builder={p} />);
    nodes.push(
      <rect
        key={`ri-a-node-${i}-${seed}`}
        className="founder-motif-node"
        x={dockX - 2}
        y={systemAY - 2}
        width={4}
        height={4}
      />,
    );
  });
  const dropA = new PathBuilder().moveTo(systemAEndX, systemAY).v(platformY);
  elements.push(<Trace key={`ri-dropA-${seed}`} seed={seed++} builder={dropA} />);
  nodes.push(
    <rect
      key={`ri-dropA-node-${seed}`}
      className="founder-motif-node"
      x={systemAEndX - 2}
      y={platformY - 2}
      width={4}
      height={4}
    />,
  );

  if (count >= 3) {
    // Skips the system tier completely — a direct dependency straight into the platform.
    const skipDockX = 326;
    const skip = new PathBuilder().moveTo(VIEW_WIDTH, 102).h(skipDockX).v(platformY);
    elements.push(<Trace key={`ri-skip-${seed}`} seed={seed++} builder={skip} />);
    nodes.push(
      <rect
        key={`ri-skip-node-${seed}`}
        className="founder-motif-node"
        x={skipDockX - 2}
        y={platformY - 2}
        width={4}
        height={4}
      />,
    );
  }

  if (count >= 4) {
    // Forks: one branch reaches the platform, the other runs off and never reconnects to anything.
    const forkX = 438;
    const trunk = new PathBuilder().moveTo(VIEW_WIDTH, 130).h(forkX);
    elements.push(<Trace key={`ri-fork-trunk-${seed}`} seed={seed++} builder={trunk} />);
    const deadBranch = new PathBuilder().moveTo(forkX, 130).v(86).h(298);
    elements.push(<Trace key={`ri-fork-dead-${seed}`} seed={seed++} builder={deadBranch} />);
    const liveBranch = new PathBuilder().moveTo(forkX, 130).v(154).h(292).v(platformY);
    elements.push(<Trace key={`ri-fork-live-${seed}`} seed={seed++} builder={liveBranch} />);
    nodes.push(
      <rect
        key={`ri-fork-node-${seed}`}
        className="founder-motif-node"
        x={290}
        y={platformY - 2}
        width={4}
        height={4}
      />,
    );
  }

  if (count >= 5) {
    // Bypasses the platform outright: the vertical run simply crosses its row without docking.
    const bypass = new PathBuilder().moveTo(VIEW_WIDTH, 18).h(449).v(190).h(360);
    elements.push(<Trace key={`ri-bypass-${seed}`} seed={seed++} builder={bypass} />);
  }

  if (count >= 6) {
    // Terminates early — a job with no further consumer.
    const endX = 442;
    const term = new PathBuilder().moveTo(VIEW_WIDTH, 152).h(endX);
    elements.push(<Trace key={`ri-term-${seed}`} seed={seed++} builder={term} />);
    nodes.push(
      <circle
        key={`ri-term-node-${seed}`}
        className="founder-motif-node"
        cx={endX}
        cy={152}
        r={1.8}
      />,
    );
  }

  return (
    <g>
      {elements}
      {nodes}
    </g>
  );
}

/**
 * Raif — software architecture. Every module lane docks into one shared,
 * precisely gridded bus at its own fixed checkpoint. The repetition here
 * is the point: it reads as rigor, not as a tiled pattern.
 */
function DependencyGraphMotif({ count }: { count: number }) {
  const ys = laneYs(count);
  const spineY = VIEW_HEIGHT / 2;
  const elements: JSX.Element[] = [];
  const nodes: JSX.Element[] = [];
  let seed = 0;

  const spine = new PathBuilder().moveTo(500, spineY).h(90);
  elements.push(
    <Trace key="raif-spine" seed={seed++} builder={spine} extraClassName="founder-motif-bus" />,
  );

  ys.forEach((y, i) => {
    if (Math.abs(y - spineY) < 6) return;
    const dockX = 480 - i * 16;
    const path = new PathBuilder().moveTo(VIEW_WIDTH, y).h(dockX).v(spineY);
    elements.push(<Trace key={`raif-${i}`} seed={seed++} builder={path} />);
    nodes.push(
      <rect
        key={`raif-n-${i}`}
        className="founder-motif-node"
        x={dockX - 2}
        y={spineY - 2}
        width={4}
        height={4}
      />,
    );
  });

  return (
    <g>
      {elements}
      {nodes}
    </g>
  );
}

/**
 * Iyad — product operations. Most rows are plain, independent, and short:
 * unremarkable records going nowhere, the quiet background any ruled
 * sheet has. One line is different — heavier, and it never lifts: it
 * keeps turning through several operations in one unbroken run while
 * everything else around it stays flat. No convergence, no fork, no
 * fallback — the quietest motif in the set on purpose.
 */
function TravelerMotif({ count }: { count: number }) {
  const ys = laneYs(count);
  const elements: JSX.Element[] = [];
  const nodes: JSX.Element[] = [];
  let seed = 0;

  ys.forEach((y, i) => {
    const endX = 400 + ((i * 43) % 80);
    const row = new PathBuilder().moveTo(VIEW_WIDTH, y).h(endX);
    elements.push(<Trace key={`iyad-row-${i}`} seed={seed++} builder={row} />);
  });

  const travel = new PathBuilder().moveTo(VIEW_WIDTH, 34).h(340).v(90).h(230);
  let endX = 230;
  let endY = 90;
  if (count >= 4) {
    travel.v(138).h(150);
    endX = 150;
    endY = 138;
  }
  if (count >= 6) {
    travel.v(160).h(96);
    endX = 96;
    endY = 160;
  }
  elements.push(
    <Trace
      key={`iyad-travel-${seed}`}
      seed={seed++}
      builder={travel}
      extraClassName="founder-motif-bus"
    />,
  );
  nodes.push(
    <rect
      key="iyad-travel-node"
      className="founder-motif-node"
      x={endX - 2}
      y={endY - 2}
      width={4}
      height={4}
    />,
  );

  return (
    <g>
      {elements}
      {nodes}
    </g>
  );
}

/**
 * Sultan — editorial systems. Long reading rules at a precise grid,
 * occasionally crossed by short registration ticks, with one distribution
 * branch — information architecture, not software.
 */
function EditorialGridMotif({ count }: { count: number }) {
  const ys = laneYs(count);
  const elements: JSX.Element[] = [];
  const marks: JSX.Element[] = [];
  let seed = 0;

  ys.forEach((y, i) => {
    const endX = 40 + ((i * 23) % 60);
    const rule = new PathBuilder().moveTo(VIEW_WIDTH, y).h(endX);
    elements.push(<Trace key={`sultan-${i}`} seed={seed++} builder={rule} />);
  });

  [470, 425].forEach((x, mi) => {
    ys.forEach((y, i) => {
      if ((i + mi) % 2 !== 0) return;
      const tick = new PathBuilder().moveTo(x, y - 5).v(y + 5);
      elements.push(<Trace key={`sultan-mark-${mi}-${i}`} seed={seed++} builder={tick} />);
    });
  });

  const branchIdx = Math.floor(ys.length / 2);
  const branchY = ys[branchIdx];
  if (branchY !== undefined) {
    const branchX = 380;
    const branch = new PathBuilder()
      .moveTo(branchX, branchY)
      .v(branchY - 24)
      .h(branchX - 60);
    elements.push(<Trace key="sultan-branch" seed={seed++} builder={branch} />);
    marks.push(
      <rect
        key="sultan-branch-node"
        className="founder-motif-node"
        x={branchX - 2}
        y={branchY - 2}
        width={4}
        height={4}
      />,
    );
  }

  return (
    <g>
      {elements}
      {marks}
    </g>
  );
}

/**
 * Salsabeel — PCB routing, studied from real board layouts, with real
 * hierarchy: the differential pair is the area of interest — drawn
 * heavier, with its own small via cluster at the termination — and
 * everything else is quiet background traffic around it. A plain
 * two-line bus, a length-matched clock serpentine, a thinned fine-pitch
 * escape, and a pad with its teardrop each solve one distinct routing
 * problem, but none competes with the differential pair for attention.
 */
function PCBTraceMotif({ count }: { count: number }) {
  const elements: JSX.Element[] = [];
  const vias: JSX.Element[] = [];
  let seed = 0;

  // Quiet background bus — plain, short, unremarkable.
  const busYs = [40, 48];
  busYs.forEach((y, i) => {
    const endX = 210 + i * 40;
    const p = new PathBuilder().moveTo(VIEW_WIDTH, y).h(endX);
    elements.push(<Trace key={`sal-bus-${seed}`} seed={seed++} builder={p} />);
  });

  // The area of interest: a differential pair, drawn heavier, with a small via cluster where it lands.
  const diffGap = 6;
  const diffY = 90;
  const diffTurnX = 440;
  const diffDropY = 132;
  const diffEndX = 220;
  const diffA = new PathBuilder().moveTo(VIEW_WIDTH, diffY).hv(diffTurnX, diffDropY, 8).h(diffEndX);
  const diffB = new PathBuilder()
    .moveTo(VIEW_WIDTH, diffY + diffGap)
    .hv(diffTurnX, diffDropY + diffGap, 8)
    .h(diffEndX);
  elements.push(
    <Trace
      key={`sal-diff-a-${seed}`}
      seed={seed++}
      builder={diffA}
      extraClassName="founder-motif-bus"
    />,
  );
  elements.push(
    <Trace
      key={`sal-diff-b-${seed}`}
      seed={seed++}
      builder={diffB}
      extraClassName="founder-motif-bus"
    />,
  );
  vias.push(
    <circle key="sal-via-cluster-1" className="founder-motif-node" cx={452} cy={124} r={1.4} />,
  );
  vias.push(
    <circle key="sal-via-cluster-2" className="founder-motif-node" cx={462} cy={148} r={1.4} />,
  );
  if (count >= 4) {
    vias.push(
      <circle key="sal-via-cluster-3" className="founder-motif-node" cx={472} cy={136} r={1.4} />,
    );
  }

  // A quiet clock trace with a short serpentine — background length-matching, not the focus.
  if (count >= 3) {
    const clockY = 152;
    const clock = new PathBuilder().moveTo(VIEW_WIDTH, clockY).h(478);
    let x = 478;
    for (let i = 0; i < 2; i += 1) {
      clock.v(clockY - 7);
      x -= 7;
      clock.h(x);
      clock.v(clockY);
      x -= 6;
      clock.h(x);
    }
    clock.h(x - 40);
    elements.push(<Trace key={`sal-clock-${seed}`} seed={seed++} builder={clock} />);
  }

  // A quiet fine-pitch escape, thinned — one more background signal.
  const fineY = 168;
  const fine = new PathBuilder().moveTo(VIEW_WIDTH, fineY).hv(495, 174, 5).h(300);
  elements.push(
    <Trace
      key={`sal-fine-${seed}`}
      seed={seed++}
      builder={fine}
      extraClassName="founder-motif-fine"
    />,
  );

  // A quiet pad connection with its teardrop, off in its own corner.
  if (count >= 5) {
    const padY = 22;
    const padTraceEndX = 460;
    const padX = 468;
    const padTrace = new PathBuilder().moveTo(VIEW_WIDTH, padY).h(padTraceEndX);
    elements.push(<Trace key={`sal-pad-${seed}`} seed={seed++} builder={padTrace} />);
    vias.push(
      <path
        key={`sal-teardrop-${seed}`}
        className="founder-motif-node"
        d={`M ${padTraceEndX} ${padY - 1.5} L ${padX} ${padY - 3} L ${padX} ${padY + 3} L ${padTraceEndX} ${padY + 1.5} Z`}
      />,
    );
    vias.push(
      <rect
        key={`sal-pad-rect-${seed}`}
        className="founder-motif-node"
        x={padX}
        y={padY - 3}
        width={8}
        height={6}
      />,
    );
  }

  return (
    <g>
      {elements}
      {vias}
    </g>
  );
}
