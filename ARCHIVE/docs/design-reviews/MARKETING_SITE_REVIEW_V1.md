> **⚠️ ARCHIVED — historical reference only, not implementation guidance.** This document described the public marketing website under the design direction that was reset. It is preserved for historical context. Do not use it to guide the new design (see `DESIGN/NEXT`). See `ARCHIVE/README.md`.

# HubZero Marketing Site — End-to-End Creative & Product Review (V1)

> **Reviewed:** 2026-07-04, on `dev`, commit `0415391`. **Reviewer stance:** simultaneously a founder of a premium engineering consultancy, a CTO evaluating engineering partners for a ₹10–50L project, a startup founder considering hiring HubZero, a creative director at a world-class digital studio, and a design-award judge. **Method:** full source read of every page/component in the reviewed journey, cross-referenced against `PROJECT_CONTEXT.md` and `ARCHITECTURE/00`–`16`, plus a live walkthrough of the running site (`npm run dev`) at a standard desktop viewport, with DOM/computed-style inspection where visual behavior needed verification.
>
> **Journey reviewed, as one continuous read, exactly as briefed:** Home → Services → Software Engineering → Hardware & Embedded → Work → Bhatkal Time Luxe → About.
>
> **Scope note on responsive testing:** this environment's browser-automation tooling could not resize the viewport below its native ~2048×960 window (both the dedicated resize tool and browser zoom were ineffective here — a tooling limitation, not a site issue). The Responsive Review below is therefore desktop-verified by direct observation, and mobile/tablet-verified by rigorous reading of every Tailwind responsive class actually shipped (`sm:`/`md:`/`lg:`/`xl:` breakpoints are explicit in source, so this is a reliable but not a substitute for on-device visual QA). This is flagged wherever it matters and should not be read as "untested" — it's "verified a different way." A real-device pass is still owed before launch per `ARCHITECTURE/16`'s own approval gate.

---

## 1. Executive Summary

The site has real bones. The homepage is genuinely not a template — it has a point of view, a typographic idea (Geist Sans as the workhorse, one Instrument Serif italic word as the one slow-down), and at least one truly distinctive moment (the case study, "by the numbers" on the case-study detail page, the Labs/R&D system diagram). The copy discipline the architecture docs demanded — no "innovative," no "bring your ideas to life," no invented stats — has actually been followed. That's rare and it shows.

But read as one continuous journey rather than seven isolated pages, a pattern emerges that the architecture docs explicitly warned against and that the homepage itself was designed to avoid: **the interior pages (Services, Software, Hardware, and to a lesser extent About) are the same template wearing different copy.** Caption → clamp headline → muted subhead → mono facts line → numbered-prose-over-texture → italic pull-quote → border-top CTA close, in that exact order, four times in a row. `ARCHITECTURE/15`'s "uniqueness test" ("could this appear on another agency's site by swapping the logo?") was written for the homepage and passes there — it was never applied to the pages that immediately follow it, and it would fail on at least two of them.

The second real problem is asset polish undermining the premium claim at the exact moment it matters most: the four founder photos on About are visibly inconsistent in lighting, background, and crop quality — an unavoidable thing for a CTO evaluating a six-figure engagement to notice, in the one section whose entire job is "these are real, credible people."

The third is structural, not a design flaw: **every "Start a project" link on every page — the site's only conversion action, repeated verbatim as instructed by `ARCHITECTURE/15` §6 — currently 404s**, because `/contact` doesn't exist yet. This is expected and already correctly sequenced in the roadmap (the user explicitly asked that Contact not be built yet), so it is not counted against the design work itself — but it is the single fact that most affects how "finished" the site feels to a first-time visitor today, and it should stay top-of-mind as the very next milestone.

None of this requires a rebuild. The design language is worth keeping. What's missing is applying the same rigor the homepage got to the four pages that follow it, and a same-day photography pass on the About page.

---

## 2. Overall Score

