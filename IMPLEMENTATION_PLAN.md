# Public Experience Implementation Plan

**Status:** Proposed after Phase 12 review; Phase 13 draft contracts produced — no implementation is authorized by this document

This roadmap begins only after the complete Phase 12 documentation set is approved. It establishes the public data boundary first, then uses the Homepage to define the shared public language before collection templates inherit and extend it.

Implementation order is not release order. No incomplete route, inactive control, or broken relationship is exposed publicly merely because its phase was implemented earlier. Phase 23 remains the release gate.

## Sequencing principles

1. Validate content readiness before designing around missing evidence.
2. Build the public read architecture in [PUBLIC_DATA_LAYER.md](PUBLIC_DATA_LAYER.md) before any public surface consumes Studio.
3. Use the Homepage as the first complete expression of typography, rhythm, spacing, chrome, motion, density, and interaction.
4. Make collection templates inherit the approved Homepage language rather than independently inventing it.
5. Build Builds and Labs first among collections so the product-led identity and lifecycle are proven early.
6. Activate Notes and Engineering Profiles only when their content gates are satisfied.
7. Let the Homepage omit unsupported chapters cleanly instead of delaying its design until every collection exists.
8. Treat mobile, accessibility, discoverability, performance, security, and reduced motion as phase acceptance criteria, not final repair work.

## Dependency map

```text
Phase 12A
Approval and Design Review
        │
        ▼
Phase 13
Content Audit + Public Contracts
        │
        ▼
Phase 14
Public Data Layer & Foundations
        │
        ▼
Phase 15
Homepage · shared public language
        │
        ▼
Phase 16
Builds + Labs
        │
        ▼
Phase 17
Work
        │
        ▼
Phase 18
Blueprints
        │
        ▼
Phase 19
Notes
        │
        ▼
Phase 20
Engineering Profiles + About
        │
        ▼
Phase 21
Services + Contact
        │
        ▼
Phase 22
Search & Discovery
        │
        ▼
Phase 23
Verification & Release
```

Later collection phases may activate or enrich an already-designed Homepage chapter when the corresponding content and destination route become ready. They extend the shared language; they do not redesign the Homepage around each new collection.

## Phase 12A — Approval and Design Review

**Goal:** turn the Phase 12 proposal into an approved public-experience and data-architecture contract.

Decisions:

- Confirm the active engineering publication thesis.
- Confirm Builds as the leading long-term identity signal.
- Confirm `/engineering` as distinct from `/about`.
- Confirm long-term navigation: Notes replaces Services after the Notes content gate.
- Confirm Services remains public but contextual.
- Confirm global framing remains handcrafted for the first public implementation.
- Confirm that public contribution credit waits for explicit contributor data.
- Approve [PUBLIC_DATA_LAYER.md](PUBLIC_DATA_LAYER.md) as the only supported bridge from Studio to public consumers.
- Review the Homepage-first sequence and gated chapter behavior.

**Dependencies:** completed Phase 12 documentation review.

**Exit:** all decisions are approved or amended in documentation. No public implementation begins before this exit.

## Phase 13 — Content Audit + Public Contracts

**Goal:** determine what can be published truthfully and approve the public-domain contract before building it.

**Draft deliverables:** [CONTENT_AUDIT.md](CONTENT_AUDIT.md), [PUBLIC_DTO_SPECIFICATION.md](PUBLIC_DTO_SPECIFICATION.md), [VISIBILITY_RULES.md](VISIBILITY_RULES.md), [RELATIONSHIP_AUDIT.md](RELATIONSHIP_AUDIT.md), [EDITORIAL_GAP_REPORT.md](EDITORIAL_GAP_REPORT.md), and [LAUNCH_READINESS.md](LAUNCH_READINESS.md). These remain pending review and do not satisfy the phase exit until approved.

Work:

- Inventory real Work, Builds, Blueprints, Labs, Notes, Team, Services, and Engineering Profiles.
- Resolve the legacy Work/Build triage still open in `PLANNING.md`.
- Identify the first real deployed Blueprint.
- Apply the completeness gates in `PUBLIC_NARRATIVE.md`.
- Record which Homepage chapters have qualifying content now and which must initially be omitted.
- Review the public DTO families, canonical visibility policy, relationship vocabulary, author resolution, and internal-field exclusions in [PUBLIC_DATA_LAYER.md](PUBLIC_DATA_LAYER.md).
- Map each approved public route and Homepage chapter to the summary/detail/Document DTOs it needs.
- Confirm which external URLs and repositories are intentionally public.
- Produce an editorial gap report; never fabricate seed content to satisfy a template.

