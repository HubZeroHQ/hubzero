# Public DTO Specification

**Status:** Phase 13 public contract — documentation only, pending review

**Scope:** Stable, implementation-agnostic public read objects derived from Studio

This document refines the DTO direction in [PUBLIC_DATA_LAYER.md](PUBLIC_DATA_LAYER.md). Studio records remain canonical for editing and workflow. These contracts are canonical for public reads. They are field allow-lists, not renamed MongoDB records, and they do not authorize repositories, DTO classes, APIs, caching, search, routes, or components.

## Contract principles

1. A public DTO is constructed only after the source entity passes [VISIBILITY_RULES.md](VISIBILITY_RULES.md).
2. Required means the mapper cannot return that DTO without the field. It does not mean Phase 13 adds a Studio schema field.
3. Optional means omitted when unavailable; public DTOs do not use `null` to carry unresolved Studio state.
4. Derived values are deterministic from visible source records and approved configuration.
5. Relationships, media, taxonomy, authors, and Documents are resolved before a DTO reaches a consumer.
6. Public objects contain URLs, slugs, and public reference IDs—not MongoDB IDs.
7. Summary DTOs never contain Document bodies. Detail DTOs load only the approved Documents and bounded relationships needed by that detail.
8. A Studio field is not public merely because it appears in this specification's mapping notes. Explicit exclusions remain exclusions.

## Shared public vocabulary

### Entity types

The stable public type values are `work`, `build`, `blueprint`, `lab`, `note`, `engineeringProfile`, `teamMember`, and `service`.

Media, Taxonomy, and Documents are supporting public objects, not independently visible entities. Users, Leads, Document Versions, and workflow events have no public entity type.

### Public entity link

Used by relationship targets, search results, breadcrumbs, and compact references.

| Field | Requirement | Source |
|---|---|---|
| `type` | Required | Approved public entity type |
| `title` | Required | Work/Build/Lab/Note title, Blueprint name, Team name, Profile Team name, or Service title |
| `url` | Required | Derived canonical route |
| `referenceId` | Optional | Public reference ID; omitted for Team and Service |
| `summary` | Optional | The target's approved summary field; never synthesized from an arbitrary Document block |
| `state` | Optional | Approved public state summary when navigation needs it |

### Public taxonomy term

| Field | Requirement | Source |
|---|---|---|
| `kind` | Required | `technology`, `category`, or `topic` |
| `label` | Required | Taxonomy label |
| `slug` | Required | Taxonomy slug |
| `url` | Optional, derived | Included only after a canonical public taxonomy route for that facet is approved |

Only terms backed by at least one visible entity appear in public facet sets. A referenced term with the wrong kind is omitted and logged as an integrity error.

### Public media

| Field | Requirement | Source |
|---|---|---|
| `url` | Required | Approved Cloudinary delivery source |
| `width` | Required | Media intrinsic width |
| `height` | Required | Media intrinsic height |
| `alt` | Required for meaningful images | Context-specific Document alt when approved; otherwise Media default alt |
| `role` | Required | Approved public role such as `hero`, `screenshot`, `diagram`, `portrait`, `gallery`, `inline`, or `social` |
| `caption` | Optional | Context caption first, then Media caption |
| `credit` | Optional | Media credit |
| `crop` | Optional, derived | Approved role/crop identifier; never an arbitrary transformation string from a visitor |

The public object excludes Cloudinary public IDs, folders, reuse tags, filenames, file size, MIME type, uploader provenance, and Media record IDs. Missing dimensions or false alt text makes a required public use ineligible; the mapper must not pass through the raw Studio URL as a fallback.

### Public external link

| Field | Requirement | Meaning |
|---|---|---|
| `kind` | Required | `live`, `repository`, `documentation`, `demo`, `attachment`, or another separately approved kind |
| `label` | Required | Plain destination label |
| `url` | Required | Validated `http`/`https` public URL |
| `availability` | Optional, derived | A factual state such as `live` or `retired` only where the source model supports it |

An external link is included only after its public intent is explicit. Private/internal repository URLs are always excluded. HTTP reachability is an editorial readiness check, not a permanent runtime field.

### Public state

Public state describes the artifact, never the Studio workflow.

| Entity | Allowed state inputs |
|---|---|
| Build | Deployment state; optional live-link availability |
| Blueprint | Version; live-preview availability |
| Lab | Stage, current milestone, last major update, next direction/blocker when authored |
| Note | Publication date; optional updated date only when explicitly editorial |
| Engineering Profile | Current exploration; no workflow label |
| Work, Team, Service | No generic state badge unless a future approved field adds a truthful state |