### 6.5 / 10 — Strong foundation, not yet exceptional.

A 6.5 here means: a sophisticated visitor would leave with a positive impression of HubZero's taste and would take the case study seriously, but would also — correctly — clock that four of the seven pages in this journey are structurally the same page, and would not yet describe the site as "the best-designed small engineering studio site I've seen this year," which is the bar `ARCHITECTURE/15` itself sets ("would a potential client remember this experience tomorrow?"). The homepage alone would score closer to 8.5. The interior pages pull the average down.

---

## 3. Storytelling Review

**Does every page justify the next one?** Mostly yes, and the mechanism is well-built: `WhatWeDo`'s Software panel link-out is designed to hand off into the case study (`case-study.tsx` reuses "Featured case study" as almost a direct continuation), the case study hands off into "How We Work," which hands off into the CTA close. On the homepage specifically, this works. Off the homepage, the handoff logic gets weaker: Services → Software → Hardware is three pages in a row making structurally the same argument ("we do X, here's proof, here's how it runs, start a project") without the reader's understanding of HubZero actually deepening much between them. By the third page, "the same engineers who scope it build it" (paraphrased) has been said in Home's How We Work, in Software's philosophy line, in Hardware's philosophy line, and in About's "How we think" — four times, in slightly different words. It's a true and good claim. Repeating it four times doesn't make it four times as believable; it starts to read as the one thing the site knows how to say.

**Where does curiosity increase?** Genuinely, at three points: the hero's opening claim (specific, not sloganeering), the transition into the case study (the deliberate whitespace pause before the case-study image is a real, working technique — see §13), and the Hardware page's admission that "the first dedicated hardware case study is still in progress" — this is an unusual thing for a company website to say out loud, and it reads as more trustworthy for saying it, not less.

**Where does momentum drop?** Two places. First, Services → Software → Hardware: because the reader has already absorbed the "two disciplines" idea on the homepage's `WhatWeDo`, and Services' hero headline (`services/page.tsx:62`, "Two disciplines, engineered as one practice.") **is the same sentence** as `WhatWeDo`'s intro line (`what-we-do.tsx:26`) verbatim. Landing on Services immediately after Home and reading the exact same sentence again is a stall, not a build. Second, the large, deliberate whitespace pauses before nearly every full-bleed image (Home's case study, Software's product screenshot, every image block in the case-study detail page) are individually well-executed but collectively make the site feel slower than its content actually is — see §4.

**Does the site become more trustworthy as it progresses?** Yes, and this is the single strongest thing about the current build. The Bhatkal Time Luxe case study is specific in a way that most agency sites never risk being (458KB→42KB, 12 Mongoose models, a named pricing-drift bug they engineered around). By the time a CTO reaches "By the numbers" on the case-study detail page, trust is meaningfully higher than it was on Home. The Labs/R&D section on the Hardware page does real work here too — showing a real, dated, honestly-labeled non-client project is a better trust move than most agencies' instinct to either fake a case study or leave the page thin.

**Repeated ideas:** "the same engineers who scope it build it" (4+ times, worded differently each time — see above), the two-tone texture device (hairline grid for software, dot grid for hardware) used identically on Home, Services, Software, and Hardware, and the italic serif pull-quote used on Home, Services, Software, Hardware, About, and the case study — six times. Individually clever; as a set, it stops reading as "the one slow-down moment" (which is explicitly what `ARCHITECTURE/15` intended it to be) and starts reading as "the app's H3 treatment."

**Unnecessary explanations:** Minimal, genuinely — the copy is disciplined about not over-explaining. The one place it happens is the repeated "how an engagement runs" three-step process, which is essentially identical content on Home, Software, and Hardware (Discovery/Build/Stay, reworded per page). By the third occurrence, a reader already knows the shape of the answer before reading it.

