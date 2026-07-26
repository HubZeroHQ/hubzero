import { describe, expect, it } from 'vitest';
import { canReject } from './workflow-permissions';

describe('canReject', () => {
  it('allows Admin and Head Admin to reject an entry that is inReview', () => {
    expect(canReject('inReview', 'admin')).toBe(true);
    expect(canReject('inReview', 'headAdmin')).toBe(true);
  });

  it('does not allow a Member to reject', () => {
    expect(canReject('inReview', 'member')).toBe(false);
  });

  it('is only available from inReview — not draft, approved, published, or archived', () => {
    for (const status of ['draft', 'approved', 'published', 'archived'] as const) {
      expect(canReject(status, 'admin')).toBe(false);
      expect(canReject(status, 'headAdmin')).toBe(false);
    }
  });
});
