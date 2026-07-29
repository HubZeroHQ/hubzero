import type { PublishStatus } from '@/types/studio';

/**
 * PLANNING.md §28 — one shared state machine used across Work, Builds,
 * Blueprints, Labs, and Notes. Only the forward transitions the plan
 * actually specifies are modeled here; Head Admin's unpublish/override
 * capability (§29) is a separate escape hatch, not a normal transition, and
 * is handled by the permissions layer rather than this map.
 *
 * Archive is not a dead end: `archived -> draft` ("Restore") is a real
 * modeled forward transition like any other, gated by `capabilityForTransition`
 * in `workflow-permissions.ts` rather than Head Admin's blanket
 * `unpublishOverride` escape hatch — a restored entry re-enters the same
 * draft -> review -> publish path every other entry does.
 */
export const PUBLISH_WORKFLOW_ORDER: readonly PublishStatus[] = [
  'draft',
  'inReview',
  'approved',
  'published',
  'archived',
];

export const PUBLISH_WORKFLOW_TRANSITIONS: Record<PublishStatus, readonly PublishStatus[]> = {
  draft: ['inReview'],
  inReview: ['approved'],
  approved: ['published'],
  published: ['archived'],
  archived: ['draft'],
};

export function isValidPublishTransition(from: PublishStatus, to: PublishStatus): boolean {
  return PUBLISH_WORKFLOW_TRANSITIONS[from].includes(to);
}