**Strongest emotional moment:** The hinge between "What We Do" and the Featured Case Study on the homepage — the held-breath whitespace before the case-study image lands, exactly as `ARCHITECTURE/15` §8a intended it (Memorable Moment #3). It works.

**Weakest emotional moment:** Landing on `/services` immediately after the homepage and reading its identical headline. The one moment in the whole journey engineered to feel like deliberate repetition (the CTA close bookending the hero) is intentional and earns it; this one isn't, and doesn't.

---

## 4. Design Review

**Typography.** This is the site's best-executed system. One serif italic word in the hero, one pull-line per page — in principle. Geist Sans carries body copy well at the chosen size; Geist Mono for metadata/facts reads exactly as "engineered," which is the intended effect. No clipping or kerning issues found anywhere in the reviewed pages, including the gradient `bg-clip-text` treatment on the hero headline, which is a genuinely risky technique (italic descenders + gradient fill + `clamp()` sizing) and it renders cleanly.

**Spacing, rhythm, whitespace.** Generous, mostly intentional. But the "unexpected whitespace at a hinge" technique — explicitly scoped in `ARCHITECTURE/15` §8a as **one** memorable moment on the homepage — has been applied as a general habit rather than a single deliberate pause: there is a near-identical large gap before the product screenshot on `/services/software` (`services/software/page.tsx:100`), before nearly every image block on the case-study detail page, and again before the Labs/R&D diagram on Hardware. When a technique built to be rare shows up five or six times across the journey, it stops reading as "held breath before the payoff" and starts reading as "this is just how images are introduced on this site." Recommend reserving the long pause for 1–2 true climax moments (homepage case study, case-study-detail hero) and tightening the rest to the standard 96–128px section rhythm.

**Composition and asymmetry.** Genuinely well done on Home (`WhatWeDo`'s unequal panels, the case study's right-weighted image placement). Carried forward reasonably into Services/Software/Hardware's practice panels. About mostly abandons it in favor of straightforward stacked prose sections with real `<h2>`s — a deliberate and correctly-reasoned choice per the code comment at `about/page.tsx:71` (About is positioned as a long-form read, following the case-study page's convention, not the homepage's). That reasoning is sound, but it does mean About reads more like a well-written blog post than an "editorial" page in the same visual language as the rest of the site — worth a conscious call on whether that's the intended difference or a drift.

**Imagery.** The Bhatkal Time Luxe screenshots are the site's actual visual asset and they're strong — the editorial gold-on-dark storefront design gives every image block real presence, and presenting them full-bleed with no browser chrome (as `ARCHITECTURE/15` §9 mandated) was the right call. One overexposure risk: the same hero-homepage screenshot appears on Home, on `/work`, and again as the case-study detail page's hero — three uses of the identical image. Combined with the product-page screenshot reused on `/services/software` and again on the case-study page, a visitor who reads the whole journey sees the same 2–3 images repeatedly. This is a direct, unavoidable consequence of having exactly one real case study (correctly following `00_FOUNDER_APPROVAL.md` §2 — one case study is enough to launch on) — it isn't a design mistake, but it is a real experience the reader has, and the second real case study (already flagged as the top roadmap item after Contact) will fix it structurally, not cosmetically.

**Texture/motif usage.** The circuit motif is used exactly as scoped — twice, hero and How We Work connector — and reads as intentional rather than decorative. The hairline/dot-grid textures are a smart, cheap way to differentiate the two practice panels without icons or illustration, and they're reused consistently rather than reinvented per page, which is the right call **for that specific device**. Where it becomes a problem is that the texture device, the numbered-prose-block device, and the pull-quote device are all reused together, as a set, four times — see the repeated-composition finding below.

**Repeated compositions — named directly, as requested:**
1. **Services overview, Software Engineering, and Hardware & Embedded pages are structurally identical**, in this exact order, every time: mono caption ("Services — 0X") → `clamp()` H1 → muted subhead → mono facts line → numbered practice items over a texture background → italic serif pull-quote → full-bleed evidence image (Software/Hardware only) → numbered "how an engagement runs" list → border-top CTA close with "Start a project." Compare `services/software/page.tsx` and `services/hardware/page.tsx` side by side — the only real difference is the words and which texture (hairline vs. dot-grid) is applied. This is the single highest-impact finding in this review.
2. **The border-top CTA close block** (`border-border-muted border-t pt-12`, h3 + italic accent link) is reused verbatim on Services, Software, Hardware, Work, and the case-study detail page — five times, always at the very bottom of the page. Functionally fine (consistency is a stated value per `ARCHITECTURE/15` §6); visually, it means every single page in this journey ends on the exact same shape.
3. **The italic serif pull-quote** (`text-h3 ... font-serif italic`) appears on Home, Services, Software, Hardware, About, and the case study. `ARCHITECTURE/15` §1 was explicit that the serif should appear at "a small, named set of moments where the reader should genuinely slow down — not once per beat automatically." That discipline held on the homepage itself; it did not carry to the pages built after it.

---

## 5. Editorial Review

**Does this genuinely feel editorial?** The homepage does, convincingly. The case-study detail page does too — it reads like a well-edited engineering postmortem, not a portfolio card. Services/Software/Hardware do not; they feel like a well-designed **template system**, which is a different and lesser thing. A template system is not a bad outcome for a site that needs to scale to more practice areas later (`00_FOUNDER_APPROVAL.md` §6 explicitly wants that extensibility) — but the brief for this review is to judge the current experience as a reader, not as a future CMS schema, and as a reader, pages 3 and 4 of this journey feel like the same page.

**Agency patterns hiding underneath?** Yes, one specifically: the numbered three-item "how an engagement runs" process list, repeated near-verbatim on Home, Software, and Hardware, is structurally identical to the "Discovery / Design / Build" three-step process block that appears on effectively every agency site ever built — including, per `ARCHIVED_PROJECT_ANALYSIS.md`, HubZero's own legacy site. `ARCHITECTURE/15` §12 flagged this exact risk for "How We Work" on the homepage and argued it passes there because of the circuit-motif connector and the accountability-specific Step 3 content. That argument doesn't extend automatically to its second and third uses on Software and Hardware, which don't have the connector doing new work — they're the same three-step shape with different words.

**Where does it become predictable?** By the time a reader reaches Hardware (page 4 of 7), they can predict the page's shape before scrolling: caption, headline, three numbered items, italic pull-quote, process list, CTA. That predictability is the opposite of what an "editorial, not agency-site" model (`ARCHITECTURE/15`'s own stated goal) is supposed to produce.

