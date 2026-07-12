> **⚠️ ARCHIVED — historical reference only, not implementation guidance.** This document described the public marketing website under the design direction that was reset. It is preserved for historical context. Do not use it to guide the new design (see `DESIGN/NEXT`). See `ARCHIVE/README.md`.

# 04 — User Journeys

> **Status: Founder Approved — 2026-07-01; amended 2026-07-04.** See `00_FOUNDER_APPROVAL.md` §4 for the pricing-guidance resolution incorporated in §2 below. Client portal deferral (§3) reconfirmed unchanged. §4 and §5 below extended 2026-07-04 to reference Builds and Labs, per `00_FOUNDER_APPROVAL.md` §8.

> Decision convention: see `01_PRODUCT_VISION.md` §0.

## 1. Potential client — Established brand (web + SEO + maintenance)

**Profile:** Marketing lead or owner at a growing business; has budget; has likely been burned by a freelancer or low-effort agency before; evaluates 2-4 vendors.

**Goals:** Confirm HubZero can be trusted with production work; understand what a maintenance relationship looks like; see evidence, not promises.

**Questions, in order:** What do you actually build? → Have you done this before, for someone like me? → What happens after launch? → How do I start?

**Journey:** Home (hero claim + one strong proof point) → Work (scans case studies for a relevant industry/scope match) → opens one case study (reads problem → approach → result, checks for specificity) → Services/Software (confirms maintenance/ongoing-support is a real offering, not an afterthought) → Contact (submits a scoped project intake, not a bare "send a message" box).

**Required pages:** Home, Work index + detail, Services (software), Contact.
**Conversion path:** Contact form with project-type and budget-range fields (see `06_PAGE_SPECIFICATIONS.md` §Contact) — **[Founder decision]**: CSV Q5 has Rifaque explicitly refusing clients who won't offer "good pay" or clear ownership; a structured intake that asks for budget range and project clarity upfront directly operationalizes that refusal criterion rather than discovering it three emails into a thread.

## 2. Potential client — Startup/SMB with a hardware-adjacent need

**Profile:** Founder or small-business owner; may not have language for "embedded" or "IoT"; often doesn't know if their problem is hardware, software, or both.

**Goals:** Find out, in plain language, whether HubZero can help with something that isn't purely a website.

**Questions, in order:** Do you do more than websites? → What does "hardware + software" actually mean for my product? → Is this affordable for a small business? **[Amended 2026-07-01]** — answered not with a number, but with clear guidance on the kinds of engagements HubZero takes, typical project complexity, and that every project is quoted individually after discovery, so the visitor can self-qualify without HubZero publishing rate cards (see `00_FOUNDER_APPROVAL.md` §4, `02_BRAND_STRATEGY.md` §6).

**Journey:** Home (hero claim must surface the CSE+ECE combination immediately, not bury it) → Services (sees Hardware & Embedded as a co-equal page, not a footnote) → Work (looks for any embedded/IoT-flavored case study) → Contact.

**Required pages:** Home (with explicit hardware mention), Services (hardware), Work, Contact.
**Note:** Until a real embedded case study exists, the Hardware & Embedded service page must still read as credible on its own (real capability description, real process, Salsabeel's domain expertise referenced) rather than leaving the page thin until "someday" — see `05_CONTENT_STRATEGY.md`.

## 3. Existing client

**Profile:** Already engaged HubZero; needs to request a change, ask about maintenance, or extend scope.

**Journey:** Direct link (bookmark, email signature) → Contact, or a future authenticated client area (not in v1 scope — see `14_IMPLEMENTATION_ROADMAP.md`).
**v1 scope:** Existing clients are served by the same Contact page as new clients, distinguished by a "returning client" option in the intake that routes to a faster-response path (e.g. different notification priority in the admin panel — `12_ADMIN_PANEL_SPECIFICATION.md`). A dedicated client portal is explicitly **out of scope for v1** — CSV does not surface a strong demand for it, and building authenticated client-facing infrastructure before the marketing site itself proves out lead generation would be premature investment.

## 4. Potential recruit

**Profile:** CSE/ECE student or early-career engineer/designer considering joining HubZero.

**Goals:** Understand if this is a real opportunity or vague volunteer work; see who's already there; understand the commitment expected.

**Journey:** `/careers` (or a shared individual portfolio link from a current member) → Team (sees real people, real roles) → Careers detail (what roles are open, what's expected, how to apply). **[Amended 2026-07-04]** A recruit evaluating whether real engineering exploration happens here, not just client delivery, may also check `/labs` — added as a secondary, optional stop, not a required one.

**Required pages:** Careers, Team.
**Tone note:** This is the one journey where HubZero's "community/team-building" register (downplayed everywhere else per `01_PRODUCT_VISION.md` §9) is appropriate — Careers can speak to culture, growth, and shared ownership, because CSV §26-59 (the back half of the survey) shows this language genuinely matters internally (commitment, trust, "a leader with supporting members," consistency over talent). **[Consensus]** — every respondent answered the team-culture questions (Q40-59) substantively and consistently around commitment/consistency/trust, unlike the front-half business questions where they diverged — Careers content should draw on this real, consistent internal voice.

## 5. Partner / collaborator

**Profile:** A larger agency or company considering subcontracting work to HubZero (e.g. the embedded/hardware piece of a project they can't do in-house), or a potential business partner.

**Journey:** About (assesses scale/credibility) → Work (assesses capability breadth) → Builds / Labs (assesses whether HubZero builds its own things, not just client work — does it have real engineering range beyond what a client happens to ask for?) → Contact.
**Required pages:** About, Work, Contact. **[Amended 2026-07-04]** Builds and Labs added as required stops for this journey specifically — capability breadth is exactly what a partner evaluating a subcontracting relationship needs to assess, and Builds/Labs are the two pillars that demonstrate it beyond client-scoped work. No dedicated partner page in v1 — the volume doesn't justify it yet; revisit if/when partner-sourced leads become a measurable channel.

## 6. Internal team member (CMS user)

**Profile:** Founder, core team, content/marketing team member who needs to publish a case study, note, or update team/testimonial content without a developer rebuilding and redeploying the site — directly replacing the legacy "write markdown in Monaco, download, email Rifaque" workflow (`ARCHIVED_PROJECT_ANALYSIS.md` §3.9, §9.6).

**Journey:** `/studio` login → role-appropriate dashboard → create/edit content → submit for review (if their role requires approval) or publish directly (if not) → content goes live without a deploy.

**Required system:** Authenticated admin panel with role-based access — see `12_ADMIN_PANEL_SPECIFICATION.md`. **[Founder decision]** on role breadth: CSV Q16 shows Rifaque selecting the broadest set of admin-panel user roles (Founder, Core Team, Design, Developers, Content, Marketing, PM) while other respondents selected narrower sets (Salsabeel: Core Team only; Sultan: Founder + Core Team). Per §0, this is followed as the founder's call on team process — **[Consensus]** Q19 already agrees broadly that role-based access and content approval should exist regardless of how many roles are admitted, so the broad-roles decision is implemented *with* mandatory role-based permissioning and a content-approval workflow rather than open access for everyone — satisfying both the founder's breadth preference and the team's consensus desire for guardrails.
