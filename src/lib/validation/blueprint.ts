import { z } from 'zod';
import { objectIdString, publishStatusSchema, slugSchema } from './shared';

/**
 * PLANNING.md §26.3. `name` is validated against the mandatory
 * `Blueprint-X-Y` convention (AGENTS.md, §11) here at write time; the
 * branded `Blueprint-${string}-${string}` type is asserted once validation
 * passes, in the repository layer — a plain regex can't express two
 * independently-open segments as a template literal type on its own.
 */
const blueprintNamePattern = /^Blueprint-[A-Za-z0-9]+-[A-Za-z0-9]+$/;

export const blueprintSchema = z.object({
  name: z.string().regex(blueprintNamePattern, 'Must follow the Blueprint-X-Y naming convention'),
  slug: slugSchema,
  status: publishStatusSchema.default('draft'),
  architecture: z.string().min(1),
  designLanguage: z.string().min(1),
  description: z.string().min(1),
  features: z.array(z.string().min(1)).default([]),
  technologyIds: z.array(objectIdString).default([]),
  liveDeploymentUrl: z.string().url(),
  previewAssetIds: z.array(objectIdString).default([]),
});

export type BlueprintInput = z.infer<typeof blueprintSchema>;
