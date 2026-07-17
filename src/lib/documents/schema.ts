import type { ObjectId } from 'mongodb';
import { z } from 'zod';
import { blockSchema, type Block } from './blocks';

/**
 * The Document Engine's ownership model (PLANNING.md §25). A Document is its
 * own top-level collection, not a bespoke field bolted onto each owning
 * collection entry — any current or future owner can hold zero or more
 * Documents, distinguished by `role`. Adding a new content type (an
 * Engineering Profile, a changelog) is a new `role` value here, never a
 * schema change to an existing collection.
 *
 * Extend this union as new owners are introduced — it is intentionally not
 * left open-ended, since every owner must also know how to authorize and
 * render the Documents it holds.
 */
export const ownerTypeSchema = z.enum([
  'Work',
  'Build',
  'Blueprint',
  'Lab',
  'Note',
  'Team',
  'EngineeringProfile',
]);
export type OwnerType = z.infer<typeof ownerTypeSchema>;

/**
 * `overview`/`engineeringJournal`/`findings`/`researchNotes` are Labs'
 * document roles (PLANNING.md §26.4's `journal` role split into the richer
 * set Phase 10 actually calls for — an engineering notebook accumulates more
 * than one kind of long-form content). `journal` itself is kept as a
 * general-purpose role for a future owner that just needs one running log.
 */
export const documentRoleSchema = z.enum([
  'caseStudy',
  'technical',
  'journal',
  'profile',
  'body',
  'overview',
  'engineeringJournal',
  'findings',
  'researchNotes',
  'introduction',
  'interview',
  'timeline',
  'quotes',
  'achievements',
]);
export type DocumentRole = z.infer<typeof documentRoleSchema>;

/**
 * Validated on both write and read. A Document deliberately carries no
 * independent `status` field — visibility is governed entirely by the
 * owning entry's publishing status (§28), so "is this published" stays a
 * single-source-of-truth question.
 */
export const documentSchema = z.object({
  ownerType: ownerTypeSchema,
  ownerId: z.string().min(1),
  role: documentRoleSchema,
  blocks: z.array(blockSchema),
});

export type DocumentInput = z.infer<typeof documentSchema>;

/** The shape of a Document once persisted in and read back from MongoDB. */
export interface DocumentRecord {
  _id: ObjectId;
  ownerType: OwnerType;
  ownerId: ObjectId;
  role: DocumentRole;
  blocks: Block[];
  createdAt: Date;
  updatedAt: Date;
}
