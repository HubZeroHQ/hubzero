# Visibility Rules

**Status:** Implemented. Phase 13 canonical public visibility contract; this predicate is live in `src/lib/public/queries.ts` and used by every public consumer.

This document defines the one fail-closed visibility predicate used by every future public consumer. It refines the canonical direction in [PUBLIC_DATA_LAYER.md](PUBLIC_DATA_LAYER.md) without changing Studio workflow. DTO construction is defined in [PUBLIC_DTO_SPECIFICATION.md](PUBLIC_DTO_SPECIFICATION.md).

## Visibility and readiness are different decisions

Visibility is a security and consistency rule: may this Studio record participate in a public read?

Editorial readiness is a publishing-quality rule: is the visible record complete enough for a route, homepage chapter, feed, or launch?

The two must not be conflated:

- A record does not become public because it is complete, featured, linked, recent, or needed by a layout.
- A record does not become launch-ready merely because its Studio status is `published`.
- Completeness gates in [PUBLIC_NARRATIVE.md](../product/PUBLIC_NARRATIVE.md) and [LAUNCH_READINESS.md](../archive/LAUNCH_READINESS.md) operate only after visibility succeeds.
- A public implementation must not add a second route-specific visibility interpretation to hide editorial problems. Editors must fix or unpublish the record.

## Canonical predicate

For a requested entity at evaluation time `now`, public visibility is true only when all rules for its type are proven:

| Studio type | Canonical visibility condition |
|---|---|
| Work | Record exists and `status = published` |
| Build | Record exists and `status = published` |
| Blueprint | Record exists and `status = published` |
| Lab | Record exists and `status = published` |
| Note | Record exists and `status = published` |
| Service | Record exists and `status = published` |
| Team | Record exists and `publicProfile = true` |
| Engineering Profile | Record exists, `status = published`, linked Team exists, and linked Team has `publicProfile = true` |
| Document | Owner exists, owner is visible by this predicate, and Document role is approved for the owner type |
| Media | Never independently visible; reachable only through a visible owner/Document and a valid public media transformation |
| Taxonomy | Never independently visible by record existence alone; returned only when at least one visible owner uses the term |
| User | Never visible |
| Lead | Never visible |
| Document Version | Never visible |

`now` is included for deterministic evaluation and future compatibility, but the current Studio workflow has no scheduled-publication rule. A future-dated Note with `published` status is visible under the current contract. Scheduled publishing would require a separately approved workflow and predicate change.

The predicate evaluates source visibility before expanding Documents, media, taxonomy, authors, or relationships. If any required visibility fact cannot be loaded or validated, the result is false.

## Predicate properties

The canonical predicate is:

- **fail-closed:** missing, malformed, unknown, or unreadable status data is not public;
- **type-aware:** Team and Engineering Profiles have additional conditions beyond workflow status;
- **context-independent:** a record has the same visibility in a route, search, sitemap, feed, or relationship;
- **non-recursive at the primary decision:** an entity's visibility does not depend on whether another entity links to it;
- **free of editorial scoring:** document length, media presence, featured state, and relationship count do not change security visibility;
- **free of authorization leakage:** the public result never explains which condition failed.

## Consumer rule

The following consumers must call the same public-read entry point that applies the predicate above:

1. Canonical detail routes.
2. Collection indexes and filters.
3. Homepage curation.
4. Public search and command-palette projections.
5. XML sitemap generation.
6. RSS or any future feed.
7. Structured-data builders.
8. Breadcrumb and internal-link builders.
9. Forward and inverse relationship resolution.
10. Taxonomy result counts and future taxonomy landing pages.
11. Author/Profile destinations.

Consumers may add narrower eligibility rules after receiving visible DTOs—for example, the Homepage requires a qualifying featured Build—but may never broaden visibility.

## Collection behavior

### Work, Builds, Blueprints, Labs, and Notes

- `draft`, `inReview`, `approved`, `archived`, missing, and malformed records return no public object.
- `published` is the only visible workflow state.
- Featured state changes curation only.
- Deployment state, Lab stage, publication date, and external-link availability describe the visible object but do not grant visibility.
- A published record with incomplete editorial content remains visible by policy and must be repaired or unpublished before launch.

### Services

- Only `published` Services are visible.
- A Service with zero visible evidence links remains visible by the security predicate but fails the editorial gate and must not launch.
- Services have no standalone detail route or sitemap item in the current contract.

### Team Members

- `publicProfile = true` makes the Team identity eligible for the About roster and Author resolution.
- User linkage is not required for Team visibility.
- The optional User record never broadens or narrows Team visibility.
- A missing portrait does not change visibility but may fail an approved layout's readiness standard.
- Team reference IDs are not public even when the Team record is visible.

### Engineering Profiles

- Profile status must be `published`.
- The linked Team record must independently be public.
- If the Team record is hidden, missing, or ambiguous, the Profile returns no public object.
- Removing Team visibility removes the Profile route, search record, sitemap item, relationship targets, and Author Profile destination in the same invalidation event.
- Profile evidence targets are filtered independently; they do not determine Profile security visibility.

### Documents

