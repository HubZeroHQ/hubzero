import type { PublishStatus } from '@/types/studio';

/**
 * PLANNING.md §28 — one shared state machine used across Work, Builds,
 * Blueprints, Labs, and Notes. Only the forward transitions the plan
 * actually specifies are modeled here; Head Admin's unpublish/override
 * capability (§29) is a separate escape hatch, not a normal transition, and
 * is handled by the permissions layer rather than this map.
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
  archived: [],
};

export function isValidPublishTransition(from: PublishStatus, to: PublishStatus): boolean {
  return PUBLISH_WORKFLOW_TRANSITIONS[from].includes(to);
}