**Where does it surprise the reader?** The Labs/R&D system diagram (`services/hardware/page.tsx:139`) — a real, HTML-text, scales-with-the-type-system data-flow diagram instead of a stock illustration or another screenshot — is a genuine surprise and the single most "this team actually thinks like engineers" moment on the site outside the case study itself. The "By the numbers" grid on the case-study page is the second-best surprise: repo-verified counts, explicitly and honestly labeled as not business metrics. Both are worth protecting and, ideally, extending as a pattern (see §10).

**Would someone remember this experience tomorrow?** They'd remember the hero and the case study. They would not reliably remember Services, Software, or Hardware as distinct experiences from each other — which fails `ARCHITECTURE/15` §12's own closing gate ("would a potential client remember this experience tomorrow?") applied honestly to the pages built after the homepage.

---

## 6. Trust Review

**The test as briefed: assume a ₹10–50 lakh engineering project. Would this site convince you to have the first conversation?**

Yes, provisionally, and here's the honest accounting of why and why not.

**What builds trust, concretely:**
- The case study is real evidence, not a claim. A CTO evaluating vendors reads "12 Mongoose data models," "44 API route handlers," "458KB→42KB, measured directly against a production build" completely differently than "we deliver fast, beautiful software." This is the site's core asset and it's used well.
- The Hardware page's honesty about not having a client case study yet, backed by real, dated, disclosed non-client work, is more credible than a padded page pretending otherwise would have been. `05_CONTENT_STRATEGY.md`'s zero-fabrication policy is being followed in practice, not just on paper.
- No fake testimonials, no invented stats, no "24/7 availability" — the legacy site's worst trust failures (`ARCHIVED_PROJECT_ANALYSIS.md`) are confirmed absent.
- Visible keyboard focus states work correctly (verified live via Tab navigation) — a small but real signal of engineering care that a technical evaluator would notice if they looked.

