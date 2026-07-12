> **⚠️ ARCHIVED — historical reference only, not implementation guidance.** This document described the public marketing website under the design direction that was reset. It is preserved for historical context. Do not use it to guide the new design (see `DESIGN/NEXT`). See `ARCHIVE/README.md`.

# 09 — Page Archetypes

> Assumes `01`–`08`. Every page below already exists in `ARCHITECTURE/03_INFORMATION_ARCHITECTURE.md`'s sitemap — nothing here proposes a new route. This document exists specifically to prevent the one failure `docs/design-reviews/MARKETING_SITE_REVIEW_V1.md` caught in production: Services, Software, and Hardware "collapsed into three fills of one template" because the Uniqueness Test was applied to the homepage and never re-applied to what followed it. Every archetype below states, explicitly, at least one sibling page it must not resemble — the direct, standing fix for that exact failure.

## How to read this document

For each page: purpose, story, section order, visual rhythm, where it's dense, where it's quiet, where animation exists, where imagery exists, where typography dominates, where engineering diagrams belong, and — closing every entry — the sibling-differentiation check this page must pass before it ships.

---

## 1. Homepage

**Purpose.** Compress HubZero's entire pitch into one continuous read for a visitor with fifteen seconds and no prior context — the only page allowed to be this compressed and this comprehensive (`DESIGN/00_AI_DESIGN_GUIDE.md` §6, unmodified).

**Story.** Who are you → are you real → what do you actually do → can you deliver → what happens if I hire you → how do I start. The six-beat arc `ARCHITECTURE/15_HOMEPAGE_DESIGN.md` already validated is kept intact — it's a narrative-architecture decision, not a visual-language one, and it's already correct.

