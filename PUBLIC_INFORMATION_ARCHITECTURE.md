# Public Information Architecture

**Status:** Phase 12 design proposal — documentation only

**Scope:** Public destinations, navigation, relationships, journeys, and Studio-to-public mapping

This architecture treats routes as addressable views over a connected publishing system. It does not treat them as independent marketing pages. [PUBLIC_DATA_LAYER.md](PUBLIC_DATA_LAYER.md) is canonical for how Studio records become the visibility-safe public objects consumed by these routes, relationships, indexes, and discovery surfaces.

## Structural model

```text
                              ┌──────────┐
                              │   Home   │
                              └────┬─────┘
                                   │ orients
                 ┌─────────────────┼──────────────────┐
                 │                 │                  │
         ┌───────▼──────┐  ┌───────▼──────┐  ┌────────▼───────┐
         │ Four pillars │  │ Editorial    │  │ Company paths  │
         │ Work         │  │ Notes        │  │ About          │
         │ Builds       │  │ Profiles     │  │ Services       │
         │ Blueprints   │  └───────┬──────┘  │ Contact        │
         │ Labs         │          │         └────────┬───────┘
         └───────┬──────┘          │                  │
                 └──────── typed relationships ────────┘
```

The four pillars define what HubZero produces. Notes explains the thinking, Engineering Profiles establish accountable authorship, About establishes the people, Services groups evidence around client needs, and Contact converts relevant interest into a conversation.

## Route architecture

| Route | Purpose | Primary audience | Common entry | Meaningful exit |
|---|---|---|---|---|
| `/` | Establish identity and route visitors into evidence | Everyone | Direct, branded search, referral | Featured Build, pillar, current Lab/Note, Contact |
| `/work` | Browse real client problem-solving | Prospects, technical leaders | Home, search, Service evidence | Work detail, related Build/Blueprint, Contact |
| `/work/[slug]` | Prove one client outcome and the decisions behind it | Prospects, evaluators | Work index, Service, Profile, search | Related Build/Blueprint/Note/Profile, Contact |
| `/builds` | Present shipped internal products as the central long-term portfolio | Product users, partners, engineers, prospects | Home, nav, Lab graduation | Build detail, live product, repository |
| `/builds/[slug]` | Document a product, its architecture, lineage, and current state | Engineers, users, partners | Builds, Lab, Note, Profile | Live product, repo, originating Lab, related Work/Blueprint/Notes |
| `/blueprints` | Help visitors evaluate reusable foundations by architecture and design language | Prospects, product/design leaders | Home, Work/Build relation, search | Blueprint detail, live preview, related Work/Build |
| `/blueprints/[slug]` | Explain audience fit, IA, design language, features, and implementation evidence | Qualified prospects, engineers, designers | Blueprints, Work/Build relation | Live preview, repo/docs when available, related evidence, Contact |
| `/labs` | Show active engineering with explicit maturity and recency | Engineers, partners, returning visitors | Home, nav, Note | Lab detail, current milestone, related Note/Build |
| `/labs/[slug]` | Expose objective, approach, experiments, progress, blockers, and graduation | Engineers, collaborators, evaluators | Labs, Note, Profile, search | Journal evidence, demo/repo, graduated Build, related Notes |
| `/notes` | Publish the connective engineering journal once the content threshold is met | Engineers, search visitors, returning readers | Nav, search, relations, author profile | Note detail, referenced artifact, author Profile |
| `/notes/[slug]` | Make one technical argument, record, or lesson legible and attributable | Engineers, technical leaders | Search, relation, Profile, Notes | Referenced Work/Build/Blueprint/Lab, author Profile |
| `/engineering` | Index earned Engineering Profiles without implying every team member has one | Prospects, recruits, peers | About, content byline, search | Profile detail, person's evidence |
| `/engineering/[slug]` | Show how an engineer thinks through principles, decisions, and connected work | Peers, recruits, evaluators | Byline, About, related content | Featured evidence, authored Notes, Contact/About |
| `/about` | Explain company structure and introduce the team | Prospects, recruits, partners | Nav, search, footer | Engineering Profile, evidence, Contact |
| `/services` | Organize proven capabilities around visitor needs without duplicating evidence | Qualified prospects | Home, About, Work, search | Evidence entry, Contact |
| `/contact` | Start a specific, expectation-set conversation | Qualified prospects, partners | Nav, evidence, Service | Confirmation with response timeframe |
| `/privacy` | State legal policy plainly | Contact/footer visitors | Footer, form | Return to prior context |

“Capabilities” remains a descriptive concept, not a duplicate route. The canonical public noun is **Services**, consistent with `PLANNING.md` and `DESIGN_SYSTEM.md`.

## Global navigation

### Long-term visible pill

```text
[HubZero]  Work  Builds  Blueprints  Labs  Notes  About  [Search]  [Contact]
```

