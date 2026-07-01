# 06 — Page Specifications

> **Status: Founder Approved — 2026-07-01.** See `00_FOUNDER_APPROVAL.md` for the full decision log. Home hero (§ below), Hardware & Embedded (Labs/R&D), About (founding year, leadership), Contact (pricing framing), and Blog (MVP scope) sections were revised in that session.

> Decision convention: see `01_PRODUCT_VISION.md` §0. Each page states its **Verdict** on the legacy equivalent (Keep / Merge / Split / Replace / Remove / Rebuild) and why, per the Step 6 instruction to critically evaluate every existing page before designing its replacement.

## Home (`/`)

**Verdict: Rebuild completely.** The legacy home page (`ARCHIVED_PROJECT_ANALYSIS.md` §3.1) tries to do everything in one scroll (hero, stats, two unrelated "family guide" cards, 4 service tiles, testimonial carousel, recruiting CTA, contact CTA) and consequently establishes nothing clearly — exactly the failure mode `02_BRAND_STRATEGY.md` §5 (research principle 5) warns against. Messaging is generic, stats are unverifiable, testimonials include placeholder names (`05_CONTENT_STRATEGY.md` §3).

**Purpose:** Make the 15-second claim from `01_PRODUCT_VISION.md` §6 land, then route the visitor to proof (Work) or capability detail (Services), then to Contact.

**Sections (in order):**
1. **Hero** — **[Amended 2026-07-01, see `00_FOUNDER_APPROVAL.md` §5]** a direct, confident statement of what HubZero does and who it helps — not a one-clause slogan (register: "Building technology that solves real problems"), one-sentence subhead, primary CTA "Start a project" → `/contact`, secondary action "See our work" → `/work` (this resolves the Q9 deviation noted in `01` §9a — scroll/explore is secondary, contact is primary).
2. **Proof strip** — 1-3 real, specific facts (not inflated stats per `05` §3) — e.g. number of completed engagements, founding year, practice-area breadth. Omit any fact that isn't real and current.
3. **What we do** — two co-equal cards: Software Engineering, Hardware & Embedded Engineering — each links to its service page. This is where the CSE+ECE combined-capability claim is made explicit as a supporting differentiator (moved out of the hero per §1 above) — the structural fix for the "CSE and ECE" differentiator being buried in legacy generic service language (`01` §2).
4. **Featured case study** — one real case study, shown in enough depth to be persuasive (not a thumbnail grid) — implements research principle 6 (`02` §5).
5. **How we work** — short, 3-step description of the engagement model, ending on the accountability/maintenance differentiator (`02` §6).
6. **CTA close** — "Start a project" repeated, framed as starting a conversation, not "GET IN TOUCH 🚀."

**Explicitly removed from legacy:** testimonial carousel with placeholder names (moves to Work/case-study pages where real testimonials are attached to actual projects), "Join Hubzero Team" recruiting CTA (moves to footer + Careers), stat grid with unverifiable numbers, decorative "Hubzero Family Guide" cards (the underlying message — design and engineering quality matter — is better made by the featured case study than by two generic illustrated cards).

## Services overview (`/services`)

**Verdict: New page** (legacy had no equivalent — only four disconnected pages). Short page: states the two-practice-area structure, links to each, includes 2-3 lines on how engagements typically combine both (the actual differentiator). Exists primarily for IA clarity and SEO (a clean parent for the two real service pages).

## Services — Software Engineering (`/services/software`)

**Verdict: Merge and rebuild.** Replaces legacy `/web-development` and `/ui-ux` (`ARCHIVED_PROJECT_ANALYSIS.md` §3.10), which were shallow, near-identical 2-column bullet-list pages with no real differentiation from each other. UI/UX becomes a sub-capability within this page rather than a competing nav destination — it is part of how software gets built, not a separate service.

**Sections:** what's included (web apps, backend, AI/automation, UI/UX as integrated capability — pulling Sultan's "backend with AI" and Iyad's design/UI-UX strengths from CSV Q4/Q33 into real content rather than generic bullets), how engagements typically run, relevant case study links (filtered to "Software" tag), CTA.

## Services — Hardware & Embedded Engineering (`/services/hardware`)

