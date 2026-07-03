# 17 — Company Structure

> **Status: Founder Approved — 2026-07-04.** Drafted 2026-07-04 in response to the founder's direction that HubZero now operates around four pillars (Work, Builds, Labs, Blueprints), a structural evolution not represented anywhere in `00`–`16`. Approved via `00_FOUNDER_APPROVAL.md` §8, which also resolved three of this document's four original open questions (§9 below) — the fourth (Builds content readiness) remains open, since it's a factual question rather than a design decision.
>
> Decision convention: see `01_PRODUCT_VISION.md` §0. Nothing below relitigates a decision already settled in `00`–`16` (founding year, RBAC model, CMS build approach, blog MVP scope, etc.) — this document is additive: it names the operating structure those decisions already sit inside, and gives the four pillars a canonical home so `03`, `05`, `06`, `09`, `11`, and `14` have one place to point back to instead of each inventing their own framing.

## 0. Why this document exists

`01_PRODUCT_VISION.md` §1 already named the tension at the center of HubZero's identity: the founder describes HubZero as "an engineering company," in the founder's own words a "large organization of engineers with many contracts with brands" within three years — while the site itself, until now, only ever showed one face of that company: client delivery (`Services` explaining capability, `Work` proving it). That was the correct scope for a studio with one real case study and no shipped internal product. It stops being the correct scope for a company whose own stated ambition includes building things it owns, exploring things it hasn't sold yet, and packaging its own engineering effort into something reusable.

**Work, Builds, Labs, and Blueprints are not four new pages. They are the operational structure of an engineering company that does more than take client briefs** — and the website's job, per `01_PRODUCT_VISION.md`'s own operating logic, is to make that structure visible and legible before it's fully true, the same way the rest of v2 was built "as if the company framing is already true... written forward from where the team wants to be." This document is where that structure gets defined once, precisely, so every other architecture document can reference it instead of re-deriving it.

## 1. Company philosophy

HubZero's differentiation, per `01` §4 and `02_BRAND_STRATEGY.md` §6, was never going to come from claiming to be the cheapest or the biggest. It comes from evidence: real case studies, real disclosed non-client work, real specificity instead of superlatives. A four-pillar structure is that same philosophy applied to the *company itself*, not just its copy:

- **Work** is evidence HubZero can be trusted with someone else's business.
- **Labs** is evidence HubZero keeps building even when no one's paying — the same "Labs / R&D" instinct the founder already approved as interim hardware proof (`00_FOUNDER_APPROVAL.md` §2), generalized into a permanent practice rather than a stopgap.
- **Builds** is evidence that exploration turns into something real enough to stand on its own.
- **Blueprints** is evidence HubZero's engineering discipline is repeatable, not a one-off performance for whoever happens to be watching.

Read together, the four pillars tell a single coherent story: *ideas get explored, some become real products, and everything HubZero learns doing both makes client work faster and better.* That story is what makes "a large organization of engineers with many contracts with brands" believable years before the contract count actually gets large — which is exactly the forcing-function role `01_PRODUCT_VISION.md` §1 already assigns to this website.

## 2. The four pillars

Each pillar is defined by **whose work it is** and **what stage it's at** — the two axes that also happen to be the cleanest way to keep them from collapsing into each other.

| Pillar | Whose work | Stage | One-line test |
|---|---|---|---|
| **Work** | Client's | Delivered / ongoing | Did a named client pay HubZero to build this? |
| **Labs** | HubZero's | Exploratory, in progress | Is this still being figured out, with no promise it ships? |
| **Builds** | HubZero's | Completed, owned | Did HubZero finish this and does HubZero own it? |
| **Blueprints** | HubZero's | Productized, reusable | Can a client take this and make it theirs? |

### Work

**What it is:** Client engagements. Case studies. Verified collaborations — real named clients (or honest, specific anonymization), a real problem, a real approach, a real result. This pillar is unchanged from the existing `03_INFORMATION_ARCHITECTURE.md` / `05_CONTENT_STRATEGY.md` / `06_PAGE_SPECIFICATIONS.md` definition of Work — nothing here supersedes those documents.

**What does not belong:** Internal products (→ Builds), work-in-progress with no client (→ Labs), a productized offering shown as if it were bespoke client work (→ Blueprints). A Work entry without a real, named (or honestly anonymized) client is a contradiction in terms — if there's no client, it isn't Work, regardless of how finished or impressive it is.