**Section order.** Hero → credibility strip → What We Do (Software/Hardware/AI — a third, narrower panel is added to the existing two-panel asymmetric split, reflecting the expanded ambition named in `01_VISION.md` §1, still genuinely unequal in width and texture, never three matched cards) → Featured evidence (a case study or, per `ARCHITECTURE/20_CONTENT_BLOCKS.md`'s homepage feature system, whatever real work is currently featured) → How We Work → CTA close.

**Visual rhythm.** Tallest, calmest beat is the featured-evidence section (the "trust climax," unchanged from v2). Credibility strip and How We Work stay compact and brisk by design contrast.

**Dense vs. quiet.** Quiet: hero, credibility strip, CTA close. Dense: What We Do (three-way technical split with real per-practice texture), featured evidence (real specifics in the technical-label register).

**Animation.** The one GSAP-orchestrated hero sequence (trace-path drawing, headline/subhead/credibility-strip resolving in order); Anime.js draws the trace-path linework itself; near-silence below the fold except one-shot Motion reveals on scroll.

**Imagery.** One curated product render or architecture diagram at the featured-evidence beat — nothing else on the page carries a full image (see `07_IMAGERY.md` §14).

**Typography dominance.** The hero headline is the single largest typographic moment on the entire site — Working Blueprint's "impact-driven" display scale (`03_TYPOGRAPHY.md` §2) is spent here, deliberately, once.

**Diagrams.** None at the homepage level beyond the featured-evidence beat's one image — the homepage points to deeper pages for real diagrams rather than hosting them itself, keeping it the fastest, lightest page on the site.

**Must not resemble:** Services (the homepage states the pitch broadly; Services must answer a narrower, different question — see §2).

---

## 2. Services (overview)

**Purpose.** Let a visitor who already believes HubZero is credible (the homepage's job, already done) confirm which practice areas exist and how they combine — a capability reference, not a re-argument of trust.

**Story.** "Here is the shape of what we do, and why it's one practice, not several disconnected ones."

**Section order.** A headline distinct from the homepage's What We Do line (fixing the exact literal-duplication finding in `docs/design-reviews/MARKETING_SITE_REVIEW_V1.md` §3/§9 — Services earns its own sentence) → a single continuous unequal argument across practice areas (Software wider, Hardware & Embedded offset, AI/emerging practices narrower still — mirroring the homepage's split logic but at greater technical depth, not identical composition) → a plain link-out to each practice's own page → CTA panel.

**Visual rhythm.** Brisk and reference-like — this page should read faster than the homepage, since it's confirming rather than persuading.

**Dense vs. quiet.** Dense throughout, deliberately — a capability reference is allowed to be information-forward in a way a hero-driven page isn't.

**Animation.** Minimal — one-shot Motion reveals only, no GSAP scroll sequence. A capability-reference page has no narrative arc to choreograph.

**Imagery.** None, or at most one small technical-label-register diagram indicating how practices combine on a real engagement — no hero image.

**Typography dominance.** Body/technical-label register dominates; no display-scale moment beyond the page's own headline.

**Diagrams.** A single "how practices combine" diagram is the one place this page may use a real diagram — optional, not required.

**Must not resemble:** Software or Hardware (this is the index; those are the detail pages — the overview must not simply preview each detail page's own content, or it becomes a fourth redundant version of the same argument).

---

## 3. Services / Software (and Services / Hardware, Services / AI as future siblings)

**Purpose.** Answer, for a visitor specifically evaluating this one practice, "can you actually do the specific thing I need" — proof of depth in one discipline.

**Story.** Each practice page tells a _different_ story shape, not the same "philosophy → proof → process → CTA" template applied three times with different words (the exact failure named in the design review). Software's story: "we build systems that stay maintainable as they grow" — proof through a real architecture decision and a real before/after metric. Hardware's story: "we close the loop between silicon and software" — proof through a real signal-path diagram and, honestly, the current disclosed non-client Labs work while a client case study is still in progress. A future AI practice page's story would be different again: "we ship models that are accountable to a real evaluation," proof through a real evaluation methodology, not a philosophy statement echoing the other two.

**Section order (Software, as the fullest-built example).** Distinct headline → one real technical decision walked through in depth (not three numbered philosophy items) → one real "in practice" fact in the technical-label register → one real evidence image → CTA panel. Explicitly: **no mandatory pull quote, no mandatory three-step process list** — both are optional devices, used only where they add something this specific page hasn't already said elsewhere (directly implementing `10_IMPLEMENTATION_ROADMAP.md`-cited fix #1 from the design review).

**Visual rhythm.** The real technical walkthrough is this page's tallest beat — not a pull quote, not a process list.

**Dense vs. quiet.** Dense at the technical-decision walkthrough; quiet at the headline and CTA.

**Animation.** At most one GSAP-driven reveal if the technical walkthrough includes a real diagram worth sequencing; otherwise Motion one-shot reveals only.

**Imagery.** One real evidence image (a product render or code excerpt) — not the same image already used elsewhere on the site where a second real case study makes that avoidable (`docs/design-reviews/MARKETING_SITE_REVIEW_V1.md` §4's image-reuse finding).

**Typography dominance.** Body copy carries most of the page — this is an argument made in prose and evidence, not in display type.

**Diagrams.** Software: an architecture or data-flow diagram of the real technical decision being walked through. Hardware: a real signal-path diagram (the existing Labs/R&D diagram's direct descendant).

**Must not resemble:** its sibling practice pages — each must have a genuinely different section order and a genuinely different "what's the one piece of real evidence" answer, checked explicitly against every already-published sibling before shipping, per `01_VISION.md` §8's Recognition Test applied within a single pillar.

---

## 4. Work (index)

**Purpose.** The evidence room's front door — let a skeptical evaluator find and filter real, delivered engagements.

**Story.** No narrative arc; this is a reference index, and should read like one.

**Section order.** Headline → practice-area filter → a real, non-card-grid list of entries (image/text alternating rows, per the existing `WorkGrid` pattern's already-correct instinct) → plain closing line, no CTA panel repeated (the index doesn't need its own CTA close; each entry's detail page has one).

**Visual rhythm.** Even and scannable — no beat here should be taller than any other; this page's job is comparison, not immersion.

**Dense vs. quiet.** Moderately dense (real filter controls, real per-entry facts) but never cluttered — the "workshop register" (`06_COMPONENT_LANGUAGE.md` §0) is appropriate here more than the "showroom register."

**Animation.** Motion-driven filter transitions only (a genuinely useful state change) — no scroll storytelling.

**Imagery.** One small representative image per entry, consistent crop ratio across all entries (`07_IMAGERY.md` §6's consistency standard, applied to a list rather than a single hero).

**Typography dominance.** Technical-label register dominates (client, practice tag, one-line result) more than display type.

**Diagrams.** None — diagrams belong on detail pages, not the index.

**Must not resemble:** Labs or Blueprints index pages structurally, even though all three share the same underlying filterable-list _component_ (a shared component is fine per `ARCHITECTURE/07_DESIGN_SYSTEM.md` §8; a shared macro-composition is not) — Work's entries read as delivered/client-owned evidence; Labs' entries must visibly read as in-progress (§7 below); Blueprints' entries must foreground live-demo status (§8 below).

---

## 5. Case Study (Work detail)

**Purpose.** Let a skeptical evaluator verify HubZero has actually delivered — proof, not persuasion (`DESIGN/00_AI_DESIGN_GUIDE.md` §6, unmodified).

**Story.** Problem → real technical approach → measured result → (optional) real attributed quote → ongoing-relationship note → related work → CTA.

**Section order.** Header (client, practice tag, timeline in the technical-label register) → optional cover image → full editorial content-block body (the real `ARCHITECTURE/20_CONTENT_BLOCKS.md` block model — headings, images, metrics, code, quote, callout, as the actual project warrants, not a fixed problem/approach/result template) → tech tags → contributor chips → CTA.

**Visual rhythm.** The tallest, calmest, most immersive beat on the entire site other than the homepage's own featured-evidence moment — this page is where a reader should slow down the most.

**Dense vs. quiet.** Dense at the "by the numbers" / technical-facts moment (kept exactly as-is — `docs/design-reviews/MARKETING_SITE_REVIEW_V1.md` §5 already names it as one of the two strongest editorial surprises on the current site); otherwise generously quiet, with real emphasis-whitespace pauses reserved for this page specifically (`02_VISUAL_LANGUAGE.md` §4's "at most two per page, at most one shared with an adjacent page" budget spends its one shared allowance on the homepage→case-study hinge, unchanged from v2's already-correct instinct).

**Animation.** At most one GSAP-driven reveal for a real architecture/data-flow diagram if the case study includes one; Anime.js counters for the facts block.

**Imagery.** The richest imagery on the site for this specific entry — real product renders, real screenshots, real evidence, each captioned as a figure.

**Typography dominance.** IBM Plex Serif's one homepage-adjacent second use (per `03_TYPOGRAPHY.md` §3's homepage exception, extended to the case study specifically since it's the site's other "trust climax" moment) for a single genuine pull-line — never more than one per case study.

**Diagrams.** A real architecture diagram wherever the project's technical approach warrants one — this is the page most likely to need `06_COMPONENT_LANGUAGE.md` §15's full diagram component.

**Must not resemble:** a Builds or Labs detail page (§6, §7) — a case study's tone is third-person proof-for-a-prospect; Builds and Labs are first-person, and that difference must be visible in composition, not just in copy.

---

## 6. Labs (index and detail)

**Purpose.** Evidence that HubZero keeps building when no one's watching (`ARCHITECTURE/17_COMPANY_STRUCTURE.md` §1) — the one pillar explicitly allowed to look unfinished.

**Story.** "Here's what we're still figuring out, honestly labeled as such."

**Section order (detail).** Discipline/stage badge + date (title-block register) → real, dated entry content (notebook-adjacent imagery permitted here uniquely, per `07_IMAGERY.md` §10) → honest "still exploring this" framing where true → contributor chips → a quiet close (no hard-sell CTA — Labs' job is credibility, not conversion).

**Visual rhythm.** Deliberately looser and less polished than Work — visible incompleteness is correct here, not a flaw to fix (`01_VISION.md` §9, `01_VISION.md` §10's "an honest gap is always the correct answer to missing evidence" applied to finish level itself).

**Dense vs. quiet.** Varies genuinely entry to entry — a healthy Labs pillar has more exploration than completed products (`ARCHITECTURE/17` §3), and the page's visual finish should track each entry's real stage rather than being smoothed to a uniform polish.

**Animation.** Minimal — a heavily animated "in progress" page would be a small dishonesty (implying more production polish than the content warrants).

**Imagery.** Notebooks, prototypes, hardware photography, manufacturing (once real) — the most visually varied pillar on the site (`07_IMAGERY.md` §14).

**Typography dominance.** Geist Mono (dates, stage labels) more prominent here than anywhere else on the site — a Labs entry should look and feel like a dated log, not a finished feature announcement.

**Diagrams.** Real, current-state architecture/circuit diagrams, explicitly allowed to show incomplete or evolving systems rather than only finished ones.

**Must not resemble:** a Case Study or a Build — Labs is the one place a reader should feel "this might not ship," which a case study or Build page must never imply about itself.

---

## 7. Blueprints (index and detail)

**Purpose.** Evidence that HubZero's engineering discipline is repeatable — a real, working foundation a client can take and customize, explicitly not a template (`ARCHITECTURE/17_COMPANY_STRUCTURE.md` §2).

**Story.** "Here is something real you can use right now" — the live demo is the hero content, not a supporting image (`ARCHITECTURE/06_PAGE_SPECIFICATIONS.md`'s existing Blueprints spec, unmodified).

**Section order (detail).** Blueprint ID/category/version (title-block register) → prominent live-demo link and preview as the actual first, dominant content → customization notes → CTA routing to `/contact`, never a self-serve checkout.

**Visual rhythm.** The demo/preview is the tallest, most prominent beat by a wide margin — everything else on the page is genuinely secondary to it.

**Dense vs. quiet.** Quiet around the demo (let it breathe, let it be the obvious focal point); moderately dense in the customization-notes section, in the technical-label register.

**Animation.** Minimal — the live demo itself is the interactive experience; the surrounding page shouldn't compete with it for attention via its own motion.

**Imagery.** CAD, technical drawings, terminals/code supporting the demo — never replacing it.

**Typography dominance.** Technical-label register for the ID/category/version metadata; otherwise restrained, deferring visual weight to the demo itself.

**Diagrams.** A structure diagram of the Blueprint's own architecture, where it clarifies what a client is actually adopting.

**Must not resemble:** a generic theme-marketplace listing — per `ARCHITECTURE/17` §2's own explicit warning, every Blueprint's page must foreground its specific, lived provenance (what real engagement or Labs work it was distilled from) rather than reading as an interchangeable product-listing template.

---

## 8. Notes (index and detail)

**Purpose.** Long-form technical writing — HubZero's editorial voice at its most literary, closest of any pillar to Editorial Systems' figure/caption discipline (`00_EXPLORATION.md` §8).

**Section order (detail).** Category/reading-time (technical-label register) → headline → author (linked to their team profile) → cover → full content-block body → tags → contributor chips.

**Visual rhythm.** Governed entirely by the Prose content-width tier (`05_LAYOUT_SYSTEM.md` §1) — the narrowest, most reading-optimized page on the site.

**Dense vs. quiet.** Follows the actual article's real content weight — a technical deep-dive is allowed to be dense (code, diagrams); a shorter reflection stays quiet. Notes has no fixed density profile because its content genuinely varies more than any other pillar's.

**Animation.** Minimal — reading, not spectacle, is the point.

**Imagery.** Whatever the specific article is actually about — code, diagrams, real photography — each treated as a real figure with a caption.

**Typography dominance.** Body copy is the entire point of this pillar; IBM Plex Serif may appear once, if the article has a genuine single quotable line, exactly as any other page's one-serif-moment budget allows.

**Diagrams.** As warranted by the specific article — a technical Note about a real architecture decision earns a real diagram; a reflective Note doesn't need one manufactured for the sake of having one.

**Must not resemble:** Work's case-study format — Notes is authored commentary, not delivery evidence, and its structure should read as an essay, not a project retrospective.

---

## 9. Team (index and profile)

**Purpose.** Let a visitor verify the real, named people behind the work.

**Section order (index).** Core members only (per `ARCHITECTURE/06_PAGE_SPECIFICATIONS.md`'s existing verdict) — photo, name, role, link to profile.

**Section order (profile).** Bio, role, real contact links → skills (self-reported) → technology stack (computed from real credited work, per the existing `getTeamMemberProfileData` mechanism — kept, since it's a content-model decision, not a visual one) → real, live-queried contributions list.

**Visual rhythm.** Quiet and consistent — this page's entire job is credibility through photographic and informational consistency (`07_IMAGERY.md` §6), not visual drama.

**Dense vs. quiet.** Quiet in photography treatment, moderately dense in the real-contributions list (a genuine, verifiable body of work, not a claim).

**Animation.** Minimal to none.

**Imagery.** Team photography only, held to the strictest consistency bar on the site (§6, directly answering the specific failure named in `docs/design-reviews/MARKETING_SITE_REVIEW_V1.md` §6).

**Typography dominance.** Restrained — this page should not compete with its own subject (the real people) for attention.

**Diagrams.** None.

**Must not resemble:** About — Team is a directory; About is a narrative essay about the company's thinking (§10). The two should never be redundant with each other.

---

## 10. About

**Purpose.** Answer "who, specifically, am I trusting with this?" — the most textual, least visually elaborate page on the site, correctly, per `DESIGN/00_AI_DESIGN_GUIDE.md` §6's already-validated reasoning.

**Section order.** Opening philosophy statement → why HubZero exists → how the team thinks (including, now, how AI/research fits into that thinking, per `01_VISION.md` §1's expanded scope) → Software × Hardware × AI (the two-panel device generalized to reflect the broader practice, not literally copy-pasted) → Labs & engineering curiosity (a summary, linking to real Labs entries, not a duplicate write-up) → Founders (real names, roles, and consistently-treated photos) → closing CTA.

**Visual rhythm.** Long-form essay rhythm, closer to Notes than to the homepage — stacked prose sections with real heading hierarchy, deliberately departing from the rest of the site's asymmetric-panel language exactly as the current About page already correctly does.

**Dense vs. quiet.** Mostly quiet, prose-driven; the Founders section is the one place photographic consistency is non-negotiable (§9's cross-reference).

**Animation.** Minimal — a long-form essay doesn't benefit from scroll choreography.

**Imagery.** Founder photography (strict consistency), at most one real workspace or hardware photo illustrating "how we think" concretely rather than abstractly.

**Typography dominance.** Body copy carries almost the entire page; IBM Plex Serif's one budgeted moment lives here as a single pull-quote, exactly as today.

**Diagrams.** None required — About is the one page where prose alone is expected to carry the argument.

**Must not resemble:** the homepage's asymmetric-panel composition — About's correct departure into essay form is a deliberate, already-validated choice and should stay that way, not be pulled back toward the rest of the site's visual system for consistency's own sake.

---

## 11. Careers

**Purpose.** Speak in the one voice on the site allowed to be warmer and more culture/community-oriented, since client-facing brand voice deliberately excludes that register elsewhere (`ARCHITECTURE/06_PAGE_SPECIFICATIONS.md`'s existing verdict).

**Section order.** Real open listings (or an honest empty state) → what it's actually like to work at HubZero, specifically, not generic "great culture" copy → application path.

**Visual rhythm.** Warmer and more human than Services/Work, but not less disciplined — restraint still applies, just in a friendlier register.

**Dense vs. quiet.** Quiet — this is a small page for a small team; it should not be padded to feel bigger than it is.

**Animation.** Minimal.

**Imagery.** Workspace/team photography, the one place a slightly more candid (though still consistent) photographic tone is appropriate.

**Typography dominance.** Body copy, restrained.

**Diagrams.** None.

**Must not resemble:** Team (a directory) or About (an essay about the company's thinking) — Careers is specifically about what it's like to join, not who's already there or why the company exists.

---

## 12. Contact

**Purpose.** The one page with nowhere left to point — a genuine two-column composition (context beside form), deliberately without a closing CTA, exactly as the existing implementation already correctly reasons.

**Section order.** Context (what HubZero takes on, what happens next, an honest pricing-expectation note with no number) beside the form, stacked on narrower viewports.

**Visual rhythm.** The calmest, most functional page on the site — no narrative arc, no climax moment, because its entire job is to get out of the way of a visitor who has already decided to reach out.

**Dense vs. quiet.** Quiet throughout — this is the one page where restraint is total, not partial.

**Animation.** Form-validation feedback only (Motion) — nothing else.

**Imagery.** None.

**Typography dominance.** Body copy and form labels only — no display-scale moment on this page at all, a deliberate contrast with every other page on the site.

**Diagrams.** None.

**Must not resemble:** any other page on the site — Contact is the one archetype defined entirely by _absence_ (no CTA, no hero, no climax), and that absence is the correct, deliberate differentiation, not a gap to fill.

---

## 13. The standing per-page gate

Before any page above is considered finished, it must pass, in order: the existing Uniqueness Test (`ARCHITECTURE/15_HOMEPAGE_DESIGN.md` §12 / `07_DESIGN_SYSTEM.md` §8 — could this appear on another agency's site by swapping the logo?), the Recognition Test (`01_VISION.md` §8 — would an experienced designer recognize this as HubZero with the logo removed?), and the specific sibling-differentiation check named at the end of its own entry above. All three, every time, per page — not once at the end of a batch. That sequencing discipline is the single most important process lesson this entire folder carries forward from `docs/design-reviews/MARKETING_SITE_REVIEW_V1.md`, and no visual-system decision in `02`–`08` is a substitute for actually re-running it on every future page.
