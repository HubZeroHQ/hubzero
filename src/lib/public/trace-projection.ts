import type { GraphQuery, HubZeroRelationshipKind } from '@/lib/entity-graph';
import type { PublicEntityLink, PublicEntityType, PublicRelationship } from './domain';
import { labelFor, refKey, type PublicEvidenceNode } from './evidence-projection';
import type { PublicRelationshipData } from './relationships';

/**
 * The two graph-level relationship kinds that form a genuine causal lineage
 * step (`normalizeRelationshipAssertions` already guarantees at most one
 * `graduated_into` edge per Lab/Build pair, so a chain never has to choose
 * between competing candidates at that hop). Deliberately excludes
 * `related_to` (lateral, not causal) and `uses` (a Blueprint reference, not
 * a 1:1 predecessor/successor step) — Trace follows one path, not a graph
 * of every connection a subject happens to have.
 */
const DEFAULT_TRACE_KINDS: readonly HubZeroRelationshipKind[] = ['graduated_into', 'applied_in'];

/** Bounds worst-case traversal work; no real lineage today is anywhere near this deep. */
const DEFAULT_MAX_HOPS = 6;

export interface TraceProjection {
  subject: PublicEntityLink;
  /**
   * Ordered hops: `steps[0]` connects `subject` to its first neighbor,
   * `steps[1]` connects that neighbor to the next, and so on — a path, not
   * a fan. Each step's own shape is `PublicRelationship`, the same type
   * `EvidenceProjection.relationships` uses, so nothing downstream needs a
   * second type to render a chain step versus a one-hop relationship.
   */
  steps: readonly PublicRelationship[];
  disclosure: { total: number; visible: number; hidden: number };
}

type PublicGraphQuery = GraphQuery<
  PublicEvidenceNode,
  HubZeroRelationshipKind,
  PublicRelationshipData
>;

/**
 * Walks a single causal chain outward from `subjectRef`, one hop at a time,
 * entirely on top of `GraphQuery.outbound`/`inbound` — no new traversal
 * primitive was added to `entity-graph` for this. `direction: 'inbound'`
 * (the default) walks backward — from a Work item back through the Build
 * that informed it to the Lab that Build graduated from — matching the
 * "backward-causation" framing `ADR_PHASE_1_DEFERRALS.md` originally
 * scoped this feature for. `direction: 'outbound'` walks the same edges
 * forward (Lab → Build → Work) for a future caller that wants that
 * narrative instead.
 *
 * Visibility fails closed exactly like `projectEvidence`: the chain stops
 * the moment the next hop's destination isn't publicly resolvable, rather
 * than skipping over it and continuing past a gap. It also stops on a
 * revisited entity (defensive — the conflict resolution in
 * `normalizeRelationshipAssertions` should already prevent a lineage
 * cycle) and after `maxHops`.
 */
export function projectTrace(
  query: PublicGraphQuery,
  destinations: ReadonlyMap<string, PublicEntityLink>,
  subjectRef: { type: PublicEntityType; id: string },
  options: {
    direction?: 'inbound' | 'outbound';
    kinds?: readonly HubZeroRelationshipKind[];
    maxHops?: number;
  } = {},
): TraceProjection | null {
  const direction = options.direction ?? 'inbound';
  const forward = direction === 'outbound';
  const kinds = new Set(options.kinds ?? DEFAULT_TRACE_KINDS);
  const maxHops = options.maxHops ?? DEFAULT_MAX_HOPS;

  const subject = query.get(subjectRef);
  const subjectDestination = destinations.get(refKey(subjectRef));
  if (!subject || !subjectDestination) return null;

  const steps: PublicRelationship[] = [];
  const visited = new Set<string>([refKey(subjectRef)]);
  let current = subjectRef;
  let truncatedByVisibility = false;

  while (steps.length < maxHops) {
    const connections = direction === 'outbound' ? query.outbound(current) : query.inbound(current);
    const next = connections
      .filter((connection) => kinds.has(connection.relationship.kind))
      .sort((left, right) => left.relationship.data.order - right.relationship.data.order)[0];
    if (!next) break;

    const nextRef = direction === 'outbound' ? next.relationship.to : next.relationship.from;
    const nextKey = refKey(nextRef);
    if (visited.has(nextKey)) break;

    const target = query.get(nextRef);
    if (!target) break;

    const destination = destinations.get(nextKey);
    if (!destination) {
      truncatedByVisibility = true;
      break;
    }

    steps.push({
      kind: next.relationship.data.assertionKind,
      label: labelFor(next.relationship.data, forward, nextRef.type),
      target: destination,
    });
    visited.add(nextKey);
    current = nextRef;
  }

  return {
    subject: subjectDestination,
    steps,
    disclosure: {
      total: steps.length + (truncatedByVisibility ? 1 : 0),
      visible: steps.length,
      hidden: truncatedByVisibility ? 1 : 0,
    },
  };
}
