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

Every animation on the site is one of exactly two characters, chosen deliberately per moment, never mixed within a single transition. Think of them as two different physical actions, not two easing curves — a designer should be able to feel the difference before ever looking at a duration value:

- **Construct** feels like something heavy settling into a place it was always going to rest — a book closing under its own weight, a heavy drawer reaching the end of its travel and stopping there rather than bouncing off it. There's a real sense of mass: the motion takes a beat to arrive, and arrives once, decisively, never twice. Used for structural moments — a page's primary content taking its place, a case study's evidence laying itself out, anything that represents something being _built_.
- **Execute** feels like a shutter closing or a switch being thrown — no travel time a person could actually perceive, no settle, just a clean before and a clean after. It's what a claim looks like the instant it's proven true. Used for interaction feedback: a button responding the moment it's pressed, a form field confirming the moment it's valid, a Blueprint's demo going live the instant a visitor asks it to.

The two should feel like different hands performed them — one patient and deliberate, one quick and certain — because that contrast is the point. It's the same distinction between something being built and something running that gives this whole identity its name (§2), made legible in milliseconds instead of explained in a sentence. After a visitor has felt both a handful of times, a Construct moment reads as "something substantial just happened" and an Execute moment reads as "your input was received," without either ever needing a caption. That satisfies `.hubzero/design/motion.md`'s actual test — what is this movement telling the user, and would they notice its absence — for the whole motion system at once, not animation-by-animation.

**Progressive Delight, applied with real numbers:** motion investment concentrates on navigation (§4), First Run (§13.1), The Live Take and First Boot (§8, §13.3, §13.5), and page transitions (§5.1) — everywhere else, default to no motion at all rather than a smaller version of motion. A card that animates on every hover, on every page, stops communicating anything the moment it's ubiquitous.

**5.1 Page transitions.** Between major route changes only (not every internal scroll or state change), the outgoing page resolves through a brief hexagonal wipe — the one place §3.4's geometry appears as a transition device rather than a static shape. Because it is used only at true navigation boundaries, it stays rare enough to register as "the site is turning a page," not wallpaper.

**5.2 Reduced motion.** Every Construct and Execute animation has a resolved, static equivalent that still communicates the state it was signaling — per `.hubzero/design/motion.md`, removing motion should never mean removing the information motion was carrying. A `prefers-reduced-motion` visitor gets the same hierarchy, the same feedback, delivered as an immediate state change instead of a transition.

**5.3 Returning-visitor fatigue.** First Run (§13.1) plays at full length once per session and resolves near-instantly on every subsequent load in that session — a real, specific, easy-to-implement fix for the exact failure the archived system's own critique named but never built.

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

**7.1 Rhythm across the site, decided here, not left to emerge from viewport minimums.** A visitor's journey across the whole site has a shape, and the shape is intentional, not a side effect of eleven pages each independently satisfying the rules above:

- **Homepage** is the loudest, most tightly paced page on the site: stillness, then a fast, precise spectacle (First Run), a held breath before the biggest visual moment on the entire site (The Assembly), a long calm exhale through Proof, a brisk quiet walk through the pillar index, a short warm close. Loud, patient, loud again, quiet — never flat for more than one section running.
- **Services and Work** are the site's most measured pages, deliberately less kinetic than Home, because a visitor who has scrolled this far is evaluating, not being introduced, and evaluation asks for a steadier hand. Work carries exactly one spike of its own energy — The Live Take (§8) — once, inside an otherwise long, calm case study: a single loud moment inside sustained quiet, the mirror image of Home's rhythm.
- **Labs** is intentionally uneven — some entries brief, some long, none evenly paced — because real work doesn't arrive on a schedule, and a page pretending otherwise would be lying about what Labs actually is.
- **Blueprints** spends almost all its energy in one place: a long, quiet setup (the spec block, read calmly) followed by one sudden, real release — First Boot (§8) — tension held, then let go completely, exactly once.
- **About, Team, Careers, Contact, and Notes** are the quietest pages on the site, on purpose. No page after Work is allowed to compete with it for volume — a site that stays loud all the way to the footer reads as anxious, not confident.

