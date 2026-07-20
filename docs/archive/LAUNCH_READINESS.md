# Launch Readiness

**Status:** Phase 13 go/no-go matrix — documentation only, pending review

**Snapshot:** 17 July 2026

This matrix answers what can genuinely launch from the current Studio content. It applies [PUBLIC_NARRATIVE.md](../product/PUBLIC_NARRATIVE.md)'s completeness gates after the canonical visibility rules in [VISIBILITY_RULES.md](../architecture/VISIBILITY_RULES.md).

## Decision summary

**Public website content launch: No-go.**

The Studio architecture is usable as an editorial system, but the current records are verification/sample material and do not supply a truthful launch body. Published workflow status must not be interpreted as launch approval.

## Collection matrix

| Collection | Launch ready? | Missing content | Blocking issues | Priority |
|---|---|---|---|---|
| Work | No | Verified summary, complete case study, constraint/decisions/outcome/lessons, category, real media | Candidate is not verified as publishable client work; Document is one duplicated paragraph | P0 verify, P1 complete |
| Builds | No | Product summaries, substantive case-study/technical Documents, real screenshots/architecture, current links | Published Build's live/repo URLs return 404; hero/gallery is the app icon | P0 links/media, P1 content |
| Blueprints | No | Real deployed preview, complete case study, audience/fit, proof relations, preview assets | Required deployment/docs do not resolve; repo returns 404; claims lack linked evidence | P0 launch gate |
| Labs | No | Current-model fields, dated Documents, milestones, technologies, recency, real links/media | Published record is schema-incompatible and lineage is one-sided | P0 data integrity |
| Notes | No | At least five substantive Notes, credible attribution, complete bodies/references | One thin published Note; author has no Team match; route gate not met | P1 corpus |
| Engineering Profiles | No | Verified people, real portraits, distinct substantive Documents, visible evidence | Current content is duplicated/sample-oriented; media is app icon; one record stores invalid null | P0 identity/media, P1 content |
| Team Members | No | Approved real roster, verified roles/bios/groups, portraits or approved no-portrait composition | Team records link to verification User identities and have no portraits | P0 identity verification |
| Services | No | Real service definitions, boundaries, ordering decision, visible evidence | Collection is empty | P1 content |
| Media | No as a dependency | Real heroes, screenshots, diagrams, portraits, captions/credits/social crops | Only asset is a mislabeled app icon reused in incorrect roles | P0 accessibility/truth |
| Taxonomy | Partial as a dependency | Work categories and Note topics when justified | Technologies only; no useful category/topic facet set | P1 with real content |
| Documents | No as a dependency | Substantive owner-specific narratives and evidence | Existing bodies are heading-only, one-sentence, duplicated, or absent | P1 content |

No collection should be made public merely to exercise a future template.

## Route matrix

| Route/surface | Decision | Reason |
|---|---|---|
| `/` | No-go | No qualifying product signal, evidence chapter, current engineering pair, or verified people chapter |
| `/work` and Work detail | No-go | No verified launch-ready case study |
| `/builds` and Build detail | No-go | No complete product record with working destinations and real media |
| `/blueprints` and Blueprint detail | No-go | Permanent deployed-Blueprint gate fails |
| `/labs` and Lab detail | No-go | Published Lab cannot construct the current public DTO |
| `/notes` and Note detail | No-go | Five-Note content gate fails |
| `/engineering` and Profile detail | No-go | No earned, verified Profile with suitable identity/media/content |
| `/about` | No-go | Current roster is unverified and portrait treatment is unavailable |
| `/services` | No-go | No Service records or evidence sets |
| `/contact` | Outside this content audit's launch approval | Contact/Leads implementation belongs to Phase 21; global expectations/privacy copy remain handcrafted |
| `/privacy` | Outside this content audit's launch approval | Legal copy requires owner/legal approval, not Studio collection readiness |
| Public search | No-go | There is no approved launch corpus; search must not index fixtures |
| Sitemap/structured data | No-go for collection routes | Projections must wait for approved visible routes and complete metadata |
| Notes RSS | No-go | Notes route/content gate fails |

## Homepage chapter matrix

| Chapter | Qualifying content now? | Decision |
|---|---|---|
| Identity | Handcrafted framing can be drafted later | Do not finalize against fixture evidence |
| Product signal | No | Published Build is incomplete and its live destination fails |
| Four-pillar operating system | Structurally defined | Can remain a design contract; not sufficient to launch a homepage |
| Evidence | No | Work/Blueprint/technical evidence is incomplete or unverified |
| Current engineering | No | Lab lacks current-model recency/evidence; only published Note is too thin |
| People and principles | No | Team/Profile identities and media are unverified/sample-oriented |
| Relevant engagement | Not yet | Requires working destination routes and approved Contact behavior |

