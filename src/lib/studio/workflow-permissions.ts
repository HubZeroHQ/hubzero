import { type Capability, roleHasCapability } from '@/config/permissions';
import { PUBLISH_WORKFLOW_TRANSITIONS } from '@/config/workflow';
import type { PublishStatus, UserRole } from '@/types/studio';

/**
 * Maps each forward transition in the shared five-state workflow (§28) to
 * the capability that gates it (§29). One mapping, reused by Work today and
 * by Builds/Blueprints/Labs/Notes once they exist — every one of those
 * collections runs the exact same state machine, so this is the single
 * place "who can move what" is decided, never a per-collection guess.
 *
 * `published -> archived` reuses `publish` rather than inventing a new
 * capability — §29 never names a distinct "archive" capability, and the
 * people who may publish are the same people who may retire an entry from
 * public view. Head Admin's unpublish override (any state back to `draft`)
 * is handled separately by `unpublishOverride`, not modeled as a forward
 * transition here.
 */
const TRANSITION_CAPABILITY: Record<string, Capability> = {
  'draft->inReview': 'submitForReview',
  'inReview->approved': 'approve',
  'approved->published': 'publish',
  'published->archived': 'publish',
};

export function capabilityForTransition(from: PublishStatus, to: PublishStatus): Capability | null {
  return TRANSITION_CAPABILITY[`${from}->${to}`] ?? null;
}

/**
 * The forward transition(s) a given role may take from `current` status —
 * CMS_PRODUCT_DESIGN.md §8: "hiding what a role can't reach, not disabling
 * it... its absence doesn't invite `why can't I click this`." Every
 * transition also runs through `requireEntryCapability` server-side (§29's
 * own/assigned qualifier), so `canActOnEntry` — the caller's precomputed
 * answer to "does this viewer pass that same ownership check for this
 * entry" — must be `true` before any transition is shown; otherwise a
 * Team Member would see a live "Submit for review" button on someone
 * else's entry that throws a Forbidden error the instant they click it,
 * exactly the disabled-button-shaped confusion §8 rules out.
 */
export function getAvailableTransitions(
  current: PublishStatus,
  role: UserRole,
  canActOnEntry: boolean,
): PublishStatus[] {
  if (!canActOnEntry) {
    return [];
  }
  return PUBLISH_WORKFLOW_TRANSITIONS[current].filter((next) => {
    const capability = capabilityForTransition(current, next);
    return capability !== null && roleHasCapability(role, capability);
  });
}

/** Whether `role` may invoke Head Admin's unpublish override on `current` — Head Admin always passes `requireEntryCapability` via `editAnyEntry`, so no separate entry check is needed here. */
export function canUnpublishOverride(current: PublishStatus, role: UserRole): boolean {
  return current !== 'draft' && roleHasCapability(role, 'unpublishOverride');
}
