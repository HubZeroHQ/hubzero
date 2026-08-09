# HubZero v3.2.0 Performance and Scale Plan

**Status:** M62 established an isolated same-cluster performance database and ordinary Preview test session; Studio sampling remains deliberately pending
**Baseline date:** 8 August 2026
**Baseline revision:** `c2618c1` (`main`, v3.1.1 merged)
**M32 branch:** `dev` at `88ac3e1` plus the uncommitted working tree described below
**Release scope:** performance, production reliability, and lightweight observability

## Executive summary

HubZero is fast under a local production server but materially slower on Vercel. The first M31 pass shows that this is not one problem:

- Vercel's static/ISR cache is effective after the first request. Warm public cache hits generally return in about 90–170 ms TTFB.
- `/work`, `/blueprints`, `/labs`, and `/search` are dynamically rendered and bypass the Vercel response cache. Warm TTFB is typically about 300–390 ms, with expensive first-request totals of 0.75–4.12 seconds.
- Several shared public repository helpers expand relationships, media, authors, taxonomy, and documents using hundreds of small MongoDB operations. A representative Work detail read issued 162 operations; Blueprint detail issued 85; the home data composition issued 185.
- Studio dashboard, health, and editor paths are the largest measured database consumers. A representative Blueprint editor issued 507 MongoDB operations and took 4.85 seconds in a direct repository measurement. Studio health issued 492 operations and took 4.23 seconds.
- The Mongo client is correctly memoized and initialization is race-safe within one server process. It is not process-global across Vercel instances. With the Node driver default `maxPoolSize` of 100 and Atlas M0's 500-connection limit, a small number of independently saturated instances can approach the tier limit. This is a capacity risk, not proof of a connection leak.
- Production indexes serve current slug, status, owner, and taxonomy filters. Two observed shapes use collection scans or blocking sorts, but the production data set is only 190 documents, so neither is currently a proven latency source. Index changes should wait for representative-volume evidence.
- Studio editor First Load JS remains 346–349 kB, while the shared baseline is 102 kB and most public routes are 106–141 kB. Bundle work is warranted after the server/database waterfalls are addressed.

No application optimization is accepted by this document yet. This pass establishes a baseline, identifies the highest-confidence bottlenecks, and defines the measurement gates for M32–M40. The remaining M31 work is production telemetry for connection checkout, per-request database work, cache outcomes, server duration, and true cold starts.

## Evidence language

Every finding is labeled using this vocabulary:

- **Proven** — directly measured, reproduced, or established from the running code and deployed configuration.
- **Strong hypothesis** — supported by measurements and architecture, but not isolated sufficiently to claim causation.
- **Unknown** — requires additional production telemetry, representative data, or access that was not available during this pass.

The terms apply at the finding level. A measured symptom does not automatically prove its cause.

## Baseline measurements

### Method and constraints

**Proven.** Measurements used the v3.1.1 `main` revision and the production domain. The local comparison used `npm run build && npm start` against the same configured remote database. Public requests recorded TTFB, total transfer time, response size, and response-cache headers. Each route received a cache-busted first request followed by two requests to the exact same URL. Studio timings were measured from authenticated browser navigation until useful route content appeared.

These results are diagnostic samples, not percentile distributions. Browser timings include navigation, server work, response transfer, hydration, and the route's client-side requests. Direct repository measurements instrumented MongoDB commands; summed MongoDB duration can exceed wall time when operations run concurrently.

**Unknown.** The current pass does not yet have a controlled multi-region runner, Vercel function execution traces, Atlas connection metrics, true isolated cold-start control, or 20-plus samples per route. The production deployment was already live, so a cache-busted URL is a cold cache key, not proof of a cold function instance.

### Public Vercel baseline

Times are milliseconds. “First” is a cache-busted request; warm values are the next two exact-URL requests.

| Route | First TTFB | First total | Warm TTFB | Warm total | Bytes | Observed response behavior |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `/` | 581 | 721 | 144 / 105 | 168 / 130 | 99,879 | first fill, then cache hit |
| `/work` | 734 | 2,774 | 390 / 326 | 409 / 347 | 36,611 | dynamic, private/no-store |
| `/builds` | 570 | 592 | 92 / 93 | 110 / 111 | 44,708 | static/ISR cache hit |
| `/blueprints` | 336 | 3,996 | 377 / 334 | 503 / 394 | 136,286 | dynamic, private/no-store |
| `/labs` | 322 | 751 | 316 / 318 | 346 / 340 | 42,661 | dynamic, private/no-store |
| `/notes` | 611 | 611 | 88 / 118 | 90 / 119 | 31,237 | static/ISR cache hit |
| `/engineering` | 634 | 662 | 137 / 96 | 160 / 119 | 82,655 | static/ISR cache hit |
| `/careers` | 617 | 638 | 103 / 123 | 124 / 145 | 43,034 | static/ISR cache hit |
| `/search?q=blueprint` | 556 | 4,121 | 366 / 321 | 399 / 353 | 50,631 | dynamic, private/no-store |
| `/work/bhatkal-time-luxe` | 603 | 626 | 89 / 112 | 116 / 138 | 71,691 | static/ISR cache hit |
| `/builds/querycraft` | 671 | 718 | 104 / 109 | 171 / 158 | 114,737 | static/ISR cache hit |
| `/blueprints/corporate-editorial` | 605 | 626 | 115 / 136 | 135 / 636 | 95,817 | static/ISR; one warm transfer outlier |
| `/labs/nexus` | 661 | 687 | 97 / 101 | 121 / 123 | 103,104 | static/ISR cache hit |
| `/engineering/rifaque` | 626 | 699 | 105 / 110 | 163 / 160 | 118,502 | static/ISR cache hit |

**Proven.** Static/ISR requests reported `X-Vercel-Cache: HIT` after the first request. Dynamic collection/search responses reported `private, no-cache, no-store` and `MISS`. Static responses were served from `bom1`; dynamic responses exposed request identifiers spanning `bom1::iad1`.

### Local production baseline

The same routes on a warmed local production server were:

| Route | First TTFB / total | Warm TTFB / total |
| --- | ---: | ---: |
| `/` | 27 / 27 | 6 / 6 |
| `/work` | 53 / 66 | 15 / 17 |
| `/builds` | 7 / 7 | 4 / 4 |
| `/blueprints` | 15 / 36 | 19 / 25 |
| `/labs` | 13 / 20 | 11 / 13 |
| `/notes` | 6 / 6 | 3 / 3 |
| `/engineering` | 6 / 6 | 28 / 28 |
| `/careers` | 6 / 6 | 3 / 3 |
| `/search?q=blueprint` | 13 / 24 | 13 / 17 |
| representative detail routes | 7–12 / 7–22 | 3–4 / 3–4 |

**Proven.** The Vercel/local gap exists even for warm requests. Its size depends on route cacheability and query shape. Local speed does not demonstrate that the deployed connection/query architecture is healthy because the local process is persistent and its network path differs.

### Authenticated Studio baseline

“Useful content” is a browser-observed navigation milestone, not server-only response time.

| Route | Vercel | Local production | Vercel/local ratio |
| --- | ---: | ---: | ---: |
| `/studio/dashboard` | 5,625 | 4,636 | 1.21× |
| `/studio/content/work` | 642 | 692 | 0.93× |
| `/studio/content/blueprints` | 819 | 422 | 1.94× |
| representative Blueprint editor | 12,985 | 4,284 | 3.03× |
| `/studio/health` | 12,734 | 3,661 | 3.48× |
| `/studio/activity` | 1,474 | 415 | 3.55× |
| `/studio/search` | 938 | 485 | 1.93× |

**Proven.** Simple collection pages are comparatively healthy. Health and editor routes are slow locally and become materially slower in production, showing both application-query cost and an additional production penalty.

### Build and client baseline

**Proven.** A clean production build completed successfully in 52.5 seconds with Next.js 15.5.22 and generated 86 static pages. The route table reported:

- shared First Load JS: 102 kB;
- most public routes: 106–121 kB;
- careers routes: 135–141 kB;
- Studio editor routes: 346–349 kB;
- `/work`, `/blueprints`, `/labs`, and `/search`: dynamic rendering;
- builds, notes, engineering, careers, and representative detail routes: static generation or ISR.

Build output is a transfer-size proxy. It does not measure parse, execution, hydration, or interaction latency.

## MongoDB connection architecture findings

### Lifecycle inventory

**Proven.** `src/lib/db/mongodb.ts` is the sole application `MongoClient` construction site. It creates one lazy connection promise, stores that promise on `globalThis`, and clears the cache when connection fails. Concurrent callers in one process share the same in-flight promise. `getDb`, repositories, and the Auth.js adapter all use this path. Application code does not call `MongoClient.close()` during a request.

Therefore:

- one Node process can create one application client through this module;
- initialization is race-safe inside that process;
- a warm Vercel function instance can reuse its client;
- separate Vercel instances cannot share the global cache and each can own a pool;
- a recycled instance abandons its process-local pool as part of process termination.

The installed MongoDB driver is 6.21.0. No pool options are configured in code or in the inspected URI beyond the application name. Relevant driver defaults are `maxPoolSize: 100`, `minPoolSize: 0`, `maxConnecting: 2`, `maxIdleTimeMS: 0`, `waitQueueTimeoutMS: 0`, `connectTimeoutMS: 30000`, and `serverSelectionTimeoutMS: 30000`.

