import { noteRepository } from '@/lib/db/repositories/note';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { createContentAdapter } from './content-adapter';

export const notesSearchAdapter = createContentAdapter({
  type: 'notes',
  label: 'Notes',
  href: (entry) => `/studio/content/notes/${entry._id.toString()}`,
  // Decorates each Note with its resolved technology labels in one batched
  // lookup (not per-entry) — CMS_PRODUCT_DESIGN.md §7: Notes should be
  // discoverable "by title, summary, technologies, reference ID."
  list: async () => {
    const [notes, technologies] = await Promise.all([
      noteRepository.list(),
      taxonomyRepository.findByKind('technology'),
    ]);
    const labelById = new Map(technologies.map((entry) => [entry._id.toString(), entry.label]));
    return notes.map((note) => ({
      ...note,
      technologyLabels: note.technologyIds
        .map((id) => labelById.get(id.toString()))
        .filter((label): label is string => Boolean(label)),
    }));
  },
  getTitle: (entry) => entry.title,
  getReferenceId: (entry) => entry.referenceId,
  getExtraSearchText: (entry) => [entry.summary, ...entry.technologyLabels],
});