This keeps the four pillars visible, promotes the connective editorial surface, and preserves a direct human/company path. Contact remains the differentiated action. Search is always labeled and visible.

Services remains a real, indexable route but is reached contextually from the homepage capability passage, About, Work evidence, search, and Contact. This is intentional: services exist, but products and engineering knowledge carry the identity.

### Launch transition

`PLANNING.md` correctly gates public Notes on a credible body of published material. Until that gate is met, **Services occupies the Notes slot** in the visible pill. When Notes launches, it replaces Services rather than creating an eighth destination.

This is a proposed refinement to the older navigation plan and requires approval before implementation.

### Mobile composition

The architecture and order remain identical. The pill may use shorter visible labels and a horizontally scrollable destination track only if every destination remains visibly discoverable. It must not collapse into an unlabeled hamburger or require hover. Search and Contact stay directly reachable. The implementation phase must validate this with real text at 320px, 375px, and 430px widths.

## Local and contextual navigation

Global navigation establishes category. Local navigation establishes place within a body of work.

- Index filters use shared taxonomy but preserve collection meaning: Work category, Blueprint architecture/design language, Lab stage, Note technology/topic.
- Detail pages use a compact in-document table of contents only when the Document has enough headings to justify it.
- Breadcrumbs express route hierarchy, not relationship hierarchy.
- Relationship rails express typed connections and may appear within the narrative at the moment the connection becomes relevant.
- Previous/next is used only for ordered series or time-based Lab/Note sequences; alphabetical adjacency is not meaningful navigation.

## Relationship vocabulary

Generic “Related” labels conceal the system. Public links should name why two records are connected.

| Source | Destination | Public label |
|---|---|---|
| Lab | Build | Graduated into |
| Build | Lab | Originated in |
| Build | Work | Applied in client work |
| Work | Build | Informed by |
| Work or Build | Blueprint | Generalized as / Built on |
| Service | Evidence entry | Proven by |
| Note | Any pillar | Discusses / Documents |
| Pillar entry | Note | Engineering notes |
| Engineering Profile | Content | Selected work / Authored notes / Current exploration |
| Content | Engineering Profile | Engineer / Author / Contributor, when supported by real data |
| Shared taxonomy | Content set | More using [technology/topic] |

Do not infer human contribution from `createdByUserId`. That field is provenance and permission metadata, not a public credit model. Only explicit authorship or a future contributor relation may create public attribution.

## Editorial graph

```text
                    authored by
            Notes ───────────────► Engineering Profiles
              │                           │
      discusses/documents                 │ features
              │                           ▼
              ├────────► Labs ──graduates into──► Builds
              │            │                         │
              │            └──── relates to ─────────┤
              │                                      │ informs
              ▼                                      ▼
             Work ◄──────── applied in ─────────── Builds
              │                                      │
              └──────── generalized as ─────┬─────────┘
                                           ▼
                                      Blueprints

Services ─────────────── proven by ─────────► all four pillars
```

Relations should be queryable and reciprocal. When Studio stores only one direction, the public read layer defined in [PUBLIC_DATA_LAYER.md](PUBLIC_DATA_LAYER.md) derives the inverse; editors must never maintain two copies of the same relationship.

## Entry and exit rules

Every public detail view must provide:

1. A clear collection identity and permanent URL.
2. Current-state metadata appropriate to the collection.
3. One primary artifact or evidence body.
4. At least one specific next path when a real relation exists.
5. A graceful collection-level fallback when no relation exists.

Contact is not appended to every section. It appears when the visitor has enough context to act: after a Work outcome, Blueprint fit assessment, Services evidence set, About close, or the homepage's final chapter.

## Representative journeys

### Technical prospect

```text
Search result → Work detail → technical decision → related Build
             → Blueprint preview → Services evidence set → Contact
```

The prospect reaches Contact with a shared vocabulary and can reference real evidence.

### Product-minded visitor

```text
Home → featured Build → live product/repository
     → originating Lab → recent Note → follow future updates
```

The company is understood through products and active engineering, not its service menu.

### Engineer or recruit

```text
Note → author Engineering Profile → principles/interview
     → featured Lab/Build → About
```

The person is credible because their profile connects to decisions and artifacts.

### Blueprint evaluator

```text
Blueprints filter → Blueprint detail → live preview
                  → Work/Build evidence → Contact
```

The reusable foundation is evaluated before a sales conversation begins.

## Studio-to-public mapping

Studio owns records and documents. The public layer owns presentation, sequence, and derived navigation. The mapping below is delivered through public DTOs and resolvers in [PUBLIC_DATA_LAYER.md](PUBLIC_DATA_LAYER.md), never through direct collection access from a route or component.

