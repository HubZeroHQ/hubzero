import type { UserRole } from '@/types/studio';

/**
 * PLANNING.md §29's capability matrix, expressed as data rather than
 * scattered `role === 'admin'` checks. The permissions middleware (Phase 1
 * priority 6) reads this table; it does not encode role logic of its own.
 *
 * "Repository ownership / final authority" from §29 is descriptive, not an
 * enforceable capability, and is intentionally not modeled here.
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
  | 'manageSystemConfig';

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
  ],
  teamMember: ['createOwnEntry', 'editOwnEntry', 'editAssignedEntry', 'submitForReview'],
};

export function roleHasCapability(role: UserRole, capability: Capability): boolean {
  return ROLE_CAPABILITIES[role].includes(capability);
}
