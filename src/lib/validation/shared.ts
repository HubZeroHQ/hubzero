import { z } from 'zod';

/**
 * Primitives shared by every collection's validation schema (PLANNING.md
 * §26). Relationship fields validate as ObjectId hex strings here — the
 * shape a request body actually carries — and are converted to real
 * `ObjectId`s inside the DB access layer, never before.
 */

export const objectIdString = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid ObjectId');

export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a lowercase, hyphen-separated slug');

export const publishStatusSchema = z.enum([
  'draft',
  'inReview',
  'approved',
  'published',
  'archived',
]);
export const servicePublishStatusSchema = z.enum(['draft', 'published']);
export const userRoleSchema = z.enum(['headAdmin', 'admin', 'teamMember']);
export const taxonomyKindSchema = z.enum(['technology', 'category', 'topic']);
export const leadStatusSchema = z.enum(['new', 'contacted', 'closed']);
export const labStageSchema = z.enum(['exploring', 'building', 'testing']);
export const buildDeploymentStateSchema = z.enum(['live', 'retired']);
export const evidenceOwnerTypeSchema = z.enum(['Work', 'Build', 'Blueprint', 'Lab']);

/** A reference into a Work/Build/Blueprint/Lab entry (§13, §24). */
export const entryReferenceSchema = z.object({
  ownerType: evidenceOwnerTypeSchema,
  ownerId: objectIdString,
});
