import { describe, expect, it } from 'vitest';
import { isPublicDocumentRole, isPubliclyVisible, publicFailureStatus } from './visibility';

describe('canonical public visibility', () => {
  it.each(['draft', 'inReview', 'approved', 'archived', undefined, 'unknown'])(
    'fails closed for workflow state %s',
    (status) => expect(isPubliclyVisible({ type: 'work', status })).toBe(false),
  );

  it('allows only published workflow records and published services', () => {
    expect(isPubliclyVisible({ type: 'build', status: 'published' })).toBe(true);
    expect(isPubliclyVisible({ type: 'service', status: 'published' })).toBe(true);
    expect(isPubliclyVisible({ type: 'service', status: 'draft' })).toBe(false);
  });

  it('keeps Team and Profile visibility type-aware', () => {
    expect(isPubliclyVisible({ type: 'teamMember', publicProfile: true })).toBe(true);
    expect(isPubliclyVisible({ type: 'teamMember', publicProfile: false })).toBe(false);
    expect(
      isPubliclyVisible({ type: 'engineeringProfile', status: 'published', teamPublic: true }),
    ).toBe(true);
    expect(
      isPubliclyVisible({ type: 'engineeringProfile', status: 'published', teamPublic: false }),
    ).toBe(false);
  });

  it('allows only approved owner/document role pairs', () => {
    expect(isPublicDocumentRole('Build', 'technical')).toBe(true);
    expect(isPublicDocumentRole('Build', 'body')).toBe(false);
    expect(isPublicDocumentRole('Team', 'profile')).toBe(false);
  });

  it('makes hidden primary states indistinguishable', () => {
    expect(publicFailureStatus('notFound')).toBe(404);
    expect(publicFailureStatus('unpublished')).toBe(404);
    expect(publicFailureStatus('archived')).toBe(404);
    expect(publicFailureStatus('malformed')).toBe(404);
    expect(publicFailureStatus('unavailable')).toBe(503);
  });
});
