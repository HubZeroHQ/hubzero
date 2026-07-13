import { REFERENCE_ID_PREFIXES } from '@/config/reference-ids';
import { noteSchema, type NoteInput } from '@/lib/validation/note';
import type { Note } from '@/types/cms';
import { collections } from '../collections';
import { createRepository } from '../repository';

const base = createRepository<Note, NoteInput>(collections.notes, {
  referenceIdPrefix: REFERENCE_ID_PREFIXES.notes,
});

export const noteRepository = {
  findById: base.findById,
  list: base.list,
  remove: base.remove,
  findBySlug: async (slug: string) => (await collections.notes()).findOne({ slug }),
  create: (input: NoteInput, createdByUserId: string) =>
    base.create(noteSchema.parse(input), { createdByUserId }),
  update: (id: string, input: Partial<NoteInput>) =>
    base.update(id, noteSchema.partial().parse(input)),
};
