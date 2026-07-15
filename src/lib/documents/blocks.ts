import { z } from 'zod';

/**
 * The Document Engine's block catalog (PLANNING.md §25). Every long-form
 * content body in the Studio — case studies, technical docs, Lab journals,
 * Notes — is an ordered array of these blocks, never arbitrary HTML or
 * Markdown as a final output. This is also the exact contract AI generation
 * must produce output against (§31): one content shape for the whole system.
 *
 * Adding a new block type means adding a schema here and a corresponding
 * `BlockRenderer` case later — never a storage or editor redesign.
 */

const blockBase = {
  id: z.string().min(1),
};

/**
 * `z.string().url()` alone accepts any well-formed URL, including
 * `javascript:`/`data:` schemes — those pass validation, get stored, and
 * BlockRenderer renders them as a real `href`/`src` with no further check.
 * Every block field that becomes a clickable link or embed src goes through
 * this instead, restricted to the schemes those contexts actually need.
 */
const safeUrlSchema = z
  .string()
  .url()
  .refine(
    (value) => {
      try {
        return ['http:', 'https:'].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    },
    { message: 'URL must start with http:// or https://.' },
  );

export const headingBlockSchema = z.object({
  ...blockBase,
  type: z.literal('heading'),
  data: z.object({
    level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
    text: z.string().min(1),
  }),
});

export const paragraphBlockSchema = z.object({
  ...blockBase,
  type: z.literal('paragraph'),
  data: z.object({ text: z.string() }),
});

export const markdownBlockSchema = z.object({
  ...blockBase,
  type: z.literal('markdown'),
  data: z.object({ markdown: z.string() }),
});

export const richTextBlockSchema = z.object({
  ...blockBase,
  type: z.literal('richText'),
  data: z.object({ html: z.string() }),
});

export const quoteBlockSchema = z.object({
  ...blockBase,
  type: z.literal('quote'),
  data: z.object({
    text: z.string().min(1),
    attribution: z.string().optional(),
  }),
});

export const codeBlockSchema = z.object({
  ...blockBase,
  type: z.literal('code'),
  data: z.object({
    language: z.string().min(1),
    code: z.string(),
  }),
});

export const imageBlockSchema = z.object({
  ...blockBase,
  type: z.literal('image'),
  data: z.object({
    mediaId: z.string().min(1),
    url: safeUrlSchema,
    altText: z.string().min(1),
    caption: z.string().optional(),
    // Carried over from the selected Media Library asset (`types/studio.ts`'s
    // `MediaAsset.width`/`height`) so `BlockRenderer` can use `next/image`'s
    // real optimization pipeline instead of a raw `<img>` — optional because
    // documents authored before the Media Library existed only ever stored a
    // bare URL with no known dimensions.
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  }),
});

export const imageGalleryBlockSchema = z.object({
  ...blockBase,
  type: z.literal('imageGallery'),
  data: z.object({
    images: z
      .array(
        z.object({
          mediaId: z.string().min(1),
          url: safeUrlSchema,
          altText: z.string().min(1),
          width: z.number().positive().optional(),
          height: z.number().positive().optional(),
        }),
      )
      .min(1),
  }),
});

export const videoEmbedBlockSchema = z.object({
  ...blockBase,
  type: z.literal('videoEmbed'),
  data: z.object({
    url: safeUrlSchema,
    caption: z.string().optional(),
  }),
});

export const dividerBlockSchema = z.object({
  ...blockBase,
  type: z.literal('divider'),
  data: z.object({}),
});

export const calloutBlockSchema = z.object({
  ...blockBase,
  type: z.literal('callout'),
  data: z.object({
    text: z.string().min(1),
    tone: z.enum(['neutral', 'warning', 'success']).default('neutral'),
  }),
});

export const tableBlockSchema = z.object({
  ...blockBase,
  type: z.literal('table'),
  data: z.object({
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
  }),
});

export const orderedListBlockSchema = z.object({
  ...blockBase,
  type: z.literal('orderedList'),
  data: z.object({ items: z.array(z.string().min(1)).min(1) }),
});

export const unorderedListBlockSchema = z.object({
  ...blockBase,
  type: z.literal('unorderedList'),
  data: z.object({ items: z.array(z.string().min(1)).min(1) }),
});

export const checklistBlockSchema = z.object({
  ...blockBase,
  type: z.literal('checklist'),
  data: z.object({
    items: z
      .array(
        z.object({
          text: z.string().min(1),
          checked: z.boolean(),
        }),
      )
      .min(1),
  }),
});

export const fileAttachmentBlockSchema = z.object({
  ...blockBase,
  type: z.literal('fileAttachment'),
  data: z.object({
    url: safeUrlSchema,
    fileName: z.string().min(1),
    fileSizeBytes: z.number().nonnegative().optional(),
  }),
});

export const metricsBlockSchema = z.object({
  ...blockBase,
  type: z.literal('metrics'),
  data: z.object({
    // `source` is required deliberately — PLANNING.md §2/§25: metrics must be
    // real and sourced, never fabricated.
    metrics: z
      .array(
        z.object({
          label: z.string().min(1),
          value: z.string().min(1),
          source: z.string().min(1),
        }),
      )
      .min(1),
  }),
});

export const timelineBlockSchema = z.object({
  ...blockBase,
  type: z.literal('timeline'),
  data: z.object({
    events: z
      .array(
        z.object({
          date: z.string().min(1),
          title: z.string().min(1),
          description: z.string().optional(),
        }),
      )
      .min(1),
  }),
});

export const technologyStackBlockSchema = z.object({
  ...blockBase,
  type: z.literal('technologyStack'),
  data: z.object({
    // References into the shared Taxonomy collection (PLANNING.md §26.11),
    // never a free-text tech list.
    technologyIds: z.array(z.string().min(1)).min(1),
  }),
});

export const linksBlockSchema = z.object({
  ...blockBase,
  type: z.literal('links'),
  data: z.object({
    links: z
      .array(
        z.object({
          label: z.string().min(1),
          url: safeUrlSchema,
        }),
      )
      .min(1),
  }),
});

export const referencesBlockSchema = z.object({
  ...blockBase,
  type: z.literal('references'),
  data: z.object({
    citations: z
      .array(
        z.object({
          label: z.string().min(1),
          url: safeUrlSchema.optional(),
        }),
      )
      .min(1),
  }),
});

export const blockSchema = z.discriminatedUnion('type', [
  headingBlockSchema,
  paragraphBlockSchema,
  markdownBlockSchema,
  richTextBlockSchema,
  quoteBlockSchema,
  codeBlockSchema,
  imageBlockSchema,
  imageGalleryBlockSchema,
  videoEmbedBlockSchema,
  dividerBlockSchema,
  calloutBlockSchema,
  tableBlockSchema,
  orderedListBlockSchema,
  unorderedListBlockSchema,
  checklistBlockSchema,
  fileAttachmentBlockSchema,
  metricsBlockSchema,
  timelineBlockSchema,
  technologyStackBlockSchema,
  linksBlockSchema,
  referencesBlockSchema,
]);

export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block['type'];
