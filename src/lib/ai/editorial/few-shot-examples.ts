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
is reserved for one genuinely important caveat, not decoration.`;
