import { z } from 'zod';
import { documentRoleSchema } from '@/lib/documents/schema';

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
export const userRoleSchema = z.enum(['headAdmin', 'admin', 'member']);
export const taxonomyKindSchema = z.enum(['technology', 'category', 'topic']);
export const leadStatusSchema = z.enum(['new', 'contacted', 'closed']);
export const labStageSchema = z.enum(['exploring', 'building', 'testing']);
export const buildDeploymentStateSchema = z.enum(['live', 'retired']);
export const evidenceOwnerTypeSchema = z.enum(['Work', 'Build', 'Blueprint', 'Lab']);
export const serviceEvidenceOwnerTypeSchema = z.enum(['Work', 'Build', 'Blueprint', 'Lab', 'Note']);

/** A reference into a Work/Build/Blueprint/Lab entry (§13, §24). */
export const entryReferenceSchema = z.object({
  ownerType: evidenceOwnerTypeSchema,
  ownerId: objectIdString,
});

export const serviceEvidenceReferenceSchema = z.object({
  ownerType: serviceEvidenceOwnerTypeSchema,
  ownerId: objectIdString,
});

/** One row of a Team member's public social links (§26.6 extension) — platform is free text, not an enum. */
export const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url(),
});

/**
 * A single entry in a collection entry's progress timeline (Phase 10's
 * "lightweight progress timeline," built generic enough for a future
 * collection to reuse rather than being modeled as Labs-specific
 * infrastructure). `relatedDocumentRole` optionally points at one of the
 * owning entry's own Documents (§25) — e.g. a milestone that names which
 * Engineering Journal entry backs it up — rather than a separate reference
 * scheme of its own.
 */
export const progressMilestoneSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
  summary: z.string().min(1),
  relatedDocumentRole: documentRoleSchema.optional(),
});

export type ProgressMilestoneInput = z.infer<typeof progressMilestoneSchema>;
