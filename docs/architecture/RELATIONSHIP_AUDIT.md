# Relationship Audit

**Status:** Phase 13 relationship contract — documentation only, pending review

**Audit snapshot:** 17 July 2026

This audit covers Studio relationship integrity, reciprocal public behavior, hidden-target handling, orphan behavior, author resolution, and navigation suitability. Visibility is always governed by [VISIBILITY_RULES.md](VISIBILITY_RULES.md); DTO shapes are defined in [PUBLIC_DTO_SPECIFICATION.md](PUBLIC_DTO_SPECIFICATION.md).

## Relationship principles

1. A relationship is a typed claim, not a generic recommendation.
2. Editors should express one logical edge once. The public read layer may derive the inverse.
3. A public edge exists only between independently visible endpoints.
4. Storage direction never changes public meaning.
5. A missing or hidden target removes the edge, not the source entity.
6. Public labels come from the canonical vocabulary, not arbitrary source copy.
7. Relationship counts never reveal hidden targets.
8. `createdByUserId` is provenance, never a contribution edge.

## Canonical relationship kinds

The stable `kind` values below are direction-neutral identities. Labels vary by direction.

| Kind | Source label | Inverse label | Cardinality | Intended navigation value |
|---|---|---|---|---|
| `labGraduatedToBuild` | Lab → Build: **Graduated into** | Build → Lab: **Originated in** | Lab 0..1; Build 0..1 origin | High: explains product lineage |
| `buildAppliedInWork` | Build → Work: **Applied in client work** | Work → Build: **Informed by** | many-to-many | High: connects internal product practice to client evidence |
| `artifactUsesBlueprint` | Work/Build → Blueprint: **Built on** or **Generalized as**, according to the stored semantic | Blueprint → Work/Build: **Proven in** | many-to-many | High when the edge is editorially specific |
| `labRelatedBuild` | Lab → Build: **Related Build** | Build → Lab: **Related Lab** | many-to-many | Medium; must not be confused with graduation |
| `labRelatedBlueprint` | Lab → Blueprint: **Related Blueprint** | Blueprint → Lab: **Explored in** | many-to-many | Medium; use only for a real research connection |
| `noteDiscussesArtifact` | Note → pillar entry: **Discusses** or **Documents** | Pillar entry → Note: **Engineering notes** | many-to-many | High: connects technical writing to evidence |
| `serviceProvenBy` | Service → pillar entry: **Proven by** | No default reverse navigation | many-to-many | High on Services; reverse edge is usually noise |
| `profileFeaturesEvidence` | Profile → content: **Selected work**, **Authored notes**, or **Current exploration** by target type | No inferred contributor label | many-to-many | High on Profiles; reverse link only for explicit Note authorship |
| `profileContributedToEntry` | Work/Build/Blueprint/Lab/Note → Profile: **Engineering contributor** | Profile → Work/Build/Blueprint/Lab/Note: **Contributed to** | many-to-many | High: explicit public credit, distinct from `createdByUserId` provenance and from `authorId` (Note's single system author) |
| `noteAuthoredBy` | Note → Author: **Author** | Profile/Team → Note: **Authored notes** | Note exactly one safe Author | High: accountability |
| `teamHasProfile` | Team → Profile: **Engineering Profile** | Profile → Team: identity owner | one-to-zero-or-one | High: About/Profile continuity |

The Blueprint relationship currently lacks enough Studio semantics to distinguish “Built on” from “Generalized as” reliably in every case. Until Studio records the intended meaning, the public resolver must use the conservative label **Blueprint** rather than infer causality from the mere presence of an ID. This is a content-model gap, not a copywriting choice.

## Studio storage audit

| Logical edge | Current storage | Current snapshot | Integrity finding |
|---|---|---|---|
| Work ↔ Build | `Work.relatedBuildIds` and `Build.relatedWorkIds` | QueryCraft points to Northwind; Northwind does not point to QueryCraft | Duplicate writable directions can disagree; current edge is one-sided |
| Lab ↔ graduated/origin Build | `Lab.graduatedToBuildId` and `Build.originatingLabId` | QueryCraft points to Edge Cache Runtime; Lab has no graduation field in its older persisted shape | Duplicate writable directions and model drift; current edge is one-sided |
| Work → Blueprint | `Work.relatedBlueprintIds` | Empty | Inverse can be derived safely when populated |
| Build → Blueprint | No current Build field | None expressible | Phase 12 relationship is not representable directly |
| Lab → Build | `Lab.relatedBuildIds` | Missing on old persisted Lab | Separate from graduation but current published record predates field |
| Lab → Blueprint | `Lab.relatedBlueprintIds` | Missing on old persisted Lab | Current published record predates field |
| Note → pillar entry | `Note.relatedEntries` | Published Note points to visible Work, Build, and Lab | Structurally sound; inverse can be derived |
| Service → evidence | `Service.evidenceLinks` | No Services | Model is adequate; no content to validate |
| Profile → evidence | Five typed featured-ID arrays | Published Profile points to five visible and one hidden Note across its sets | Model supports selection; target visibility must filter each set |
| Team → User | `Team.userId` | Two unique links | Structurally one-to-zero-or-one; linked display identities are verification accounts |
| Profile → Team | `EngineeringProfile.teamMemberId`, unique index | Two unique links | Structurally sound; Team visibility must gate Profile |
| Note → User author | `Note.authorId` | All Notes use a User with no Team match | Person attribution cannot resolve |
| Entry → Document | `(ownerType, ownerId, role)` | 15 Documents, no orphan owners or duplicate owner/role pairs | Current data is referentially sound; DB lacks a unique owner/role index |
| Entry/Document → Media | Media ID fields and block media IDs | One app icon reused across unrelated roles | Targets exist, semantics are wrong |
| Entry/Document → Taxonomy | Typed ID arrays | All current IDs resolve to technology-kind terms | Referentially sound; category/topic coverage absent |

## Reciprocal behavior contract

### Single-stored edges

Note references, Service evidence, Profile evidence, Work-to-Blueprint references, and similar one-direction storage produce public inverse links through a bounded inverse query. Editors do not maintain a second copy.

### Dual-stored edges

Work/Build and Lab/graduated-Build currently permit both endpoints to store the same logical edge. Until Studio chooses one canonical owner or guarantees atomic synchronization, the public resolver applies these rules:

1. If only one endpoint asserts an otherwise valid edge, accept it and derive both public directions.
2. If both endpoints assert the same edge, deduplicate it into one logical edge.
3. If endpoints assert different exclusive Lab/Build origins or graduation targets, treat the conflicting edge as invalid, omit the ambiguous lineage, and surface a Studio integrity error.
4. For many-to-many Work/Build relations, take the union of valid assertions for public reads, deduplicate pairs, and surface one-sided storage as an editorial integrity warning.
5. Removing one side of a dual-stored edge is not a reliable public deletion while the other side still asserts it. Studio must repair both sides or move to a single canonical storage direction before editors can depend on removal semantics.

These rules stabilize public reads but do not make the Studio write model healthy. Phase 14 must not silently create route-specific alternatives.

## Visibility and lifecycle handling

For every edge:

- evaluate source visibility;
- resolve the target by expected collection and public identifier internally;
- evaluate target visibility independently;
- produce a Public Entity Link only after both pass;
- omit draft, in-review, approved, archived, missing, malformed, or wrong-type targets;
- derive the inverse from the same normalized edge set;
- invalidate both endpoint projections when either endpoint changes visibility or relation fields.

The source remains readable if all its edges disappear. No “1 related item” count, title, reference ID, or placeholder may reveal a hidden target.

### Archived targets

Archived targets behave like missing targets publicly. No tombstone or historical title is approved. A Lab journal may state in prose that work later changed, but a typed public link appears only when the destination is visible.

### Orphan targets

An ObjectId that resolves to no record, resolves in the wrong collection, or points to a deleted record is an orphan. The resolver omits it and records an integrity error. It never returns a raw ID or generic card.

### Wrong taxonomy kind

Relationship pickers and public resolvers must validate semantic kind:

- Work categories accept `category` only.
- technology arrays and technology-stack blocks accept `technology` only.
- future Note topic fields accept `topic` only.

A valid Taxonomy ID with the wrong kind is still an invalid relationship.

## Navigation suitability

Not every valid database edge deserves equal public prominence.

| Relationship | Recommended public placement |
|---|---|
| Lab graduation / Build origin | Detail header/current-state area and lineage passage |
| Build ↔ Work | At the decision or application passage that explains the connection |
| Work/Build ↔ Blueprint | Near pattern/architecture evidence or Blueprint proof section |
| Note ↔ artifact | Beside the claim, milestone, or decision it documents; one bounded cluster after the body if no precise insertion exists |
| Service → evidence | Within the relevant Service section |
| Profile → evidence | Grouped by selected work, authored Notes, and current exploration |
| Team → Profile | About roster identity/action |
| Shared taxonomy | Filter/search path; not a substitute for an explicit causal relationship |

Avoid a universal “Related” carousel. If more than one relationship cluster exists, prioritize the relationship most relevant to the current narrative and keep the remainder bounded.

## Author resolution audit

### Canonical path

```text
Note.authorId
    ↓ internal User lookup only
exactly one linked Team record with publicProfile = true?
    ├── no  → HubZero organization Author
    └── yes → visible Engineering Profile for Team member?
               ├── no  → Person Author linking to About
               └── yes → Person Author linking to Profile
```

The Author DTO is defined in [PUBLIC_DTO_SPECIFICATION.md](PUBLIC_DTO_SPECIFICATION.md#author-resolution).

### Edge cases

| Condition | Public result | Editorial action |
|---|---|---|
| User and one public Team match, visible Profile | Person name/role/portrait; Profile destination | None if identity is verified |
| User and one public Team match, no visible Profile | Person identity; About destination | Profile remains optional |
| User exists, Team match hidden | HubZero organization fallback | Confirm whether Team should be public or reassign Note |
| User exists, no Team match | HubZero organization fallback | Add/repair Team link or accept organizational authorship explicitly |
| User missing | HubZero organization fallback | Repair invalid author reference before launch |
| Multiple Team records match User | HubZero organization fallback | Resolve uniqueness violation; do not choose arbitrarily |
| Team public, Profile draft/archived | Person identity; About destination | Do not leak Profile existence |
| Note author differs from `createdByUserId` | Use explicit `authorId` path | Correct; creator is provenance only |
| Work/Build/Blueprint/Lab/Note creator has public Team | `createdByUserId` alone still confers no public credit | Use the explicit `contributorProfileIds` relation (`profileContributedToEntry`) for public credit |

### Current snapshot

All three Notes reference the same Phase 9 verification User. No Team record links to that User. The published Note therefore resolves only to the HubZero organization fallback under this contract. It is not ready for person-level attribution.

## Media relationship audit

Media relationships require more than target existence. The mapper must validate role suitability and context:

- hero media must represent the entity;
- screenshots must be real screenshots;
- portraits must depict the named person;
- gallery items must add evidence rather than repeat the hero without purpose;
- block alt text may be contextual but must remain truthful;
- media used by hidden owners does not expose those owners through reverse usage.

The single current asset fails role suitability for every audited use. See [CONTENT_AUDIT.md](../archive/CONTENT_AUDIT.md#media).

## Relationship repair priorities

### P0 — before any public DTO implementation

1. Reconcile the published Lab with the current model and its Build lineage.
2. Decide canonical Studio ownership/synchronization for Work ↔ Build and Lab ↔ Build edges.
3. Define a representable Build ↔ Blueprint relationship or narrow the public narrative until one exists.
4. Repair Note author-to-Team linkage or explicitly approve organization authorship.
5. Remove semantically incorrect Media relationships.

### P1 — before collection launch

1. Verify every relation is an editorial claim, not a fixture convenience.
2. Populate Service evidence with visible, strong targets.
3. Remove hidden/draft featured Profile targets or accept that they will be filtered.
4. Add an owner/role uniqueness invariant for Documents during a future implementation phase.
5. Add relationship integrity reporting to the future Studio review workflow; Phase 13 does not implement it.

## Contract acceptance cases for Phase 14

The future resolver must be verified against:

- one-sided and two-sided matching Work/Build edges;
- conflicting exclusive Lab/Build edges;
- duplicate relationship IDs;
- visible source with hidden, archived, missing, and wrong-type targets;
- inverse queries with mixed visibility;
- Profile evidence containing draft Notes/Builds;
- Author resolution through Profile, Team-only, and organization fallback;
- Media and taxonomy IDs that exist but fail semantic role/kind checks;
- invalidation at both ends of a relation.

These are documentation-defined acceptance cases, not Phase 13 code tasks.
