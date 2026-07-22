import { describe, expect, it } from 'vitest';
import { isPublicDetailEntityType, publicRoute } from './routes';

describe('publicRoute', () => {
  it('owns every canonical public collection URL', () => {
    expect(publicRoute.home()).toBe('/');
    expect(publicRoute.collection('work')).toBe('/work');
    expect(publicRoute.collection('build')).toBe('/builds');
    expect(publicRoute.collection('blueprint')).toBe('/blueprints');
    expect(publicRoute.collection('lab')).toBe('/labs');
    expect(publicRoute.collection('note')).toBe('/notes');
    expect(publicRoute.collection('engineeringProfile')).toBe('/engineering');
    expect(publicRoute.collection('teamMember')).toBe('/about');
    expect(publicRoute.collection('service')).toBe('/services');
  });

  it('encodes detail slugs and query values exactly once', () => {
    expect(publicRoute.entity({ type: 'note', slug: 'ownership first' })).toBe(
      '/notes/ownership%20first',
    );
    expect(publicRoute.workCategory('developer tools')).toBe('/work?category=developer+tools');
    expect(publicRoute.contact({ from: 'footer' })).toBe('/contact?from=footer');
    expect(publicRoute.taxonomy({ kind: 'technology', label: 'Node.js', slug: 'node-js' })).toBe(
      '/search?q=Node.js',
    );
    expect(
      publicRoute.taxonomy({ kind: 'category', label: 'Developer tools', slug: 'developer-tools' }),
    ).toBe('/work?category=developer-tools');
  });

  it('distinguishes detail entities from collection-only public entities', () => {
    expect(isPublicDetailEntityType('work')).toBe(true);
    expect(isPublicDetailEntityType('engineeringProfile')).toBe(true);
    expect(isPublicDetailEntityType('teamMember')).toBe(false);
    expect(isPublicDetailEntityType('service')).toBe(false);
  });
});