`draft`, `inReview`, `approved`, `published`, and `archived` never appear in public DTOs.

### Public relationship

| Field | Requirement | Source |
|---|---|---|
| `kind` | Required | Stable relationship kind from [RELATIONSHIP_AUDIT.md](RELATIONSHIP_AUDIT.md) |
| `label` | Required, derived | Canonical public vocabulary for source → target direction |
| `target` | Required | Visible Public Entity Link |

Raw IDs, hidden-target counts, editor-authored arbitrary relation labels, and unpublished target metadata are excluded.

### Public Document

| Field | Requirement | Source |
|---|---|---|
| `role` | Required | Approved owner/role mapping |
| `blocks` | Required | Ordered, validated public blocks |
| `outline` | Optional, derived | Ordered heading entries derived from public heading blocks |

The DTO excludes Document ID, owner ID/type, versions, timestamps by default, AI/editor flags, and Studio annotations. Image and gallery blocks contain Public Media; technology-stack blocks contain Public Taxonomy Terms. Unsafe/unresolved links and media are omitted according to the block's failure policy. A required evidence block that cannot remain truthful makes the Document editorially ineligible.

Approved owner/role mapping:

| Owner | Public roles |
|---|---|
| Work | `caseStudy` |
| Build | `caseStudy`, `technical` |
| Blueprint | `caseStudy` |
| Lab | `overview`, `engineeringJournal`, `findings`, `researchNotes`; legacy `journal` may map to `engineeringJournal` only after editorial review |
| Note | `body` |
| Engineering Profile | `introduction`, `interview`, `timeline`, `quotes`, `achievements` |
| Team | No current public Document role |

Unexpected roles are omitted and logged. Empty roles are not returned merely to create navigation.

## DTO families

Each collection provides a Summary and, where it has a canonical detail route, a Detail. Search, sitemap, RSS, and structured data are smaller projections of an already-visible Summary/Detail; they are not alternative DTO families with broader access.

### Work Summary

**Required:** type, title, slug, canonical URL, reference ID, approved summary, client type, timeline, HubZero role, technologies, categories.

**Optional:** hero media, compact public relationships.

**Derived/resolved:** `type = work`; `/work/{slug}`; resolved technology/category terms; visible relation summaries.

**Studio mapping:** title ← `title`; slug ← `slug`; reference ID ← `referenceId`; client type ← `clientType`; timeline ← `timeline`; HubZero role ← `role`; terms ← `technologyIds`/`categoryTagIds`; hero ← `heroImageId`. No current Studio field supplies the required summary. That is a blocking source-model gap.

### Work Detail

**Required:** all Work Summary fields; case-study Document; typed relationships.

**Optional:** public repository link, additional media when explicitly modeled.

**Current-state information:** timeline only. Workflow status and raw timestamps are excluded.

**Visibility:** Work record is published; every related target independently passes visibility; Document inherits Work visibility.

### Build Summary

**Required:** type, title, slug, canonical URL, reference ID, approved product summary, deployment state, technologies.

**Optional:** hero media, live link, repository link, featured state for curation input only.

**Derived/resolved:** `type = build`; `/builds/{slug}`; public state from `deploymentState`; approved external links; visible originating-Lab summary where useful.

**Studio mapping gap:** no structured product summary or version exists. The public contract does not derive either from a Document heading or paragraph.

### Build Detail

**Required:** all Build Summary fields; case-study Document; technical Document; typed relationships.

**Optional:** gallery, live/repository links, originating Lab, related Work, related Blueprints when the Studio model can express them.

**Current-state information:** deployment state and approved live availability. A future version field can extend the DTO additively after approval.

**Relationship gap:** current Build records cannot directly reference Blueprints despite the Phase 12 public narrative. Derived Blueprint backlinks exist only from another stored edge.

**Visibility:** Build record is published; both Documents inherit Build visibility; originating Lab, Work, Blueprint backlinks, media, and taxonomy resolve only through independently visible/valid targets.

### Blueprint Summary

**Required:** type, name as title, slug, canonical URL, reference ID, short description, architecture, design language, version, technologies, live-preview link.

**Optional:** hero media, preview media, repository link, documentation link, featured curation input.

**Derived/resolved:** `type = blueprint`; `/blueprints/{slug}`; validated `Blueprint-X-Y` identity; public state from version and live-preview availability.

### Blueprint Detail