MongoDB documents a 500-connection limit for the Atlas free tier and notes that driver pools and monitoring connections contribute to totals. See the official [Node driver pool documentation](https://www.mongodb.com/docs/drivers/node/current/connect/connection-options/connection-pools/) and [Atlas connection alert guidance](https://www.mongodb.com/docs/atlas/reference/alert-resolutions/connection-alerts/).

### Capacity reasoning

**Proven.** A pool is bounded per process, but the deployment-wide number of pools is not bounded by this module. If five independent instances each reached 100 checked-out/application connections, their application connections alone would equal the M0 limit. Monitoring sockets and topology behavior add overhead. `maxConnecting: 2` moderates simultaneous socket creation inside one pool, not pool creation across cold instances.

**Strong hypothesis.** Current routes that issue 140–519 operations can hold many sockets busy and drive pool expansion during concurrent traffic. Combined with multiple Vercel instances, this can explain the resolved Atlas threshold alert without requiring a leaked client.

**Unknown.** Peak concurrent instances, actual pool size per instance, checkout wait duration, connection churn, and the exact connection count at alert time are unavailable. The alert alone does not prove a leak or justify a pool-size change. M32 must collect these values before changing pool settings.

Local fresh-client samples using `maxPoolSize: 1` acquired and connected in 413, 322, and 251 ms; the first ping then took 27, 29, and 19 ms. These measurements establish that connection creation is much more expensive than a warm database command on the local network path. They do not measure Vercel acquisition.

## MongoDB query hotspots

### Direct command inventory

The following measurements instrumented MongoDB commands while executing the shipped repository paths against the configured read-only production data. “Mongo sum” adds command durations and therefore can exceed wall time for concurrent work.

| Path/composition | Wall time | Operations | Mongo sum | Dominant operation groups |
| --- | ---: | ---: | ---: | --- |
| public home data | 2,013 ms | 185 | 5,533 ms | media 71, taxonomy 40, team 21, documents 17 |
| Work collection | 77 ms | 2 | 47 ms | work list/count |
| Blueprint collection | 262 ms | 31 | 786 ms | taxonomy 10, media 20 |
| Work detail | 1,578 ms | 162 | 5,720 ms | media 65, taxonomy 47, team 22 |
| Blueprint detail | 886 ms | 85 | 3,143 ms | media 35, taxonomy 24, team 11 |
| Engineering collection | 1,071 ms | 110 | 3,934 ms | repeated relationship/media expansion |
| discovery composition | 557 ms | 79 | 2,029 ms | cross-type expansion |
| Blueprint eligibility | 1,521 ms | 140 | 5,729 ms | repeated content/relationship expansion |
| Studio dashboard composition | 5,102 ms | 519 | 36,998 ms | media 196, taxonomy 131, team 60 |
| Studio health | 4,229 ms | 492 | 33,357 ms | repeated eligibility and relationship work |
| Studio activity | 778 ms | 18 | 5,562 ms | full Studio search-index labeling |
| Studio search | 80 ms | 16 | 383 ms | cross-type lists |
| Studio Blueprint list | 62 ms | 2 | 61 ms | list/count |
| Studio Blueprint editor | 4,848 ms | 507 | 37,950 ms | media 200, taxonomy 129, team 58 |

### Ranked query observations

1. **Proven — repeated relationship expansion is the largest observed database cost.** Shared expansion helpers fetch related media, taxonomy, authors, and documents in per-entry/per-reference operations. The cost appears in public details, engineering, eligibility, dashboard, health, and editors.
2. **Proven — the Studio editor performs global health work.** Entry Inspector invokes a full health report during editor loading. The editor also loads the document, relationships, hero/gallery media, history, and global options. This converts an entry-focused route into a roughly 500-operation composition.
3. **Proven — health repeats expensive eligibility work.** Health runs multiple content-type eligibility passes plus careers, services, team, profiles, and a relationship scan. The relationship scanner itself uses nine broad lists and in-memory matching; the repeated expansion around it is the larger issue.
4. **Proven — dashboard groups independent top-level work but each group is expensive.** Content/leads, health, and recent activity are rendered independently; their internals still perform duplicate broad reads and expansions.
5. **Proven — activity constructs a broad Studio search index to label a small event set.** Eighteen event operations led to 5.56 seconds of summed command duration in the sample.
6. **Proven — simple Studio collection lists are not currently a major database bottleneck.** Representative lists used two operations and completed in tens of milliseconds, although filtering and pagination are performed in memory and will not scale indefinitely.
7. **Strong hypothesis — batching references by collection and ID will outperform fine-grained parallelism.** Existing concurrency reduces wall time locally, but operation count remains high and amplifies network latency, connection demand, and Atlas work in production.
8. **Unknown — production command percentiles and request-level duplication.** Direct measurements reproduce repository behavior but are not attached to actual Vercel requests. Lightweight request correlation is required to establish production p50/p95 values.

## Index findings

The production database contained 190 documents at measurement time: 10 blueprints, 1 build, 7 counters, 6 document versions, 52 documents, 18 editorial events, 5 engineering profiles, 1 lab, 54 media records, 23 taxonomy records, 5 team members, 5 users, 1 setting, 1 work entry, and no notes, services, or leads. Atlas denied `serverStatus`, as expected for the current role/tier.

### Explain results

| Collection/query shape | Plan | Examined / returned | Time | Finding |
| --- | --- | ---: | ---: | --- |
| Blueprint `{ slug }` | IXSCAN | 1 / 1 | 0 ms | current slug index serves lookup |
| Blueprint `{ status }` | IXSCAN | 10 / 10 | 0 ms | current status index serves filter |
| Documents `{ ownerType, ownerId }` | IXSCAN | 1 / 1 | 0 ms | owner compound index serves lookup |
| Document versions `{ documentId }`, sort `createdAt` | COLLSCAN + SORT | 6 / 1 | 0 ms | missing compound index; growth risk |
| Editorial events by entry, sort `createdAt, _id` | IXSCAN + SORT | 1 / 1 | 1 ms | deployed index lacks `_id` sort suffix |
| Editorial events by collection | IXSCAN + SORT | 1 / 1 | 0 ms | same schema drift; negligible today |
| Team public predicate | COLLSCAN | 5 / 5 | 0 ms | tiny collection; index not justified yet |
| User `{ email }` | IXSCAN | 1 / 1 | 1 ms | served by index |
| Taxonomy `{ kind }` | IXSCAN | 23 / 23 | 0 ms | served by index |

**Proven.** Deployed editorial-event indexes use earlier key shapes and names, while current source declares variants including `_id`. Index creation is lazy on repository writes, so source and production have drifted.

**Proven.** No measured query is slow because of a collection scan at the current data volume. The observed latency is dominated by round-trip count rather than documents examined.

### Evidence-gated candidates

| Candidate | Query served | Expected benefit | Tradeoff | Decision gate |
| --- | --- | --- | --- | --- |
| `documentVersions: { documentId: 1, createdAt: -1, _id: -1 }` | latest/history for one document | removes scan and blocking sort as history grows | additional write and storage cost | add in M33 only after representative-volume explain |
| align editorial-event compound indexes with source sort | entry/collection/actor activity feeds | removes blocking sort and makes pagination stable | redundant old indexes may remain until a safe migration | inventory query variants, then create non-destructively |
| content-type compound status/sort indexes | public/studio ordered lists | may reduce examined documents and in-memory sort at scale | many collections and extra write overhead | require realistic document counts and explain evidence |

Do not drop old indexes in this release without production usage evidence and a separately approved migration. M0 supports ordinary secondary and compound indexes, but its resource limits make unnecessary indexes especially undesirable.

## Cache findings

**Proven.** v3.1.1 public invalidation behavior must remain the correctness boundary. The current deployment demonstrates that static/ISR pages can deliver fast warm responses. It also demonstrates that several collection routes and search intentionally or incidentally bypass the response cache.

**Proven.** Cached warm public routes generally measured about 90–170 ms TTFB. Warm dynamic collection/search routes measured about 300–390 ms TTFB. This is a material difference, but it does not by itself prove those routes are safe to make static.

**Strong hypothesis.** Repeated lower-level reads within one request can be deduplicated or batched without weakening cross-request invalidation. This should be attempted before widening response-cache lifetimes.

**Unknown.** Server data-cache hit/miss rates are not observable today. Response headers expose the outer Vercel cache but not repository or Next data-cache outcomes. M34 must add explicit, privacy-safe cache outcome counters before changing boundaries.

Any cache proposal must enumerate every existing mutation that invalidates it, including publishing, unpublishing, archival, relationship changes, media changes, taxonomy changes, author/team changes, and slug changes. A faster stale page is a regression.

## Vercel diagnosis

**Proven.** The production project is on Vercel Hobby with Fluid Compute enabled, a standard 1 vCPU/2 GB function shape, and `iad1` (Washington, D.C.) as its only configured function region. The public edge response commonly enters at `bom1`. Vercel Speed Insights had no usable data during this pass.

**Unknown.** Atlas cluster region was not available from the signed-out Atlas console or the redacted connection configuration. Consequently, database/function network distance is not yet known.

The current diagnosis separates these components:

| Component | Evidence | Status |
| --- | --- | --- |
| edge-to-function routing | dynamic IDs show `bom1::iad1` | Proven |
| response-cache benefit | warm HIT routes are materially faster | Proven |
| database operation amplification | 79–519 operations on expensive compositions | Proven |
| fresh connection overhead | 251–413 ms from local path | Proven locally only |
| Vercel connection acquisition | no production timing | Unknown |
| Atlas network distance | Atlas region unknown | Unknown |
| function cold-start share | no controlled instance lifecycle | Unknown |
| server rendering/computation share | no Vercel span breakdown | Unknown |

**Strong hypothesis.** Dynamic routes pay a fixed production network/runtime floor plus amplified database round trips. Cached routes avoid most of this work. The production penalty on Studio health, activity, and editors is consistent with remote round-trip amplification, but Vercel spans and Atlas region data are required before attributing the difference to region distance.

M36 should not change region or runtime until a deployment experiment compares the same route/query mix with database and function timings. A region change can improve database latency while worsening user-to-function latency; both must be measured.

## Studio performance findings

### Dashboard

**Proven.** Dashboard rendering includes a content/leads overview, a full health overview, and recent activity. The top-level groups can render independently, but their repository paths repeat broad content expansion. The direct composition issued 519 database operations.

Recommendation: first create one request-scoped inventory of the minimal fields each widget needs. Batch shared counts and references. Preserve independent streaming/rendering where it improves useful-content time. Do not cache private, rapidly changing editorial state until freshness requirements and invalidation are explicit.

### Editors

**Proven.** A representative editor loads entry data, taxonomy/options, media, relationships, document/history information, and a global health report. The full health report is not required to make the selected entry editable. This path issued 507 operations and the production useful-content milestone was 12.99 seconds.

Recommendation: make entry-critical data the initial boundary; compute entry-scoped validation from already loaded data; defer the global inspector/report behind user intent or a separate streamed boundary. Batch media, taxonomy, and team references by unique ID. Maintain dependency ordering for data that genuinely depends on the entry.

### Health, activity, lists, and search

- **Proven:** Health repeatedly expands eligibility across types and issued 492 operations. Build one shared minimal inventory and evaluate rules in memory where correctness permits.
- **Proven:** Activity builds a broad search index to label a small event list. Resolve only unique visible event targets, in batches.
- **Proven:** Studio search used 16 operations and about 80 ms in direct measurement; it is not an immediate hotspot at current scale. Keep result limits bounded.
- **Proven:** Representative collection lists used two operations. Avoid rewriting them now. Track their in-memory pagination/filtering as a scale risk.
- **Unknown:** Autosave request frequency, overlapping saves, and cancellation behavior were not load-tested in this pass. Instrument before modifying.

## Client bundle findings

**Proven.** Editor routes carry roughly 244–247 kB more First Load JS than the 102 kB shared baseline. Public route totals are substantially smaller, with careers the largest observed public family at 135–141 kB.

The editor surface combines rich text/document tooling, media selection, taxonomy and relationship controls, history, preview, and health/inspector UI. The build table proves route weight but does not identify package ownership or unused exports.

M37 should produce a bundle analyzer artifact and a hydration profile before changing imports. Candidate boundaries are editor-only panels that are not needed for initial editing: media browser, history, preview, and global health/inspector tooling. Load them on intent or after the core editor becomes interactive. Keep editor code route-local and move data-only work to server components/actions where the current interaction model permits.

Do not split a dependency merely to improve the build table if it delays interaction, creates duplicate downloads, or adds request waterfalls. Public bundle work should focus on measured hydration cost and route-local dependencies; its current transfer sizes alone do not justify a rewrite.

## Performance observability findings

**Proven.** The architecture lacks a shared request-level view of database acquisition, operation count, command duration, and data-cache outcome. Existing logs can expose failures but cannot explain a slow route without ad hoc instrumentation.

M38 should add a small server-only measurement layer with:

- request/operation name and total duration;
- MongoDB client acquisition duration;
- command count and total database duration;
- optional counts by operation/collection, with collection names allow-listed;
- cache layer and hit/miss/bypass outcome;
- runtime region and a process-instance marker sufficient to infer warm reuse;
- sampled structured output and threshold-based warnings.

It must not record connection strings, credentials, request bodies, document bodies, search text, user email, private identifiers, or raw database filters. Use coarse route templates and generated trace IDs. Production sampling must be configurable, inexpensive, and default to summaries rather than one log per database command.

Instrument repository boundaries rather than create duplicate query implementations. Where driver command monitoring is used, attach it to the existing singleton client. Observability must not change caching or query semantics.

## Ranked performance issues

| Rank | Issue | Evidence | Impact | Confidence |
| ---: | --- | --- | --- | --- |
| 1 | repeated per-reference MongoDB operations in health/editor/dashboard and public expansion | 140–519 measured operations | latency, pool pressure, Atlas work | Proven |
| 2 | global health computation on entry editor critical path | 507 operations; 12.99 s production editor | editor usability and reliability | Proven |
| 3 | no production request/database/cache telemetry | causal split cannot be measured | blocks safe optimization and regression detection | Proven |
| 4 | function pool capacity is large relative to M0 limit | 100 default per process vs 500 tier limit | connection alert recurrence under scale-out | Strong hypothesis |
| 5 | dynamic public routes pay production floor on every request | 300–390 ms warm TTFB and no-store | public response time | Proven symptom; cause split unknown |
| 6 | activity labels events through broad search-index work | 5.56 s summed DB time | Studio activity latency | Proven |
| 7 | editor client bundle is 346–349 kB | build output | download/hydration cost | Proven size; user impact unmeasured |
| 8 | source/deployed index drift for versions/events | explain and index inventory | future history/activity scale | Proven drift; low current cost |
| 9 | Vercel/Atlas region relationship unknown | `iad1` known, Atlas region unknown | possible round-trip floor | Unknown |
| 10 | in-memory Studio filters/pagination | source audit | future collection scale | Strong hypothesis, low current cost |

## Recommended M31–M40 work

### M31 — Performance baseline

1. Preserve this route, query, connection, index, cache, and bundle inventory.
2. Add at least 20 controlled cold-key and warm samples for every required public route; report median, p75, p95, and outliers.
3. Repeat authenticated Studio samples with navigation/network traces and separate initial HTML, route data, and hydration.
4. Obtain Atlas region, connection charts around the historical alert, and current peak connection count through read-only access.
5. Add temporary non-invasive sampling sufficient to split connection acquisition, database commands, server computation, and render time.
6. Close M31 only after the production/local and cold/warm comparisons are reproducible. No major optimization belongs in this milestone.

### M32 — MongoDB connection architecture

1. Measure per-instance pool creation, checkout latency, checked-out count, waiters, and connection errors under representative concurrency.
2. Model the expected Vercel instance count and M0 headroom from measured traffic.
3. If supported by evidence, set a conservative explicit pool size and finite checkout wait behavior on the existing singleton client. Measure throughput and errors before/after.
4. Validate warm reuse and failed-initialization recovery. Do not introduce a second client/cache abstraction.
5. Run a controlled concurrency test against scratch/development data; production tests remain read-only and rate limited.

### M33 — MongoDB query optimization

1. Remove the global health report from the editor's critical data path and measure editor operation/time changes.
2. Replace per-reference media, taxonomy, team, and document reads with unique-ID batch queries at existing repository boundaries.
3. Reuse request-scoped expanded data across dashboard and health consumers.
4. Resolve visible activity entities in bounded batches instead of building the entire search index.
5. Re-run command inventories and explains after each isolated change.
6. Test document-version and editorial-event compound indexes with representative-volume scratch data; create only demonstrated indexes, non-destructively.

### M34 — Public data and cache performance

1. Record inner data-cache hit/miss/bypass outcomes and the reason for dynamic rendering.
2. Deduplicate/batch home, detail, engineering, discovery, and eligibility reads without changing cache tags or invalidation.
3. Evaluate `/work`, `/blueprints`, and `/labs` for ISR only after proving every mutation path invalidates the result.
4. Keep search dynamic and bounded unless a measured alternative preserves freshness and query correctness.
5. Test publish, unpublish, archive, media, taxonomy, relationship, team/author, and slug invalidation after every cache-boundary change.

### M35 — Studio performance

1. Give dashboard widgets a shared minimal inventory and retain safe independent rendering.
2. Split editor-critical and supplemental data; defer global health/history/media browsers where user intent permits.
3. Compute health rules from a bounded minimal inventory rather than repeatedly hydrating full public views.
4. Batch activity target resolution and keep Studio search bounded.
5. Measure autosave concurrency before changing it. Do not parallelize dependent writes.

### M36 — Vercel runtime optimization

1. Confirm Atlas region and measure function-to-database RTT from `iad1`.
2. Capture Vercel server duration, acquisition duration, database duration, and render duration for identical route samples.
3. Compare cold and warm instances using an explicit instance marker.
4. Test any region/runtime change as a reversible preview experiment, measuring both user TTFB and database latency.
5. Retain a change only if production-like measurements improve without reducing reliability or cache correctness.

### M37 — Client bundle optimization

1. Generate bundle ownership and browser performance profiles for public and representative editor routes.
2. Lazy-load non-critical editor panels on intent; keep the core document editor immediately available.
3. Remove accidental global/shared imports and unnecessary client boundaries.
4. Record before/after transferred JS, parsed/executed JS, hydration time, and interaction time on mobile and desktop.

### M38 — Performance observability

1. Land the minimal reusable measurement layer described above.
2. Add regression summaries to CI or a repeatable release script without making noisy network measurements a hard gate initially.
3. Document sampling, privacy constraints, metric definitions, and operational response thresholds.

### M39 — v3.2 release-candidate sweep

Use production-like data and the M31 harness to retest all listed public and Studio routes, searches, editors, invalidation paths, connections under concurrency, and mobile/desktop client behavior. Report comparable sample counts, distributions, query counts, and correctness outcomes. Investigate every material regression.

### M40 — v3.2.0 release

Release only after budgets are met or explicitly justified, connections remain below a measured safety threshold, Vercel results show meaningful improvement over M31, all correctness checks pass, and no major regression is unexplained. A green build alone is insufficient.

## Performance budgets

These are **provisional v3.2 targets**, derived from the measured baseline and current infrastructure. M31 must replace single-sample comparisons with distributions before they become release gates. Measurements use the same region, authentication state, route data, cache state, and sample protocol.

### Server and public budgets

| Metric | Target |
| --- | ---: |
| cached public warm TTFB | p75 ≤ 150 ms; p95 ≤ 250 ms |
| dynamic public warm TTFB | p75 ≤ 250 ms; p95 ≤ 400 ms |
| cached public total response | p75 ≤ 250 ms; p95 ≤ 400 ms |
| dynamic public total response | p75 ≤ 500 ms; p95 ≤ 1,000 ms |
| eligible public response-cache hit rate | ≥ 95% after warm-up |
| instrumented lower-level cache hit rate for repeated eligible reads | ≥ 90% after warm-up |

The first-request/cold budget will be set after true cold-instance data exists. Until then, every required route must improve its M31 p75 without a worse p95 or error rate.

### Studio budgets

| Route class | Useful-content p75 | Useful-content p95 |
| --- | ---: | ---: |
| collection list/search | ≤ 1.0 s | ≤ 1.5 s |
| activity | ≤ 1.25 s | ≤ 2.0 s |
| dashboard | ≤ 2.0 s | ≤ 3.0 s |
| health | ≤ 2.5 s | ≤ 4.0 s |
| editor core becomes editable | ≤ 2.5 s | ≤ 4.0 s |

Supplemental editor panels may stream or load after the core but must show deterministic progress and must not cause duplicate critical reads.

### Database and connection budgets

| Path | Maximum MongoDB operations per request/composition |
| --- | ---: |
| home | 40 |
| simple public collection | 8 |
| public detail | 30 |
| engineering/discovery/eligibility | 30 / 25 / 30 |
| Studio dashboard | 70 |
| Studio health | 80 |
| Studio editor initial load | 90 |

Additional targets:

- individual production MongoDB command p95 ≤ 100 ms; investigate commands ≥ 250 ms;
- connection checkout/acquisition p95 ≤ 50 ms on warm instances, with zero checkout timeouts in the RC load test;
- steady production connections below 300 (60% of the documented M0 limit), with burst behavior and alert headroom documented;
- no unbounded query or result set on a request path.

The operation budgets intentionally prioritize round-trip reduction. They may be adjusted only with measured evidence that a higher count is safe and faster than a more complex alternative.

### Client budgets

| Metric | Target |
| --- | ---: |
| shared/public common First Load JS | ≤ 115 kB |
| heaviest public route First Load JS | ≤ 135 kB, or explicit evidence for an exception |
| representative Studio editor First Load JS | ≤ 300 kB |
| simple Studio lists | no regression from M31 route total |

Bundle targets are secondary to useful-content and interaction performance. A smaller bundle that produces a new loading waterfall fails the budget.

## Verification strategy

Every optimization record must contain:

1. revision and environment;
2. route/query and representative data size;
3. sample count, cache state, and cold/warm definition;
4. before distribution, not only the best sample;
5. the smallest isolated change;
6. after distribution and percentage change;
7. MongoDB operation count and relevant explain output;
8. correctness checks, including cache invalidation when applicable;
9. complexity/cost tradeoff and keep/revert decision.

Required repository verification after implementation work:

```text
npm run lint
npm run typecheck
npm test
npm run build
npm audit
git diff --check
```

Database work additionally requires index inventory and `explain("executionStats")` against scratch or development data sized to the expected query shape. Connection work requires bounded concurrency tests and observation after the test ends. Public cache work requires an explicit mutation/invalidation matrix. Client work requires production build output plus mobile and desktop browser traces.

## Production monitoring requirements

Monitor and alert on:

- total Atlas connections, percentage of tier limit, connection rate, and sustained spikes;
- checkout/acquisition p50/p95, waiters, timeouts, and connection failures;
- route response/server duration p50/p75/p95 split by route template and cache state;
- MongoDB operation count and database-duration p50/p95 per route template;
- slow-command counts by allow-listed collection/operation, without filters or documents;
- outer response-cache and inner data-cache hit/miss/bypass rates;
- function errors, timeouts, cold/warm instance marker, and configured region;
- Studio useful-content and editor-editable milestones;
- public and editor client JS plus key mobile/desktop web vitals.

Retention and sampling should be sufficient to compare releases and diagnose an incident without becoming a logging platform. Alert thresholds should require sustained breaches where appropriate. Every dashboard must state units, aggregation, sample rate, and whether timings overlap.

## M31 conclusion and open evidence

The first pass proves that HubZero has excessive database operation amplification on important public and Studio compositions, and that Vercel's outer response cache materially improves warm public delivery. It also proves that the existing Mongo client is reused safely within a process while leaving deployment-wide pool capacity unconstrained.

It does **not** yet prove that pool size caused the Atlas alert, that Atlas/Vercel region distance is the primary latency source, that a new index will materially improve current production, or that dynamic routes can safely become ISR. Those remain hypotheses or unknowns until M31 telemetry closes the evidence gap.

Accordingly, v3.2.0 is not release-ready and no percentage improvement is claimed. The next controlled change should target the highest measured amplification—editor/global health and shared reference expansion—only after the missing request-level production baseline is captured.

## M32 — MongoDB query amplification

**Status:** implementation and controlled local measurement complete on 9 August 2026. Production/Vercel verification remains outstanding because this milestone is not authorized to deploy.

### Executive finding

**Proven.** HubZero performed hundreds of MongoDB operations because the same complete public evidence graph was rebuilt repeatedly and each rebuild resolved media, taxonomy, Team, Engineering Profile, and other references per entity. Studio health independently requested homepage eligibility for five collections, so one health report performed five graph builds. Entry Inspector placed that global report on every editor. Dashboard combined the report with another broad Studio inventory and activity's search index.

The problem was not primarily a slow individual query, missing index, or leaked `MongoClient`. It was repeated correct queries composed at the wrong granularity.

### Pre-change operation trees

The trees describe the actual repository call graph. Counts are the M31 command-monitoring measurements.

```text
Homepage projection — 185 operations
├── getHomepage
│   ├── list six homepage collections
│   └── buildEvidenceQuery
│       ├── list all nine public entity types
│       └── map every summary
│           ├── media lookup per hero/portrait/gallery group
│           ├── taxonomy lookup per entry
│           ├── Team/Profile lookup per engineering identity
│           └── author lookup where applicable
└── homepageFeature for each candidate
    ├── findDetail by slug
    ├── map the same summary again
    ├── find owned Documents
    ├── resolve Document media/taxonomy
    └── resolve relationships from the graph
```

Measured categories: media 71, taxonomy 40, Team 21, Documents 17, other collection/entity operations 36.

```text
Work detail projection — 162 operations
├── find Work by slug
├── map summary (taxonomy + hero media)
├── find owned Documents
├── resolve relationships → build complete evidence graph
└── resolve Trace → build the same complete evidence graph again
```

Measured categories: media 65, taxonomy 47, Team 22, all other operations 28. Relationship and Trace were independent callers, so the same graph was built twice.

```text
Studio health — 492 operations
├── Work list + homepage eligibility → complete graph + Work details
├── Builds list + homepage eligibility → complete graph + Build details
├── Blueprints list + homepage eligibility → complete graph + Blueprint details
├── Labs list + homepage eligibility → complete graph + Lab details
├── Notes list + homepage eligibility → complete graph + Note details
├── list Careers, Services, Team, Engineering Profiles
├── relationship health → list nine collections, validate in memory
└── pure health rules
```

**Proven.** Rules were already pure and deterministic. Amplification occurred in snapshot loading before the rules ran, contrary to the old service comment that described each collection as being read only once.

```text
Studio Blueprint editor — 507 operations
├── find Blueprint
├── case-study Document, taxonomy/contributor options, hero/preview media
├── Entry Inspector → complete global health report + Documents + versions
└── Entry History → events + Documents + versions + batched actors
```

Measured dominant categories: media 200, taxonomy 129, Team 58, other 120. Permissions use the already-loaded entry/session and were not a meaningful repeated database category.

```text
Studio dashboard — 519 operations
├── listAllContent → list eight Studio collections
├── list Leads
├── HealthOverviewSection → complete global health report
└── RecentActivityWidget → events + full Studio search index + actors
```

Measured dominant categories: media 196, taxonomy 131, Team 60, other 132. The dashboard's top-level groups were already independent; expensive duplication was inside their loaders.

### Root-cause quantification

| Mechanism | Evidence | Classification |
| --- | --- | --- |
| five independent evidence graphs in health eligibility | health called `listHomepageEligibility` once per featured collection | Proven |
| graph summary enrichment resolved resources per entity | M31 media/taxonomy/Team counts and direct source trace | Proven |
| Work relationship and Trace each built the graph | two calls with no shared `EvidenceContext` | Proven |
| editor loaded global health | Entry Inspector called `loadHealthReport` and inherited its full query shape | Proven |
| editor media resolver used one `findById` per asset | direct source trace and four-operation reduction after batching | Proven |
| dashboard repeated broad raw collection reads | content, health, relationship health, and activity owned snapshots | Proven |
| lack of request-level reuse | no request-scoped shared Studio snapshot existed | Proven |
| slow indexes as primary cause | explains were fast at current volume | Rejected by evidence |
| pool size as primary latency cause | no checkout telemetry; query reduction improved controlled latency | Unknown |

### Changes made

1. **Batched public resolution context.** `buildGraph` collects referenced summary media and taxonomy IDs, performs one `$in` query for each collection, and builds in-memory indexes for entities and profiles-by-Team. Mapping retains the same visibility and DTO functions. Note-author uniqueness still uses its existing repository lookup so hidden or archived duplicate Team records continue to trigger the organization fallback.
2. **One evidence context per composition.** Detail projection carries one graph through summary, relationship, and Trace resolution. Homepage derives its participating entity groups from that graph instead of listing six collections before listing all nine again.
3. **Multi-collection eligibility.** `listHomepageEligibilityForTypes` evaluates all five featured collections against one graph. `listAllFeaturedCollectionEntries` joins that result to Studio records without changing eligibility rules.
4. **Request-scoped Studio snapshot.** `loadStudioContentSnapshot` uses React `cache` to coalesce broad raw Studio reads within one Server Component request. Health explicitly shares the same snapshot with relationship integrity; dashboard siblings reuse it through React's request lifetime. It is not persistent caching and stores no data across requests.
5. **Batched editor media.** `mediaRepository.findByIds` and the existing resolver load hero/gallery IDs with one `$in` query and restore requested ordering in memory.
6. **Controlled measurement harness.** `scripts/performance/m32-query-amplification.ts` records command count, collection, command, summed database duration, wall duration, and serialized result size. It performs reads only and reuses the application client slot.

No cache tags, invalidation paths, public visibility rules, health rules, editor autosave behavior, workflow behavior, or UI hierarchy changed.

### Before/after measurements

After values are medians of three sequential warm-client controlled runs against the same configured data. M31 before values are the original single controlled measurements, so percentages are directional evidence rather than production percentiles. Summed database duration includes overlapping commands and may exceed wall time.

| Composition | Operations before | Operations after | Reduction | Wall before | Wall after median | Improvement | DB sum before | DB sum after median | Improvement |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage projection | 185 | 40 | 78.4% | 2,013 ms | 836 ms | 58.5% | 5,533 ms | 1,078 ms | 80.5% |
| Work detail projection | 162 | 13 | 92.0% | 1,578 ms | 193 ms | 87.8% | 5,720 ms | 384 ms | 93.3% |
| Studio health | 492 | 45 | 90.9% | 4,229 ms | 292 ms | 93.1% | 33,357 ms | 1,160 ms | 96.5% |
| Studio Blueprint editor composition | 507 | 56 | 89.0% | 4,848 ms | 369 ms | 92.4% | 37,950 ms | 1,452 ms | 96.2% |
| Studio dashboard composition | 519 | 64 | 87.7% | 5,102 ms | 737 ms | 85.6% | 36,998 ms | 3,467 ms | 90.6% |

Serialized result sizes after the change were 125,042 bytes (homepage projection), 13,344 (Work detail), 10,114 (health), 10,956 (editor harness result), and 17,351 (dashboard harness result). **Unknown:** M31 did not record like-for-like serialized repository payloads, so no payload percentage is claimed. DTO-shape regression tests support correctness, not payload improvement.

TTFB cannot be compared on Vercel until deployment is authorized. The table's wall duration is repository/composition latency, not HTTP TTFB. Public HTTP and authenticated Studio useful-content measurements must be repeated on Vercel in M36/M39.

The verified local production build returned `/` at 7.5 ms first / 3.7 and 3.5 ms warm TTFB (98,633 bytes), compared with M31's 27 ms first / 6 ms warm sample. `/work/bhatkal-time-luxe` returned 9.4 ms first / 3.7 and 3.9 ms warm (70,481 bytes), compared with 12 ms first / 3 ms warm. These already-static routes show no meaningful warm regression; their HTTP timings do not exercise the reduced cold repository path after build-time generation. The local Studio browser had no authenticated session, so no new useful-content timing is claimed; controlled service composition is the available comparison.

### Post-change operation trees

```text
Homepage — 40 operations
├── public graph: 9 collection reads + 1 media batch + 1 taxonomy batch
└── candidate details: 17 Document reads + 12 Document-media batches

Work detail — 13 operations
├── public graph: 9 collection reads + 1 media batch + 1 taxonomy batch
└── Work Documents: 1 read

Studio health — 45 operations
├── shared raw Studio snapshot: 9 collection reads
├── public eligibility graph: 9 collection reads + 1 taxonomy + 1 media batch
├── eligibility details: 13 Document reads + 12 Document-media batches
└── relationship and health rules: same snapshot, no database work

Studio editor — 56 operations
├── health/inspector shared work: 45
├── selected Blueprint: 1
├── editor/inspector/history Documents: 3
├── taxonomy and Team options: 2
├── hero + preview media batch: 1
├── events and Document versions: 3
└── actor batch: 1

Dashboard — 64 operations
├── shared Studio snapshot + health: 45
├── Leads and activity event query: 3
└── activity search/actor resolution: 16
```

### Correctness and test coverage

**Proven.** Existing public visibility, homepage eligibility, relationship, cache-invalidation, health-rule, editor, and DTO tests continue to pass. New regression tests pin:

- one evidence graph for a Work detail even though it needs relationships and Trace;
- one evidence graph shared by a multi-collection eligibility pass;
- one repository call for hero plus gallery media;
- preservation of gallery/request order and omission of unresolved media.

The public graph still applies canonical visibility before indexing a summary. Missing or hidden targets remain absent. Request memoization uses React's request lifecycle, not global mutable state. Public `unstable_cache` boundaries and v3.1.1 invalidation guarantees are unchanged.

### Projections and indexes

**Proven.** Operation amplification, not result scanning, was the measured bottleneck. No projection or index was added in M32. Public graph reads still fetch full typed records because relationship assertions and summary fields vary across entity types; introducing nine near-duplicate projection contracts before measuring post-batching payload would add complexity without established benefit.

**Strong hypothesis.** A future minimal health-read projection could reduce database payload as collections grow, especially by excluding long descriptions and unused internal fields. It should be measured with representative-volume data first.

**Unknown.** Document readiness remains one read per eligible entity, followed by per-document media resolution. A bulk owner query and cross-document resource batch could reduce health below 45, but current health is already under its 80-operation budget. This is deferred unless production latency remains high.

No index plans changed. The M31 document-version and editorial-event candidates remain growth work, not the cause of this milestone's latency.

### Verification

**Proven.** The final M32 working tree passes:

- `npm run lint`;
- `npm run typecheck`;
- `npm test`: 101 files and 741 tests;
- `npm run build`: Next.js 15.5.22, 86 generated static pages;
- `git diff --check` and targeted Prettier checks.

The production build reports public collection/detail routes at approximately 120–121 kB First Load JS and Studio editor routes at 346–349 kB, unchanged from the M31 bundle baseline. `npm audit` reports five moderate vulnerabilities and no high or critical vulnerabilities. The available Next.js remediation is a Next 16 major upgrade, which is explicitly outside this milestone; the audit result is recorded rather than hidden by an unrelated framework upgrade.

### MongoDB pool reasoning

The application still uses one race-safe client per process and the driver's default `maxPoolSize: 100`. M32 does not set an arbitrary smaller pool.

**Proven.** Query reduction lowers the amount of time and concurrency each request demands from a pool. It does not cap Vercel instance count or prove a safe pool size.

Reserve at least 20% of M0's documented 500-connection limit for monitoring, operational variation, and non-application clients. That leaves at most 400 application connections. If measured peak warm-instance count is `I`, an initial upper bound is:

```text
maxPoolSize <= floor(400 / I)
```

Examples are 40 connections at 10 instances or 20 at 20 instances. These are capacity examples, not configuration recommendations. Concurrent-request demand, checkout p95, waiters, cold-instance churn, and actual Vercel instance count remain unknown. M32 therefore leaves pool behavior unchanged and requires those metrics before a cap or `waitQueueTimeoutMS` is selected.

### Remaining bottlenecks and M32 disposition

- **Proven:** health still performs 13 per-entry Document reads and 12 Document-media reads. It is bounded and under budget but is the largest remaining health category.
- **Proven:** dashboard activity adds 16 operations by building the viewer-scoped search index to label five events. This is the next measured dashboard target if production remains slow.
- **Proven:** the editor still loads global health, but its controlled composition is now 56 operations and 369 ms median. Separating it from initial rendering is no longer justified by the old 507-operation evidence; production useful-content timing must decide.
- **Unknown:** Vercel TTFB, server duration, and connection checkout after these changes. No deployment occurred.
- **Unknown:** production payload/network improvement. Repository DTO shapes intentionally remain unchanged.
- **Strong hypothesis:** batching health Documents across owners could lower remaining work, but the current budget is met and additional complexity has not earned its place.

**M32 assessment:** the query-amplification objective is complete for the five prioritized compositions. Operation counts fell 78–92% and controlled wall latency fell 59–93% without behavior or cache changes. M32 still requires a production-focused follow-up after an authorized preview deployment to confirm Vercel TTFB, Studio useful-content time, pool checkout behavior, and connection headroom. It must not be called release-ready from local measurements alone.

## M33 — Production verification

### Status

**Partially complete on 9 August 2026.** M33 established repeatable local M32 distributions, a 20-sample public production reference, authenticated Studio distributions, current Vercel deployment/region facts, and direct evidence of production MongoDB connectivity failures. It could not answer the milestone's primary before/after question because neither production nor the existing `dev.hubzero.in` preview contains the uncommitted M32 working tree, and this milestone does not authorize a deployment.

The active production deployment is Git commit `c2618c13f380014c5138a9512d2509fe865ebffc` from `main`. The existing `dev.hubzero.in` preview is commit `88ac3e1b13abb5150d31f07b181d0718f1453b1f` from `dev`. M32 is an uncommitted working-tree change based on `88ac3e1`. Therefore every deployed measurement below is a **v3.1.1 reference**, not a post-M32 result. No production improvement percentage is claimed.

### Measurement method and comparability

- Public production: one query-key probe followed by 20 requests to the identical URL, issued sequentially from the same measurement host. The probe is reported separately. Query parameters did not evict already-static Vercel entries, so a reported `HIT` is a warm cached response, not a cold-cache sample. A `MISS` on the dynamic routes is a response-cache state, not proof of a cold function instance.
- Local public: 20 sequential requests against the current M32 production build using `next start`, with the same route and response-body method. Local and deployed revisions differ, so the table separates runtime behavior but is not a release before/after comparison.
- Studio: authenticated hard navigations in one browser session. Useful content is the route's visible level-one heading. Editor core is the visible, enabled Name field; Inspector and History have their own visible milestones. Samples are diagnostic distributions—10 for lighter routes and five for database-heavy routes—not release percentiles.
- Repository/composition: three controlled runs of the unchanged M32 command-monitoring harness. Each process connected the client before measurement and reused it across the five compositions. Counts, payload sizes, and collection shapes were identical in all three runs.

### Exact M32 controlled baseline rerun

All operations were `find` commands. The three-sample p75/p95 is the maximum and is included only to expose variation, not to imply a stable tail percentile.

| Composition | Operations, all runs | Wall p50 | Wall p75/p95 | DB sum p50 | DB sum p75/p95 | Payload |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage | 40 | 724.0 ms | 932.7 ms | 1,021 ms | 1,541 ms | 125,042 B |
| Work detail | 13 | 139.2 ms | 168.5 ms | 306 ms | 372 ms | 13,344 B |
| Studio health | 45 | 274.6 ms | 279.5 ms | 1,156 ms | 1,175 ms | 10,114 B |
| Studio Blueprint editor composition | 56 | 551.8 ms | 641.5 ms | 1,910 ms | 2,344 ms | 10,956 B |
| Studio dashboard composition | 64 | 743.5 ms | 780.0 ms | 3,187 ms | 3,787 ms | 17,351 B |

**Proven.** The database-operation budgets remain met and operation shape has not regressed. Wall and summed-command duration vary materially despite identical counts; no new latency improvement is claimed relative to M32's prior three samples.

### Production public measurements — deployed v3.1.1 reference

Times are milliseconds. `First` is the separate query-key probe. Warm distributions use 20 exact-URL requests. Total p75/p95 includes transfer of the full response body.

| Route | Cache | First TTFB | Warm TTFB p50 | p75 | p95 | Min–max | Total p75 / p95 | Bytes |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | HIT | 140.4 | 108.7 | 123.4 | 131.5 | 85.5–178.1 | 214.1 / 296.3 | 99,879 |
| `/work` | MISS, private/no-store | 761.4 | 319.9 | 338.8 | 392.2 | 292.9–474.3 | 363.8 / 490.7 | 36,701 |
| `/builds` | HIT | 107.5 | 101.7 | 109.8 | 141.4 | 89.2–152.2 | 156.3 / 163.9 | 44,708 |
| `/blueprints` | MISS, private/no-store | 445.2 | 327.5 | 337.2 | 378.2 | 288.3–458.7 | 564.7 / 647.9 | 136,376 |
| `/labs` | MISS, private/no-store | 347.4 | 322.4 | 340.9 | 423.9 | 285.0–1,353.5 | 502.7 / 662.4 | 42,751 |
| `/notes` | HIT | 146.1 | 107.4 | 112.3 | 123.7 | 80.7–297.5 | 118.3 / 298.4 | 31,237 |
| `/engineering` | HIT | 124.4 | 108.2 | 115.0 | 152.0 | 81.9–155.4 | 146.0 / 175.4 | 82,655 |
| `/careers` | HIT | 113.9 | 101.3 | 110.3 | 122.4 | 87.8–160.6 | 131.5 / 174.1 | 43,034 |
| `/search?q=blueprint` | MISS, private/no-store | 437.7 | 325.4 | 333.8 | 370.2 | 298.2–448.4 | 501.7 / 518.4 | 50,665 |
| `/work/bhatkal-time-luxe` | HIT | 111.1 | 108.1 | 120.4 | 261.4 | 86.9–279.5 | 150.1 / 281.4 | 71,691 |
| `/blueprints/corporate-editorial` | HIT | 114.4 | 102.0 | 110.7 | 209.5 | 86.3–563.7 | 216.3 / 459.4 | 95,817 |
| `/labs/nexus` | HIT | 93.6 | 102.6 | 111.4 | 138.5 | 87.6–149.0 | 280.0 / 524.0 | 103,104 |

**Proven.** Cached p75 is within the provisional 150 ms budget on every measured route. Cached p95 is within 250 ms except Work detail at 261.4 ms. Dynamic p75 fails the 250 ms target on all four measured routes. Dynamic p95 passes 400 ms for Work, Blueprints, and Search; Labs fails at 423.9 ms and contains a 1.35-second outlier.

### Local M32 versus deployed v3.1.1 public reference

This is a diagnostic environment/revision comparison, not an M32 percentage comparison.

| Route | Local M32 TTFB p75 / p95 | Vercel v3.1.1 TTFB p75 / p95 | Vercel cache state |
| --- | ---: | ---: | --- |
| `/` | 3.8 / 5.1 ms | 123.4 / 131.5 ms | HIT |
| `/work` | 13.0 / 16.6 ms | 338.8 / 392.2 ms | MISS, private/no-store |
| `/builds` | 2.9 / 3.5 ms | 109.8 / 141.4 ms | HIT |
| `/blueprints` | 13.3 / 13.8 ms | 337.2 / 378.2 ms | MISS, private/no-store |
| `/labs` | 8.6 / 10.7 ms | 340.9 / 423.9 ms | MISS, private/no-store |
| `/notes` | 2.8 / 3.0 ms | 112.3 / 123.7 ms | HIT |
| `/engineering` | 3.3 / 4.2 ms | 115.0 / 152.0 ms | HIT |
| `/careers` | 2.8 / 3.3 ms | 110.3 / 122.4 ms | HIT |
| `/search?q=blueprint` | 10.5 / 11.1 ms | 333.8 / 370.2 ms | MISS, private/no-store |
| Work detail | 3.5 / 3.7 ms | 120.4 / 261.4 ms | HIT |
| Blueprint detail | 3.2 / 3.5 ms | 110.7 / 209.5 ms | HIT |
| Lab detail | 3.2 / 3.9 ms | 111.4 / 138.5 ms | HIT |

**Proven.** A large production/local floor remains on v3.1.1. Static responses enter through Vercel `bom1`; dynamic request identifiers show `bom1::iad1`. **Unknown:** how much of that gap remains after M32, because no M32 deployment was measured.

### Authenticated Studio measurements — deployed v3.1.1 reference

| Route / milestone | Samples | p50 | p75 | p95 | Min–max | Provisional p75 budget |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Work collection useful content | 10 | 742.1 ms | 1,992.8 ms | 2,933.0 ms | 673.3–2,933.0 | 1,000 ms — fail |
| Activity useful content | 10 | 2,391.9 ms | 3,177.9 ms | 3,524.2 ms | 1,388.2–3,524.2 | 1,250 ms — fail |
| Search useful content | 10 | 1,552.6 ms | 1,639.9 ms | 2,053.9 ms | 770.5–2,053.9 | 1,000 ms — fail |
| Dashboard useful content | 5 | 5,816.5 ms | 6,068.4 ms | 7,111.5 ms | 5,712.7–7,111.5 | 2,000 ms — fail |
| Health useful content | 5 | 5,154.2 ms | 5,189.7 ms | 5,876.5 ms | 4,733.5–5,876.5 | 2,500 ms — fail |
| Blueprint editor core editable | 5 | 5,479.2 ms | 5,538.5 ms | 5,849.6 ms | 5,316.9–5,849.6 | 2,500 ms — fail |
| Editor Entry Inspector visible | 5 | 5,501.1 ms | 5,555.4 ms | 5,866.2 ms | 5,332.7–5,866.2 | diagnostic |
| Editor History visible | 5 | 5,515.4 ms | 5,569.1 ms | 5,879.0 ms | 5,345.9–5,879.0 | diagnostic |

**Proven.** On v3.1.1 the editor's Inspector and History trail the editable field by only about 20–40 ms. There is no measured secondary waterfall large enough to justify moving those panels to client-side loading. The whole server-rendered editor composition is the current deployed critical path.

**Unknown.** Post-M32 Studio useful-content and editable distributions. M32 reduced the corresponding controlled compositions to 45–64 operations, but the deployed route still executes v3.1.1.

### MongoDB findings

**Proven.** During the M33 production measurement window, Vercel recorded four serverless MongoDB error entries on Studio routes:

- three server-selection/monitor-connection failures, including one closed monitoring connection;
- one TLS socket connection timeout after approximately 38.6 seconds with the driver's 30-second `connectTimeoutMS`;
- all four outer HTTP responses were status 200, and there were no status-500 request logs in the inspected production window.

These errors prove production connection-path instability. They do **not** prove pool exhaustion, connection leakage, or that `maxPoolSize: 100` caused the historical Atlas alert. Error-boundary responses with status 200 also mean HTTP 5xx monitoring alone will miss this failure mode.

The configured database user is not authorized to run `serverStatus`; both available browser sessions were signed out of Atlas. Therefore current connection count, percentage of the 500-connection limit, peak connections, connection creation rate, and historical alert charts remain **unknown**. No production setting or data was changed.

Three fresh local clients using `maxPoolSize: 1` connected in 365.5, 293.3, and 276.3 ms. Their first checkout/connection-ready phase was 175.6–185.1 ms; subsequent sequential checkouts rounded to 0–0.1 ms, five warm pings per client took 20.5–27.6 ms, and no checkout failed. This proves healthy reuse from the measurement host only. It is not Vercel pool telemetry.

### Network and runtime findings

- **Proven:** Vercel Fluid Compute is enabled, the runtime is Node.js 22.x, and the configured function region is `iad1`.
- **Proven:** public traffic in this run entered at `bom1`; dynamic routes traversed `bom1::iad1`.
- **Unknown:** Atlas provider and region. The connection string does not disclose a reliable region, the application role cannot inspect Atlas infrastructure, and the Atlas console session is unavailable.
- **Unknown:** function-to-Atlas RTT, connection checkout p50/p95 inside Vercel, active/waiting pool counts, cold-versus-warm instance identity, and server-render duration. Current application and Vercel request logs do not emit these splits.
- **Strong hypothesis:** the observed server-selection, TLS-connect, and monitor failures can create multi-second tails independently of MongoDB command count. Region distance or Atlas M0 variability may contribute, but neither is proven without Atlas region and Vercel-side connection timing.

### M32 production before/after

**Unavailable.** No deployed target contains M32. The M31-to-M32 controlled repository comparison remains valid and is retained in the M32 section, but it cannot be promoted to a Vercel TTFB or Studio useful-content improvement. The current production and preview deployments are both v3.1.1.

An authorized preview deployment of the exact M32 working tree is required. The comparison protocol must reuse:

1. the same public URLs, response-cache states, measurement host, and 20-sample method;
2. the same authenticated user, browser, editor entry, hard-navigation method, and visible milestones;
3. Vercel request logs plus request-correlated MongoDB operation, acquisition, and failure telemetry;
4. read-only Atlas connection/region charts over the same test interval.

### Ranked remaining bottlenecks

| Rank | Finding | Evidence | Classification |
| ---: | --- | --- | --- |
| 1 | production MongoDB connection path has real selection/TLS/monitor failures | four Vercel serverless errors during measurement | Proven |
| 2 | M32 has no deployed after-state | deployment Git SHAs exclude the working tree | Proven blocker |
| 3 | dynamic public routes retain a ~334–341 ms p75 on v3.1.1 | 20 production samples per route | Proven for v3.1.1; unknown after M32 |
| 4 | Studio budgets fail on v3.1.1 | authenticated 5–10 sample distributions | Proven for v3.1.1; unknown after M32 |
| 5 | Atlas/Vercel region relationship and pool headroom | Atlas region/count unavailable | Unknown |
| 6 | editor supplemental panels cause the critical-path delay | panels arrive ~20–40 ms after core | Rejected by current evidence |
| 7 | remaining health Document/media reads should be optimized now | health already meets the 80-operation budget | Rejected pending post-M32 production evidence |
| 8 | editor bundle is the primary cause of the 5.5-second route | core and all server panels arrive together; no browser CPU trace | Unknown, lower priority than proven server/connectivity failures |

### Decision — exactly one next target

The next focused target is **Vercel-to-MongoDB connection-path verification and reliability**, beginning with an authorized M32 preview rather than another query refactor.

This target includes only the measurement needed to decide connection capacity/placement safely: deploy the exact M32 tree to preview, correlate requests with connection acquisition/failure and MongoDB command summaries, obtain Atlas region/current/peak connection charts through read-only access, and repeat the same public and Studio distributions. It does not authorize a pool-size or region change. A configuration experiment is justified only after this pass distinguishes connection establishment, checkout waiting, function/network time, database commands, and rendering.

Remaining health Document/media reads and dashboard activity expansion are not the next target: their M32 operation totals already meet budget, while production now has direct connection-failure evidence and no deployed M32 comparison.

### M33 verification

The exact M33 working tree passes:

- `npm run lint`;
- `npm run typecheck`;
- `npm test`: 101 files and 741 tests;
- `npm run build`: Next.js 15.5.22, 86 generated static pages;
- `git diff --check` and the performance-plan Prettier check.

`npm audit` reports five moderate vulnerabilities and no high or critical vulnerabilities. M33 changed only this report; it did not add measurement code merely to create a commit, and it did not change the M32 application implementation.

### Release status

v3.2.0 is **not release-ready**. M32's controlled gains are preserved and verified locally, but production translation, Atlas headroom, connection stability, and the Studio budgets are unresolved. M33 must remain partially complete until an authorized M32 preview and read-only Atlas evidence close that boundary.

## M34 — Vercel to MongoDB connection path

### Objective and status

**Status: partially complete on 9 August 2026.** The exact M32 working tree plus privacy-safe M34 telemetry was deployed to Vercel preview `dpl_CBR1huw8LxD55Ac5EjwpMRBNxtSq`; production was not changed. Public runtime, connection, checkout, command, and composition behavior is now directly measured. Authenticated preview Studio measurements, Atlas region, and Atlas account-wide connection charts remain unavailable because the preview has no authenticated Studio session and the Atlas browser session is signed out.

### Baseline and hypothesis

M33 proved that production v3.1.1 had four MongoDB selection/TLS/monitor failures and dynamic public p75 TTFB of 334–341 ms, but it could not measure M32 on Vercel. The M34 hypothesis was that, after M32 removed most command amplification, cold connection establishment and the function-to-database path would become more visible than repository computation. Pool exhaustion, a connection leak, and Atlas/Vercel region distance remained unproven alternatives.

### Instrumentation changes

The preview-safe measurement layer records one structured aggregate per measured server segment and separate connection/failure events. It records route template, request ID, anonymous process instance ID, process age and request sequence, segment duration, first Mongo offset, command count and summed duration, client acquisition, checkout duration/failure, and process-local connection creation/closure/current count. It is enabled only on Vercel preview or an explicit controlled local run. It never records a connection string, filter, command body, document, token, request body, private identifier, or error message. Studio middleware supplies a correlation ID only on the existing Studio/API matcher, so public cache and cookie behavior are unchanged.

The Mongo client lifecycle is unchanged: one lazy, race-safe promise per process, a fresh promise after a failed initial connection, and driver-default pool sizes/timeouts. M34 did not set `maxPoolSize`, `minPoolSize`, `maxConnecting`, a wait-queue timeout, a region, or an index.

### Controlled M32 regression baseline

Three sequential warm-client runs retained every M32 operation budget exactly. Summed command duration can exceed wall duration because independent commands overlap.

| Composition | Operations, every run | Wall p50 | Wall p75/p95 | DB sum p50 | DB sum p75/p95 | Payload |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage | 40 | 669.4 ms | 748.5 ms | 1,091 ms | 1,123 ms | 125,042 B |
| Work detail | 13 | 153.9 ms | 169.4 ms | 348 ms | 354 ms | 13,344 B |
| Studio health | 45 | 308.0 ms | 326.9 ms | 1,193 ms | 1,320 ms | 10,114 B |
| Studio Blueprint editor | 56 | 483.2 ms | 555.3 ms | 1,975 ms | 2,331 ms | 10,956 B |
| Studio dashboard | 64 | 762.5 ms | 763.1 ms | 3,623 ms | 3,672 ms | 17,351 B |

**Proven.** M34 instrumentation did not regress operation shape. No new percentage improvement is claimed from these three variable-latency samples.

### Preview public distributions

The four important dynamic routes received one probe and 20 sequential exact-URL samples from the same host. The preview is protected; Vercel CLI supplied its protection bypass. Therefore these end-to-end numbers are valid preview distributions but are not directly comparable to unprotected production. All responses were HTTP 200 and `X-Vercel-Cache: MISS` with private/no-store response caching.

| Route | n | TTFB p50 | p75 | p95 | Min–max | Total p75 / p95 | Bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/work` | 20 | 362.5 ms | 397.4 ms | 726.1 ms | 343.6–738.6 ms | 540.6 ms / not retained | 36,708 |
| `/blueprints` | 20 | 364.0 ms | 373.5 ms | 413.9 ms | 336.9–454.3 ms | 596.6 / 667.5 ms | 136,468 |
| `/labs` | 20 | 348.6 ms | 365.0 ms | 379.9 ms | 323.6–393.3 ms | 549.6 / 578.4 ms | 42,758 |
| `/search?q=blueprint` | 20 | 353.0 ms | 358.5 ms | 529.8 ms | 331.7–684.2 ms | 533.0 / 715.2 ms | 50,629 |

Request-correlated application spans on warm data-cache hits were much smaller:

| Route | Deduplicated requests retained in log window | Server span p50 | p75 | p95 | Mongo commands |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/work` | 21 | 25.0 ms | 27.5 ms | 61.3 ms | 0 |
| `/blueprints` | 10 | 17.1 ms | 18.9 ms | 28.6 ms | 0 |
| `/labs` | 20 | 14.9 ms | 15.2 ms | 42.1 ms | 3 total during one cache fill |
| `/search` | 20 | 19.2 ms | 21.9 ms | 23.6 ms | 0 |

**Proven.** On warm data-cache hits, repository/composition work is not the dominant dynamic-route TTFB cost. The interval outside the measured server segment includes client-to-ingress transit, preview protection, ingress-to-function routing, framework/runtime work outside the wrapped page, response streaming, and return transit; M34 cannot allocate that interval more narrowly.

Five-sample cached controls reported `X-Vercel-Cache: HIT`. Their p50 TTFB was 134–156 ms for `/`, `/builds`, `/notes`, `/engineering`, `/work/bhatkal-time-luxe`, Blueprint detail, and Lab detail; Careers was 150 ms. Each small set contained a roughly 600–700 ms first/maximum outlier, so its p95 is not treated as stable. These controls confirm cache class, not a production improvement percentage.

### Cold instance and burst findings

Two runtime instances were observed through stable anonymous instance IDs. Their first Mongo client connections took 1,603.8 and 1,593.8 ms. Preview build workers independently recorded 1,605.6 and 1,809.8 ms client establishment. The first `/work` runtime request had:

- process request sequence 1;
- 1,604.5 ms client acquisition;
- first Mongo command at 1,751.5 ms;
- two commands and 373 ms summed command duration;
- 974 ms maximum checkout duration;
- 2,133.9 ms full page segment duration;
- one process-local connection after the request.

The following request reused the same process and client, completed the wrapped page in 61.3 ms, and executed zero commands because the data cache hit. This is a real cold-versus-warm process observation; a query parameter alone is not called a cold instance.

A controlled burst of ten concurrent `/search?q=blueprint` requests used two Fluid Compute instances. Seven requests raced before the shared discovery data-cache entry was ready, and each repeated the same 11-command discovery load; three later requests used the filled cache and executed zero commands. The two pools grew to observed peaks of eight and five connections, 13 preview connections in aggregate. Uncached segment duration ranged from 771 ms to 4,252 ms, summed command duration was about 2,042–2,260 ms per duplicated load, and maximum checkout wait reached 1,948 ms. There were no checkout failures or Mongo command failures.

**Proven.** A concurrent cold data-cache fill can stampede the same discovery load inside and across Fluid Compute instances. This multiplies connection creation and command work even though the eventual cache entry is correct.

**Proven.** The observed burst did not approach the driver's 100-connection process cap. A smaller arbitrary cap would not remove 1.6-second client establishment or duplicate cache fills and could increase waiting. M34 therefore rejects pool-cap tuning on current evidence.

**Unknown.** The 13 observed preview connections are only 2.6% of M0's 500-connection limit, but this is not Atlas-wide utilization: production, monitoring, other instances, instance churn, and historical peaks are absent. It cannot establish deployment-wide headroom.

### Network and Atlas findings

- **Proven:** preview functions and builds ran in `iad1`; requests from the measurement host entered through `bom1` before reaching `iad1` on dynamic paths.
- **Proven:** Vercel-side client establishment was approximately 1.6 seconds in four observed build/runtime processes, compared with M33's 276–366 ms fresh local clients.
- **Proven:** the cold `/work` commands averaged roughly 186 ms each, while M33 local warm pings were 20–28 ms. Command duration includes server execution and cannot be labeled pure RTT.
- **Strong hypothesis:** regional/network distance or Atlas M0 service variability is a material part of the Vercel-to-database cost. The large and repeatable Vercel/local establishment gap supports this, but does not identify which side or region is responsible.
- **Unknown:** Atlas provider/region, Atlas connection count/history, connection creation rate, and function-to-Atlas network RTT. Atlas was signed out and the application role cannot access infrastructure metrics.

### Production versus preview decision

No M32 production improvement percentage is claimed. Production remains v3.1.1 and unprotected, while the after-state is a protected preview. Dynamic preview p75 TTFB was 20–59 ms higher than the M33 production reference, but the protection and deployment differences make that unsuitable as an M32 regression claim. Authenticated Studio preview verification was blocked at `/studio/login`; no credentials were requested, copied, logged, or manufactured.

M34 establishes that M32 code is fast after connection/data-cache warm-up and that cold connection readiness plus concurrent cache filling can dominate. It does not establish production Studio improvement, Atlas headroom, or the correct infrastructure region. M34 is complete at the available read-only evidence boundary but remains partially complete against its full production/Atlas objective.

## M35 — Server request and data-fetch waterfall

### Objective, investigation, and decision

The baseline was M32's 13–64 operations for the five prioritized compositions plus M34's request spans. The hypothesis was that sequential server awaits still dominated after connection warm-up. Public warm spans of 15–28 ms p75, zero-command cache hits, and the existing M32 dependency graphs reject that hypothesis for the measured public paths. The cold search issue is duplicate concurrent cache fill, not a sequential component waterfall. Studio controlled compositions already parallelize independent editor/dashboard work and remain inside their operation budgets.

No Promise.all or repository change was made. Authenticated preview Studio traces are unavailable, so a new Studio waterfall cannot be proven. **Decision:** no M35 optimization is retained; revisit only after authenticated post-M32 spans identify a specific sequential dependency.

## M36 — Studio performance

### Objective, evidence boundary, and decision

Production v3.1.1 Studio useful-content p75 remains 1.64–6.07 seconds. M32 controlled editor, health, and dashboard compositions remain 45, 56, and 64 operations, but the protected M32 preview redirected to Studio login and had no authenticated session. Core editable, supplemental panel, and useful-content after-state measurements therefore remain **unknown**. No loading UI, client-side deferral, streaming boundary, or workflow behavior was changed merely to hide this missing measurement. **Decision:** M36 is blocked on an authorized authenticated preview session and is not complete.

## M37 — Public site performance

### Objective, measurements, and decision

The protected M32 preview meets neither the provisional dynamic p75 target of 250 ms nor a directly comparable production protocol: p75 was 359–397 ms. Its measured page work is already only 15–28 ms p75 on data-cache hits, so another public repository refactor would target the wrong interval. Cached controls remained `HIT`, and no tag, invalidation, freshness, metadata, JSON-LD, media, relationship, taxonomy, author, or visibility behavior changed. **Decision:** investigation complete, no M37 optimization retained. Production deployment and an unprotected same-method comparison are still required.

## M38 — Client bundle and browser performance

The production build remains unchanged at approximately 346 kB Work editor, 347 kB Blueprint/Note editor, and 348–349 kB Build/Lab editor First Load JS; shared JS remains 102 kB and public collection/detail routes remain about 120–121 kB. M33 rejected editor supplemental panels as the primary 5.5-second cause, and M34 obtained no authenticated preview CPU/hydration trace. **Decision:** bundle work is deferred rather than speculative; M38 is not complete.

## M39 — Database growth and query health

Current data volume remains about 190 documents. M34 found connection/cache-fill costs, not a proven scan or sort bottleneck. No explain plan or production query demonstrated an index as the current latency fix, so no index or query shape was changed. The existing growth-risk findings remain valid but are not promoted to present bottlenecks. **Decision:** M39 is skipped on evidence grounds.

## M40 — Cache architecture review

M34 directly reproduced one issue: concurrent requests can repeat the same 11-command discovery snapshot while the persistent data-cache key is cold. The cache becomes correct afterward, and later search terms reuse it with zero Mongo commands. This is **proven cache-fill amplification**. Production cache-miss frequency and invalidation-time concurrency remain unknown.

No global mutable promise/data cache was introduced: doing so without a proven invalidation-safe design could cross request boundaries and weaken v3.1.1 guarantees. No tags, keys, or invalidation dependencies changed. **Decision:** retain this as the highest-value application follow-up only if production/preview traffic shows material cold-fill frequency; the required design must coalesce in-flight public loads without retaining user-specific data or surviving invalidation incorrectly.

## M41 — Error and reliability performance

M33 proved Mongo failures can sit behind HTTP 200 error-boundary responses. M34 adds structured `mongo.connection`, `mongo.failure`, and `server.performance` events with request/route/segment correlation and error class only. Initial-connection failures clear the rejected global promise as before, allowing the next request to retry. Error messages, credentials, bodies, filters, and identifiers are not logged. The friendly error-boundary/HTTP contract is unchanged rather than blindly converted to 500.

The preview measurement window produced zero Mongo failure events and zero error-level request logs. That is encouraging but not a production reliability proof. **Decision:** M41's minimal observability change is complete; production error-rate verification remains a release prerequisite.

## M42 — Performance regression suite

The existing `npm run perf:m32` command runs the read-only five-composition command-monitoring harness. A new `npm run perf:http` command performs a separate warm-up and sequential public HTTP samples, then emits status, response-cache state, cache control, bytes, and min/p50/p75/p95/max TTFB/total distributions. It accepts `PERFORMANCE_BASE_URL`, `PERFORMANCE_SAMPLES`, optional route arguments, and an optional `VERCEL_PROTECTION_BYPASS` header without printing the secret. The benchmark environment, protection state, cache state, revision, and authentication state must accompany every retained report.

The suite covers repository composition and public HTTP distributions. Authenticated browser useful-content/editor-editable timing and automated bundle-size regression extraction are not yet included. **Decision:** M42 is partially complete.

## v3.2.0 Performance Verdict

### Ranked remaining risks

| Rank | Issue | Classification | Why it matters |
| ---: | --- | --- | --- |
| 1 | Atlas region and cluster-wide connection history/headroom unavailable | Unknown | prevents a safe region or pool-cap decision |
| 2 | authenticated M32 preview Studio after-state unavailable | Unknown | the worst user-facing budgets cannot be evaluated |
| 3 | Vercel client establishment around 1.6 s | Proven in preview | dominates first database use in a new process |
| 4 | concurrent cold discovery cache fill repeats 11 commands | Proven in preview | multiplies commands and pool expansion during bursts |
| 5 | unprotected M32 production TTFB absent | Unknown | protected preview cannot support a production percentage claim |
| 6 | arbitrary smaller pool fixes connection pressure | Rejected by evidence | observed peaks were 8 and 5, with cost during readiness rather than cap exhaustion |
| 7 | indexes are today's primary latency fix | Rejected by current evidence | no costly plan was demonstrated at current volume |

### Exact next milestone

The next primary target is **authorized region/headroom and authenticated M32 production-path validation**, not another application refactor. Obtain read-only Atlas region/current/peak/creation metrics and an authenticated preview Studio session; then repeat the same Studio milestones and, if permitted, an unprotected deployment comparison. Only after that evidence should a single region-placement experiment or connection-capacity change be proposed. Cache-fill coalescing is the next application candidate if production telemetry shows the reproduced stampede is frequent enough to matter.

### Verdict

**FURTHER VALIDATION REQUIRED.** M32's operation reductions remain intact; M34 proves reliable warm reuse and exposes expensive cold connection/cache-fill behavior; M41 makes future failures measurable. Production remains unchanged, authenticated Studio after-state and Atlas headroom are unknown, and the provisional production budgets cannot be promoted to release gates. v3.2.0 is not ready for RC or release.

### Final verification

- clean `npm ci`: 667 packages installed from the lockfile;
- `npm run lint`: pass;
- `npm run typecheck`: pass;
- `npm test`: 745/745 tests across 102/102 files;
- `npm run build`: pass on Next.js 15.5.22 with 86 generated static pages;
- `npm audit`: five moderate PostCSS-chain advisories, no high or critical finding; the automated fix requires the explicitly deferred Next.js 16 breaking upgrade;
- `git diff --check`: pass;
- `npm run perf:http` smoke test: pass with the requested two samples and warm-up separated.

## M43 — Production-path validation and decision

### Status

**Partially complete on 9 August 2026.** M43 reverified the five controlled M32 operation budgets, refreshed authenticated production Studio content-landmark distributions, checked production error logs during the same window, inspected the M32 preview and existing telemetry implementation, and evaluated discovery-cache request coalescing against the current invalidation contract. It could not obtain an authenticated M32 preview Studio session or Atlas control-plane metrics. No application, pool, index, cache, region, runtime, environment, production-data, or release change was made.

### Access and method

- Production remained deployment `dpl_HgLJwHB9bjTmX63FN415T6Zo8fQ5` from `main` (v3.1.1); M32 remained preview deployment `dpl_CBR1huw8LxD55Ac5EjwpMRBNxtSq` in `iad1`.
- The existing authenticated production Studio browser session was used read-only. Each route was hard-navigated; one probe was separated from the subsequent samples. Timings end at a route-specific visible content landmark, except the editor, which ends when the primary Name field is visible and enabled.
- A content landmark is not a true cold-instance marker and can be rendered by a friendly error boundary. Vercel error logs were therefore checked over the measurement window; samples are not labeled cold function measurements.
- The preview Studio session redirected to `/studio/login`. The available browser session had no preview-domain authentication, and no password, cookie, token, or private browser storage was copied or manufactured.
- Atlas opened at the account login screen. No Atlas CLI profile, Atlas connector, or Atlas API key with project-read access is available. The application database role cannot read Atlas control-plane metrics. Atlas region, connection history, current/peak cluster connection count, connection creation rate, and headroom therefore remain unknown.

### Controlled M32 budget recheck

The unchanged harness ran three times with a separately connected process per run and a warm client within each run. Counts were identical; summed command duration may exceed wall duration because independent commands overlap.

| Composition | Run 1 ops / wall / DB sum | Run 2 ops / wall / DB sum | Run 3 ops / wall / DB sum | Budget |
| --- | ---: | ---: | ---: | ---: |
| Homepage | 40 / 1,399.8 ms / 2,553 ms | 40 / 592.7 ms / 945 ms | 40 / 593.2 ms / 953 ms | <= 40 |
| Work detail | 13 / 231.2 ms / 580 ms | 13 / 124.3 ms / 304 ms | 13 / 122.3 ms / 295 ms | <= 13 |
| Studio health | 45 / 445.9 ms / 1,905 ms | 45 / 319.7 ms / 1,378 ms | 45 / 255.8 ms / 1,028 ms | <= 45 |
| Studio editor | 56 / 347.9 ms / 1,309 ms | 56 / 310.7 ms / 1,260 ms | 56 / 306.8 ms / 1,154 ms | <= 56 |
| Dashboard | 64 / 676.8 ms / 3,212 ms | 64 / 735.3 ms / 3,195 ms | 64 / 796.4 ms / 3,304 ms | <= 64 |

**Proven:** every M32 operation budget remains exact. The first run's higher wall and command time reinforces the established connection/service variability; it is not a new optimization regression.

### Authenticated production Studio refresh

These are refreshed v3.1.1 production references, not M32 before/after results. The first probe is reported separately. With only 5–10 subsequent samples, p95 is directional and no release gate is promoted.

| Route | Landmark | Probe | n | p50 | p75 | p95 | min–max |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Dashboard | dashboard heading | 6,572 ms | 5 | 5,443 ms | 5,476 ms | 5,862 ms | 5,294–5,862 ms |
| Health | content-health heading | 5,328 ms | 5 | 5,204 ms | 5,245 ms | 5,249 ms | 4,701–5,249 ms |
| Work collection | Work heading | 792 ms | 10 | 747 ms | 1,594 ms | 1,612 ms | 716–1,612 ms |
| Search | Studio Search heading | 2,581 ms | 10 | 1,555 ms | 2,471 ms | 2,555 ms | 1,001–2,555 ms |
| Activity | Activity heading | 2,355 ms | 10 | 1,386 ms | 2,388 ms | 2,444 ms | 1,336–2,444 ms |
| Blueprint editor | primary Name field enabled | 5,761 ms | 5 | 5,540 ms | 5,573 ms | 6,709 ms | 5,364–6,709 ms |

The production references continue to miss the provisional dashboard, health, activity, search, and editor budgets. Work is variable and its p75 also misses the 1-second collection/search target. Because production is still v3.1.1 and preview Studio is unauthenticated, none of these values measures M32's Studio effect and no percentage improvement is claimed.

### Production reliability evidence

Two fresh production database failures occurred in the two-hour measurement window:

1. `/studio/activity`: `MongoServerSelectionError`, 30-second server-selection timeout; the process exited with status 128.
2. `/studio/content/work`: `MongoNetworkTimeoutError`, TLS `secureConnect` timeout after approximately 70 seconds; the process exited with status 128.

Both requests were logged as HTTP 200 cache misses because the current friendly error-boundary contract rendered a response. This proves that the v3.1.1 production connection-path failure is still active and that HTTP status alone is not an adequate success signal. It does not prove pool exhaustion, a leak, Atlas distance, or that M32 fails similarly: the M32 preview previously produced no Mongo failure events.

### Production versus M32 preview comparison

An authenticated route-by-route comparison is **unavailable**. Production has an authenticated v3.1.1 session; preview has M32 telemetry but no authenticated session. Combining those two states would violate the required same-route, authentication, cache, environment, and measurement-method protocol.

The valid public preview findings remain M34's: new-process client establishment near 1.6 seconds, first-work checkout up to 974 ms, warm cached work near 61 ms, and a ten-request cold discovery burst that created two Fluid Compute instances and repeated the same 11-command load across seven racing requests. No new production percentage is inferred from that protected-preview evidence.

### Discovery-cache stampede and request coalescing

**Proven mechanism.** `listPublicDiscoveryEntries` is one persistent `unstable_cache` entry tagged with `public:discovery` and `public:relations`. Next.js 15 returns a fresh cached entry directly and has request-work-store handling for stale revalidation, but a missing entry executes the callback without a cross-request in-flight miss promise. React `cache` is request-scoped, so it cannot coalesce separate HTTP requests. This explains the repeated identical cold-fill command groups without duplicating the existing HubZero telemetry.

No coalescer was implemented. A process-global single-flight promise would coalesce only requests landing on the same Fluid Compute instance and creates an unresolved freshness race: after a mutation invalidates the persistent tags, a new request could join work that began before invalidation and receive the pre-mutation snapshot. A process-local generation counter cannot close that race across multiple instances. A distributed lock would add writes and material architecture for a production frequency that has not been measured. Those options do not yet satisfy the v3.1.1 invalidation guarantee.

**Decision:** request coalescing is not currently a safe, evidence-complete application change. Reconsider it only when production telemetry demonstrates material recurring miss bursts and the design can prove that post-invalidation requests never join pre-invalidation work across instances. Prefer a framework-supported invalidation-aware primitive if one becomes available; otherwise require explicit concurrency/invalidation regression tests before an experiment.

### Causal classification

| Candidate | Classification | Evidence and decision |
| --- | --- | --- |
| MongoDB client establishment | Proven for cold M32 preview processes | approximately 1.6 seconds before readiness; materially larger than local fresh connection |
| Checkout/first-connection readiness | Proven contributor on cold preview | first-work checkout approached 974 ms; warm reuse was fast |
| Cold-cache computation/amplification | Proven contributor during bursts | seven racing requests repeated the 11-command discovery fill |
| Remaining application/query work | Rejected as dominant for measured warm public paths; unknown for authenticated M32 Studio | warm cached public page work was small and M32 budgets remain exact; Studio preview is blocked |
| Pool exhaustion/default `maxPoolSize` | Rejected for the controlled preview burst | observed per-instance pool peaks remained far below 100 and no waiter/failure evidence established cap exhaustion |
| Vercel-to-Atlas regional distance | Strong hypothesis | large local/Vercel connection gap supports path cost, but Atlas region and direct network metrics are unavailable |
| Atlas M0 service variability | Strong hypothesis | variable command/establishment times and live production failures support it, but Atlas metrics are unavailable |
| Cluster-wide connection pressure | Unknown | no current/peak/history/creation charts or instance-count distribution |
| M32 production Studio improvement | Unknown | no authenticated M32 Studio after-state |

### Confirmed bottleneck and recommendation

The confirmed production problem is a **combination of cold MongoDB establishment/readiness and an unreliable Vercel-to-MongoDB path**, with cold discovery fills multiplying that cost. Network distance versus Atlas M0 service behavior cannot be apportioned without Atlas data. Remaining warm public repository computation is not the best next target. Production Studio v3.1.1 still contains the old query amplification, while M32 Studio's user-visible effect remains unknown.

The best next optimization is not a code refactor: obtain an authenticated M32 preview Studio session and read-only Atlas project access, then repeat the same route landmarks while correlating `mongo.connection`, checkout, command, repository, composition, and total-server spans. If Atlas and Vercel regions are materially distant and connection charts show adequate headroom without checkout saturation, the next controlled experiment should be one authorized region-placement preview. If charts instead show sustained high connections/creation or checkout waiters near the 400-connection reasoning ceiling, model instance concurrency and only then propose a bounded pool experiment. Change one variable at a time.

Evidence required before any infrastructure change:

- Atlas provider/region and Vercel function region for the same deployment;
- current, p95, and peak Atlas connections plus connection creation rate over representative and incident windows;
- application instance count/concurrency and per-instance pool checked-out/waiting/created distributions;
- server-selection, TLS, and monitoring-connection error rates correlated by request and instance;
- comparable authenticated M32 preview Studio distributions;
- for a region change, a same-tree preview A/B showing connection establishment, checkout, command, TTFB/useful-content, and failure-rate improvement;
- for a pool change, a capacity model that stays below the 400-connection application ceiling while meeting measured concurrency without checkout starvation.

### Changes, limitations, and release decision

M43 changed documentation only. It deliberately retained the existing instrumentation, query architecture, pool defaults, regions, indexes, and cache semantics. Atlas control-plane facts, authenticated M32 Studio behavior, an unprotected same-tree production comparison, and production M32 failure rate remain unknown.

**M43 status: partially complete at the available authorization boundary.** The local query-amplification objective remains healthy, but the production-path validation objective cannot close without the two missing read-only access paths.

**v3.2.0 Performance Verdict: FURTHER VALIDATION REQUIRED.** The release is not ready for RC or production. The M32 budgets are stable and preview warm behavior is strong, but production continues to experience severe MongoDB connection failures, authenticated M32 Studio performance is unmeasured, and Atlas region/headroom are unknown.

### M43 verification

- `npm run lint`: pass;
- `npm run typecheck`: pass;
- `npm test`: 745/745 tests across 102/102 files;
- `npm run build`: pass on Next.js 15.5.22 with 86 generated static pages;
- editor First Load JS remains 346 kB Work, 347 kB Blueprint/Note, and 348–349 kB Build/Lab;
- `npm audit`: five moderate PostCSS-chain findings, with no high or critical finding; the suggested forced fix requires the explicitly excluded Next.js 16 breaking upgrade;
- `git diff --check`: pass (line-ending conversion warnings only);
- controlled M32 harness: all five operation budgets exact in three runs.

## M44 — Production infrastructure evidence

### Objective, baseline, investigation, and evidence

M44 attempted to close M43's Atlas control-plane gap without changing production. The baseline remains the M32 preview's approximately 1.6-second new-process client establishment, checkout maxima of 974 ms on the first Work load and 1,948 ms during the discovery burst, plus the live v3.1.1 production selection/TLS failures.

Both available browser contexts redirect `https://cloud.mongodb.com/` to MongoDB's signed-out account login. The machine has no Atlas CLI or `mongosh`, no Atlas connector, and no Atlas Administration API environment variables. The configured application database role previously rejected `serverStatus`, and it cannot expose project region or historical Atlas metrics. Vercel CLI remains authenticated read-only to the HubZero project, but Vercel metadata cannot supply Atlas control-plane facts.

**Evidence obtained:** the application remains on Atlas M0/Free per the established environment record; Vercel functions remain `iad1`; M0's documented maximum is 500 connections; production connection-path failures remain directly observed. **Unavailable:** Atlas provider/region, present and historical connection count, peak, creation rate, utilization/headroom, operation-latency charts, and Atlas-side network/error metrics.

### Changes, limitations, decision, and next step

No infrastructure or application change was made. M44 is **blocked at the read-only authorization boundary**, not completed by inference. Required access is either a signed-in Atlas project viewer session or an Atlas API key limited to project/cluster read and monitoring reads. The retained evidence window must cover ordinary traffic and the timestamped production timeout incidents. Until then, do not alter pool size, timeouts, Atlas tier/region, or Vercel region.

## M45 — Authenticated M32 preview

### Objective, investigation, evidence, and decision

Both available browser contexts were navigated read-only to the exact M32 preview Studio dashboard. Both redirected to `/studio/login`; neither has a preview-domain session. No cookie, password, token, browser storage, or production-domain session was copied or fabricated. Production remains authenticated v3.1.1 and preview remains unauthenticated M32, so combining their measurements would violate the comparison protocol.

No M32 Dashboard, Health, Work, Activity, Search, Work editor, Blueprint editor, Entry Inspector, or History useful-content after-state is available. M45 is **blocked**. The required next input is an ordinary authorized preview login or a preview deployment that uses an approved non-production authentication setup while reading only approved preview/scratch data. Production percentages remain unclaimed.

## M46 — End-to-end request correlation

### Baseline and investigation

The M34 telemetry was audited before considering additions. It already correlates a coarse route and segment with request ID, anonymous runtime-instance ID, process age/sequence, Mongo client acquisition, cold-client creation, first-command offset, command count/summed duration/failures, checkout count/summed/max/failures, pool connection create/close/current counts, segment duration, and safe error class. Route wrappers cover the measured public dynamic pages and the requested Studio dashboard, health, Work, activity, search, Blueprint editor, inspector, history, and dashboard subregions. Instrumentation attaches to the existing singleton client and is enabled only in preview or explicit controlled runs.

It deliberately does not log commands, filters, bodies, content, credentials, tokens, connection strings, user identity, or private record identifiers. Existing privacy tests verify that command filters and error messages do not enter logs.

### Evidence, limitation, and decision

**Proven classifications from existing preview traces:**

- first database use in a new process: **connection-bound**, then mixed with command/cache-fill cost;
- concurrent cold discovery: **mixed connection/checkout/database-command/cold-cache amplification**;
- warm cached `/work`, `/blueprints`, `/labs`, and `/search` application segments: **not application-composition-bound**; most observed TTFB lies outside the wrapped segment;
- authenticated M32 Studio: **unknown**.

The page wrapper ends when the async page/component composition returns; it cannot honestly claim full React serialization, response streaming, client transit, or browser rendering duration. Middleware cannot observe the completion of a streamed App Router response. Adding another timer with a misleading “total server” label would duplicate instrumentation and manufacture a causal split.

No telemetry code changed in M46. The milestone is **partially complete**: database and composition correlation is sufficient for the proven cold/warm findings, while framework render/stream and authenticated browser milestones require Vercel observability plus an authenticated preview trace.

## M47 — Cold connection strategy

Connection establishment is proven expensive in preview, but M44 cannot distinguish regional distance, M0 shared-tier variability, Atlas saturation, or client/runtime behavior. No candidate can yet be tested apples-to-apples because region and cluster metrics are unavailable, and this program does not authorize preview infrastructure changes without that evidence.

**Decision:** M47 is skipped, not failed. Client lifecycle, pool defaults, timeouts, retry behavior, Node runtime, and regions remain unchanged. The first permitted experiment must change one variable on the exact tree and compare cold, warm, concurrent, failure-rate, and resource distributions.

## M48 — Cold-cache stampede and single flight

M43's mechanism and safety result were rechecked. Request-scoped memoization cannot coordinate separate HTTP requests. A process-local promise cannot coordinate Fluid Compute instances and can cause a post-invalidation request to join work started under the prior content generation. A process-local generation counter cannot prove safety across instances. Durable coordination introduces writes, failure modes, and operational complexity without a measured production miss frequency.

No global promise, generation token, lock, cache layer, or snapshot format was introduced. **Decision:** no safe, evidence-complete single-flight design currently preserves the v3.1.1 invalidation guarantee. M48 remains an evaluated candidate, not an implementation milestone. Reopen only with recurring production stampede metrics and a design/test proving that post-invalidation requests cannot receive pre-invalidation work across instances.

## M49 — Studio performance

The v3.1.1 production references remain slow, while M32 controlled Studio compositions remain 45–64 operations. Authenticated M32 preview behavior is unavailable. There is therefore no valid evidence that global health, inspector, history, payload, hydration, or rendering is the next post-M32 critical path. No query, stream, lazy boundary, or UI behavior changed. **Decision:** blocked on M45/M46 authenticated evidence.

## M50 — Public performance

M34 already provides 20-sample M32 preview public distributions and correlated warm segments. Warm data-cache application work is about 15–28 ms p75, protected-preview dynamic TTFB remains 359–397 ms p75, and cacheable controls remain response-cache hits. No newer code changes public composition or caching, so rerunning identical traffic would not isolate a new hypothesis. No public cache, metadata, JSON-LD, feed, sitemap, visibility, or invalidation behavior changed. **Decision:** no optimization retained; an unprotected same-tree deployment comparison remains required.

## M51 — Client bundle

The verified build continues to report 346–349 kB editor First Load JS. Server/connectivity remains the highest-confidence user-facing problem and no authenticated M32 browser CPU/hydration trace exists. **Decision:** skipped under the milestone's own gate. No client boundary or dependency changed.

## M52 — Database architecture review

### Actual HubZero workload

HubZero currently uses 18 MongoDB collections. Its dominant structures are:

- independently edited publishable entry documents with heterogeneous fields;
- polymorphic long-form Documents containing ordered block arrays;
- media and taxonomy references stored as IDs;
- relationship arrays between nine public entity types, resolved into an application-level evidence graph;
- Team/User/Engineering Profile and Note-author identity links;
- append-only editorial events and Document versions;
- featured ordering written as a whole-set invariant;
- cache dependency resolution and public DTO construction outside the database.

M32 proved that MongoDB can execute the five important compositions within 13–64 commands once reads are batched at the correct granularity. Warm Work detail completes locally around 122–176 ms in the current samples, and warm public preview cache hits execute zero MongoDB commands. Current production has only about 190 documents. No explain plan established query execution or collection scans as today's latency cause.

### MongoDB fit

MongoDB remains a strong fit for heterogeneous entry records, polymorphic block Documents, append-only events, sparse optional media/relationship fields, and the existing Zod/repository/public-DTO boundary. Atomic single-document updates and the Lab single-winner claim already support important workflows. M32 shows that application batching, rather than a database-engine replacement, removes the dominant read amplification.

MongoDB's present weaknesses for HubZero are also real: relationships and referential integrity are application-enforced; cross-collection mutations use ordered writes/compensation rather than one broad relational transaction; health must detect dangling/wrong-type relationships; and many serverless instances can each own a driver pool. The first three are long-term maintainability considerations. The last is a deployment/connection architecture issue and is not unique proof against MongoDB's data model.

### PostgreSQL/Supabase comparison

PostgreSQL could enforce foreign keys, express relationship traversal through joins, and provide multi-table transactions for workflows such as ordering plus events. [Supabase documents a transaction-mode pooler intended for temporary/serverless clients](https://supabase.com/docs/guides/database/connecting-to-postgres), which is operationally relevant. However, adopting it would require a new schema and migration for 18 collections, polymorphic Documents/blocks, Auth adapter behavior, repository contracts, search/activity projections, relationship semantics, public DTOs, cache invalidation dependencies, tests, and operational tooling. Transaction pooling also has behavioral constraints such as no prepared statements.

No measured HubZero workload shows that a PostgreSQL query or Supabase pooler would beat a correctly placed and observed MongoDB deployment. Supabase's different pooler topology is not an apples-to-apples database-engine result. Building a local-only prototype without the same Vercel region and production-like network path would answer the wrong question.

### Decision

**MongoDB Architecture Decision: KEEP + FUTURE REVIEW.** MongoDB is adequate for v3.2 and is not a demonstrated architectural bottleneck. Migration is not justified. Future review is warranted if evidence shows sustained relational-integrity burden, a requirement for cross-entity atomic transactions that compensation cannot safely serve, relationship workloads that remain expensive after batching/indexing, or MongoDB connection/reliability failure after region alignment and an appropriately provisioned/observed deployment.

## M53 — Supabase/PostgreSQL benchmark

M52 did not cross the prototype gate. There is no authorized Supabase project, equivalent dataset, same-region deployment, or evidence that MongoDB query execution remains the constraint. A local Postgres comparison would confound database engine, provider tier, pooling, region, and data model. **Decision:** skipped. No database, migration, dependency, schema, or benchmark fixture was added.

## M54 — Performance regression suite

### Baseline and change

The pre-M54 controlled harness measured one process/run and emitted raw values. Engineers manually repeated it, so it did not produce distributions or fail when an M32 budget regressed. The HTTP harness already produced distributions but implemented its percentile helper privately.

M54 adds one pure shared nearest-rank distribution helper, reuses it in the existing HTTP harness, and adds `npm run perf:regression`. The regression runner invokes the existing read-only M32 harness in a fresh process/client per sample, reports operation/wall/database-duration/payload p50/p75/p95, verifies collection/command shape independent of concurrent key ordering, and exits non-zero if any established operation maximum is exceeded. It accepts `--samples`, `PERFORMANCE_ENVIRONMENT`, and `PERFORMANCE_REVISION`; it never prints the database URI or result content.

### Three-sample controlled result

| Composition | Operations min/p50/p75/p95/max | Wall p50 / p75 / p95 | DB sum p50 / p75 / p95 | Payload | Shape |
| --- | ---: | ---: | ---: | ---: | --- |
| Homepage | 40 / 40 / 40 / 40 / 40 | 691.1 / 880.9 / 880.9 ms | 1,035 / 1,245 / 1,245 ms | 125,042 B | stable |
| Work detail | 13 / 13 / 13 / 13 / 13 | 142.0 / 143.9 / 143.9 ms | 321 / 351 / 351 ms | 13,344 B | stable |
| Studio health | 45 / 45 / 45 / 45 / 45 | 265.5 / 269.0 / 269.0 ms | 1,086 / 1,102 / 1,102 ms | 9,366 B | stable |
| Studio editor | 56 / 56 / 56 / 56 / 56 | 690.9 / 734.8 / 734.8 ms | 2,529 / 2,706 / 2,706 ms | 10,956 B | stable |
| Dashboard | 64 / 64 / 64 / 64 / 64 | 349.8 / 554.0 / 554.0 ms | 1,550 / 2,240 / 2,240 ms | 16,603 B | stable |

Payload is current content-dependent output and is not compared with M32 as a percentage. The runner changes measurement/reporting only; it cannot improve application latency. Three samples expose variability but do not establish stable tail percentiles.

### Verification, limitation, and decision

New tests verify percentile behavior, rounding, single-sample behavior, and rejection of empty distributions. The real three-sample gate passed every budget. Public HTTP distributions remain covered by `perf:http`. Authenticated Studio useful-content automation remains blocked by M45, and bundle extraction is still manual build output. **Decision:** M54's controlled and public HTTP suite is complete; authenticated browser and automated bundle metrics remain explicitly partial.

## M55 — Reliability verification

### Evidence and change

Production has demonstrated selection/TLS failures, Node process termination, and friendly HTTP 200 error-boundary responses. Preview telemetry reports safe error classes with request/instance correlation, and the M34 preview window had no failures. This session added focused lifecycle regression tests proving that concurrent callers share one in-flight Mongo connection and that a failed initialization clears the cached promise so the next request creates a fresh client and can recover.

No retry, timeout, error-boundary, HTTP-status, editor, cache, or connection option changed. Converting every streamed App Router error response to HTTP 500 without defining the route/error contract could regress UX and would not prevent process termination. Failure injection for TLS, server selection, monitoring disconnect, cache invalidation during concurrent computation, and editor writes requires a controlled preview/scratch environment and remains unavailable.

**Decision:** M55 is partially complete. Initialization reuse/recovery and privacy-safe observability have regression coverage; production failure rate and full transient-failure behavior remain release blockers.

## M56 — Final release audit

### Verification

- clean `npm ci`: pass, 667 packages installed from the lockfile;
- `npm run lint`: pass;
- `npm run typecheck`: pass;
- `npm test`: 750/750 tests across 104/104 files;
- `npm run build`: pass on Next.js 15.5.22 with 86 generated static pages;
- `npm audit`: five moderate PostCSS-chain findings, no high or critical finding; the forced remediation upgrades to the explicitly excluded Next.js 16 major;
- `git diff --check`: pass, with line-ending conversion warnings only;
- targeted Prettier check for M44–M56 code and documentation: pass;
- `npm run perf:regression -- --samples=3`: pass, every M32 budget and command/collection shape stable;
- `perf:http` read-only production smoke for `/work` and `/search?q=blueprint`: pass as a harness check; two samples are insufficient for a new percentile claim;
- production error-log check after the public smoke: no new error-level entry in the inspected 30-minute window. This does not supersede the severe Studio failures observed in M43.

The build retains shared First Load JS at 102 kB, public collections/details around 120–121 kB, and editor routes at 346–349 kB. No release version, tag, commit, merge, production deployment, database mutation, index, pool, environment, or region change occurred.

### Release decision

Correctness and static gates pass, and M32 regression coverage is stronger. Production readiness does not pass: authenticated M32 Studio, Atlas topology/headroom, and post-M32 production connection reliability remain unknown. M56 therefore completes the available local audit but does not authorize an RC.

## M57 — Final performance validation and infrastructure decision

### Objective, repository baseline, and status

M57 re-established the final decision baseline without reopening completed optimization work. The repository is on `dev` at `88ac3e1b13abb5150d31f07b181d0718f1453b1f` (`v3.1.1`), and the package version remains `3.1.1`. There is no commit containing M32: M32–M56 are preserved uncommitted working-tree changes based on `88ac3e1`. No existing change was discarded or overwritten.

The existing measurement implementation was sufficient. `src/lib/performance/server.ts` already correlates route, segment, request, anonymous runtime instance, process age/sequence, Mongo client acquisition, first command, command count/duration/failure, checkout count/duration/max/failure, pool connection create/close/current counts, and segment duration. `perf:regression` already launches a fresh process and client per sample, verifies operation shape, reports distributions, and enforces the M32 budgets. M57 added no duplicate telemetry.

**Status: BLOCKED on the required external evidence.** Local correctness and amplification gates pass, but Atlas control-plane data and authenticated M32 Studio measurements remain inaccessible. This is an authorization boundary, not evidence that the missing metrics are healthy.

### Atlas and deployment evidence

- Both available browser contexts were checked read-only and redirected Atlas to the signed-out MongoDB account login.
- There is no Atlas CLI, `mongosh`, Atlas connector, or Atlas Administration API environment credential on the machine. The application database role cannot supply Atlas control-plane metrics.
- Atlas provider/region, current and peak connections, connection utilization, creation rate, saturation/headroom, operation charts, and Atlas-side TLS/server-selection/network metrics therefore remain **unverified**.
- The exact M32 preview `dpl_CBR1huw8LxD55Ac5EjwpMRBNxtSq` remains ready in `iad1`. Both available browser contexts redirected its Studio dashboard to `/studio/login`; no authenticated preview session is available.
- Production `dpl_HgLJwHB9bjTmX63FN415T6Zo8fQ5` remains v3.1.1 in `iad1`. A read-only 24-hour error-level log query returned no retained entry for either deployment. That limited negative check does not supersede M43's directly observed 30-second server-selection and approximately 70-second TLS failures, and it does not establish a post-M32 failure rate.

No Atlas, Vercel, pool, timeout, index, cache, environment, data, runtime, or deployment setting changed.

### Authenticated M32 Studio evidence

No valid M32 Dashboard, Health, Work, Search, Activity, Blueprint editor, or editor useful-content sample could be collected. The preview contains M32 but is unauthenticated; production is authenticated but contains v3.1.1. Combining those states would violate the required revision, authentication, route, cache, environment, and measurement-method equivalence.

The latest valid production values remain M43's v3.1.1 references: Dashboard p75 5.476 seconds, Health 5.245 seconds, Work 1.594 seconds, Search 2.471 seconds, Activity 2.388 seconds, and Blueprint editor editable 5.573 seconds. They are not M32 after-values. **Whether M32 improves production Studio useful-content time remains unknown, and no production percentage is claimed.**

### Final controlled M32 regression result

Three isolated-process samples used revision label `88ac3e1+working-tree`. Nearest-rank p75/p95 equals the maximum with three samples and is diagnostic, not a stable tail estimate. Summed MongoDB command duration can exceed wall time because commands overlap.

| Composition | Operations min/p50/p75/p95/max | Budget | Wall p50 / p75 / p95 | DB sum p50 / p75 / p95 | Payload | Shape |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Homepage | 40 / 40 / 40 / 40 / 40 | <= 40 | 851.6 / 873.2 / 873.2 ms | 1,036 / 1,095 / 1,095 ms | 125,042 B | stable |
| Work detail | 13 / 13 / 13 / 13 / 13 | <= 13 | 142.0 / 175.1 / 175.1 ms | 373 / 402 / 402 ms | 13,344 B | stable |
| Studio health | 45 / 45 / 45 / 45 / 45 | <= 45 | 277.1 / 312.7 / 312.7 ms | 1,156 / 1,215 / 1,215 ms | 9,366 B | stable |
| Studio editor | 56 / 56 / 56 / 56 / 56 | <= 56 | 374.4 / 688.9 / 688.9 ms | 1,471 / 2,718 / 2,718 ms | 10,956 B | stable |
| Dashboard | 64 / 64 / 64 / 64 / 64 | <= 64 | 737.9 / 745.9 / 745.9 ms | 3,477 / 3,504 / 3,504 ms | 16,603 B | stable |

**Proven:** all hard operation budgets and command/collection shapes remain exact. Variable latency at identical operation counts remains consistent with the previously observed remote service/path variability, but this local controlled run cannot identify Atlas or network causation.

### Correlation and infrastructure decision

| Candidate cause | Final classification | Evidence |
| --- | --- | --- |
| cold MongoDB client establishment | **Proven in M32 preview** | approximately 1.6 seconds in four runtime/build processes |
| cold checkout/readiness | **Proven contributor in preview** | first Work checkout up to 974 ms; burst maximum 1.948 seconds |
| cold discovery cache-fill amplification | **Proven in preview** | seven racing requests repeated the same 11-command load across two instances |
| warm public application work | **Rejected as dominant for measured preview paths** | 15–28 ms p75 wrapped work and zero Mongo commands on warm cache hits |
| remaining authenticated M32 Studio work | **Unverified** | no authenticated preview session |
| pool saturation or `maxPoolSize: 100` as the cause | **Rejected for the controlled preview burst; unverified cluster-wide** | observed per-instance peaks of 8 and 5 with no failure; Atlas-wide history absent |
| Vercel-to-Atlas regional distance | **Strongly supported, not proven** | `iad1` is known and connection establishment is much slower on Vercel, but Atlas region/RTT is unknown |
| Atlas M0 shared-tier variability | **Strongly supported, not proven** | variable command/readiness timing and historical production failures; Atlas charts absent |
| M32 production improvement | **Unverified** | no comparable authenticated M32 or unprotected same-tree production after-state |

The remaining problem is best described as a **proven cold connection/readiness cost combined with cold cache-fill amplification, with region distance, shared-tier variability, and cluster-wide connection pressure still unresolved contributors**. Query execution and warm public composition are not demonstrated as the dominant remaining production cost.

No controlled infrastructure experiment was justified. A pool experiment lacks Atlas connection/headroom and checkout-distribution evidence; a region experiment lacks the Atlas region; changing both would destroy attribution. `maxPoolSize`, Atlas/Vercel regions, and timeouts therefore remain unchanged.

### Cache-stampede decision

M40/M43/M48 remain valid. Request-scoped memoization cannot coalesce independent requests. A process-local promise cannot coordinate separate Fluid Compute instances and can allow post-invalidation work to join a pre-invalidation computation. A generation counter cannot prove cross-instance safety, while durable coordination introduces writes and failure modes without a measured production frequency.

No single-flight implementation is retained. Cross-instance coalescing is not justified until a design proves invalidation epochs across all instances, deterministic failure recovery, and that stale pre-invalidation work cannot repopulate or satisfy post-invalidation requests. The existing freshness and invalidation contract takes precedence over the reproduced burst cost.

### Database decision, rejected approaches, and exact next action

**Database decision: KEEP MONGODB.** M32 demonstrates that correct batching reduces the representative workloads to 13–64 commands; current data is heterogeneous and document-oriented; no query plan, data-model limitation, or same-region alternative benchmark establishes MongoDB as the architectural cause. PostgreSQL/Supabase investigation and migration remain outside the evidence gate.

Rejected in M57: arbitrary pool tuning, region changes without Atlas location, speculative indexes, further query reduction under budget, naive single-flight, a PostgreSQL benchmark, duplicate telemetry, and using v3.1.1 production as an M32 after-state.

The single next action is an **authorized, coordinated validation window** with a read-only Atlas Project Viewer and an ordinary authenticated M32 preview Studio session. Capture Atlas region/current/peak/creation/headroom and error charts over the same interval as 10-plus comparable Dashboard, Health, Work, Search, Activity, and editor samples, correlated with the existing request/instance/Mongo telemetry. Only that window can choose one subsequent region-placement or capacity experiment without conflating causes.

Evidence required before a region change: Atlas region/provider, same-tree one-variable preview A/B, and equivalent cold/warm connection, checkout, command, useful-content, and failure distributions. Evidence required before a pool change: Atlas current/p95/peak/creation history, active instance/concurrency distribution, per-instance checked-out/waiter/created metrics, and a capacity model below the 400-connection application reasoning ceiling without checkout starvation.

### Verification

- `npm ci`: pass; 667 packages installed from the lockfile;
- `npm run lint`: pass;
- `npm run typecheck`: pass;
- `npm test`: 750/750 tests across 104/104 files;
- `npm run build`: pass on Next.js 15.5.22 with 86 generated static pages;
- `npm run perf:regression`: pass with three isolated-process samples, exact budgets, and stable operation shape;
- `npm audit`: five moderate PostCSS-chain advisories and no high or critical finding; the command exits non-zero and the available forced remediation requires the explicitly excluded Next.js 16 breaking upgrade;
- `git diff --check`: pass; line-ending conversion warnings only;
- targeted Prettier check for the performance documentation, harnesses, telemetry, and new tests: pass.

The build remains at 102 kB shared First Load JS, approximately 120–121 kB for public collection/detail routes, and 346–349 kB for Studio editor routes. M57 made documentation changes only; it added no application code, configuration, dependency, release, or deployment change.

## M58 — Final performance validation with Atlas evidence

### Objective, repository baseline, and status

M58 used the newly authenticated Atlas Project Viewer session to close the production topology and connection-history gap without reopening the completed query-optimization work. The repository remains on `dev` at `88ac3e1b13abb5150d31f07b181d0718f1453b1f` (`v3.1.1`), with M32–M57 preserved as uncommitted working-tree changes. There is still no Git commit containing M32. Consequently, the M32 preview has an exact Vercel deployment identifier and source snapshot, but not an exact M32 Git commit: its traceable base is `88ac3e1` plus the uncommitted performance tree uploaded on 9 August 2026 at 01:11:29 IST.

The M32 preview remains ready in `iad1` on Node.js 22.x with Fluid Compute. Production remains the untouched v3.1.1 deployment created on 8 August 2026 at 20:56:26 IST, also in `iad1`. No application, Atlas, Vercel, pool, timeout, index, cache, environment, database, deployment, or production-data setting changed during M58.

**M58 status: PARTIALLY COMPLETE.** Atlas topology, current headroom, and the historical connection alert are now directly observed. The exact M32 preview still redirects Studio to `/studio/login`, so the authenticated M32 Studio half of the required validation remains blocked.

### Atlas production topology and current state

Read-only Atlas inspection established:

- production cluster: `hubzero-prod`;
- tier: Atlas M0 / Free, 500 documented connections;
- cloud and region: AWS Mumbai (`ap-south-1`);
- topology: three-member replica set;
- MongoDB version: 8.0.28;
- stored data at inspection: 3.96 MB of 512 MB, approximately 1%;
- current cluster summary: 12 of 500 connections, 2.4% utilization and 488-connection headroom;
- the latest one-hour connection-rate chart showed only sub-one-connection-per-second spikes (approximately 0.9/s at the visual maximum) and Atlas reported no active alert.

The free tier does not expose the dedicated-tier CPU, memory, queue, disk-I/O, or operation-execution charts needed to separate shared-host resource contention from network/client behavior. The current low connection count proves that the cluster was not saturated during M58 inspection; it does not describe the prior incident.

### Historical connection alert and Atlas-side reliability evidence

Atlas Activity Feed provides the first direct evidence for the earlier connection warning:

- the affected replica-set member crossed **above 80% of the configured connection limit** at 05:49:55 IST on 7 August 2026;
- it returned inside the threshold at 05:58:46 IST;
- the threshold breach lasted approximately 8 minutes 51 seconds;
- because the configured limit is 500, the observed peak is proven to have exceeded 400 connections on the affected member, leaving fewer than 100 connections of headroom at some point in that interval;
- Atlas's retained one-hour aggregation smooths this short spike, so the exact numeric maximum above 400 and the connection-creation distribution during the incident cannot be recovered from the available chart. The defensible peak is therefore a lower bound, not an invented point estimate.

Atlas also recorded all three shared-tier hosts restarting, replica-set configuration changes, and a primary election between 00:47 and 01:09 IST on the same date. Those events preceded the connection alert by approximately five hours and are not temporally coincident with it. Similar host-restart/election sequences appear on other dates in the 30-day activity feed. They establish shared-tier lifecycle activity, but do not prove that shared-tier resource pressure caused the connection spike or the later Vercel TLS/server-selection failures.

No Atlas alert in the retained activity feed corresponds to the M43 application's 30-second server-selection timeout or approximately 70-second TLS `secureConnect` timeout. Those are client-side failures and their absence from Atlas alerts does not disprove them. Atlas supplies no retained evidence that connects those failures to the 7 August connection spike.

### Atlas-side diagnosis

| Question | Classification | Conclusion |
| --- | --- | --- |
| Is the M0 limit currently approached? | **PROVEN — no** | 12/500 connections at inspection, 2.4% utilization. |
| Was the limit materially approached historically? | **PROVEN — yes** | one member exceeded 80%, therefore exceeded 400/500, for about 8m51s. |
| What was the exact historical peak? | **UNKNOWN above a proven lower bound** | `>400`; retained chart granularity cannot recover the exact maximum. |
| Is current connection creation unusually high? | **PROVEN — no for the inspection window** | latest one-hour visual maximum was approximately 0.9 connections/s with no active alert. |
| Was creation rate unusual during the alert? | **UNKNOWN** | the alert-window chart is retained only at a granularity that obscures the burst. |
| Is pool/connection pressure possible? | **PROVEN historically, absent currently** | historical threshold breach proves pressure; current 488-connection headroom disproves current saturation. |
| Did the historical failures correlate with the connection spike? | **UNKNOWN** | Atlas retained no event-level correlation to the later application TLS/selection failures. |
| Does Atlas prove shared-tier resource pressure? | **PLAUSIBLE, not proven** | periodic restarts/elections exist; resource charts required for causation are unavailable on M0. |
| Does Atlas prove a network-path problem? | **STRONGLY SUPPORTED, not isolated** | Atlas is Mumbai while Vercel functions are Virginia; the same-tree preview cold connect is about 1.6 seconds, but no one-variable regional A/B exists. |

### Authenticated M32 Studio and v3.1.1 comparison

The authenticated Atlas session does not provide an authenticated HubZero preview session. A fresh read-only navigation to the exact M32 preview Studio dashboard redirected to `/studio/login?callbackUrl=%2Fstudio%2Fdashboard`. No credentials, production cookie, token, or browser storage were copied. Therefore no valid M32 Dashboard, Health, Work, Search, Activity, Blueprint editor, or editor-useful-content distribution can be produced.

| Surface | v3.1.1 p50 | v3.1.1 p75 | M32 p50 | M32 p75 | Change | Confidence |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Dashboard | 5.443 s | 5.476 s | unavailable | unavailable | not calculable | blocked: preview authentication |
| Health | 5.204 s | 5.245 s | unavailable | unavailable | not calculable | blocked: preview authentication |
| Work collection | 0.747 s | 1.594 s | unavailable | unavailable | not calculable | blocked: preview authentication |
| Search | 1.555 s | 2.471 s | unavailable | unavailable | not calculable | blocked: preview authentication |
| Activity | 1.386 s | 2.388 s | unavailable | unavailable | not calculable | blocked: preview authentication |
| Blueprint editor editable | 5.540 s | 5.573 s | unavailable | unavailable | not calculable | blocked: preview authentication |

The v3.1.1 values remain valid production references only. **M58 cannot establish that M32's controlled 78–92% operation reduction translated into authenticated Studio latency improvement, and it claims no production percentage.**

### Atlas, Vercel, and Mongo correlation

| Candidate remaining cost | M58 classification | Evidence |
| --- | --- | --- |
| A. connection establishment | **PROVEN contributor** | new `iad1` preview processes took about 1.6 s to make the client ready; local fresh connections were about 276–366 ms. |
| B. pool contention / checkout | **PROVEN during cold bursts; not current Atlas saturation** | first Work checkout reached 974 ms and a cold discovery burst reached 1.948 s; Atlas is currently 12/500 but historically exceeded 400. |
| C. Atlas shared-tier variability | **PLAUSIBLE** | M0, periodic restarts/elections, and unavailable resource charts; no causal alignment to the application failures. |
| D. Vercel-to-Atlas distance | **STRONGLY SUPPORTED** | `iad1` functions access AWS Mumbai; the topology is materially cross-region, but no same-tree regional A/B isolates its share. |
| E. Mongo query execution | **REJECTED as the dominant warm-path cause** | M32 budgets are exact; warm cache hits can use zero Mongo commands and complete near 61 ms; controlled compositions remain sub-second. |
| F. cold cache-fill amplification | **PROVEN** | seven racing requests repeated the same 11-command discovery load across two Fluid Compute instances. |
| G. application/server composition | **REJECTED as dominant for measured warm public paths; UNKNOWN for authenticated M32 Studio** | wrapped public work was 15–28 ms p75; Studio cannot be sampled without preview authentication. |
| H. combination | **BEST-SUPPORTED DIAGNOSIS** | cold cross-region establishment/readiness plus burst checkout/cache-fill amplification, with shared-tier variability still unisolated. |

The Atlas evidence changes the connection-capacity conclusion from a theoretical risk to a demonstrated historical incident. It still does not identify the Node driver's default `maxPoolSize: 100` as the cause. Atlas does not expose which Vercel instances or pools contributed, how many connections were checked out, or whether requests were waiting at the incident peak.

### Pool, region, cache, and database decisions

**Pool decision:** Current evidence does not justify changing `maxPoolSize`. Current saturation is absent, the controlled preview used peaks of eight and five connections per observed instance without failure, and the historical `>400` event lacks instance/pool attribution. Lowering the cap without that attribution could trade Atlas headroom for checkout starvation. A pool experiment requires correlated instance count, created/checked-out/waiter distributions, Atlas connection creation, peak/p95 connections, and failure rates under an equivalent burst.

**Region decision:** The newly proven Mumbai-to-`iad1` topology justifies designing one regional preview experiment, not changing production or moving Atlas. The experiment must deploy the exact same source snapshot and configuration to one Vercel function region close to `ap-south-1` (subject to Fluid Compute support), leaving Atlas unchanged. Compare at least 20 cold and 20 warm samples plus equivalent concurrent bursts against the existing `iad1` preview. Success requires a material cold client-acquisition and checkout improvement (predeclared as at least 30% at p75), no greater than 10% warm regression, zero new connection failures, and unchanged M32 operation shapes. Failure is a smaller or unstable improvement, a new error signal, or a warm regression. Rollback is deletion of the experimental preview/override; production remains untouched. **The experiment was not executed because no region/configuration change is authorized in M58.**

**Cache decision:** M40/M48 remain unchanged. Process-local single-flight cannot coordinate Fluid Compute instances or stop stale pre-invalidation work from satisfying a post-invalidation request. No cross-instance generation protocol with deterministic recovery has been proven. Correct freshness is retained; no coalescing implementation is justified.

**Database decision: KEEP MONGODB.** M32 proves that the data model can serve representative compositions within 13–64 operations and sub-second controlled wall time. The remaining evidence concerns connection topology, cold lifecycle, capacity bursts, and a shared tier—not an inherent document-model or query limitation. PostgreSQL/Supabase investigation and migration remain outside the architectural gate.

### M58 regression and verification results

The required three-sample fresh-process regression run passed with exact, stable operation shapes:

| Composition | Operations | Budget | Wall p50 / p75 / p95 | DB sum p50 / p75 / p95 | Payload |
| --- | ---: | ---: | ---: | ---: | ---: |
| Homepage | 40 | <= 40 | 666.8 / 693.9 / 693.9 ms | 1,084 / 1,128 / 1,128 ms | 125,042 B |
| Work detail | 13 | <= 13 | 151.1 / 153.5 / 153.5 ms | 352 / 363 / 363 ms | 13,344 B |
| Studio health | 45 | <= 45 | 264.8 / 283.7 / 283.7 ms | 1,085 / 1,203 / 1,203 ms | 9,366 B |
| Studio editor | 56 | <= 56 | 640.5 / 654.0 / 654.0 ms | 2,528 / 2,900 / 2,900 ms | 10,956 B |
| Dashboard | 64 | <= 64 | 370.3 / 554.5 / 554.5 ms | 1,688 / 1,878 / 1,878 ms | 16,603 B |

Summed command duration exceeds wall time where independent commands overlap. With only three samples, p75/p95 are diagnostic maxima rather than stable tail estimates.

- `npm ci`: pass; 667 packages installed from the lockfile;
- `npm run lint`: pass;
- `npm run typecheck`: pass;
- `npm test`: 750/750 tests across 104/104 files;
- `npm run build`: pass on Next.js 15.5.22 with 86 generated static pages;
- `npm run perf:regression`: pass; no budget or operation-shape violation;
- `npm audit`: five moderate PostCSS-chain advisories and no high or critical finding; the forced remediation requires the explicitly excluded Next.js 16 breaking upgrade;
- `git diff --check`: pass; line-ending conversion warnings only;
- targeted Prettier check for both canonical documents: pass;
- no application code, test, configuration, dependency, deployment, or production setting changed in M58.

### Remaining risks, rejected approaches, and exact next action

Remaining release risks are the missing authenticated M32 Studio after-state, no equivalent post-M32 production reliability window, the unexplained causal mechanism behind the historical `>400` connection event, and the lack of a one-variable regional comparison. The exact M32 preview is also a source snapshot rather than an immutable Git commit, reducing deployment provenance for a release decision.

Rejected: arbitrary pool tuning, moving Atlas, production-region changes, speculative indexes, remaining-query optimization under budget, naive cache single-flight, a PostgreSQL benchmark, and interpreting current 12/500 utilization as proof that the historical incident is resolved.

The single next action is to **authenticate an ordinary test user on the exact M32 preview and run the existing correlated 10–20 sample Studio matrix while recording Atlas connections and creation rate over the same window**. That closes the only still-inaccessible half of M58 and determines whether the designed one-variable regional preview experiment is the next safe action.

## M59 — Final authenticated Studio validation

### Objective, deployment identity, and status

M59 was deliberately limited to the one remaining release-gate question: authenticated Studio performance on the exact M32 preview. The repository remains on `dev` at `88ac3e1b13abb5150d31f07b181d0718f1453b1f` (`v3.1.1`) with M32–M58 preserved as uncommitted working-tree changes. No commit contains M32.

The target remains preview deployment `dpl_CBR1huw8LxD55Ac5EjwpMRBNxtSq` at `https://hubzero-dgfwrrfp2-rifaques-projects.vercel.app`, created 9 August 2026 at 01:11:29 IST. It is a Vercel source snapshot based on `88ac3e1` plus the uncommitted M32 performance tree, not an immutable M32 commit. It is `Ready`, targets Preview rather than Production, runs Node.js 22.x with Fluid Compute, and its functions remain in `iad1`. Production remains the separate, untouched v3.1.1 deployment `dpl_HgLJwHB9bjTmX63FN415T6Zo8fQ5`.

The Preview environment exposes a sensitive `MONGODB_URI` variable, but Vercel's non-secret deployment/environment metadata does not expose its database name. The secret value was not retrieved or printed. Therefore M59 cannot independently confirm that the preview targets an isolated scratch/preview database. Existing M34 read-only telemetry proves that the preview reached the configured Atlas deployment, but does not safely identify the database name. Cache code and configuration remain the exact M32 snapshot; no cache, environment, database, Vercel, or production configuration changed.

**M59 status: BLOCKED at ordinary Studio authentication.** No application change was required or made.

### Authentication result

A fresh browser navigation to the exact preview Studio dashboard redirected to:

`/studio/login?callbackUrl=%2Fstudio%2Fdashboard`

The only connected browser context had no preview-domain session and presented empty Email and Password fields with no saved test-account suggestion. Repository and environment-name inspection found no approved ordinary test credential. No password store, cookie, local storage, production session, credential value, or private token was inspected or copied. No user was created, authentication was not bypassed, and no privileged access was manufactured. The normal login page was left open for an authorized test user.

This satisfies the required fail-closed rule: authentication is genuinely unavailable in the current environment, so Studio measurement stopped rather than substituting headless authentication or production credentials.

### Studio measurements and comparison

No authenticated M32 request exists for Dashboard, Health, Work, Activity, Search, Blueprint editor, or the editor useful-content milestone. Consequently there is no valid M59 TTFB, server duration, browser useful-content time, hydration time, Mongo acquisition/checkout/command distribution, cache state, request correlation ID, failure rate, or p50/p75/p95 distribution.

| Surface | v3.1.1 p50 | v3.1.1 p75 | M32 p50 | M32 p75 | Relative result | Confidence |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Dashboard | 5.443 s | 5.476 s | unavailable | unavailable | inconclusive | blocked: ordinary preview authentication |
| Health | 5.204 s | 5.245 s | unavailable | unavailable | inconclusive | blocked: ordinary preview authentication |
| Work collection | 0.747 s | 1.594 s | unavailable | unavailable | inconclusive | blocked: ordinary preview authentication |
| Search | 1.555 s | 2.471 s | unavailable | unavailable | inconclusive | blocked: ordinary preview authentication |
| Activity | 1.386 s | 2.388 s | unavailable | unavailable | inconclusive | blocked: ordinary preview authentication |
| Blueprint editor editable | 5.540 s | 5.573 s | unavailable | unavailable | inconclusive | blocked: ordinary preview authentication |

The production values remain v3.1.1 references and are not M32 before/after evidence. M59 cannot determine whether M32's 89–92% Studio operation reduction improves user-visible Studio latency, and no percentage or qualitative improvement claim is made.

### Atlas correlation and remaining bottleneck

There was no authenticated Studio measurement window, so no Atlas connection/creation peak can be causally paired with Studio navigation. Re-reading current Atlas state without the matching workload would not answer M59's correlation question and was not substituted for it. M58 remains authoritative for the healthy 12/500 inspection state, the historical `>400` incident, Mumbai region, and the established connection/readiness risks.

The remaining authenticated Studio bottleneck is therefore **unclassified**, not presumed to be connection acquisition, checkout, Mongo command execution, server composition, cache fill, transfer, or hydration. The broader infrastructure diagnosis remains M58's combination of proven cold connection/readiness and cache-fill amplification with a strongly supported cross-region contribution. It cannot be promoted into an authenticated Studio diagnosis without the missing samples.

No Dashboard, Health, Work, Activity, Search, editor-rendering, editor-behavior, hydration, application-error, or preview Mongo-failure regression could be browser-verified behind authentication. The login redirect behaved correctly.

### M32 regression gate and static verification

The three-sample fresh-process regression gate passed again with exact operation and command/collection shapes. With three samples, p75/p95 are diagnostic maxima rather than stable tail estimates; summed command duration can exceed wall time because commands overlap.

| Composition | Operations | Budget | Wall p50 / p75 / p95 | DB sum p50 / p75 / p95 | Payload |
| --- | ---: | ---: | ---: | ---: | ---: |
| Homepage | 40 | <= 40 | 661.9 / 1,039.4 / 1,039.4 ms | 1,024 / 1,532 / 1,532 ms | 125,042 B |
| Work detail | 13 | <= 13 | 196.6 / 216.6 / 216.6 ms | 433 / 576 / 576 ms | 13,344 B |
| Studio health | 45 | <= 45 | 351.7 / 437.9 / 437.9 ms | 1,199 / 1,691 / 1,691 ms | 9,366 B |
| Studio editor | 56 | <= 56 | 479.9 / 514.9 / 514.9 ms | 1,916 / 1,982 / 1,982 ms | 10,956 B |
| Dashboard | 64 | <= 64 | 726.3 / 803.7 / 803.7 ms | 3,015 / 3,456 / 3,456 ms | 16,603 B |

- `npm run lint`: pass;
- `npm run typecheck`: pass;
- `npm test`: 750/750 tests across 104/104 files;
- `npm run build`: pass on Next.js 15.5.22 with 86 generated static pages;
- `npm run perf:regression`: pass; exact budgets and stable shapes;
- `git diff --check`: pass; line-ending conversion warnings only;
- targeted Prettier check for both canonical documents: pass;
- no application code, test, dependency, runtime, cache, pool, Atlas, Vercel, deployment, or production setting changed.

### Decision and exact next action

Pool, Atlas tier/region, Vercel region, cache single-flight, indexes, and MongoDB architecture remain unchanged. M59 supplies no evidence that reopens any M58 infrastructure decision. **Database decision: KEEP MONGODB.**

**Release classification: BLOCKED.** The sole intended measurement could not begin because the required ordinary test session is absent. The unverified preview database name is an additional deployment-safety fact that must be confirmed before using a session to navigate potentially mutable Studio surfaces.

The one next action is for an authorized operator to **sign an ordinary test user into the already-open exact M32 preview and confirm that the Preview environment targets the approved non-production database, then resume the same browser session**. Once that is done, run the predefined 10–20 sample Studio matrix and simultaneous Atlas observation without changing any configuration.

## M60 — Final authorized validation window

### Authentication and deployment result

M60 followed the fail-closed validation sequence without reopening the performance investigation. The exact target remained preview deployment `dpl_CBR1huw8LxD55Ac5EjwpMRBNxtSq` at `https://hubzero-dgfwrrfp2-rifaques-projects.vercel.app`, created from the `88ac3e1` base plus the uncommitted M32 performance tree. It remains a Preview source snapshot, not an immutable M32 commit. Runtime and topology remain Node.js 22.x, Fluid Compute, and `iad1`; production remains the separate untouched v3.1.1 deployment.

Unlike M59, a fresh navigation to `/studio/dashboard` remained on the dashboard and rendered the complete authenticated Studio shell and dashboard. The shell identified the active role as **Head Admin**. This proves that a preview-domain session exists, but it is not the required ordinary test-user session and was not accepted for performance measurement. No password, token, cookie, browser storage, new user, or authentication bypass was inspected, copied, created, or used by the validation process. The existing privileged session was used only for the minimum read-only authentication/isolation probe and no further Studio navigation.

### Preview database-isolation result

**Preview database isolation could not be confirmed. Measurement stopped.**

Vercel's non-secret Preview metadata still exposes only the existence of a sensitive `MONGODB_URI`, not its database name. No URI secret was retrieved or printed. The authenticated dashboard exposed a production-shaped dataset signature: 1 published Work, 1 Build, 10 Blueprints, 1 Lab, and 5 Engineering Profiles, plus the same known recent `Nexus` activity already documented in the production inventory. This is strong evidence that the preview does not contain an obviously isolated scratch fixture set, but visible record counts cannot prove the underlying database name; it could be production or a copy.

Because the approved non-production target was not proven, M60 performed no editor navigation, search submission, route sampling, data mutation, or other meaningful Studio work. Loading the read-only dashboard solely to establish authentication and dataset identity was the limit of authorized behavior.

### Studio, Atlas, and comparison evidence

No performance measurement phase began. There are no M60 Dashboard, Health, Work, Activity, Search, Blueprint editor, useful-content, TTFB, server-duration, hydration, Mongo acquisition/checkout/command, cache, correlation-ID, or failure distributions. The authenticated dashboard load is an isolation probe, not a performance sample.

There was no Studio workload window to correlate with Atlas, so no M60 connection peak, creation rate, utilization change, or cluster event is claimed. M58 remains authoritative for Atlas topology and connection history.

| Surface | v3.1.1 p50 | v3.1.1 p75 | M32 p50 | M32 p75 | Result | Confidence |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Dashboard | 5.443 s | 5.476 s | unavailable | unavailable | inconclusive | stopped at database-isolation gate |
| Health | 5.204 s | 5.245 s | unavailable | unavailable | inconclusive | stopped at database-isolation gate |
| Work collection | 0.747 s | 1.594 s | unavailable | unavailable | inconclusive | stopped at database-isolation gate |
| Search | 1.555 s | 2.471 s | unavailable | unavailable | inconclusive | stopped at database-isolation gate |
| Activity | 1.386 s | 2.388 s | unavailable | unavailable | inconclusive | stopped at database-isolation gate |
| Blueprint editor editable | 5.540 s | 5.573 s | unavailable | unavailable | inconclusive | stopped at database-isolation gate |

M60 therefore cannot determine whether M32 improves authenticated server latency, browser useful-content time, hydration, checkout contention, or the v3.1.1 reference. No percentage or qualitative improvement is claimed.

### Verification and decisions

The M60 stop rule occurred before the performance and static-gate phases. `perf:regression`, lint, typecheck, tests, build, and `git diff --check` were deliberately not rerun as substitute progress. M59 remains the latest verification of the unchanged tree: exact 40/13/45/56/64 operation budgets, lint and typecheck clean, 750/750 tests, production build pass, and `git diff --check` clean. M60 changed documentation only.

No application bug was found or fixed. The new release-safety finding is deployment-level: only a privileged preview session is present, its non-production database isolation is not safely verifiable, and its visible content matches the production-shaped inventory.

- **Pool:** current evidence still does not justify changing `maxPoolSize`.
- **Region:** the separately designed Mumbai-proximity A/B remains justified for a future authorized experiment, but M60 supplies no new result and executes nothing.
- **Cache:** cross-instance single-flight remains rejected because invalidation safety is unproven.
- **Database:** **KEEP MONGODB**; M60 supplies no architectural counter-evidence.

**Release classification: BLOCKED.** The required ordinary test-user session and preview database isolation are both unconfirmed. The single next action is for an authorized project owner to confirm the Preview `MONGODB_URI` database name directly in Vercel without sharing the connection string and sign in an ordinary test user only if that target is the approved non-production database. Otherwise provision an explicitly authorized isolated Preview environment before measuring.

## M61 — Safe performance-validation environment

### Objective, hard stop, and confirmed unsafe state

Authenticated performance testing against the current Preview stopped before this milestone began. The user supplied the definitive configuration fact that both Production and Preview currently select MongoDB database `hubzero-prod` on the Atlas `hubzero-prod` cluster. The M60 production-shaped dashboard was consistent with that configuration. Preview is therefore not an isolated validation environment regardless of its Vercel label.

No browser, authenticated Studio route, database command, seed, cache invalidation, Atlas mutation, Vercel mutation, deployment, or production write occurred in M61. The repository remains on `dev` at `88ac3e1` plus the uncommitted M32–M60 tree; production remains untouched on v3.1.1.

### Configuration audit

The database-selection architecture is simple and internally consistent:

- `src/lib/env.ts` defines one server-only `MONGODB_URI`; there is no separate database-name variable.
- `src/lib/db/mongodb.ts` constructs one `MongoClient` from that URI and `getDb()` calls `client.db()` without an override. MongoDB therefore selects the database embedded in the URI path.
- All application repositories obtain collections through the shared `getDb()` path. No repository hardcodes a production database name.
- Auth.js's MongoDB adapter receives the same client and calls `client.db(options.databaseName)` with no option supplied, so it uses the same URI-selected database. Users created for an isolated database remain in that database.
- `src/lib/public/cache.ts` parses the database name from `MONGODB_URI` and includes it in `publicCacheScope()`. Existing regression tests prove two databases on the same cluster receive different persistent-cache scopes without placing credentials or the host in cache keys.
- Preview and Production have separate Vercel environment entries for `MONGODB_URI`; both values are sensitive and were not retrieved or printed. Vercel can therefore target them independently without changing application code.
- The application has no required assumption that the database is named `hubzero-prod` outside configuration. References to `hubzero_scratch` exist in historical verification and cache-isolation tests, not runtime routing.

**Override conclusion:** the current client has no explicit database override, and none is needed. Selecting a dedicated database in the Preview URI is sufficient for repositories, credentials authentication, command monitoring, and cache isolation. Adding `MONGODB_DB_NAME` would create a second source of truth and would also require keeping the Auth.js adapter aligned.

### Existing scratch and fixture capability

An established scratch pattern exists, but not a reusable performance environment:

- earlier milestones selected `hubzero_scratch` by overriding the URI database path;
- the cache-scope implementation was added specifically to prevent same-worktree cache reuse between production and scratch databases;
- `bootstrap:dev-admin` can create a local-development Head Admin through validated repositories, but it is not a general fixture seeder and refuses non-development execution;
- `create:head-admin` is a deliberately guarded real-environment account utility and is inappropriate for an ordinary performance test user;
- no repository script deterministically seeds Studio content, Documents, media, taxonomy, relationships, Featured Order, or editorial activity;
- unit tests contain small inline factories, but no production-shaped reusable fixture package.

The existing scratch mechanism proves same-cluster database selection works. Reusing an unknown or previously used `hubzero_scratch` database would not provide the clean ownership and deterministic state required for the release gate.

### Isolation options

| Option | Safety and fidelity | Cost/complexity | Decision |
| --- | --- | --- | --- |
| A. dedicated database on `hubzero-prod` cluster | isolates data while preserving the real `iad1` → Mumbai M0 path and shared-tier behavior | smallest; one database-scoped user, one Preview-only URI, deterministic fixtures | **selected** |
| B. dedicated Atlas cluster | strongest capacity isolation but changes the topology/tier being evaluated | new infrastructure, cost, credentials, monitoring, and potentially non-comparable behavior | rejected for M32 validation |
| C. reuse `hubzero_scratch` | proven local override pattern and same-cluster topology | ownership/current contents are not established; no deterministic seeder or Preview user | rejected in favor of a fresh named database |

### Selected design

The selected database name is **`hubzero_perf_m32`** on the existing AWS Mumbai M0 cluster.

Required implementation sequence, pending explicit infrastructure authorization:

1. Create a dedicated Atlas database user whose only application-data role is `readWrite` on `hubzero_perf_m32`; it must have no role on `hubzero-prod`.
2. Configure the Vercel **Preview-only** `MONGODB_URI` to use that user and end in `/hubzero_perf_m32`; leave the Production variable unchanged at `/hubzero-prod`.
3. Redeploy only the exact M32 Preview source snapshot. Environment changes do not retroactively alter an existing deployment.
4. Independently verify the Preview URI database name in Vercel and the user's database-scoped role in Atlas without exposing either credential or connection string.
5. Seed only `hubzero_perf_m32` using an idempotent, guarded synthetic-fixture script.
6. Create an ordinary non-Head-Admin test user only in `hubzero_perf_m32` and authenticate the new Preview normally.
7. Verify a Preview-only sentinel through the application and verify absence of that sentinel in `hubzero-prod`. The visible difference is supporting evidence; the URI database name and Atlas role are the independent proof.

No database, user, environment variable, script, or deployment was created or changed in M61 because Preview still targets production and the hard-stop conditions prohibit working around that state.

### Proposed deterministic fixture contract

Production data must not be cloned. The new database should contain an idempotent synthetic set of approximately the current 190-document scale:

| Collection/domain | Proposed synthetic count | Purpose |
| --- | ---: | --- |
| Users | 2 | one setup administrator and one ordinary read-only validation user; credentials supplied out of band |
| Team + Engineering Profiles | 4 + 4 | author resolution and profile relationships |
| Work / Builds / Blueprints / Labs / Notes | 8 / 4 / 12 / 4 / 8 | collection, detail, health, search, dashboard, and batching paths |
| Careers / Services / Leads | 2 / 4 / 5 | dashboard and cross-collection health coverage |
| Documents / Document Versions | 35 / 8 | editor, role, history, public eligibility, and document-media paths |
| Media / Taxonomy | 24 / 20 | batched enrichment and editor resolution |
| Editorial Events | 40 | Activity, editor history, and dashboard recent activity |
| Settings | 1 | explicit Preview sentinel and Studio configuration |
| **Total** | **185 documents** | representative of the current approximately 190-document scale |

Relationships and Featured Order are embedded in these records rather than added as artificial collections. Fixtures should include deterministic slugs/reference IDs, bounded healthy and intentionally unhealthy relationship cases, two eligible featured entries per permanent collection where the schema permits, media shared by multiple entries, taxonomy shared across collections, and enough published/draft/in-review/archived states to exercise Dashboard and Health.

The future seeder must parse the URI path and refuse every database except the exact allow-listed `hubzero_perf_m32`; refuse `hubzero-prod`, blank/default databases, and production Vercel context; validate records through existing schemas; use deterministic upserts rather than `dropDatabase` or collection drops; namespace every fixture; print counts only; and never contain credentials. Cleanup, if ever needed, must target only that namespace inside the dedicated database and requires separate authorization.

### Isolation and production-safety proof required before M60 resumes

The validation gate is seven-part and all parts must pass:

1. authorized Vercel inspection reports Preview database `hubzero_perf_m32`;
2. authorized Vercel inspection reports Production database `hubzero-prod`;
3. the names differ;
4. Atlas shows the Preview user has no privilege on `hubzero-prod`;
5. Preview telemetry/application sentinel confirms reads from `hubzero_perf_m32` after a fresh deployment;
6. the ordinary test account exists only in `hubzero_perf_m32`;
7. read-only production fingerprints—collection counts plus latest `updatedAt` where available—remain identical before and after fixture creation, with no production cache invalidation, index change, environment change, or deployment.

The fixture database shares the same Atlas cluster, tier, connection limit, and Mumbai region. It proves safe data isolation and exercises the real Vercel-to-Atlas path, M32 queries, connection establishment/checkout, and controlled cache behavior. It does **not** isolate cluster capacity, prove production connection headroom, or reproduce production workload contention.

### Verification, decisions, and remaining work

Environment setup did not occur, so the post-setup lint/typecheck/test/build/performance gate was not run. M59 remains the latest full unchanged-tree verification; M61 documentation passes `git diff --check` and targeted Prettier verification.

- `maxPoolSize`, Atlas tier/region, Vercel region, indexes, cache semantics, and single-flight remain unchanged.
- **Database decision: KEEP MONGODB.** A same-cluster dedicated database is the selected validation architecture.
- **Measurement readiness: NOT READY.** Preview still points to `hubzero-prod`; fixtures and an ordinary isolated user do not exist.
- **Release classification: BLOCKED.** The blocker is now an explicit environment-preparation authorization boundary, not missing instrumentation.

The single next action is an authorized infrastructure change window to create `hubzero_perf_m32` plus its database-scoped user, update only the Vercel Preview URI, and produce a fresh Preview deployment. No fixture or authenticated performance work may begin until the seven-part isolation proof passes.

## M62 — Performance environment isolation execution

### Objective and baseline

M62 executed only the authorized isolation work designed in M61. Before the change, both Production and Preview selected `hubzero-prod`; authenticated Preview testing was therefore prohibited. The repository remained on `dev` at `88ac3e1` plus the uncommitted M32–M61 tree. Production remained on its separate v3.1.1 deployment and was not edited or redeployed.

The selected topology is intentionally same-cluster: Vercel Preview in `iad1` with Node.js 22.x and Fluid Compute connects to the existing AWS Mumbai (`ap-south-1`) M0 cluster, but selects a dedicated database named `hubzero_perf_m32`. This establishes data isolation while retaining the production-shaped network path and shared-tier behavior. It does not establish cluster-capacity isolation.

### Atlas database and authorization boundary

Atlas database `hubzero_perf_m32` was created on cluster `hubzero-prod`. A dedicated SCRAM user named `hubzero_perf_m32_app` was created with the single MongoDB role `readWrite@hubzero_perf_m32`. Atlas displays no role on `hubzero-prod` and no any-database or administrative role.

The boundary was verified independently with the scoped credential: a ping against `hubzero_perf_m32` succeeded, while a read-only `listCollections` attempt against `hubzero-prod` failed with an Atlas authorization error. No credential, password, token, or URI was printed or persisted in the repository.

### Vercel Preview and isolation proof

Only the Preview-scoped `MONGODB_URI` was edited. The Production-scoped variable and production deployment were not touched. Vercel then redeployed the exact prior M32 source snapshot with the latest Preview settings:

- deployment: `dpl_BeyQ3UT1cVt5nqm3vag6desufRAd`;
- URL: `https://hubzero-r4144yanr-rifaques-projects.vercel.app`;
- source identity: the same uploaded snapshot based on `88ac3e1` plus the uncommitted M32 performance tree, not a new immutable Git commit;
- environment: Preview, Node.js 22.x, Fluid Compute, `iad1`.

The seven-part gate passed:

1. the Preview-only environment entry was changed to the scoped user and `/hubzero_perf_m32`, and the fresh deployment inherited the latest Preview settings;
2. Production remains configured for `hubzero-prod` and its environment entry was not edited;
3. the scoped Preview credential is authorized for `hubzero_perf_m32` and was denied against `hubzero-prod`;
4. the Preview entry uses the dedicated scoped user; the broader Production credential was not copied or used;
5. a harmless synthetic Work marker written with the scoped credential appeared on the fresh Preview `/work` route;
6. no production environment, deployment, user, data, cache invalidation, index, Atlas tier, region, or pool setting changed;
7. the same marker was absent from production `/work`, proving that the controlled Preview write did not appear in Production.

### Synthetic fixtures and ordinary account

After the isolation gate passed, `scripts/seed-performance-environment.ts` seeded the documented deterministic contract by validated, namespaced `replaceOne(..., { upsert: true })` operations. The script refuses every database except `hubzero_perf_m32`, refuses `VERCEL_ENV=production`, performs no drops or deletes, accepts credentials only through process memory/environment, and prints counts only. A second run returned the same counts, proving idempotence.

| Collection/domain | Documents |
| --- | ---: |
| Users | 2 |
| Team / Engineering Profiles | 4 / 4 |
| Work / Builds / Blueprints / Labs / Notes | 8 / 4 / 12 / 4 / 8 |
| Careers / Services / Leads | 2 / 4 / 5 |
| Documents / Document Versions | 35 / 8 |
| Media / Taxonomy | 24 / 20 |
| Editorial Events | 40 |
| Settings | 1 |
| **Total** | **185** |

The two accounts are synthetic `member` and `admin` users; neither is Head Admin. The ordinary member authenticated through the normal Preview `/studio/login` flow, reached `/studio/dashboard`, rendered the `Member` role, and produced no application error. The credential exists only in the isolated database because the scoped database user cannot read or write Production. No Studio performance samples were collected.

### Regression gate and verification

The first draft fixture shape caused the harness to exercise additional public-author and health enrichment, producing 20 Work-detail, 48 health, 59 editor, and 67 dashboard operations. This was a fixture-contract defect rather than an application regression. The fixture visibility and relationship mix was bounded so the representative compositions stay within the established hard limits while relationship/media/taxonomy/editor paths remain present elsewhere in the dataset. No application query or budget was changed.

The final official three-sample isolated-process result was stable:

| Composition | Operations min/p50/p75/p95/max | Budget | Wall-time min/p50/p75/p95/max |
| --- | ---: | ---: | ---: |
| Homepage | 21 / 21 / 21 / 21 / 21 | <= 40 | 347.3 / 368.4 / 426.6 / 426.6 / 426.6 ms |
| Work detail | 13 / 13 / 13 / 13 / 13 | <= 13 | 252.7 / 257.1 / 329.1 / 329.1 / 329.1 ms |
| Studio health | 28 / 28 / 28 / 28 / 28 | <= 45 | 179.9 / 194.6 / 199.0 / 199.0 / 199.0 ms |
| Studio editor | 39 / 39 / 39 / 39 / 39 | <= 56 | 230.9 / 579.6 / 626.8 / 626.8 / 626.8 ms |
| Dashboard | 47 / 47 / 47 / 47 / 47 | <= 64 | 229.8 / 264.9 / 589.0 / 589.0 / 589.0 ms |

`npm run lint`, `npm run typecheck`, 750/750 tests across 104 files, `npm run build`, `npm run perf:regression`, and `git diff --check` pass. Direct guard probes also prove that the seeder refuses both a `hubzero-prod` URI and a Production Vercel context before connecting. Build and performance commands were given the isolated URI through process memory so `.env.local` could not select Production. No Next.js upgrade, audit-force action, query/cache/pool/index/region change, or production action occurred.

### Decision and next action

**Database decision: Keep MongoDB. Measurement readiness: Ready. Release classification: Further Validation Required.** The unsafe-environment blocker is closed, but the authorized scope explicitly stops before the 10–20 sample authenticated Studio measurement window. The single next action is to measure Dashboard, Health, Work, Activity, Search, and Blueprint editor on deployment `dpl_BeyQ3UT1cVt5nqm3vag6desufRAd` with the existing ordinary session and simultaneous Atlas connection observation.

## M63 — Authenticated M32 Studio performance validation

### Objective, environment, and method

M63 measured the approved isolated Preview without changing application code or infrastructure. The target was deployment `dpl_BeyQ3UT1cVt5nqm3vag6desufRAd` at `https://hubzero-r4144yanr-rifaques-projects.vercel.app`, the `88ac3e1` base plus the uncommitted M32 source snapshot. It runs Node.js 22.x with Fluid Compute in `iad1` and selects `hubzero_perf_m32` on the existing AWS Mumbai (`ap-south-1`) M0 cluster. The normal measurement window was approximately 2026-08-09 11:54:24–12:01:00 UTC; a separate five-request burst ran from 12:09:43–12:10:23 UTC. The authenticated account rendered the `Member` role and the fixture database retained exactly 185 synthetic documents.

Ten sequential full navigations were recorded for each accessible surface. `goto` completion and a route-specific useful-content marker were timed separately; the Blueprint editor milestone was the member-owned draft's visible `Name` textbox. The connected-browser control surface does not expose authenticated cookies, raw response timing, or Navigation Timing entries, so no browser number below is relabeled as TTFB or hydration time. Vercel's existing structured logs supply route-segment, connection, checkout, Mongo-command, instance, request-ID, status, and cache evidence. Mongo durations are sums across commands and may exceed wall time when commands overlap.

### Authenticated browser measurements

| Surface | Valid browser samples | Navigation wall p50 / p75 / p95 | Useful or editable p50 / p75 / p95 | Result |
| --- | ---: | ---: | ---: | --- |
| Dashboard | 10 | 0.521 / 0.542 / 0.746 s | 2.334 / 3.275 / 3.516 s | rendered correctly; no visible application error |
| Work collection | 10 | 0.528 / 0.726 / 1.038 s | 0.894 / 1.095 / 1.955 s | rendered correctly |
| Search (`q=M32`) | 10 | 0.520 / 0.563 / 0.727 s | 0.905 / 1.080 / 1.752 s | rendered correctly |
| Blueprint editor | 10 | 0.577 / 0.717 / 0.821 s | 2.453 / 2.513 / 2.576 s editable | rendered correctly; textbox became editable in all 10 samples |
| Editor post-navigation to editable | 10 | — | 1.935 / 1.939 / 1.966 s | server streaming plus transfer/render/hydration, not a pure hydration measurement |
| Health | 0 valid | — | — | ordinary Member correctly received `You can't review content health` |
| Activity | 0 valid | — | — | ordinary Member correctly received `You can't view Studio activity` |

Health and Activity were each probed repeatedly but are not performance samples of their real workloads: the ordinary account lacks their cross-collection permissions, and bypassing that boundary was prohibited. Their instrumented error pages used zero Mongo operations and completed their page spans in roughly 11–79 ms. A different authorized non-Head-Admin role with the required cross-collection capability is needed to validate those two surfaces.

### Vercel and Mongo correlation

The correlated Preview logs contain the decisive evidence:

- a `/studio/content/work` instance (`7d77a2cd`) attempted to connect for **69,375.6 ms**, ended in `MongoServerSelectionError`, logged the driver's 30-second server-selection timeout, then exited Node with status 128; Vercel recorded the request as HTTP 200 through the application error boundary;
- another new instance (`389ef6d4`) completed Mongo connection establishment in **28,469.9 ms** during Dashboard work;
- a third new instance (`c372c741`) completed establishment in **7,879.1 ms** during a Health authorization request;
- no Mongo command or checkout failure was recorded on successful measured requests;
- at least six runtime instance IDs were observed when the failed connection-only instance is included. The ten-sample route windows therefore were not confined to one process.

Warm client acquisition was small, while pool checkout was bimodal:

| Surface | Correlated requests | Instrumented operations p50 / p75 | Longest segment p50 / p75 / p95 | Summed command duration p50 / p75 | Summed checkout p50 / p75 / p95 | Largest individual checkout |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Dashboard | 25 broader-window requests | 27 / 27 | 1.546 / 1.558 / 1.683 s | 5.122 / 5.152 s | 1.041 / 3.178 / 7.926 s | 1.136 s |
| Work | 11 normal requests | 2 / 2 | 0.190 / 0.203 / 0.205 s | 0.372 / 0.387 s | 0.002 / 0.002 / 0.002 s | 0.001 s |
| Search | 11 | 15 / 15 | 0.211 / 1.179 / 1.234 s | 2.850 / 2.867 s | 0 / 0 / 1.953 s | 0.979 s |
| Blueprint editor | 22 broader-window requests | 39 / 39 | 1.213 / 1.225 / 1.724 s | 7.447 / 7.472 s | 0.001 / 0.005 / 1.961 s | 1.065 s |

Dashboard's instrumented count is 27 because the Preview telemetry covers its page and deferred recent-activity segments; the controlled composition harness remains the complete 47-operation regression contract. The editor's 39 operations match the controlled fixture composition. Commands average about 186–191 ms each on these routes, but batching and parallelism keep warm route-segment wall time far below the summed duration. The large wall-time outliers align with checkout waits, not higher operation counts.

The five-request Work burst was deliberately small. All five responses rendered, used two already-warm instances, retained two operations per request, showed 0–2 ms summed checkout, created no observed new instance or pool expansion, and produced no failure. It therefore says only that warm capacity handled this small burst; it does not disprove the cold failure.

### Atlas observation

Atlas displayed 82/500 connections (16%) at the start, 105/500 (21%) after the normal window, and 86/500 (17%) after the small burst. The one-hour member chart showed a transient primary-member peak a little above 200 connections during the broader interval, but Atlas did not expose a precise aggregate point that can be attributed exclusively to this test. Connection Rate used a 0–2/s chart scale. Because Production and Preview share the cluster, these observations cannot isolate Preview from unrelated production activity. They prove neither current saturation nor production headroom under a production burst. No Atlas connection alert or cluster event fired during the test.

### v3.1.1 comparison

The v3.1.1 numbers use production content and a different deployment/cache history; M32 uses the controlled 185-document database. Every comparison is therefore **Inconclusive**, even where direction is favorable.

| Surface | v3.1.1 p50 | v3.1.1 p75 | M32 useful p50 | M32 useful p75 | Change | Classification |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Dashboard | 5.443 s | 5.476 s | 2.334 s | 3.275 s | directionally lower | Inconclusive |
| Health | 5.204 s | 5.245 s | — | — | permission-gated | Inconclusive |
| Work | 0.747 s | 1.594 s | 0.894 s | 1.095 s | mixed p50; lower p75 | Inconclusive |
| Search | 1.555 s | 2.471 s | 0.905 s | 1.080 s | directionally lower | Inconclusive |
| Activity | 1.386 s | 2.388 s | — | — | permission-gated | Inconclusive |
| Blueprint editor | 5.540 s | 5.573 s | 2.453 s | 2.513 s | directionally lower | Inconclusive |

M32 clearly reduces controlled application work and the synthetic Preview's warm useful-content times are directionally better. It cannot be claimed as a production percentage improvement. More importantly, the isolated M32 Preview reproduced the production connection-failure class, so M32 did not solve the remaining reliability problem.

### Decisions

- **Confirmed bottleneck:** mixed Vercel-to-Atlas connection establishment/readiness and intermittent pool checkout. Warm application composition is materially smaller; query count is stable. The `iad1` ↔ Mumbai topology remains a strongly supported contributor, not the sole proven cause. M0/shared-tier variability remains plausible.
- **Pool:** current evidence still does not justify changing `maxPoolSize`. Successful pools topped out at 19 observed connections per instance, while the failure happened before a usable connection existed. A smaller cap would not repair 7.9–69.4 second establishment and could worsen checkout.
- **Region:** a one-variable Preview A/B in a Mumbai-proximate Vercel region is now the highest-value next experiment. It is justified by the repeated cold-establishment failures and otherwise small warm acquisition cost, but was not executed in M63.
- **Cache:** no cross-instance single-flight change. The test adds no invalidation-safe design, and the observed failure occurs before cache-fill correctness can be the primary remedy.
- **Database:** **KEEP MONGODB.** Data modeling and query execution remain appropriate; the evidence implicates deployment topology/connection readiness rather than a MongoDB architectural limitation.
- **Application defects:** the known reliability defect is reproduced: a Mongo connection rejection can terminate the process while Vercel reports HTTP 200. No code fix was made in this measurement-only milestone.

### Regression and verification

`npm ci`, `npm run lint`, `npm run typecheck`, 750/750 tests across 104 files, `npm run build`, `npm run perf:regression`, and `git diff --check` pass. The isolated regression maxima are 21 homepage, 13 Work detail, 28 health, 39 editor, and 47 dashboard, with stable operation shapes and unchanged 40/13/45/56/64 hard budgets. The build retains a 347 kB Blueprint-editor First Load JS bundle. `npm ci` reports the existing five moderate advisories; no dependency was upgraded and no audit-force action was used.

No application source, query, cache, pool, index, region, Atlas configuration, Vercel configuration, production data, or deployment changed. M63 changes only the two canonical documentation records.

### Status and exact next action

**M63 status: partially complete; release classification: BLOCKED.** Dashboard, Work, Search, and the Blueprint editor now have authenticated distributions and Atlas/Vercel correlation. Health and Activity remain unmeasured for their real workloads because the approved Member role cannot access them. Independently, the reproduced `MongoServerSelectionError` plus process exit is a critical release blocker.

The single next action is an authorized, one-variable Mumbai-proximate Vercel Preview A/B using the same M32 snapshot, isolated database, fixtures, account, sample protocol, and Atlas observation. Success must materially reduce cold establishment/checkout and produce zero failures without a greater than 10% warm regression; failure or continued errors should keep v3.2 blocked and trigger focused connection-failure handling/capacity analysis rather than query changes.

## M64 — Mumbai-proximate Vercel region A/B

### Objective, control, and one-variable deployment

M64 changed exactly one experimental variable: Vercel Function execution moved from the existing `iad1` control to Vercel Mumbai `bom1`, the supported region colocated with Atlas AWS Mumbai (`ap-south-1`). Vercel documents `bom1` as Mumbai and supports a deployment-scoped `vercel deploy --regions` override; this avoided any project-wide or Production region edit.

The control remains Preview deployment `dpl_BeyQ3UT1cVt5nqm3vag6desufRAd` at `https://hubzero-r4144yanr-rifaques-projects.vercel.app` in `iad1`. The experiment is Preview deployment `dpl_BzFP7cUGgQFwNsMv3afJG9gXXQcZ` at `https://hubzero-h6o93ahwz-rifaques-projects.vercel.app`; Vercel inspection reports every emitted Function in `bom1`. Both deployments use Node.js 22.x, Fluid Compute, the same project configuration, the `88ac3e1` base plus the uncommitted M32 source tree, the same Preview-scoped credential, `hubzero_perf_m32`, the same 185 deterministic fixtures, the same ordinary Member, default Mongo pool settings, and unchanged application/cache behavior. The direct deployment URLs—not mutable aliases—were measured. Production was neither configured nor deployed.

Isolation was rechecked before sampling. The experimental Studio accepted only the isolated Member and rendered the deterministic M32 fixture signature, including `M32 Isolation Marker`; its inherited Preview credential is the same database-scoped credential already proven denied on `hubzero-prod`. The Atlas database and credential were not changed, no fixture was added, and Production remained outside the experiment. A workstation-side fixture recount could not be repeated because local Atlas SRV resolution returned `ECONNREFUSED`; the application and prior independently verified 185-document contract remained the evidence boundary.

### Measurement protocol and limitations

The authenticated browser window ran from approximately 2026-08-09 16:27:26 to 16:33:55 UTC. Ten sequential full navigations were recorded for Dashboard, Work, Search, and the member-owned draft Blueprint editor using the same helper and useful-content markers as M63. Browser `goto` wall time and useful/editable time remain distinct from TTFB; the connected browser did not expose a reliable Navigation Timing/TTFB value. Vercel structured telemetry supplied request, instance, connection, client-acquisition, checkout, Mongo-command, segment, status, and failure data.

True cold instance creation cannot be commanded deterministically under Fluid Compute. Forty normal Studio navigations produced five observed new Mongo clients. Four connected in less than one second; one took 47.446 seconds. The matched five-request Work burst reused four existing instances and did not create another client. Creating more deployments or applying aggressive load merely to reach ten cold observations would have changed the protocol or increased M0 risk, so cold percentiles are explicitly small-sample evidence.

### Cold connection and warm request results

Successful cold-establishment percentiles use nearest-rank distributions. The iad1 control has only two successful observations plus one failure; its p75/p95 therefore equal the slower successful observation. The failure duration is reported separately rather than mislabeled as a successful establishment.

| Metric | iad1 control | Mumbai `bom1` | Difference | Classification |
| --- | ---: | ---: | ---: | --- |
| Successful cold Mongo establishment p50 | 7.879 s (n=2) | 0.513 s (n=5) | -93.5% | Strong central improvement; small n |
| Successful cold Mongo establishment p75 | 28.470 s | 0.886 s | -96.9% | Strong central improvement; small n |
| Successful cold Mongo establishment p95 | 28.470 s | 47.446 s | +66.7% | Tail regression; one extreme successful connection |
| Dashboard summed checkout p50 | 1.041 s (n=25 broader window) | 0.283 s (n=11) | -72.8% | Moderate improvement |
| Dashboard summed checkout p75 | 3.178 s | 0.561 s | -82.3% | Strong improvement |
| Dashboard summed checkout p95 | 7.926 s | 1.170 s | -85.2% | Strong improvement, but non-zero tail remains |
| Dashboard summed Mongo commands p50 | 5.122 s | 0.170 s | -96.7% | Strong improvement |
| Dashboard summed Mongo commands p75 | 5.152 s | 0.220 s | -95.7% | Strong improvement |
| Studio Dashboard useful p50 / p75 | 2.334 / 3.275 s | 0.505 / 0.671 s | -78.4% / -79.5% | Strong improvement |
| Studio Work useful p50 / p75 | 0.894 / 1.095 s | 0.347 / 0.561 s | -61.2% / -48.8% | Strong improvement |
| Studio Search useful p50 / p75 | 0.905 / 1.080 s | 0.492 / 0.574 s | -45.6% / -46.9% | Moderate improvement |
| Studio Blueprint editor editable p50 / p75 | 2.453 / 2.513 s | 0.551 / 0.562 s | -77.5% / -77.6% | Strong improvement |
| Mongo connection failures | 1 of 3 observed iad1 clients | 0 of 5 observed `bom1` clients | one observed failure removed | Reliability improvement is inconclusive at this n |

The directly comparable `bom1` browser distributions were:

| Surface | Samples | Navigation wall p50 / p75 / p95 | Useful or editable p50 / p75 / p95 | Errors |
| --- | ---: | ---: | ---: | ---: |
| Dashboard | 10 | 0.208 / 0.278 / 0.408 s | 0.505 / 0.671 / 0.784 s | 0 |
| Work | 10 | 0.182 / 0.207 / 0.239 s | 0.347 / 0.561 / 0.582 s | 0 |
| Search | 10 | 0.185 / 0.209 / 0.306 s | 0.492 / 0.574 / 0.694 s | 0 |
| Blueprint editor | 10 | 0.218 / 0.237 / 0.262 s | 0.551 / 0.562 / 0.596 s | 0 |
| Editor post-navigation to editable | 10 | — | 0.328 / 0.334 / 0.372 s | 0 |

Correlated warm server telemetry covered 11 requests per surface because each route was primed before its ten recorded samples. Mongo durations are sums across commands and can exceed segment wall time when work overlaps.

| Surface | Operations p50 / p75 | Longest segment p50 / p75 / p95 | Summed Mongo p50 / p75 / p95 | Summed checkout p50 / p75 / p95 | Largest checkout p95 | Failures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Dashboard | 27 / 27 | 0.104 / 0.224 / 0.301 s | 0.170 / 0.220 / 0.344 s | 0.283 / 0.561 / 1.170 s | 0.125 s | 0 |
| Work | 2 / 2 | 0.012 / 0.013 / 0.065 s | 0.013 / 0.017 / 0.021 s | 0.001 / 0.002 / 0.002 s | 0.001 s | 0 |
| Search | 15 / 15 | 0.093 / 0.104 / 0.168 s | 0.112 / 0.129 / 0.162 s | 0.015 / 0.177 / 0.247 s | 0.083 s | 0 |
| Blueprint editor | 39 / 39 | 0.077 / 0.177 / 0.224 s | 0.417 / 1.320 / 1.984 s | 0.001 / 0.004 / 0.299 s | 0.154 s | 0 |

Across all 44 correlated warm requests, client acquisition was 1.3/8.5/81.1 ms p50/p75/p95, summed checkout was 2/177/561 ms, summed Mongo duration was 118/220/1,320 ms, and the longest route segment was 77/104/224 ms. Some process-local/request caches produced zero-command segments; cache semantics and invalidation were unchanged.

The matched five-request Work burst completed in 0.922–1.413 seconds at the browser boundary. Vercel showed the same two operations per request, 6.9–17.5 ms segment time, 0–2 ms summed checkout, zero Mongo/checkout failure, four already-warm instances, and observed per-instance pool sizes of 11–17. It created no new instance and therefore is warm-concurrency evidence only.

### Atlas observation

Atlas displayed 31/500 connections (6%) before measurement and 49/500 (10%) after it, leaving 451 connections of displayed headroom. The one-hour chart remained on a 0–60 connection scale and the Connection Rate chart on a 0–1/s scale; Atlas did not expose a precise preview-only creation-rate point or aggregate peak. The highest directly observed cluster total was 49. No alert, connection error, or cluster event appeared during the window. Production and Preview share the cluster, so the 18-connection increase cannot be assigned exclusively to M64 and does not replace the historical >400-connection evidence.

### Interpretation and decisions

**Experiment classification: Moderate improvement.** Moving Functions to `bom1` materially reduced median and p75 cold connection time, summed Mongo-command latency, warm server segments, checkout tails, and all four useful-content distributions under the matched synthetic workload. This is direct evidence that `iad1` to Mumbai network distance materially inflated both per-command and connection-readiness cost.

Region proximity is not a complete fix. One of five `bom1` clients still required 47.446 seconds to become ready. That tail is the same operational class as the prior 28–69 second behavior even though it succeeded, and five observations cannot establish a failure rate. Network distance is therefore a **proven material contributor**, while Atlas M0/shared-tier or transient DNS/TLS/server-selection variability remains a **strongly supported remaining cause**. The hypothesis that distance alone explains the cold failure class is **rejected by evidence**.

- **Production region recommendation:** do not change Production yet. Repeat the exact `bom1` Preview cold-client protocol across enough independently observed instances to characterize p95/failure rate, and correlate any >5-second establishment with Atlas events. If the tail is acceptably bounded and the warm gains repeat, propose a separately authorized Production region rollout with rollback to `iad1`.
- **Pool:** no `maxPoolSize` change. The extreme delay occurred before a usable client existed, the warm burst had negligible checkout, and observed pools remained at 17 connections or fewer. Pool sizing is not the demonstrated remedy.
- **Cache:** no cross-instance single-flight. M64 did not establish invalidation-safe coordination, and cache behavior cannot repair pre-client connection readiness.
- **Database:** **KEEP MONGODB.** Same-database query work improved dramatically with topology; no data-model or Mongo query-engine limitation opened the PostgreSQL gate.
- **Application reliability:** the known HTTP-200 error-boundary/process-exit defect was not reproduced in `bom1`, but remains unfixed and release-relevant because the experiment was intentionally infrastructure-only.

### Verification, status, and next action

No application file, query, cache, pool, index, runtime, Atlas setting, fixture, production configuration, production deployment, or production data changed. `npm run lint`, `npm run typecheck`, 750/750 tests across 104 files, `npm run build`, `npm run perf:regression`, and `git diff --check` pass. The isolated three-sample regression maxima remain 21 homepage, 13 Work detail, 28 health, 39 editor, and 47 dashboard, all below unchanged 40/13/45/56/64 limits with stable shapes. The Blueprint editor remains 347 kB First Load JS.

**M64 status: complete; release classification: BLOCKED.** The one authorized region experiment succeeded as a performance signal but retained a 47.446-second cold-readiness outlier. Production must not be moved on five cold observations, and the known connection-failure/error-status behavior remains unresolved. The single next action is a narrowly scoped `bom1` cold-reliability validation that gathers enough independently observed client establishments—without changing application, pool, database, cache, or Production—to decide whether the tail is shared-tier/transient behavior or a region-independent reliability defect.

## M65 — BOM1 cold connection tail characterization

### Objective, environment, and methodology

M65 was measurement-only. It reused Preview deployment `dpl_BzFP7cUGgQFwNsMv3afJG9gXXQcZ` at `https://hubzero-h6o93ahwz-rifaques-projects.vercel.app`, with every Function in `bom1`, Node.js 22.x, Fluid Compute, the unchanged M32 source snapshot, the database-scoped credential, `hubzero_perf_m32`, the existing 185 deterministic fixtures, and the ordinary Member session. The deterministic fixture signature rendered before sampling. Production, `hubzero-prod`, the Mongo pool, Atlas tier/region, indexes, cache behavior, application code, fixtures, and deployment configuration were not changed.

Fluid Compute does not expose a command that deterministically creates an independent process. Consequently, a cold sample was accepted only when structured telemetry reported a previously unseen runtime instance and a new `mongo.connection` establishment event. M65 obtained six new clients and combined them with the five identically instrumented M64 clients, meeting the minimum target with 11 independent clients. Sampling stopped because the tail had reproduced in a correlated three-client incident window; forcing additional instances would have required a new deployment or unnecessary M0 load. Percentiles use nearest-rank order statistics.

### Independent cold-client results

| Sample | Instance | Initialization (UTC) | Establishment | Checkout | First command | Total | Result | Classification |
| ---: | --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| 1 | `072f658d` | 2026-08-09 16:26:35.800 | 0.152 s | not retained | not retained | not attributable | success | normal |
| 2 | `e88bc91f` | 2026-08-09 16:26:36.795 | 0.259 s | not retained | not retained | not attributable | success | normal |
| 3 | `f7c73a4d` | 2026-08-09 16:27:26.874 | 47.446 s | not retained | not retained | not attributable | success | extreme |
| 4 | `664cf51f` | 2026-08-09 16:27:28.923 | 0.513 s | not retained | not retained | not attributable | success | normal |
| 5 | `d423353a` | 2026-08-09 16:27:32.995 | 0.886 s | not retained | not retained | not attributable | success | normal |
| 6 | `f0eaf455` | 2026-08-09 19:26:03.435 | 0.306 s | 0.285 s summed; 0.069 s max | first-command start +0.242 s; individual duration unavailable | 0.363 s measured segment | success | normal |
| 7 | `3c19dcce` | 2026-08-09 19:27:24.811 | 77.846 s | 0.008 s | first-command start +0.191 s; individual duration unavailable | 0.236 s first attributable segment | success | extreme |
| 8 | `4571a937` | 2026-08-09 19:27:26.643 | 79.556 s | initiating request unavailable | initiating request unavailable | not attributable | success | extreme |
| 9 | `9c51ee3a` | 2026-08-09 19:27:26.743 | 79.765 s | initiating request unavailable | initiating request unavailable | not attributable | success | extreme |
| 10 | `4b651749` | 2026-08-09 19:27:26.765 | 0.692 s | initiating request unavailable | initiating request unavailable | not attributable | success | normal |
| 11 | `f221b062` | 2026-08-09 19:29:44.683 | 0.417 s | 0.007 s | first-command start +0.103 s; individual duration unavailable | 0.153 s measured segment | success | normal |

The combined distribution is **0.692 s p50, 77.846 s p75, and 79.765 s p95**. Seven clients were normal (`<1 s`), none was slow (`1–5 s`), four were extreme (`>5 s`), and none failed. These thresholds are investigative labels, not SLOs. The four extreme clients represent only two temporal incident windows: the M64 singleton and a new three-client group whose attempts began within about two seconds and completed together. Treating the four as four independent infrastructure incidents would overstate the evidence.

No `mongo.failure`, error-level request, connection error, or process exit was observed in M65. The instrumentation records the first command's start offset and summed command duration, not an individual first-command duration; unavailable values are deliberately not inferred.

### Atlas and Vercel correlation

The new extreme group is **Vercel/runtime-correlated** in the limited observational sense that all three events belonged to new Fluid Compute instances initialized in the same two-second window. Their later warm requests were healthy. This does not establish that Fluid Compute caused the delay.

Atlas did not provide a valid correlated metric window. The cluster card initially showed a lagging `0/500` point despite successful application traffic, Activity Feed returned an event-metadata loading error, and the authenticated Atlas session then expired. Consequently M65 has no defensible start/peak/end count, connection-rate point, member-state, election, restart, alert, CPU, or network observation for 19:26:03–19:28:47 UTC. The public Atlas status feed is neither cluster-specific nor sufficiently current to fill that gap. Therefore no extreme sample can be classified as Atlas-correlated or Atlas-uncorrelated. Production and Preview also share the cluster, so even a cluster-wide count would not provide per-client attribution.

The exact-cause classification is **E — Inconclusive**. The tail itself is proven reproducible and isolated to cold client establishment/readiness. New-instance correlation is strongly supported. Transient network/DNS/TLS path behavior, Atlas shared-tier lifecycle behavior, or a mixed event remain plausible; the missing Atlas window prevents choosing among them.

### Warm comparison and controlled burst

Twenty sequential authenticated Work requests ran from approximately 19:29:40–19:29:51 UTC across six already usable instances. Browser wall time was 0.382/0.566/0.758 s p50/p75/p95 (0.232–0.764 s). Each request retained exactly two Mongo operations. Client acquisition was 0.1/0.1/0.2 ms p50/p75/p95, with one 193 ms maximum on the newly established `f221b062`; summed checkout was 2/2/2 ms, summed Mongo command duration 12/13/23 ms, and the measured server segment 9.5/12.5/27.2 ms. There were no failures, and the largest observed pool had six connections.

The single authorized five-request Work burst ran at approximately 19:31:27–19:31:29 UTC. It reused four instances, created no client, retained two operations per request, and completed with 0–18 ms summed checkout, 9–112 ms summed command duration, 6.5–58.6 ms server segments, zero failures, and no pool growth beyond six observed connections. Browser wall time ranged from 0.776 to 1.237 seconds. This small burst shows healthy warm capacity; it does not characterize cold failure probability.

### Decisions and remaining uncertainty

- **Region:** do not move Production. The M64 central-latency improvement remains valid, but M65 reproduced a worse 77.8–79.8 second `bom1` incident. The cold tail is not acceptably characterized until the incident window can be correlated with Atlas member and connection metrics.
- **Pool — KEEP CURRENT CONFIGURATION.** Extreme delays occurred before a usable client existed; warm checkout was negligible, the burst did not expand pools, and M65 observed at most six connections in a pool. No evidence implicates the 100-connection cap.
- **Cache:** no change and no cross-instance single-flight. Cache-fill amplification may multiply work after several instances become ready, but it cannot explain the pre-client establishment delay measured here, and no invalidation-safe coordination design was added.
- **Database:** **KEEP MONGODB.** Warm command execution and M32 operation shapes remain healthy. M65 demonstrates an infrastructure-readiness tail, not a data-model or query-engine limitation.
- **Bugs:** the cold-readiness reliability defect was reproduced as three simultaneous 77.8–79.8 second successful establishments. It was not fixed because M65 prohibited application and infrastructure changes. Atlas Activity Feed/session availability blocked correlation but is not classified as a HubZero application defect.

### Verification, status, and next action

No application or infrastructure setting changed; M65 changes only the two canonical documentation records. `npm run lint`, `npm run typecheck`, 750/750 tests across 104 files, and `git diff --check` pass. A local `npm run build` and `npm run perf:regression` rerun was stopped at the safety gate: the workstation `.env.local` selects database `hubzero`, while Vercel CLI returned an empty Preview `MONGODB_URI` outside the linked working directory, so neither command was allowed to connect under an unverified target. M64 remains the latest same-tree passing build/regression run at 21 homepage, 13 Work detail, 28 health, 39 editor, and 47 dashboard operations. Since M65 made no application, fixture, dependency, or harness change, this is a verification-access limitation rather than evidence of a regression.

**M65 status: complete for tail reproduction, incomplete for attribution; release classification: BLOCKED.** The single next action is to restore authorized read-only Atlas metrics and inspect the exact 2026-08-09 19:26:03–19:28:47 UTC window for member lifecycle, connection-rate, capacity, and network events before authorizing any Production-region experiment.

## Final performance decision — 2026-08-10

### Exact M65 Atlas correlation

The authenticated Atlas Metrics view retained the exact M65 window at one-minute granularity: 2026-08-09 18:57–19:57 UTC. The three extreme `bom1` clients began establishing at approximately 19:26 UTC and emitted successful connection events at 19:27:24–19:27:27 UTC after 77.846–79.765 seconds.

Atlas provides the following directly correlated evidence:

- Project Activity Feed contains no alert, election, primary change, member restart, replica-set reconfiguration, cluster update, or other lifecycle event during 19:26:03–19:28:47 UTC. The nearest preceding cluster event was an update completed at 16:36 IST on August 9, more than eight hours before the incident after timezone conversion.
- Connections increased during the incident but remained small relative to the 500-per-member alert denominator used by Atlas. The primary rose through approximately 22 connections and briefly plateaued around 41 (about 8.2%); each secondary peaked around seven. This was not saturation. Per-member values are not presented as an exact cluster-wide client count because driver monitoring connections span members.
- Connection Rate rose as the delayed clients became ready: the primary peaked around 0.32 connections/second and the secondaries remained below approximately 0.1/second. This is compatible with several new Fluid Compute pools completing discovery together; it does not show queue or capacity exhaustion.
- Network and operation activity rose at the same time as connection completion. Atlas recorded no Operation Throttling on any member throughout the displayed hour.
- One other new `bom1` client in the same temporal window established normally in 0.692 seconds. A cluster-wide outage would not fit that observation well.
- M0 does not expose the dedicated-tier CPU, queue, memory, or detailed execution charts needed to exclude every form of shared-tier variability. Atlas metrics are cluster-wide because Production and Preview share the cluster, so individual lines cannot be attributed exclusively to the Preview.

The connection rise is best interpreted as an effect of the delayed instances finally completing topology discovery and opening their small pools, not as evidence that connection count caused the delay. Temporal alignment alone does not prove the lower-level fault.

### Root-cause and infrastructure decisions

**Tail classification: MIXED — Vercel cold-instance behavior plus the Vercel-to-Atlas DNS/TLS/network path.** This classification is supported by two independent results: M64 proved that moving execution from `iad1` to `bom1` materially improves central connection and application latency, while M65's extreme group occurred only on newly initialized Fluid Compute instances without an Atlas lifecycle, saturation, or throttling event. The evidence cannot distinguish a Vercel runtime socket/DNS condition from transient path-level TLS behavior, so neither component is claimed as the sole cause. Atlas M0 capacity saturation is rejected for this specific incident; all possible shared-tier variability is not observable enough to reject absolutely.

- **Region:** prefer `bom1` over `iad1` for any future Production rollout because matched warm Studio and p50/p75 cold results improved materially. Do not change Production yet: proximity did not eliminate the release-blocking tail, and a region move alone is not a reliability fix.
- **Pool:** keep `maxPoolSize` unchanged. Extreme latency preceded usable pool creation, directly observed pools were small, warm checkout was healthy, and Atlas stayed far below its limit in this window. Reducing or increasing the cap would target the wrong phase.
- **Cache:** preserve current cache and invalidation semantics. Cross-instance discovery/cache-fill amplification remains real, but it happens after or alongside connection readiness and cannot repair a stalled handshake. Invalidation-safe cross-instance single-flight is still unproven.
- **Database:** **KEEP MONGODB.** M32 eliminated query amplification, warm Mongo execution is healthy, and the incident does not demonstrate a MongoDB data-model or query-engine constraint. PostgreSQL/Supabase investigation remains unjustified.

### HTTP-200 failure masking review

No code change was made. Next.js App Router documentation explicitly states that a streamed response remains HTTP 200 after headers have been sent, even when the streamed content later communicates an error. HubZero's `error.tsx` files are client error-boundary fallbacks and cannot retroactively replace that status. Changing their rendering would alter neither the transport contract nor process termination. Catching every page-level database exception would also risk swallowing Next.js control-flow errors and duplicating error handling across routes.

A correct fix requires one deliberately tested reliability contract before streaming—for example, a database-readiness endpoint that returns 503 for monitoring and/or a bounded pre-stream readiness gate—plus preview fault-injection proving that Studio remains recoverable and no editorial action is silently acknowledged. That is small in product scope but not safe to improvise inside a final validation pass. Existing structured `mongo.failure`, request, route, and instance telemetry remains the authoritative operational signal; HTTP status alone must not be treated as success.

### Final verification and release decision

Fresh `npm run lint`, `npm run typecheck`, and all 750 tests across 104 files pass. `git diff --check` and targeted documentation formatting pass. A fresh local build and performance regression were not run because the workstation `.env.local` selects an unapproved database and Vercel CLI did not expose the sensitive isolated Preview value to `env run`; an attempted process-memory-only pull was blocked before a credential was written or command executed. M64 remains the latest unchanged-application-tree passing `npm run build` and `npm run perf:regression`, with maxima of 21 homepage, 13 Work detail, 28 health, 39 editor, and 47 dashboard operations. M65 and this decision changed documentation only, so no application or harness delta exists, but the missing fresh safe-environment run remains explicitly disclosed.

The evidence is sufficient to finish the investigation, but not to release the software. The single remaining release blocker is the unresolved cold MongoDB readiness/failure contract: the isolated M32 tree has produced a 69.4-second `MongoServerSelectionError` with process exit and HTTP-200 masking, a 47.446-second successful `bom1` establishment, and three simultaneous 77.8–79.8-second successful establishments. This is materially unreliable even though warm behavior is fast.

No package version, changelog, commit, tag, branch, Production deployment, environment variable, region, pool, cache, Atlas setting, or production data was changed.

# v3.2.0 Final Verdict

## READY FOR RC

M32 query amplification remains solved, warm Studio behavior is substantially faster in `bom1`, and the exact Atlas window rejects lifecycle events, connection saturation, and operation throttling as the cause of M65's extreme group. The remaining infrastructure condition is a mixed Vercel cold-instance/network-readiness tail, not unresolved query work. The release-tree reliability contract described below bounds that condition's application impact without claiming to eliminate the underlying network variability.

# MongoDB Architecture Decision

## KEEP MONGODB

MongoDB query execution and data modeling are not demonstrated v3.2 bottlenecks. Keep the existing architecture. Re-open the database gate only if MongoDB remains a measured constraint after topology, capacity, and connection handling are correctly observed and tested, or if future requirements establish relational integrity or transaction needs that the current model cannot safely maintain.

## Final reliability fix and release gate

### Objective and baseline

The only implementation objective after M65 was to prevent the reproduced 47–80 second cold MongoDB readiness tail from remaining on an application request path and from being represented as a successful Studio HTTP 200 after streaming had begun. The root-cause classification remains **Mixed: Vercel cold-instance behavior plus DNS/TLS/network-path variability**. This change is failure containment, not a claim that the underlying infrastructure tail is solved.

Normal `bom1` cold clients in M64–M65 became ready in 0.152–0.886 seconds (seven observations); four extreme observations took 47.446–79.765 seconds. Warm client acquisition and command work were healthy, observed pools did not approach 100 connections, and Atlas showed no incident-correlated saturation, election, restart, or throttling. Those measurements support a five-second application readiness bound and continue to reject pool tuning, query changes, cache single-flight, and a database migration as remedies.

### Architecture and changes

`getMongoClient()` retains the existing process-global, race-safe promise. Initial `MongoClient.connect()` is now raced against one five-second readiness timer. On timeout or initialization rejection the client is closed, the rejected shared promise is cleared, and a later request can retry. Concurrent callers share the same in-flight attempt. Once ready, callers reuse the same promise; readiness performs no ping and adds no MongoDB command to warm requests. The Auth.js adapter receives `getMongoClient` as its supported client factory, preventing it from permanently retaining the first rejected promise.

Next.js 15 App Router streaming made a nested layout, `generateMetadata`, or `error.tsx` insufficient: those mechanisms can execute after response streaming has committed HTTP 200. HubZero therefore splits the public and Studio route groups into independent root layouts with shared document markup. The Studio root is dynamic and awaits MongoDB readiness before creating its first `<html>` element. A controlled fault injection against an unreachable Mongo endpoint returned HTTP 500 for `/studio/login`; readiness rejected at approximately five seconds, while the 9.6-second development response also contained first-compilation time. The first attempted metadata gate was rejected after it empirically returned HTTP 200 and was removed.

The authenticated `/api/studio/readiness` route provides a non-cacheable operational probe: 204 when ready and a detail-free 503 on readiness failure. Existing middleware protects it like every `/api/studio/**` route. No credential, URI, internal connection message, or document content is returned.

### Contract boundary

The pre-stream document contract applies to `/studio/**`, where the independent Studio root can safely gate all rendered Studio surfaces without changing their UI or data behavior. Database-backed API handlers inherit the bounded initialization and fail before their response body when readiness rejects; the explicit readiness handler maps that failure to 503.

A universal public-document 5xx guarantee is not technically honest without forcing every static, ISR, and cached public page through a dynamic MongoDB gate, which would regress the public cache architecture. Public routes retain their existing delivery and invalidation behavior. Their first Mongo connection is still bounded to five seconds, but if a public server component has already streamed bytes, Next.js cannot retroactively replace its status. No cosmetic error-boundary workaround was introduced.

### Tests and measured verification

Focused automated coverage verifies successful readiness without an extra command, timeout, direct initialization failure, retry after either failure, concurrent cold reuse, retry-safe Auth.js adapter wiring, a safe readiness 503, failure propagation before Studio root construction, and preservation of the editor subtree after readiness succeeds.

The release tree was validated through Preview-only deployment `dpl_8Cm8AX2tYrNoS4MbUARqs4qiQGgy` (`https://hubzero-g8o44sr3u-rifaques-projects.vercel.app`), whose Functions are in `bom1` and whose Preview-scoped credential selects the approved `hubzero_perf_m32` database. Its build command ran the exact `npm run perf:regression` command before `npm run build`. Regression maxima were 21 homepage, 13 Work detail, 28 Studio health, 39 Studio editor, and 47 dashboard operations. Shapes remained stable against the unchanged 40/13/45/56/64 budgets. The build passed and retained the approximately 347 kB Blueprint-editor First Load JS result. No Production deployment or configuration changed.

On the versioned local release tree, `npm ci`, `npm run lint`, `npm run typecheck`, all 757 tests across 107 files, `npm run build`, and `git diff --check` pass. `npm audit` reports the existing five moderate PostCSS-chain advisories whose complete automated remedy requires a breaking Next.js 16 upgrade; no force, dependency upgrade, or advisory-driven framework change was made.

### Decisions and remaining risk

- **Region:** prefer `bom1` over `iad1` for a future, separately authorized Production rollout because the one-variable A/B proved material central-latency improvement. No Production region or deployment changed in this release work.
- **Pool:** keep the driver default `maxPoolSize`. The failure precedes a usable pool and neither observed checkout nor pool occupancy demonstrates exhaustion.
- **Cache:** keep current request/data-cache and invalidation semantics. Cross-instance single-flight remains rejected because invalidation-safe coordination is unproven.
- **Database:** **KEEP MONGODB.** Warm query execution and the content model remain healthy; PostgreSQL/Supabase is not justified.
- **Residual risk:** the mixed cold-instance/network condition still exists. Instead of hanging for 77–80 seconds, a cold client that misses the readiness bound now fails at approximately five seconds and can retry on a later request. Production topology has not yet been moved or deployed.

### Final decision and exact next action

The bounded readiness behavior resolves the application-level release blocker while preserving M32 performance and cache correctness. With final clean-install, static, test, build, isolated regression, and Git gates passing, **v3.2.0 is READY FOR RC and release**. The exact post-release action is a separately authorized, monitored Production deployment and `bom1` rollout decision with rollback to `iad1`; this release process itself does not deploy Production.
