import { Type, type Schema } from '@google/genai';

/**
 * A hand-authored Gemini `responseSchema` (the OpenAPI-3.0 subset Gemini's
 * structured-output mode understands) mirroring `lib/documents/blocks.ts`'s
 * discriminated union. This exists purely as a *generation aid* — it
 * constrains the model's decoding toward valid shapes and meaningfully
 * reduces malformed output, but it is not the trust boundary. The real
 * `blockSchema.safeParse()` (`service.ts`) is what every result still has to
 * pass before it ever reaches the editor (§25, §31) — this schema being
 * slightly looser than `blockSchema` in places (e.g. it can't express
 * `blockSchema`'s `min(1)` string-non-empty constraints or its safe-URL
 * refinement) is fine precisely because that layer catches it.
 *
 * Kept independent from Zod deliberately: Gemini's schema dialect doesn't
 * support enough of Zod's feature surface to derive one from the other
 * mechanically without a fragile custom converter, and this schema changes
 * far less often than `blocks.ts`'s validation details do.
 */

const stringProp: Schema = { type: Type.STRING };
const optionalStringProp: Schema = { type: Type.STRING, nullable: true };
const numberProp: Schema = { type: Type.NUMBER };

/**
 * Gemini only treats `enum` as an actual constraint when `format: 'enum'` is
 * also set — undocumented in the TS types themselves, but explicit in the
 * API's own field description ("To mark a field as an enum, set `format` to
 * `enum` and provide the list of possible values in `enum`"). Every `enum`
 * usage in this file goes through this helper specifically so that
 * requirement can never be silently dropped again — an earlier version of
 * this schema set bare `enum` arrays with no `format`, which meant Gemini
 * was never actually constrained to emit a valid `type` discriminator, a
 * valid heading `level`, or a valid callout `tone`; the real
 * `blockSchema.safeParse()` gate in `service.ts` was silently absorbing the
 * resulting mismatches by dropping the block, most visibly heading blocks
 * losing their level.
 */
function enumSchema(type: Type, values: string[]): Schema {
  return { type, format: 'enum', enum: values };
}

function blockShape(
  type: string,
  dataProperties: Record<string, Schema>,
  required: string[] = [],
): Schema {
  return {
    type: Type.OBJECT,
    properties: {
      id: stringProp,
      type: enumSchema(Type.STRING, [type]),
      data: {
        type: Type.OBJECT,
        properties: dataProperties,
        required,
      },
    },
    required: ['id', 'type', 'data'],
  };
}

const BLOCK_SCHEMAS: Schema[] = [
  blockShape('heading', { level: enumSchema(Type.INTEGER, ['2', '3', '4']), text: stringProp }, [
    'level',
    'text',
  ]),
  blockShape('paragraph', { text: stringProp }, ['text']),
  blockShape('markdown', { markdown: stringProp }, ['markdown']),
  blockShape('richText', { html: stringProp }, ['html']),
  blockShape('quote', { text: stringProp, attribution: optionalStringProp }, ['text']),
  blockShape('code', { language: stringProp, code: stringProp }, ['language', 'code']),
  blockShape(
    'image',
    {
      mediaId: stringProp,
      url: stringProp,
      altText: stringProp,
      caption: optionalStringProp,
    },
    ['mediaId', 'url', 'altText'],
  ),
  blockShape(
    'imageGallery',
    {
      images: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { mediaId: stringProp, url: stringProp, altText: stringProp },
          required: ['mediaId', 'url', 'altText'],
        },
      },
    },
    ['images'],
  ),
  blockShape('videoEmbed', { url: stringProp, caption: optionalStringProp }, ['url']),
  blockShape('divider', {}),
  blockShape(
    'callout',
    { text: stringProp, tone: enumSchema(Type.STRING, ['neutral', 'warning', 'success']) },
    ['text', 'tone'],
  ),
  blockShape(
    'table',
    {
      headers: { type: Type.ARRAY, items: stringProp },
      rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: stringProp } },
    },
    ['headers', 'rows'],
  ),
  blockShape('orderedList', { items: { type: Type.ARRAY, items: stringProp } }, ['items']),
  blockShape('unorderedList', { items: { type: Type.ARRAY, items: stringProp } }, ['items']),
  blockShape(
    'checklist',
    {
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { text: stringProp, checked: { type: Type.BOOLEAN } },
          required: ['text', 'checked'],
        },
      },
    },
    ['items'],
  ),
  blockShape(
    'fileAttachment',
    { url: stringProp, fileName: stringProp, fileSizeBytes: numberProp },
    ['url', 'fileName'],
  ),
  blockShape(
    'metrics',
    {
      metrics: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { label: stringProp, value: stringProp, source: stringProp },
          required: ['label', 'value', 'source'],
        },
      },
    },
    ['metrics'],
  ),
  blockShape(
    'timeline',
    {
      events: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { date: stringProp, title: stringProp, description: optionalStringProp },
          required: ['date', 'title'],
        },
      },
    },
    ['events'],
  ),
  blockShape('technologyStack', { technologyIds: { type: Type.ARRAY, items: stringProp } }, [
    'technologyIds',
  ]),
  blockShape(
    'links',
    {
      links: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { label: stringProp, url: stringProp },
          required: ['label', 'url'],
        },
      },
    },
    ['links'],
  ),
  blockShape(
    'references',
    {
      citations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { label: stringProp, url: optionalStringProp },
          required: ['label'],
        },
      },
    },
    ['citations'],
  ),
];

/** The response schema for every action that resolves to blocks (`document`, `block`, `transform-block`). */
export const BLOCKS_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    blocks: { type: Type.ARRAY, items: { anyOf: BLOCK_SCHEMAS } },
    containsPlaceholders: { type: Type.BOOLEAN },
  },
  required: ['blocks', 'containsPlaceholders'],
};

/** The response schema for `transform-selection` — plain text, not a block. */
export const TEXT_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    text: stringProp,
  },
  required: ['text'],
};
