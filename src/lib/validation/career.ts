import { z } from 'zod';
import {
  careerEntryReferenceSchema,
  employmentTypeSchema,
  experienceLevelSchema,
  objectIdString,
  publishStatusSchema,
  slugSchema,
} from './shared';

/** One item per line in the editor — the plain-textarea equivalent of `RelationMultiSelect`'s checkboxes, for a free-text list rather than a relation (matches Blueprint's `features`). */
const lineListSchema = z.array(z.string().min(1)).default([]);

export const careerSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  status: publishStatusSchema.default('draft'),
  location: z.string().min(1),
  employmentType: employmentTypeSchema,
  experienceLevel: experienceLevelSchema,
  summary: z.string().min(1),
  responsibilities: lineListSchema,
  requirements: lineListSchema,
  benefits: lineListSchema,
  compensation: z.string().optional(),
  applicationProcess: z.string().min(1),
  technologyIds: z.array(objectIdString).default([]),
  hiringManagerTeamId: objectIdString.optional(),
  relatedEntries: z.array(careerEntryReferenceSchema).default([]),
});

export type CareerInput = z.infer<typeof careerSchema>;
