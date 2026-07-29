import { describe, expect, it } from 'vitest';
import { isPublicDocumentRole, isPubliclyVisible, publicFailureStatus } from './visibility';

describe('canonical public visibility', () => {
  const workflowTypes = ['work', 'build', 'blueprint', 'lab', 'note'] as const;
  const hiddenStates = ['draft', 'inReview', 'approved', 'archived', undefined, 'unknown'] as const;

  it.each(workflowTypes.flatMap((type) => hiddenStates.map((status) => [type, status] as const)))(
    'fails closed for %s workflow state %s',
    (type, status) => expect(isPubliclyVisible({ type, status })).toBe(false),
  );

  it.each(workflowTypes)('allows only the published state for %s', (type) =>
    expect(isPubliclyVisible({ type, status: 'published' })).toBe(true),
  );

  it('allows only published services', () => {
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
