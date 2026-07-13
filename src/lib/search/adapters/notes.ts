import { noteRepository } from '@/lib/db/repositories/note';
import { createContentAdapter } from './content-adapter';

export const notesSearchAdapter = createContentAdapter({
  type: 'notes',
  label: 'Notes',
  href: '/studio/content/notes',
  list: () => noteRepository.list(),
  getTitle: (entry) => entry.title,
  getReferenceId: (entry) => entry.referenceId,
});
