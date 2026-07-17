# HubZero Public Experience

**Status:** Phase 12 design proposal — documentation only

**Research date:** 17 July 2026

**Depends on:** `AGENTS.md`, `.hubzero/agents/AGENTS.md`, `PLANNING.md`, `CMS_PRODUCT_DESIGN.md`, and `DESIGN_SYSTEM.md`

This document defines the long-term character of HubZero's public experience. It does not authorize implementation. The detailed structure lives in [PUBLIC_INFORMATION_ARCHITECTURE.md](PUBLIC_INFORMATION_ARCHITECTURE.md), the Studio-to-public read boundary in [PUBLIC_DATA_LAYER.md](PUBLIC_DATA_LAYER.md), the time-based story in [PUBLIC_NARRATIVE.md](PUBLIC_NARRATIVE.md), motion in [MOTION_GUIDELINES.md](MOTION_GUIDELINES.md), engineering identity in [ENGINEERING_IDENTITY.md](ENGINEERING_IDENTITY.md), and sequencing in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

## Experience thesis

HubZero should feel like an active engineering publication backed by a product company.

It is not an agency brochure, a founder portfolio, or a gallery of disconnected projects. It is a public view into a system that repeatedly moves from exploration to shipped product, client application, and reusable foundation. Visitors should understand the company by following evidence through that system.

The four pillars remain permanent and distinct:

- **Work** proves that HubZero solves consequential client problems.
- **Builds** establishes products as the company's long-term identity.
- **Blueprints** turns proven patterns into reusable foundations.
- **Labs** exposes active investigation before it becomes a finished product.

Notes, Engineering Profiles, Services, About, and Contact support those pillars. They do not become competing pillars.

## Primary transformation

The public experience moves a visitor through four states:

```text
Unfamiliar
   ↓  clear identity
Oriented
   ↓  real artifacts and outcomes
Convinced
   ↓  connected technical depth
Ready to follow, use, or engage
```

The site succeeds when a visitor can state, without repeating marketing copy:

1. HubZero is an engineering company.
2. It ships its own products and applies the same rigor to client work.
3. Its work is documented, current, and connected.
4. There is an obvious next path: inspect a product, follow an investigation, read a technical note, or start a relevant conversation.

## Design principles

These principles refine, rather than replace, `DESIGN_SYSTEM.md`.

1. **Engineering before marketing.** Show the artifact, decision, state, or outcome before describing the capability.
2. **Products carry the identity.** Builds lead the long-term company story; services remain evidence-backed support.
3. **Content before decoration.** Every visual surface must improve comprehension, comparison, or navigation.
4. **Systems over pages.** Repeated narrative roles and relationships matter more than isolated layouts.
5. **Motion communicates structure.** Movement reveals causality, hierarchy, or continuity; it never fills silence.
6. **Typography carries hierarchy.** Color remains a functional signal and amber keeps its canonical restrictions.
7. **Calm confidence over hype.** Precision, specificity, and restraint replace superlatives.
8. **Depth without disorientation.** Every detail can go deep, but always exposes its lineage and a meaningful next path.
9. **Current state is evidence.** Dates, stages, versions, deployments, repositories, and recent updates make engineering visible.
10. **Mobile is a composed reading experience.** It preserves the architecture while deliberately resequencing its presentation.

## The experience model

The public system uses five recurring narrative moves. These are more important than a catalog of page layouts.

| Move | Visitor question | Public expression |
|---|---|---|
| Orient | What is HubZero? | A direct identity statement and the four-pillar model |
| Demonstrate | What has it actually made? | Product surfaces, case-study evidence, deployed previews, repositories, sourced outcomes |
| Explain | How does it think? | Architecture, decisions, trade-offs, lessons, Engineering Profiles |
| Connect | How does this relate to other work? | Typed relationships, backlinks, lineage, technologies, authorship |
| Continue | Where should I go next? | Contextual next links, search, live artifacts, contact paths |

Every major public surface should perform at least three of these moves. No surface should end with a generic “related content” grid when a specific relationship can be named.

## Editorial rhythm

The website should read like a product publication, not a sequence of marketing bands.

- Alternate **statement**, **artifact**, **analysis**, and **index** passages. Repeating the same card grid shape weakens the story.
- Use whitespace to group and pace information, not to manufacture importance. On wide screens, secondary evidence, metadata, and relationship rails should occupy available space so content does not become a narrow island in an empty viewport.
- Preserve readable prose widths while allowing diagrams, screenshots, tables, timelines, and code to use wider measures.
- Let one strong artifact carry a chapter. Avoid collages that flatten five pieces of evidence into equal noise.
- Use metadata as orientation: reference ID, stage, version, date, role, technology, deployment state. Metadata is useful only when it answers a visitor's question.
- Treat index views as editorial fronts, not raw database dumps: a lead item establishes the current story, followed by a complete, filterable collection.