**Dependencies:** approved Phase 12A decisions; working Studio collections.

**Exit:** content readiness matrix; explicit go/no-go for each gated surface; approved DTO and visibility contracts; no unresolved private/public field ambiguity.

## Phase 14 — Public Data Layer & Foundations

**Goal:** build the safe, cacheable bridge from Studio to public surfaces and the minimum technical substrate the Homepage needs.

Work:

- Implement the Repository → Public Read Model/DTO → Cache/Revalidation boundary defined in [PUBLIC_DATA_LAYER.md](PUBLIC_DATA_LAYER.md).
- Prevent public routes and components from importing MongoDB collections directly.
- Implement allow-listed summary, detail, Document, Author, and discovery DTOs.
- Apply one fail-closed visibility policy to routes, Homepage queries, relations, search projections, sitemap, RSS, and structured-data inputs.
- Resolve public Media, Taxonomy, authors, forward relationships, and derived inverse relationships.
- Exclude internal IDs, workflow metadata, private repositories, User/Lead data, and Studio-only fields.
- Establish entry, index, Homepage, relationship, and discovery cache boundaries.
- Connect Studio publication events to dependency-aware on-demand revalidation and ISR.
- Establish server-rendering defaults, bounded/batched queries, public error behavior, and Document validation/rendering boundaries.
- Wire the approved fonts, semantic tokens, CSS reset, route structure, metadata base, and accessibility primitives needed to compose the Homepage, without independently designing collection layouts.
- Verify public DTO and visibility invariants with representative published, draft, archived, and missing relations.

**Why before the Homepage:** the Homepage is the first major consumer of multiple Studio collections. Its design must be exercised against safe, resolved public objects rather than temporary direct queries that later collection phases would have to replace.

**Dependencies:** Phase 13 contracts and content matrix.

**Exit:** public consumers can obtain deterministic, visibility-safe DTOs without direct Studio access; caches invalidate across affected projections; the technical substrate is ready for the first composed surface.

## Phase 15 — Homepage

**Goal:** establish the entire shared public language through the first complete editorial experience.

The Homepage comes before collection implementations because it is not merely another destination. It is where HubZero resolves the public system's foundational decisions together:

- typography and hierarchy;
- layout and viewport rhythm;
- spacing and visual density;
- global navigation and footer;
- page chrome and persistent controls;
- transitions and motion language;
- editorial composition;
- media behavior;
- responsive recomposition;
- focus, hover, press, and disclosure conventions.

If each collection establishes these independently, the website will become a set of polished but inconsistent templates. Designing the Homepage first creates a reviewed shared language that Work, Builds, Blueprints, Labs, Notes, Profiles, About, Services, and Contact can inherit.

Work:

- Implement the seven time-based narrative chapters in `PUBLIC_NARRATIVE.md` as intentional content roles, not a generic page-builder schema.
- Establish the persistent navigation, footer, page chrome, main content landmarks, and route-transition behavior.
- Resolve public typography, prose/artifact widths, spacing scale usage, large-screen density, and mobile recomposition with real audited content.
- Implement the public motion vocabulary and reduced-motion equivalents from `MOTION_GUIDELINES.md`.
- Establish shared interaction conventions for links, state, media, editorial rows, cards where justified, focus, and external destinations.
- Consume only Homepage DTO projections from the Phase 14 public data layer.
- Validate 5-second, 30-second, 2-minute, and 10-minute comprehension through structured review.
- Record reusable public patterns and the conditions under which later collections may extend them.

### Gated chapter behavior

The Homepage does not wait for every collection to exist.

