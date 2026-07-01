# 05 — Content Strategy

> **Status: Founder Approved — 2026-07-01.** See `00_FOUNDER_APPROVAL.md` §2 (Labs/R&D), §3 (blog reversed to MVP-scope), §4 (pricing/FAQ guidance) for revisions incorporated below.

> Decision convention: see `01_PRODUCT_VISION.md` §0.

## 1. Content types and their purpose

| Content type | Purpose | CMS-managed? | Launch volume |
|---|---|---|---|
| Case studies | Primary trust-building proof | Yes | Start with 1-3 real, fully-documented studies — quality bar over quantity, per §2 |
| Labs / R&D projects | Interim hardware-capability proof where no client case study yet exists | Yes | **[New, added 2026-07-01, see `00_FOUNDER_APPROVAL.md` §2]** Internal/personal embedded/IoT projects, clearly labeled non-client — as many as genuinely exist; never presented as client work |
| Service descriptions | Explain the practice areas | Yes (rarely changes) | 2 pages (software, hardware) + overview; schema extensible to future verticals (`00_FOUNDER_APPROVAL.md` §6) |
| Team profiles | Credibility of named people | Yes | Core members only at launch (**[Consensus]**, see `01` §9); leadership presented as Founder + co-founders (`00_FOUNDER_APPROVAL.md` §2) |
| Testimonials | Secondary social proof | Yes | Real only — zero placeholder entries (see §3) |
| Blog posts | Thought leadership / SEO | Yes | **[Amended 2026-07-01, supersedes the "maybe someday" sequencing below — see §5 and `00_FOUNDER_APPROVAL.md` §3]** Full platform ships in MVP; launch content is 3-5 cornerstone articles |
| Company/about copy | Trust, positioning | Yes (low-frequency edits) | Single page |
| FAQs | Reduce pre-contact friction, including pricing self-qualification (`00_FOUNDER_APPROVAL.md` §4) | Yes | CSV Q17: 3 of 4 respondents flagged FAQs as editable content — build the content type even if launch content is thin |
| Career listings | Recruiting | Yes | As needed |

## 2. Case study content policy

**[Consensus]** CSV Q12: 3 of 4 respondents ("Only major projects") vs. Iyad ("Yes," every project). Per `01` §0, this is followed as written: **not every completed project becomes a case study.** A project qualifies for a public case study only if it has: a real, named client (or anonymized-but-specific description if confidentiality requires it), a clear problem statement, a specific technical approach, and a measurable or describable result. This directly implements the research finding in `02_BRAND_STRATEGY.md` §5 — a handful of real, specific case studies outperforms a high-volume portfolio grid, and is the most defensible cure for the "nothing, except pricing" differentiation gap (`01` §4).

**Case study template (required fields, enforced by the CMS schema — see `09_CMS_ARCHITECTURE.md`):**
- Client name (or honest anonymization, e.g. "a regional retail brand," if NDA'd — never a fabricated name)
- Industry / project type
- Practice area tag: Software, Hardware & Embedded, or Both
- Problem (1-2 paragraphs, specific)
- Approach (what was actually built/decided, named technologies, real constraints)
- Result (a number where one exists; an honest qualitative outcome where it doesn't — never a vague "they were thrilled")
- Ongoing relationship note (maintenance, follow-on work) where applicable — this is the "accountability" differentiator made concrete (`02` §6)
- Optional: client quote, attributed with a real name and title — never unattributed

## 3. Testimonial and social-proof policy

Zero tolerance for fabricated testimonials. The legacy site's "Sarah Johnson, Tech Entrepreneur" and "David Smith, E-commerce Owner" (`ARCHIVED_PROJECT_ANALYSIS.md` §4.6, flagged as placeholder names in §16 problem #20) do not carry forward in any form. **[Objective practice]** — fabricated social proof is a discoverable, reputational liability the moment any visitor searches the name; it actively works against the trust-building goal stated in the operating mandate. If real testimonials don't yet exist for a given page at launch, the section is omitted, not filled with placeholders. The CMS testimonial schema requires a real name, title, and (optional but encouraged) company — anonymous or unattributed testimonials are not accepted into the content model at all.

Inflated/unverifiable stats (legacy: "100% Satisfaction Guaranteed," "~12 Teammates," "24/7 Availability" — `ARCHIVED_PROJECT_ANALYSIS.md` §6) are replaced with either a real, current number pulled from CMS-managed data (e.g. actual case-study count, actual years operating) or omitted. No invented round numbers.

## 4. Voice and tone rules (content production checklist)

Every piece of public-facing copy is checked against:
1. Does this sentence pass the "could a competitor say this exact sentence" test (`02_BRAND_STRATEGY.md` §2)? If yes, rewrite with a specific.
2. Is any claim here unverifiable? If yes, cut or substantiate it.
3. Does this page make the core claim ("software and the hardware it runs on," accountability) more or less believable?
4. Is this "community/family" language in a client-facing context? If yes, move it to Careers or cut it (`01` §9).
5. Sentence length: short, declarative, one idea per sentence (per `02` §5 research synthesis).

## 5. Blog content priorities and launch sequencing

**[Amended 2026-07-01, see `00_FOUNDER_APPROVAL.md` §3]** The original CSV-consensus reading ("maybe in the future," not a launch priority) is superseded: the full blog platform — public blog, CMS collection, unified rendering pipeline, categories, tags, SEO, search, RSS, author profiles — ships **in the MVP**, not deferred. Launch content is **3-5 high-quality cornerstone articles** demonstrating real expertise; the blog is not required to prove itself as a marketing channel on day one, but the underlying architecture must be production-ready immediately so it can become a major content/SEO asset as the company grows.

**[Founder decision]** CSV Q15: Rifaque selected Technical Tutorials, Case Studies, Company Updates, Web Development, AI & Automation (5 categories). Other respondents selected overlapping but broader or narrower sets (Iyad selected ~10 categories; Sultan and Salsabeel selected different 5-6 item mixes with partial overlap). No exact consensus exists on the full list, and per `01` §0 the founder's list is used as the v1 taxonomy since it is also the set with the most cross-respondent overlap. The CMS category taxonomy is extensible (admin-managed, not hardcoded) so additional categories (e.g. Salsabeel's embedded/electronics-specific content) can be added without an engineering change — see `09_CMS_ARCHITECTURE.md`.

## 6. FAQ content (new content type, not in legacy site)

Sourced from the actual disqualifying/qualifying questions raised across this document and `01_PRODUCT_VISION.md`: "Do you only build websites?" (no — surfaces hardware capability), "What happens after launch?" (surfaces the maintenance/accountability differentiator), "How do you decide what projects to take?" (surfaces the selectivity-as-quality-signal positioning from `02_BRAND_STRATEGY.md` §4), "What's your typical project timeline / how do we start?", and **"How much does a project cost?"** — answered with engagement types, typical complexity, and "every project is quoted individually after discovery," never a number (**[Amended 2026-07-01]**, see `00_FOUNDER_APPROVAL.md` §4). FAQs exist specifically to pre-answer the questions identified in `04_USER_JOURNEYS.md`, reducing friction before a visitor reaches Contact.

## 7. Multi-language

**[Founder decision]** CSV Q23: Rifaque "No," Salsabeel "Maybe," Sultan "Yes," Iyad "Maybe" — no consensus, founder's answer governs per `01` §0. v2 ships English-only. The CMS content model still stores text fields in a way that would not block future localization (no hardcoded strings baked into non-text assets), but no i18n routing, translation workflow, or language switcher is built for v1.
