# Editorial Gap Report

**Status:** Phase 13 recommendations — documentation only, pending review

**Audit snapshot:** 17 July 2026

This report translates [CONTENT_AUDIT.md](CONTENT_AUDIT.md) into an editorial remediation backlog. It does not create copy, seed placeholders, alter schemas, or authorize public implementation.

## Priority model

| Priority | Meaning |
|---|---|
| P0 | Blocks the public data boundary or could expose false/private/misleading information |
| P1 | Blocks a collection or route from launch |
| P2 | Improves discoverability, scale, or editorial quality after the core evidence is truthful |

## Cross-collection blockers

### P0 — verify the content is real and publishable

The current database reads as verification/sample content. Before editing it into launch material, assign a content owner to every candidate record and confirm:

- the named project, product, Blueprint, Lab, person, and claim are real;
- HubZero has permission to publish client identity, problem details, screenshots, repositories, outcomes, and metrics;
- product/deployment/repository states are current;
- authored content represents the named author;
- no verification fixture is accidentally promoted into the public site.

If a record cannot be verified, unpublish or exclude it. Do not disguise a fixture through better prose.

### P0 — reconcile published data with the current Studio model

- Migrate or rewrite the published Lab so it supplies the current structured fields and approved Lab Documents.
- Remove stored `null` optional values where the current contract requires omission.
- Repair misleading Media metadata and remove the app icon from product/portrait roles.
- Reconcile duplicated relationship endpoints and invalid public author linkage.
- Decide how a Build can express a Blueprint relationship before promising that navigation publicly.

### P0 — approve public/private URL intent

Every URL needs an explicit editorial decision: public and verified, private and excluded, retired and labeled, or incorrect and removed. A URL field's presence is not approval to expose it.

Current checks found 404 or DNS failures for all audited Build/Blueprint destinations. Resolve these before any DTO can include them.

## Collection remediation

### Work — P1

For each real candidate:

1. Verify client/publication permission and confidentiality constraints.
2. Add an approved concise summary suitable for index, search, metadata, and Open Graph copy.
3. Write the case study around context, constraint, HubZero role, decisions, implementation, outcome, and lessons.
4. Source every metric; use an honest qualitative outcome when no defensible metric exists.
5. Assign real category and technology terms.
6. Add real hero/process/result media with truthful alt text and captions.
7. Verify Build/Blueprint relations and name why they matter.
8. Decide whether any repository is intentionally public.

The existing one-paragraph Document does not provide source material for these sections.

### Builds — P1

For each shipped internal product:

1. Add a structured product summary/thesis.
2. Verify deployment state, live destination, and repository visibility.
3. Complete both case-study and technical Documents.
4. Cover purpose, current use, architecture, decisions, trade-offs, challenges, lessons, and roadmap/current direction.
5. Add real screenshots, architecture evidence, and captions.
6. Confirm originating Lab and applied Work relationships.
7. Decide whether public version information is required and where its source lives.

QueryCraft's heading-only case study and one-sentence technical Document do not qualify.

### Blueprints — P0/P1

1. Confirm that the Blueprint is a real deployed reusable foundation.
2. Restore a working live preview; without it the permanent launch gate fails.
3. Replace the app icon with actual preview media.
4. Complete intended audience, Architecture (X), Design Language (Y), features, technologies, fit boundaries, and case study.
5. Link real Work/Build proof before claiming the pattern was proven across engagements.
6. Verify repository and documentation visibility.
7. Preserve the `Blueprint-X-Y` convention and current version.

If no candidate satisfies these conditions, Blueprints remains a launch blocker rather than showing a placeholder library.

### Labs — P0/P1

1. Reconcile the persisted record with the current model.
2. Supply research direction, current milestone, start date, last major update, graduation criteria, technologies, and repository/demo decisions.
3. Write dated evidence in one or more approved Lab Document roles.
4. Record real milestones, experiments/findings, blockers, and next direction.
5. Reconcile graduation/origin linkage with the Build.
6. Establish a recency review cadence. “Current” material without a meaningful update date must not be featured.

The existing `nextMilestone` string should not be silently renamed into a current field without editorial confirmation.

### Notes — P1

1. Reach the approved five-Note launch threshold with substantive technical material.
2. Confirm more than one author or document the editorial reason for a single-author launch.
3. Cover at least three real pillar entries.
4. Complete each body around a question/claim, context, reasoning/evidence, implication, references, and author.
5. Repair User → Team attribution for person bylines or explicitly approve HubZero organizational authorship.
6. Keep announcement-only posts out of the launch set.
7. Add topic taxonomy only when multiple real Notes create a useful, stable grouping.

