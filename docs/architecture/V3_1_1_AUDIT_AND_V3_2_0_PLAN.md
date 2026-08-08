# HubZero v3.1.1 Audit and v3.2.0 Plan

**Status:** Internal engineering audit  
**Audit date:** 2 August 2026  
**Audited release:** v3.1.0  
**Audited branch and revision:** `main` at `329d086`  
**Audience:** HubZero engineering and product

---

## 1. Executive verdict

HubZero v3.1.0 is a credible small-team CMS with an unusually strong public presentation layer. It is not yet a mature production CMS platform.

The public site is the best part of the product. Its information architecture is coherent, its visual hierarchy is strong, its accessibility baseline is good, its structured data is substantive, and its empty states are honest. Studio also has more real capability than its size suggests: status workflows, Draft Mode preview, Featured Order, document editing, relationship health, content health, media usage and replacement, activity, entry history, search, a command palette, AI authoring, user administration, leads, candidates, services, and careers all exist.

The weaknesses are beneath and between those surfaces:

- A document-role switch can discard pending edits.
- Service and taxonomy mutations do not fully invalidate public caches, so an editor can save or publish successfully while the public site remains stale.
- The dashboard contains links that are factually wrong or unnecessarily indirect.
- Studio and public repository work repeatedly rebuild the same content and relationship graph. The production database contains only about 197 documents, yet several Studio routes visibly take 1.5–2.2 seconds to become useful.
- Some public collection routes are accidentally dynamic and cross from the Bombay edge to an IAD function, while equivalent prerendered routes are served from cache in roughly half the time.
- Images are transformed by Cloudinary and then optimized again by Vercel.
- There is no CI, no browser-level regression suite, no automated accessibility regression suite, and almost no production observability.
- Canonical planning documents contradict both the product and each other.

The application is currently viable because its data set is tiny, its editorial team is small, and its warm public caches hide expensive work. None of those should be treated as architectural guarantees.

### Release recommendation

Do not start broad v3.2 feature development until the two Critical defects and the first eight v3.1.1 candidates in this document are closed. v3.1.1 should be a correctness, latency, accessibility, and reliability release. v3.2 should then add collaboration and publishing capabilities on top of a query and observability foundation that can support them.

### Severity summary

| Severity | Count | Interpretation |
|---|---:|---|
| Critical | 2 | Confirmed data-loss or publication-correctness defects |
| High | 20 | Material workflow, security, latency, accessibility, or operational risk |
| Medium | 23 | Important friction or debt that will compound with use |
| Low | 9 | Real polish or diagnostic gaps with limited immediate harm |

No evidence of a current production outage, authorization bypass, stored-XSS path, or corrupt MongoDB records was found. That is not the same as proving their absence; this audit was read-only and did not perform destructive security testing.

---

## 2. Scope, method, and limitations

### What was inspected

- The repository contract, design system, current-stage log, CMS design documents, public information architecture, public data layer, editor-state ADR, release record, and operations documentation.
- All major Studio surfaces using the authenticated production application:
  - Dashboard
  - Work, Builds, Blueprints, Labs, Notes, Careers, Services, Team, and Engineering Profiles
  - Editors and Documents
  - Review workflow and Featured Order
  - Relationships and Health
  - Search and Command Palette
  - Activity and Entry History
  - Media
  - Leads and candidates
  - Settings, authentication, and user management
- All major public surfaces at desktop and mobile widths:
  - Homepage
  - Collection indexes and entry details
  - Navigation and footer
  - Search and discovery
  - Contact, careers, and empty states
  - Metadata, JSON-LD, sitemap, and robots
- The production build, client chunks, route rendering modes, response headers, selected request timings, image requests, MongoDB collection sizes and indexes, and repository/query implementation.
- Linting, type checking, unit/integration tests, format checking, dependency audit, and dependency currency.

### Verification performed

| Check | Result |
|---|---|
| `npm run build` | Passed in about 65 seconds |
| `npm run lint` | Passed in about 14.4 seconds |
| `npm run typecheck` | Passed in about 3.9 seconds |
| `npm test -- --run` | 89 files and 698 tests passed in about 3.1 seconds |
| `npm run format:check` | Failed across roughly 600 files on this Windows checkout |
| `npm audit --omit=dev` | One moderate `sanitize-html` advisory |
| Production sitemap | All 31 listed URLs returned HTTP 200 |
| Lighthouse mobile | Homepage 96 performance / 100 accessibility / 100 SEO; sampled dynamic pages 89–97 performance / 100 accessibility / 92 SEO |

The format failure is not 600 independent formatting defects. Git stores the files with LF, this checkout uses `core.autocrlf=true`, no `.gitattributes` defines repository line endings, and Prettier is enforcing LF. The same tree passes with `--end-of-line auto`.

### Production measurements

Measurements are point-in-time observations, not a load test:

| Route | Rendering/cache observation | HTML bytes | TTFB | Total |
|---|---|---:|---:|---:|
| `/` | Prerendered, Vercel cache hit | 99,879 | 0.216 s | 0.265 s |
| `/work` | Dynamic, private, cache miss | 36,553 | 0.449 s | 0.479 s |
| `/blueprints` | Dynamic, private, cache miss | 136,228 | 0.419 s | 0.515 s |
| Blueprint detail | Prerendered, cache hit | 98,360 | 0.196 s | 0.276 s |
| `/engineering` | Prerendered, cache hit | 82,655 | 0.198 s | 0.239 s |
| `/about` | Prerendered, cache hit | 110,030 | 0.193 s | 0.273 s |
| `/search` | Dynamic, private, cache miss | 55,169 | 0.442 s | 0.488 s |
| `/contact` | Forced dynamic | 35,080 | 0.526 s | 0.558 s |

The same production build under a warm local `next start` returned the homepage in roughly 3–5 ms, Blueprints in 14–39 ms, Search in 10–12 ms, and Studio login in 11–12 ms. This gap is deployment topology, network, connection, and cache behavior, not evidence that the compiled application is intrinsically slow.

Production response identifiers showed requests entering at `bom1` and dynamic function work reaching `iad1`. The Vercel project configuration and Atlas console were not available, so the exact cold-start rate and database region could not be proven. Region mismatch is a strong, evidence-backed hypothesis, not a completed root-cause attribution.

### Database scale observed

Production is still extremely small:

| Collection | Approximate documents |
|---|---:|
| Blueprints | 10 |
| Builds | 1 |
| Work | 1 |
| Labs | 1 |
| Engineering profiles | 5 |
| Team | 5 |
| Media | 54 |
| Documents | 52 |
| Document versions | 6 |
| Taxonomy | 23 |
| Editorial events | 18 |
| Users | 5 |

The total across inspected collections was roughly 197 documents. Slow routes at this scale are architectural signals, not capacity pressure.

### Limitations

- No production records were created, edited, published, replaced, or deleted.
- No brute-force, spam, concurrency, or destructive security testing was performed.
- No Vercel function traces, Fluid Compute metrics, cache analytics, or Atlas profiler output was available.
- No sustained load test was performed.
- Lighthouse results are synthetic mobile runs from one location and should not be confused with field Core Web Vitals.

---

## 3. Existing capabilities verified

The following already exist and are not feature recommendations in this audit:

- Five-state editorial status workflow with rejection notes for the primary content collections.
- Draft Mode preview for unpublished content.
- Featured Order for Work, Builds, Blueprints, Labs, and Notes, including keyboard controls and eligibility explanations.
- Block-based Documents, multi-role Documents, autosave, manual save, and local undo/redo.
- Entry History and a global Activity feed.
- Relationship modeling, a public Evidence Graph, and a Studio relationship-health scanner.
- Content Health and per-entry health inspection for the five primary editorial collections.
- Public and Studio search.
- A Studio command palette with keyboard navigation.
- Media folders, filtering, sorting, pagination, usage reporting, global replacement, deletion safeguards, and metadata editing.
- Leads, career-interest candidates, Services, Careers, Team, Engineering Profiles, and user management.
- AI document/block generation and transformation.
- Sitemap, robots, canonical URLs, Open Graph metadata, and JSON-LD.

Suggestions below extend or repair those capabilities. They do not rename an existing feature as a roadmap item.

### Effort scale

| Label | Expected effort |
|---|---|
| XS | Less than half a day |
| S | 0.5–2 engineering days |
| M | 3–5 engineering days |
| L | 1–2 engineering weeks |
| XL | More than 2 engineering weeks |

Effort is implementation plus targeted tests, not elapsed calendar time.

---

## 4. Phase 1 — Functional Studio audit

### Critical

#### ST-C1 — Switching Document roles can discard pending edits

**Issue.** `DocumentRoleTabs` replaces the active `BlockEditor` with a keyed instance when a tab is clicked (`src/components/documents/DocumentRoleTabs.tsx:78` and `:91`). The component documentation explicitly says the old editor is fully unmounted. A pending debounced autosave, undo history, and unsaved local state disappear with it. The global dirty guard protects route navigation, not intra-page unmount. The same limitation is already admitted in `docs/architecture/ADR_EDITOR_STATE.md:60`.

**Why it matters.** This is a user-triggered content-loss path in the primary authoring interface. It only needs an editor to type and switch from Case Study to Technical before the debounce completes. A CMS cannot classify preventable edit loss as polish.

