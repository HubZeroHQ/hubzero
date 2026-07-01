# 00 — Founder Approval & Decision Log

> Status: **Founder Approved — 2026-07-01.** This document is the authoritative record of the founder-approval session that resolved every remaining open decision across `01`–`14`. Where this log conflicts with earlier prose in those documents (particularly around CMS role model, blog sequencing, hero copy, and growth-target rigidity), **this log wins** — the other documents have been updated to match, but this is the source of truth for *why*.

## How to read this document

Each decision below states the question, the founder's answer (Rifaque, verbatim intent preserved), and which documents were updated as a result. This supersedes the `01_PRODUCT_VISION.md` §0 decision method (Consensus / Founder decision / Objective practice) for anything explicitly re-decided here — those tags remain accurate for decisions *not* revisited in this session.

## 1. Business foundation & timeline

- **Legal entity status:** HubZero is currently an **unregistered engineering organization**. Registration (Pvt Ltd or LLP) is planned once the company reaches consistent client revenue. The site must accurately represent current status — no implied "Inc.," registration number, or legal-entity language until it's real — while the architecture (contracts, invoicing copy, Terms of Use) is written so upgrading to a registered entity later requires no restructuring. *(Updated: `01`, `06` About/Terms, `10`)*
- **Target market:** Primary target is **English-speaking global clients**. Initial business development is India-based, but the site must not read as an India-only agency — no region-locked SEO framing, no INR-only pricing language. *(Updated: `01`, `13`)*
- **Launch deadline:** **Hard 3-month deadline** for a production-ready v2, delivered via **milestone-based rolling releases** — not one big-bang ship. Core, expensive-to-retrofit infrastructure (custom CMS, auth, RBAC foundation, version history, database architecture, the public marketing site) must be done before launch. Feature-rich but non-essential capability (advanced blog search, RSS, recommendation engine, advanced analytics, editorial tooling) can ship in fast-follow releases after the 3-month mark. Production quality is non-negotiable for anything that does ship. *(Updated: `14`)*
- **Who builds it:** **Rifaque, solo.** No team-distributed build, no hired help assumed for v1. This is the single biggest constraint on scope decisions below. *(Updated: `14`)*

## 2. Differentiation & proof

- **Hardware & Embedded page with no client case study yet:** Add a **"Labs / R&D" section** — internal or personal embedded/IoT projects, clearly labeled as non-client work — as interim credibility proof until a real hardware client case study exists. This is a new content type, not a workaround. *(Updated: `05`, `06`, `09`, `11`, `12`)*
- **Case study bar for launch:** **One real case study (Bhatkal Time Luxe) is enough** to launch the premium positioning on. Do not delay launch waiting for more. *(Confirms `05` §2, `14` Phase 3 as already written — no change needed.)*
- **Founding year:** **2024** is correct, resolving the legacy 2023/2024 contradiction. Use 2024 everywhere. *(Updated: `06` About, `11` seed data)*
- **Leadership structure:** **Founder + co-founders** — a small leadership team with defined titles, not a single-founder narrative. *(Updated: `06` About/Team, `03`)*

## 3. CMS scope, roles, and build approach

- **Role model — replaced entirely.** The department-based 7-role model (Founder, Core Team, Design, Developers, Content, Marketing, PM) is **rejected**. Department membership is metadata, not a permission source. Replaced with a **responsibility-based RBAC**:
  - **Head Admin (Founder):** unrestricted platform access — users, roles, permissions, site/CMS/nav/SEO settings, media library, all company + individual content, all blogs, approval, publishing, analytics, contact submissions, feature flags. Cannot be modified by other users.
  - **Admin (Core Team):** manages company content (pages, services, portfolio, all blog posts, media, testimonials, careers, contact info, content SEO), can approve blog drafts, but cannot manage users/roles/permissions/system settings or edit another user's individual portfolio (can edit only their own).
  - **Teammate (default):** manages own profile/portfolio, creates and edits own blog drafts, submits for approval, uploads personal media. Cannot publish directly (unless granted), cannot edit company content or another user's content.
  - **Dynamic permissions, not roles** — e.g. **Team Lead** is an assignable/removable permission layered on top of any primary role (create projects, assign members, track progress, manage project files/discussions, view project analytics, close projects). The permission system must support adding future dynamic permissions (Blog Reviewer, Recruiter, HR, Finance, Sales, Client Manager, Moderator, Support, Event Manager) without redesigning the architecture.
  *(Updated: `09`, `11`, `12` — full rewrite of the role sections)*
