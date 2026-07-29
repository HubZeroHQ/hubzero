import { describe, expect, it } from 'vitest';
import {
  canReject,
  canUnpublishOverride,
  capabilityForTransition,
  getAvailableTransitions,
} from './workflow-permissions';

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

describe('Restore (archived -> draft)', () => {
  it('is gated by the same `publish` capability as Archive, not a new capability', () => {
    expect(capabilityForTransition('archived', 'draft')).toBe('publish');
  });

  it('appears as an available transition for Admin and Head Admin', () => {
    expect(getAvailableTransitions('archived', 'admin', true)).toEqual(['draft']);
    expect(getAvailableTransitions('archived', 'headAdmin', true)).toEqual(['draft']);
  });

  it('does not appear for a Member, who lacks `publish`', () => {
    expect(getAvailableTransitions('archived', 'member', true)).toEqual([]);
  });

  it('does not appear for any role when the viewer cannot act on the entry', () => {
    expect(getAvailableTransitions('archived', 'headAdmin', false)).toEqual([]);
  });
});

describe('canUnpublishOverride', () => {
  it('no longer covers archived — it has its own non-override Restore transition instead', () => {
    expect(canUnpublishOverride('archived', 'headAdmin')).toBe(false);
  });

  it('still covers published/approved/inReview, which have no other path back to draft', () => {
    expect(canUnpublishOverride('published', 'headAdmin')).toBe(true);
    expect(canUnpublishOverride('approved', 'headAdmin')).toBe(true);
    expect(canUnpublishOverride('inReview', 'headAdmin')).toBe(true);
  });

  it('never applies to draft itself', () => {
    expect(canUnpublishOverride('draft', 'headAdmin')).toBe(false);
  });

  it('is Head Admin only — Admin lacks unpublishOverride', () => {
    expect(canUnpublishOverride('published', 'admin')).toBe(false);
  });
});
