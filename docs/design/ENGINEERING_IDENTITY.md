# Engineering Identity

**Status:** Implemented, with one exception — see "Roster stage" below, whose designed interaction hasn't shipped. Phase 12 design proposal; the rest of this identity language is live across the public site.

Engineering identity is the visible consequence of how HubZero works. It is not an illustration style and should never depend on terminal wallpaper, circuit traces, blueprint grids, code rain, or invented system telemetry.

## Identity thesis

HubZero's engineering identity is built from six kinds of evidence:

1. **State** — published, live, testing, retired, current milestone, last major update.
2. **Lineage** — originated in, informed by, applied in, generalized as.
3. **Decision** — constraints, alternatives, trade-offs, and lessons.
4. **Artifact** — product, repository, deployment, screenshot, architecture, code, document.
5. **Accountability** — author, engineer, team identity, permanent reference.
6. **Continuity** — versions, journals, progress, and reciprocal links across the site.

When these are present and legible, the site looks engineered without decorative engineering motifs.

## Cross-site identity grammar

### Reference IDs

Reference IDs are stable addresses for human conversation and citation. They appear near detail titles and in search results, never as oversized decoration.

- Work: `HZ-WK-###`
- Build: `HZ-BL-###`
- Blueprint: `HZ-BP-###`
- Lab: `HZ-LB-###`
- Note: `HZ-NT-###`
- Engineering Profile: `EP-###`

Use the mono system voice. Provide a copy action where useful. IDs do not replace titles, slugs, or plain-language labels.

### State language

Status uses a dot plus a written label. Color is secondary.

- Green: live, successful, submitted, nominal.
- Amber: active, current, selected, in progress.
- Gray: planned, inactive, retired, historical.

Public publishing workflow states such as Draft or Approved never leak into the public site. Public state describes the artifact: Testing, Live, Retired, Last updated, Current milestone.

### Annotation

Annotations explain real artifacts:

- Architecture callouts identify boundaries and decisions.
- Screenshot captions explain what changed or why it matters.
- Metrics include source and measurement context.
- Code labels identify language and purpose.
- Timelines distinguish event date from publication date.

Annotation is restrained and editorial. It does not cover imagery with decorative coordinates or pseudo-technical labels.

### Relationship language

Typed relationship labels are a signature across all collections. The same verb means the same relationship everywhere. See `PUBLIC_INFORMATION_ARCHITECTURE.md` for the canonical vocabulary.

### Version and recency

Version, deployment state, Lab stage, publication date, and last major update communicate that engineering changes over time. Recency is shown where it informs trust; it is not sprayed across static company copy.

### Technical typography

- Instrument Sans communicates structure and primary meaning.
- Instrument Serif italic introduces occasional human judgment.
- IBM Plex Mono communicates identifiers, states, dates, versions, technologies, and compact data.

Mono is not a shortcut for “developer aesthetic.” Long prose and headline statements remain readable sans/serif typography.

## Engineering motifs

Approved motifs are functional patterns with a real data source.

| Motif | Data source | Role |
|---|---|---|
| Reference badge | Permanent Studio ID | Citation and recognition |
| State pair | Stage/deployment/public fields | Current maturity |
| Decision record | Document headings/blocks | Judgment and trade-off |
| Milestone track | Lab milestones | Progress over time |
| Lineage link | Studio relations | Movement through the HubZero lifecycle |
| Architecture frame | Technical Document content | System boundaries and flow |
| Evidence citation | References/Metrics block | Trust and verifiability |
| Version marker | Blueprint version or release data | Evolution |
| Technology path | Taxonomy | Cross-collection exploration |

Prohibited motifs remain those rejected by `DESIGN_SYSTEM.md`: decorative blueprint/circuit language, floating schematics, animated particles, coordinate overlays with no meaning, and generic terminal blocks. See "Founder identity scope" below for the one narrow, accountable exception to this list.

## Accent system

Amber remains a functional signal, not a general brand fill.

### Allowed

- Current Lab milestone.
- Selected filter or active navigation state.
- Focus ring.
- One restrained editorial emphasis.
- Active position in an interactive architecture or relationship view.