**What actively works against trust, in priority order:**
1. **The founder/co-founder photos on About are visibly inconsistent** — different backgrounds (one appears to be an indoor portrait against a patterned/blurred backdrop, others are outdoor snapshots against foliage), different lighting temperature, different apparent photo quality. This is the exact section whose entire job is "these are real, credible people you'd trust with six figures," and inconsistent, casual-looking photography undercuts that job at the worst possible moment in the journey. This is worth fixing before it's worth fixing anything else on this list.
2. **Every "Start a project" CTA — the site's only conversion action — currently resolves to a 404.** This is a known, already-sequenced gap (the user explicitly deferred Contact for this review), not a surprise defect, and it shouldn't be read as a design failure. But it is the single fact most likely to make a first-time visitor feel the site is unfinished today, and it should be the very next thing built.
3. **The case-study screenshots visibly show Kuwaiti Dinar ("KD") pricing** (visible on both the homepage's case-study image and the Software page's product screenshot) while `docs/research/PROJECT_CASE_STUDY_ANALYSIS_BHATKAL_TIME_LUXE.md`'s own confidentiality notes explicitly state the currency set was "deliberately omitted from the public-facing sections" specifically to avoid letting the target market be inferred. The copy honors that discipline; the screenshots don't. Minor in isolation (the client name "Bhatkal" already reads as India-associated), but worth a five-minute crop/blur pass for consistency with HubZero's own stated policy.
4. **Nearly every non-primary link in the site's footer and nav is dead** — `/team`, `/careers`, `/blog`, `/contact`, `/privacy`, `/terms` all 404 (confirmed live for `/contact`; the rest share the same `not-found` route per `next.config.ts`/App Router defaults since none of those routes exist in `src/app`). A CTO doing real due diligence clicks Privacy/Terms before submitting anything to a contact form — precisely the audience this site is trying to win. This is expected at this build phase per the roadmap, but it compounds finding #2 into a more general "this site has more scaffolding than finished rooms" impression if a skeptical visitor pokes at it.

**Net assessment:** the trust mechanism the site is built around — real evidence over claims — genuinely works and is the right strategy for a 4-person studio competing against agencies with bigger portfolios. The gaps above are all fixable in days, not a redesign, and none of them contradict the underlying strategy.

---

## 7. Technical Review

This is a design/product review, not a code audit, but several things surfaced during the source read that belong in this section because they affect the experience directly.