The published ADR is a useful outline seed but not a launch-ready article.

### Engineering Profiles — P1

1. Confirm the Team identities and obtain/produce consistent real portraits.
2. Rewrite structured fields in each engineer's own voice and verify current exploration.
3. Select at least two meaningful visible evidence links.
4. Complete at least one substantive long-form role per Profile.
5. Use semantic blocks appropriate to the role: quote blocks for quotes, timeline blocks for meaningful chronology, verifiable evidence for achievements.
6. Remove duplicated generic Documents and hidden/fixture evidence.

Profiles remain optional. Do not create one for every Team member merely to fill `/engineering`.

### Team — P1

1. Replace verification identities with the actual approved roster or confirm that the current records are real.
2. Verify names, roles, concise bios, and group labels.
3. Add consistent portraits or approve a public composition that truthfully omits portraits.
4. Repair User links where Notes need person attribution.
5. Confirm whether About should expose stable person fragments; do not invent Team detail routes.

### Services — P1

1. Define only real service lines HubZero actively offers.
2. Give each a specific description and a clear boundary.
3. Link at least two strong visible evidence entries where the collection permits it.
4. Keep Services subordinate to products/evidence and avoid duplicating pillar summaries.
5. Establish a deliberate display order before implementation; current Studio has no order field.

Empty Services should omit the route/homepage passage rather than display generic capability copy.

### Media — P0/P1

1. Correct or retire the mislabeled app-icon Media record.
2. Capture real product/Blueprint/Work/Lab screenshots and explanatory diagrams.
3. Produce consistent Team/Profile portraits.
4. Add role-appropriate dimensions, alt text, captions, credits, and reuse tags.
5. Review every reuse; one asset should be reused only when its meaning remains correct in each context.
6. Create distinct social-preview crops where Open Graph needs them.
7. Keep brand assets in brand roles, not editorial evidence roles.

### Taxonomy — P1/P2

1. Retain the five correctly labeled technology terms.
2. Add Work categories only after real Work candidates reveal stable distinctions.
3. Add Note topics only when a credible body of Notes needs them and the Note model can express them.
4. Avoid aliases that are merely spelling variants; choose one public label and one slug.
5. Decide whether architecture/design-language values remain Blueprint fields or become Taxonomy facets. Do not duplicate them in both systems without a demonstrated cross-collection use.
6. Do not launch standalone term pages until a term has enough visible material and a clear search intent.

### Documents — P1

1. Replace heading-only, duplicated, and one-sentence bodies with substantive evidence.
2. Use headings that create a useful outline rather than a template checklist.
3. Use References and sourced Metrics when claims require them.
4. Use image/gallery blocks only with valid Media records.
5. Review Markdown/Rich Text for safe links and semantic structure.
6. Keep owner/role combinations within the approved public mapping.
7. Do not expose Document versions, editor notes, or AI-generation markers.

## Field-level contract gaps

The audit found required public concepts that the current Studio write model cannot supply reliably. Phase 13 documents them but does not change schemas.

| Gap | Affected consumers | Recommendation for a later approved Studio phase |
|---|---|---|
| Work summary absent | Index, search, SEO, relationship cards | Add one structured editorial summary; do not derive from first paragraph |
| Build product summary absent | Homepage, index, search, SEO | Add one structured product thesis/summary |
| Build version absent | Build current state, structured data | Add only if products have a real maintained version source |
| Build → Blueprint relation absent | Typed lineage navigation | Add a relationship with explicit semantics or narrow the public promise |
| Note topic relation absent | Topic filters/search | Add only once real Notes justify topics |
| Public publication/modified dates absent on most entities | Sitemap, structured data, recency | Model deliberate public dates; do not repurpose database timestamps blindly |
| Public/private intent ambiguous for several URL fields | Detail DTOs, search, structured data | Add explicit editorial policy/field semantics before exposure |
| Service order absent | Services composition | Keep order handcrafted initially or add an explicit order only when routine editing needs it |
| Blueprint relation semantics ambiguous | Relationship label | Model whether an edge means built-on, generalized-as, or proof |
| Media context override governance unclear | Alt/captions across reuse | Treat Media metadata as default and Document context as explicit override |

These recommendations are justified by current public consumers; none is speculative infrastructure.

## Public search staging