**Verdict: New page, replaces nothing** (legacy had zero equivalent — ECE/electronics work was entirely absent from the legacy service pages despite being core to the founder's own description of the company, `01` §1). This page is structurally as important as the software page, not a footnote, per the differentiation strategy in `02_BRAND_STRATEGY.md` §6. Content should draw directly on Salsabeel's stated domain (CSV Q33-34: embedded and VLSI domain, IoT) since she is the team's actual electronics expertise.

**Sections:** what's included (embedded systems, IoT integration, hardware-software bridging), why this matters for businesses that don't realize they need it (`04_USER_JOURNEYS.md` §2), relevant case studies (filtered to "Hardware" or "Both"), **Labs / R&D** (internal or personal embedded/IoT projects, clearly labeled non-client — the interim proof mechanism approved 2026-07-01 for launching this page credibly before a real client hardware case study exists, see `00_FOUNDER_APPROVAL.md` §2), CTA.

## Service pages — Branding, SEO (legacy `/branding`, `/seo`)

**Verdict: Merge into Software Engineering as listed capabilities, remove as standalone pages.** Branding and SEO are not independent practice areas at HubZero's scale (4-5 person team) — having four separate, shallow service pages dilutes nav weight and makes the company look broader-but-thinner than it is. Both become a bullet inside the Software Engineering page ("includes: SEO, brand application") rather than their own destination. **[Objective practice]** — this directly serves the research principle that a short, focused nav with deep pages beats many shallow pages (`02` §5).

## Work — index (`/work`)

**Verdict: Keep the concept, rebuild the execution.** Legacy `/work` (`ARCHIVED_PROJECT_ANALYSIS.md` §3.5) had exactly one active case study with two more commented out in the source code — a half-finished page presented as complete. v2's Work index is a real, CMS-backed, filterable (by practice area) grid that gracefully supports 1 case study or 100 (`03_INFORMATION_ARCHITECTURE.md` §6, founder's growth target).

**Sections:** intro line (selectivity framing — "every project here was worth doing," operationalizing the "only major projects" policy from `05` §2 as a stated value, not a hidden curation rule), filter by practice area, case study cards (client, one-line result, practice-area tag), CTA to start a project.

## Work — case study detail (`/work/[slug]`)

**Verdict: Rebuild from a single hardcoded example into a real template.** Legacy had one hand-built page (`bhatkaltimeluxe/page.tsx`) with no template behind it — adding a second case study meant writing another full page from scratch. v2 uses the CMS schema defined in `05_CONTENT_STRATEGY.md` §2 to render any case study from structured content, no code change required to add one.

**Sections:** hero (client, project type, practice-area tag), problem, approach (with real tech/architecture specifics — research principle 2, "show the system"), result (metric or honest qualitative outcome), optional client quote (real, attributed), ongoing relationship note, related case studies, CTA.

## About (`/about`)

**Verdict: Merge and rebuild.** Legacy `/about` (`ARCHIVED_PROJECT_ANALYSIS.md` §3.2) has a factual inconsistency worth fixing on its own (page says "Founded in 2024," home page stats say "Since 2023" — **[Founder decision, confirmed 2026-07-01]**: **2024 is correct**, used consistently everywhere — see `00_FOUNDER_APPROVAL.md` §2). Generic "What We Do" cards are removed (now covered properly by `/services`). Core Values section is kept but should draw on the real, consistent internal voice found in CSV Q40-59 (commitment, consistency, trust) rather than generic "Collaboration/Excellence/Innovation" emoji cards.

**Sections:** founding story (real, specific — grounded in the actual CSV answer about starting as a small group with shared ambition, told honestly rather than inflated; **[Amended 2026-07-01]** presented as a **Founder + co-founders** leadership structure rather than a single-founder narrative, see `00_FOUNDER_APPROVAL.md` §2), values (real, sourced from internal culture data), current legal status stated accurately (unregistered engineering organization, registration planned once revenue is consistent — `01_PRODUCT_VISION.md` §2a), link to Team, CTA.

## Team (`/team`)

**Verdict: Rebuild as Server Component, restrict to core members.** Legacy `/team` (`ARCHIVED_PROJECT_ANALYSIS.md` §3.4, §7.3) client-fetches JSON with no loading state and has two contradictory data sources (`src/data/team.json` orphaned vs `public/data/team.json` active — §10 of the legacy analysis). v2 is server-rendered from the CMS, single source of truth, and shows **[Consensus]** core members only (`01_PRODUCT_VISION.md` §9). Each card links to `/team/[username]` for those who have a profile.

## Team — individual profile (`/team/[username]`)