**Required:** all Blueprint Summary fields; features; case-study Document; intended audience and design philosophy contained in substantive approved content; typed proof relationships when real.

**Optional:** gallery/preview assets, repository/docs links, Work/Build proof backlinks.

**Visibility:** published Blueprint plus independently visible relation targets. A published record that lacks a working deployment still passes security visibility but fails the editorial launch gate.

### Lab Summary

**Required:** type, title, slug, canonical URL, reference ID, objective as summary, stage, research direction, current milestone, start date, last major update, technologies.

**Optional:** hero media, public repository, live demo, bounded milestone preview, originating/graduated Build relationship, related Build/Blueprint links, featured curation input.

**Derived/resolved:** `type = lab`; `/labs/{slug}`; display state from stage/milestone; recency input from `lastMajorUpdateAt`; public URLs exclude `internalRepoUrl` unconditionally.

### Lab Detail

**Required:** all Lab Summary fields; graduation criteria; at least one substantive approved Lab Document; milestones when claimed as progress; typed relationships.

**Optional:** all populated Lab Document roles, gallery, public repository/demo, graduated Build.

**Mapping note:** the current Studio model uses four Lab roles while earlier planning described one `journal`. The public Detail accepts the current role set and exposes only populated roles. A legacy `journal` is not silently duplicated across them.

**Visibility:** Lab record is published and readable by the current source contract; Documents inherit Lab visibility; relationship targets are independently filtered; `internalRepoUrl` is excluded regardless of status.

### Note Summary

**Required:** type, title, slug, canonical URL, reference ID, summary, publication date, Author, technologies.

**Optional:** hero media, topics when Studio can express them, featured curation input, compact referenced-entry links.

**Derived/resolved:** `type = note`; `/notes/{slug}`; safe Author resolution; visible reference summaries.

### Note Detail

**Required:** all Note Summary fields; body Document; typed referenced-entry relationships; Author.

**Optional:** gallery, topics, updated date when a deliberate editorial field exists.

**Visibility:** published Note. Author failure never exposes User; it resolves to a safe Team/Profile identity or the organization fallback below.

### Engineering Profile Summary

**Required:** type, Team member name as title, slug, canonical URL, public reference ID, overview, role, engineering identity, current exploration, public Team identity.

**Optional:** portrait, technologies, areas of expertise, selected visible evidence.

**Derived/resolved:** `type = engineeringProfile`; `/engineering/{slug}`; name/role from the visible Team record; evidence links filtered by target visibility.

### Engineering Profile Detail

**Required:** all Profile Summary fields; engineering philosophy; current interests; at least two meaningful visible evidence relationships; at least one substantive approved Profile Document.

**Optional:** hero media, gallery, populated Profile Documents, additional visible evidence grouped by collection.

**Visibility:** Profile is published and its Team owner is public. The profile disappears if Team visibility is removed. Hidden featured entries do not appear or contribute to public evidence counts.

### Team Member Summary

**Required:** type, name as title, role, bio, group, About URL.

**Optional:** portrait, visible Engineering Profile link.

**Derived/resolved:** `type = teamMember`; canonical destination is `/about` with an approved stable fragment only if the About implementation supports one; Profile link appears only for a visible Profile.

**Excluded:** Team reference ID, User link/ID, User name/email/image/role, public workflow language, and `createdBy` data.

Team has no standalone public Detail DTO or route. A Profile is a different public entity, not an expanded Team record.

**Visibility:** Team `publicProfile` is true. Profile availability is resolved separately and never inferred from Team visibility.

### Service Summary

Services are sections within `/services`, not standalone detail routes.

**Required:** type, title, description, Services page URL, and a resolved evidence relationship list (which may be empty at the DTO/security layer).

**Editorial gate:** at least two strong visible evidence links where the collection permits it. A published Service with fewer remains a valid visible record but is not launch-ready.

**Optional:** none in the current model beyond additional evidence relationships.

**Derived/resolved:** `type = service`; evidence links resolved and labeled **Proven by**; order remains handcrafted until a Studio order field is approved.

**Excluded:** status, timestamps, internal IDs. There is no Service slug or public reference ID.

**Visibility:** Service status is published. Every evidence target is independently filtered; a hidden target leaves no title, count, or placeholder.

### Media supporting DTO

Media never has an independent public route, search result, sitemap entry, feed item, or structured-data entity merely because it exists. It becomes Public Media only through a visible owner or Document block and the role-specific rules above.

### Taxonomy supporting DTO

