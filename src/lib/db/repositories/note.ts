import { REFERENCE_ID_PREFIXES } from '@/config/reference-ids';
import { noteSchema, type NoteInput } from '@/lib/validation/note';
import type { Note } from '@/types/studio';
import { collections } from '../collections';
import { createFeaturedOrdering } from '../featured-ordering';
import { createRepository, parsePartialInput } from '../repository';

const base = createRepository<Note, NoteInput>(collections.notes, {
  referenceIdPrefix: REFERENCE_ID_PREFIXES.notes,
});

const featured = createFeaturedOrdering<Note>(collections.notes);

export const noteRepository = {
  // Editorial ordering (v3.1 Milestone 2) — one shared implementation, not a per-collection copy.
  listFeatured: featured.listFeatured,
  setFeaturedOrder: featured.setFeaturedOrder,
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  findBySlug: async (slug: string) => (await collections.notes()).findOne({ slug }),
  create: (input: NoteInput, createdByUserId: string) =>
    base.create(noteSchema.parse(input), { createdByUserId }),
  update: (id: string, input: Partial<NoteInput>) =>
    base.update(id, parsePartialInput(noteSchema, input)),
};
