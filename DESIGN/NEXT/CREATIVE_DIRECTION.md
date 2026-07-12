# HubZero — Creative Direction

**Status: Proposed. Design blueprint, not implementation.** This document is the creative foundation for the public marketing website, following the 2026-07-12 reset (`ARCHIVE/README.md`). It does not write React, does not write Tailwind, and does not specify components. It specifies the product a designer or engineer should build.

`.hubzero` (HubZero Core) governs everything below it. Where this document is silent, `.hubzero` still applies. Where a decision here is a genuine product/business fact rather than a design opinion — the four pillars, the primary-nav ceiling, the practice areas — it is inherited from `ARCHITECTURE/00_FOUNDER_APPROVAL.md`, which the reset explicitly left standing. Everything else — every layout, every composition, every visual motif, every piece of vocabulary — starts from nothing.

---

## 0. What failed, and why this is not that, again

Read `ARCHIVE/DESIGN/V3` and `ARCHIVE/DESIGN/V4` before reading this section, or the claim below is unverifiable.

V3 ("Working Blueprint") built HubZero's entire identity around one metaphor: the site as a real engineering document — drafting sheets, schematic trace-paths, dimension lines, section-cut cross-hatching, a copper signal color literally borrowed from PCB traces. An eight-seat adversarial review board read it and returned a clear verdict: **not approved.** Its own strongest finding — copper is materially true of hardware and only metaphorically true of software, which is the exact sin the color it replaced (a generic "tech blue") was fired for — was never resolved. V4 patched the color story (copper → a narrow functional blue, monochrome-first) and kept everything else: the drafting-sheet composition, the trace-path geometry, the datasheet/instrument-panel reference set, the three-typeface system, the tiered page-capacity model. Then the founder reset all of it.

The lesson is not "pick a different accent color." The lesson is that **"engineering" was being expressed as a decorative literalism — schematics, blueprints, circuit traces, drafting paper — instead of as a discipline that shows up in how the site is actually made.** A visitor does not conclude a team is precise because the page looks like a datasheet. They conclude it because the claims on the page are checkable, the interactions behave exactly as promised, and nothing on the page is pretending to be more finished than it is.

This document does not use the words blueprint, schematic, trace, drafting sheet, PCB, circuit, datasheet, or instrument panel to describe HubZero's visual language, anywhere. Not because those words are banned — because reaching for them is the specific reflex that produced two archived design systems in a row, and the fastest way to know this document actually did the work is that it had to find a different vocabulary to say what it means.

---

## 1. Product vision

HubZero is a small, founder-led engineering organization that ships both software and hardware — not a software agency that occasionally touches hardware, not a hardware shop with a website built by a software team. Five engineers who built things together as a hobby decided the things they build for other people should be held to the same standard as the things they'd build for themselves. That is the actual origin story (`team/rifaque.md`), and it is more compelling, more specific, and more honest than any positioning statement a marketing exercise would invent. Use it.

The company is early — unregistered, one real case study, a founding team of five — and the site's job is not to hide that. Per `ARCHITECTURE/00_FOUNDER_APPROVAL.md`, the hero does not lead with a clever line; it leads with what HubZero does, for whom, and why a visitor should trust the team standing behind it. The site's entire job, restated in `.hubzero/architecture/principles.md`'s vocabulary, is to move a visitor from **orientation** (what is this) through **confidence** (can I trust five people I've never met with a system I can't personally verify) to **capability** (what can they actually build) to **path** (how do I start a conversation).

Confidence, for a five-person team with one public case study, cannot be manufactured through scale signals (logos, numbers, "trusted by") HubZero does not honestly have yet. It has to come from something else: the precision of the writing, the completeness of the one case study it does have, the visible competence of the interactions themselves, and — because HubZero is unusually willing to show its work — the Labs and Blueprints pillars, which let a skeptical visitor watch the team think and build in the open, not just read a claim that they can.

---

## 2. Creative direction — Built to Run

Every HubZero product needs one governing idea concrete enough to make real decisions from, not a mood board. This site's idea comes directly from the mark, because the mark already contains it: the H's structural bars (something built, assembled, load-bearing) interlocked with a triangular execute glyph (something that runs, fires, plays) inside one hexagon. Two qualities, one object. That tension — **built, and made to run** — is HubZero's actual business (software and hardware, under one roof) expressed as a shape before it's expressed as a sentence.