Taxonomy becomes Public Taxonomy Terms through visible owners. A public facet query returns only supported terms and visible result counts. Term labels can participate in search matching even when no standalone taxonomy landing route exists.

### Document supporting DTO

Documents become Public Documents only through a visible owner and approved role. They have no independent route, visibility state, sitemap item, or search result. Full-text Document content may enter a later search index only through visible Public Documents.

## Author resolution

The public Author is a closed union:

### Person author

| Field | Requirement | Source |
|---|---|---|
| `kind` | Required: `person` | Derived |
| `name` | Required | Visible Team name |
| `role` | Optional | Visible Team role |
| `portrait` | Optional | Resolved Team portrait |
| `url` | Required | Visible Profile URL when available; otherwise About destination |
| `profileAvailable` | Required, derived | Whether a visible Engineering Profile exists |

### Organization fallback

| Field | Value |
|---|---|
| `kind` | `organization` |
| `name` | `HubZero` |
| `url` | `/about` |

Resolution order:

1. Resolve the Note's internal User solely inside the public read boundary.
2. Find exactly one Team record linked to that User.
3. If that Team record is public, return its public identity and prefer its visible Engineering Profile as the destination.
4. If the User is missing, has no Team record, has multiple Team matches, or its Team record is not public, return the HubZero organization fallback.

The fallback never exposes the User name or account image and never fabricates a person. Editors should still repair attribution before launch because an organization fallback provides less accountability than the Note content gate intends.

`createdByUserId` is never consulted for Work, Builds, Blueprints, Labs, Profiles, Services, Team, Media, Taxonomy, or Documents. Public contributor credit requires a future explicit contributor relation.

## Public discovery projections

### Search result

Required fields: type, title, canonical URL, approved summary, public reference ID when available, matched public taxonomy labels, and public state where useful. Optional: safe Author identity and lead media thumbnail.

Search does not carry Documents in stage one. See [EDITORIAL_GAP_REPORT.md](../archive/EDITORIAL_GAP_REPORT.md#public-search-staging) for staged indexing.

### Sitemap item

Required fields: canonical URL and an explicit public last-modified input when one exists. Never substitute database `createdAt` for publication date. Priority and change-frequency hints are omitted unless real evidence justifies them.

### RSS item

Approved initially for Notes only after the Notes launch gate. Required: canonical URL/GUID, title, summary, publication date, safe Author, and sanitized public body or excerpt derived from the Public Document. RSS does not broaden visibility.

### Structured-data input

Contains only fields supported by a visible Detail DTO. It may select a schema type appropriate to the route, but it never invents ratings, pricing, clients, metrics, contributors, dates, products, or organization claims.

## Studio-to-public transformation matrix

| Studio concern | Public treatment |
|---|---|
| MongoDB `_id` and foreign keys | Removed; resolved to public URLs/objects |
| `createdByUserId` | Removed; never attribution |
| Workflow status/actors/history | Used only by visibility; removed afterward |
| `createdAt`/`updatedAt` | Removed unless a separately approved public-date derivation explicitly uses the value |
| Slug/reference ID | Preserved as public identifiers where approved |
| Media IDs | Resolved to Public Media; unresolved required media blocks readiness |
| Taxonomy IDs | Resolved to typed Public Taxonomy Terms |
| Relationship IDs | Resolved to typed, visibility-filtered Public Relationships |
| User author | Resolved to Person Author or HubZero fallback; User never serialized |
| Documents | Owner visibility inherited; approved roles and public blocks only |
| Internal repository URLs | Always removed |
| Public URL fields | Validated and included only with explicit public intent |
| Featured flags | Curation inputs only; not serialized as authority and never a visibility override |

## Failure contract

- If the primary entity fails visibility or a required DTO field cannot be produced, return no DTO.
- If an optional relation, media item, taxonomy term, or external link fails resolution, omit it without revealing the hidden target.
- If required editorial evidence is missing, record launch ineligibility; do not invent a value or substitute a Studio timestamp/filename/first paragraph.
- If dual-stored relationship endpoints conflict, apply the conflict rules in [RELATIONSHIP_AUDIT.md](RELATIONSHIP_AUDIT.md), omit unsafe ambiguity, and surface the integrity issue to Studio review.
- A public consumer never receives a partial Studio record as a fallback.

## Versioning expectation

These contracts are the initial stable public read contract. Additive optional fields are compatible. Renaming/removing fields, changing visibility semantics, changing relationship meaning, or broadening author/media exposure requires a documented contract review across routes, search, sitemap, RSS, structured data, relationships, and caches before implementation.
