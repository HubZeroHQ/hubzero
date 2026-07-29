import { describe, expect, it } from 'vitest';
import { getBreadcrumbItems } from './navigation';

const id = '64f0000000000000000000ab';

describe('getBreadcrumbItems', () => {
  it('keeps semantic groups non-clickable when they do not have a page', () => {
    expect(getBreadcrumbItems('/studio/content/builds')).toEqual([
      { label: 'Content' },
      { label: 'Builds', href: '/studio/content/builds' },
    ]);
    expect(getBreadcrumbItems('/studio/settings/users')).toEqual([
      { label: 'Settings' },
      { label: 'Users', href: '/studio/settings/users' },
    ]);
  });

  it('builds collection, detail, edit, and create hierarchy from route metadata', () => {
    expect(getBreadcrumbItems(`/studio/content/builds/${id}`)).toEqual([
      { label: 'Content' },
      { label: 'Builds', href: '/studio/content/builds' },
      { label: 'Build', href: `/studio/content/builds/${id}` },
    ]);
    expect(getBreadcrumbItems(`/studio/content/builds/${id}/edit`)).toEqual([
      { label: 'Content' },
      { label: 'Builds', href: '/studio/content/builds' },
      { label: 'Build', href: `/studio/content/builds/${id}` },
      { label: 'Edit' },
    ]);
    expect(getBreadcrumbItems('/studio/content/builds/new')).toEqual([
      { label: 'Content' },
      { label: 'Builds', href: '/studio/content/builds' },
      { label: 'New' },
    ]);
  });

  it('does not link an intermediate resource when no detail page exists', () => {
    expect(getBreadcrumbItems(`/studio/library/taxonomy/${id}/edit`)).toEqual([
      { label: 'Library' },
      { label: 'Taxonomy', href: '/studio/library/taxonomy' },
      { label: 'Taxonomy term' },
      { label: 'Edit' },
    ]);
  });

  it('uses a real parent route for profile settings', () => {
    expect(getBreadcrumbItems('/studio/profile/change-password')).toEqual([
      { label: 'Profile', href: '/studio/profile' },
      { label: 'Change password', href: '/studio/profile/change-password' },
    ]);
  });

  it.each([
    '/studio/dashboard',
    '/studio/content/work',
    '/studio/content/builds',
    '/studio/content/blueprints',
    '/studio/content/labs',
    '/studio/content/notes',
    '/studio/team',
    '/studio/engineering-profiles',
    '/studio/services',
    '/studio/leads',
    '/studio/library/media',
    '/studio/library/taxonomy',
    '/studio/settings/users',
    '/studio/settings/system',
    '/studio/profile',
  ])('resolves the Studio page %s', (pathname) => {
    expect(getBreadcrumbItems(pathname)).not.toEqual([]);
  });

  it.each([
    '/studio/content/work',
    '/studio/content/builds',
    '/studio/content/blueprints',
    '/studio/content/labs',
    '/studio/content/notes',
    '/studio/team',
    '/studio/engineering-profiles',
    '/studio/services',
    '/studio/settings/users',
  ])('supports valid create, detail, and edit routes beneath %s', (base) => {
    expect(getBreadcrumbItems(`${base}/new`).at(-1)).toEqual({ label: 'New' });
    expect(getBreadcrumbItems(`${base}/${id}`).at(-1)?.label).toBeTruthy();
    expect(getBreadcrumbItems(`${base}/${id}/edit`).at(-1)).toEqual({ label: 'Edit' });
  });

  it('rejects unsupported or fabricated descendants', () => {
    expect(getBreadcrumbItems('/studio/dashboard/invalid')).toEqual([]);
    expect(getBreadcrumbItems('/studio/library/media/new')).toEqual([]);
    expect(getBreadcrumbItems(`/studio/library/taxonomy/${id}`)).toEqual([]);
    expect(getBreadcrumbItems('/studio/content/builds/invalid/extra')).toEqual([]);
    expect(getBreadcrumbItems('/studio/does-not-exist')).toEqual([]);
  });
});