---

## 8. Signature moments

Restraint is what makes a signature moment work (`.hubzero/design/principles.md`) — but restraint means _rare_, not _singular_. A site with eleven pages and more than one real claim to prove cannot ask a single five-second nav interaction to carry all of it, and the homepage should not own every memorable moment on the site. What follows is one sitewide signature, present on every page, plus three page-anchored proof moments — each tied to a different page, each spent on a different claim, each appearing exactly once on the entire site. This is not five flourishes competing for the same attention; it's one recurring signature and three moments a visitor only ever encounters once, in the one place each has actually earned it.

**The sitewide signature — The Unfold (§4).** The mark becoming the interface, on every page, every time a visitor needs to go somewhere else. This is the thing a visitor would recognize HubZero by after a single visit — the reason nothing else on the site is allowed to compete with it for that role.

**Three page-anchored proof moments, each earning its place on exactly one page:**

1. **First Run — the homepage's opening two seconds (§13.1).** The mark assembles, holds under real tension, locks, and fires — the site's whole thesis, stated once, before a single word of copy has resolved.
2. **The Live Take — the case-study detail page (§13.3).** The delivered product itself, shown running, not screenshotted — the moment a skeptical evaluator stops reading a claim about HubZero's work and starts watching it be true.
3. **First Boot — a Blueprint's live demo entrance (§13.5).** A held beat of stillness, then the interface visibly wakes up in front of the visitor and a small live-status pulse confirms it's real — the exact moment control passes from HubZero's page to something the visitor is now actually operating.

Everything else described in this document — the cursor cue, the magnetic CTA, the hexagonal transition wipe, The Assembly (§9, §13.1) — is craft or content, expected on every premium surface, not a signature moment. Services, Labs, About, Team, Careers, Contact, and Notes get none of their own, on purpose (§7.1) — they're built entirely from craft and rhythm, because a fifth and sixth "unforgettable" moment stops being unforgettable and becomes the site's new, exhausting default volume.

---

## 9. Illustration direction

HubZero does not commission illustration to stand in for something it hasn't actually built — that discipline was correct in every prior design system and survives unmodified here. Where a diagram is genuinely useful (a Labs entry explaining a real architecture, a Blueprint's system overview, a process explanation in Services), it is generated or drawn as **strict monochrome line art, built from §3.4's hexagonal angle family, depicting something real** — a real data flow, a real hardware layout, a real sequence HubZero actually follows. Never a metaphor-illustration standing in for a claim (no rockets for "growth," no puzzle pieces for "integration").

This differs from V3's diagram system in one load-bearing way: diagrams here are **content**, produced when a specific page needs to show something specific, not a sitewide decorative register the identity is built from. A page with nothing real to diagram gets no diagram, and that is a correct, finished page — not a gap waiting to be filled with texture.

Use the Gemini Image MCP for: process/architecture diagrams where no real screenshot exists yet, social/OG card graphics built from the type and mark system, icon exploration (a small, consistent, custom set — never a borrowed third-party icon font, for the same "could belong to anyone" reason the archived system correctly identified), and Labs/Blueprints illustrative material where a real photograph doesn't exist yet. Never for founder portraits or anything standing in for a real person, real product screenshot, or real client evidence — those are photographed or captured, not generated, full stop.

**The one deliberate exception: The Assembly (§13.1).** A site this disciplined about restraint everywhere else has earned the right to be spectacular exactly once. The homepage's duality section is built around a single real, interactive, scroll-scrubbed sequence — real Labs hardware photography and a real product interface, both disassembling and reassembling in the same frame, at the same pace, joined only by §3.4's hexagonal geometry, never by invented schematic linework or circuit convention. It depicts two things HubZero actually built, not a metaphor for what HubZero does. It is built once, referenced nowhere else on the site, and is the one image on hubzero.com a visitor would actually screenshot and send to someone. Everywhere else, §9's ordinary rule holds without exception: a page with nothing real to show gets no illustration at all.

