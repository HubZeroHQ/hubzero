import { z } from 'zod';
import { slugSchema, taxonomyKindSchema } from './shared';

/** PLANNING.md §26.11. */
export const taxonomyEntrySchema = z.object({
  kind: taxonomyKindSchema,
  label: z.string().min(1),
  slug: slugSchema,
});

export type TaxonomyEntryInput = z.infer<typeof taxonomyEntrySchema>;
