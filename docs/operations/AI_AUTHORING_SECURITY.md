# AI authoring production boundaries

## Trust boundaries and validation

Every value crossing an AI Server Action is untrusted, including owner IDs,
editor options, blocks, selections, outlines, adjacent content, uploaded-file
text, media descriptions, and client-supplied media URLs. The action factories
parse these values with the strict Zod schemas in `src/lib/ai/validation.ts`
before authorization, database lookup, prompt construction, or provider use.
Unknown fields, unsupported enum values, empty required values, and oversized
payloads are rejected with a generic author-facing error.

Uploaded files are authenticated, limited to 10 MB before buffering, checked
again by the extractor, restricted to the supported formats, and truncated to
20,000 extracted characters per file. Generation accepts at most four files
and 60,000 extracted characters in total. Reference-image URLs are never
trusted from the client: the server resolves each `mediaId` from the Media
collection and uses the stored URL.

Entry metadata and relationships are server-derived but may contain
user-authored content. Prompt construction therefore treats them as untrusted
too. All untrusted content is serialized as JSON in labeled `UNTRUSTED_DATA`
sections, while the system instruction explicitly states that embedded prompt
instructions must be ignored. This reduces instruction/data ambiguity; it is
not treated as a complete defense. Provider output must still pass the
Document Engine's block schema before the editor receives it.

## Provider and failure flow

The editor calls `generateWithProvider`, never a provider SDK. Providers
implement `ContentGenerationProvider`, return HubZero request/result types,
and translate native failures into the errors in `src/lib/ai/errors.ts`.
Gemini requests use `AI_PROVIDER_TIMEOUT_MS` (30 seconds by default, bounded
to 1-120 seconds) as both an SDK HTTP timeout and an abort deadline. Raw SDK
errors are not returned to the UI.

Malformed JSON, any invalid block, oversized or empty responses, timeouts, upstream failures,
and local rate-limit failures return an error result. Generated content is
only returned to the editor after validation and receives fresh block IDs.
These actions do not save documents, so a failed or partial provider response
cannot mutate or corrupt the persisted document.

To add a provider, implement `ContentGenerationProvider`, translate all native
errors at that boundary, and register it in `src/lib/ai/registry.ts`. Keep
prompt construction provider-neutral and retain service-layer result
validation.

## Rate limiting and known limitations

`AiRateLimiter` is the application boundary. The current
`InMemorySlidingWindowRateLimiter` allows eight provider calls per user per
minute and periodically removes expired buckets. It is suitable only for the
current single-process deployment.

The limit is neither shared across instances nor durable across restarts. A
multi-instance deployment must replace `aiRateLimiter` with a distributed
implementation (for example Redis or Upstash) that implements `consume`.
Server Actions and provider code do not need to change. Distributed quotas,
provider-side budget monitoring, and cross-region coordination are explicitly
deferred because this PR introduces no external infrastructure.
