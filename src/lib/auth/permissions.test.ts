import { ObjectId } from 'mongodb';
import { describe, expect, it, vi } from 'vitest';

// `./permissions` imports `auth` from `./index`, which initializes the real
// NextAuth config (next-auth + the MongoDB adapter) — that chain doesn't
// resolve under vitest's module graph (`next-auth` imports `next/server`,
// which isn't available outside a Next.js runtime). Nothing under test here
// calls `auth()` directly (only `canActOnEntry`/`canEditEntry`, which take a
// session as a plain argument), so a stub is enough to let the module load.
vi.mock('./index', () => ({ auth: vi.fn() }));

import { canActOnEntry, canEditEntry } from './permissions';

const ownerId = new ObjectId('507f1f77bcf86cd799439011');
const otherId = new ObjectId('507f1f77bcf86cd799439022');

const STATUSES = ['draft', 'inReview', 'approved', 'archived'] as const;

function ownedBy(
  status: 'draft' | 'inReview' | 'approved' | 'published' | 'archived',
  ownerField: 'createdByUserId' | 'assignedToUserId' = 'createdByUserId',
): { status: typeof status; createdByUserId?: ObjectId; assignedToUserId?: ObjectId } {
  return ownerField === 'createdByUserId'
    ? { status, createdByUserId: ownerId }
    : { status, assignedToUserId: ownerId };
}

describe('canEditEntry', () => {
  it('matches canActOnEntry exactly for every non-published status', () => {
    for (const status of STATUSES) {
      const entry = ownedBy(status);
      for (const session of [
        { role: 'member' as const, userId: ownerId.toString() },
        { role: 'member' as const, userId: otherId.toString() },
        { role: 'admin' as const, userId: otherId.toString() },
        { role: 'headAdmin' as const, userId: otherId.toString() },
      ]) {
        expect(canEditEntry(entry, session)).toBe(canActOnEntry(entry, session));
      }
    }
  });

  it('blocks the owning Member from editing a published entry, even though canActOnEntry alone would allow it', () => {
    const entry = ownedBy('published');
    const session = { role: 'member' as const, userId: ownerId.toString() };

    expect(canActOnEntry(entry, session)).toBe(true);
    expect(canEditEntry(entry, session)).toBe(false);
  });

  it('blocks an assigned Member from editing a published entry', () => {
    const entry = ownedBy('published', 'assignedToUserId');
    const session = { role: 'member' as const, userId: ownerId.toString() };

    expect(canActOnEntry(entry, session)).toBe(true);
    expect(canEditEntry(entry, session)).toBe(false);
  });

  it('still allows Admin and Head Admin to edit a published entry', () => {
    const entry = ownedBy('published');

    expect(canEditEntry(entry, { role: 'admin', userId: otherId.toString() })).toBe(true);
    expect(canEditEntry(entry, { role: 'headAdmin', userId: otherId.toString() })).toBe(true);
  });

  it('a Member with no relationship to the entry is blocked regardless of status', () => {
    for (const status of [...STATUSES, 'published'] as const) {
      const entry = ownedBy(status);
      expect(canEditEntry(entry, { role: 'member', userId: otherId.toString() })).toBe(false);
    }
  });
});