---

## 10. Photography direction — founders

The five source photographs in `public/team` were taken in five different places, under five different lighting conditions, at five different life stages — a corporate studio portrait against a city skyline, a home interior with a warm incandescent tone, an outdoor shot with motorbikes in frame, a plain institutional backdrop, and a school photo of a child in front of a hedge. Individually, several are perfectly good photographs. Placed side by side on a Team page, they read as five different people who have never met, which actively undermines the one thing a Team page exists to establish: this is a real, cohesive team a stranger can trust.

**The emotional target, before any technical spec.** A visitor should look at these five photographs and feel like they've just been introduced to five people they'd trust with a hard, expensive problem — not five people modeling professionalism for a stock library. The specific quality to aim for: calm, direct eye contact; an expression that isn't quite a smile, because it doesn't need to perform warmth to earn trust; the particular confidence of someone who already knows the answer to the question a visitor is about to ask. Not corporate (no boardroom polish, no skyline-office theater), not casual (no candid-at-home softness), not aspirational — something closer to how a serious publication photographs a founder worth taking seriously: unhurried, plainly lit, looking straight back at the reader.

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

The page a skeptical first-time visitor decides on. Its job is orientation and confidence, in that order, delivered fast — and it is the loudest, most tightly paced page on the site (§7.1).

**Opening — First Run, frame by frame.** The page loads into near-total stillness. Nothing happens for a beat longer than feels entirely comfortable. Then, at the center of the screen, the hexagon mark appears — not faded in, but simply _there_, all at once, larger than anything else that will appear on the page. It holds, whole, for a moment longer. Then it comes apart along its own real seams — the structural bars separating from the triangular glyph at the actual lines where they were always joined, the way a real object comes apart at a real joint, never a shape dissolving into particles. A beat of held tension: the pieces suspended, nothing moving. Then they close back together — fast, exact, final — and the instant they lock, the triangular glyph fires: one sharp, brief flash of Signal, gone as quickly as it appeared. It is the only moment on the entire site where color is allowed to announce something happening, rather than quietly support something that already has. In the same instant, the whole mark shrinks and genuinely travels — moves across real screen distance, not a fade-out-fade-in-smaller — and settles into its resting place in the floating nav, exactly where a visitor's eye will return every time they need to go somewhere else. Only now does the headline resolve: the direct, non-clever statement `ARCHITECTURE/00_FOUNDER_APPROVAL.md` §5 specifies ("Building technology that solves real problems," as a register, not a locked final line), followed by one clear sentence establishing who HubZero is for. Under two seconds, start to finish. Nobody had to be told that something was built, tested under real tension, and now works the instant it's asked to — they watched it happen, before a single word was legible on the page.

**The Assembly — the thesis, made visible.** This is the one section on the entire site permitted a real spectacle, because it carries the single idea everything else exists to prove. As the visitor scrolls into it, two real artifacts occupy the same frame at the same moment: on one side, a real piece of hardware HubZero has actually built — drawn from Labs — coming apart into its real physical components; on the other, in the same instant, at the same speed, a real product interface disassembling into its real elements. Neither stands in for the other; they are simply shown at once, held together only by the hexagonal frame from §3.4, moving as though one hand is taking both apart in a single motion. A visitor doesn't read a sentence explaining that HubZero works across software and hardware — they watch both come apart in the same breath, and reassemble the same way, and understand it before any copy says so. Full specification in §9.

