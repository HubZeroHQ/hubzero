import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PublicRelationship } from '@/lib/public/domain';
import { RelationshipCard, relationshipKey, TechnologyList } from './EditorialPrimitives';

// Regression coverage for the post-personnel-migration bug where every
// teamMember target shares the literal '/about' url, so two distinct
// contributors without an Engineering Profile used to collide on the same
// React key (`teamContributedToEntry-/about`).
function teamContributor(referenceId: string, title: string): PublicRelationship {
  return {
    kind: 'teamContributedToEntry',
    label: 'Contributed to',
    target: {
      type: 'teamMember',
      title,
      url: '/about',
      referenceId,
    },
  };
}

describe('relationshipKey', () => {
  it('stays unique across two teamMember contributors that share the same target url', () => {
    const first = teamContributor('HZ-TM-001', 'First contributor');
    const second = teamContributor('HZ-TM-002', 'Second contributor');

    expect(relationshipKey(first)).not.toBe(relationshipKey(second));
  });

  it('is deterministic and stable across repeated calls for the same relationship', () => {
    const relationship = teamContributor('HZ-TM-001', 'First contributor');

    expect(relationshipKey(relationship)).toBe(relationshipKey(relationship));
  });

  it('falls back to target.url when a target has no referenceId, without colliding with a referenceId-bearing target of the same kind', () => {
    const withoutReferenceId: PublicRelationship = {
      kind: 'teamContributedToEntry',
      label: 'Contributed to',
      target: { type: 'teamMember', title: 'Legacy target', url: '/legacy' },
    };
    const withReferenceId = teamContributor('HZ-TM-001', 'First contributor');

    expect(relationshipKey(withoutReferenceId)).not.toBe(relationshipKey(withReferenceId));
  });
});

describe('RelationshipCard list rendering', () => {
  it('produces distinct element keys for two contributors sharing the same target url', () => {
    // React's own "Encountered two children with the same key" check (in the
    // fiber child-reconciler) compares exactly these `.key` values on the
    // created elements — asserting on them directly is what actually proves
    // the fix, since renderToStaticMarkup does not run that reconciler and
    // would pass even with colliding keys.
    const relationships = [
      teamContributor('HZ-TM-001', 'First contributor'),
      teamContributor('HZ-TM-002', 'Second contributor'),
    ];

    const elements = relationships.map((relationship) =>
      createElement(RelationshipCard, {
        key: relationshipKey(relationship),
        relationship,
        enabled: false,
      }),
    );

    const keys = elements.map((element) => element.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('uses one keyboard-focusable canonical anchor for the whole relationship surface', () => {
    const relationship = teamContributor('HZ-TM-001', 'First contributor');
    const markup = renderToStaticMarkup(
      createElement(RelationshipCard, { relationship, enabled: true }),
    );

    expect(markup).toContain('class="home-relationship-card" href="/about"');
    expect(markup).not.toContain('tabindex');
  });
});

describe('TechnologyList navigation', () => {
  it('links technologies and categories through canonical route adapters', () => {
    const markup = renderToStaticMarkup(
      createElement(TechnologyList, {
        technologies: [
          { kind: 'technology', label: 'TypeScript', slug: 'typescript' },
          { kind: 'category', label: 'Developer tools', slug: 'developer-tools' },
        ],
      }),
    );

    expect(markup).toContain('href="/search?q=TypeScript"');
    expect(markup).toContain('href="/work?category=developer-tools"');
  });
});