Phase 15's omission rules remain valid, but omitting every evidence-bearing chapter would leave a positioning shell rather than the active engineering publication approved in Phase 12. The Homepage should not launch in that state.

## Content-gated surfaces

### Notes gate

| Requirement | Current | Pass? |
|---|---:|---|
| Five substantive published Notes | 1 published, body is three short blocks | No |
| More than one author or explicit single-author rationale | 1 internal User; no public Team resolution | No |
| Coverage across at least three pillar entries | Published Note references Work, Build, and Lab | Structurally yes; evidence entries are not launch-ready |
| No announcement-only sequence | Current titles are technical | Insufficient corpus to evaluate |

### Engineering Profile gate

| Requirement | Published Profile current state | Pass? |
|---|---|---|
| Public Team record and published Profile | Both flags pass | Structural only |
| Current overview, identity, exploration | Populated | Not verified as real/current |
| Two meaningful visible evidence links | Several visible targets | No; targets are not launch-ready evidence |
| One substantive Document role | Five one-paragraph roles | No |
| Appropriate portrait | App icon | No |

### Blueprint gate

| Requirement | Current | Pass? |
|---|---|---|
| Valid `Blueprint-X-Y` name | `Blueprint-SaaS-Editorial` | Yes |
| Intended audience and X/Y explanation | Only short description/labels; body empty | No |
| Working live deployment | DNS does not resolve | No |
| Features and technologies | Populated | Yes structurally |
| Real preview assets | None; hero is app icon | No |
| Complete case study and proof | Heading only; no proof relations | No |

## Minimum content set for first public release

This is a gate, not a request to fabricate volume:

- at least one verified, complete Work case study;
- at least one real Build with complete product/technical content and a truthful current destination or retired-state explanation;
- at least one real deployed Blueprint, because Blueprints is a permanent launch pillar;
- at least one current Lab with dated evidence and valid current-state metadata;
- an approved public Team roster;
- enough real Media to represent those entries accurately;
- a small, justified taxonomy supporting the actual launch content;
- Services only if real evidence-backed entries are ready;
- Notes and Engineering Profiles only when their separate gates pass.

This minimum does not imply that one item per pillar is ideal. It defines the smallest truthful release consistent with the approved architecture.

## Go criteria by collection

### A collection can move from No-go to editorial review when

1. Every launch candidate is confirmed real and approved for publication.
2. The required Summary and Detail DTO fields in [PUBLIC_DTO_SPECIFICATION.md](../architecture/PUBLIC_DTO_SPECIFICATION.md) have explicit Studio sources.
3. Required Documents meet [PUBLIC_NARRATIVE.md](../product/PUBLIC_NARRATIVE.md)'s completeness gate.
4. Required media and external destinations are truthful and usable.
5. Relationships resolve reciprocally without hidden-target leakage.
6. Attribution resolves without User exposure.
7. SEO/OG/structured-data source fields are sufficient.
8. A content owner signs off on the exact public facts.

### The complete launch can move from No-go to implementation review when

- every required launch collection above is at least editorial-review ready;
- all P0 model/public-boundary ambiguities in [EDITORIAL_GAP_REPORT.md](EDITORIAL_GAP_REPORT.md) are resolved;
- Phase 13 DTO, visibility, relationship, and launch contracts are approved;
- Phase 14 can implement without inventing content or deciding privacy/publication policy in code;
- gated surfaces are either fully ready or coherently absent from navigation, Homepage, search, relations, and discovery.

## Recommended content sequence

1. **P0 integrity:** verify fixtures, reconcile Lab schema drift, repair media, decide URL visibility, and normalize relationships/attribution.
2. **Builds + Labs:** establish one real product/research lineage, matching the product-first Phase 12 thesis.
3. **Work:** complete one verified client case study and connect it to real product/pattern evidence.
4. **Blueprint:** deliver the first real deployed foundation and its proof.
5. **Team/About:** approve actual roster identity and imagery.
6. **Services:** define only evidence-backed services.
7. **Notes:** build the five-Note corpus before activation.
8. **Engineering Profiles:** publish only earned profiles with substantive evidence.

This sequence aligns content work with [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) without authorizing implementation.

## Approval record

Phase 13 remains pending until reviewers explicitly approve or amend:

- the DTO field requirements;
- the visibility predicate;
- the dual-stored relationship conflict behavior;
- the HubZero organization author fallback;
- the finding that no current collection is launch-ready;
- the field/model gaps that must be resolved before Phase 14.

Implementation must wait for that review.
