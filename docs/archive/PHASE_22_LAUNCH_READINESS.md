# Phase 22 launch-readiness review

Reviewed: 2026-07-18

## Decision

The public application is code-ready for review, but the publication is intentionally **not approved for launch**. `PUBLIC_SITE.release.live` and `PUBLIC_SITE.release.feed` remain disabled until the content gates in `LAUNCH_READINESS.md` are met.

The current public repository exposes one eligible Note. Work, Builds, Blueprints, Labs, Engineering profiles, and the related homepage evidence chapters do not yet contain enough eligible published material. Their empty states are intentional and no placeholder or fabricated records have been added.

## Search architecture

- `/search` is server-rendered from the existing public repository layer.
- `/api/search` provides the command-palette endpoint and uses the same visibility-safe query.
- Matching covers titles, summaries, references, authors, technologies, taxonomy, and visible relationships.
- Ranking prioritizes title and reference matches, then direct metadata matches, technology matches, and relationship context.
- Results are grouped by the four pillars and supporting publication types.
- Only records that pass the public repository's published, visibility, and relationship-boundary rules enter the search projection.
- The bounded search projection is cached, and relationship summaries are assembled in batches to avoid per-result inverse lookups.

## Public route review

| Route family | Implementation state | Launch observation |
| --- | --- | --- |
| Homepage | Ready | Evidence chapters correctly reflect the eligible repository corpus. |
| Work, Builds, Blueprints, Labs | Ready | Honest empty states; launch content gate is not met. |
| Notes | Ready | One eligible published Note; launch content gate is not met. |
| Engineering | Ready | Honest empty state; launch content gate is not met. |
| About, Services, Contact | Ready | Existing publication content and forms preserved. |
| Search | Ready | Empty-query, grouped-results, no-results, and unavailable states verified. |
| Detail routes | Ready | Missing, draft, hidden, and ineligible records continue to fail closed. |
| RSS | Ready behind gate | Returns 404 while the feed release flag is disabled. |
| Sitemap and robots | Ready behind gate | Remain closed while the public release flag is disabled. |

## Consistency and discovery

- Breadcrumbs and empty states now share public editorial primitives.
- Relationship panels retain typed relationship labels and link only to visible summaries.
- Collection cards, result rows, metadata, navigation state, and focus treatment use the existing design language.
- Search is available from the global navigation and with `Command/Ctrl + K`.
- Desktop and mobile layouts were checked for overflow, section rhythm, and navigation reachability.

## Accessibility

- Search supports keyboard opening, arrow-key result movement, Enter activation, Escape dismissal, and trigger-focus restoration.
- Route changes restore focus to the main content region.
- Search status changes are announced through a live region.
- Search form, dialog, grouped results, breadcrumbs, articles, and navigation expose named semantics and landmarks.
- Heading hierarchy was inspected on the homepage, collection index, search, and Note detail routes.
- Reduced-motion behavior remains centralized in the global public styles.

## Performance observations

- Public pages remain server-rendered; the interactive search dialog is the only new global client boundary.
- Search data is projected at the repository boundary, cached, and bounded before it reaches the client.
- Public images continue to use `next/image`, explicit dimensions, and responsive `sizes`.
- Eager image loading is reserved for the first eligible prominent homepage image.
- The production build reports 102 kB of shared first-load JavaScript; representative public routes are 106–111 kB, with Contact at 132 kB.

## SEO and machine discovery

- Canonical URLs and route metadata remain centralized.
- Search is excluded from indexing but allows discovery links once the site is live.
- Sitemap entries are deduplicated and include only eligible collection/detail routes.
- RSS includes visible Notes only and is advertised only when the feed gate is enabled.
- Robots, sitemap, Open Graph, structured data, and feed behavior remain subordinate to the release flags.

## Remaining launch gates

Before enabling the public release flags:

1. Publish the required real Work, Build, Blueprint, Lab, Note, and Engineering evidence.
2. Complete editorial and relationship QA against that final corpus.
3. Confirm production canonical origin, social imagery, analytics, and contact delivery settings.
4. Run the final production-domain crawl, accessibility audit, and performance budget check.
5. Approve the launch decision recorded in `LAUNCH_READINESS.md`.