**Proposed solution.**

1. Give `BlockEditor` an imperative `flush()`/`canLeave()` contract or lift role state into a persistent parent store.
2. On role change, flush and await the current save. If it fails, keep the current role active and announce the error.
3. Keep role editor state mounted or cache each role's blocks and undo stack rather than recreating from stale `initialBlocks`.
4. Add a browser test that types, switches roles immediately, reloads, and verifies persistence.

**Difficulty:** M  
**Expected impact:** Eliminates a confirmed data-loss class for Builds and Labs; materially increases editor trust.

### High

#### ST-H1 — Dashboard publishing totals link to the wrong collection

**Issue.** The Publishing widget aggregates status counts across Work, Builds, Blueprints, Labs, Notes, and Engineering Profiles, but every status link points to `/studio/content/work?status=...` (`src/components/studio/dashboard/PublishingSummary.tsx:17-20`). Production showed 18 published entries; the linked Work list contained one.

**Why it matters.** The dashboard states one fact and sends the editor to a different fact. This is worse than an absent link because it undermines confidence in the dashboard's numbers.

**Proposed solution.** Add a real cross-collection content view with the selected status, or make the totals non-links and provide per-collection drill-down. For v3.1.1, the smallest honest fix is a dedicated filtered “All content” route backed by the existing summary projection.

**Difficulty:** S  
**Expected impact:** Removes a reproducible navigation defect and turns the Publishing widget into a useful operational view.

#### ST-H2 — Dashboard work queues discard the destination entry

**Issue.** `listAllContent()` assigns each item the collection root, not its entry detail URL (`src/lib/studio/dashboard-queries.ts:58`, `:68`, `:78`, and equivalents). Review Queue and Your Drafts therefore add a list-page detour and lose the item the editor selected. New Leads similarly links to the Leads list instead of the lead.

**Why it matters.** “What needs me?” is the dashboard's stated purpose. Every extra list and re-find step is workflow friction, especially when multiple items have similar names.

**Proposed solution.** Build canonical detail URLs in the summary query and link lead rows to `/studio/leads/[id]`. Preserve source context in a `returnTo` query parameter only if it is actually used.

**Difficulty:** XS  
**Expected impact:** Removes one avoidable navigation step from the highest-frequency dashboard workflows.

#### ST-H3 — The Studio shell produces competing scroll regions

**Issue.** The shell intends one fixed viewport with independent sidebar and main scrolling (`src/components/studio/shell/StudioShell.tsx:73` and `:91`). On long production pages, the sidebar, main content, and document root could all scroll. The Health page measured a sidebar `scrollHeight` of 952 against 826 px, a main `scrollHeight` of 2,375 against 902 px, and an HTML scroll height of 2,362 px.

**Why it matters.** Nested scroll traps are disorienting with a mouse and worse for keyboard, touchpad, zoom, and assistive-technology users. Long editors can appear to stop scrolling depending on pointer position.

**Proposed solution.** Make the Studio layout own the viewport at the route-group boundary, explicitly prevent `html/body` overflow only while Studio is mounted, use `min-height: 0` through every flex ancestor, and add a browser regression at 100%, 200% zoom, and a short viewport.

**Difficulty:** S  
**Expected impact:** Removes a recurring navigation failure on every long Studio page.

#### ST-H4 — Dense tables create several identical Tab stops per row

**Issue.** `EntryTable` wraps every cell in a link to the same target (`src/components/studio/collection/EntryTable.tsx:53-65`). A ten-row, five-column table therefore exposes 50 links rather than ten meaningful row destinations. The Users table repeats the same pattern.

**Why it matters.** This punishes keyboard and screen-reader users and makes “dense table” navigation much slower than its visual presentation suggests. It also creates repetitive link announcements with weak context.

**Proposed solution.** Keep one semantic link in the primary identity cell. If whole-row pointer click is desired, add a non-focusable row click behavior that does not create duplicate anchors. Do not use invalid nested or stretched interactive content.

**Difficulty:** S  
**Expected impact:** Cuts keyboard stops by roughly 60–80% on affected lists and improves screen-reader output without changing the visual design.

#### ST-H5 — Several successful mutations leave the current page stale

**Issue.** `LeadStatusButtons` and `GraduateToBuildButton` invoke Server Actions but do not refresh or navigate on success. The omission is recorded as known debt in `docs/architecture/EXPERIENCE_V3_PROGRESS.md:619`. The primary `StatusStepper` already has the correct refresh and recovery pattern.

**Why it matters.** An action can succeed in MongoDB while the UI continues to present the old status or action set. Editors are encouraged to click again or assume failure.

**Proposed solution.** Reuse a shared mutation-transition primitive that handles pending state, error announcement, `router.refresh()`, and optional redirect. Add interaction tests for lead status and Lab graduation.

**Difficulty:** S  
**Expected impact:** Eliminates stale-state confusion in leads and graduation workflows.

#### ST-H6 — Editorial event writes can fail silently

**Issue.** The append-only event repository catches validation/index/write failures and returns `null` without logging (`src/lib/events/repository.ts:35-36` and `:54-55`). Callers are not forced to handle the loss.

**Why it matters.** Activity and Entry History are presented as audit facts. Silent loss makes them best-effort anecdotes. The problem will be invisible until an editor needs history after an incident.

**Proposed solution.** Keep content writes available if event logging is intentionally non-blocking, but emit a structured error with entity, event type, request correlation ID, and failure reason. Add a metric and alert. For changes where auditability is mandatory, use a MongoDB transaction or outbox record.

**Difficulty:** S for visibility; L for transactional guarantees  
**Expected impact:** Makes event loss detectable immediately and establishes a path to reliable audit history.

#### ST-H7 — Authentication has no durable brute-force control

**Issue.** Credential authentication validates users and disabled accounts correctly, but there is no durable login throttling, lockout policy, MFA, or session-revocation control. Public forms also rely only on honeypot and timing checks. The AI limiter is in-process and explicitly documented as unsuitable for multi-instance deployment (`src/lib/ai/rate-limit.ts:20-52`).

**Why it matters.** Vercel creates multiple function instances and restarts them. An in-memory counter is neither global nor durable. Studio credentials, public-form storage, and paid AI calls remain exposed to distributed retries and instance rotation.

**Proposed solution.** In v3.1.1, add a durable, privacy-conscious limiter keyed by normalized account plus coarse network signal for login, form endpoints, and AI actions. Record denial metrics without storing raw IP indefinitely. Put MFA and session administration in v3.2.

**Difficulty:** M  
**Expected impact:** Reduces credential stuffing, spam, database write abuse, and provider-cost abuse.

### Medium

#### ST-M1 — The editor page is an unstructured 6,000-pixel work surface

**Issue.** A production Blueprint editor was about 5,975 px tall. Metadata occupied a narrow left column while much of a 2,048 px viewport remained unused, followed by the document editor, health, and history in one long page. Build editing also ships roughly 1.09 MiB raw / 338.6 KiB gzip of client JavaScript.

**Why it matters.** Editors spend time scrolling between metadata, blocks, preview, health, and history rather than editing. The visual hierarchy says every section is equally immediate. Large client code increases hydration and interaction cost on the product's most important route.

**Proposed solution.** In v3.1.1, add a sticky local outline and tighten the metadata grid. In v3.2, move to a state-preserving split workspace with Metadata, Documents, Health, and History surfaces; lazy-load AI and media-heavy editor panels.

**Difficulty:** S for the outline; L for the workspace  
**Expected impact:** Faster navigation within entries and a smaller initial editor bundle.

#### ST-M2 — Save semantics are inconsistent and inadequately explained

**Issue.** Metadata copy says changes save immediately while the form also presents “Save changes.” Documents autosave and expose a manual Save action. Ctrl/Cmd+S targets the first registered editor rather than necessarily the currently focused editor, and sign-out is not intercepted by the dirty guard.

**Why it matters.** Editors cannot form one reliable mental model for when their work is safe. Inconsistency is especially costly next to the confirmed role-switch loss path.

**Proposed solution.** Use explicit status language: “Unsaved,” “Saving,” “Saved at…,” and “Save failed.” Scope keyboard save to the focused editor, include sign-out in guarded transitions, and remove any copy that claims immediate persistence when a submit is required.

**Difficulty:** M  
**Expected impact:** Reduces accidental navigation and makes save state observable rather than inferred.

#### ST-M3 — Collection-table behavior is less capable than its documentation claims

**Issue.** Column headers are not sortable, status values expose raw enum strings, and `inReview` visually becomes `INREVIEW` rather than “In review.” At some desktop widths, the search placeholder is clipped. `docs/architecture/CMS_PRODUCT_DESIGN.md` claims sortable tables and broader collection behavior that is not present.

**Why it matters.** Sorting is basic list management once collections grow. Raw internal vocabulary and clipped controls make the CMS feel unfinished.

**Proposed solution.** Add a shared display-label formatter immediately. Add URL-backed server sorting to the query-platform work rather than implementing separate client sorts in each table. Use a responsive toolbar that prioritizes the field over decorative placeholder text.

**Difficulty:** XS for labels; M for server sorting  
**Expected impact:** Immediate polish and a scalable path for larger collections.

#### ST-M4 — Health presents informational facts as defects