- **Workflow scope for MVP:** **Hybrid workflow, shipped in full for MVP** (not deferred): every content type supports Draft/Published states. Company-wide content (pages, services, portfolio, nav, SEO, settings) requires Admin/Head Admin approval before publishing. Teammates can create/edit their own blog and portfolio drafts but cannot publish directly. Admins can publish and manage all content. **Version history is built from day one for all content types** — treated as fundamental infrastructure, not an optional/deferred feature. Scheduled publishing, multi-stage approval, comments, and collaborative editing are explicitly deferred to later iterations. *(Updated: `09`, `11`, `12`, `14`)*
- **CMS build approach — custom, not a configured third-party CMS.** Build a fully custom CMS/admin platform on Next.js App Router + MongoDB. Reuse mature libraries for generic infrastructure only (auth, rich-text editor, uploads, validation) — all business logic, workflows, dashboards, permissions, and content management are hand-built around HubZero's specific model. This is explicitly a long-term internal platform, not a configured Payload/Sanity instance. The earlier framing in `09_CMS_ARCHITECTURE.md` §1 (Payload as the presumed engine) is **superseded**. *(Updated: `08`, `09`)*
- **Blog scope for MVP — ships in full, not deferred.** Reverses the CSV-consensus "maybe someday" sequencing: the complete blog platform (public blog, CMS, unified rendering pipeline, categories, tags, SEO, search, RSS, author profiles) ships in the MVP. Launch content is 3-5 high-quality cornerstone articles demonstrating real expertise — the blog is not required to be a proven marketing channel from day one, but the architecture must be production-ready immediately. *(Updated: `05` §5, `06` Blog, `10`, `14` Phase 4 — moved from "deferred infra, deferred content" to "MVP-scope infra and content")*

## 4. Pricing & lead handling

- **Pricing signal:** **Pricing guidance without fixed prices.** Clearly communicate the kinds of engagements taken on, expected project complexity, and that every project is quoted individually after discovery — this lets prospects self-qualify without HubZero locking into public pricing. Packaged services or indicative ranges may be introduced later as HubZero matures. *(Updated: `02` §4, `05` §6 FAQ content, `06` Services/Contact)*
- **Lead nurture / email capture:** **Skip for MVP.** No newsletter or generic email capture. The MVP's only conversion goal is qualified project inquiries through the contact/discovery form — prioritize lead quality over list growth. The architecture should remain extensible so nurture mechanisms (newsletter, engineering insights, downloadable resources, webinars) can be added once there's a consistent content strategy and audience. *(Confirms `10` roadmap sequencing — no structural change, noted explicitly as a deliberate MVP omission.)*
- **Data retention & backup policy:** **Defined now, not deferred.** Automatic backups (daily incremental + periodic full), periodically tested restoration, retention limited to legitimate business purposes with deletion on request, media/CMS content included in backups, no unnecessary storage of sensitive data, passwords always securely hashed, access restricted via the RBAC model above. Policy is simple, documented, and scalable. *(New: `08` §9, `11` §7 — added sections)*

## 5. Homepage / hero direction

- **Rejects all three tagline candidates previously proposed in `02_BRAND_STRATEGY.md` §7.** The homepage hero should **not** be a clever slogan. It must immediately communicate what HubZero does, who it helps, and why clients should trust the team — direct, confident, outcome-focused, not agency-voice or over-technical. Register example: **"Building technology that solves real problems."**
- **The CSE+ECE combined-capability claim moves down the page as a supporting differentiator, not the primary headline.** This is a real reversal of `01_PRODUCT_VISION.md` §2/§6 and `02_BRAND_STRATEGY.md` §6-7, which treated "software and the hardware it runs on" as the headline claim itself. *(Updated: `01` §6-7, `02` §6-7, `06` Home hero)*

## 6. Scalability & future roadmap

- **Growth target:** No longer locked to a firm "100+ projects" number — **design for flexibility** regardless of whether real volume lands at 10 or 200. *(Updated: `03` §6)*
- **Client portal:** Confirmed still **deferred** past v1, unchanged from the original spec.
- **Practice areas:** Software Engineering (CSE) and Hardware & Embedded (ECE) remain the **launch focus and primary IA structure**, but the IA/CMS must be built so additional practice-area verticals (e.g. AI/ML, Cloud & DevOps, Cybersecurity, Robotics, IoT, Product Design) can be added later **without structural redesign** — new verticals only if they naturally extend HubZero's engineering identity, never forced under the existing two categories. *(Updated: `03` §1, `09` Services collection)*

## 7. Founder Approval Status

All 14 architecture documents (`01`–`14`) are marked **Founder Approved** as of **2026-07-01**, incorporating the decisions in this log. Any future re-opening of a decision recorded here should be logged as an amendment to this file, not a silent edit to the original document.