- Every data-backed chapter has an explicit eligibility query over visible public DTOs.
- A chapter with no qualifying content is omitted completely, including its heading, navigation, divider, and reserved spacing.
- Remaining chapters close the gap and preserve the intended editorial rhythm; the omission never leaves an empty viewport or placeholder card.
- The product signal may use the approved Build-first, qualifying-Lab fallback from `PUBLIC_NARRATIVE.md`; it never represents a Lab as a shipped Build.
- Evidence chapters render only the real Work, Build, Blueprint, or technical artifact types currently qualified.
- Current engineering appears only when recency requirements are satisfied.
- Notes, Profile, Services, Contact, and search entry points are activated in the Homepage or global chrome only when their content, destination, and interaction are complete in later phases.
- No incomplete destination or non-functional control reaches a public release. Phase 15 may define its placement and behavior contract before Phase 23 activates the complete system.

This is graceful degradation of an editorial system, not a collection of “coming soon” states.

**Dependencies:** Phase 14 public DTOs, caching, rendering boundaries, and foundation primitives; Phase 13 Homepage content matrix.

**Exit:** the Homepage passes Design Review, Mobile Experience, accessibility, reduced-motion, and initial performance checks; shared public language is documented through implemented patterns; gated omissions are coherent; later templates have a clear system to inherit.

## Phase 16 — Builds + Labs

**Goal:** prove the product-first identity and the hardest lifecycle relationship using the Homepage-established language.

Work:

- Implement Builds and Labs indexes and details.
- Render Build case-study/technical Documents and Lab journals through the public Document DTO/renderer boundary.
- Apply Homepage typography, spacing, media, chrome, transition, and interaction conventions rather than creating collection-specific foundations.
- Implement live deployment, repository, technology, version/state, recency, milestones, and architecture presentation.
- Implement originating Lab ↔ graduated Build navigation through the canonical relationship resolver.
- Refine the typed relationship transition and reduced-motion fallback without changing its sitewide vocabulary.
- Validate unpublished/archived targets, inverse relations, cache invalidation, and Homepage projection updates.
- Activate qualifying Build and Lab Homepage links/chapters when their canonical routes are complete.

**Why first among collections:** Builds carries the desired long-term company identity. Labs demonstrates current engineering and exercises progress, state, Documents, media, and the most meaningful lifecycle transition. Together they stress-test the shared language without redefining it.

**Dependencies:** Phase 15 shared public language; Phase 14 data and cache contracts; qualifying Build/Lab content.

**Exit:** at least one real Build/Lab lineage is complete, indexable, accessible, fast, editorially credible, and integrated into the Homepage without special-case data access.

## Phase 17 — Work

**Goal:** prove client outcomes through the established product and relationship system.

Work:

- Implement Work index filters and detail narrative.
- Establish constraint, decision, outcome, source, and lesson presentation using shared public patterns.
- Implement Work ↔ Build and Work ↔ Blueprint relationships through public DTOs.
- Carry relevant evidence context toward Contact without prematurely exposing an incomplete Contact route.
- Confirm that private client facts, internal identifiers, and private repositories cannot enter public DTOs or caches.
- Activate qualifying Work evidence and destinations on the Homepage.

**Why now:** Builds/Labs has already proven Documents and lifecycle navigation, while the Homepage has already established the visual/editorial system. Work can focus on evidence, confidentiality, and outcomes.

**Dependencies:** Phase 16 relationship and Document patterns; Phase 15 shared language; qualifying Work content.

**Exit:** at least one real case study meets the completeness gate, has a meaningful next path, and updates related Homepage/data projections correctly.

## Phase 18 — Blueprints

**Goal:** make reusable foundations evaluable before a conversation.

Work:

- Implement architecture/design-language filtering.
- Implement X/Y explanation, version, audience fit, features, technologies, preview media, live deployment, repository/documentation links.
- Implement Work/Build proof relationships from the public relationship map.
- Design live-preview transitions that clearly distinguish canonical detail from an external deployment.
- Enforce the no-placeholder launch gate.
- Activate the Homepage Blueprint/deployed-artifact role only when a real Blueprint satisfies the gate.

**Dependencies:** first real deployed Blueprint; Phase 17 Work evidence; Phase 16 relationship patterns; Phase 15 shared language.

**Exit:** at least one complete Blueprint can be understood, previewed, and traced to visible evidence with consistent caching and revalidation.

## Phase 19 — Notes

**Goal:** activate the connective engineering journal only when it deserves a public index.

Content gate:

- At least five substantive published Notes.
- More than one author or a clear editorial reason for a single-author launch.
- Coverage across at least three pillar entries.
- No sequence of announcement-only posts.

