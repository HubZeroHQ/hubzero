# Content Audit

**Status:** Phase 13 audit — documentation only, pending review

**Audit snapshot:** 17 July 2026

**Scope:** Studio content readiness and the source material available to future public read models

This audit evaluates the current Studio database against [PUBLIC_NARRATIVE.md](PUBLIC_NARRATIVE.md), [PUBLIC_DATA_LAYER.md](PUBLIC_DATA_LAYER.md), and the stable contracts in [PUBLIC_DTO_SPECIFICATION.md](PUBLIC_DTO_SPECIFICATION.md). It does not authorize public implementation, change a Studio schema, or treat workflow publication as proof of editorial readiness.

## Audit method and evidence boundary

The review covered the current records in Work, Builds, Blueprints, Labs, Notes, Engineering Profiles, Team, Services, Media, Taxonomy, and Documents. It checked field completeness, current validation compatibility, relationship targets, Document roles and blocks, media reuse, taxonomy kinds, attribution paths, and external public URLs.

The database is mutable. Counts and record-level findings below are a dated snapshot, not permanent product facts. User email, permissions, Leads, internal notes, passwords, private repository fields, Document versions, and other internal-only data were not copied into this audit.

## Executive finding

No public collection is ready to launch from the current Studio content.

Several records have `published` workflow status, but the available evidence is verification/sample material rather than an approved public body of work. Publication status answers whether a record is eligible for a public read; it does not answer whether the record is real, complete, current, attributable, or suitable for launch. [LAUNCH_READINESS.md](LAUNCH_READINESS.md) keeps those decisions separate.

The highest-risk findings are:

1. Published Work, Build, Blueprint, Lab, Note, and Engineering Profile records do not meet their editorial completeness gates.
2. The only published Lab does not match the current Lab model and owns no public Document.
3. The only Media asset is the HubZero app icon, mislabeled as a QueryCraft hero screenshot and reused as product media and profile portraits.
4. Services has no records; Taxonomy has technologies only and no category or topic terms.
5. The published Note author has no Team record, so person-level public attribution cannot resolve.
6. Stored reciprocal relationships are incomplete or duplicated across both endpoints.
7. Every audited product, repository, Blueprint preview, and Blueprint documentation URL failed its availability check.

## Inventory

| Collection | Total | Workflow distribution | Publicly visible by status today | Audit conclusion |
|---|---:|---|---:|---|
| Work | 1 | 1 published | 1 | Structurally valid; editorially incomplete and not verified as real client work |
| Builds | 3 | 1 published, 1 in review, 1 draft | 1 | Published entry lacks substantive Documents and working public destinations |
| Blueprints | 1 | 1 published | 1 | Naming is valid; launch gate, preview, evidence, and media requirements fail |
| Labs | 1 | 1 published | 1 | Persisted record is incompatible with the current Lab contract and has no Lab Documents |
| Notes | 3 | 1 published, 1 in review, 1 draft | 1 | Published Note is a short verification record; Notes launch threshold is not met |
| Engineering Profiles | 2 | 1 published, 1 in review | 1 | Records are sample-oriented; Documents are duplicated and not substantive |
| Team | 2 | 2 public | 2 | Public identities appear linked to verification users and have no valid portraits |
| Services | 0 | — | 0 | Empty; route and homepage capability passage have no Studio evidence set |
| Media | 1 | no independent workflow | reachable through owners | Asset metadata and every audited use are unsuitable for public rendering |
| Taxonomy | 5 | 5 technologies | 5 terms back visible records | Technology vocabulary is consistent but incomplete as a cross-site taxonomy |
| Documents | 15 | visibility inherited from owners | 10 owned by visible records | Schema-valid blocks exist, but no audited public narrative is launch-complete |

Document versions remain internal history and are not a public collection. Users participate only in author resolution; they never become public DTOs.

## Collection audit

### Work

The single record, `HZ-WK-002` (“Northwind Platform Migration”), has a valid slug, client type, timeline, role, and two valid technology references. It has no category, hero media, repository decision, stored related Builds, or related Blueprints. Its case-study Document is one paragraph, duplicates the published Build's technical sentence, contains a spelling error, and does not establish context, constraint, decision, outcome, source, or lesson.

The title resembles common sample data and the database provides no evidence that it represents approved client work. It must not be published as real Work until a content owner verifies the engagement and confidentiality boundary.

