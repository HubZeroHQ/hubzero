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
 * `published -> archived` and `archived -> draft` ("Restore") both reuse
 * `publish` rather than inventing new capabilities — §29 never names a
 * distinct "archive" or "restore" capability, and the people who may
 * publish are the same people who may retire an entry from public view or
 * bring it back. Head Admin's unpublish override (`published`/`approved`/
 * `inReview` back to `draft`, for states with no other defined path) is
 * handled separately by `unpublishOverride`, not modeled as a forward
 * transition here — `archived` no longer needs that escape hatch now that
 * it has a real modeled transition of its own (see `canUnpublishOverride`).
 */
const TRANSITION_CAPABILITY: Record<string, Capability> = {
  'draft->inReview': 'submitForReview',
  'inReview->approved': 'approve',
  'approved->published': 'publish',
  'published->archived': 'publish',
  'archived->draft': 'publish',
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

/**
 * Whether `role` may invoke Head Admin's unpublish override on `current` —
 * Head Admin always passes `requireEntryCapability` via `editAnyEntry`, so
 * no separate entry check is needed here. `archived` is excluded: it now has
 * its own modeled, non-override "Restore" transition (`archived -> draft`,
 * gated by `publish` via `capabilityForTransition`), so the blanket override
 * would otherwise just be a redundant second button doing the same thing.
 */
export function canUnpublishOverride(current: PublishStatus, role: UserRole): boolean {
  return (
    current !== 'draft' && current !== 'archived' && roleHasCapability(role, 'unpublishOverride')
  );
}

/**
 * Whether `role` may reject an entry currently `inReview` back to `draft`
 * with a required reviewer note — the explicit re-review path, distinct from
 * Head Admin's blanket, note-less `unpublishOverride`. Gated by the same
 * `approve` capability as moving the entry forward, since a rejection is the
 * other half of the same review decision.
 */
export function canReject(current: PublishStatus, role: UserRole): boolean {
  return current === 'inReview' && roleHasCapability(role, 'approve');
}