- **No light/dark theme toggle exists in the UI**, despite `ARCHITECTURE/07_DESIGN_SYSTEM.md` §2 and `10_FEATURE_SPECIFICATION.md` §2 both explicitly scoping it as "carried forward... light mode finally wired up" / "Theme toggle — built but disabled → finished and shipped." The infrastructure is present (`next-themes`, full light-mode token set in `globals.css`, `ThemeProvider` wired in `layout.tsx:78`) but `defaultTheme="dark"` with `enableSystem={false}` and no toggle component anywhere in `src/components` means light mode is currently unreachable by a real visitor. Either build the toggle or update the architecture doc to reflect that it's deferred — right now the code and the spec disagree.
- **No `robots.txt` / `sitemap.xml` generation exists** (`src/app` has no `sitemap.ts`/`robots.ts`, `public/` has no static equivalents). Expected at this project phase per `PROJECT_CONTEXT.md` §15 item 7 (SEO pass is a later milestone) — noted for completeness, not raised as a surprise.
- **Component reuse is genuinely good engineering** — `Container`, `Reveal`, the numbered-list pattern, and the CTA-close block are each implemented once and reused, not copy-pasted with drift. The repeated *compositions* flagged in §4/§5 are a content/design problem, not a code-duplication problem — worth stating plainly so this doesn't get "fixed" by literally duplicating code to make pages look different, which would be the wrong response.
- **Heading hierarchy has minor gaps.** `WhatWeDo`'s section intro ("Two disciplines, engineered as one practice") is a styled `<p>`, not a heading (`what-we-do.tsx:25`), so a screen-reader user navigating Home by heading level gets no landmark announcing that section — they land directly on the two panel `<h2>`s. Similarly, `/work`'s page has an `<h1>` followed by `<h3>`s inside `WorkGrid` with no `<h2>` between them. Neither breaks usability, both are quick, real fixes.
- **No console errors or warnings** on any page in the reviewed journey (verified live). Clean baseline.
- **The hero's `useEffect`-based reveal-trigger workaround** (`hero-section.tsx:56–67`, `circuit-motif.tsx:33–44`) is well-commented and clearly the result of real debugging against a genuine Next 16/Turbopack/React 19/`motion` interaction bug, not a sloppy pattern — flagged here only so it isn't "cleaned up" by someone unfamiliar with why it's written that way.

---

## 8. Responsive Review

Per the scope note at the top of this document, this section is desktop-verified live and mobile/tablet-verified by direct reading of every responsive class shipped, not by rendering at those widths in this session.

- **Desktop (verified live, ~2048px effective viewport):** The journey renders cleanly at this width with no overflow, no broken images, no layout collisions. The hero's circuit motif is correctly anchored inside `<Container>` per the fix already documented in `ARCHITECTURE/16` — confirmed directly via computed styles (`hero-section.tsx:101`, `wrapperClass` includes `-right-24 ... xl:-right-12` measured relative to the content box, not the viewport), so the specific drift bug that motivated `ARCHITECTURE/16`'s existence does not appear to be present in the current hero. This is worth a real-device confirmation at true 1440p/ultrawide/4K per `16`'s own approval gate before calling it closed, but the code is structurally correct.
- **Mobile composition, by code inspection:** The hero is genuinely recomposed rather than shrunk — `CircuitSignatureMark` swaps in below `lg`, the credibility strip becomes a vertical list (`sm:flex-row` only above `sm`), and the two-panel `WhatWeDo` correctly stacks to `grid-cols-1` below `lg`. This matches `ARCHITECTURE/16`'s "recompose, don't reflow" mandate in spirit. **Not independently visually confirmed this session** — flagged for a real on-device pass, since this is exactly the class of thing that "looks fine in the class list" and turns out wrong in practice (per `16`'s own stated motivation for existing).
- **Tablet, both orientations:** No tablet-specific breakpoint logic beyond the standard `sm`/`md`/`lg` Tailwind steps was found in the reviewed components — there's no evidence of the portrait/landscape-specific composition `ARCHITECTURE/16` §2 calls for as a requirement ("Tablet is not 'small desktop' or 'big phone' — both orientations need their own look"). This doesn't mean it's broken; a well-chosen `md:`/`lg:` step can legitimately cover both orientations acceptably. But there's no evidence in the code that iPad-portrait vs. iPad-landscape was deliberately composed as two different layouts, which is what `16` explicitly asks for. This should be the first thing checked in a real-device pass.
- **What could not be assessed this session:** actual on-device tablet portrait/landscape composition, true 1440p/ultrawide/4K rendering, and whether any breakpoint "reads as intentionally designed" per `16`'s subjective approval bar (as opposed to merely not overflowing). This is a genuine gap in this review, not a clean bill of health — treat §8 as "no known defects found by static analysis," not "responsive QA complete."

