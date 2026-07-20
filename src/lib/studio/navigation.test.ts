import { describe, expect, it } from 'vitest';
import { getBreadcrumbItems } from './navigation';

describe('getBreadcrumbItems', () => {
  it('gives every segment before the last an href, and the last none', () => {
    const items = getBreadcrumbItems('/studio/settings/users');
    expect(items).toEqual([
      { label: 'Settings', href: '/studio/settings/users' },
      { label: 'Users', href: '/studio/settings/users' },
    ]);
  });

  it("keeps the group crumb clickable (points at the group's first destination) even deep on an entry page", () => {
    const items = getBreadcrumbItems('/studio/team/64f0000000000000000000ab/edit');
    expect(items[0]).toEqual({ label: 'Studio', href: '/studio/team' });
  });

  it('returns nothing for an unresolved path', () => {
    expect(getBreadcrumbItems('/studio/does-not-exist')).toEqual([]);
  });
});
