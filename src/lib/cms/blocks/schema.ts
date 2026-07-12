import { z } from "zod";

/**
 * Runtime validation for `Block`/`SimpleBlock` (`types.ts`) — every narrative
 * collection's Zod schema composes `blocksField()` for its `content` field,
 * the same "MongoDB doesn't enforce this, Zod does" posture every other
 * reference/array field in this CMS already relies on.
 */

const idField = z.string().trim().min(1, "Missing block id.");
const objectIdPattern = /^[a-f0-9]{24}$/i;
const mediaIdField = z
  .string()
  .trim()
  .regex(objectIdPattern, "Choose an image from the media library.");

const headingBlockSchema = z.object({
  id: idField,
  type: z.literal("heading"),
  data: z.object({
    level: z.union([z.literal(2), z.literal(3)]),
    text: z.string().trim().min(1, "Add a heading.").max(200),
  }),
});

const paragraphBlockSchema = z.object({
  id: idField,
  type: z.literal("paragraph"),
  data: z.object({
    text: z.string().trim().min(1, "Add some text.").max(4000),
  }),
});

const imageBlockSchema = z.object({
  id: idField,
  type: z.literal("image"),
  data: z.object({
    media: mediaIdField,
    caption: z.string().trim().max(400).optional(),
    align: z.enum(["left", "center", "right"]),
    width: z.enum(["content", "wide", "full"]),
  }),
});

const galleryBlockSchema = z.object({
  id: idField,
  type: z.literal("gallery"),
  data: z.object({
    media: z.array(mediaIdField).min(1, "Add at least one image.").max(24),
    caption: z.string().trim().max(400).optional(),
    layout: z.enum(["grid", "masonry"]).optional(),
  }),
});

const quoteBlockSchema = z.object({
  id: idField,
  type: z.literal("quote"),
  data: z.object({
    text: z.string().trim().min(1, "Add the quote text.").max(2000),
    attribution: z.string().trim().max(160).optional(),
    role: z.string().trim().max(160).optional(),
  }),
});

const calloutBlockSchema = z.object({
  id: idField,
  type: z.literal("callout"),
  data: z.object({
    tone: z.enum(["note", "info", "success", "warning"]),
    title: z.string().trim().max(120).optional(),
    text: z.string().trim().min(1, "Add the callout text.").max(2000),
  }),
});

const codeBlockSchema = z.object({
  id: idField,
  type: z.literal("code"),
  data: z.object({
    code: z.string().max(20000),
    language: z.string().trim().max(40).optional(),
    filename: z.string().trim().max(160).optional(),
  }),
});

const dividerBlockSchema = z.object({
  id: idField,
  type: z.literal("divider"),
  data: z.object({}),
});

const metricsBlockSchema = z.object({
  id: idField,
  type: z.literal("metrics"),
  data: z.object({
    items: z
      .array(
        z.object({
          label: z.string().trim().min(1, "Required.").max(80),
          value: z.string().trim().min(1, "Required.").max(80),
          trend: z.enum(["up", "down", "flat"]).optional(),
        }),
      )
      .min(1, "Add at least one metric.")
      .max(12),
  }),
});

const timelineBlockSchema = z.object({
  id: idField,
  type: z.literal("timeline"),
  data: z.object({
    items: z
      .array(
        z.object({
          date: z.string().trim().min(1, "Required.").max(80),
          title: z.string().trim().min(1, "Required.").max(160),
          description: z.string().trim().max(600).optional(),
        }),
      )
      .min(1, "Add at least one entry.")
      .max(30),
  }),
});

const videoBlockSchema = z.object({
  id: idField,
  type: z.literal("video"),
  data: z.object({
    url: z.url("Enter a valid URL."),
    caption: z.string().trim().max(400).optional(),
  }),
});

const spacerBlockSchema = z.object({
  id: idField,
  type: z.literal("spacer"),
  data: z.object({
    size: z.enum(["sm", "md", "lg"]),
  }),
});