**Missing public metadata:** concise summary, verified case-study evidence, category, suitable hero media, explicit relation decisions, publication/major-update metadata where needed for discovery, and an explicit decision on repository visibility.

**Redundancy/naming:** `role` is a project role and must remain distinct from Team role, Document role, and User role in future mapping. `timeline` is free-form and suitable for display, but not for chronological computation.

### Builds

`HZ-BL-001` (“QueryCraft”) is the only published Build. It has a live deployment state, URLs, technologies, a stored originating Lab, a stored Work relation, a featured flag, and media references. Its case-study Document contains only the heading “Overview”; its technical Document contains one sentence with a spelling error. Product thesis, use, architecture depth, decisions, challenges, evidence, lessons, and roadmap are absent.

`HZ-BL-002` (“ZeroLink”) is a draft with no Documents, public URLs, hero, gallery, or relations. `HZ-BL-003` (“TeamMemberBuild”) is an in-review verification entry with no Documents, technologies, URLs, or media. Neither should contribute to public readiness.

The Build model has no structured summary/product thesis or version field even though public indexes, search, metadata, and the Phase 12 narrative require those concepts. Those are genuine public-contract gaps; deriving marketing copy from the first paragraph would be unstable and is not approved.

### Blueprints

`HZ-BP-001` follows the mandatory `Blueprint-X-Y` convention and has populated architecture, design language, short description, features, technologies, version, and external URL fields. However, its case study is one heading with no body, its preview asset list is empty, its hero is the HubZero app icon, and its copy claims patterns proven across multiple client engagements without linked evidence in the model.

The live deployment and documentation hosts did not resolve during the audit; the repository URL returned 404. This entry does not satisfy the permanent Blueprint launch gate. The current schema also cannot express direct Work/Build proof relationships from the Blueprint side; future public backlinks can derive only where another visible record stores a Blueprint reference.

### Labs

`HZ-LB-001` (“Edge Cache Runtime”) is marked published but was created against an older model. It stores `nextMilestone`, while the current model requires `researchDirection`, `currentMilestone`, `startDate`, `internalRepoUrl`, technology and relation arrays, media arrays, a featured flag, and milestones. It has no owned `overview`, `engineeringJournal`, `findings`, `researchNotes`, or legacy `journal` Document.

The Build points back to this Lab as its origin, but the Lab does not store the corresponding graduation target. The record cannot be transformed into the approved Lab detail DTO without inventing fields. It is the most immediate data-integrity blocker because it is both published and incompatible with current Studio expectations.

### Notes

Only `HZ-NT-001` is published. Its summary is specific, its publication date and technology are populated, and its three relationship targets exist and are currently published. Its body consists of a heading, one sentence, and a short interface example. It does not yet provide enough context, trade-off analysis, implication, or references to qualify as a substantive engineering Note.

The other two Notes are in review/draft and own no Documents. The current public threshold requires at least five substantive published Notes with multi-pillar coverage and credible authorship. Current count: one published Note, one author, three related pillar entries, and no launch-ready body.

The published Note's `authorId` resolves to a User without a linked Team record. A future public read may use the organization fallback defined in [PUBLIC_DTO_SPECIFICATION.md](PUBLIC_DTO_SPECIFICATION.md#author-resolution), but the current record cannot receive a person byline.

### Engineering Profiles

Two profiles exist. One is published and one is in review. Both have complete structured sample fields and multiple featured relations, but both own the same five one-paragraph Documents. The content does not behave as an interview, timeline, quote set, or achievement record; several statements are generic, and the “achievement” is not independently verifiable.

Both profiles reuse the app icon as portrait/gallery media. One persisted record stores `heroMediaId: null`, which conflicts with the current optional-field contract (omit the field rather than store null). Featured relations include draft or in-review content and must be filtered from any public profile.

These profiles demonstrate model coverage, not earned public identity. They fail the requirement for one substantive Document role and meaningful, visible evidence.

### Team Members

Both Team records have names, roles, bios, groups, public flags, unique reference IDs, and User links. Neither has a portrait. The linked User display names are explicitly Phase 6 verification identities and do not match the Team names. That mismatch does not leak publicly under the approved Author DTO, but it is strong evidence that these are fixtures requiring editorial confirmation.

Team reference IDs remain Studio identifiers and are not part of the public Team DTO. `publicProfile` is a visibility flag, not an Engineering Profile indicator; the latter requires a separately visible profile.

### Services