| Studio type | Public appearance | Editable in Studio | Handcrafted/derived publicly |
|---|---|---|---|
| Work | Index cards/rows, detail case study, evidence links | Title, client type, category, timeline, role, technologies, relations, hero, repo, status, case-study Document | Detail template, narrative order, relationship labels, outcome placement rules |
| Build | Featured/product indexes, product detail, live/repo state | Title, deployment state, URLs, technologies, originating Lab, related Work, media, featured flag, case-study and technical Documents | Product-first composition, architecture presentation, live-state treatment, derived backlinks |
| Blueprint | Filterable library and detail/preview | Enforced name, architecture, design language, summary, features, technologies, URLs, version, media, featured flag, case-study Document | Fit-assessment sequence, preview choreography, relation labels, naming explanation |
| Lab | Active index, journal detail, homepage current-state signal | Stage, objective, research direction, milestone, criteria, dates, URLs, technologies, relations, media, milestones, journal Document | Stage semantics, progress composition, recency policy, graduation transition |
| Note | Editorial index, article, relation bridge | Title, author User, summary, technologies, relations, publication date, featured flag, media, body Document | Article template, byline resolution, topic landing logic, reciprocal links |
| Engineering Profile | Earned index/detail, byline destination, About bridge | Team member, overview, philosophy, exploration, expertise/interests/identity, technologies, featured relations, media, five profile Documents, workflow | Profile eligibility language, document-role sequencing, transition behavior, evidence completeness rules |
| Team | About roster and identity source for Profiles | Name, role, bio, group, portrait, public visibility, optional User link | Roster-stage composition, group order, profile availability state |
| Service | Evidence-led Services route and compact homepage passage | Title, description, evidence links, publish state | Page thesis, grouping/order until an explicit order field exists, CTA placement |
| Media | Images and media embedded everywhere | Asset, alt text, caption, credit, dimensions, tags, folder | Crop rules by context, responsive treatment, layout role |
| Taxonomy | Filters, metadata, search, technology/topic paths | Label, slug, kind | Which facets appear on each index, canonical public labels, query behavior |
| Documents | Long-form bodies rendered through the shared block contract | Ordered validated blocks and version history | Public renderer, prose width, block composition, table of contents, block-specific motion |
| Document versions | No direct public route | Internal version records | Never exposed unless a future public changelog is deliberately modeled |
| Users | No public route | Internal identity and permissions | May resolve a Note author to a public Team/Profile record; never render User directly |
| Leads | No public route | Contact submissions and internal follow-up | Contact form and confirmation only; internal notes/assignment never leave Studio |

### Global content boundary

The current Studio model has no global public settings collection. Therefore these remain handcrafted in code/configuration for the first implementation:

- Company identity statement and homepage chapter framing.
- Global navigation labels and order.
- Design principles and capability framing.
- Contact expectations and privacy copy.
- Relationship vocabulary and editorial completeness rules.
- SEO defaults and structured-data templates.

Do not overload Services, Notes, or Documents to simulate global settings. If editors later need routine control over global framing, design a small typed site-settings model as its own approved phase.

## Publishing and visibility rules

[PUBLIC_DATA_LAYER.md](PUBLIC_DATA_LAYER.md#canonical-visibility) owns the complete, fail-closed predicate. The rules below summarize its public-information-architecture consequences:

- Only `published` full-workflow records and `published` Services render publicly.
- Team requires `publicProfile: true`; Engineering Profiles additionally require their own `published` status.
- A published Engineering Profile whose Team record is not public must not render; Studio should surface this mismatch before public implementation.
- Archived or draft relation targets do not render as links. The source content remains readable without a broken relationship.
- Search, indexes, Homepage queries, sitemaps, feeds, structured data, and relationship queries consume the same public visibility predicate and read models.
- Featured flags influence curation only; they never bypass publication status.

## Discoverability

- Every collection detail has one canonical, indexable URL.
- Indexes explain their collection before offering filters.
- Structured data reflects real types and available facts; no fabricated ratings, metrics, or authorship.
- Notes, Labs, and Engineering Profiles target question-, decision-, and practitioner-shaped discovery, not keyword volume.
- Internal links are generated only from explicit relations, authorship, shared taxonomy where useful, and editorial curation.
- Public search indexes a lightweight discovery projection from the public read layer first. Full-document search may be added later without changing the palette contract or querying raw Studio blocks.

## Decisions requiring approval

1. Use `/engineering` for the earned profile system and keep `/about` for team/company identity.
2. Promote Notes into the long-term pill only after its publication threshold, replacing Services rather than extending the pill.
3. Keep Services public and discoverable but contextual rather than permanently primary.
4. Keep global positioning handcrafted until a typed Studio settings model is separately approved.
5. Do not expose inferred contributors until Studio has explicit contribution relationships.
6. Require every public route and discovery surface to consume `PUBLIC_DATA_LAYER.md` contracts rather than Studio collections.
