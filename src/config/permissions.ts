import type { UserRole } from '@/types/studio';

/**
 * PLANNING.md §29's capability matrix, expressed as data rather than
 * scattered `role === 'admin'` checks. The permissions middleware (Phase 1
 * priority 6) reads this table; it does not encode role logic of its own.
 *
 * "Repository ownership / final authority" from §29 is descriptive, not an
 * enforceable capability, and is intentionally not modeled here.
 *
 * `manageMedia` is granted to every role: Media is a shared Library
 * resource (CMS_PRODUCT_DESIGN.md §1, §8), not workflow-driven Content, and
 * §8's permissions table never scopes Library access by role the way it
 * does Content/Leads/Settings. It isn't a `PublishableEntity` either
 * (`types/studio.ts`), so it has no ownership boundary for `editOwnEntry`/
 * `editAssignedEntry` to key off — deleting a shared asset is guarded
 * instead by the usage-warning flow in `lib/media/usage.ts`, not by role.
 */
export type Capability =
  | 'createOwnEntry'
  | 'createAnyEntry'
  | 'editOwnEntry'
  | 'editAssignedEntry'
  | 'editAnyEntry'
  | 'submitForReview'
  | 'approve'
  | 'publish'
  | 'unpublishOverride'
  | 'manageUsers'
  | 'manageSystemConfig'
  | 'manageMedia';

export const ROLE_CAPABILITIES: Record<UserRole, readonly Capability[]> = {
  headAdmin: [
    'createOwnEntry',
    'createAnyEntry',
    'editOwnEntry',
    'editAssignedEntry',
    'editAnyEntry',
    'submitForReview',
    'approve',
    'publish',
    'unpublishOverride',
    'manageUsers',
    'manageSystemConfig',
    'manageMedia',
  ],
  admin: [
    'createOwnEntry',
    'createAnyEntry',
    'editOwnEntry',
    'editAssignedEntry',
    'editAnyEntry',
    'submitForReview',
    'approve',
    'publish',
    'manageMedia',
  ],
  teamMember: [
    'createOwnEntry',
    'editOwnEntry',
    'editAssignedEntry',
    'submitForReview',
    'manageMedia',
  ],
};

export function roleHasCapability(role: UserRole, capability: Capability): boolean {
  return ROLE_CAPABILITIES[role].includes(capability);
}