The collection is empty. No Service can be public, searchable, structured, or used as homepage capability evidence. A Service also has no slug or detail route in the current model; public presentation is a set of sections on `/services`, not a collection of canonical detail pages.

Every future Service must have a specific definition, clear boundary, and visible evidence links. A Service with only broad capability copy is not ready even if marked published.

### Media

The only asset is byte-for-byte the HubZero app icon. Its Studio metadata calls it “QueryCraft hero screenshot,” and it is reused as:

- QueryCraft hero and gallery media;
- Blueprint hero media;
- both Engineering Profile portraits and galleries;
- one Engineering Profile hero;
- a draft Note hero.

The asset is available from Cloudinary, is 800 × 800 PNG, and has dimensions and file size. Caption and credit are stored as `null` rather than omitted, and the current validation contract expects omitted optional strings. Reuse tags are empty.

No audited use is semantically correct. A brand icon cannot stand in for a product screenshot, Blueprint preview, or person portrait. The misleading alt text is an accessibility blocker, not a polish issue.

### Taxonomy

Five technology terms exist: TypeScript, Next.js, MongoDB, Cloudinary, and Tailwind CSS. Labels and slugs are consistent, there are no duplicates, and every current technology reference points to a technology-kind term.

There are no category or topic terms. Work therefore has no category filter vocabulary, and Notes has no topic vocabulary despite Phase 12 describing topic-shaped discovery. The current `Note` model references only `technologyIds`; it cannot assign topic terms. Do not create categories/topics merely to fill a UI. Add them only when real content requires stable grouping.

The taxonomy is useful as metadata but too small and one-dimensional to justify standalone public taxonomy landing pages at launch.

### Documents

All 15 stored Documents have valid block shapes and existing owners. No duplicate owner/role pairs or orphan owners were found. Editorial coverage is the problem:

- Work: one case study, one paragraph.
- Published Build: one heading-only case study and one one-paragraph technical Document.
- Blueprint: one heading-only case study.
- Lab: no Documents.
- Published Note: one three-block body; other Notes have none.
- Engineering Profiles: five one-paragraph Documents per profile, duplicated between people.

Document role is not constrained by owner type in the shared storage schema. The public mapper must allow only the approved role set for each owner and omit/log unexpected roles. Empty, heading-only, placeholder, or structurally mismatched Documents must fail editorial readiness even though their blocks validate.

## Editorial quality audit

| Concern | Current state | Recommendation |
|---|---|---|
| Summaries | Blueprint, Notes, Profiles, Team, and Labs have usable source fields; Work and Builds do not | Add approved structured public summaries before DTO implementation; do not derive them heuristically from Documents |
| Descriptions | Service collection is empty; Work/Build descriptions are absent | Write only from verified project/product facts after ownership review |
| Naming | Blueprint naming and taxonomy labels are consistent; sample Build/Team names are not launch evidence | Preserve the Blueprint convention; verify every proper noun and product status |
| Reference IDs | Formats are stable; the sequence begins at `HZ-WK-002` for current Work | Gaps are acceptable; never renumber or reuse IDs; omit Team IDs publicly |
| Hero media | No suitable public hero exists | Commission/capture real product, work, Lab, Blueprint, and portrait media before launch |
| Screenshots | None; the app icon is mislabeled as a screenshot | Capture real current interfaces with context-specific captions and alt text |
| Diagrams | None | Add only when they explain a real boundary, decision, or flow; decoration is not a substitute |
| Alt text | Present on the only asset but factually wrong for every use | Audit alt text per use; context overrides must remain truthful and concise |
| Captions/credits | Absent/null | Require captions for screenshots/diagrams when the relevance is not self-evident; include credit when needed |
| Technologies | Five consistent technology terms | Keep canonical capitalization; expand only from real content; separate technology from category/topic |
| Relationships | Some real target IDs exist, but reciprocal storage is incomplete and proof coverage is sparse | Use the canonical resolver and repair Studio relationship integrity before launch |
| Publication dates | Notes only | Add explicit public dates only where they communicate truth; do not expose `createdAt` as publication time |
| Current state | Build deployment and Lab stage exist; Lab recency is missing and external state is stale | Verify deployments and repositories; require Lab start/major-update/milestone data |

## Field naming and workflow suitability

Studio naming reflects collection-specific editorial meaning, but the same public concept currently appears under several names:

| Public concept | Studio fields | Audit decision |
|---|---|---|
| Summary | Blueprint `shortDescription`, Note `summary`, Profile `overview`, Service `description`, Lab `objective`; absent on Work/Build | Normalize to public `summary` only in DTOs; do not rename Studio fields in this phase or pretend absent sources exist |
| Live destination | Build `liveUrl`, Blueprint `liveDeploymentUrl`, Lab `liveDemoUrl` | Normalize to typed Public External Links while preserving the distinct artifact meaning |
| Repository | Work/Build/Blueprint `repoUrl`, Lab `internalRepoUrl`/`publicRepoUrl` | Exclude Lab internal URL always; require explicit public intent for every other repository field |
| Lead/hero media | `heroImageId`, Profile `heroMediaId`, Team/Profile `portraitId` | Resolve by public media role; field-name similarity never makes a portrait usable as a hero |
| Relationships | Typed arrays on most entities; polymorphic `relatedEntries`/`evidenceLinks` on Notes/Services | Normalize to one typed public relationship contract; retain source-specific semantics |
| Current milestone | Persisted Lab `nextMilestone`; current model `currentMilestone` | Treat as model drift requiring editorial migration, not an automatic alias |
| Status | Full workflow `status`, Service two-state `status`, Team `publicProfile`, artifact state fields | Keep publication visibility, Team visibility, and artifact state as separate concepts |

Workflow suitability by collection:

- The five-state workflow is appropriate for Work, Builds, Blueprints, Labs, Notes, and Engineering Profiles, but current `published` fixtures show that workflow approval alone does not enforce editorial completeness.
- The two-state Service workflow is proportionate for a small Admin-maintained collection; launch readiness must still require visible evidence.
- Team's `publicProfile` flag is sufficient as a visibility control, but identity/portrait review needs an editorial checklist because Team has no review status.
- Media and Taxonomy correctly have no publication workflow; their public reachability must be inherited through visible owners and semantic role/kind checks.
- Documents correctly inherit owner status. Owner/role uniqueness and substantive-content review remain separate integrity/editorial concerns.

## Media standards for future editorial work

1. Every public media use must name a role: hero, screenshot, gallery, diagram, portrait, social preview, or inline evidence.
2. The Media record supplies the source asset, intrinsic dimensions, default alt text, caption, and credit. A Document block may provide context-specific alt/caption, but it must not override the asset with misleading text.
3. Product screenshots show a real, current product state and include a caption when the visitor cannot infer why the frame matters.
4. Diagrams explain architecture, data flow, a decision, or a boundary. They require text alternatives that convey the same conclusion.
5. Team and Profile portraits use one approved crop, comparable headroom, neutral treatment, and sufficiently large source files. A logo or product asset is never a portrait fallback.
6. Hero and social crops are separate approved roles. A square source must not be assumed suitable for a wide hero or Open Graph image.
7. Missing required media blocks publication. Missing optional media causes the public composition to omit that region; Studio placeholders never render publicly.
8. Alt text is factual and contextual. Captions explain relevance; credits state ownership. These are different fields and must not be collapsed.

## External destination audit

Checked on 17 July 2026:

| Stored destination | Result | Readiness consequence |
|---|---|---|
| QueryCraft live deployment | HTTP 404 | Build cannot claim a live deployment |
| QueryCraft repository | HTTP 404 from an unauthenticated public request | Repository must be confirmed public or omitted |
| Blueprint live deployment | DNS did not resolve | Blueprint launch gate fails |
| Blueprint repository | HTTP 404 from an unauthenticated public request | Repository must be confirmed public or omitted |
| Blueprint documentation | DNS did not resolve | Documentation link must be corrected or omitted |
| Cloudinary media | HTTP 200 | Delivery works, but content and metadata are unsuitable |

A 404 may mean a private repository rather than a missing one. The public contract must not guess. Only explicitly approved, publicly reachable links enter a DTO.

## Audit decisions

- Treat all current sample records as non-launch content until a named content owner verifies them.
- Preserve workflow visibility rules but keep editorial eligibility as a separate gate.
- Do not seed placeholders, fabricate relationships, or infer claims from titles and URLs.
- Resolve the field and model gaps recorded in [EDITORIAL_GAP_REPORT.md](EDITORIAL_GAP_REPORT.md) before Phase 14 implementation.
- Use [RELATIONSHIP_AUDIT.md](RELATIONSHIP_AUDIT.md) and [VISIBILITY_RULES.md](VISIBILITY_RULES.md) for all future public resolution.