**Issue.** Some informational publishing facts render with “How to fix: Open the collection to work through it,” even when nothing is wrong. The issue model requires a remedy, so neutral state is forced through a defect-shaped component.

**Why it matters.** A health system that calls normal state a problem trains editors to ignore it. That weakens the value of real critical findings.

**Proposed solution.** Split `HealthFinding` into defect, warning, and informational fact variants. Only defects and warnings should require remediation. Keep counts and dashboard attention limited to actionable findings.

**Difficulty:** S  
**Expected impact:** Improves signal-to-noise and editor trust in Health.

#### ST-M5 — Entry Health coverage is inconsistent across content types

**Issue.** Full per-entry health inspection is mounted for Work, Builds, Blueprints, Labs, and Notes, but not Careers, Services, Team, or Engineering Profiles. Structured-data availability is not exposed as a health fact. `DOCUMENT_OWNERS` duplicates the owner-to-role contract and can drift (`src/lib/studio/health/inspector.ts:99`).

**Why it matters.** The global report appears comprehensive while the editor experience varies by collection. New document roles can silently escape the health engine.

**Proposed solution.** Derive document expectations from the same collection registry used by editors, mount a suitable inspector on all publishable entry types, and expose structured-data eligibility from the public projection rather than restating rules in Studio.

**Difficulty:** M  
**Expected impact:** Consistent publication readiness and fewer contract-drift defects.

#### ST-M6 — Studio Search is useful but not a scalable or linkable search system

**Issue.** `/studio/search?q=Blueprint` does not initialize the search from the URL. The entire current index—105 entries in production—is serialized to the browser and filtered linearly. Document bodies are not indexed.

**Why it matters.** Search results cannot be bookmarked or shared, and the architecture will degrade as content grows. “Search” currently means entry metadata, not authored content.

**Proposed solution.** In v3.1.1, bind query state to the URL. In v3.2, introduce a permission-aware server index with incremental updates, excerpts, facets, and document-block text.

**Difficulty:** S for URL state; L for indexed search  
**Expected impact:** Better current usability and a search path that survives thousands of records.

#### ST-M7 — Activity exposes an event filter that cannot produce results

**Issue.** The `entry.mediaChanged` event type exists in the schema and filter UI, but no write path emits it. Media field changes are recorded as generic `entry.updated`. The limitation is documented in `docs/architecture/EXPERIENCE_V3_PROGRESS.md:425` and `:609`.

**Why it matters.** A permanently empty filter is false capability. It also suggests a level of audit specificity that the data does not contain.

**Proposed solution.** Either remove the filter in v3.1.1 or add field-level diff production for media references. Include the resulting version ID in `document.updated` events so history can link to the snapshot it describes.

**Difficulty:** XS to remove; M to implement correctly  
**Expected impact:** Makes Activity filters truthful and improves traceability.

#### ST-M8 — Activity resolves five recent events by building the whole Studio search index

**Issue.** `loadActivity()` loads the complete search snapshot merely to turn event entity IDs into labels (`src/lib/studio/activity/service.ts:41`). The Dashboard does this for a five-row widget.

**Why it matters.** A cheap audit preview inherits the cost and failure modes of every content repository. As collections grow, the Activity widget becomes a dashboard latency multiplier.

**Proposed solution.** Store immutable display context on the event or batch-resolve only the distinct referenced IDs by type. Do not build a global search index for label hydration.

**Difficulty:** M  
**Expected impact:** Removes a full-content read from Dashboard and Activity requests.

#### ST-M9 — System settings include false affordances

**Issue.** `studioName` and `contactEmail` can be edited, but repository search found no consumers outside the System page and its action. `getSystemInfo()` hardcodes deployment stage to “Production” (`src/lib/studio/system-info.ts:22`). Integration “Available” means an environment variable exists, not that the integration works.

**Why it matters.** Settings imply operational effect. Dead configuration wastes editor time, and hardcoded health facts can lie in local and preview deployments.

**Proposed solution.** Remove unused fields until they have consumers, or wire them through a typed runtime configuration service. Derive deployment environment from Vercel/runtime variables and rename integration status to “Configured” unless a real health check ran.

**Difficulty:** S  
**Expected impact:** Makes the System page diagnostically honest.

### Low

#### ST-L1 — Activity presentation is visually flatter than Entry History

**Issue.** Entry History groups events by date; global Activity is one uninterrupted list.

**Why it matters.** The global feed is harder to scan once it exceeds a few screens.

**Proposed solution.** Reuse the date-bucket presentation without changing pagination semantics.

**Difficulty:** XS  
**Expected impact:** Small improvement in temporal scanning.

#### ST-L2 — Command Palette results can be stale during a long Studio session

**Issue.** The palette is functionally good, but its index is snapshot-oriented. An entry created in another tab or by another editor may not appear until a refresh.

**Why it matters.** Low at the current team size, but it weakens the palette as a trusted navigation tool.

**Proposed solution.** Revalidate on palette open after a short stale interval, or use the future server search endpoint.

**Difficulty:** S  
**Expected impact:** Fresher navigation with negligible current-product risk.

### Studio area coverage

| Area | Assessment |
|---|---|
| Dashboard | Useful prioritization concept; wrong aggregate links, indirect rows, excessive reads |
| Content collections | Broad coverage; table keyboard model, labels, sorting, and server querying need work |
| Editors | Capable but too long, heavy, and inconsistent about persistence |
| Review workflow | Core transitions and rejection notes are solid; collaboration remains shallow |
| Featured Order | Real and well-considered; eligibility query is expensive |
| Documents | Strong domain model; role switching has a Critical loss path |
| Relationships | A genuine product strength; global graph rebuild is the scaling problem |
| Search | Useful at current scale; not linkable or server-indexed |
| Command Palette | Already good; only freshness/scaling concerns |
| Activity | Useful foundation; silent writes and incomplete event semantics weaken auditability |
| Entry History | Exists and is readable; lacks compare/restore/version linkage |
| Health | Good editorial idea; noisy information model, query cost, and coverage gaps |
| Media | Most complete Studio area; image delivery and alt-text quality need attention |
| Studio navigation | Broad and coherent; competing scroll containers are a material defect |
| Authentication | Sensible authorization and disabled-account handling; missing durable abuse controls |
| Settings | Some fields are dead and system health is overstated |
| User management | Functional; duplicated table links and limited identity controls |

---

## 5. Phase 2 — Public-site audit

### Critical

No separate public-rendering Critical issue was found beyond PF-C1 in the performance and architecture section: public cache invalidation can make the live site disagree with a successful Studio mutation.

### High

#### PUB-H1 — Mobile primary navigation hides most destinations behind an undiscoverable gesture

**Issue.** At 390 px, the floating navigation allocates only about 133 px to a 328 px horizontal link track after brand, Search, and Contact consume fixed space. On the homepage, only Work and Builds were fully visible. Blueprints, Labs, and About require a horizontal swipe with no scrollbar and a weak overflow cue. On a Blueprints page, auto-centering left clipped residual text at the track edge.

**Why it matters.** The four pillars are the permanent information architecture. A first-time visitor should not need to infer that the middle of a pill is horizontally scrollable to reach them.

**Proposed solution.** Use an explicit compact navigation control below the mobile breakpoint, or make the track visibly scrollable with a clear “More” affordance. Reducing fixed Search/Contact chrome can help, but it does not fix the discoverability model by itself.

**Difficulty:** M  
**Expected impact:** Makes all primary destinations obvious and reliably reachable on common mobile widths.

#### PUB-H2 — Public form abuse protection is below production baseline

**Issue.** Contact and Career Interest use honeypot and timing checks but no durable request-volume control. Both write to persistent collections and can trigger operational work.

**Why it matters.** Low current traffic does not prevent automated spam. Once a route is public, abuse cost is asymmetric: the attacker spends almost nothing while HubZero stores and triages noise.

**Proposed solution.** Apply the shared durable limiter proposed in ST-H7, preserve the existing accessible error handling, and add server-side duplicate suppression for repeated identical submissions.

**Difficulty:** M  
**Expected impact:** Lower spam and database noise without introducing a CAPTCHA into the normal path.

### Medium

#### PUB-M1 — Production alt text is technically present but often low quality

**Issue.** Sampled Media records used values such as `querycraft-hero` and `velora-hero`. The public projection rejects empty alt text, so automated health reports consider these assets valid.

**Why it matters.** Filename-like labels satisfy a non-empty check but do not describe purpose or content to a screen-reader user. This is compliance-shaped metadata rather than useful alternative text.

**Proposed solution.** Add an alt-quality rule that flags filename patterns, slugs, repeated “hero,” and text identical to the asset name. Let decorative images be explicitly marked decorative rather than forcing meaningless text.

**Difficulty:** S  
**Expected impact:** Better real accessibility with limited editorial effort.

#### PUB-M2 — Public Search has a hard cap but no way to refine beyond the query

**Issue.** Public Search already exists and groups results, but it returns a bounded set and offers no type, technology, or date refinement. The current corpus is small enough that this is not yet a user-facing failure.

**Why it matters.** Search becomes less useful as Notes, Profiles, Services, and case studies accumulate. Simply raising the result cap would increase payload and scan cost.

**Proposed solution.** Build refinements on the v3.2 indexed-search capability. Preserve visibility rules and return type counts before adding UI filters.