- Documents never have independent visibility.
- Owner visibility is evaluated first.
- Only the owner/role allow-list in [PUBLIC_DTO_SPECIFICATION.md](PUBLIC_DTO_SPECIFICATION.md#public-document) can be returned.
- A Document with an unexpected role, missing owner, invalid block schema, or hidden owner is not public.
- Empty or thin Documents can be schema-valid and visible through their owner, but they fail editorial readiness.
- Document Versions never become public by inheritance.

### Media

- Media has no public list, detail route, search result, sitemap item, or feed item.
- A Media record is resolved only after a visible owner or visible Document references it.
- The public descriptor must meet the required role contract: safe delivery URL, dimensions, and truthful alt behavior.
- A visible entity does not make every Media record it references automatically usable in every role.
- Media reverse-usage metadata and hidden-owner usage counts never leave Studio.

### Taxonomy

- Taxonomy has no independent visibility based solely on its record.
- A public facet set includes a term only when at least one visible entity references it with the correct kind.
- Counts include visible entities only.
- A hidden record must not influence a label's count, popularity, ordering, or search suggestion.
- A future taxonomy route would use the same supported-term rule and would return no public landing for a term with zero visible entities.

### Users, Leads, and Document Versions

These are always outside the public domain. They cannot appear as fallbacks when resolution fails. Author resolution consumes User internally and returns only the safe Author union in [PUBLIC_DTO_SPECIFICATION.md](PUBLIC_DTO_SPECIFICATION.md#author-resolution).

## Relationship visibility

An edge is public only when:

1. The source entity is visible.
2. The relationship type is approved for that source/target pair.
3. The target entity independently passes the canonical predicate.
4. The target can produce the required Public Entity Link.
5. A dual-stored edge is not contradicted by an integrity conflict defined in [RELATIONSHIP_AUDIT.md](RELATIONSHIP_AUDIT.md).

If any condition fails:

- omit the relationship completely;
- do not expose the hidden target's title, slug, reference ID, status, count, or existence;
- do not render an empty card or broken rail;
- keep the visible source readable;
- use a collection-level next path only when the public narrative calls for one.

Inverse relationships use exactly the same rules. An inverse query is not a privileged path around visibility.

## Author visibility

Note visibility does not depend on a public Team match under the current Phase 12 policy. Author resolution therefore follows these narrower rules after the Note is visible:

- visible Team match → Person Author;
- visible Team plus visible Profile → Person Author linking to Profile;
- missing User, no Team match, multiple Team matches, or hidden Team → HubZero Organization Author;
- never use User name, email, image, role, or `createdByUserId` as a public fallback.

Editors should treat the organization fallback as an attribution repair signal, not the preferred steady state.

## Route and error behavior

- Missing and non-visible slugs produce the same not-found behavior.
- Responses do not disclose whether a record is draft, archived, missing, or malformed.
- No tombstone route is approved.
- Redirects are allowed only through a separately maintained public slug-history contract; MongoDB IDs and reference IDs are not redirect targets by default.
- Preview is a separate authenticated read path with separate cache keys. Preview results never enter public caches or public projections.

## Search, sitemap, RSS, and structured data

- A record cannot appear in discovery unless its canonical route receives the same visible DTO.
- Removing visibility removes the route and all discovery projections together.
- Notes RSS begins only after the Notes surface passes its content gate; each item still re-evaluates canonical visibility.
- Structured data receives no hidden relationship, author, media, or taxonomy data.
- `robots.txt` is not a visibility control. Hidden content must be inaccessible, not merely disallowed from crawling.

## Archive and restore behavior

Archiving a previously published entity removes:

- its canonical public DTO and route;
- collection/homepage membership;
- search, sitemap, RSS, and structured-data projections;
- forward and inverse public relationships;
- taxonomy counts attributable only to that entity;
- Profile evidence and Service evidence links to it.

Restoring an archived full-workflow entity to `published` re-enters the same predicate. Restore does not bypass current DTO validation or editorial review.

## Visibility decision table

| Scenario | Result |
|---|---|
| Published Work with no hero | Visible; may fail editorial readiness |
| Approved Build with a working live URL | Not visible |
| Published Blueprint with a broken preview | Visible; fails Blueprint launch gate |
| Published Lab with malformed current-model fields | Fail closed if a valid source record cannot be read into the public boundary |
| Published Note whose author has no Team record | Note visible; HubZero organization Author |
| Public Team member with no Engineering Profile | Team visible; no Profile link |
| Published Profile whose Team is hidden | Not visible |
| Visible Work linked to archived Build | Work visible; Build relation omitted |
| Taxonomy term referenced only by drafts | Not publicly supported |
| Media referenced by public and draft owners | Public only through approved visible uses; draft usage remains undisclosed |
| Featured draft entity | Not visible |

## Required verification cases for Phase 14

Implementation must later prove, without broadening this phase's scope:

1. Each workflow state for every full-workflow collection.
2. Both Service states.
3. Team public/private combinations with and without User links.
4. Profile published/hidden combinations against Team visibility.
5. Documents with visible, hidden, missing, and wrong-type owners.
6. Forward and inverse relations to visible, hidden, archived, missing, and conflicting targets.
7. Author resolution with visible Profile, Team-only, no Team, duplicate Team, and missing User.
8. Media/taxonomy referenced by mixed visible and hidden owners.
9. Simultaneous removal from route, search, sitemap, RSS, structured data, and inverse relationships.

These are contract acceptance cases, not Phase 13 implementation tasks.
