# Public Data Layer

**Status:** Phase 12 architecture proposal — documentation only

**Scope:** The canonical read architecture between Studio and every public HubZero surface

This document defines how Studio powers the public website. `PLANNING.md` and `CMS_PRODUCT_DESIGN.md` remain canonical for Studio's write model, workflows, and permissions. This document is canonical for public reads, visibility, resolution, caching, and delivery.

## Purpose

### Why a public read layer exists

Studio and the public website serve different domains.

Studio stores editorial records as authors and administrators need to manage them: MongoDB identifiers, workflow state, ownership metadata, unresolved references, internal URLs, and polymorphic Documents. The public website needs safe, stable, presentation-ready objects: published identity, resolved media and taxonomy, typed public links, derived display state, and no internal implementation details.

A public read layer exists to make that boundary explicit.

### Why public surfaces never consume MongoDB directly

The public website must never consume MongoDB collections directly because direct consumption would:

- couple public templates to Studio's persistence schema;
- duplicate visibility checks across routes and features;
- make internal identifiers and metadata easy to leak accidentally;
- encourage route-specific relationship and media resolution;
- create inconsistent behavior between pages, search, sitemaps, RSS, and structured data;
- bypass shared caching and revalidation rules;
- make a future storage change unnecessarily become a public-site rewrite.

Studio models are write-domain records. Public domain objects are read models. Similar field names do not make them the same contract.

## Architecture

```text
┌─────────────────────────────┐
│ Studio                      │
│ records · workflow · media  │
│ documents · relationships   │
└──────────────┬──────────────┘
               │ reads through typed repositories
               ▼
┌─────────────────────────────┐
│ Repository layer            │
│ persistence access only     │
└──────────────┬──────────────┘
               │ internal models
               ▼
┌─────────────────────────────┐
│ Public read models / DTOs   │
│ visibility · resolution     │
│ derivation · sanitization   │
└──────────────┬──────────────┘
               │ public objects only
               ▼
┌─────────────────────────────┐
│ Caching and revalidation    │
│ entry · index · relation    │
│ discovery projections       │
└──────────────┬──────────────┘
               │ cacheable public reads
               ▼
┌─────────────────────────────┐
│ Public surfaces             │
│ website · search · sitemap  │
│ RSS · structured data       │
└─────────────────────────────┘
```

### Responsibilities

| Layer | Owns | Must not own |
|---|---|---|
| Studio | Editing, workflow, permissions, internal provenance, persistence records | Public presentation or route-specific DTOs |
| Repository layer | Typed database access, bounded queries, persistence concerns | Public visibility policy or rendering decisions |
| Public read layer | Visibility, field allow-lists, relationship/media/taxonomy/author resolution, derived public fields | Editing, workflow transitions, or database writes |
| Cache/revalidation layer | Reuse, invalidation dependencies, stable public projections | Deciding whether content is public |
| Public surfaces | Composition, semantics, accessibility, public interaction | MongoDB access, ObjectId handling, or ad hoc visibility rules |

Public route modules, search builders, sitemap generators, feeds, and structured-data builders consume the public read layer only. Repository results do not cross that boundary.

## Public DTO philosophy

A public DTO is a deliberate allow-list, not a Studio object with a few fields deleted.

Every DTO must be:

- safe to serialize and cache;
- stable enough for more than one public consumer;
- free of MongoDB `ObjectId` values and Studio-only metadata;
- complete for its declared public purpose;
- explicit about nullable or omitted relations;
- constructed only after visibility has been established;
- composed from smaller shared public objects rather than embedded internal records.

### DTO families

The read layer exposes purpose-shaped DTOs rather than one oversized object per collection.

| DTO family | Purpose | Includes | Excludes |
|---|---|---|---|
| Summary | Homepage, indexes, relationship links, search projections | Title/name, slug, reference ID where public, collection type, concise description, public state, resolved lead media when needed | Document bodies, internal relations, editor metadata |
| Detail | Canonical detail route | Summary fields plus collection-specific public fields, resolved relationships, owned public Documents | Unused Studio fields, unrelated collections |
| Document | Public block rendering | Validated blocks with public media, taxonomy, links, and safe content resolved | Owner IDs, editor flags, version records |
| Author | Note bylines and Profile links | Public name, role where appropriate, portrait, Team/Profile URL when visible | User ID, email, role permissions, account image unless intentionally public |
| Discovery | Search, sitemap, RSS, structured data | Only fields required by that surface, derived from an already-visible public DTO | Independent Studio queries or alternative visibility logic |

