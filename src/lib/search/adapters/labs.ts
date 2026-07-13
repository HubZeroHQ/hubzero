import { labRepository } from '@/lib/db/repositories/lab';
import { createContentAdapter } from './content-adapter';

export const labsSearchAdapter = createContentAdapter({
  type: 'labs',
  label: 'Labs',
  href: '/cms/content/labs',
  list: () => labRepository.list(),
  getTitle: (entry) => entry.title,
  getReferenceId: (entry) => entry.referenceId,
});