### Builds

**What it is:** Completed, first-party products HubZero owns outright — software, hardware, or both. No client commissioned them; HubZero built them because the team decided to. A Build is what Labs work looks like once it's real enough to stand on its own: shipped, usable, and maintained as a product rather than an ongoing experiment.

**What does not belong:** Anything built for a paying client (→ Work, regardless of how proud the team is of it), anything still actively changing shape with no fixed scope (→ Labs, until it stabilizes), and anything designed from the outset to be handed to *other people* to customize (→ Blueprints — a Build is HubZero's own product; a Blueprint is a foundation someone else builds on).

### Labs

**What it is:** Research, experimental engineering, prototypes, and active exploration — hardware, software, AI, or the intersection of any of them. Labs is where the founder-approved "Labs / R&D" content type (`00_FOUNDER_APPROVAL.md` §2, `11_DATABASE_ARCHITECTURE.md`'s `LabsProject` collection) already lives in spirit, generalized from "interim hardware-capability proof shown on one Services page" into its own permanent, top-level pillar covering every discipline HubZero explores, not only electronics. Labs work is disclosed honestly as non-client, in-progress, and not guaranteed to go anywhere — that honesty is the point, not a caveat to soften.

**What does not belong:** Anything being sold or delivered to a client (→ Work), anything finished and stable enough to call a real product (→ Builds — see §3's graduation path), and speculative claims dressed up as research ("AI-powered" language with nothing built behind it is exactly the kind of unverifiable claim `05_CONTENT_STRATEGY.md` §3 already prohibits everywhere else on the site).

### Blueprints

**What it is:** Production-ready engineering foundations — **explicitly not templates**. A Blueprint is a real, working starting point (a website foundation, and over time potentially other reusable engineering foundations) that shortens delivery time on a client engagement while remaining fully customizable, not a static theme a client drops their logo onto. Each Blueprint eventually carries: a unique Blueprint ID, a category, structured metadata, a live demo, a preview, and customization notes describing what a client can and can't change.

**What does not belong:** A one-off client deliverable relabeled as reusable after the fact (a Blueprint is designed for reuse from the start, not a repurposed Work entry), an internal product with no path to being handed to a client to customize (→ Builds), and — the specific trap this pillar has to actively avoid — a Blueprint that looks so generic it undermines the "not a template" claim in its own definition. If a Blueprint could describe any agency's stock theme, it has failed its own one-line test before a client ever sees it.

## 3. Relationship between pillars — the project lifecycle

The four pillars are stages in one lifecycle, not four unrelated buckets. Most engineering effort at HubZero should be traceable through this path:

```
        Idea
         │
         ▼
        Labs            (explored — hardware, software, AI, or a mix; no promises yet)
         │
         │  graduates when the work is finished, stable, and worth
         │  owning as a real product — not every Labs project does
         ▼
       Builds            (shipped — HubZero owns it, uses it, maintains it)
         │
         │  running a real Build in the real world teaches HubZero
         │  things no amount of planning would have surfaced
         ▼
  Real-world experience
         │
         │  the patterns, infrastructure, and hard-won decisions
         │  from that real-world experience get distilled into
         │  a reusable, customizable foundation
         ▼
     Blueprints            (productized — repeatable, reusable, customizable)
         │
         │  a Blueprint shortens the next engagement, so the
         │  benefit flows back to where the company makes its
         │  living
         ▼
      Client Work
         │
         │  and what's learned delivering client work seeds the
         │  next idea worth exploring in Labs — the loop closes
         └──────────────────────────────────────────────────────▶ (back to Labs)
```

**Why this order, and not some other one.** Labs comes first because HubZero's differentiator (`01_PRODUCT_VISION.md` §4) is combined software+hardware engineering judgment, and judgment is built by building things with no client watching, not by writing a services page about it. Builds comes second because *shipping* something — finishing it, maintaining it, feeling the parts of it that were harder than expected — is a categorically different exercise than prototyping it, and only a shipped, owned product can honestly claim to have taught the team anything. Blueprints comes third, deliberately downstream of both, because a reusable foundation built from real, lived experience is defensibly different from a template built to *look* reusable — this is the same "system is shown, not just the screenshot" principle `02_BRAND_STRATEGY.md` §5 already applies to case studies, applied here to the foundations themselves. Client Work closes the loop last, because the entire point of the other three pillars, commercially, is that they make the next client engagement faster, more confident, and backed by more real evidence than the last one — and what a client actually needs, mid-engagement, is very often the next idea worth taking back into Labs.

**Not every project completes the whole loop, and that's correct, not a gap.** Most Labs projects should *not* graduate to Builds — a healthy Labs pillar has more exploration than completed products, the same way a healthy R&D function anywhere does. Client Work can also start the loop directly (a client engagement can itself surface a pattern worth turning into a future Blueprint) without ever passing through Labs or Builds first. The diagram describes the *idealized* path content is encouraged to take, not a gate every project must pass through.

## 4. Content architecture (summary — schemas live in `11`)

This document defines what the pillars *are*; `11_DATABASE_ARCHITECTURE.md` owns the actual schema shapes once it's updated to match (see that document's audit entry in the accompanying review). Summarized here only so the lifecycle in §3 is traceable in the data model, not just the narrative:

- **Work** keeps its existing `CaseStudy` shape unchanged — client, industry, practiceArea, problem/approach/result, quote, techTags, status, version.
- **Labs** extends the existing `LabsProject` collection (unchanged `isClientWork: false` guarantee) with a `stage: 'active' | 'archived' | 'graduated'` field and a `graduatedToBuildId?: ObjectId` reference, so a graduation is a recorded relationship, not a silent deletion.
- **Builds** is a new collection, structurally close to `CaseStudy` but with no `client` field, plus `graduatedFromLabsId?: ObjectId` as the inverse of Labs' graduation reference — so the lifecycle arrow in §3 is a real, queryable link, not just a narrative claim.
- **Blueprints** is a new collection, structurally closer to a productized-service listing than to editorial content: `blueprintId` (stable, exposed in metadata, not the URL), category, techStack, `previewUrl`, `demoDeploymentUrl`, `customizationNotes`, and a `demoStatus: 'live' | 'stale' | 'retired'` field — because a Blueprint carries an ongoing operational commitment (a working demo) that none of the other three pillars do.
- All four share the same `status` / `version` / `VersionHistory` workflow already mandated for every content type in `09_CMS_ARCHITECTURE.md` §3 — there is no reduced-rigor tier for internal content just because a client isn't watching.
- `practiceArea` enums across Work/Labs/Builds should extend to include an `'ai'` vertical now, not later — Labs explicitly covers AI exploration per this document's own definition, and `00_FOUNDER_APPROVAL.md` §6 already commits to practice-area extensibility "without structural redesign."

## 5. Information architecture & navigation implications (summary — owned by `03`)

Adding four real, permanent content pillars to a site whose primary navigation was deliberately capped at "five items plus one CTA" (`03_INFORMATION_ARCHITECTURE.md` §2) is a genuine structural question, not a styling detail — full treatment belongs in `03` once amended, but the reasoning originates here because it follows directly from the pillars being real operating divisions, not optional add-ons.

**The recommendation:** raise the primary-nav ceiling from five items to six, and roll pillars into it as they earn a place — not all at once, and not by inventing an umbrella label that blurs the pillars' distinct definitions.

- **Why six, not five, and not eight.** The original ceiling was calibrated to a single-narrative services site with one proof point. The *principle* behind it — a short, stable nav that reflects real, distinct visitor intents rather than decorative breadth (`02_BRAND_STRATEGY.md` §5, research principle 5) — still holds; it just now supports one more genuinely distinct intent (a visitor evaluating HubZero's own products or reusable foundations, not just its client work) than the original research anticipated. Going all the way to eight items (Services, Work, Builds, Labs, Blueprints, About, Blog, Contact) would be optimizing for completeness over restraint, the exact failure mode the research was written to prevent.
- **Why not group Work/Builds/Labs/Blueprints under one umbrella nav item.** It's tempting, and it would keep the count down — but grouping Builds and Labs (HubZero's own, unpaid work) under a "Work" menu directly contradicts §2's own definition of Work as *client* engagements. The confusion this would cause is worse than the one extra top-level slot it would save.
- **Rollout is content-gated, not calendar-gated.** A pillar enters primary nav only once it has at least one real, published entry — matching the honest-empty-state discipline the site already applies to Work's practice-area filter, rather than a nav item that quietly points at nothing. Until then, a pillar lives in the footer (the same holding pattern Careers and Team already use).
- **Trade-off, stated plainly.** This costs a small amount of the "short nav reads as restrained and confident" signal the original research prized. It buys a nav that honestly reflects a four-pillar company instead of hiding three of its four pillars in the footer indefinitely. Given the founder's stated three-year ambition, that trade is worth making — but it should be made deliberately, as a logged decision, not by drifting into an eight-item nav one pillar at a time without ever revisiting the ceiling.

## 6. What does not belong in any pillar

Some content will tempt a home in more than one pillar, or in none. Defaults, in order of how often this is likely to come up:

- **A client project HubZero is unusually proud of** → Work, always, regardless of how much it resembles a Build in ambition. Ownership, not pride, decides the pillar.
- **An unfinished internal experiment presented as if it were a finished product** → stays in Labs, honestly labeled in-progress, until it actually graduates (§3). Never backfilled into Builds early to make the pillar look more populated — this is the same zero-fabrication discipline `05_CONTENT_STRATEGY.md` §3 already applies to testimonials and stats, applied to the pillars themselves.
- **A reusable foundation that hasn't actually been used to accelerate a real engagement yet** → stays out of Blueprints until it has a real preview and real demo deployment, not a placeholder. A Blueprint with a dead or nonexistent demo actively damages the "not a template" claim it exists to make.
- **Marketing/community content, recruiting content, thought-leadership writing** → none of the four pillars; this is Blog and Careers territory, unaffected by this document.
- **A future line of business that isn't hardware, software, AI, or a productized foundation** (e.g. a services offering in an adjacent discipline) → not automatically a fifth pillar. See §7 before assuming a new pillar is the right answer.

## 7. Future-proofing and governance

### How to decide whether a new pillar is justified

A fifth pillar is justified only if it fails the "whose work / what stage" test in §2 against all four existing pillars — i.e., it genuinely isn't client work, isn't exploratory, isn't a finished owned product, and isn't a reusable foundation. Most future additions (a new practice area, a new blog category, a new service) are **extensions of an existing pillar or document**, not new pillars — `00_FOUNDER_APPROVAL.md` §6 already anticipated this for practice areas ("Software, Hardware & Embedded remain the launch focus... but the IA/CMS must be built so additional verticals can be added without structural redesign"). Default to extending Labs' `practiceArea` enum before proposing a new top-level pillar.

### How to decide whether a new content type is justified

Use the same test `05_CONTENT_STRATEGY.md` §2 already applies to Case Studies: does this content type need its own required fields, its own quality bar, and its own workflow that an existing collection can't honestly stretch to cover? If an existing pillar's schema can hold the new content with at most one or two new optional fields, extend it (as Labs' `stage` field does, §4) rather than inventing a new collection.

### How to evaluate a new navigation item

Apply §5's reasoning directly: does this represent a genuinely distinct visitor intent not already served by an existing nav item, does it have real published content behind it (never a nav item pointing at an empty index), and does adding it keep the total at or below the current ceiling — or does it force a deliberate, logged decision to raise the ceiling again? Never add a nav item to make the company look bigger than its content currently proves it to be.

### Maintaining editorial consistency across four pillars

The site's own commissioned design review (`docs/design-reviews/MARKETING_SITE_REVIEW_V1.md`, 2026-07-04) found that Services, Software, and Hardware — three pages built after the homepage — collapsed into "three fills of one template," failing the Uniqueness Test `15_HOMEPAGE_DESIGN.md` §12 defined for the homepage but never applied past it. Work, Builds, Labs, and Blueprints are three *more* index-plus-detail page families about to be built. Before any of them ship:

- Apply `15` §12's Uniqueness Test — "could this appear on another agency's site by swapping the logo?" — to each pillar's index and detail template individually, not just once at the end.
- Vary macro-structure across the four pillars deliberately (different image placement logic, different pull-quote presence/absence, different process framing) rather than letting a shared component (see `11`'s note on the shared filterable-index primitive) produce four visually identical pages wearing different copy. A shared *component* is correct engineering; a shared *composition* four times in a row is the exact failure this section exists to prevent.
- Treat this as a standing item on the definition-of-done for any new pillar page, not a one-time fix applied retroactively to Services/Software/Hardware and then forgotten for Builds/Labs/Blueprints.

### Avoiding duplicated content

The clearest present risk is the existing "Labs / R&D" section embedded in `/services/hardware` and the new top-level Labs pillar describing overlapping content. Resolve this the same way the legacy `team.json` duplication was resolved (`11_DATABASE_ARCHITECTURE.md` §3): **one canonical record, referenced from wherever else it needs to appear.** The Hardware & Embedded page should summarize and link to the canonical Labs entry, never maintain a second copy of the same write-up. This same rule applies pre-emptively to Builds (don't also describe a graduated Build in full on the Labs page it came from — link to it) and to Blueprints (don't re-describe a Blueprint's full customization notes on a Services page that references it).

### Preserving the honesty policy

Every rule in `05_CONTENT_STRATEGY.md` §2-3 (real named clients only, zero fabricated metrics, no placeholder testimonials, omit rather than invent) applies to all four pillars without exception, including — deliberately — the two pillars (Labs, Builds) where no client is watching to catch an exaggeration. Labs content is disclosed as non-client and in-progress specifically so it is never mistaken for client work or a finished promise (this is the same discipline already governing the existing Labs/R&D section, generalized). A Blueprint's `demoStatus` field (§4) exists so a stale demo is caught and either fixed or marked retired before a prospect finds it first — an operational form of the same honesty policy, not a separate concern.

## 8. Relationship to existing documents

| Document | What it should reference from here |
|---|---|
| `00_FOUNDER_APPROVAL.md` | A new dated decision entry adopting this document, once approved |
| `01_PRODUCT_VISION.md` | §1's three-year vision as the philosophical basis for §1 above |
| `03_INFORMATION_ARCHITECTURE.md` | §5 above for the nav-ceiling and sitemap changes |
| `05_CONTENT_STRATEGY.md` | §4 and §6 above for the per-pillar content policy and honesty-policy extension |
| `06_PAGE_SPECIFICATIONS.md` | §2 above for the new page specs (Builds, Labs, Blueprints index/detail) |
| `07_DESIGN_SYSTEM.md` | §7 above for the generalized Uniqueness Test requirement |
| `09_CMS_ARCHITECTURE.md` / `11_DATABASE_ARCHITECTURE.md` | §4 above for the collection shapes and graduation reference fields |
| `14_IMPLEMENTATION_ROADMAP.md` | §3 above for sequencing Labs → Builds → Blueprints against the existing phased roadmap |
| `15_HOMEPAGE_DESIGN.md` | §7 above — this document generalizes `15` §12's Uniqueness Test site-wide rather than superseding it |

## 9. Open questions — status

**[Updated 2026-07-04, see `00_FOUNDER_APPROVAL.md` §8]** This document's status is now **Founder Approved**, not merely proposed — the first three questions below were resolved in that entry. The fourth remains genuinely open, since it's a factual question about current internal work rather than a design decision.

1. ~~Is the six-item nav ceiling (§5) an acceptable evolution of `03` §2's original five-item rule?~~ **Resolved:** yes — six items, content-gated rollout, Blog moved to footer-only. See `00_FOUNDER_APPROVAL.md` §8, `03_INFORMATION_ARCHITECTURE.md` §2.
2. ~~Does the existing embedded "Labs / R&D" section on `/services/hardware` move fully to the new `/labs`?~~ **Resolved:** yes, summary-plus-link, not a duplicated write-up. See `06_PAGE_SPECIFICATIONS.md`, Hardware & Embedded.
3. ~~Should Blueprints be positioned as public, self-serve productized offerings, or as proof-of-range?~~ **Resolved:** proof-of-range and delivery accelerators — CTA routes to `/contact`, not a self-serve checkout flow. See `00_FOUNDER_APPROVAL.md` §8, `06_PAGE_SPECIFICATIONS.md` Blueprints.
4. **Still open:** does HubZero have a real, complete internal product ready to publish as a Build today? This determines whether the Builds pillar launches alongside Labs or is gated on one being finished first (`14_IMPLEMENTATION_ROADMAP.md` Phase 3a). Confirm directly before that phase is reached.