## Research observations

The following observations come from the organizations' current official public sites. They are principles to interpret, not layouts to copy.

| Reference | What works | Why it works for an engineering audience | HubZero lesson |
|---|---|---|---|
| [Stripe](https://stripe.com/) | Moves from a clear infrastructure claim to product breadth, operational scale, customer evidence, developer paths, and current publications. | Each larger claim is followed by a more concrete proof type; different audiences can enter without breaking one narrative. | Layer identity, product evidence, technical depth, and editorial material instead of placing them in separate silos. |
| [Vercel](https://vercel.com/) | Uses real product and infrastructure vocabulary, customer scale, “recently shipped” material, and direct build paths. | The company appears current because shipping is part of the homepage, not hidden in a changelog. | Make active Builds, Lab state, and recent Notes visible as proof of momentum. |
| [Linear](https://linear.app/) | Explains workflows through product-shaped artifacts, precise labels, and a sequential operating model. | Visitors learn the product by following state changes rather than reading abstract benefit copy. | Show engineering process with real states and artifacts; do not imitate Linear's visual style or figure decoration. |
| [Figma](https://www.figma.com/) | Connects design, build, AI, community, and customer work around one shared product-development canvas. | Breadth feels coherent because every capability returns to a single working context. | The four pillars need a shared lifecycle and relationship language, not four unrelated showcases. |
| [Cloudflare](https://www.cloudflare.com/) | Uses concrete comparisons, pricing logic, network scope, and technical explanation to make infrastructure legible. | Complex systems become credible when their operating model is shown plainly. | Prefer explainable diagrams, constraints, and sourced operational facts to generic capability claims. |
| [GitHub](https://github.com/) | Starts in developer vocabulary and follows the complete code-to-deployment workflow with real interface behavior. | The product demonstrates its category rather than translating itself into generic business language. | Use accurate engineering language, while giving non-engineers enough context to understand consequences. |
| [Anthropic](https://www.anthropic.com/) | Places research and products together in the primary thesis, then treats hard questions and latest releases as first-class content. | Institutional identity comes from what the organization investigates and publishes, not only what it sells. | Labs and Notes should strengthen company identity rather than sit behind a “resources” label. |
| [OpenAI](https://openai.com/) | Operates as a current publication across products, news, stories, research, safety, and business evidence. | Freshness and breadth communicate a living organization; strong taxonomy prevents the feed from becoming undifferentiated. | Use collection type, relationship, and date to create one editorial body without erasing pillar distinctions. |
| [Shopify](https://www.shopify.com/) | Makes merchant outcomes and real storefronts the visible product story, then connects them to platform capability. | Customer expression is evidence of the platform rather than a detached testimonial layer. | Work imagery and outcomes should demonstrate HubZero's engineering, not decorate it. |
| [React](https://react.dev/) | Teaches through runnable-looking code, progressive examples, and concepts sequenced from components to platforms and community. | Explanation and demonstration are the same object, reducing distance between claim and understanding. | Prefer embedded artifacts, code, timelines, and diagrams that do explanatory work. |
| [Next.js](https://nextjs.org/) | Establishes a concise category, catalogs capabilities, exposes technical foundations, then offers immediate starting paths and adoption proof. | The narrative answers orientation, capability, confidence, and action in a predictable order. | Each pillar detail should have one clear purpose and a specific next action. |
| [Tailwind CSS](https://tailwindcss.com/) | Lets the framework's own class vocabulary annotate demonstrations and turns capability examples into the content. | The product's grammar becomes the site's explanatory grammar. | Let HubZero's real grammar—references, versions, stages, decisions, relations—shape the interface. |

### Patterns to adopt

- A short, durable identity statement before detail.
- Real interface, code, architecture, and outcome evidence.
- Current work and recent publishing as a sign of organizational life.
- Progressive disclosure that serves both scanning and deep reading.
- Named, contextual paths between products, research, people, and writing.
- Typography and pacing that distinguish chapters without relying on decorative backgrounds.
- Interaction that preserves context and makes state changes obvious.

### Patterns not to import

- Another company's gradient, grid, dark aesthetic, type treatment, or product-demo choreography.
- Logo walls, invented metrics, generic testimonials, terminal wallpaper, code rain, circuit traces, or blueprint decoration.
- Dense mega-navigation simply because a larger platform needs it.
- Motion that turns a straightforward scroll into a presentation timeline.
- A homepage that tries to give every collection equal weight.

## Visual and spatial direction

The canonical monochrome system remains correct. Its public expression should become more editorial and less interface-card dependent:

- **Typography:** large sans statements for structural certainty; restrained serif italic for human judgment; mono only for system metadata.
- **Composition:** stable reading columns paired with wide evidence fields. Full-width moments are earned by artifacts, not empty scale.
- **Surfaces:** fewer generic cards. Use lists, annotated media, comparison rows, document passages, and relationship rails according to content.
- **Borders:** structural separators only, consistent with `DESIGN_SYSTEM.md`; no accent rails or “technical” line decoration.
- **Imagery:** real products, systems, process evidence, and consistent portraits. No fabricated dashboards or generic engineering stock imagery.
- **Density:** content-rich at 1440p, 2K, and ultrawide while preserving reading comfort. Additional width holds supporting evidence, not stretched paragraphs.

## Interaction quality

The website behaves like precise software while retaining the permanence of a publication:

- Search is a visible global entry point into real published entities.
- Filters update immediately, reflect in the URL, and never hide their active state.
- Hover may preview metadata, but all information remains available without hover.
- Opening previews or relationship inspectors preserves scroll and focus; canonical detail content still owns a real indexable URL.
- Typed transitions—Lab to Build, Build to Work, Work/Build to Blueprint—visually preserve the source and destination context.
- External deployment and repository links state their destination and open behavior plainly.

## Assumptions challenged

Phase 12 is not a restatement of the earlier page plan. It tests several assumptions against the long-term company identity:

| Earlier/default assumption | Phase 12 conclusion |
|---|---|
| Services must remain a permanent primary-navigation item | Services remains public, but Notes replaces it in the long-term visible pill after Notes meets its launch gate. Evidence and products should carry identity. |
| The lifecycle is a single linear funnel | The lifecycle is a recurring model; only explicit Studio relationships may claim that a specific entry moved between stages. |
| Every Team member should have an Engineering Profile | Profiles are optional and earned. About remains complete for people without one. |
| Cards are the default unit for every collection | Content type determines form: editorial row, artifact, timeline, document passage, annotated media, or card. |
| All public words should become CMS-editable | Collection content is editable; global narrative and structural vocabulary remain handcrafted until a typed settings model earns its place. |
| A homepage should summarize every destination evenly | The homepage is a curated time-based narrative led by products, with unequal emphasis based on identity and content strength. |
| Engineering identity needs visible technical decoration | Engineering identity comes from real state, lineage, decisions, artifacts, accountability, and continuity. |

## Content governance

Studio is the source of truth for collection content. The public website receives that content only through the visibility-safe read models defined in [PUBLIC_DATA_LAYER.md](PUBLIC_DATA_LAYER.md); public components never consume Studio collections or persistence records directly. Templates, narrative order, relationship labels, global positioning, legal copy, and conversion framing remain handcrafted until a deliberate global-settings model is approved.

This boundary prevents two failures:

1. Hardcoding content that editors must change frequently.
2. Turning the public experience into a generic page builder whose narrative can drift accidentally.

The exact mapping appears in [PUBLIC_INFORMATION_ARCHITECTURE.md](PUBLIC_INFORMATION_ARCHITECTURE.md#studio-to-public-mapping).

## Success signals

Future implementation should measure whether the architecture produces the intended behavior:

- Visitors continue from one content type into a meaningfully related type.
- Builds and Labs receive meaningful engagement, not only Work and Contact.
- Search leads to detail content rather than acting as a site-map substitute.
- Contact submissions arrive with enough context to identify the relevant capability or artifact.
- Published entries have complete evidence, relationship, accessibility, and current-state metadata.
- The site remains fast and readable with motion disabled, on mobile, and at ultrawide dimensions.

Raw time-on-site is not a success signal by itself. Ten minutes spent lost is worse than two minutes spent reaching the right evidence.

## Decisions proposed for review

1. Adopt the active engineering publication as the public experience thesis.
2. Make Builds the leading long-term identity signal while preserving all four permanent pillars.
3. Use typed relationships as a primary navigation system, not a footer recommendation feature.
4. Keep Services evidence-led and subordinate in the long-term global navigation.
5. Treat Engineering Profiles as earned evidence records, distinct from Team biographies.
6. Keep global framing handcrafted until a dedicated Studio model is intentionally designed.
7. Adopt `PUBLIC_DATA_LAYER.md` as the canonical boundary between Studio and every public consumer.
8. Approve the Homepage-first implementation sequence only after this documentation set is reviewed.