---

## 9. Content Review

**Weak paragraphs / genericness:** Very few, which is a real accomplishment relative to the brief's warning signs. The one recurring soft spot is the "how an engagement runs" three-step copy, which — stripped of its specific details — is close to boilerplate ("a scoped conversation, not a sales pitch" / "one team across the stack" / "we stay on for maintenance") repeated three times across Home, Software, and Hardware with only the specifics changed. Each instance individually reads well; back to back, the shape shows through the words.

**Repeated messaging (beyond what's already covered in §3):**
- "The same [people/engineers] who scope it build it" appears, reworded, on Home (How We Work step 2), Software (philosophy line and process step 2), About (thinking item 02), and implicitly on Hardware. It's the single most-repeated idea on the site.
- Services' H1 ("Two disciplines, engineered as one practice") duplicates `WhatWeDo`'s intro line verbatim — the only instance in this review of literal, word-for-word duplication rather than rephrasing. Recommend giving Services its own headline; the two-disciplines idea is already established by the time a reader arrives there from Home.

**Marketing language / unnecessary words:** Essentially none found. The copy consistently passes its own "could a competitor say this" test (`02_BRAND_STRATEGY.md` §2) — there is no "innovative," no "cutting-edge," no "solutions," no unearned superlative anywhere in the reviewed journey. This is a genuinely disciplined execution of the brand strategy doc and deserves to be named as a strength, not just an absence of a problem.

**Replacing abstraction with evidence — the site already does this well** in the case study and Labs/R&D section; the one place it doesn't is the recurring philosophy lines ("we think in systems, not deliverables," "specificity over confidence," etc.). These are well-written but are, by definition, abstractions — the site's own stated value ("specificity over confidence," `about/page.tsx:19`) is itself asserted rather than evidenced at the moment it's stated. This is a minor, almost unavoidable irony rather than a real problem (a company's stated values are allowed to be assertions), but worth noting since the review was asked to check specifically for this pattern.

---

## 10. Highest-Impact Improvements