List and Homepage reads never load full Document bodies. Detail reads load only Documents owned by the requested visible entry and needed by its approved public narrative.

### Internal field removal

Internal fields are excluded by construction, including:

- `_id` and every raw foreign-key ObjectId;
- `createdByUserId`, `userId`, assignment fields, permissions, and workflow actors;
- User email, password data, system role, and account metadata;
- Lead data and internal notes;
- Lab `internalRepoUrl` and any other explicitly internal URL;
- Media management fields that have no public purpose;
- Document version records and editor-only annotations;
- draft, review, approval, or archival workflow metadata beyond the public visibility decision.

Slugs, permanent public reference IDs, canonical URLs, and typed relationship URLs are the public identifiers.

### Resolved media

Public DTOs replace media IDs with public media descriptors containing only what rendering requires:

- delivery URL or transformation source;
- meaningful alt text;
- intrinsic width and height;
- optional public caption and credit;
- the approved crop/role needed to request responsive variants.

No public component performs a Media collection lookup.

### Resolved taxonomy

Technology, category, and topic IDs become typed public terms with label, slug, and kind. Public filters and links consume the same resolved terms, so a label cannot drift between an index, a detail page, and search.

### Resolved relationships

Raw relationship IDs become typed public link summaries containing the destination collection, title, slug/URL, reference ID where relevant, relationship label, and only the metadata needed to understand the connection.

The source record never controls arbitrary public link copy. Relationship vocabulary is defined by `PUBLIC_INFORMATION_ARCHITECTURE.md`; the read layer applies it consistently.

### Author resolution

Notes store authorship against a Studio User. The public read layer resolves the safe path:

```text
Note.authorId
    ↓ internal User lookup
public Team record linked by userId?
    ├─ no  → public author name allowed by the approved fallback contract
    └─ yes → published Engineering Profile for that Team member?
               ├─ no  → Team identity and About destination
               └─ yes → Team identity and Engineering Profile destination
```

The resulting Author DTO never contains the User record or its internal identifier. Other collection types do not infer public contributors from `createdByUserId`.

### Derived fields

The read layer may derive fields only when an approved public surface uses them. Valid derivations include:

- canonical public URL;
- display state from Lab stage or Build deployment state;
- formatted public dates and recency inputs;
- inverse relationship summaries;
- Document outline from public heading blocks;
- reading metadata used by an approved article surface;
- public external-link availability after URL policy checks.

Derived fields must remain deterministic from visible source records and configuration. They are not a place for hidden editorial scoring or fabricated content.

## Canonical visibility

One fail-closed visibility policy governs every public consumer.

Conceptually, an entity is publicly visible only when all conditions for its type are true:

| Type | Visibility rule |
|---|---|
| Work, Build, Blueprint, Lab, Note | `status` is `published` |
| Service | `status` is `published` |
| Team | `publicProfile` is `true` |
| Engineering Profile | Profile is `published` and its linked Team record is public |
| Document | Its owner is publicly visible; a Document has no independent public status |
| Media and Taxonomy | Reachable only through a publicly visible owner; public taxonomy queries return only terms backed by at least one visible entity |
| User, Lead, Document Version | Never publicly visible |

Publication is necessary but does not override type-specific requirements. A featured flag affects curation only. It never grants visibility.

The same predicate and public-read entry points are used by:

- canonical routes and index queries;
- Homepage curation;
- public search and command-palette projections;
- sitemap generation;
- RSS and other approved feeds;
- structured data;
- relationship and inverse-relationship queries.

If visibility cannot be proven, the read layer returns no public object. Public consumers do not distinguish draft from missing content, and they do not reveal that a private record exists.

## Relationship resolution

Relationships are navigation, so their resolution must be consistent and reciprocal.

### Forward and inverse relations

The public read layer owns a canonical relationship map. It can resolve a stored forward relation and derive its inverse without requiring editors to maintain duplicate public links.

Examples:

