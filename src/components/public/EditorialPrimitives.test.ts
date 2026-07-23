import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PublicRelationship } from '@/lib/public/domain';
import {
  RelationshipCard,
  relationshipHref,
  relationshipKey,
  TechnologyList,
} from './EditorialPrimitives';

// Regression coverage for the post-personnel-migration bug where every
// teamMember target shares the literal '/about' url, so two distinct
// contributors without an Engineering Profile used to collide on the same
// React key (`teamContributedToEntry-/about`).
function teamContributor(
  referenceId: string,
  title: string,
  profileUrl?: string,
): PublicRelationship {
  return {
    kind: 'teamContributedToEntry',
    label: 'Contributed to',
    target: {
      type: 'teamMember',
      title,
      url: '/about',
      referenceId,
      ...(profileUrl ? { profileUrl } : {}),
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
      target: { type: 'teamMember', title: 'Related target', url: '/about' },
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
    const relationship = teamContributor(
      'HZ-TM-001',
      'First contributor',
      '/about/first-contributor',
    );
    const markup = renderToStaticMarkup(
      createElement(RelationshipCard, { relationship, enabled: true }),
    );

    expect(markup).toContain('class="home-relationship-card" href="/about/first-contributor"');
    expect(markup).not.toContain('tabindex');
  });

  it('links a contributor to their canonical Engineering Profile, never to the About index', () => {
    const relationship = teamContributor(
      'HZ-TM-001',
      'First contributor',
      '/about/first-contributor',
    );
    const markup = renderToStaticMarkup(
      createElement(RelationshipCard, { relationship, enabled: true }),
    );

    expect(markup).toContain('href="/about/first-contributor"');
    expect(markup).not.toContain('href="/about"');
  });

  it('renders a contributor without a public profile as static text instead of linking to /about', () => {
    const relationship = teamContributor('HZ-TM-002', 'No profile yet');
    const markup = renderToStaticMarkup(
      createElement(RelationshipCard, { relationship, enabled: true }),
    );

    expect(markup).not.toContain('<a ');
    expect(markup).not.toContain('href="/about"');
    expect(markup).toContain('No profile yet');
  });

  it('labels retired Build relationship targets with the shared editorial badge', () => {
    const relationship: PublicRelationship = {
      kind: 'buildAppliedInWork',
      label: 'Informed by',
      target: {
        type: 'build',
        title: 'Historical product',
        url: '/builds/historical-product',
        state: 'retired',
      },
    };
    const markup = renderToStaticMarkup(
      createElement(RelationshipCard, { relationship, enabled: true }),
    );

    expect(markup).toContain('class="public-build-state"');
    expect(markup).toContain('data-tone="historical"');
    expect(markup).toContain('Retired');
    expect(markup).toContain('class="home-relationship-title"');
    expect(markup).toContain('class="home-relationship-status"');
  });

  it('keeps a status region present when a relationship has no badge', () => {
    const relationship = teamContributor('HZ-TM-001', 'Current contributor');
    const markup = renderToStaticMarkup(
      createElement(RelationshipCard, { relationship, enabled: true }),
    );

    expect(markup).toContain('class="home-relationship-title"');
    expect(markup).toContain('class="home-relationship-status"></span>');
  });
});

describe('relationshipHref', () => {
  it('resolves a teamMember contributor to their canonical Engineering Profile url', () => {
    const relationship = teamContributor('HZ-TM-001', 'Contributor', '/about/contributor');

    expect(relationshipHref(relationship)).toBe('/about/contributor');
  });

  it('never resolves a teamMember contributor to the About index, with or without a profile', () => {
    const withProfile = teamContributor('HZ-TM-001', 'Contributor', '/about/contributor');
    const withoutProfile = teamContributor('HZ-TM-002', 'No profile yet');

    expect(relationshipHref(withProfile)).not.toBe('/about');
    expect(relationshipHref(withoutProfile)).not.toBe('/about');
    expect(relationshipHref(withoutProfile)).toBeUndefined();
  });

  it('resolves every non-teamMember relationship kind through its own target.url, unchanged', () => {
    const relationships: PublicRelationship[] = [
      {
        kind: 'buildAppliedInWork',
        label: 'Informed by',
        target: { type: 'build', title: 'A build', url: '/builds/a-build' },
      },
      {
        kind: 'labGraduatedToBuild',
        label: 'Graduated to',
        target: { type: 'lab', title: 'A lab', url: '/labs/a-lab' },
      },
      {
        kind: 'artifactUsesBlueprint',
        label: 'Built on',
        target: { type: 'blueprint', title: 'A blueprint', url: '/blueprints/a-blueprint' },
      },
      {
        kind: 'noteDiscussesArtifact',
        label: 'Discussed in',
        target: { type: 'note', title: 'A note', url: '/notes/a-note' },
      },
      {
        kind: 'profileFeaturesEvidence',
        label: 'Features',
        target: { type: 'engineeringProfile', title: 'A profile', url: '/about/a-profile' },
      },
    ];

    for (const relationship of relationships) {
      expect(relationshipHref(relationship)).toBe(relationship.target.url);
    }
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
