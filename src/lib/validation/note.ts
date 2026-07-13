import { z } from 'zod';
import { entryReferenceSchema, objectIdString, publishStatusSchema, slugSchema } from './shared';

/** PLANNING.md §26.5. Author is a User (system identity), not a Team public profile — see §24. */
export const noteSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  status: publishStatusSchema.default('draft'),
  authorId: objectIdString,
  tagIds: z.array(objectIdString).default([]),
  relatedEntries: z.array(entryReferenceSchema).default([]),
});

export type NoteInput = z.infer<typeof noteSchema>;