**Built to Run** is the creative platform the rest of this document works from. It shows up as two disciplines held in the same system, never blended into a mush of "innovative" generalities:

- **Built** governs structure: grid, type, spacing, information architecture, the writing itself. It should feel considered, load-bearing, checkable — the same discipline `.hubzero/design/principles.md` calls Elegance. Nothing about this half is soft or decorative.
- **Run** governs behavior: motion, interaction, response time, the felt quality of using the site. It should feel alive, immediate, responsive — proof, delivered in milliseconds, that the team behind the page can also make things move correctly.

A page that is only Built reads as a brochure. A page that is only Run reads as a demo reel. HubZero's pages need to be both, in the same way HubZero's actual engagements are both — and a visitor should be able to feel that duality without ever being told about it in copy. This is the replacement for V3's "editorial engineering": not a material metaphor for what engineering looks like, but a structural principle for what engineering _is_ — a thing that is designed, and a thing that works — applied to the site itself as the first and most important proof HubZero offers.

**What this authorizes:** a monochrome, typography-and-motion-led identity where the hexagon mark is used sparingly as a real interactive object (it unfolds, it fires, it marks state) rather than as a decorative motif tiled across the page; a two-register motion system (structural vs. kinetic, defined in §5); page compositions that earn their density the way a real case study earns its length, not a fixed template stamped across every route.

**What this forecloses:** any material-metaphor color story (no copper, no solder-mask green, no "engineering blue"); any literal engineering-document convention as sitewide decoration (no schematic linework, no dimension lines, no grid-paper texture); a signature accent color chosen for what it _symbolizes_ rather than for what it _does_.

---

## 3. Visual identity

### 3.1 The mark

`assets/hubzero-logo-black.png` / `hubzero-logo-white.png` are canonical and closed for reinterpretation — flat, monochrome, geometrically precise. The mark is not a logo that sits in a corner; per §2, it is the one recurring object the site is allowed to animate as itself (not as a spinner, not as a loading bar built from unrelated shapes). Every place the mark moves, it should move the way the mark's own geometry suggests it would — folding along real edges, resolving into the hexagon's real vertices — never a generic scale/fade applied to it because "the logo should probably do something here."

**The falsifiable test, replacing V3/V4's Recognition and Grayscale tests with one that doesn't require inventing a panel to adjudicate:** remove every word of copy from a page. Does the composition, the mark's behavior, and the rhythm of the page still feel like it belongs to no one else? If the honest answer requires the copy or a color to carry it, the page underneath isn't strong enough yet.

### 3.2 Color

Two neutrals, one functional signal, nothing else.

- **Carbon** — a true, near-zero-chroma near-black. Dark-mode base.
- **Chalk** — a true, near-zero-chroma near-white. Light-mode base.

Both genuinely neutral — not warmed toward a material (no "drafting paper," no "solder mask"). Neutral is the correct choice for a company whose actual work spans software, hardware, and increasingly AI: no material color is honestly true of all three, and V3's review board proved that trying to pick one produces a company that reads as biased toward whichever material the color happens to resemble.

- **Signal** — one narrow, purely functional color, reserved for interaction, focus, live/active state, and progress. It has no name that means anything (no "copper," no "drafting cyan") because giving it a meaningful name is how the last two systems talked themselves into treating a functional color as a brand statement. Chosen for legibility and colorblind-safety across both themes, not for what it symbolizes. If Signal disappeared from a page and nothing about what the page _communicates_ changed — only its polish — it was being used as decoration and shouldn't have been there. This is the same discipline `01_VISION.md` correctly wanted and never quite achieved because it kept finding "meaningful" justifications for its accent colors instead of resisting the urge to have one.

No gradients. No section washes. No color-coded pillars (Labs does not get its own hue; see §9 for how pillars actually differentiate).

### 3.3 Typography

