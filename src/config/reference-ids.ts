import type { ReferenceIdPrefix } from '@/types/studio';

/**
 * PLANNING.md §27 — the permanent `HZ-{PREFIX}-{NNN}` scheme. Centralized so
 * a collection's prefix is defined exactly once, never inlined at call
 * sites. Leads and Users are deliberately absent — they never receive a
 * reference ID (§26.8, §26.9).
 */
export const REFERENCE_ID_PREFIXES = {
  work: 'WK',
  builds: 'BL',
  blueprints: 'BP',
  labs: 'LB',
  notes: 'NT',
  team: 'TM',
  engineeringProfiles: 'EP',
} as const satisfies Record<string, ReferenceIdPrefix>;

export const REFERENCE_ID_PAD_LENGTH = 3;
