import { z } from 'zod';
import { blockSchema } from '@/lib/documents/blocks';
import { BLOCK_ONLY_INSTRUCTIONS, TRANSFORM_INSTRUCTIONS } from './types';

const shortText = z.string().trim().min(1).max(500);
const contextText = z.string().max(10_000);
const blockTypeSchema = z.enum([
  'heading',
  'paragraph',
  'markdown',
  'richText',
  'quote',
  'code',
  'image',
  'imageGallery',
  'videoEmbed',
  'divider',
  'callout',
  'table',
  'orderedList',
  'unorderedList',
  'checklist',
  'fileAttachment',
  'metrics',
  'timeline',
  'technologyStack',
  'links',
  'references',
]);

const outlineSchema = z
  .array(
    z
      .object({
        level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
        text: z.string().trim().min(1).max(300),
      })
      .strict(),
  )
  .max(100)
  .optional();

const adjacentSummarySchema = z
  .object({
    type: blockTypeSchema,
    text: z.string().max(5_000),
  })
  .strict();

const adjacentSchema = z
  .object({
    previous: adjacentSummarySchema.optional(),
    next: adjacentSummarySchema.optional(),
  })
  .strict()
  .optional();

const editorialOptionsShape = {
  purpose: z.string().max(2_000).optional(),
  audience: z.string().max(1_000).optional(),
  technicalDepth: z.enum(['introductory', 'practitioner', 'expert']).optional(),
  length: z.enum(['brief', 'standard', 'in-depth']).optional(),
  tone: z.enum(['neutral', 'narrative', 'direct', 'analytical']).optional(),
  writingStyle: z.string().max(2_000).optional(),
  additionalInstructions: z.string().max(4_000).optional(),
};

export const ownerIdSchema = z.string().trim().min(1).max(200);

export const generateDocumentInputSchema = z
  .object({
    ...editorialOptionsShape,
    contentType: shortText,
    freeformText: contextText.optional(),
    extractedDocumentText: z.array(z.string().max(20_100)).max(4).optional(),
    images: z
      .array(
        z
          .object({
            mediaId: z.string().trim().min(1).max(200),
            url: z.string().max(2_000),
            description: z.string().max(2_000).optional(),
          })
          .strict(),
      )
      .max(4),
    outline: outlineSchema,
  })
  .strict()
  .refine(
    (value) =>
      (value.extractedDocumentText ?? []).reduce((sum, text) => sum + text.length, 0) <= 60_000,
    { message: 'Supplied reference text is too large.' },
  );

export const generateBlockInputSchema = z
  .object({
    ...editorialOptionsShape,
    instruction: z.string().trim().min(1).max(4_000),
    suggestedBlockType: blockTypeSchema.optional(),
    adjacent: adjacentSchema,
    outline: outlineSchema,
  })
  .strict();

const boundedBlockSchema = blockSchema.refine((block) => JSON.stringify(block).length <= 30_000, {
  message: 'Block content is too large.',
});

export const transformBlockInputSchema = z
  .object({
    block: boundedBlockSchema,
    instruction: z.enum([...TRANSFORM_INSTRUCTIONS, ...BLOCK_ONLY_INSTRUCTIONS]),
    additionalInstructions: z.string().max(4_000).optional(),
    adjacent: adjacentSchema,
    outline: outlineSchema,
  })
  .strict();

export const transformSelectionInputSchema = z
  .object({
    selectedText: z.string().trim().min(1).max(20_000),
    instruction: z.enum(TRANSFORM_INSTRUCTIONS),
    targetLanguage: z.string().trim().min(1).max(100).optional(),
    surroundingText: z
      .object({
        before: contextText.optional(),
        after: contextText.optional(),
      })
      .strict()
      .optional(),
    outline: outlineSchema,
  })
  .strict()
  .superRefine((value, context) => {
    if (value.instruction === 'translate' && !value.targetLanguage) {
      context.addIssue({
        code: 'custom',
        path: ['targetLanguage'],
        message: 'A target language is required.',
      });
    }
  });