### Not allowed

- Large backgrounds, gradients, decorative rules, default card borders, icon families, inactive technologies, or every link.
- Both “current” and “warning” in the same context.
- Persistent glow or pulsing status.

The public system should often render entire viewports without amber. Scarcity preserves meaning.

## Founder and team presentation

### Founder modules, not business cards

The brief's “founder cards” should be implemented conceptually as **Founder Modules** within the About roster stage, not as a generic card grid.

Each module may contain:

- portrait;
- name and real role;
- concise responsibility statement;
- current focus;
- one recent or representative artifact;
- Engineering Profile path when a published profile exists.

The module's job is to connect organizational responsibility to evidence. Social links, decorative skill meters, availability badges, and long biographies do not belong.

### Founder identity scope

Each founder has one procedural motif and one accent color (`src/config/founder-identity.ts`) — a deliberate, narrow exception to the single-amber-accent rule above and to the "prohibited motifs" line, not an oversight. This section is the boundary that exception operates inside.

**What makes a motif acceptable here, when the same visual language is prohibited elsewhere:** the prohibition on "decorative blueprint/circuit language, floating schematics... coordinate overlays with no meaning" targets iconography with no real referent — ornamental engineering-diagram wallpaper. A founder motif is the opposite case by construction: every motif is required to trace to that specific person's own documented expertise, not be assigned arbitrarily. Concretely — the `pcbTrace` motif ("right-angled circuit traces routing between board vias") belongs to Salsabeel Kobattey, an electronics engineer whose own bio names embedded systems, VLSI, and FPGA design; the `network` motif ("a distributed system of routing lines splitting, merging, and terminating") belongs to Rifaque Ahmed, whose real work is platform/orchestration engineering. Each motif's `motifDescription` field is the accessible, plain-language check on this — if a motif's description doesn't map to something true about that person, it's decoration and doesn't belong here regardless of how it looks.

**Where it applies:**
- The founder's own Engineering Profile route — the full page, including that route's own bespoke per-founder composition classes (e.g. `.founder-eyebrow`, `.founder-decision-list`, `.founder-editorial-outline`, `.founder-pinout`), none of which render anywhere else.
- The About page's founder card, which links into that route.
- The smaller cross-reference tier a founder's name gets wherever they're credited outside their own profile (`FounderCrossLink` — a Notes byline, a relationship card crediting a founder on a Work/Build/Lab/Note detail page): the same accent plus a compact motif variant, degrading gracefully to a plain link for anyone without a designed identity. This is a real, considered part of the system, not scope creep — a founder's name should look like the same person's name everywhere it's credited.