Two families, not three. The previous system's three-typeface stack (a grotesk sans, a mono, and a serif reserved for "editorial moments") never resolved the question its own critique raised: does HubZero need a serif at all, or was it kept out of habit? This system answers directly: **no serif.** A confident, geometric grotesk carries every headline, every line of body copy, and every moment of emphasis — weight and scale do the work a serif was being used for, which is a harder, more disciplined bar and a more honest test of whether the composition actually earns its emphasis. A monospace, used narrowly, carries system information only: IDs (`EP-001`, case-study reference numbers, dates), labels, code, metadata — never body copy, never headlines. If a monospace label appears more than once or twice on a page, that's a sign the page is trying to borrow "technical" credibility from typography instead of earning it from content, exactly the trap `.hubzero/design/principles.md` — Content Comes Before Decoration warns against.

Exact families are an implementation decision, not a creative-direction one, but the brief is specific: avoid Geist (this project's own prior system, and increasingly a "safe default" across the developer-tool category generally) and avoid IBM Plex (same reason, one step removed). Choose a grotesk with real presence at large display sizes — HubZero's hero and section openers need type that can carry a page alone, at a size Home and About are the primary places this gets tested — and a monospace that reads as genuinely technical rather than decoratively "coder," at the small sizes labels actually appear.

### 3.4 Geometry

The hexagon's 60/120° angle family is the site's only geometric signature, used the way a real object's edges get used — sparingly, structurally, never tiled as a pattern. It shows up in exactly a handful of places: the mark itself; the shape a page transition resolves through (§6); the corner treatment on a small number of components that genuinely benefit from it (never applied uniformly "for brand consistency," which is how motifs turn into wallpaper). A hexagonal corner on every card on every page is the same mistake as a circuit-trace texture on every card on every page — the shape becomes ambient rather than meaningful. If removing the hexagonal cue from a given place wouldn't be noticed, it shouldn't be there.

Everything else — grid, cards, images, forms — is orthogonal, calm, and undecorated. The angle family gets its power from being rare.

---

## 4. Navigation philosophy

Per `.hubzero/design/navigation.md`, a marketing product's navigation is allowed to be the signature interaction, because establishing confidence in the first few seconds is close to the entire job. HubZero's floating navigation is that signature, and it is the mark, doing its job in real time.

**Collapsed state:** the hexagon mark alone, floating, small, quiet — present but not asking for attention, the same restraint any premium floating nav needs at rest.

**Expanded state:** on hover (desktop) or tap (mobile), the mark unfolds — not fades, not slides in a separate panel — into a full navigation bar that contains the wordmark and the primary links, then folds back to the mark alone when navigation isn't needed. The mark is the trigger and the container; there is no separate hamburger icon fighting the mark for the same job. This is the concrete, buildable answer to non-negotiable requirement #1: navigation that "feels like part of the product" because it is, literally, the same object as the brand mark, doing something a static logo can't.

**Scroll behavior, stated as an independent rule, not a chain of coupled states:** per `.hubzero/architecture/principles.md` — Interface State Should Be Independently Derived, the nav's collapse/expand state, its background treatment, and the page's hero-visibility state must be computed independently and composed, not chained through one another. Concretely: the nav collapses to the mark-only state on scroll-down, returns to its resting treatment on scroll-up, regardless of which section or hero is currently in view. A hero that happens to be dark does not need to "know about" the nav to keep it legible — legibility against whatever is beneath it is the nav's own job (a scrim, a blend mode, or an inverted mark treatment), solved once, not re-solved per page.

**Primary navigation, per `ARCHITECTURE/00_FOUNDER_APPROVAL.md` §8 (still governing IA, not visual treatment):** Services, Work, Labs, Blueprints, About, plus a Contact CTA that is visually distinct from the rest (not just another link — the one place color, weight, or position asymmetry signals "this is the action," per §3.2's discipline about where Signal is allowed to appear). Builds joins primary nav only once it has a real published entry — content-gated, not hidden behind a "coming soon" state, which `.hubzero/polish/PRODUCT_POLISH.md` explicitly forbids. Notes lives in the footer only.

**Mobile:** the nav lives within thumb reach, not translated unchanged from the desktop top-bar position. Per `.hubzero/design/mobile-experience.md`, this means the primary trigger sits low enough on the viewport that a one-handed grip can reach it without a hand shift — the collapsed mark anchors toward the bottom of the screen on handheld, not the top, and the unfolded state opens as a reachable sheet rather than a full-bleed overlay a thumb has to travel across the whole screen to dismiss.

---

## 5. Motion philosophy

Every animation on the site is one of exactly two characters, chosen deliberately per moment, never mixed within a single transition:

- **Construct** — deliberate, weighted, a real sense of assembly. Slight ease-out settle, never a bounce. Used for structural moments: a page's primary content arriving, a case study's evidence being laid out, anything that represents something being _built_.
- **Execute** — instant, precise, no ceremony. Sharp timing, no elastic overshoot. Used for interaction feedback: a button responding to a click, a form field validating, the moment a Blueprint's live demo actually loads. This is the motion equivalent of software executing correctly the instant it's asked to.

This is a real, learnable system, not decoration with a name: after a visitor has seen both a handful of times, a Construct moment reads as "something substantial just happened" and an Execute moment reads as "your input was received," without either needing to be explained. That satisfies `.hubzero/design/motion.md`'s actual test — what is this movement telling the user, and would they notice its absence — for the whole motion system at once, not animation-by-animation.

**Progressive Delight, applied with real numbers:** motion investment concentrates on navigation (§4), the homepage hero (§9.1), loading and live-demo entrances (Blueprints, §9.5), and page transitions (§5.1) — everywhere else, default to no motion at all rather than a smaller version of motion. A card that animates on every hover, on every page, stops communicating anything the moment it's ubiquitous.

**5.1 Page transitions.** Between major route changes only (not every internal scroll or state change), the outgoing page resolves through a brief hexagonal wipe — the one place §3.4's geometry appears as a transition device rather than a static shape. Because it is used only at true navigation boundaries, it stays rare enough to register as "the site is turning a page," not wallpaper.

**5.2 Reduced motion.** Every Construct and Execute animation has a resolved, static equivalent that still communicates the state it was signaling — per `.hubzero/design/motion.md`, removing motion should never mean removing the information motion was carrying. A `prefers-reduced-motion` visitor gets the same hierarchy, the same feedback, delivered as an immediate state change instead of a transition.

**5.3 Returning-visitor fatigue.** The homepage hero's Construct-then-Execute sequence (§9.1) plays at full length once per session and resolves near-instantly on every subsequent load in that session — a real, specific, easy-to-implement fix for the exact failure the archived system's own critique named but never built.

---

## 6. Interaction language

- **Cursor.** On desktop, the default cursor is untouched everywhere except over genuinely interactive surfaces — a case-study image the visitor can inspect, a Blueprint's live demo frame — where it resolves into a small precise bracket/frame cue rather than the generic pointer. This is used narrowly enough that its appearance itself is a signal ("this thing responds"), not a sitewide gimmick trailing the mouse.
- **Magnetic pull.** Exactly one element per page may have it: that page's single primary action. Not every button, not every card — per `.hubzero/design/principles.md` — Signature Interaction, restraint is what makes a device register at all.
- **Hover states.** Execute-timed, always. A hover that takes 400ms to acknowledge a cursor that's already there reads as unresponsive, not premium.
- **Focus states.** Fully keyboard-operable, visibly focused, on every interactive element without exception — this is `.hubzero/polish/PRODUCT_POLISH.md`'s standard, not an accessibility add-on layered in afterward.
- **Scroll-linked reveals.** Used only where scroll position is a genuinely meaningful proxy for "how much of this argument have you absorbed" — a case study's evidence sequence, a Labs entry's process timeline — never as a default treatment for ordinary section entrances. Most sections simply appear, fully formed, once in view; the restraint is the point.

---

## 7. Storytelling and page philosophy

Every page is a complete argument, not a stack of interchangeable sections. Before any page is composed, its argument gets stated as a real sequence of claims a skeptical reader would need answered in order — the same discipline `.hubzero/architecture/principles.md` asks of the whole product, applied per page. If a page's section order could be shuffled without weakening the argument, the page was assembled, not designed, which is precisely the failure this reset exists to end.

**Concretely, every page must satisfy all of the following before it ships:**

1. **Every major section occupies at least one full viewport**, composed as its own deliberate moment — not a fixed-height template repeated with different copy, but a section whose height, density, and pacing are chosen for what it's actually saying. Content may run longer than a viewport where the argument needs it to; it never runs shorter out of habit.
2. **No page ends before its story is finished.** A page's final section is not a generic CTA block bolted onto the bottom of whatever came before it — it is the argument's actual conclusion, and the invitation to act follows from having been convinced, not from having reached the bottom of the DOM.
3. **No two pages share a macro-composition.** Services and Work are not the same template with different data. This is enforced per page in §9, not left as a general instruction to "be different" — a general instruction is exactly what let the archived homepage's discipline erode into Services/Work/About becoming three fills of one template the first time deadline pressure hit.
4. **Density is earned, not avoided or forced.** A case study with real evidence to show is allowed to be dense. A homepage establishing first impressions is allowed to be spacious. Neither defaults to the other's pacing out of habit.

---

## 8. Signature moments

Restraint is the entire point of a signature moment (`.hubzero/design/principles.md`). This system has exactly two, both direct expressions of §2's core idea — not five unrelated flourishes competing for the same "would a visitor remember this" attention:

1. **The nav unfold (§4).** The mark becoming the interface, on every page, every time. This is the primary signature — present everywhere, which is exactly why nothing else on the site is allowed to compete with it for that role.
2. **The hero construct (§9.1).** The homepage's one-time, once-per-session sequence, where the mark visibly assembles and then fires — the single place the site states its whole thesis (Built to Run) without a word of copy, before any copy has even resolved on screen.

Everything else described in this document — the cursor cue, the magnetic CTA, the hexagonal transition wipe — is craft, not a signature moment. Craft is expected on every premium surface; a signature moment is the rare thing a visitor tells someone else about. Keeping that distinction honest is what keeps both from being diluted.

---

## 9. Illustration direction

HubZero does not commission illustration to stand in for something it hasn't actually built — that discipline was correct in every prior design system and survives unmodified here. Where a diagram is genuinely useful (a Labs entry explaining a real architecture, a Blueprint's system overview, a process explanation in Services), it is generated or drawn as **strict monochrome line art, built from §3.4's hexagonal angle family, depicting something real** — a real data flow, a real hardware layout, a real sequence HubZero actually follows. Never a metaphor-illustration standing in for a claim (no rockets for "growth," no puzzle pieces for "integration").

This differs from V3's diagram system in one load-bearing way: diagrams here are **content**, produced when a specific page needs to show something specific, not a sitewide decorative register the identity is built from. A page with nothing real to diagram gets no diagram, and that is a correct, finished page — not a gap waiting to be filled with texture.

Use the Gemini Image MCP for: process/architecture diagrams where no real screenshot exists yet, social/OG card graphics built from the type and mark system, icon exploration (a small, consistent, custom set — never a borrowed third-party icon font, for the same "could belong to anyone" reason the archived system correctly identified), and Labs/Blueprints illustrative material where a real photograph doesn't exist yet. Never for founder portraits or anything standing in for a real person, real product screenshot, or real client evidence — those are photographed or captured, not generated, full stop.

---

## 10. Photography direction — founders

The five source photographs in `public/team` were taken in five different places, under five different lighting conditions, at five different life stages — a corporate studio portrait against a city skyline, a home interior with a warm incandescent tone, an outdoor shot with motorbikes in frame, a plain institutional backdrop, and a school photo of a child in front of a hedge. Individually, several are perfectly good photographs. Placed side by side on a Team page, they read as five different people who have never met, which actively undermines the one thing a Team page exists to establish: this is a real, cohesive team a stranger can trust.

**The art direction, decided once, applied identically to all five:**

- **Background** — a single seamless neutral surface, tonally matched to Chalk (§3.2), softly and evenly lit. No environment, no props, no context clues that place one founder in a different world than another.
- **Framing** — chest-up, centered, consistent headroom, consistent camera height (eye-level, not looking up or down at the subject — no shot should read as more or less authoritative than another).
- **Lens character** — a longer, flattering focal length with shallow-but-not-extreme background separation, applied consistently, so no single portrait reads as flatter or more "phone camera" than the rest.
- **Light** — soft, directional, single key light with gentle fill — overcast-daylight quality, not harsh studio strobe, not ambient room light. Consistent shadow direction and softness across all five.
- **Grading** — a single consistent treatment: deep, uncrushed blacks, gently desaturated, a whisper of warmth rather than a cool digital neutral. One LUT-equivalent applied to all five, not graded per-photo to taste.
- **Wardrobe note for anything shot fresh going forward** — solid, neutral-toned clothing, no logos, no patterns, so future additions to the team slot into the same system without a wardrobe consultation each time.

**The actual production task is image editing, not generation.** Each founder's real face, real likeness, and real identity are preserved exactly — this is a hard constraint, not a preference, and directly inherited from the zero-fabrication standard `ARCHITECTURE/00_FOUNDER_APPROVAL.md` and `.hubzero` hold for every other kind of content on the site. What changes is background, lighting, crop, and grade — the same thing a photo studio would do reshooting five people on the same day with the same setup, done here through careful, identity-preserving image editing on the source photographs HubZero already has, using the Gemini Image MCP for background replacement and relighting, never for altering a bone structure, an expression HubZero didn't actually make, or an age HubZero isn't actually at.

The Rifaque portrait is the closest existing photo to this direction already (controlled lighting, confident framing) and should serve as the calibration reference the other four are brought toward — not copied outright, since the setting itself (skyline office) doesn't match the neutral-background direction, but its lighting quality and confidence are the right target.

---

## 11. Interaction with content — writing voice

Not a visual system, but load-bearing for everything above it: the writing on this site should sound like Rifaque's actual voice in `team/rifaque.md` — direct, unhedged, willing to say "I don't know yet" where that's true (`ARCHITECTURE/00_FOUNDER_APPROVAL.md` on legal-entity status is the model: state what's actually true, not what sounds more impressive). No agency voice ("we leverage cutting-edge solutions"), no inflated claims a five-person team with one case study can't back up, no borrowed enterprise register. A visitor should be able to tell, from the writing alone, that this is a small team that means what it says — which is a cheaper, more durable trust signal than any visual device in this document, and the two have to agree with each other or the whole site reads as a costume.

---

## 12. Information architecture

Inherited from `ARCHITECTURE/00_FOUNDER_APPROVAL.md` §8 as a business decision, not redesigned here:

**Primary navigation (max 6 + CTA):** Services · Work · Labs · Blueprints · About · (Builds, once content-gated open) · Contact (CTA-styled).

**Footer / secondary:** Notes · Team · Careers · Privacy · Terms · Search.

**Content pillars:** Work (client engagements, delivered), Builds (HubZero's own shipped products — content-gated until one is real and ready), Labs (R&D — hardware, software, AI, explicitly allowed to look like honest work-in-progress), Blueprints (reusable engineering foundations, framed as proof-of-range and a delivery accelerator, CTA routes to Contact per the standing no-self-serve-checkout decision).

**Practice areas:** Software Engineering and Hardware & Embedded, structured so additional verticals (AI/ML, Cloud & DevOps, etc.) can be added later without restructuring — this is a CMS/content-model concern more than a visual one, and `ARCHITECTURE/09_CMS_ARCHITECTURE.md` already owns it.

---

## 13. Page-by-page experience concepts

Each page below is a distinct argument with its own composition. None reuses another's section order, pacing, or dominant device.

### 13.1 Homepage — the introduction

The page a skeptical first-time visitor decides on. Its job is orientation and confidence, in that order, delivered fast.

- **Opening.** Full-viewport. The mark performs its Construct-then-Execute sequence (§9.1 in §5.3's session-scoped form), resolving into its collapsed nav position as the headline arrives — the direct, non-clever statement `ARCHITECTURE/00_FOUNDER_APPROVAL.md` §5 specifies ("Building technology that solves real problems," as a register, not a locked final line), with a single clear supporting sentence establishing who HubZero is for.
- **The duality, made concrete.** Software and hardware are not presented left-column/right-column — they're presented as one continuous argument: HubZero takes a problem before anyone has decided whether it's a software problem or a hardware problem, and follows it all the way to a shipped, maintained system. This section is scroll-paced, not split-panel — one idea unfolding, not two boxes competing for attention.
- **Proof.** The one real case study (Bhatkal Time Luxe), given full weight — real product screens, a real outcome, presented as evidence, not as a card in a grid of cards that doesn't exist yet. This is the tallest, calmest beat on the page, because it's the only claim on the entire homepage a visitor can independently verify.
- **The pillars, as an index, not a pitch.** Work, Labs, Blueprints, (Builds when live) presented plainly — what each is, one real or honestly-labeled-as-early example each, a direct link out. This section's job is orientation into the rest of the site, not persuasion; it should feel like a table of contents a confident company doesn't need to oversell.
- **The team, briefly.** Five EP-00X cards — portrait (§10), name, role, one line drawn from their actual philosophy in `team/*.md` — linking to full profiles. Establishes that real, named people stand behind everything above, without repeating the full About/Team page here.
- **Close.** A real invitation, not a form embedded because pages are supposed to end with one — a direct statement of what happens when someone reaches out (echoing the Services page's disclosed process, §13.2) and a single clear path to Contact.

### 13.2 Services — the capability

The page a technical evaluator reads to decide if HubZero can actually do the work. Its job is capability, structured like a real conversation about scope, not a features list.

- Opens with the same software/hardware duality from Home, now expanded into the actual practice areas (Software Engineering, Hardware & Embedded) with real specificity — domains, technologies, the kind of problems each practice actually takes on.
- A disclosed process — discovery through delivery — stated honestly, including what HubZero doesn't do yet (no self-serve checkout, no fixed package pricing) rather than gesturing vaguely at "tailored solutions."
- Pricing framed exactly as `ARCHITECTURE/00_FOUNDER_APPROVAL.md` §4 decided: guidance on engagement types and complexity, an honest statement that every project is quoted after discovery, no invented price ranges.
- Closes into Contact with the same framing Home's close uses, so a visitor who reads Services and then Home doesn't get two different promises about what happens next.

### 13.3 Work — the record

An index of engagements, and each one a full case study. This is the page carrying the most weight for a company with exactly one public engagement so far, so the one entry it has needs to be treated with the full seriousness of a real portfolio piece, not padded with placeholder entries or under-written to match how few there are.

- **Index.** A real log, not a grid of thumbnail cards — each entry substantial enough to read before clicking through, honest about what stage each engagement is at.
- **Case study detail.** Long-form: the actual problem, the real constraints, the decisions made and why, the outcome, real screens throughout — six hundred words minimum of real narrative, not a screenshot carousel with captions. This is the single page on the site most directly answering `.hubzero/architecture/principles.md`'s Confidence question, and it should read like it.

### 13.4 Labs — the notebook

R&D, explicitly allowed to look unfinished — the one place on the site where visible incompleteness is honest, not a flaw. Dated entries, hardware and software experiments side by side, process shown rather than only outcomes (a sketch, an iteration that didn't work, a note about what's next). Composition is intentionally rougher and more sequential than Work — a log the visitor scrolls through in order, not a filterable grid — because Labs' whole credibility depends on reading as genuinely in-progress rather than staged to look that way.

### 13.5 Blueprints — the catalog

Reusable engineering foundations, framed the way `ARCHITECTURE/00_FOUNDER_APPROVAL.md` §8 decided: proof-of-range and a delivery accelerator, not a product for sale. "Let them touch it" outranks "let them read about it" — each entry's real, live artifact (a working demo, a real repo) is the page's actual hero content, entered via an Execute-timed reveal (§5) with no ceremony around it. A spec block (what's included, what problem it solves, what it's built on) supports the live artifact; it doesn't replace it. CTA routes to Contact, framed as "start a project built on this foundation," never a checkout flow.

### 13.6 About — the origin

The friend-group-to-company story, told straight, because it's genuinely more interesting than an invented mission statement. Structured as a real timeline (April 2025 realization → graduation → founding → four-pillar structure) rather than a static "our values" block. This is where the four-pillar philosophy gets its full explanation — Work, Builds, Labs, Blueprints as one operating structure, not four separate offerings that happen to share a logo.

### 13.7 Team — the profiles

An index of EP-00X cards (§13.1) leading to full profile pages built from the genuinely rich material already written in `team/*.md` — the journey, the philosophy, the interview Q&A, the quotes. These are editorial profiles, not corporate bios; the page should read like a real interview a visitor would actually finish, not a résumé formatted for the web. Portraits follow §10 without exception — this page fails immediately if it ships before the photography direction is unified.

### 13.8 Contact — the start

Framed as starting a real engagement, mirroring Services' disclosed process rather than presenting a generic form dropped at the end of the site. A structured intake (project type, rough scope, timeline) that lets a visitor self-qualify, consistent with the no-fixed-pricing decision. Deliberately the quietest page on the site — minimal motion, no competing focal points — because its only job is making the one action easy, and a successful submission gets a real, specific confirmation (what happens next, concretely) rather than a generic "thanks."

### 13.9 Careers

Culture-forward, built around the actual hiring philosophy already articulated in `team/rifaque.md` — curiosity, humility, and passion valued over credentialed polish. Real, not a stock "join our mission" page: what working at a five-person, still-unregistered engineering org actually looks like right now, honestly, including that it's early.

### 13.10 Notes

Editorial, footer-accessible, its own register — longer-form technical writing, generously paced, closer to a real engineering journal than to the rest of the marketing site. Distinct from Labs (Labs shows in-progress work; Notes is finished writing about ideas) and distinct from Work (Notes isn't client evidence).

### 13.11 Utility pages (Privacy, Terms, Search)

Deliberately unremarkable. Fast, legible, quiet — no bespoke identity investment required or expected. A legal page trying to be memorable is a design failure, not an opportunity missed.

---

## 14. Implementation priorities

1. **Foundations.** Carbon/Chalk tokens, Signal color (with a real accessibility and colorblind-safety pass before it's treated as final), type scale for the two-family system, the hexagonal geometry's actual construction rule, base grid and spacing scale.
2. **The nav.** Build the mark-unfold interaction first and in isolation — it's the site's signature interaction and appears on every page; every other page depends on it existing and being right before it's worth composing pages around it.
3. **Homepage.** The page that proves the whole system — Built to Run's hero sequence, the duality section, the case-study proof section, the pillar index, the team preview, the close.
4. **Services, Work (index + the one real case study), About, Team, Contact.** The pages a serious prospect actually reads before reaching out.
5. **Labs, Blueprints, Notes, Careers.** Content-gated where relevant (Builds joins primary nav only once real) — shipped once they have real content to carry, not stubbed with placeholders `.hubzero/polish/PRODUCT_POLISH.md` already forbids.
6. **Photography unification (§10) and diagram/illustration production (§9).** Can run in parallel with 3–5 once the art direction here is approved — both are asset-production work, not layout work, and don't block page composition.

---

## 15. Self-review

Tested against the specific traps this document was told never to repeat:

- **Pages too short / stories unfinished** — §7 makes "no page ends before its argument is finished" a shipping requirement, and §13 gives every page a real multi-section structure with a stated argument, not a section count.
- **Repeated layouts / left-text-right-image default** — §13 gives Home, Services, Work, Labs, Blueprints, About, Team, and Contact each a distinct dominant device (a duality unfolding on scroll, a disclosed process, a real case-study narrative, a dated log, a live artifact, a timeline, editorial profiles, a quiet intake) — none of them a split panel.
- **Sections that feel assembled, not designed** — §7 makes "would shuffling the sections weaken the argument" the actual test before a page ships.
- **No memorable moments / feels like reusable components** — §8 names two real, restrained signature moments tied to the mark itself, not five unrelated flourishes; §6 gives the site real interaction craft (cursor, magnetic CTA, hover timing) that a generic component library wouldn't produce by default.

Tested against the more specific risk this document was written to avoid — quietly reproducing the archived direction under new words: this system has no schematic linework, no drafting-sheet composition logic, no dimension lines or leader lines, no material-metaphor accent color, no three-typeface stack, no "datasheet" reference set, and no tiered page-capacity model. Where it keeps something from the archived work — the zero-fabrication standard, real artifacts over invented metaphors, restraint as the thing that makes a signature moment work — those are `.hubzero` and `ARCHITECTURE/00`'s standing commitments, not V3/V4's aesthetic choices, and they'd be wrong to discard along with the aesthetic that got built on top of them.

The one honest risk left unresolved by this document: **Built to Run is still a metaphor**, even though it's derived from a real object (the mark) rather than a borrowed material (copper, drafting paper). The difference that matters is that it governs _behavior_ (how the site is built, how it moves) rather than _decoration_ (what the site is dressed up to look like) — but the next real test of whether that difference holds is implementation, not this document. If the first built pages start reaching for hexagonal corners because the brand needs "more presence" rather than because a specific moment calls for one, this system will have made the exact mistake it was written to avoid, just with a hexagon instead of a circuit board. That test belongs to whoever builds this next, and this document should be checked against it honestly, not defended past the point the evidence supports.