Search follows the visibility-safe discovery DTO in [PUBLIC_DTO_SPECIFICATION.md](PUBLIC_DTO_SPECIFICATION.md#public-discovery-projections).

### Stage 1 — launch metadata index

Index only visible, launch-approved entities and these fields:

- titles/names;
- approved summaries/descriptions/overviews/objectives;
- public reference IDs;
- public technology/category/topic labels;
- safe Author names;
- Team roles and Profile identity fields;
- public artifact state such as Build deployment or Lab stage;
- canonical URLs and collection type.

Relationship target titles may contribute to match context only after both endpoints are visible. They do not create duplicate search results.

Stage 1 excludes:

- raw Studio Documents;
- Media as standalone results;
- Users, Leads, Document Versions, workflow status, or private URLs;
- Taxonomy as standalone results unless a canonical term route exists;
- hidden relationships and their counts.

### Stage 2 — visible Document full text

Add only after substantive content volume and search evidence justify it. Build the index from Public Documents after visibility and block resolution. Index meaningful prose, headings, code language/labels, captions, references, and technology terms. Exclude raw HTML, internal attachment text, block IDs, editor annotations, and hidden/invalid media.

### Stage 3 — specialized discovery

Consider architecture, decision, milestone, or code-aware search only after user behavior identifies a real need. It is not required for launch and must preserve the same result contract.

## SEO and structured-data gaps

### Canonical URLs

- One canonical URL per detail entity: `/work/{slug}`, `/builds/{slug}`, `/blueprints/{slug}`, `/labs/{slug}`, `/notes/{slug}`, `/engineering/{slug}`.
- Team and Services do not get detail URLs in the current contract.
- Filter parameters, search states, previews, and inspector states are not alternate canonicals.
- External live deployments and Blueprint previews are destinations, never canonicals for HubZero detail pages.

### Metadata completeness

| Surface | Current source quality | Gap |
|---|---|---|
| Work | Title exists | No approved summary or suitable social media |
| Build | Title/state exist | No summary; current hero is wrong; URLs fail checks |
| Blueprint | Short description exists | Preview/media/evidence fail; social crop absent |
| Lab | Objective exists | Current model fields, recency, Documents, and media absent |
| Note | Summary/date exist | Body too thin; person author unresolved; social media absent |
| Engineering Profile | Overview exists | Identity is sample-oriented; portrait wrong; content not substantive |
| About | Team fields exist | Roster identity and portraits unverified |
| Services | No content | No metadata source beyond handcrafted page framing |

Global title templates, organization copy, default social image, and contact/privacy metadata remain handcrafted as Phase 12 specifies.

### Open Graph readiness

No collection currently has a verified Open Graph-ready image. The only Media asset is square brand artwork under incorrect editorial metadata. Future OG media needs a real subject, approved crop, dimensions, alt-equivalent context, and no confidential UI/data.

### Structured-data opportunities

Use the narrowest truthful schema after content exists:

- sitewide: `Organization`, `WebSite`, and `BreadcrumbList`;
- Notes: `TechArticle` or another accurate article type with safe Person/Organization author;
- Labs: article-shaped technical content when the page is substantive;
- Builds/Blueprints: `SoftwareApplication` only when the page describes a real accessible application with supported facts; otherwise a broader `CreativeWork` shape;
- Work: article/creative-work representation for a case study, without fabricated client/metric fields;
- Engineering Profiles/About: `Person` only from verified public Team data;
- Services: `Service` nodes only for real published definitions and real provider/evidence context.

Do not add ratings, reviews, prices, dates, authors, organizations, products, or metrics merely because a schema type supports them.

### Sitemap inclusion

Include visible, launch-approved canonical indexes and details only. Notes and Engineering Profiles join only after their content gates. Service sections, Team members, Documents, Media, Taxonomy terms without routes, Users, Leads, and previews are not individual sitemap entries.

### Robots exclusions

Disallow indexing of Studio/authenticated paths, preview paths, internal APIs, and search-result pages as appropriate. Do not use robots rules as protection for drafts, archived content, Leads, or Users; those must be inaccessible through the public read boundary.

## Editorial acceptance checklist

Before marking a candidate launch-ready, confirm:

- [ ] A content owner verified that the entity and every claim are real.
- [ ] Confidentiality and public-link decisions are recorded.
- [ ] Required structured fields can construct the approved DTO without heuristics.
- [ ] Required Documents are substantive and use appropriate blocks.
- [ ] Metrics and material claims have sources.
- [ ] Media is real, role-appropriate, dimensioned, and accessible.
- [ ] Taxonomy kinds and labels are correct.
- [ ] Relationships are explicit, visible at both ends, and narratively useful.
- [ ] Attribution resolves without User leakage.
- [ ] Public dates/state are current and truthful.
- [ ] Metadata, canonical URL, OG media, sitemap, and structured-data inputs are complete.
- [ ] No placeholder, verification fixture, private URL, or internal metadata remains.

Completion of this checklist authorizes editorial review, not implementation or release.