- Lab `graduatedToBuildId` produces **Graduated into** on the Lab and **Originated in** on the visible Build.
- Work `relatedBuildIds` and Build/Work relation data produce the approved **Informed by** / **Applied in client work** pair.
- Work or Build to Blueprint produces the approved **Generalized as** / **Built on** language according to the stored relation's meaning.
- Note references produce **Discusses** on the Note and **Engineering notes** on the visible target.

Where Studio already maintains a symmetric relation, the read layer normalizes it to the same public contract rather than exposing storage direction.

### Unpublished and archived targets

- A relation target must independently pass the canonical visibility policy.
- Draft, in-review, approved-but-unpublished, archived, missing, or mismatched targets are omitted from public relationships.
- The source entry remains renderable without a broken card, empty rail, leaked title, or count that reveals the hidden target.
- Derived inverse queries apply visibility before returning summaries.
- Archived entries leave routes, search, sitemap, RSS, structured data, and relationship projections together through the same invalidation event.

The public layer does not publish a tombstone object unless a future, separately approved archival policy defines one.

## Caching and revalidation

Caching begins after public DTO construction. Raw Studio records are never placed in a public cache namespace.

### Cache boundaries

| Boundary | Typical content | Invalidation scope |
|---|---|---|
| Entry summary | One visible entity's lightweight public identity | Entry, referenced lead media/taxonomy, visibility |
| Entry detail | One visible entity plus approved Documents and relations | Entry, owned Documents, media, taxonomy, relationship targets |
| Collection index | Paginated/filterable visible summaries | Collection membership, visible summary changes, taxonomy |
| Homepage projection | Curated visible summaries required by current chapters | Featured/state/content changes for participating entries |
| Discovery projection | Search records, sitemap items, RSS items, structured-data inputs | Visibility, slug/title/date/summary/author changes |

Cache keys and tags are based on public type, slug/reference, collection, and declared dependencies—not MongoDB IDs exposed to consumers.

### Revalidation policy

Studio publish events drive on-demand revalidation.

The invalidation graph includes:

- publish, unpublish, archive, restore, or visible-field edit;
- owned Document changes on a published entry;
- Media alt text, dimensions, caption, credit, or asset replacement where used publicly;
- Taxonomy label or slug changes;
- relationship additions/removals and visibility changes at either end;
- Team/Profile visibility changes affecting authorship or Profile routes;
- featured, stage, deployment, version, publication-date, or major-update fields used by Homepage or indexes.

Invalidation removes or regenerates the entry, affected indexes, reciprocal relationship projections, Homepage projection when relevant, and discovery projections. Time-based regeneration may provide resilience, but it is not the primary publication mechanism.

### ISR and CDN compatibility

- Canonical detail and index routes are compatible with static generation and ISR.
- On-demand revalidation follows Studio publication rather than polling.
- Public DTOs are deterministic, serializable, and independent of a visitor session, allowing CDN caching.
- Cache tags or equivalent surrogate keys express dependencies without coupling callers to one hosting provider.
- Personal or privileged preview data never shares the public cache path.
- A future CDN may cache rendered responses or public DTO responses without changing Studio repositories or public components.

## Media delivery

Cloudinary remains the source asset system. The public data layer decides what safe media descriptor may leave Studio; the rendering layer requests the appropriate variant.

Architecture rules:

- Transformation parameters come from approved media roles and responsive breakpoints, not arbitrary visitor input.
- Width and height are always supplied when known so layout space is reserved.
- Responsive variants use the smallest suitable dimensions and modern formats supported by the delivery pipeline.
- Alt text travels with every meaningful image and remains consistent across consumers.
- Decorative images use an explicit empty-alt decision at the public composition layer; missing alt text is never silently converted into decoration.
- Public captions and credits are passed only when present and relevant.
- Original uploads are not served where a transformed variant is appropriate.
- Studio's instructional image placeholder never appears publicly.
- A missing optional image removes or recomposes the media region. A required image uses a calm, static layout-preserving fallback; no blur-up or animated placeholder is introduced by default.

Media changes invalidate every public DTO and rendered surface that declares the asset as a dependency.

## Public search

Search consumes a discovery projection produced by the public read layer. It never queries Studio collections directly.

The projection contains lightweight fields from visible DTOs only: public title/name, type, slug/URL, summary where needed, reference ID, resolved taxonomy labels, public state, and safe author identity where relevant. Full Document bodies are excluded from the initial search contract.

Consequences:

- a draft cannot appear in search while remaining hidden on its route;
- search labels and URLs match canonical pages;
- taxonomy and author names use the same resolver as public pages;
- unpublishing invalidates search with the same event that removes the route;
- moving from a build-time index to a server search endpoint does not change the public search result contract.

If full-document search is later justified by content scale and user evidence, it is built from visible public Document DTOs, not raw Studio blocks.

## Performance architecture

The public data layer supports a server-rendered, content-first website.

### Architectural budgets

| Concern | Budget |
|---|---|
| Server rendering | Default for routes, indexes, Documents, and relationship content |
| Client hydration | Zero by default for static content; each interactive island must justify its payload and boundary |
| List reads | Lightweight summaries only; never Document bodies or full media records |
| Detail reads | Requested entry, owned public Documents, and bounded relationship summaries only |
| Relationship queries | Batched and bounded; no per-card or per-block database waterfalls |
| Media | Responsive transformed assets with reserved dimensions; no unnecessary original delivery |
| Document rendering | Validated server-rendered blocks; no hydration solely for entrance animation |
| Pagination | Server-side once a collection exceeds the approved single-view size |
| Motion | No motion dependency may delay readable content; canonical duration stays within `MOTION_GUIDELINES.md` |

The implementation phase establishes measured route budgets against representative content and current Core Web Vitals guidance. Architecture must make those budgets achievable before visual polish begins.

### Lazy loading and streaming

- Below-the-fold media and non-critical interactive code may load lazily.
- Chapter-specific motion code is loaded only where that chapter exists.
- Streaming may deliver secondary Documents or relationship sections after the primary identity and narrative shell.
- Visibility is resolved before any streamed content is emitted.
- Streaming must not reorder headings, focus, or the meaningful reading sequence.
- Loading fallbacks reserve final geometry and communicate the content type honestly.

## Security boundary

The public data layer is a security boundary, not merely a convenience mapper.

Rules:

- Public DTOs are constructed from explicit field allow-lists.
- No public module accepts or returns MongoDB IDs.
- Public routes cannot import collection accessors or issue direct database queries.
- Visibility fails closed and is applied before relationship, author, Document, or media expansion.
- Internal repository URLs, User data, Leads, permissions, editorial notes, and workflow history never enter a DTO.
- Rich content and URLs remain validated against the Document schema and public rendering policy.
- Errors do not reveal whether a hidden record exists or which visibility condition failed.
- Public cache entries contain public DTOs only and cannot be promoted from preview or authenticated Studio responses.
- Structured data, RSS, and search receive no broader access than canonical routes.

Any future preview capability is a separate authenticated read path with separate cache rules. It must not weaken the public visibility predicate.

## Failure behavior

- A missing or non-visible primary entity produces no DTO.
- A missing optional relation, media asset, taxonomy term, or author destination is omitted or represented through an approved safe fallback.
- Resolution failures never cause raw internal records to be returned as a fallback.
- Partial public objects are allowed only where the DTO contract explicitly declares the field optional and the resulting surface remains truthful.
- Public consumers log operational failures server-side without exposing Studio data to the visitor.

## Future evolution

The boundary supports additional public consumers without changing Studio's write model:

- **Public APIs** can version and serialize approved DTOs behind a separate delivery policy.
- **Mobile applications** can consume the same public domain objects with platform-specific presentation.
- **RSS and feeds** remain projections of visible Notes or other explicitly approved public content.
- **Future analytics** can refer to public slugs, reference IDs, types, and relationship labels without collecting or exposing database identifiers.
- **Future personalization** may select among already-visible DTOs; it cannot broaden visibility or access Studio records directly.
- **Additional discovery surfaces** can build projections from the same public objects and invalidation events.

These are supported extension points, not features authorized by Phase 12.

## Architectural invariants

1. Studio records never cross directly into public components.
2. Repositories do not decide public presentation or visibility.
3. Every public entity passes one canonical visibility policy.
4. Every public DTO is an allow-listed, identifier-safe domain object.
5. Documents inherit owner visibility.
6. Relationships are resolved reciprocally and filtered at both ends.
7. Search, sitemap, RSS, structured data, and routes consume the same public read layer.
8. Public caching begins after DTO construction and invalidates by declared dependency.
9. Server rendering and zero-default hydration remain the performance baseline.
10. New public consumers extend the read layer; they never bypass it.