**Verdict: Keep the concept, demote in IA, simplify in execution.** The legacy `PortfolioClient.tsx` (852 lines, `ARCHIVED_PROJECT_ANALYSIS.md` §4.9, §14) is feature-rich (experience, education, skills, project filtering, command terminal easter egg) but oversized for a secondary page and not necessary to rebuild at the same scope for v1. v2 keeps a simplified version: bio, role, skills, 2-3 highlighted projects, contact/social links. The command-terminal easter egg can be preserved as personality (it's a genuinely distinctive, well-built feature — `ARCHIVED_PROJECT_ANALYSIS.md` §4.10) but is not part of the primary conversion path and should not block or distract from a recruiter or client skimming the page; if kept, it must use the corrected, data-derived username list rather than the legacy hardcoded list that included non-existent users (`ARCHIVED_PROJECT_ANALYSIS.md` §16, bug #4).

## Contact (`/contact`)

**Verdict: Keep, substantially upgrade.** Legacy contact (`ARCHIVED_PROJECT_ANALYSIS.md` §3.3, §7.7) is a 3-field form (name/email/message) posted to Formspree with `_captcha: false` (a confirmed security/spam issue, §16 bug #7) and no structure to filter project intent.

**v2 fields:** Name, Email, Company (optional), Project type (Software / Hardware & Embedded / Both — directly captures the differentiator at the point of conversion), Budget range (optional but encouraged — operationalizes the founder's "good pay" qualifying criterion from `01` §3 without being confrontational about it), Message. Spam protection enabled (real captcha or equivalent — fixing the disabled-captcha bug is **[Objective practice]**, not a preference). Submission triggers a Server Action (`08_TECHNICAL_ARCHITECTURE.md`) that stores the lead in the database and notifies the team — replacing blind dependence on a third-party form service for the primary lead-capture mechanism, while still allowed to use a transactional email provider for the notification itself.

Just above the form, a short line sets pricing expectations without a number — the kinds of engagements HubZero takes, typical project complexity, and "every project is quoted individually after discovery" (**[Amended 2026-07-01]**, see `00_FOUNDER_APPROVAL.md` §4). No newsletter/email-capture field is included in the MVP — the only conversion goal at launch is a qualified project inquiry, not list growth (`00_FOUNDER_APPROVAL.md` §4).

## Blog — index and post (`/blog`, `/blog/[slug]`)

**Verdict: Keep the destination, fully rebuild the infrastructure — and ship it in the MVP, not deferred.** **[Amended 2026-07-01, supersedes the original "maybe in the future" sequencing — see `00_FOUNDER_APPROVAL.md` §3]** The full blog platform (index, post template, categories, tags, SEO, search, RSS, author profiles) ships at launch, with 3-5 cornerstone articles as initial content — the blog does not need to prove itself as a marketing channel first, but the architecture must be production-ready immediately. Fixes carried in from the legacy bug list: unify the markdown pipeline so published posts render identically to editor previews (legacy used two different pipelines — plain `remark-html` for published posts vs. full remark/rehype with syntax highlighting in the editor preview, `ARCHIVED_PROJECT_ANALYSIS.md` §16 problem #9), remove the leftover `console.log` debug statement (§16 problem #5), and replace the Monaco-editor-plus-file-download authoring workflow entirely with the CMS (`09_CMS_ARCHITECTURE.md`).

## Careers (`/careers`)

**Verdict: New page** (legacy had no dedicated recruiting page — recruiting was a vague CTA embedded in the home page). Per `04_USER_JOURNEYS.md` §4, this is where HubZero's community/culture voice belongs. Sections: what it's like to work at HubZero (grounded in real CSV culture answers), open roles (CMS-managed, can be empty), how to apply, link to Team.

## Privacy (`/privacy`) and Terms (`/terms`)

**Verdict: Keep Privacy, fix factual contradiction; add Terms (new).** Legacy Privacy Policy (`ARCHIVED_PROJECT_ANALYSIS.md` §3.12) states "we currently do not use tracking cookies" while the site runs Vercel Analytics (§16 problem, implied by §7.17's note) — **[Objective practice]**, this must be corrected to be factually accurate regardless of which analytics tool v2 ultimately uses (`13_SEO_STRATEGY.md` covers analytics choice). Terms of use did not exist in the legacy site and should, given the contact form now collects more structured business information (project type, budget).

## 404 (`not-found`)

**Verdict: Keep concept, fix implementation.** Legacy (`ARCHIVED_PROJECT_ANALYSIS.md` §3.14) sets `document.title` via `useEffect` instead of static metadata, and hardcodes `bg-black text-white` instead of using the design-token theme (§16 problems #15, #18 area) — both are **[Objective practice]** fixes (App Router `metadata` export is the correct primitive; hardcoded colors break theming). Content (two clear actions: home, contact) is fine and is kept.