**Difficulty:** L as part of the shared search service  
**Expected impact:** Keeps discovery useful as the site develops a real publication archive.

#### PUB-M3 — Public content quality is uneven across an otherwise mature shell

**Issue.** Production had one Work item, one Build, one Lab, ten Blueprints, five Engineering Profiles, and no Notes, Services, or active Careers. Empty states are well designed, but the overall evidence mix makes Blueprints dominate the product story.

**Why it matters.** This is not a missing software feature; it is an editorial imbalance. The homepage promises a technology studio, while the live corpus currently reads more like a blueprint catalog.

**Proposed solution.** Treat content coverage as an editorial release criterion. Use existing Health data to expose collection coverage trends without inventing fake minimum quotas.

**Difficulty:** Editorial, not primarily engineering  
**Expected impact:** Stronger public credibility and better use of capabilities that already shipped.

### Low

#### PUB-L1 — Streamed metadata causes misleading synthetic SEO failures on dynamic routes

**Issue.** Lighthouse scored sampled dynamic pages 92 for SEO because their descriptions appeared in streamed body metadata rather than the initial `<head>`. Next.js 15 deliberately streams metadata for JavaScript-capable bots and blocks for HTML-limited bots. This behavior is documented by [Next.js `generateMetadata`](https://nextjs.org/docs/15/app/api-reference/functions/generate-metadata).

**Why it matters.** The score looks like an SEO defect even though supported search crawlers receive metadata. Disabling streaming globally with `htmlLimitedBots: /.*/` would improve a synthetic score by increasing TTFB.

**Proposed solution.** First make avoidably dynamic pages static. Do not globally disable metadata streaming unless Search Console or a target crawler demonstrates a real indexing failure.

**Difficulty:** XS to document; potentially costly if “fixed” incorrectly  
**Expected impact:** Prevents performance regression in pursuit of a misleading score.

#### PUB-L2 — The mobile navigation auto-scroll leaves clipped edge fragments

**Issue.** Active-item centering works, but the clipped edge can show a few residual letters from an adjacent item.

**Why it matters.** It looks unfinished and reinforces the ambiguity of the scroll-track interaction.

**Proposed solution.** This disappears if PUB-H1 adopts an explicit compact menu. If the track remains, use deliberate edge padding and a stronger mask.

**Difficulty:** XS  
**Expected impact:** Minor visual polish.

### Public-site strengths worth preserving

- Homepage and detail-page hierarchy are strong at desktop and mobile sizes.
- The public DTO boundary prevents Studio-only fields from leaking.
- Collection and detail layouts are consistent without feeling cloned.
- Empty Notes and Careers states explain the absence rather than rendering broken grids.
- Public Search, footer discovery, breadcrumbs, canonical URLs, sitemap, robots, and structured data already exist.
- Sampled Lighthouse accessibility scores were 100 and CLS was 0.
- The site communicates work through artifacts and relationships rather than generic agency claims.

These strengths are why v3.2 should avoid a broad public redesign. The high-value work is navigation, delivery performance, content depth, and discovery at scale.

### Public area coverage

| Area | Assessment |
|---|---|
| Homepage | Strong hierarchy and editorial composition; cold projection work is disproportionately expensive |
| Collection pages | Coherent layouts and filters; several are accidentally dynamic |
| Entry pages | Strong storytelling, relationship disclosure, and responsive layout |
| Navigation | Good desktop model; primary destinations are poorly exposed on mobile |
| Footer | Useful secondary discovery and clear information architecture |
| Discovery | Evidence relationships are distinctive; corpus breadth is currently uneven |
| Metadata | Canonicals and social metadata exist; dynamic streaming produces a synthetic-audit caveat |
| Structured data | Substantive and type-aware across sampled routes |
| Search | Already useful; bounded in-memory architecture needs an indexed successor |
| Performance | Good warm/cached baseline; dynamic topology, graph work, and double image optimization dominate misses |
| Responsiveness | Content layouts hold up well; the mobile navigation pill is the material exception |

---

## 6. Phase 3 — Performance and architecture audit

### Why local is fast while Vercel feels slow

`next start` locally is a warm, long-lived Node process reached over loopback. It can reuse its MongoDB connection, Next.js memory caches, compiled modules, and operating-system page cache. There is no TLS setup, edge hop, function scheduling, or geographic database round trip.

Production dynamic requests may add:

1. TLS and network latency from the user to the Vercel edge.
2. An edge-to-function hop; sampled IDs showed `bom1` to `iad1`.
3. Function cold initialization or an idle instance waking.
4. MongoDB DNS/TLS/pool setup on a new function instance.
5. A function-to-Atlas regional round trip for every query.
6. Repeated repository queries and serialization into an RSC payload.
7. A Vercel image-optimization request that itself fetches a transformed Cloudinary image.
8. Cache misses after broad invalidation.

The local build proves that rendering code can execute quickly in one warm process. It does not reproduce the production system.

### Critical

#### PF-C1 — Public cache invalidation is both incomplete and excessively broad

**Issue.**

- Service create, update, status, and delete actions do not call `invalidatePublicEntity('service', ...)`.
- Taxonomy create, rename, merge, and delete actions do not invalidate public collections or discovery.
- As a result, public Services, entry taxonomy labels, Search, homepage evidence, and metadata can remain stale until a different mutation or cache expiry.
- Conversely, `invalidatePublicEntity()` always invalidates the global `relations`, homepage, discovery, sitemap, and feed tags (`src/lib/public/cache.ts:96-103`). Most cached queries include the relations tag, so a local edit can flush nearly the whole public cache.
- `invalidatePublicMedia()` invalidates all nine public collection tags even when a new or edited asset is unused (`src/lib/public/cache.ts:106-113`).

**Why it matters.** The incomplete side is a publication-correctness defect: Studio can report success while the public site continues to show old content. The broad side creates avoidable cold paths and makes production latency spiky after routine editorial work.

**Proposed solution.**

1. Centralize invalidation in the repository/service mutation boundary so an action cannot forget it.
2. Model dependencies explicitly:
   - Entity metadata/status: entity, collection, relevant discovery/sitemap/homepage tags.
   - Relationship change: the source entity and affected target entities/collections.
   - Taxonomy rename/merge: only collections containing the affected term plus discovery.
   - Media update: only entities found through Media Usage; no all-collection invalidation for an unused upload.
3. Add contract tests for every public mutation type asserting both required and forbidden invalidations.
4. Warm only the small set of high-traffic projections after publication if cold latency remains material.

**Difficulty:** M  
**Expected impact:** Restores editor-to-public correctness and reduces unnecessary cache misses after routine changes.

### High

#### PF-H1 — The public repository repeatedly rebuilds the entire content graph

**Issue.** `buildGraph()` lists every requested entity type and calls asynchronous `mapSummary()` for every record (`src/lib/public/repository.ts:540-573`). Summary mapping performs taxonomy and media lookups. `getHomepage()` first lists six collections, then calls `buildEvidenceQuery()` over all nine public types, then calls `findDetail()` for every featured entity and every profile (`:846-915`). `listHomepageEligibility()` lists a collection, rebuilds the all-type graph, and calls `findDetail()` once per entry (`:974-986`).

The homepage therefore rereads collections and performs per-entity detail, document, media, taxonomy, and relationship work. Health invokes eligibility for five collections. At the current data set, a cold dashboard or homepage can easily trigger dozens of collection operations and more than 100 MongoDB operations.

**Why it matters.** This is an N+1-shaped architecture hidden behind `Promise.all`. Parallel queries still consume connections, network round trips, CPU, and memory. Broad invalidation makes users pay this cost repeatedly.

**Proposed solution.**

1. Create one request-scoped `PublicSnapshot` that batch-loads visible entity projections, taxonomy, media references, documents, and relationship assertions once.
2. Build summaries, details, homepage eligibility, and relationship projections from that snapshot.
3. Add source-level projections and `$in` batch reads for referenced media/taxonomy/document IDs.
4. Stop hydrating full details merely to answer homepage eligibility; compute a typed eligibility projection from already-loaded fields.
5. Limit featured candidates before detail expansion where order and eligibility rules permit it.
6. Instrument query count and duration per public query so regressions fail a budget test.

**Difficulty:** L  
**Expected impact:** Expected 60–90% reduction in database round trips on cold homepage, Health, Featured Order, and relationship-heavy routes. Exact latency must be verified with tracing.

#### PF-H2 — Several public routes are dynamic only because filters read `searchParams`

**Issue.** Work, Blueprints, and Labs await `searchParams` in their server page, making the whole route dynamic. Contact is explicitly `force-dynamic` only to read `from`. Search is legitimately query-driven but could still use a cached shell. Comparable detail and static index routes are prerendered.

**Why it matters.** Measured dynamic TTFB was about 0.42–0.53 seconds versus 0.19–0.22 seconds for cached pages from the same geography. These routes lose Vercel cache hits for client-visible filter state.

**Proposed solution.**

- Render Work, Blueprints, and Labs as cached index shells with the complete public summary set, then apply small filter query parameters in a client island.
- Keep shareable URL state and server-render the unfiltered canonical list.
- Make Contact static and read `from` in the form client boundary, or encode a finite set of static sources.
- For Search, cache the shell and use a dedicated server endpoint/action for query results if the full page cannot be static.

**Difficulty:** M  
**Expected impact:** Based on sampled routes, roughly 40–60% lower TTFB for common index and contact requests, plus better cache hit rates.

#### PF-H3 — Function and database region affinity is not controlled

**Issue.** No `preferredRegion` or Vercel route configuration was found. Sampled dynamic responses entered at Bombay and showed function work in IAD. The Atlas region was not available for inspection.

**Why it matters.** A geographically distant function-to-database path multiplies every query round trip. PF-H1 makes that multiplier severe.

**Proposed solution.**

1. Measure Atlas region, function region, and real visitor/editor geography.
2. Place database-facing functions in the Atlas region, not merely the visitor's region.
3. If public reads and Studio writes need different regional strategies, split route groups deliberately.
4. After query consolidation, measure whether Vercel Fluid Compute or provisioned concurrency materially improves cold behavior before paying for it.

**Difficulty:** S for configuration after measurement  
**Expected impact:** Potentially removes 100–250 ms of repeated inter-region latency from dynamic requests; actual impact depends on Atlas placement.

#### PF-H4 — Studio Dashboard and Health repeat the same global reads

**Issue.** Dashboard loads seven content/team repositories and Leads. Health independently loads five Featured collections plus Careers, Services, Team, Profiles, and the relationship scanner. Each Featured collection calls public homepage eligibility, which rebuilds the global graph. Recent Activity then builds the whole Studio search index to label five events. The Health service comment that every collection is read exactly once (`src/lib/studio/health/service.ts:22`) is false at the application-query level.

**Why it matters.** Production Health, Relationship, and Media screens took roughly 1.5–2.2 seconds to present useful content despite the database containing fewer than 200 inspected records. Dashboard latency will grow with every collection.

**Proposed solution.** Build a server-only `StudioSnapshot`/query service that loads each needed collection once with a projection and passes it to pure health, relationship, publishing, and activity adapters. Keep Dashboard summaries cheap and defer full Health detail behind its own Suspense boundary or route.

**Difficulty:** L  
**Expected impact:** Expected sub-second warm Dashboard/Health rendering at current scale and a much lower database query count.

#### PF-H5 — Images are optimized twice and the generated Cloudinary `srcSet` is unused

**Issue.** `toPublicMedia()` creates Cloudinary `f_auto,q_auto,c_limit,w_*` URLs and a responsive Cloudinary `srcSet` (`src/lib/public/media.ts:45-70`). `PublicImage` passes the transformed URL to Next `<Image>` but only uses `sizes`, not `srcSet` (`src/components/public/PublicImage.tsx:25-33`). Production `currentSrc` was `/_next/image?url=https://res.cloudinary...f_auto,q_auto...`.

**Why it matters.** Vercel's image optimizer fetches and reprocesses an image Cloudinary already transformed. The first sampled optimized image took about 0.99 seconds; later cache hits took about 0.33–0.50 seconds. This adds latency, compute, billing, and an unused serialized `srcSet`.

**Proposed solution.** Choose one optimizer:

- Preferred: use a Cloudinary custom Next loader so `<Image>` retains layout behavior but emits direct responsive Cloudinary URLs.
- Alternative: render a native `<picture>/<img>` using the existing Cloudinary `srcSet`.

Remove the unused responsive DTO field if Next owns variants, or use it if Cloudinary owns them.

**Difficulty:** M  
**Expected impact:** Removes one image-processing hop, improves cold image latency, and reduces Vercel image-optimization usage.

#### PF-H6 — No production observability exists for the reported performance problem

**Issue.** There is no OpenTelemetry/instrumentation entry point, error monitoring integration, Web Vitals collection, query-count logging, cache hit/miss telemetry, or route-level latency dashboard. Most failures become `console.error`; some event failures become nothing.

**Why it matters.** “Production feels slower” remained subjective because the system cannot answer which time was cold boot, MongoDB connection, query work, RSC serialization, or image optimization. Performance work without instrumentation is guesswork.

**Proposed solution.** Add request correlation, server timing spans, MongoDB operation counts/durations, cache outcome tags, Web Vitals, function region/cold-start attributes, error capture, and dashboards for p50/p75/p95 by route. Set budgets for high-value routes.

**Difficulty:** M for a useful baseline; L for mature alerting  
**Expected impact:** Converts performance and reliability from anecdote to an operable system; enables safe validation of every other optimization.

### Medium

#### PF-M1 — Every public page eagerly pays for the animated Search dialog

**Issue.** `PublicNavigation` imports `PublicSearchDialog`, which imports `AnimatePresence`, `motion`, and `useReducedMotion` from Framer Motion. The modal is bundled even when never opened. Lighthouse reported about 38 KiB of unused JavaScript on sampled pages.

**Why it matters.** Search is a secondary interaction but its animation runtime is part of the baseline navigation cost.

**Proposed solution.** Keep the trigger tiny and dynamically import the dialog after intent or first open. Prefer CSS transitions or native `<dialog>` where they meet the current behavior.

**Difficulty:** S  
**Expected impact:** Expected 20–40 KiB gzip reduction from the initial public bundle and less hydration work.

#### PF-M2 — Generic repositories fetch whole collections with no projection, sort, or pagination

**Issue.** `createRepository().list()` executes `collection.find(filter).toArray()` (`src/lib/db/repository.ts:59`). Most Studio pages then filter, sort, count, and paginate in JavaScript. Leads and candidates similarly load full result sets.

**Why it matters.** This is acceptable at 1–54 records per collection and becomes a hard cliff at hundreds or thousands. It also prevents MongoDB from doing efficient covered queries.

**Proposed solution.** Add typed list queries with projection, cursor pagination, indexed sort, filters, and total/count only where required. Keep the generic repository for small reference collections, not as the default list API.

**Difficulty:** L  
**Expected impact:** Bounded memory and payloads, efficient Studio lists, and predictable latency as content grows.

#### PF-M3 — MongoDB indexes do not match history and feed access patterns

**Issue.**

- `documentVersions` has no `{ documentId, createdAt }` index despite sorting versions by creation time.
- Editorial events lack a compound index aligned with event-type/date and collection/date feeds.
- Team lookup indexes do not cover every identity relation used by profiles/users.
- Several empty or not-yet-created collections rely on indexes being created lazily, if at all.

**Why it matters.** Current scans are invisible with six versions and 18 events. They become immediate latency problems once versioning and activity are used as intended.

**Proposed solution.** Define indexes next to query contracts, manage them through a versioned index/migration runner, and verify with `explain('executionStats')` in CI against representative fixtures.

**Difficulty:** M  
**Expected impact:** Prevents history, feed, and identity lookups from degrading linearly.

#### PF-M4 — Serverless MongoDB pooling is implicit

**Issue.** A global client promise correctly reuses a connection inside a warm instance, but default pool settings apply independently to every function instance. There are no explicit maximum pool, idle, selection-timeout, or monitoring decisions.

**Why it matters.** Scaling function concurrency can exhaust Atlas connections before CPU or request throughput becomes the limit.

**Proposed solution.** Configure and document pool bounds for Vercel, monitor connection count and wait-queue time, and load-test burst concurrency after region placement is fixed.

**Difficulty:** S  
**Expected impact:** Lower risk of connection storms and clearer capacity planning.

#### PF-M5 — Studio editor bundles are too monolithic

**Issue.** The sampled Build edit route ships approximately 338.6 KiB gzip / 1.09 MiB raw client JavaScript. AI panels, editor tooling, media selection, and secondary surfaces are close to the initial route boundary.

**Why it matters.** The editor is an interaction-heavy route where hydration delay is visible. Future collaboration features will make the bundle larger unless boundaries are established now.

**Proposed solution.** Generate a bundle report in CI, lazy-load AI and rarely used panels, split media picking from the base editor, and keep server-rendered metadata outside the editor client boundary.

**Difficulty:** M  
**Expected impact:** Faster editor readiness and a bundle budget that resists regression.

### Low

#### PF-L1 — RSC/HTML payloads are larger than the visual result suggests

**Issue.** Blueprints returned about 136 KiB of HTML and the homepage about 100 KiB before assets. Some of that is legitimate content and React payload, but graph-derived relationship and responsive-media data is serialized broadly.

**Why it matters.** It is not currently the dominant latency source, but it increases transfer and parsing on slower devices.

**Proposed solution.** After query consolidation, inspect RSC payload ownership and omit unused fields such as the unused responsive `srcSet`.

**Difficulty:** S  
**Expected impact:** Modest transfer and parse reduction.

#### PF-L2 — Cache TTL and invalidation policy are not observable

**Issue.** Public pages commonly use 24-hour revalidation, but there is no operational view of tag invalidations, revalidation failures, or hit rate.

**Why it matters.** The chosen TTL may be reasonable, but engineering cannot tell whether freshness comes from correct invalidation or luck.

**Proposed solution.** Include cache outcome and invalidation reason in the observability work.

**Difficulty:** S  
**Expected impact:** Better tuning and faster diagnosis of stale-publication reports.

---

## 7. Phase 4 — Developer experience, reliability, and security

### Critical

No additional DX-only Critical issue was found. The two Critical product defects are partly consequences of missing browser regression coverage and mutation-contract enforcement.

### High

#### DX-H1 — There is no CI pipeline

**Issue.** No `.github/workflows` or equivalent checked-in CI configuration exists. The only Git hook runs `lint-staged`; merge safety depends on developers remembering to run the full suite.

**Why it matters.** A repository with 698 tests gains little release protection if none are required before merge. Build-only failures, cross-platform line endings, dependency advisories, and generated-route failures can reach `main`.

**Proposed solution.** Add CI for install lockfile integrity, lint, typecheck, unit tests, build, format, dependency audit policy, and a small browser smoke suite. Cache npm and Next build artifacts, but never cache test results in a way that hides execution.

**Difficulty:** M  
**Expected impact:** Prevents routine regressions and makes `main` a meaningful release boundary.

#### DX-H2 — There is no end-to-end or automated accessibility regression suite

**Issue.** The project has strong pure tests but no Playwright/Cypress suite and no axe/Lighthouse CI. Only a very small number of tests exercise DOM interaction in jsdom. Featured Order has only partial production-browser history, and Work/Build/Labs/Notes variants were not all exercised.

**Why it matters.** The most serious current defect—edits lost on tab switch—is exactly the kind unit tests miss. Scroll traps, focus duplication, Draft Mode, navigation overflow, and save/refresh behavior require a browser.

**Proposed solution.** Start with critical journeys:

1. Login and authorization denial.
2. Create/edit/save/reload.
3. Immediate Document role switch.
4. Review transition and rejection.
5. Featured ordering by pointer and keyboard across each registered collection.
6. Draft preview and preview exit.
7. Media replace/delete safeguards.
8. Public mobile navigation.
9. axe checks on Studio lists/editors and public templates.

**Difficulty:** L for a reliable first suite  
**Expected impact:** High regression coverage of the product's real workflows and accessibility model.

#### DX-H3 — Canonical documentation is contradictory

**Issue.**

- `docs/architecture/CMS_PRODUCT_DESIGN.md:3` says “Implemented,” while line 370 says “Nothing in this document has been implemented.”
- The same document promises recent/pinned items, bulk actions, sortable tables, and other behavior that does not exist.
- `docs/architecture/PLANNING.md:3` still says no implementation has begun.

**Why it matters.** The bootstrap explicitly makes these documents authoritative. An engineer can obey the process and still receive mutually exclusive product facts. This also makes the “do not suggest existing features” rule impossible to apply reliably without source and production inspection.

**Proposed solution.** Give every architecture document one status header: Current Contract, Accepted Future, Historical, or Superseded. Move unimplemented design to a roadmap appendix and link every “implemented” claim to a route/module/test. Add a documentation-truth check to release preparation.

**Difficulty:** M  
**Expected impact:** Less duplicated work, fewer false assumptions, and a bootstrap that can be trusted.

#### DX-H4 — Production behavior is not observable

**Issue.** See PF-H6. There is also no health check that distinguishes “environment variable present” from “dependency operational,” no centralized structured logging contract, and no release annotations.

**Why it matters.** Operational maturity is part of engineering maturity. Passing unit tests cannot diagnose a slow region, failed revalidation, exhausted Mongo pool, or missing event write.

**Proposed solution.** Treat baseline telemetry, alerts, and dependency health as a v3.1.1/v3.2 release requirement, not optional tooling.

**Difficulty:** M  
**Expected impact:** Faster incident diagnosis and evidence-based capacity decisions.

#### DX-H5 — Rate limiting is not deployment-safe

**Issue.** The AI security document correctly admits the current limiter is per-process, but production is multi-instance serverless. Login and forms have no durable equivalent.

**Why it matters.** A disclosed security gap is still a gap. It should not survive indefinitely because current traffic is low.

**Proposed solution.** Implement one shared durable limiter abstraction with per-use-case policies and auditable denial metrics.

**Difficulty:** M  
**Expected impact:** Closes a known abuse and cost-control weakness across three surfaces.

### Medium

#### DX-M1 — Formatting is broken across Windows and CI has no canonical line-ending policy

**Issue.** `npm run format:check` reports roughly 600 files as failing on the current Windows checkout, while `prettier --end-of-line auto` passes. Git is configured to convert LF to CRLF and the repository has no `.gitattributes`.

**Why it matters.** A check that fails for nearly the whole repository becomes noise and will not be run. Future CI may produce platform-specific results or giant line-ending diffs.

**Proposed solution.** Add `.gitattributes` with explicit LF for source/config/docs and appropriate binary rules. Set Prettier's end-of-line policy consistently, normalize once in an isolated commit, and verify on Windows and Linux.

**Difficulty:** S  
**Expected impact:** Restores a trustworthy format gate and prevents noisy diffs.

#### DX-M2 — A moderate sanitizer advisory remains open

**Issue.** `sanitize-html` is pinned at 2.17.4 and `npm audit --omit=dev` reports [GHSA-vccv-cmxp-4j9h](https://github.com/advisories/GHSA-vccv-cmxp-4j9h), fixed in 2.17.6. HubZero's allowlist only permits `p`, `strong`, `em`, `s`, `code`, `a`, and `br`, with only `href` on anchors, so the advisory's dangerous attributes are not currently allowed.

**Why it matters.** Practical exploitability appears low under the current configuration, but leaving a fixed direct dependency advisory open adds unnecessary release noise and future risk if the allowlist changes.

**Proposed solution.** Upgrade to 2.17.6, rerun sanitizer tests, build, and audit.

**Difficulty:** XS  
**Expected impact:** Removes the only production dependency advisory with minimal regression risk.

#### DX-M3 — Index creation and data evolution have no migration discipline

**Issue.** Editorial-event indexes are created lazily by an application function; other required indexes have no visible versioned runner. There is no migration ledger or idempotent release step.

**Why it matters.** Schema validation in application code does not update old records, create new indexes consistently, or prove that every environment matches.

**Proposed solution.** Add a versioned migration/index command with dry-run, applied-version records, timing, and rollback notes. Run it as an explicit deployment step, not on arbitrary user requests.

**Difficulty:** M  
**Expected impact:** Predictable releases and fewer environment-specific query failures.

#### DX-M4 — Large modules combine too many architectural responsibilities

**Issue.** `src/lib/public/repository.ts` is about 1,381 lines and combines visibility, summary mapping, detail mapping, graph building, relationships, homepage projection, discovery, eligibility, media, documents, and freezing. Several UI modules are 450–560 lines.

**Why it matters.** The current monolith encouraged repeated graph work because data loading and projection are interleaved. Large client components also resist code splitting and focused tests.

**Proposed solution.** Split by stable responsibility, not arbitrary file size:

- Batch data loader/snapshot
- Visibility/publication policy
- Summary and detail projectors
- Relationship graph projector
- Homepage/eligibility policy
- Discovery/search projection

For editor UI, separate state machine, persistence adapter, block canvas, AI panel, and media controls.

**Difficulty:** L  
**Expected impact:** Easier performance reasoning, narrower tests, and safer future feature work.

#### DX-M5 — Identifier representation is inconsistent

**Issue.** Most foreign keys use `ObjectId`, while Team `userId` and Engineering Profile `teamMemberId` are validated/stored as strings. Repository code contains compatibility comments and conversions around these differences.

**Why it matters.** Mixed identity types complicate joins, index design, validation, and migrations. The cost grows with every new relation.

**Proposed solution.** Choose a single persistence representation, add a migration with compatibility reads, then remove dual-shape handling before v4.

**Difficulty:** L  
**Expected impact:** Simpler relationship code and more reliable indexed lookups.

#### DX-M6 — Dependency/platform upgrades have no explicit cadence

**Issue.** Next.js 16, MongoDB 7, and other major/minor updates are available, while NextAuth remains on a beta release line. Blindly updating is inappropriate, but indefinitely drifting is also a risk.

**Why it matters.** Large framework jumps become more expensive when combined. Security and hosting behavior change under the project regardless of whether the repository plans for it.

**Proposed solution.** Define a quarterly dependency review, keep patch/minor security updates automated with tests, and schedule Next.js 16/MongoDB 7/Auth evaluation as a v3.2 engineering track with a production-canary plan.

**Difficulty:** M for evaluation; L if migration changes are significant  
**Expected impact:** Lower upgrade cliffs and earlier discovery of platform incompatibilities.

### Low

#### DX-L1 — Some comments assert guarantees the implementation does not provide

**Issue.** Health claims every collection is read once while nested eligibility and relationship calls reread them. Several comments describe intended query shape rather than measured application behavior.

**Why it matters.** Detailed comments can create false confidence when they are treated as proof.

**Proposed solution.** Comment invariants that are enforced by API shape or tests. Put performance claims in query-budget tests and telemetry.

**Difficulty:** S  
**Expected impact:** More reliable code review and less architecture drift.

#### DX-L2 — CSP regressions have no reporting channel

**Issue.** The current `'unsafe-inline'` tradeoff is deliberate and documented; nonce-based CSP was correctly rejected because it broke ISR. There is no `report-to`/reporting endpoint.

**Why it matters.** A future CSP or third-party change will surface only in manual testing.

**Proposed solution.** Add report-only telemetry with sampling and privacy controls. Do not reopen the nonce decision unless the rendering architecture changes.

**Difficulty:** S  
**Expected impact:** Earlier detection of CSP regressions without sacrificing ISR.

#### DX-L3 — Dead or speculative infrastructure remains in the runtime

**Issue.** The auth adapter appears prepared for future OAuth even though the current credential/JWT path does not exercise it, and System settings contain unused values.

**Why it matters.** Small individually, these increase the number of concepts an engineer must understand and test.

**Proposed solution.** Remove dead runtime paths or mark them as accepted near-term dependencies with an owner and deadline.

**Difficulty:** S  
**Expected impact:** Smaller conceptual surface and fewer false capabilities.

---

## 8. Phase 5 — Prioritized v3.1.1 candidate fixes

Only patch-appropriate correctness, reliability, accessibility, performance, security, and consistency work is included.

| Rank | Candidate | Effort | Definition of done | Expected impact |
|---:|---|---:|---|---|
| 1 | Preserve/flush Document edits before role switch | M | Immediate type → tab switch → reload browser test retains content; failure blocks switch and is announced | Removes confirmed data loss |
| 2 | Complete and narrow public cache invalidation | M | Service/taxonomy mutation contract tests; affected public views refresh; unrelated collection tags remain warm | Restores publication correctness and reduces cold paths |
| 3 | Fix Dashboard publishing and row destinations | S | Aggregate totals lead to truthful cross-collection results; queues/leads open the selected record | Removes reproducible workflow defects |
| 4 | Refresh/navigate after Lead and Lab mutations | S | UI updates on success and recovers on failure in browser tests | Prevents duplicate actions and stale status |
| 5 | Eliminate Studio root/nested scrolling | S | One main and one sidebar scroll region at short viewport and 200% zoom | Fixes long-page navigation |
| 6 | Replace duplicate table-cell anchors | S | One semantic entry link per row; keyboard and screen-reader regression checks pass | Cuts redundant Tab stops by 60–80% |
| 7 | Make mobile primary navigation explicit | M | Every primary destination is visible or exposed by an obvious control at 320–430 px | Fixes pillar discoverability |
| 8 | Remove avoidable dynamic rendering from index/contact routes | M | Work, Blueprints, Labs, and Contact serve cacheable shells while URL filters/source still work | Expected 40–60% TTFB reduction on sampled routes |
| 9 | Align Vercel function region with Atlas after measurement | S | Region decision documented; p50/p95 before/after recorded | Removes avoidable network latency |
| 10 | Stop Cloudinary/Vercel double image optimization | M | One image optimizer owns variants; visual and responsive-image tests pass | Faster cold images and lower image cost |
| 11 | Reduce Dashboard/Health duplicate reads | M–L | Per-request query count instrumented and materially reduced; no rule behavior changes | Targets current 1.5–2.2 s Studio latency |
| 12 | Add durable login/form/AI rate limiting | M | Multi-instance-safe limiter, denial metrics, accessible errors, retention policy | Reduces credential, spam, and AI-cost abuse |
| 13 | Make event logging failures visible and remove the impossible media filter | S | Structured failure telemetry; no permanently empty filter | Makes audit surfaces truthful |
| 14 | Normalize status labels and clarify save state | S | “In review” and other labels are humanized; save status is explicit | Removes recurring polish and trust issues |
| 15 | Add alt-text quality checks and clean current media metadata | S | Filename-like values flagged; decorative path supported; existing assets reviewed | Improves real accessibility |
| 16 | Establish minimum CI and browser smoke coverage | M–L | Lint, typecheck, tests, build, format, critical browser paths required on merge | Prevents recurrence of patch defects |
| 17 | Add `.gitattributes` and normalize the formatting contract | S | Format check passes on Windows and Linux without mass false failures | Restores the format gate |
| 18 | Upgrade `sanitize-html` to 2.17.6 | XS | Tests, build, and production dependency audit pass | Removes current advisory |

### Recommended v3.1.1 release gate

At minimum, ranks 1–10 must be complete. Ranks 11–18 can be split only if the release has:

- query/timing instrumentation sufficient to prove no regression,
- a written follow-up owner and target,
- and no unresolved Critical finding.

Do not add new editorial capability to v3.1.1 to compensate for these defects.

---

## 9. Phase 6 — v3.2.0 capability candidates

### 1. Collaboration-safe editing and real version recovery

**Problem solved.** Current protection is local to one browser and one mounted editor. There is no optimistic concurrency, edit lock/presence, cross-user conflict handling, version comparison, or restore workflow.

**User value.** Multiple editors can work without silently overwriting each other. Editors can compare, restore, and explain changes rather than treating version rows as forensic storage.

**Engineering complexity:** XL

**Dependencies.**

- Stable document/editor persistence contract
- Version tokens or revision numbers on metadata and Documents
- Version indexes and retention policy
- Event attribution linked to version IDs
- Browser coverage for concurrent saves and restore

**Why v3.2 instead of v3.1.1.** This changes data models, editor state, conflict UX, and audit semantics. It is a capability, not a patch.

### 2. Editorial review workspace and publication releases

**Problem solved.** Status plus one rejection note is adequate for a single reviewer, not for sustained editorial collaboration. There are no anchored review threads, assignments, approval records, scheduled publication, or atomic multi-entry release.

**User value.** Editors can request concrete changes, resolve discussion, assign reviewers, approve with attribution, schedule publication, and publish a coordinated release without external chat and spreadsheets.

**Engineering complexity:** XL

**Dependencies.**

- Collaboration-safe revisions
- Durable notification/event model
- Time-zone-safe scheduler
- Atomic publication/invalidation design
- Permission review

**Why v3.2 instead of v3.1.1.** It introduces new workflow entities, background work, permissions, and substantial UI.

### 3. Query-backed content platform

**Problem solved.** Studio and public reads load whole collections, rebuild graphs, and paginate/filter in memory. The current generic repository cannot support meaningful scale.

**User value.** Faster lists, Health, Dashboard, Featured Order, and public pages as the corpus grows. Editors get real server sorting and pagination.

**Engineering complexity:** XL

**Dependencies.**

- Query inventory and performance budgets
- Public/Studio batch snapshot designs
- Typed projections
- Cursor pagination
- Index/migration runner
- Cache dependency model

**Why v3.2 instead of v3.1.1.** It is a cross-cutting data-access migration. v3.1.1 should fix the worst duplicate reads and invalidation bugs without attempting the whole replacement.

### 4. Shared indexed discovery

**Problem solved.** Studio and public search each depend on in-memory snapshots and metadata-only matching. Documents are not searchable and public refinement is limited.

**User value.** Fast, relevant, visibility-safe search across titles, summaries, blocks, technologies, people, and relationships, with excerpts and facets.

**Engineering complexity:** L

**Dependencies.**

- Search document schema
- Incremental update/outbox path
- Permission and publication filters
- Reindex command and health status
- Choice of Atlas Search or another managed index

**Why v3.2 instead of v3.1.1.** It adds an indexing subsystem and must preserve strict public/Studio visibility boundaries.

### 5. Operational observability and performance budgets

**Problem solved.** The team cannot currently distinguish cold starts, database work, cache behavior, RSC cost, or image latency in production.

**User value.** Indirect but essential: fewer slow pages, faster incident recovery, and safer releases.

**Engineering complexity:** L

**Dependencies.**

- Telemetry provider decision
- Correlation and privacy policy
- Route/query naming conventions
- Vercel and Atlas integration
- CI budget checks and release annotations

**Why v3.2 instead of v3.1.1.** v3.1.1 should add a minimum baseline; v3.2 should make it a supported operational capability with dashboards, alerts, and budgets.

### 6. Asset quality and responsive art direction

**Problem solved.** Media usage/replacement already exists, but assets lack focal-point control, per-placement crops, duplicate detection, meaningful alt-quality enforcement, and a coherent single-optimizer delivery pipeline.

**User value.** Editors can use one source asset safely across homepage, cards, details, social images, and mobile without awkward crops or filename-style accessibility text.

**Engineering complexity:** L

**Dependencies.**

- Cloudinary loader/delivery decision
- Crop/focal metadata schema
- Public media DTO revision
- Usage impact preview
- Media health rules

**Why v3.2 instead of v3.1.1.** The delivery bug belongs in v3.1.1; author-controlled art direction and quality automation change the media model and editor.

### 7. Privacy-conscious content analytics

**Problem solved.** Editors have no feedback about which evidence, searches, relationships, or calls to action are useful. Current editorial decisions rely on intuition.

**User value.** Studio can show content reach, discovery paths, search terms with no result, and conversion to Contact/Career Interest without turning the site into an ad-tech product.

**Engineering complexity:** L

**Dependencies.**

- Explicit privacy/retention policy
- First-party event schema
- Bot filtering
- Aggregate storage
- Public consent/legal review where required
- Studio visualization and role access

**Why v3.2 instead of v3.1.1.** This is a new data product with privacy, retention, and reporting consequences.

### 8. Identity and security administration

**Problem solved.** User management exists, but identity is password-only and sessions are not administrable. Roles are broad and there is no MFA/WebAuthn, recovery-code flow, session revocation, or security-event view.

**User value.** Safer Studio access and controlled account recovery as the editorial team grows.

**Engineering complexity:** L

**Dependencies.**

- Auth framework/platform decision
- Durable rate limiting
- Security event log
- Recovery and support policy
- Potential OAuth/SSO decision

**Why v3.2 instead of v3.1.1.** Durable throttling is a patch; MFA, session management, and identity-provider support are new user-facing systems.

### 9. Governed AI authoring operations

**Problem solved.** AI authoring already exists, but rate limiting is per-process and there is no visible budget, prompt/version audit, provider health, queued execution, or provenance record.

**User value.** Editors know when AI is available, what it changed, and what it costs; administrators can set budgets and audit provider use.

**Engineering complexity:** L

**Dependencies.**

- Durable rate and budget store
- Structured generation events
- Prompt/version registry
- Provider metrics
- Privacy and retention decisions

**Why v3.2 instead of v3.1.1.** v3.1.1 should secure the existing calls. Governance and operational controls are a larger capability.

### Recommended v3.2 sequence

1. Operational observability and query budgets
2. Query-backed content platform and cache dependency model
3. Collaboration-safe editing/version recovery
4. Editorial review workspace/publication releases
5. Shared indexed discovery
6. Asset quality/art direction
7. Identity administration
8. Analytics and governed AI operations

Building workflow or analytics features before the first two items would increase the cost and opacity of every later migration.

---

## 10. Phase 7 — Technical debt before v4

### P0 — Resolve before major feature expansion

| Debt | Risk | Required direction |
|---|---|---|
| Interleaved public loading/projection/graph work | Query explosion and broad cache coupling | Request-scoped batch snapshot plus pure projectors |
| Incomplete/ad hoc cache invalidation | Stale public content and cache stampedes | Mutation-owned dependency invalidation with contract tests |
| Editor state tied to component mount | Data loss and inability to support collaboration | Persistent editor state machine and save/leave protocol |
| Best-effort event log | Missing audit facts without detection | Structured failure visibility, version linkage, then outbox/transaction policy |
| No production telemetry | Architecture cannot be operated or tuned | Traces, query/cache metrics, Web Vitals, errors, alerts |

### P1 — Resolve during v3.2

| Debt | Risk | Required direction |
|---|---|---|
| Generic full-collection repository lists | Memory/latency cliff | Typed projected queries, cursor pagination, indexed sort/filter |
| In-memory Studio/public search | Linear scaling and incomplete content search | Shared incremental search index with visibility policy |
| 1,381-line public repository | Hard-to-test coupling and repeated work | Split loaders, policy, graph, detail, homepage, discovery |
| Health and document-role contracts duplicated | Silent drift when collections evolve | One typed collection/owner/document registry |
| Mixed `ObjectId`/string foreign keys | Join/index/migration complexity | One persistence representation plus migration |
| Lazy/manual index creation | Environment drift and late scans | Versioned migration/index runner |
| Studio shell/editor client boundaries | Large bundles and nested layout behavior | Server-first shell, focused client islands, explicit scroll ownership |
| Contradictory architecture documents | Incorrect implementation decisions | Status taxonomy and release-time documentation audit |

### P2 — Remove or make real before v4

| Debt | Risk | Required direction |
|---|---|---|
| Unused System settings | False affordance | Wire to runtime consumers or delete |
| Hardcoded deployment/integration status | Misleading diagnostics | Runtime-derived environment and actual health checks |
| Speculative auth adapter paths | Unnecessary concepts | Adopt for a concrete identity roadmap or remove |
| Permanently unproduced event type | False Activity capability | Implement semantic event or delete schema/filter |
| Unused responsive media `srcSet` | Payload and conceptual duplication | Choose Cloudinary or Next as the single optimizer |
| Comments used as performance proof | False confidence | Enforce budgets in tests and telemetry |

### Scaling guardrails

HubZero should not wait for arbitrary “large scale” before acting. Use observable triggers:

- If any Studio list reads more than one page of records into memory, move it to cursor pagination.
- If a route performs more than a documented query budget, fail a performance contract test.
- If cache invalidation touches unrelated collections, treat it as a correctness/performance regression.
- Before Activity reaches 10,000 events, add feed-aligned compound indexes and retention/export policy.
- Before multiple concurrent editors are routine, ship revision tokens and conflict handling.
- Before serverless concurrency is increased, load-test Atlas connection usage with explicit pool bounds.
- Before search exceeds a few hundred content records or includes Document blocks, migrate to the shared index.

---

## 11. Phase 8 — Overall assessment

### Engineering maturity: 6/10

The codebase shows serious thought: strong runtime validation, domain-specific permissions, immutable public DTOs, unusually extensive pure tests, documented architectural decisions, and careful handling of preview/public visibility. The gap is operational execution. No CI, browser regression suite, production telemetry, migration discipline, or enforceable query budgets is below the expected baseline for a professional production CMS.

### CMS quality: 6/10

HubZero is substantially more than an admin CRUD panel. Featured Order, Documents, relationship health, public Evidence Graph, media usage/replacement, activity, history, and publication health are coherent CMS ideas. However, a CMS that can lose edits on a tab switch, publish into stale caches, and load full collections in memory is not mature enough to claim platform-level reliability.

### Editorial workflow: 6/10

The status workflow, rejection note, preview, health, and ordering controls are credible for one or two editors. The workflow becomes weak as soon as collaboration matters: no assignment/approval record for content review, no review threads, no conflict handling, no compare/restore, no scheduled release, and inconsistent save semantics.

### Scalability: 4/10

Current scale is tiny. Performance is being protected by data volume and cache warmth, not by bounded query design. Whole-collection reads, per-entry expansion, global graph rebuilds, global invalidation, in-memory search, and per-instance Mongo pools are an architectural cliff. The system can likely serve current traffic, but it is not ready for a deep publication archive or a larger editorial team without the v3.2 data-platform work.

### Maintainability: 6/10

Type safety, validation, tests, and central configuration help. The public repository monolith, duplicated contracts, mixed identifier types, dead settings, and contradictory canonical documents work against those strengths. The code often has detailed comments, but some comments describe intended behavior that the actual call graph does not provide.

The most over-engineered area is public projection orchestration: a valuable Evidence Graph is repeatedly reconstructed to answer small questions such as a homepage badge or event label. The most under-engineered areas are the surrounding operational basics—bounded queries, cache dependency tracking, telemetry, CI, and migrations. Sophisticated domain abstractions do not compensate for missing workload discipline.

### UX quality: 7/10

Visual craft is above average. Studio is coherent, dense, and mostly consistent. The most damaging UX issues are not cosmetic: redundant keyboard focus, nested scrolling, indirect dashboard links, stale mutation state, and ambiguous persistence. These are the details that separate a polished demo from dependable daily software.

### Public-site quality: 8/10

The public experience is the strongest surface. It is visually disciplined, content-rich without waste, accessible in sampled audits, structurally well marked up, and consistent with HubZero's evidence-first positioning. Mobile navigation and dynamic-route latency are the main product defects. The larger weakness is editorial depth: the software supports more content types than production currently demonstrates.

### Security and reliability: 5/10

Authorization, validation, disabled-account behavior, public DTO separation, sanitization, and security headers are thoughtful. Missing durable rate limiting, MFA/session administration, event-write visibility, CI, and incident telemetry leave the operational security posture incomplete. The `sanitize-html` advisory is low practical risk under the current allowlist and should still be patched immediately.

### Professional CMS comparison

| Capability | HubZero today | Professional production CMS expectation |
|---|---|---|
| Content modeling | Strong bespoke models | Strong |
| Public projection/visibility | Strong | Strong |
| Media management | Good | Good to strong |
| Workflow statuses | Good for a small team | Good |
| Review collaboration | Minimal | Threads, assignments, approvals |
| Versioning/recovery | Storage foundation only | Compare, restore, attribution |
| Concurrent editing safety | Weak | Conflict detection or locks |
| Search | Adequate at small scale | Indexed, incremental, faceted |
| List/query scalability | Weak | Server filtering, sort, pagination |
| Publishing operations | Basic | Scheduling, releases, atomicity |
| Observability | Weak | Traces, errors, metrics, alerts |
| Release engineering | Weak | CI, E2E, migrations, rollback |
| Accessibility | Good sampled baseline | Continuously regression-tested |
| Public experience | Strong | Strong |

### Biggest strengths

1. The public information architecture and evidence-first presentation are distinctive and coherent.
2. The public data boundary and visibility rules are more disciplined than many bespoke CMS implementations.
3. Relationships are modeled as product capability rather than decorative cross-links.
4. Studio already covers a broad editorial lifecycle without collapsing into generic admin templates.
5. Runtime validation, permissions, unit tests, and architectural documentation show real engineering intent.

### Weakest areas

1. Data-access and cache architecture
2. Editor persistence and collaboration safety
3. Production observability and deployment topology
4. Browser-level release verification
5. Documentation truth and migration discipline

### Final assessment

HubZero v3.1.0 is a strong product prototype and a credible internal CMS for a small, careful team. It is not yet a professionally mature CMS platform.

The difference is not another visible feature. It is whether an editor can trust that work is never lost, a successful publish is immediately public, a dashboard link tells the truth, a route remains fast after the cache is cold, and engineering can explain a production slowdown from telemetry rather than source archaeology.

v3.1.1 should close those trust gaps. v3.2 should build collaboration and publishing capability only after the query, cache, migration, and observability foundations are strong enough to carry it.