const markdownBlockSchema = z.object({
  id: idField,
  type: z.literal("markdown"),
  data: z.object({
    markdown: z.string().trim().min(1, "Add some markdown.").max(20000),
  }),
});

/** Admin-only in effect — enforced at publish time, not here (`blocks/guard.ts`'s header comment explains why). */
const htmlBlockSchema = z.object({
  id: idField,
  type: z.literal("html"),
  data: z.object({
    html: z.string().trim().min(1, "Add some HTML.").max(20000),
  }),
});

const tableBlockSchema = z.object({
  id: idField,
  type: z.literal("table"),
  data: z
    .object({
      headers: z.array(z.string().trim().max(120)).min(1, "Add at least one column.").max(12),
      rows: z
        .array(z.array(z.string().trim().max(300)).max(12))
        .min(1, "Add at least one row.")
        .max(100),
      caption: z.string().trim().max(400).optional(),
    })
    .refine((data) => data.rows.every((row) => row.length === data.headers.length), {
      message: "Every row must have the same number of cells as there are columns.",
      path: ["rows"],
    }),
});

/** Every block type a two-column layout's own columns may contain — `twoColumn` is deliberately excluded, so nesting can't happen (`types.ts`'s header comment). */
const simpleBlockSchema = z.discriminatedUnion("type", [
  headingBlockSchema,
  paragraphBlockSchema,
  imageBlockSchema,
  galleryBlockSchema,
  quoteBlockSchema,
  calloutBlockSchema,
  codeBlockSchema,
  dividerBlockSchema,
  metricsBlockSchema,
  timelineBlockSchema,
  videoBlockSchema,
  spacerBlockSchema,
  markdownBlockSchema,
  htmlBlockSchema,
  tableBlockSchema,
]);

const twoColumnBlockSchema = z.object({
  id: idField,
  type: z.literal("twoColumn"),
  data: z.object({
    left: z.array(simpleBlockSchema).max(20),
    right: z.array(simpleBlockSchema).max(20),
    ratio: z.enum(["50-50", "60-40", "40-60", "70-30", "30-70"]).optional(),
  }),
});

export const blockSchema = z.discriminatedUnion("type", [
  headingBlockSchema,
  paragraphBlockSchema,
  imageBlockSchema,
  galleryBlockSchema,
  quoteBlockSchema,
  calloutBlockSchema,
  codeBlockSchema,
  dividerBlockSchema,
  metricsBlockSchema,
  timelineBlockSchema,
  videoBlockSchema,
  spacerBlockSchema,
  twoColumnBlockSchema,
  markdownBlockSchema,
  htmlBlockSchema,
  tableBlockSchema,
]);

export const blocksArraySchema = z.array(blockSchema).min(1, "Add at least one block.").max(300);

/** Same shape, no minimum — for a `"blocks"` field that's legitimately allowed to be empty (e.g. a Site Settings legal page not yet authored), unlike every narrative collection's `content`, which always needs at least one block. */
export const optionalBlocksArraySchema = z.array(blockSchema).max(300).default([]);

function parseBlocksJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  if (value.trim() === "") return [];
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

/**
 * The wire-format adapter every collection's `content` field composes.
 * `CmsField`'s `"blocks"` case (`components/admin/blocks/block-editor.tsx`)
 * submits the whole tree as one hidden `<input>` carrying a JSON string —
 * the same "structured value, one native form field" approach `"json"`
 * already established for `TeamMember.skills`/`experience`/`education` — so
 * `crud-actions.ts`'s `rawFromFormData` needs no new case for `"blocks"` at
 * all, it already falls through to reading a single string value.
 */
export function blocksField() {
  return z.preprocess(parseBlocksJson, blocksArraySchema);
}

/** Same wire format as `blocksField()`, validated against `optionalBlocksArraySchema` instead. */
export function optionalBlocksField() {
  return z.preprocess(parseBlocksJson, optionalBlocksArraySchema);
}
