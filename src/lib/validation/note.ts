import { z } from 'zod';
import {
  featuredOrderSchema,
  entryReferenceSchema,
  objectIdString,
  publishStatusSchema,
  reviewNoteSchema,
  slugSchema,
} from './shared';

/** PLANNING.md §26.5. Author is a User (system identity), not a Team public profile — see §24. */
export const noteSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  status: publishStatusSchema.default('draft'),
  reviewNote: reviewNoteSchema,
  authorId: objectIdString,
  summary: z.string().min(1),
  technologyIds: z.array(objectIdString).default([]),
  relatedEntries: z.array(entryReferenceSchema).default([]),
  publicationDate: z.coerce.date(),
  featuredOrder: featuredOrderSchema,
  heroImageId: objectIdString.optional(),
  galleryImageIds: z.array(objectIdString).default([]),
  contributors: z.array(objectIdString).default([]),
});

export type NoteInput = z.infer<typeof noteSchema>;