Work:

- Implement Notes index, article view, public Author DTO resolution, relations, metadata, and RSS.
- Add reciprocal **Engineering notes** links within relevant pillar narratives.
- Add visible Notes to public discovery projections.
- Replace Services with Notes in the visible nav only after real-width navigation validation.
- Activate the Homepage current-engineering Note role only when recency and content requirements pass.

**Dependencies:** content gate; Phase 14 Author/Document/discovery contracts; visible pillar destinations from Phases 16–18; Phase 15 shared language.

**Exit:** Notes functions as connective engineering knowledge; bylines never expose User records; nav and Homepage changes remain coherent when Notes is absent or present.

## Phase 20 — Engineering Profiles + About

**Goal:** connect people to engineering evidence without creating résumés or inferred credit.

Content gate per Profile:

- Published public Team record and published Profile.
- Two meaningful visible evidence links.
- One substantive Document role.
- Current overview, identity, and exploration.

Work:

- Implement About's roster stage and Founder Modules.
- Implement `/engineering` and Profile detail.
- Resolve populated Document roles selectively through public DTOs.
- Implement About → Profile continuity and reduced-motion behavior.
- Link Notes by explicit public authorship.
- Do not name contributors on other content until Studio has an explicit contributor relation.
- Activate the Homepage people/principles chapter with Team-only or qualifying Profile evidence according to the approved narrative; never show empty Profile affordances.

**Dependencies:** Phase 19 public Author behavior; visible evidence from Phases 16–18; qualifying Team/Profile content; Phase 15 shared language.

**Exit:** Team members with and without Profiles have complete, honest public states; Homepage and byline destinations resolve safely.

## Phase 21 — Services + Contact

**Goal:** convert qualified understanding without allowing services to dominate identity.

Work:

- Implement evidence-led Services using visible pillar relationship DTOs.
- Require real evidence links and state service boundaries plainly.
- Implement Contact → Leads with source/context capture, privacy, abuse protection, error recovery, and honest response timing.
- Preserve originating public evidence context without exposing internal identifiers.
- Add confirmation behavior from `MOTION_GUIDELINES.md`.
- Activate the Homepage capability and Contact paths only when their destination behavior is complete.

**Dependencies:** visible Work/Build/Blueprint/Lab evidence; existing Leads Studio workflow; Phase 15 shared language; Phase 14 security boundary.

**Exit:** every published Service is proven; every contact state is accessible, secure, and explicit; Homepage engagement paths are functional.

## Phase 22 — Search & Discovery

**Goal:** make the complete public body findable without creating a parallel content or visibility system.

Work:

- Build search exclusively from the discovery DTO projection in [PUBLIC_DATA_LAYER.md](PUBLIC_DATA_LAYER.md).
- Cover published routes, public Team/Profile identities, Services, and resolved Taxonomy.
- Validate result language, type, state, URL, keyboard behavior, and empty states.
- Complete metadata, structured data, canonical URLs, sitemap, RSS, robots, breadcrumbs, and internal-link verification from the same public read layer.
- Start with lightweight metadata; defer full public Document search until user evidence and scale justify it.
- Test publish, unpublish, archive, slug, taxonomy, author, and relationship invalidation across every discovery surface.
- Activate the visible Search control only when the complete interaction is operational.

**Dependencies:** all intended launch collections and routes; Phase 14 discovery/cache contract; Phase 15 Search placement/interaction contract.

**Exit:** no important public entry is orphaned, duplicated, mislabeled, or discoverable after losing visibility; discovery never queries Studio directly.

## Phase 23 — Verification & Release

**Goal:** verify the complete public system and authorize release.

Passes:

1. Engineering review.
2. Design review, including consistency between Homepage language and every collection.
3. Mobile Experience review.
4. Product Polish review.
5. Accessibility audit with keyboard and assistive technology.
6. Reduced-motion audit.
7. Performance profiling with real media/content and representative mobile hardware.
8. Public-data security review for DTO allow-lists, visibility, caches, and invalidation.
9. SEO/discoverability verification.
10. Privacy/security review for Contact and Leads boundaries.
11. Broken-link and gated-chapter verification.
12. Canonical release checklist.

