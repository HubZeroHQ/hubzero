import type { PublishStatus, ServicePublishStatus } from '@/types/cms';

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

/** Services (§26.7) — deliberately lighter two-state workflow. */
export const SERVICE_WORKFLOW_TRANSITIONS: Record<
  ServicePublishStatus,
  readonly ServicePublishStatus[]
> = {
  draft: ['published'],
  published: ['draft'],
};

export function isValidPublishTransition(from: PublishStatus, to: PublishStatus): boolean {
  return PUBLISH_WORKFLOW_TRANSITIONS[from].includes(to);
}

export function isValidServiceTransition(
  from: ServicePublishStatus,
  to: ServicePublishStatus,
): boolean {
  return SERVICE_WORKFLOW_TRANSITIONS[from].includes(to);
}