**Where it explicitly does not apply:** the Homepage is held to the strictest reading of the single-amber-accent rule — no founder color anywhere on it, regardless of how the rest of this system resolves (`RelationshipCard`'s `showFounderAccent` prop, `EditorialPrimitives.tsx`). This is the one deliberate opt-out, not an inconsistency to fix.

**Choreography:** the profile hero's motif draws once on mount — a genuine signature moment (see `--duration-motif` in `MOTION_GUIDELINES.md`), not a recurring interaction. The About card's copy of the same motif stays fully undrawn at rest and reveals only on hover/focus, via an interruptible CSS `transition` (not a keyframe animation) — hovering across several founder cards in the roster doesn't replay a committed sequence per card, it tracks the hover state directly like any other hover-reveal metadata row. On a browser that supports the View Transitions API (and without `prefers-reduced-motion`), navigating from the About card into the profile route treats the two motifs as one continuous object (`FounderProfileLink`, `founderMotifViewTransitionStyle`) rather than restarting cold.

### Roster stage

**Not implemented.** The design below describes the intended interaction; the current About page (`src/components/public/about/About.tsx`) renders three static CSS grids instead — no focus/hover/click-to-select state, no single-person stage. This section is kept as the design target for whoever picks this up, not as a description of current behavior.

The canonical roster-stage pattern is intended as the primary About interaction:

- One person is in focus.
- A compact list makes every public Team member directly reachable.
- Hover and focus may preview a person; click/tap commits selection.
- Mobile presents the same roster as a deliberate sequence, not an accordion of mini résumés.
- Switching people preserves the stable roster context.

Founder grouping may receive stronger editorial placement, but it must not imply that only founders produce engineering evidence.

## Engineering Profiles

### Purpose

Engineering Profiles document how an engineer thinks and what evidence supports that identity. They are optional and earned. They are not employee biographies, résumés, skill inventories, or personal portfolios.

### Eligibility

A public Profile requires:

- a public Team record;
- published Profile status;
- a current overview and exploration;
- specific engineering identity statements;
- at least two meaningful featured evidence links;
- at least one substantive long-form Document role.

The template must handle Team members without Profiles gracefully: About shows their identity and contribution without a disabled “Profile coming soon” affordance.

### Profile composition

```text
Identity anchor
  name · role · EP reference · portrait
        ↓
Engineering position
  overview · philosophy · identity statements
        ↓
Current work
  exploration · interests · technologies
        ↓
Evidence
  Work · Builds · Blueprints · Labs · Notes
        ↓
Long-form lenses
  introduction · interview · timeline · quotes · achievements
```

The structured fields create orientation and filtering. Documents provide depth. Featured relations are editorial choices, not an automatic activity dump.

### Profile transition

About → Profile is the identity system's principal transition:

1. The selected person's name and portrait remain the anchor.
2. Roster context recedes without disappearing abruptly.
3. Engineering identity and current exploration reveal first.
4. Evidence constructs around the person by relationship type.
5. Browser back restores the roster selection and scroll position.

Reduced motion uses a direct route change with the same anchor information visible at the destination.

### Authorship and contribution

Notes have an explicit User author. Public bylines resolve through the safe Author DTO path in [PUBLIC_DATA_LAYER.md](../architecture/PUBLIC_DATA_LAYER.md#author-resolution): User → public Team → published Engineering Profile when those links and visibility conditions exist.

Other content types currently store `createdByUserId` for provenance and authorization. This must not be presented as public contribution credit. A future explicit contributor relation is required before Work, Builds, Blueprints, or Labs can name individual contributors reliably.

## Identity by public surface

| Surface | Identity expression |
|---|---|
| Home | Product state, current Lab/Note, one accountable person, four-pillar lineage |
| Work | Constraint, role, decisions, sourced outcome, related systems |
| Builds | Product state, architecture, version/deployment, originating research |
| Blueprints | X/Y naming, version, preview, proven applications |
| Labs | Stage, current milestone, dated journal, blockers, graduation |
| Notes | Author, publication date, references, connected artifacts |
| About | Team structure, responsibility, Founder Modules, roster stage |
| Engineering Profiles | Principles, current exploration, selected evidence, long-form lenses |
| Services | Capability definitions proven by pillar evidence |
| Contact | Context carried from the evidence path that triggered contact |

## Imagery

- Product and work imagery must be real.
- Architecture imagery should clarify boundaries or decisions.
- Team portraits use the consistent canonical lighting, crop, and color treatment.
- Profile galleries are curated evidence, not lifestyle galleries.
- Screenshots need captions that explain relevance.
- Missing media remains an internal publishing issue; public templates should not display Studio's instructional placeholders.

## Cross-site consistency

Consistency comes from semantics, not making every collection use the same card:

- The same reference treatment everywhere.
- The same state vocabulary everywhere.
- The same relationship verbs everywhere.
- The same focus, keyboard, and motion behavior everywhere.
- The same evidence standards everywhere.
- Different compositions for different content jobs.

## Identity review checklist

- Is every technical-looking element backed by real information?
- Does the surface show what is current, proven, or historical?
- Are claims connected to artifacts, decisions, or sources?
- Are relationships named rather than implied?
- Is individual credit explicit in the data, not inferred?
- Does amber communicate a permitted active state?
- Would the identity remain credible with all motion disabled?
- Has any borrowed engineering-site aesthetic replaced HubZero's own content grammar?