- **Proof.** The one real case study (Bhatkal Time Luxe), given full weight — real product screens, a real outcome, presented as evidence, not as a card in a grid of cards that doesn't exist yet. After The Assembly's spike of energy, this is the page's long, calm exhale — the tallest, quietest beat on the page, because it's the only claim on the entire homepage a visitor can independently verify, and verification doesn't need to shout.
- **The pillars, as an index, not a pitch.** Work, Labs, Blueprints, (Builds when live) presented plainly — what each is, one real or honestly-labeled-as-early example each, a direct link out. Brisk and quiet after Proof's long exhale — a confident company's table of contents, not a second pitch.
- **The team, briefly.** Five EP-00X cards — portrait (§10), name, role, one line drawn from their actual philosophy in `team/*.md` — linking to full profiles. Establishes that real, named people stand behind everything above, without repeating the full About/Team page here.
- **Close.** A short, warm landing after a page that has done a lot — a direct statement of what happens when someone reaches out (echoing the Services page's disclosed process, §13.2) and a single clear path to Contact. The page arrived loud and leaves quiet, on purpose.

### 13.2 Services — the capability

The page a technical evaluator reads to decide if HubZero can actually do the work. Its job is capability, structured like a real conversation about scope, not a features list.

- Opens with the same software/hardware duality from Home, now expanded into the actual practice areas (Software Engineering, Hardware & Embedded) with real specificity — domains, technologies, the kind of problems each practice actually takes on.
- A disclosed process — discovery through delivery — stated honestly, including what HubZero doesn't do yet (no self-serve checkout, no fixed package pricing) rather than gesturing vaguely at "tailored solutions."
- Pricing framed exactly as `ARCHITECTURE/00_FOUNDER_APPROVAL.md` §4 decided: guidance on engagement types and complexity, an honest statement that every project is quoted after discovery, no invented price ranges.
- Closes into Contact with the same framing Home's close uses, so a visitor who reads Services and then Home doesn't get two different promises about what happens next.

### 13.3 Work — the record

An index of engagements, and each one a full case study. This is the page carrying the most weight for a company with exactly one public engagement so far, so the one entry it has needs to be treated with the full seriousness of a real portfolio piece, not padded with placeholder entries or under-written to match how few there are.

- **Index.** A real log, not a grid of thumbnail cards — each entry substantial enough to read before clicking through, honest about what stage each engagement is at.
- **Case study detail.** Long-form: the actual problem, the real constraints, the decisions made and why, the outcome, real screens throughout — six hundred words minimum of real narrative, not a screenshot carousel with captions. Once, at the point in the narrative where the outcome is being proven, the page stops describing the product and shows it: **The Live Take (§8)** — the actual delivered site or interface, running, in frame, a cursor moving through it the way a real person actually uses it, not a static image cropped to look busy. The rest of the page reads; this one moment watches. This is the single page on the site most directly answering `.hubzero/architecture/principles.md`'s Confidence question, and it should read — and for one moment, look — like it.

### 13.4 Labs — the notebook

R&D, explicitly allowed to look unfinished — the one place on the site where visible incompleteness is honest, not a flaw. Dated entries, hardware and software experiments side by side, process shown rather than only outcomes (a sketch, an iteration that didn't work, a note about what's next). Composition is intentionally rougher and more sequential than Work — a log the visitor scrolls through in order, not a filterable grid — because Labs' whole credibility depends on reading as genuinely in-progress rather than staged to look that way.

### 13.5 Blueprints — the catalog

Reusable engineering foundations, framed the way `ARCHITECTURE/00_FOUNDER_APPROVAL.md` §8 decided: proof-of-range and a delivery accelerator, not a product for sale. "Let them touch it" outranks "let them read about it" — each entry's real, live artifact (a working demo, a real repo) is the page's actual hero content. It arrives as **First Boot (§8)**: the demo frame sits still and unlit for a beat long enough that a visitor notices the pause, and then the interface inside it visibly wakes up — not a spinner resolving into content, but the real system initializing in front of them, ending in a small, quiet live-status pulse confirming this is running right now, not a recording. A spec block (what's included, what problem it solves, what it's built on) supports the live artifact and sits after it, not before — a visitor should be operating something real before they read a word about it. CTA routes to Contact, framed as "start a project built on this foundation," never a checkout flow.

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
3. **Homepage.** The page that proves the whole system — First Run, The Assembly, the case-study proof section, the pillar index, the team preview, the close. Note the one real sequencing dependency this creates: The Assembly needs real Labs hardware photography to exist before it can be built for real, which likely means at least one Labs entry has to be shot and published ahead of the homepage, not after it — plan Labs' first real asset pass accordingly rather than discovering this gap during homepage build.
4. **Services, Work (index + the one real case study, including The Live Take), About, Team, Contact.** The pages a serious prospect actually reads before reaching out.
5. **Labs, Blueprints (including First Boot), Notes, Careers.** Content-gated where relevant (Builds joins primary nav only once real) — shipped once they have real content to carry, not stubbed with placeholders `.hubzero/polish/PRODUCT_POLISH.md` already forbids.
6. **Photography unification (§10) and remaining diagram/illustration production (§9).** Can run in parallel with 4–5 once the art direction here is approved — both are asset-production work, not layout work, and don't block page composition, aside from The Assembly's dependency noted in priority 3.

---

## 15. Self-review

Tested against the specific traps this document was told never to repeat:

- **Pages too short / stories unfinished** — §7 makes "no page ends before its argument is finished" a shipping requirement, and §13 gives every page a real multi-section structure with a stated argument, not a section count.
- **Repeated layouts / left-text-right-image default** — §13 gives Home, Services, Work, Labs, Blueprints, About, Team, and Contact each a distinct dominant device (a duality unfolding on scroll, a disclosed process, a real case-study narrative, a dated log, a live artifact, a timeline, editorial profiles, a quiet intake) — none of them a split panel.
- **Sections that feel assembled, not designed** — §7 makes "would shuffling the sections weaken the argument" the actual test before a page ships.
- **No memorable moments / feels like reusable components** — §8 names one sitewide signature and three page-anchored proof moments, each earning its place on exactly one page rather than five unrelated flourishes competing for the same attention; §6 gives the site real interaction craft (cursor, magnetic CTA, hover timing) that a generic component library wouldn't produce by default.

Tested against the more specific risk this document was written to avoid — quietly reproducing the archived direction under new words: this system has no schematic linework, no drafting-sheet composition logic, no dimension lines or leader lines, no material-metaphor accent color, no three-typeface stack, no "datasheet" reference set, and no tiered page-capacity model. Where it keeps something from the archived work — the zero-fabrication standard, real artifacts over invented metaphors, restraint as the thing that makes a signature moment work — those are `.hubzero` and `ARCHITECTURE/00`'s standing commitments, not V3/V4's aesthetic choices, and they'd be wrong to discard along with the aesthetic that got built on top of them.

The one honest risk left unresolved by this document: **Built to Run is still a metaphor**, even though it's derived from a real object (the mark) rather than a borrowed material (copper, drafting paper). The difference that matters is that it governs _behavior_ (how the site is built, how it moves) rather than _decoration_ (what the site is dressed up to look like) — but the next real test of whether that difference holds is implementation, not this document. If the first built pages start reaching for hexagonal corners because the brand needs "more presence" rather than because a specific moment calls for one, this system will have made the exact mistake it was written to avoid, just with a hexagon instead of a circuit board. That test belongs to whoever builds this next, and this document should be checked against it honestly, not defended past the point the evidence supports.

---

## 16. What this leaves behind

**What a visitor remembers a week later** is not a section, a color, or a sentence — it's a shape: a small hexagon that turned into a door every time they needed one, and, once, on the way in, watched two real things come apart in the same breath and prove they were built by the same hands.

**What they tell someone else** is short, because the best version of this is never a full sentence: _"their site actually does something."_ Said the way someone says it about a product, not a portfolio. If the honest version of that sentence would come out closer to _"their site looks really clean,"_ this document has failed on its own terms, however correct the type scale turns out to be.

**What makes this unmistakably HubZero, with the logo removed:** the mark's own geometry showing up as behavior instead of decoration — a hexagon that unfolds, rather than a hexagon printed on things; the fact that nothing on the site tries harder than what it's actually proving, so a five-person team's one real case study gets six hundred honest words and a real running demo instead of an inflated claim; and a felt difference, learnable within a single visit, between something being built (patient, weighted, arriving once) and something running (instant, precise, alive the moment it's asked to be) — a distinction almost no competitor in this category is positioned to make honestly, because most of them only have one of the two disciplines to show.