**Dependencies:** Phases 14–22 complete for the approved launch scope. A content-gated optional surface may remain absent only if navigation, Homepage, search, and relationships omit it coherently.

**Exit:** all applicable findings resolved; content owners approve every published artifact; no incomplete destination or control is exposed; release is explicitly approved.

## Cross-phase workstreams

### Content and Homepage curation

- Real-content audit and editorial review begin in Phase 13 and continue alongside templates.
- Content gaps block that entry or chapter; they are never filled with fabricated placeholders.
- The Homepage uses real audited objects from Phase 15 onward and gains eligible chapters as later routes become complete.
- Homepage curation remains a maintained editorial responsibility after launch.

### Public data layer

- Every phase consumes the DTO, visibility, relationship, caching, and invalidation contracts in [PUBLIC_DATA_LAYER.md](PUBLIC_DATA_LAYER.md).
- A collection may extend a shared public DTO family, but it cannot bypass the read layer.
- Changes to a public contract require dependency and invalidation review across Homepage, routes, relations, search, sitemap, RSS, and structured data.

### Shared design language

- Phase 15 establishes the system; later phases extend it only when their content presents a real unmet need.
- An extension is reviewed across the Homepage and existing collections so isolated excellence does not create inconsistency.
- Collection identity comes from content and narrative role, not independent visual systems.

### Accessibility and motion

- Every motion pattern ships with its reduced-motion version in the same phase.
- Keyboard, focus restoration, route announcements, touch targets, and reading order are acceptance criteria throughout.

### Performance

- Server rendering remains the default.
- Client behavior is scoped to justified interactive islands.
- Document blocks do not hydrate merely for entrance effects.
- List DTOs never contain full Documents.
- Images reserve dimensions and use responsive Cloudinary/Next delivery.
- Queries remain bounded, batched, cacheable, and free of per-item waterfalls.

### Release integration

- Early Homepage implementation does not authorize an early public launch.
- Navigation and Homepage links are exposed only when their destination and interaction are complete.
- Phase 23 verifies the final combination, including every allowed omission.

### Observability

Future analytics should answer architectural questions without becoming surveillance or vanity reporting:

- Which typed relationship paths are used?
- Do visitors reach Builds/Labs as well as Work?
- Which evidence contexts lead to Contact?
- Where does search fail to produce a useful result?

Analytics implementation requires a separate privacy-aware decision. The public data layer can support public identifiers and event context later, but this roadmap does not authorize analytics.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Homepage is designed around missing content | Phase 13 readiness matrix, real DTOs, and complete chapter omission rules |
| Early Homepage produces broken destinations | Implementation order is not release order; links/controls activate only with complete destinations; Phase 23 is the gate |
| Homepage becomes a generic page builder | Seven approved narrative roles remain handcrafted; data-backed chapters use typed DTO projections |
| Later collections fragment the design language | Phase 15 Design Review establishes the system; extensions are reviewed across existing surfaces |
| Public and Studio models drift together | Canonical DTO boundary in `PUBLIC_DATA_LAYER.md`; no direct collection access |
| Draft or internal data leaks through a secondary surface | One fail-closed visibility policy for routes, Homepage, relations, discovery, and caches |
| Products remain secondary despite stated identity | Product-led Homepage followed immediately by Builds + Labs |
| Relationship UI becomes generic recommendations | Typed vocabulary and reciprocal public relationship contract |
| Notes launches as a thin blog | Five-note, multi-pillar content gate and coherent Homepage/nav omission |
| Profiles become résumés | Earned eligibility and evidence-first composition |
| Navigation becomes too dense | Notes replaces Services; validate with real text before activation |
| Motion harms performance/accessibility | Static equivalence, reduced motion, ≤500ms budget, per-phase QA |
| Public attribution is inaccurate | Never infer credit from `createdByUserId`; Author DTO resolves explicit links only |
| Global copy becomes hard to maintain | Keep handcrafted initially; design typed settings only when recurring editorial need is proven |

## Explicit non-goals

- No public page or component implementation in Phase 12.
- No Studio changes or schema changes as part of this plan.
- No global page builder.
- No fabricated content, metrics, clients, or Profiles.
- No visual redesign of Studio.
- No direct public MongoDB or collection access.
- No public analytics, personalization, newsletter, careers, pricing, or account system without a separate product decision.