Ranked by (trust/credibility impact) × (how directly it undermines the site's own stated design principles):

1. **Redesign Services, Software, and Hardware as three distinct compositions**, not three fills of one template. Keep the texture devices (hairline/dot-grid) and the numbered facts — they work — but vary the macro-structure: different image placement logic per page, drop the pull-quote from at least one of the three, don't repeat the three-step process list verbatim across all three pages (Home already owns "How We Work"; Software/Hardware could show something more specific to that practice instead — e.g., Hardware could lead with the Labs diagram earlier in the page rather than after the philosophy line). This single change would move the score in §2 more than anything else on this list.
2. **Commission or re-crop a consistent founder photo set for About.** Same lighting approach, same background treatment (even a simple consistent crop/color-grade pass on the existing photos would help), same technical quality bar across all four. This is the highest trust-per-effort fix available — it's an asset problem, not a design problem, and likely resolvable in an afternoon.
3. **Give Services its own headline**, distinct from `WhatWeDo`'s homepage line, to remove the one instance of literal duplicated copy in the journey.
4. **Crop or select case-study screenshots that don't expose currency-specific pricing**, to match the confidentiality discipline the copy already follows.
5. **Reserve the "large whitespace hinge before an image" technique for 1–2 true climax moments** (homepage → case study; case-study page's own hero) and tighten the equivalent gaps elsewhere to standard section rhythm, so the technique keeps its power.

---

## 11. Quick Wins

- Give `/services` its own H1 (5-minute copy change; see #3 above).
- Add `<h2>` landmarks to `WhatWeDo`'s section intro and `/work`'s grid intro for correct heading hierarchy.
- Crop/blur the visible "KD" currency on the two case-study screenshots that show pricing, or swap in a screenshot region that doesn't.
- Either wire up a visible light/dark toggle (the infrastructure already exists end-to-end) or update `ARCHITECTURE/07`/`10` to mark it explicitly deferred, so code and spec agree.
- Vary the wording of the three "how an engagement runs" process blocks enough that they don't read as the same three sentences reordered — or cut it from one of the three pages entirely and let Home own it exclusively.

---

## 12. Long-Term Improvements

- **A second real case study** (already the top roadmap item after Contact) will do more for this site than any design change — it directly fixes the image-reuse overexposure noted in §4 and gives Work's filter-by-practice-area feature something to actually filter.
- **A tablet-specific composition pass**, per `ARCHITECTURE/16`'s explicit portrait/landscape requirement, once real devices are available to test on — the code shows no evidence this has happened yet for any page.
- **Extend the "By the numbers" / system-diagram pattern** (the two strongest editorial surprises on the site, per §5) to future case studies and practice pages as a deliberate recurring signature — repo-verified facts and real data-flow diagrams are a genuinely distinctive HubZero move that competitors can't easily copy without having the same engineering discipline to back it up.
- **A true real-device responsive QA pass** across the tiers `ARCHITECTURE/16` §2 specifies, once Contact and the interior-page redesign land, rather than before — no reason to QA layouts that are about to change structurally.

---

## 13. Things That Should NOT Be Changed

- **The hero.** Headline, gradient treatment, motif placement, CTA typography-as-hierarchy instead of button chrome — all of it works and should be treated as the reference standard the rest of the site is graded against, not touched.
- **The homepage → case study transition**, specifically the deliberate whitespace pause before the case-study image. This is the single best-executed "memorable moment" on the site (per `ARCHITECTURE/15` §8a's own definition) — protect it by not diluting it elsewhere (see §10 #5), not by removing it.
- **The Labs & R&D system diagram** on the Hardware page. Real HTML text, no stock illustration, scales correctly, genuinely surprising in the best way. This is a pattern to extend, never to cut for time.
- **The "By the numbers" block** on the case-study detail page — repo-verified, explicitly and honestly scoped as not business metrics. Exactly the kind of specific-over-confident move `02_BRAND_STRATEGY.md` was written to produce.
- **The honest "no hardware case study yet" framing** on the Hardware page, and the honest empty state on `/work`'s Hardware filter. Both are correctly-judged trust moves — do not backfill either with anything less than a real, complete case study.
- **The zero-fabrication content discipline overall** — no invented stats, no placeholder testimonials, no generic agency vocabulary anywhere in the reviewed journey. This is the hardest thing on this list to get right and it's already right; any future content work should be held to the same bar, not loosened for speed.
- **The single shared nav/footer config** (`config/nav.ts`) and the resulting structural impossibility of desktop/mobile link drift — correct engineering, not a design opinion, and it's already done right.

---

## 14. Final Recommendation

**Needs another design polish pass first — specifically, and narrowly, on the Services / Software / Hardware template repetition and the About photo set.**

This is not a recommendation to delay meaningfully or to reconsider the design direction — the direction is right, and most of the journey (Home, Work, the case study) is already at the bar this project is aiming for. The specific, scoped work needed before this reads as a finished, exceptional site is:

1. Give Services, Software, and Hardware three genuinely distinct compositions (§10 #1) — this is design/copy work, not new engineering, and is the highest-leverage item on this whole review.
2. Fix the About photo set (§10 #2) — an asset task, likely a single afternoon.
3. The five quick wins in §11, all small.

None of this needs to block starting work on `/contact` — that's additive scope with no structural overlap with the interior-page redesign, and it remains, as already correctly identified in `PROJECT_CONTEXT.md`, the single most conversion-critical gap on the live site. **The recommendation here is specifically about calling the *marketing narrative* (Home → About) finished, not about sequencing Contact** — those can proceed in parallel if that's the more efficient path. But if the goal is "this journey should feel like an exceptional engineering company's website" (the bar this review was asked to hold it to), it isn't quite there yet, and the gap is narrow, named, and fixable in days.
