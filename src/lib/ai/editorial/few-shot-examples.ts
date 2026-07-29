/**
 * Short, originally-written illustrative examples — never copied from any
 * real publication — showing the master prompt's structural guidance
 * actually applied in the exact JSON shape a generation response must
 * match. Included only for whole-document generation (`prompt-builder.ts`),
 * where seeing a full worked structure is worth the extra tokens; a single
 * new or transformed block doesn't need one.
 *
 * These exist to demonstrate *pattern* (concrete-before-abstract, a named
 * tradeoff, a short paragraph, the JSON shape itself) — deliberately generic
 * placeholder content so nothing here could be mistaken for real HubZero
 * work if it ever leaked into an actual draft.
 */
export const FEW_SHOT_EXAMPLES = `## Worked example — structure and JSON shape
A short technical section demonstrating the expected rhythm and exact JSON shape
(not real content — illustrative only):

[
  { "id": "b1", "type": "heading", "data": { "level": 2, "text": "Why we moved the queue off a single node" } },
  { "id": "b2", "type": "paragraph", "data": { "text": "The original job queue ran on one process. It worked until throughput crossed roughly 400 jobs/minute, at which point retries began backing up faster than workers could drain them." } },
  { "id": "b3", "type": "paragraph", "data": { "text": "We considered adding more workers to the same process first — it required no architecture change. We ruled it out because the underlying queue had no partitioning: more workers meant more lock contention on the same table, not more throughput." } },
  { "id": "b4", "type": "code", "data": { "language": "ts", "code": "const queue = new PartitionedQueue({ partitions: 8, claimTimeoutMs: 30_000 });" } },
  { "id": "b5", "type": "paragraph", "data": { "text": "Partitioning by a hash of the job's tenant id removed the single lock entirely — each partition claims and processes independently." } },
  { "id": "b6", "type": "callout", "data": { "text": "Partitioning changes retry ordering guarantees within a tenant — worth checking before adopting this for anything that depends on strict FIFO.", "tone": "warning" } }
]

Notice: the problem is stated with a real number before any solution appears; an
alternative is named and explicitly ruled out with a reason; the code sample
follows the paragraph that motivates it rather than preceding it; and the callout
is reserved for one genuinely important caveat, not decoration.

## Worked example — case-study retrospective register
A second illustrative excerpt showing the retrospective voice a case study should
be written in when the supplied reference material is rich enough to support it
(again, generic placeholder content, not real HubZero work):

[
  { "id": "b1", "type": "heading", "data": { "level": 2, "text": "Why the catalog stayed static instead of a headless CMS" } },
  { "id": "b2", "type": "paragraph", "data": { "text": "The client's catalog held under 300 items with infrequent turnover. A headless commerce platform was the obvious default, but its recurring platform fee assumed a transaction volume this project never had." } },
  { "id": "b3", "type": "paragraph", "data": { "text": "We chose to keep product data in version-controlled content files instead, trading a self-serve admin panel for a lower operating cost. That tradeoff held through launch but became the project's largest ongoing maintenance cost once the client's update cadence increased — every price change needed a developer-assisted deploy." } },
  { "id": "b4", "type": "image", "data": { "mediaId": "m1", "url": "https://example.com/img.png", "altText": "Product detail page", "caption": "The product page reads directly from a build-time content file rather than an API call — the architectural choice that kept hosting cost near zero at this catalog size." } },
  { "id": "b5", "type": "callout", "data": { "text": "In retrospect, this is the clearest area a second iteration should change: even a minimal self-serve content layer would have avoided the maintenance dependency this decision created.", "tone": "warning" } }
]

Notice: the heading names a decision, not a feature; the tradeoff accepted and its
real downstream cost are both stated explicitly rather than implied; the image
caption explains the architectural choice the screenshot demonstrates instead of
describing what's visually on the page; and the closing callout states a specific,
honest lesson in the first person plural rather than a generic wrap-up sentence.`;
